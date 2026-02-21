import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { puzzlesAPI } from '../api/puzzles';
import { Puzzle } from '../api/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CellData {
  letter: string;
  isBlack: boolean;
  clueNumber?: number;
  isRevealed: boolean;
}

export interface GridDimensions {
  width: number;
  height: number;
}

export interface ActiveClueInfo {
  number: string;        // raw API key (used for clue lookup)
  visualNumber?: number; // position-based cell number shown on the grid
  text: string;
  direction: 'across' | 'down';
}

// ── Helper ─────────────────────────────────────────────────────────────────

const cellKey = (x: number, y: number) => `${x},${y}`;

// ── Hook ───────────────────────────────────────────────────────────────────

export const useGame = (puzzle: Puzzle) => {
  const [cells, setCells] = useState<Record<string, CellData>>({});
  const [dimensions, setDimensions] = useState<GridDimensions>({ width: 0, height: 0 });
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Flash signal refs — set to a cell key when a correct/wrong letter is typed
  const lastCorrectCell = useRef<string | null>(null);
  const lastWrongCell = useRef<string | null>(null);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const pausedAtRef = useRef<number | null>(null);

  // ── Timer ────────────────────────────────────────────────────────────────

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── B8: AppState — auto-pause timer when app goes to background ──────────

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // Pause
        if (!isPausedRef.current) {
          isPausedRef.current = true;
          pausedAtRef.current = Date.now();
        }
      } else if (nextState === 'active') {
        // Resume — shift startTimeRef forward by the paused duration
        if (isPausedRef.current && pausedAtRef.current !== null) {
          const pausedDuration = Date.now() - pausedAtRef.current;
          startTimeRef.current += pausedDuration;
          isPausedRef.current = false;
          pausedAtRef.current = null;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // ── Grid initialisation ──────────────────────────────────────────────────

  useEffect(() => {
    const newCells: Record<string, CellData> = {};
    let maxX = 0;
    let maxY = 0;

    // Collect all white cells from across clues
    Object.entries(puzzle.clues_across).forEach(([_num, clue]) => {
      for (let i = 0; i < clue.length; i++) {
        const x = clue.x + i;
        const y = clue.y;
        const key = cellKey(x, y);
        if (!newCells[key]) {
          newCells[key] = { letter: '', isBlack: false, isRevealed: false };
        }
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    });

    // Collect all white cells from down clues
    Object.entries(puzzle.clues_down).forEach(([_num, clue]) => {
      for (let i = 0; i < clue.length; i++) {
        const x = clue.x;
        const y = clue.y + i;
        const key = cellKey(x, y);
        if (!newCells[key]) {
          newCells[key] = { letter: '', isBlack: false, isRevealed: false };
        }
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    });

    // Fill remaining positions in the bounding box as black cells
    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= maxX; x++) {
        const key = cellKey(x, y);
        if (!newCells[key]) {
          newCells[key] = { letter: '', isBlack: true, isRevealed: false };
        }
      }
    }

    // ── Standard crossword numbering (ported from hiphop-crossword.jsx) ────
    // Assign clue numbers using position-based algorithm: iterate left-to-right,
    // top-to-bottom. A cell gets the next sequential number if it starts an
    // across word (no white cell to its left AND white cell to its right) OR
    // a down word (no white cell above AND white cell below).
    // This is API-key-independent and matches standard crossword numbering rules.
    let clueCounter = 1;
    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= maxX; x++) {
        const key = cellKey(x, y);
        const cell = newCells[key];
        if (!cell || cell.isBlack) continue;

        const leftCell  = newCells[cellKey(x - 1, y)];
        const rightCell = newCells[cellKey(x + 1, y)];
        const upCell    = newCells[cellKey(x, y - 1)];
        const downCell  = newCells[cellKey(x, y + 1)];

        // Starts an across word: nothing (or black) to the left AND white to the right
        const startsAcross =
          (x === 0 || !leftCell || leftCell.isBlack) &&
          rightCell && !rightCell.isBlack;

        // Starts a down word: nothing (or black) above AND white below
        const startsDown =
          (y === 0 || !upCell || upCell.isBlack) &&
          downCell && !downCell.isBlack;

        if (startsAcross || startsDown) {
          newCells[key].clueNumber = clueCounter++;
        }
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    setCells(newCells);
    setDimensions({ width: maxX + 1, height: maxY + 1 });

    // Auto-select the first cell of the first across clue
    const firstEntry = Object.entries(puzzle.clues_across).sort(
      ([a], [b]) => parseInt(a, 10) - parseInt(b, 10)
    )[0];
    if (firstEntry) {
      const [, firstClue] = firstEntry;
      setSelectedCell(cellKey(firstClue.x, firstClue.y));
      setDirection('across');
    }
  }, [puzzle]);

  // ── API mutations ────────────────────────────────────────────────────────

  const startAttemptMutation = useMutation({
    mutationFn: () => puzzlesAPI.startAttempt(puzzle.id),
    onSuccess: (data) => setAttemptId(data.id),
  });

  const submitAttemptMutation = useMutation({
    mutationFn: (data: { completed: boolean; time_taken: number; hints_used: number }) =>
      puzzlesAPI.submitAttempt(attemptId!, data),
  });

  useEffect(() => {
    startAttemptMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Clue lookup helpers ──────────────────────────────────────────────────

  /** Find the clue entry that owns cell (x, y) in the given direction. */
  const getClueForCell = useCallback(
    (x: number, y: number, dir: 'across' | 'down') => {
      const clues = dir === 'across' ? puzzle.clues_across : puzzle.clues_down;
      return Object.entries(clues).find(([_num, clue]) => {
        if (dir === 'across') {
          return clue.y === y && clue.x <= x && x < clue.x + clue.length;
        }
        return clue.x === x && clue.y <= y && y < clue.y + clue.length;
      }) ?? null;
    },
    [puzzle]
  );

  /** All cell keys that belong to the currently selected word. */
  const getSelectedWordCells = useCallback((): string[] => {
    if (!selectedCell) return [];
    const [x, y] = selectedCell.split(',').map(Number);
    const entry = getClueForCell(x, y, direction);
    if (!entry) return [];
    const [_num, clue] = entry;
    const keys: string[] = [];
    for (let i = 0; i < clue.length; i++) {
      keys.push(
        direction === 'across'
          ? cellKey(clue.x + i, clue.y)
          : cellKey(clue.x, clue.y + i)
      );
    }
    return keys;
  }, [selectedCell, direction, getClueForCell]);

  /** Info about the currently active clue (for the active-clue bar). */
  const getActiveClue = useCallback((): ActiveClueInfo | null => {
    if (!selectedCell) return null;
    const [x, y] = selectedCell.split(',').map(Number);
    const entry = getClueForCell(x, y, direction);
    if (!entry) return null;
    const [apiKey, clue] = entry;
    // Look up the visual cell number from the start cell of this clue word
    const startKey = cellKey((clue as any).x, (clue as any).y);
    const visualNumber = cells[startKey]?.clueNumber;
    return { number: apiKey, visualNumber, text: (clue as any).clue, direction };
  }, [selectedCell, direction, getClueForCell, cells]);

  // ── Interaction handlers ─────────────────────────────────────────────────

  /** Tap a cell: select it, or toggle direction if already selected. */
  const handleCellPress = useCallback(
    (key: string) => {
      if (cells[key]?.isBlack) return;

      if (key === selectedCell) {
        // Toggle direction
        const newDir = direction === 'across' ? 'down' : 'across';
        const [x, y] = key.split(',').map(Number);
        // Only switch if the cell actually belongs to a clue in the new direction
        if (getClueForCell(x, y, newDir)) {
          setDirection(newDir);
        }
        return;
      }

      setSelectedCell(key);

      // If the cell has no clue in the current direction, switch direction
      const [x, y] = key.split(',').map(Number);
      if (!getClueForCell(x, y, direction)) {
        setDirection(prev => (prev === 'across' ? 'down' : 'across'));
      }
    },
    [cells, selectedCell, direction, getClueForCell]
  );

  /** Input a letter into the selected cell and auto-advance. */
  const inputLetter = useCallback(
    (letter: string) => {
      if (!selectedCell) return;
      const [x, y] = selectedCell.split(',').map(Number);

      // ── V2-7/8: Check correctness before updating state ──────────────────
      const entry = getClueForCell(x, y, direction);
      if (entry) {
        const [_numCheck, clue] = entry;
        const posInWord = direction === 'across' ? x - clue.x : y - clue.y;
        const expectedLetter = clue.answer[posInWord]?.toUpperCase();
        const typedLetter = letter.toUpperCase();
        if (expectedLetter && typedLetter === expectedLetter) {
          lastCorrectCell.current = selectedCell;
          lastWrongCell.current = null;
        } else {
          lastWrongCell.current = selectedCell;
          lastCorrectCell.current = null;
        }
      }

      setCells(prev => ({
        ...prev,
        [selectedCell]: { ...prev[selectedCell], letter: letter.toUpperCase() },
      }));

      // Advance to next empty cell in the word (or next cell if all filled)
      if (!entry) return;
      const [_num2, clue] = entry;

      if (direction === 'across') {
        for (let i = x - clue.x + 1; i < clue.length; i++) {
          const nextKey = cellKey(clue.x + i, clue.y);
          if (!cells[nextKey]?.letter) {
            setSelectedCell(nextKey);
            return;
          }
        }
        // All filled — stay on last cell
        setSelectedCell(cellKey(clue.x + clue.length - 1, clue.y));
      } else {
        for (let i = y - clue.y + 1; i < clue.length; i++) {
          const nextKey = cellKey(clue.x, clue.y + i);
          if (!cells[nextKey]?.letter) {
            setSelectedCell(nextKey);
            return;
          }
        }
        setSelectedCell(cellKey(clue.x, clue.y + clue.length - 1));
      }
    },
    [selectedCell, direction, cells, getClueForCell]
  );

  /** Backspace: clear current cell or move back. */
  const deleteLetter = useCallback(() => {
    if (!selectedCell) return;
    const [x, y] = selectedCell.split(',').map(Number);
    const currentLetter = cells[selectedCell]?.letter;

    if (currentLetter) {
      setCells(prev => ({
        ...prev,
        [selectedCell]: { ...prev[selectedCell], letter: '' },
      }));
    } else {
      // Move to previous cell and clear it
      const entry = getClueForCell(x, y, direction);
      if (!entry) return;
      const [_num3, clue] = entry;

      if (direction === 'across' && x > clue.x) {
        const prevKey = cellKey(x - 1, y);
        setSelectedCell(prevKey);
        setCells(prev => ({
          ...prev,
          [prevKey]: { ...prev[prevKey], letter: '' },
        }));
      } else if (direction === 'down' && y > clue.y) {
        const prevKey = cellKey(x, y - 1);
        setSelectedCell(prevKey);
        setCells(prev => ({
          ...prev,
          [prevKey]: { ...prev[prevKey], letter: '' },
        }));
      }
    }
  }, [selectedCell, direction, cells, getClueForCell]);

  /** Reveal the first empty cell in the selected word. */
  const revealHint = useCallback(() => {
    if (!selectedCell) return;
    const [x, y] = selectedCell.split(',').map(Number);
    const entry = getClueForCell(x, y, direction);
    if (!entry) return;
    const [_num4, clue] = entry;

    for (let i = 0; i < clue.length; i++) {
      const cx = direction === 'across' ? clue.x + i : clue.x;
      const cy = direction === 'across' ? clue.y : clue.y + i;
      const key = cellKey(cx, cy);
      if (!cells[key]?.letter) {
        setCells(prev => ({
          ...prev,
          [key]: { ...prev[key], letter: clue.answer[i], isRevealed: true },
        }));
        setHintsUsed(prev => prev + 1);
        return;
      }
    }
  }, [selectedCell, direction, cells, getClueForCell]);

  /** B4: Reveal all letters in the currently selected word. */
  const revealWord = useCallback(() => {
    if (!selectedCell) return;
    const [x, y] = selectedCell.split(',').map(Number);
    const entry = getClueForCell(x, y, direction);
    if (!entry) return;
    const [_num5, clue] = entry;

    const updates: Record<string, CellData> = {};
    let hintsAdded = 0;
    for (let i = 0; i < clue.length; i++) {
      const cx = direction === 'across' ? clue.x + i : clue.x;
      const cy = direction === 'across' ? clue.y : clue.y + i;
      const key = cellKey(cx, cy);
      if (!cells[key]?.isRevealed) {
        updates[key] = { ...cells[key], letter: clue.answer[i], isRevealed: true };
        hintsAdded++;
      }
    }
    if (hintsAdded > 0) {
      setCells(prev => ({ ...prev, ...updates }));
      setHintsUsed(prev => prev + hintsAdded);
    }
  }, [selectedCell, direction, cells, getClueForCell]);

  /** B4: Reveal all letters in the entire puzzle. */
  const revealPuzzle = useCallback(() => {
    const allEntries = [
      ...Object.entries(puzzle.clues_across).map(([_k, c]) => ({ clue: c, dir: 'across' as const })),
      ...Object.entries(puzzle.clues_down).map(([_k, c]) => ({ clue: c, dir: 'down' as const })),
    ];
    const updates: Record<string, CellData> = {};
    let hintsAdded = 0;
    allEntries.forEach(({ clue, dir }) => {
      for (let i = 0; i < clue.length; i++) {
        const cx = dir === 'across' ? clue.x + i : clue.x;
        const cy = dir === 'across' ? clue.y : clue.y + i;
        const key = cellKey(cx, cy);
        if (!cells[key]?.isRevealed) {
          updates[key] = { ...cells[key], letter: clue.answer[i], isRevealed: true };
          hintsAdded++;
        }
      }
    });
    if (hintsAdded > 0) {
      setCells(prev => ({ ...prev, ...updates }));
      setHintsUsed(prev => prev + hintsAdded);
    }
  }, [cells, puzzle]);

  /** Jump to a clue from the clue list. */
  const selectClue = useCallback(
    (clueNum: string, dir: 'across' | 'down') => {
      const clues = dir === 'across' ? puzzle.clues_across : puzzle.clues_down;
      const clue = clues[clueNum];
      if (clue) {
        setSelectedCell(cellKey(clue.x, clue.y));
        setDirection(dir);
      }
    },
    [puzzle]
  );

  // ── Completion & submission ──────────────────────────────────────────────

  const checkComplete = useCallback((): boolean => {
    const allEntries = [
      ...Object.entries(puzzle.clues_across).map(([_k, c]) => ({ clue: c, dir: 'across' as const })),
      ...Object.entries(puzzle.clues_down).map(([_k, c]) => ({ clue: c, dir: 'down' as const })),
    ];
    return allEntries.every(({ clue, dir }) => {
      let word = '';
      for (let i = 0; i < clue.length; i++) {
        const key = dir === 'across'
          ? cellKey(clue.x + i, clue.y)
          : cellKey(clue.x, clue.y + i);
        word += cells[key]?.letter ?? '';
      }
      return word === clue.answer;
    });
  }, [cells, puzzle]);

  // ── B1: Auto-complete detection ──────────────────────────────────────────

  useEffect(() => {
    // Only check after cells are initialised and puzzle is not yet complete
    if (Object.keys(cells).length === 0 || isComplete) return;
    const allWhite = Object.values(cells).filter(c => !c.isBlack);
    // Only run check if all cells are filled (avoid expensive check on every keystroke)
    const allFilled = allWhite.every(c => c.letter !== '');
    if (allFilled && checkComplete()) {
      setIsComplete(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells]);

  const submitPuzzle = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const completed = checkComplete();
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    if (attemptId) {
      await submitAttemptMutation.mutateAsync({ completed, time_taken: timeTaken, hints_used: hintsUsed });
    }

    return { completed, timeTaken, hintsUsed };
  }, [checkComplete, attemptId, hintsUsed, submitAttemptMutation]);

  // ── Exposed API ──────────────────────────────────────────────────────────

  return {
    cells,
    dimensions,
    selectedCell,
    direction,
    hintsUsed,
    elapsedSeconds,
    isComplete,
    lastCorrectCell,
    lastWrongCell,
    handleCellPress,
    inputLetter,
    deleteLetter,
    revealHint,
    revealWord,
    revealPuzzle,
    checkComplete,
    submitPuzzle,
    getSelectedWordCells,
    getActiveClue,
    selectClue,
  };
};

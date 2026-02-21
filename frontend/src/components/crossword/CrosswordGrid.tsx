import React, { useMemo, useState, useCallback, useRef, useImperativeHandle } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { CrosswordCell } from './CrosswordCell';
import { CellData, GridDimensions } from '../../hooks/useGame';
import { colors } from '../../constants/theme';

interface CrosswordGridProps {
  cells: Record<string, CellData>;
  dimensions: GridDimensions;
  selectedCell: string | null;
  selectedWordCells: string[];
  onCellPress: (key: string) => void;
  /** Cell key that just received a correct letter — triggers flash animation */
  correctFlashCell?: string | null;
  /** Cell key that just received a wrong letter — triggers shake animation */
  wrongFlashCell?: string | null;
}

/** Imperative handle exposed via ref — allows parent to scroll to a cell */
export interface CrosswordGridHandle {
  scrollToCell: (key: string) => void;
}

// ── Zoom constants ─────────────────────────────────────────────────────────
const MIN_CELL_SIZE = 22;    // most zoomed-out (full grid visible on most screens)
const MAX_CELL_SIZE = 64;    // most zoomed-in
const DEFAULT_CELL_SIZE = 30; // initial "close-up" view — user can zoom out to see full grid
const ZOOM_STEP = 4;          // px change per button press
const GRID_PADDING = 12;

const CrosswordGridInner = React.forwardRef<CrosswordGridHandle, CrosswordGridProps>(
  ({ cells, dimensions, selectedCell, selectedWordCells, onCellPress, correctFlashCell, wrongFlashCell }, ref) => {
  // ── Zoom state (declared first — used in imperative handle below) ──────
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);

  // ── Scroll refs ────────────────────────────────────────────────────────
  const hScrollRef = useRef<ScrollView>(null);
  const vScrollRef = useRef<ScrollView>(null);

  // ── Imperative handle — scroll to a cell by key ────────────────────────
  useImperativeHandle(ref, () => ({
    scrollToCell: (key: string) => {
      const [x, y] = key.split(',').map(Number);
      const px = Math.max(0, x * cellSize - GRID_PADDING);
      const py = Math.max(0, y * cellSize - GRID_PADDING);
      hScrollRef.current?.scrollTo({ x: px, animated: true });
      vScrollRef.current?.scrollTo({ y: py, animated: true });
    },
  }), [cellSize]);

  const zoomIn = useCallback(() => {
    setCellSize(prev => Math.min(prev + ZOOM_STEP, MAX_CELL_SIZE));
  }, []);

  const zoomOut = useCallback(() => {
    setCellSize(prev => Math.max(prev - ZOOM_STEP, MIN_CELL_SIZE));
  }, []);

  // ── Row layout ─────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let y = 0; y < dimensions.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < dimensions.width; x++) {
        row.push(`${x},${y}`);
      }
      result.push(row);
    }
    return result;
  }, [dimensions]);

  const gridWidth  = cellSize * dimensions.width;
  const gridHeight = cellSize * dimensions.height;

  const canZoomIn  = cellSize < MAX_CELL_SIZE;
  const canZoomOut = cellSize > MIN_CELL_SIZE;

  return (
    <View style={styles.container}>
      {/* ── Scrollable grid ─────────────────────────────────────────────── */}
      <ScrollView
        ref={hScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.hScrollContent,
          { minWidth: gridWidth + GRID_PADDING * 2 },
        ]}
      >
        <ScrollView
          ref={vScrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.vScrollContent,
            { minHeight: gridHeight + GRID_PADDING * 2 },
          ]}
        >
          <View style={[styles.grid, { padding: GRID_PADDING }]}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((key) => {
                  const cell = cells[key];
                  if (!cell) return null;
                  return (
                    <CrosswordCell
                      key={key}
                      letter={cell.letter}
                      isBlack={cell.isBlack}
                      isSelected={key === selectedCell}
                      isInSelectedWord={selectedWordCells.includes(key)}
                      isRevealed={cell.isRevealed}
                      clueNumber={cell.clueNumber}
                      cellSize={cellSize}
                      onPress={() => onCellPress(key)}
                      isCorrectFlash={key === correctFlashCell}
                      isWrongFlash={key === wrongFlashCell}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* ── Zoom controls overlay (top-right corner) ────────────────────── */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomButton, !canZoomOut && styles.zoomButtonDisabled]}
          onPress={zoomOut}
          activeOpacity={0.7}
          disabled={!canZoomOut}
        >
          <Text style={[styles.zoomButtonText, !canZoomOut && styles.zoomButtonTextDisabled]}>
            −
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, !canZoomIn && styles.zoomButtonDisabled]}
          onPress={zoomIn}
          activeOpacity={0.7}
          disabled={!canZoomIn}
        >
          <Text style={[styles.zoomButtonText, !canZoomIn && styles.zoomButtonTextDisabled]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ── G1: Memoize CrosswordGrid — only re-render when relevant props change ──
export const CrosswordGrid = React.memo(CrosswordGridInner, (prev, next) => {
  return (
    prev.cells === next.cells &&
    prev.dimensions === next.dimensions &&
    prev.selectedCell === next.selectedCell &&
    prev.selectedWordCells === next.selectedWordCells &&
    prev.correctFlashCell === next.correctFlashCell &&
    prev.wrongFlashCell === next.wrongFlashCell
  );
}) as typeof CrosswordGridInner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  vScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  grid: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  // ── Zoom controls ──────────────────────────────────────────────────────
  zoomControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  zoomButton: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(14, 11, 6, 0.88)',
    borderWidth: 1,
    borderColor: colors.primaryAmber,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonDisabled: {
    borderColor: '#3a2810',
    backgroundColor: 'rgba(14, 11, 6, 0.5)',
  },
  zoomButtonText: {
    fontSize: 18,
    color: colors.primaryAmber,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  zoomButtonTextDisabled: {
    color: '#3a2810',
  },
});

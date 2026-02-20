import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { usePuzzle } from '../../hooks/usePuzzles';
import { useGame } from '../../hooks/useGame';
import { CrosswordGrid } from '../../components/crossword/CrosswordGrid';
import { ClueList } from '../../components/crossword/ClueList';
import { colors, typography, spacing, borders } from '../../constants/theme';

// ── Keyboard layout ────────────────────────────────────────────────────────

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['⌫', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '↔'],
];

// ── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ── Component ──────────────────────────────────────────────────────────────

export const GameScreen = ({ route, navigation }: any) => {
  const { puzzleId } = route.params;
  const { data: puzzle, isLoading } = usePuzzle(puzzleId);

  // ── Loading / error states ───────────────────────────────────────────────

  if (isLoading || !puzzle) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>LOADING PUZZLE...</Text>
      </View>
    );
  }

  return <GameBoard puzzle={puzzle} navigation={navigation} />;
};

// ── Inner board (rendered only once puzzle data is available) ──────────────

const GameBoard = ({ puzzle, navigation }: any) => {
  const {
    cells,
    dimensions,
    selectedCell,
    direction,
    hintsUsed,
    elapsedSeconds,
    handleCellPress,
    inputLetter,
    deleteLetter,
    revealHint,
    submitPuzzle,
    getSelectedWordCells,
    getActiveClue,
    selectClue,
  } = useGame(puzzle);

  const selectedWordCells = useMemo(
    () => getSelectedWordCells(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCell, direction, cells]
  );

  const activeClue = useMemo(
    () => getActiveClue(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCell, direction]
  );

  // ── Key press handler ────────────────────────────────────────────────────

  const handleKey = useCallback(
    (key: string) => {
      if (key === '⌫') {
        deleteLetter();
      } else if (key === '↔') {
        // Toggle direction by pressing the selected cell again
        if (selectedCell) handleCellPress(selectedCell);
      } else {
        inputLetter(key);
      }
    },
    [deleteLetter, inputLetter, selectedCell, handleCellPress]
  );

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    Alert.alert(
      'SUBMIT PUZZLE',
      'Are you sure you want to submit your answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            const result = await submitPuzzle();
            navigation.replace('GameComplete', {
              result,
              puzzleTitle: puzzle.title,
              basePoints: puzzle.base_points,
            });
          },
        },
      ]
    );
  }, [submitPuzzle, navigation, puzzle]);

  // ── Hint ─────────────────────────────────────────────────────────────────

  const handleHint = useCallback(() => {
    Alert.alert(
      'USE HINT',
      'Reveal the next empty letter in this word? Hints reduce your score.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reveal', onPress: revealHint },
      ]
    );
  }, [revealHint]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.puzzleTitle} numberOfLines={1}>
            {puzzle.title.replace(/ #[a-f0-9]{6}$/, '').toUpperCase()}
          </Text>
          <Text style={styles.difficultyLabel}>
            {puzzle.difficulty.toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>TIME</Text>
            <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
          </View>
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>HINTS</Text>
            <Text style={styles.hintValue}>{hintsUsed}</Text>
          </View>
        </View>
      </View>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <View style={styles.gridWrapper}>
        <CrosswordGrid
          cells={cells}
          dimensions={dimensions}
          selectedCell={selectedCell}
          selectedWordCells={selectedWordCells}
          onCellPress={handleCellPress}
        />
      </View>

      {/* ── Active clue bar ─────────────────────────────────────────────── */}
      <View style={styles.activeClueBar}>
        {activeClue ? (
          <>
            <Text style={styles.activeClueNum}>
              {activeClue.number} {activeClue.direction.toUpperCase()}
            </Text>
            <Text style={styles.activeClueText} numberOfLines={2}>
              {activeClue.text}
            </Text>
          </>
        ) : (
          <Text style={styles.activeClueText}>Select a cell to begin</Text>
        )}
      </View>

      {/* ── Clue list ───────────────────────────────────────────────────── */}
      <View style={styles.clueListWrapper}>
        <ClueList
          cluesAcross={puzzle.clues_across}
          cluesDown={puzzle.clues_down}
          activeClueNumber={activeClue?.number ?? null}
          activeDirection={activeClue?.direction ?? direction}
          onCluePress={selectClue}
        />
      </View>

      {/* ── Action row (hint + submit) ───────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.hintButton} onPress={handleHint} activeOpacity={0.8}>
          <Text style={styles.hintButtonText}>◈ HINT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>SUBMIT ▶</Text>
        </TouchableOpacity>
      </View>

      {/* ── Custom keyboard ─────────────────────────────────────────────── */}
      <View style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => {
              const isSpecial = key === '⌫' || key === '↔';
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.key, isSpecial && styles.specialKey]}
                  onPress={() => handleKey(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, isSpecial && styles.specialKeyText]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
  },
  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderBottomWidth: borders.medium,
    borderBottomColor: colors.primary,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.lg,
  },
  puzzleTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wide,
  },
  difficultyLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timerBox: {
    alignItems: 'center',
    minWidth: 52,
  },
  timerLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  timerValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  hintBox: {
    alignItems: 'center',
    minWidth: 36,
  },
  hintLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  hintValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    color: colors.primaryDark,
    letterSpacing: typography.letterSpacing.tight,
  },
  // ── Grid ──────────────────────────────────────────────────────────────────
  gridWrapper: {
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
    maxHeight: 300,
  },
  // ── Active clue bar ────────────────────────────────────────────────────────
  activeClueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
    minHeight: 44,
  },
  activeClueNum: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.normal,
    marginRight: spacing.md,
    minWidth: 52,
  },
  activeClueText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  // ── Clue list ──────────────────────────────────────────────────────────────
  clueListWrapper: {
    flex: 1,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
  },
  // ── Action row ─────────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: borders.thin,
    borderTopColor: colors.border,
  },
  hintButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.primaryDark,
    alignItems: 'center',
  },
  hintButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  submitButton: {
    flex: 2,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.textOnPrimary,
    fontWeight: typography.weights.black,
    letterSpacing: typography.letterSpacing.wide,
  },
  // ── Keyboard ───────────────────────────────────────────────────────────────
  keyboard: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderTopWidth: borders.medium,
    borderTopColor: colors.border,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    gap: 4,
  },
  key: {
    minWidth: 30,
    height: 38,
    backgroundColor: colors.keyBackground,
    borderWidth: borders.thin,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  specialKey: {
    minWidth: 38,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.primaryMuted,
  },
  keyText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primaryMid,
    letterSpacing: 0,
  },
  specialKeyText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
});

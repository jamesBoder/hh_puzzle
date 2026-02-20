import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { usePuzzle } from '../../hooks/usePuzzles';
import { useGame } from '../../hooks/useGame';
import { CrosswordGrid } from '../../components/crossword/CrosswordGrid';
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

// Combined height of hint panel (~44px) + keyboard (~130px) + action row (~48px)
const BOTTOM_FIXED_HEIGHT = 222;

// ── Component ──────────────────────────────────────────────────────────────

export const GameScreen = ({ route, navigation }: any) => {
  const { puzzleId } = route.params;
  const { data: puzzle, isLoading } = usePuzzle(puzzleId);

  // ── Hide bottom tab bar for the entire game session ──────────────────────
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation])
  );

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

  // ── Menu ──────────────────────────────────────────────────────────────────

  const handleMenu = useCallback(() => {
    Alert.alert(
      'MENU',
      undefined,
      [
        { text: 'Home', onPress: () => navigation.navigate('Home') },
        { text: 'Profile', onPress: () => navigation.navigate('Profile') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [navigation]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <View style={styles.scrollContent}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.puzzleTitle} numberOfLines={1}>
            {puzzle.title.replace(/ #[a-f0-9]{6}$/, '').toUpperCase()}
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

      </View>{/* end scrollContent */}

      {/* ── Fixed bottom: Hint panel + Keyboard + Action row ────────────── */}
      <View style={styles.bottomFixed}>

      {/* ── Hint panel (selected entry only) ────────────────────────────── */}
      <View style={styles.hintPanel}>
        {activeClue ? (
          <>
            <Text style={styles.hintPanelLabel}>
              {activeClue.number}{activeClue.direction === 'across' ? 'A' : 'D'}. {activeClue.direction.toUpperCase()}
            </Text>
            <Text style={styles.hintPanelText} numberOfLines={2}>
              {activeClue.text}
            </Text>
          </>
        ) : (
          <Text style={styles.hintPanelPlaceholder}>Select a cell to see its clue</Text>
        )}
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

      {/* ── Action row (menu + reveal + submit) ─────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenu} activeOpacity={0.8}>
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hintButton} onPress={handleHint} activeOpacity={0.8}>
          <Text style={styles.hintButtonText}>◈ REVEAL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>SUBMIT ▶</Text>
        </TouchableOpacity>
      </View>

      </View>{/* end bottomFixed */}
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
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
  },
  // ── Hint panel (single selected entry) ───────────────────────────────────
  hintPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
    minHeight: 44,
  },
  hintPanelLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.normal,
    marginRight: spacing.md,
    minWidth: 52,
  },
  hintPanelText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  hintPanelPlaceholder: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.primaryMuted,
    fontStyle: 'italic',
  },
  // ── Action row ─────────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    backgroundColor: colors.background,
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
  // ── Scroll content wrapper ─────────────────────────────────────────────────
  scrollContent: {
    flex: 1,
    paddingBottom: BOTTOM_FIXED_HEIGHT,
  },
  // ── Fixed bottom wrapper ───────────────────────────────────────────────────
  bottomFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: borders.medium,
    borderTopColor: colors.border,
  },
  // ── Menu button ────────────────────────────────────────────────────────────
  menuButton: {
    width: 44,
    paddingVertical: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.primaryMuted,
  },
});

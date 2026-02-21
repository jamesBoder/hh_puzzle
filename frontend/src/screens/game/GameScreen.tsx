import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { usePuzzle } from '../../hooks/usePuzzles';
import { useGame } from '../../hooks/useGame';
import { CrosswordGrid, CrosswordGridHandle } from '../../components/crossword/CrosswordGrid';
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

// Combined height of action section (~48px) + hint panel (~44px) + keyboard (~168px) + Track Info panel (~52px)
const BOTTOM_FIXED_HEIGHT = 312;

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
  const insets = useSafeAreaInsets();
  const gridRef = useRef<CrosswordGridHandle>(null);
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

  // ── Progress (Phase 3) ───────────────────────────────────────────────────
  const { totalCells, filledCells, progressPct } = useMemo(() => {
    const all = Object.values(cells).filter(c => !c.isBlack);
    const filled = all.filter(c => c.letter !== '');
    const pct = all.length > 0 ? filled.length / all.length : 0;
    return { totalCells: all.length, filledCells: filled.length, progressPct: pct };
  }, [cells]);

  // ── Vinyl rotation (Phase 5) ─────────────────────────────────────────────
  const vinylRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(vinylRotation, {
        toValue: 1,
        duration: 4000,          // one full rotation every 4 seconds
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vinylSpin = vinylRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ── Animated progress bar (Phase 6 / Track Info) ─────────────────────────
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 400,
      useNativeDriver: false, // width % animation requires JS driver
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressPct]);

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
        {
          text: 'Reveal',
          onPress: () => {
            revealHint();
            // Scroll grid to show the selected word after reveal
            if (selectedCell) {
              setTimeout(() => gridRef.current?.scrollToCell(selectedCell), 100);
            }
          },
        },
      ]
    );
  }, [revealHint, selectedCell]);

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
      <View style={[styles.scrollContent, { paddingBottom: BOTTOM_FIXED_HEIGHT + insets.bottom }]}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Spinning vinyl disc (Phase 5) */}
        <Animated.View style={[styles.vinyl, { transform: [{ rotate: vinylSpin }] }]}>
          <View style={styles.vinylGroove1} />
          <View style={styles.vinylGroove2} />
          <View style={styles.vinylCenter} />
        </Animated.View>

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
          ref={gridRef}
          cells={cells}
          dimensions={dimensions}
          selectedCell={selectedCell}
          selectedWordCells={selectedWordCells}
          onCellPress={handleCellPress}
        />
      </View>

      </View>{/* end scrollContent */}

      {/* ── Fixed bottom ────────────────────────────────────────────────── */}
      <View style={styles.bottomFixed}>

      {/* ── Action section (menu + reveal + submit) — TOP of fixed panel ── */}
      <View style={styles.actionSection}>
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

      {/* ── Hint panel (selected entry only) ────────────────────────────── */}
      <View style={styles.hintPanel}>
        {activeClue ? (
          <>
            <Text style={styles.hintPanelLabel}>
              {activeClue.visualNumber ?? activeClue.number}{activeClue.direction === 'across' ? 'A' : 'D'}. {activeClue.direction.toUpperCase()}
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

      {/* ── Track Info panel (replaces old action row) ──────────────────── */}
      <View style={[styles.trackInfoPanel, { paddingBottom: spacing.base + insets.bottom }]}>
        <Text style={styles.trackInfoLabel}>◆ TRACK INFO</Text>
        <View style={styles.trackInfoRow}>
          <Text style={styles.trackInfoFlavor}>BPM: 93</Text>
          <Text style={styles.trackInfoFlavor}>KEY: Dm</Text>
          <Text style={styles.trackInfoCounter}>{filledCells}/{totalCells}</Text>
        </View>
        <View style={styles.trackInfoBarTrack}>
          <Animated.View
            style={[
              styles.trackInfoBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryAmber,  // amber left-edge accent (Crate Digger)
    minHeight: 44,
  },
  hintPanelLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.primaryAmber,            // warm amber label (Crate Digger)
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
  // ── Action section (top of fixed panel) ───────────────────────────────────
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
  },
  hintButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.primaryAmberMuted,
    borderRadius: 4,
    alignItems: 'center',
  },
  hintButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryAmberMuted,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  submitButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderWidth: borders.medium,              // thicker border — distinguishes from REVEAL
    borderColor: colors.primaryAmber,         // amber — more prominent
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryAmber,               // amber text — no filled background
    fontWeight: typography.weights.black,
    letterSpacing: typography.letterSpacing.wide,
  },
  // ── Keyboard ───────────────────────────────────────────────────────────────
  keyboard: {
    backgroundColor: '#0e0b06',          // darkest warm bg — makes keys pop
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.base,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 7,                     // increased row gap (was 4)
    gap: 6,                              // increased key gap (was 4)
  },
  key: {
    minWidth: 32,                        // wider (was 30)
    height: 46,                          // taller (was 38)
    backgroundColor: '#2e2a1a',          // warm dark key face
    borderWidth: 1,
    borderColor: '#5a4828',              // warm amber-tinted border
    borderBottomWidth: 3,                // thick bottom edge — 3D raised effect
    borderBottomColor: '#0a0704',        // very dark bottom — depth shadow
    borderRadius: 5,                     // rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    // Android elevation
    elevation: 8,
  },
  specialKey: {
    minWidth: 40,                        // wider special keys (was 38)
    backgroundColor: '#1e1a0e',
    borderColor: colors.primaryAmber,
    borderBottomColor: '#0a0704',
  },
  keyText: {
    fontSize: typography.sizes.lg,       // larger text (was base/12 → lg/14)
    fontWeight: typography.weights.bold,
    color: colors.primaryMid,
    letterSpacing: 0,
  },
  specialKeyText: {
    fontSize: typography.sizes.base,     // slightly larger (was md/11 → base/12)
    color: colors.primaryAmber,          // amber for special keys
  },
  // ── Scroll content wrapper ─────────────────────────────────────────────────
  scrollContent: {
    flex: 1,
    // paddingBottom applied dynamically: BOTTOM_FIXED_HEIGHT + insets.bottom
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
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.primaryMuted,
  },
  // ── Track Info panel (Phase 6 — replaces old action row) ──────────────────
  trackInfoPanel: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.base,
    backgroundColor: '#110e08',
    borderTopWidth: borders.thin,
    borderTopColor: '#2a1f0e',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  trackInfoLabel: {
    fontSize: typography.sizes.xxs,
    color: '#3a2810',
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
  },
  trackInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackInfoFlavor: {
    fontSize: typography.sizes.md,
    color: '#4a3520',
    fontFamily: 'monospace' as any,
  },
  trackInfoCounter: {
    fontSize: typography.sizes.md,
    color: colors.primaryAmber,
    fontWeight: typography.weights.bold,
    fontFamily: 'monospace' as any,
  },
  trackInfoBarTrack: {
    height: 3,
    backgroundColor: '#1e1608',
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  trackInfoBarFill: {
    height: '100%' as any,
    backgroundColor: colors.primaryAmber,
    borderRadius: 2,
  },
  // ── Vinyl disc (Phase 5) ───────────────────────────────────────────────────
  vinyl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0e0b06',
    borderWidth: 2,
    borderColor: colors.primaryAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  vinylGroove1: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#2a1f0e',
  },
  vinylGroove2: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#2a1f0e',
  },
  vinylCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryAmber,
  },
});

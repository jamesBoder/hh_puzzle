import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
    isComplete,
    lastCorrectCell,
    lastWrongCell,
    handleCellPress,
    inputLetter,
    deleteLetter,
    revealHint,
    revealWord,
    revealPuzzle,
    submitPuzzle,
    getSelectedWordCells,
    getActiveClue,
  } = useGame(puzzle);

  // ── Flash cell state (V2-7/8) ────────────────────────────────────────────
  const [correctFlashCell, setCorrectFlashCell] = useState<string | null>(null);
  const [wrongFlashCell, setWrongFlashCell] = useState<string | null>(null);

  // ── Vinyl fast-spin state (V2-2) ─────────────────────────────────────────
  const [vinylFast, setVinylFast] = useState(false);


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

  // ── Vinyl rotation (V2-2: fast-spin on correct letter) ───────────────────
  const vinylRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and restart with new duration when vinylFast changes
    vinylRotation.setValue(0);
    const spin = Animated.loop(
      Animated.timing(vinylRotation, {
        toValue: 1,
        duration: vinylFast ? 450 : 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinylFast]);

  // ── B1: Auto-complete — show celebration when puzzle is solved ────────────
  useEffect(() => {
    if (!isComplete) return;
    Alert.alert(
      '◆ PUZZLE COMPLETE ◆',
      'You solved it! Submit your score?',
      [
        { text: 'Keep Reviewing', style: 'cancel' },
        {
          text: 'Submit ▶',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

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

  // ── Key press handler (B7: haptics + V2-2/7/8: flash triggers) ──────────

  const handleKey = useCallback(
    (key: string) => {
      // B7: Tactile feedback on every key press
      Vibration.vibrate(10);

      if (key === '⌫') {
        deleteLetter();
      } else if (key === '↔') {
        // Toggle direction by pressing the selected cell again
        if (selectedCell) handleCellPress(selectedCell);
      } else {
        inputLetter(key);

        // V2-2/7/8: Read correctness refs synchronously after inputLetter
        // (refs are set synchronously inside inputLetter before setCells)
        if (lastCorrectCell.current) {
          const cell = lastCorrectCell.current;
          setCorrectFlashCell(cell);
          // Trigger vinyl fast-spin for 800ms
          setVinylFast(true);
          setTimeout(() => {
            setVinylFast(false);
            setCorrectFlashCell(null);
          }, 800);
        } else if (lastWrongCell.current) {
          const cell = lastWrongCell.current;
          setWrongFlashCell(cell);
          setTimeout(() => setWrongFlashCell(null), 400);
        }
      }
    },
    [deleteLetter, inputLetter, selectedCell, handleCellPress, lastCorrectCell, lastWrongCell]
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

  // ── Hint / Reveal (B4: Reveal Letter / Word / Puzzle) ────────────────────

  const handleHint = useCallback(() => {
    Alert.alert(
      '◈ REVEAL',
      'Choose what to reveal. Each revealed letter reduces your score.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reveal Letter',
          onPress: () => {
            revealHint();
            if (selectedCell) {
              setTimeout(() => gridRef.current?.scrollToCell(selectedCell), 100);
            }
          },
        },
        {
          text: 'Reveal Word',
          onPress: () => {
            revealWord();
            if (selectedCell) {
              setTimeout(() => gridRef.current?.scrollToCell(selectedCell), 100);
            }
          },
        },
        {
          text: 'Reveal Puzzle',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'REVEAL ENTIRE PUZZLE?',
              'This will reveal all answers and heavily penalise your score.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reveal All', style: 'destructive', onPress: revealPuzzle },
              ]
            );
          },
        },
      ]
    );
  }, [revealHint, revealWord, revealPuzzle, selectedCell]);

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
        {/* V2-1: Spinning vinyl disc — 5 groove rings + "HH" center label */}
        <Animated.View style={[styles.vinyl, { transform: [{ rotate: vinylSpin }] }]}>
          <View style={styles.vinylGroove1} />
          <View style={styles.vinylGroove2} />
          <View style={styles.vinylGroove3} />
          <View style={styles.vinylGroove4} />
          <View style={styles.vinylGroove5} />
          <View style={styles.vinylCenter}>
            <Text style={styles.vinylCenterText}>HH</Text>
          </View>
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
          correctFlashCell={correctFlashCell}
          wrongFlashCell={wrongFlashCell}
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

      {/* ── Track Info panel (C3: dynamic metadata, V2-9: gradient bar, V2-14: waveform) */}
      <View style={[styles.trackInfoPanel, { paddingBottom: spacing.base + insets.bottom }]}>
        <Text style={styles.trackInfoLabel}>◆ TRACK INFO</Text>
        <View style={styles.trackInfoRow}>
          {/* C3: Dynamic region/decade from puzzle metadata */}
          <Text style={styles.trackInfoFlavor}>
            {`REGION: ${puzzle.region ? puzzle.region.toUpperCase() : '—'}`}
          </Text>
          <Text style={styles.trackInfoFlavor}>
            {`ERA: ${puzzle.decade || '—'}`}
          </Text>
          <Text style={styles.trackInfoCounter}>{filledCells}/{totalCells}</Text>
        </View>

        {/* V2-9: Gradient progress bar with glow */}
        <View style={styles.trackInfoBarTrack}>
          <Animated.View
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#7a5010', '#c8832a', '#e8a848', '#c8832a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>

        {/* V2-14: Decorative waveform bars */}
        <View style={styles.waveformRow}>
          {[3,6,9,13,8,11,15,10,7,12,9,6,4,8,11,13,9,6,3].map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: h,
                  backgroundColor: i / 19 <= progressPct
                    ? colors.primaryAmber
                    : '#2a1f0e',
                },
              ]}
            />
          ))}
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
  // ── Vinyl disc (V2-1: 5 groove rings + HH center label) ───────────────────
  vinyl: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0e0b06',
    borderWidth: 2,
    borderColor: colors.primaryAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
    // Multi-layer shadow for depth
    shadowColor: colors.primaryAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  vinylGroove1: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  vinylGroove2: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  vinylGroove3: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  vinylGroove4: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  vinylGroove5: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  vinylCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryAmber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenterText: {
    fontSize: 4,
    fontWeight: '900' as const,
    color: '#0e0b06',
    letterSpacing: 0,
  },
  // ── Grid corner ornaments (V2-10) ──────────────────────────────────────────
  cornerOrnament: {
    position: 'absolute',
    width: 12,
    height: 12,
    zIndex: 5,
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#c8832a55',
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#c8832a55',
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#c8832a55',
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#c8832a55',
  },
  // ── Waveform bars (V2-14) ──────────────────────────────────────────────────
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginTop: spacing.sm,
    height: 16,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1,
  },
});

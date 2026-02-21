import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../constants/theme';

// ── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const calcPointsEarned = (
  basePoints: number,
  completed: boolean,
  timeTaken: number,
  hintsUsed: number
): number => {
  if (!completed) return 0;
  // Time bonus: full points under 5 min, scaling down to 50% at 30 min
  const timeFactor = Math.max(0.5, 1 - (timeTaken - 300) / 1500);
  // Hint penalty: -5% per hint, max -50%
  const hintPenalty = Math.max(0.5, 1 - hintsUsed * 0.05);
  return Math.round(basePoints * timeFactor * hintPenalty);
};

// ── Component ──────────────────────────────────────────────────────────────

export const GameCompleteScreen = ({ route, navigation }: any) => {
  const { result, puzzleTitle, basePoints } = route.params;
  const { completed, timeTaken, hintsUsed } = result;

  const pointsEarned = calcPointsEarned(basePoints, completed, timeTaken, hintsUsed);

  // ── Spinning vinyl decoration ─────────────────────────────────────────────
  const vinylRotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(vinylRotation, {
        toValue: 1,
        duration: 6000,
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

  const handlePlayAgain = () => {
    navigation.pop(2); // back to PuzzleDetail
  };

  const handleGoHome = () => {
    navigation.navigate('HomeMain');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      {/* ── Amber top divider ────────────────────────────────────────────── */}
      <View style={styles.topDivider} />

      {/* ── Spinning vinyl decoration ────────────────────────────────────── */}
      <Animated.View style={[styles.vinyl, { transform: [{ rotate: vinylSpin }] }]}>
        <View style={styles.vinylGroove1} />
        <View style={styles.vinylGroove2} />
        <View style={styles.vinylGroove3} />
        <View style={styles.vinylCenter}>
          <Text style={styles.vinylCenterText}>{completed ? '◆' : '◇'}</Text>
        </View>
      </Animated.View>

      {/* ── Result badge ────────────────────────────────────────────────── */}
      <View style={styles.resultBadge}>
        <Text style={styles.resultLabel}>
          {completed ? '◆ PUZZLE COMPLETE ◆' : '◇ INCOMPLETE ◇'}
        </Text>
      </View>

      {/* ── Puzzle title ────────────────────────────────────────────────── */}
      <Text style={styles.puzzleTitle} numberOfLines={2}>
        {puzzleTitle.replace(/ #[a-f0-9]{6}$/, '').toUpperCase()}
      </Text>

      {/* ── Diamond divider ──────────────────────────────────────────────── */}
      <View style={styles.diamondDivider}>
        <View style={styles.diamondLine} />
        <View style={styles.diamondCenter} />
        <View style={styles.diamondLine} />
      </View>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatTime(timeTaken)}</Text>
          <Text style={styles.statLabel}>TIME</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxCenter]}>
          <Text style={[styles.statValue, styles.pointsValue]}>
            {pointsEarned}
          </Text>
          <Text style={styles.statLabel}>POINTS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{hintsUsed}</Text>
          <Text style={styles.statLabel}>HINTS</Text>
        </View>
      </View>

      {/* ── Diamond divider ──────────────────────────────────────────────── */}
      <View style={styles.diamondDivider}>
        <View style={styles.diamondLine} />
        <View style={styles.diamondCenter} />
        <View style={styles.diamondLine} />
      </View>

      {/* ── Score breakdown ─────────────────────────────────────────────── */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>BASE POINTS</Text>
          <Text style={styles.breakdownValue}>{basePoints}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>TIME BONUS</Text>
          <Text style={styles.breakdownValue}>
            {timeTaken <= 300 ? '+MAX' : timeTaken >= 1800 ? '-50%' : `${Math.round((1 - (timeTaken - 300) / 1500) * 100)}%`}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>HINT PENALTY</Text>
          <Text style={[styles.breakdownValue, hintsUsed > 0 && styles.penaltyValue]}>
            {hintsUsed === 0 ? 'NONE' : `-${hintsUsed * 5}%`}
          </Text>
        </View>
        <View style={[styles.breakdownRow, styles.breakdownTotal]}>
          <Text style={styles.breakdownTotalLabel}>TOTAL EARNED</Text>
          <Text style={styles.breakdownTotalValue}>{pointsEarned} PTS</Text>
        </View>
      </View>

      {/* ── Message ─────────────────────────────────────────────────────── */}
      {completed ? (
        <Text style={styles.message}>
          {hintsUsed === 0
            ? '◆ FLAWLESS — NO HINTS USED ◆'
            : hintsUsed <= 2
            ? '◆ SOLID WORK ◆'
            : '◆ KEEP PRACTISING ◆'}
        </Text>
      ) : (
        <Text style={styles.messageIncomplete}>
          ◇ NOT ALL ANSWERS CORRECT ◇{'\n'}REVIEW YOUR ANSWERS AND TRY AGAIN
        </Text>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoHome}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>◀ BACK TO PUZZLES</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handlePlayAgain}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>TRY AGAIN ↺</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom amber divider ─────────────────────────────────────────── */}
      <View style={styles.bottomAmberDivider} />

      <View style={{ height: spacing.hero }} />
    </ScrollView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  // ── Dividers ──────────────────────────────────────────────────────────────
  topDivider: {
    width: '100%',
    height: borders.medium,
    backgroundColor: colors.primaryAmber,
    marginBottom: spacing.xxl,
  },
  bottomAmberDivider: {
    width: '100%',
    height: borders.thin,
    backgroundColor: colors.primaryAmberDark,
    marginTop: spacing.xxl,
    opacity: 0.5,
  },
  // ── Diamond divider ───────────────────────────────────────────────────────
  diamondDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    marginVertical: spacing.xxl,
  },
  diamondLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primaryAmberDark,
    opacity: 0.5,
  },
  diamondCenter: {
    width: 8,
    height: 8,
    backgroundColor: colors.primaryAmber,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
  // ── Vinyl decoration ──────────────────────────────────────────────────────
  vinyl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0e0b06',
    borderWidth: 2,
    borderColor: colors.primaryAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    shadowColor: colors.primaryAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  vinylGroove1: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  vinylGroove2: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  vinylGroove3: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  vinylCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryAmber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenterText: {
    fontSize: 6,
    color: '#0e0b06',
    fontWeight: '900' as const,
  },
  // ── Result badge ──────────────────────────────────────────────────────────
  resultBadge: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weights.bold,
  },
  // ── Puzzle title ──────────────────────────────────────────────────────────
  puzzleTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.black,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
  },
  // ── Stats grid ────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.xxl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  statBoxCenter: {
    borderLeftWidth: borders.thin,
    borderRightWidth: borders.thin,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.black,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.tight,
  },
  pointsValue: {
    fontSize: typography.sizes.h1,
    color: colors.primaryAmber,
  },
  statLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: spacing.xs,
  },
  // ── Score breakdown ───────────────────────────────────────────────────────
  breakdown: {
    width: '100%',
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.xxl,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
  },
  breakdownLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wide,
  },
  breakdownValue: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.normal,
  },
  penaltyValue: {
    color: colors.error,
  },
  breakdownTotal: {
    borderBottomWidth: 0,
    backgroundColor: colors.surfaceAlt,
  },
  breakdownTotalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.wide,
    fontWeight: typography.weights.bold,
  },
  breakdownTotalValue: {
    fontSize: typography.sizes.lg,
    color: colors.primaryAmber,
    fontWeight: typography.weights.black,
    letterSpacing: typography.letterSpacing.normal,
  },
  // ── Message ───────────────────────────────────────────────────────────────
  message: {
    fontSize: typography.sizes.xs,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  messageIncomplete: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  // ── Actions ───────────────────────────────────────────────────────────────
  actions: {
    width: '100%',
    gap: spacing.lg,
  },
  primaryButton: {
    borderWidth: borders.medium,
    borderColor: colors.primaryAmber,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.wider,
  },
  secondaryButton: {
    borderWidth: borders.thin,
    borderColor: colors.primaryAmberMuted,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryAmberMuted,
    letterSpacing: typography.letterSpacing.wider,
  },
});

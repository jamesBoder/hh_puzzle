import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePuzzle } from '../../hooks/usePuzzles';
import { colors, typography, spacing, borders } from '../../constants/theme';

export const PuzzleDetailScreen = ({ route, navigation }: any) => {
  const { puzzleId, isDaily } = route.params;
  const { data: puzzle, isLoading } = usePuzzle(puzzleId);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!puzzle) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Puzzle not found</Text>
      </View>
    );
  }

  const handleStartPuzzle = () => {
    navigation.navigate('Game', { puzzleId: puzzle.id });
  };

  const cluesAcrossCount = Object.keys(puzzle.clues_across || {}).length;
  const cluesDownCount = Object.keys(puzzle.clues_down || {}).length;
  const totalClues = cluesAcrossCount + cluesDownCount;
  const cleanTitle = puzzle.title.replace(/ #[a-f0-9]{6}$/, '').toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {isDaily && (
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyBadgeText}>◆ DAILY CHALLENGE ◆</Text>
            </View>
          )}
          <Text style={styles.title} numberOfLines={2}>{cleanTitle}</Text>
          <Text style={styles.catalogNumber}>
            {`VOL. ${String(puzzle.id).padStart(3, '0')}`}
          </Text>
        </View>

        {/* ── Groove divider ───────────────────────────────────────────────── */}
        <View style={styles.grooveDivider} />

        {/* ── Description ─────────────────────────────────────────────────── */}
        {puzzle.description ? (
          <View style={styles.section}>
            <Text style={styles.description}>{puzzle.description}</Text>
          </View>
        ) : null}

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalClues}</Text>
            <Text style={styles.statLabel}>CLUES</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMid]}>
            <Text style={styles.statValue}>{cluesAcrossCount}</Text>
            <Text style={styles.statLabel}>ACROSS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{cluesDownCount}</Text>
            <Text style={styles.statLabel}>DOWN</Text>
          </View>
        </View>

        {/* ── Groove divider ───────────────────────────────────────────────── */}
        <View style={styles.grooveDivider} />

        {/* ── Puzzle Info ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>◆ TRACK INFO</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>REGION</Text>
            <Text style={styles.infoValue}>{(puzzle.region || 'VARIOUS').toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ERA</Text>
            <Text style={styles.infoValue}>{puzzle.decade || '—'}</Text>
          </View>
          {puzzle.city ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CITY</Text>
              <Text style={styles.infoValue}>{puzzle.city.toUpperCase()}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EST. TIME</Text>
            <Text style={styles.infoValue}>~{puzzle.estimated_time} MIN</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>BASE PTS</Text>
            <Text style={[styles.infoValue, styles.infoValueAccent]}>{puzzle.base_points} PTS</Text>
          </View>
        </View>

        {/* ── Groove divider ───────────────────────────────────────────────── */}
        <View style={styles.grooveDivider} />

        {/* ── Tips ────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>◆ TIPS</Text>
          {[
            'Start with the clues you know for sure',
            'Use hints wisely — they reduce your final score',
            'Complete faster for bonus time points',
          ].map((tip, i) => (
            <View key={i} style={styles.tipItem}>
              <Text style={styles.tipBullet}>◈</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Start Button (outlined amber — matches GameScreen style) ─────── */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPuzzle}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>▶ START PUZZLE</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.hero }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.xxl,
  },
  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    borderLeftWidth: borders.thick,
    borderLeftColor: colors.primaryAmber,
  },
  dailyBadge: {
    borderWidth: borders.thin,
    borderColor: colors.primaryAmber,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  dailyBadgeText: {
    color: colors.primaryAmber,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.black,
    color: colors.primaryAmber,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  catalogNumber: {
    fontSize: typography.sizes.xs,
    color: colors.primaryAmberMuted,
    letterSpacing: typography.letterSpacing.wider,
  },
  // ── Groove divider ────────────────────────────────────────────────────────
  grooveDivider: {
    height: borders.thin,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xxxl,
    marginVertical: spacing.xs,
  },
  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  description: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // ── Stats Grid ────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: spacing.xxxl,
    marginVertical: spacing.lg,
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  statBoxMid: {
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
  statLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: spacing.xs,
  },
  // ── Section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.primaryAmber,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xxl,
  },
  // ── Info rows ─────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wide,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  infoValueAccent: {
    color: colors.primaryAmber,
    fontWeight: typography.weights.black,
  },
  // ── Tips ──────────────────────────────────────────────────────────────────
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  tipBullet: {
    color: colors.primaryAmber,
    fontSize: typography.sizes.base,
    marginRight: spacing.md,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // ── Start Button (outlined amber) ─────────────────────────────────────────
  startButton: {
    marginHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
    borderWidth: borders.medium,
    borderColor: colors.primaryAmber,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.primaryAmber,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.black,
    letterSpacing: typography.letterSpacing.wider,
  },
});

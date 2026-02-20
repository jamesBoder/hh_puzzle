/* eslint-disable react-native/no-inline-styles */
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
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

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

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isDaily && (
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>🔥 DAILY CHALLENGE</Text>
          </View>
        )}
        
        <Text style={styles.title}>{puzzle.title}</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.description}>{puzzle.description}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalClues}</Text>
          <Text style={styles.statLabel}>Total Clues</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{cluesAcrossCount}</Text>
          <Text style={styles.statLabel}>Across</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{cluesDownCount}</Text>
          <Text style={styles.statLabel}>Down</Text>
        </View>
      </View>

      {/* Puzzle Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Puzzle Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Region:</Text>
          <Text style={styles.infoValue}>{puzzle.region || 'Various'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Era:</Text>
          <Text style={styles.infoValue}>{puzzle.decade || 'Various'}</Text>
        </View>
        
        {puzzle.city && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City:</Text>
            <Text style={styles.infoValue}>{puzzle.city}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estimated Time:</Text>
          <Text style={styles.infoValue}>~{puzzle.estimated_time} minutes</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Base Points:</Text>
          <Text style={styles.infoValue}>{puzzle.base_points} pts</Text>
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Start with the clues you know for sure
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Use hints wisely - they reduce your final score
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Complete faster for bonus points
          </Text>
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartPuzzle}
      >
        <Text style={styles.startButtonText}>Start Puzzle</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.xxl,
  },
  header: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  dailyBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  dailyBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    padding: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  description: {
    fontSize: typography.sizes.xxl,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xxl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: typography.sizes.lg,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tipBullet: {
    color: colors.primary,
    fontSize: typography.sizes.xxl,
    marginRight: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xxxl,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
});

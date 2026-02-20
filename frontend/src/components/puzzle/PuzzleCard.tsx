import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Puzzle } from '../../api/types';
import { colors, typography, spacing, borders } from '../../constants/theme';

interface PuzzleCardProps {
  puzzle: Puzzle;
  onPress: () => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({ puzzle, onPress }) => {
  // Strip the hash suffix from title for cleaner display
  const cleanTitle = puzzle.title.replace(/ #[a-f0-9]{6}$/, '');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top bar — catalog number style */}
      <View style={styles.topBar}>
        <Text style={styles.catalogNumber}>
          {`VOL. ${String(puzzle.id).padStart(3, '0')}`}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {cleanTitle.toUpperCase()}
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Metadata row */}
      <View style={styles.metadata}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>REGION</Text>
          <Text style={styles.metaValue}>{(puzzle.region || 'VARIOUS').toUpperCase()}</Text>
        </View>
        <View style={styles.metaSep} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>ERA</Text>
          <Text style={styles.metaValue}>{puzzle.decade || '—'}</Text>
        </View>
        <View style={styles.metaSep} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>PTS</Text>
          <Text style={styles.metaValue}>{puzzle.base_points}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.time}>{puzzle.estimated_time} MIN</Text>
        <Text style={styles.playLabel}>▶ PLAY</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    borderWidth: borders.thin,
    borderColor: colors.border,
    borderLeftWidth: borders.thick,
    borderLeftColor: colors.primary,
    padding: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  catalogNumber: {
    fontSize: typography.sizes.xs,
    color: colors.primaryFaint,
    letterSpacing: typography.letterSpacing.wide,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: 20,
    marginBottom: spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.base,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryFaint,
    letterSpacing: typography.letterSpacing.normal,
    marginBottom: spacing.xxs,
  },
  metaValue: {
    fontSize: typography.sizes.base,
    color: colors.primaryMid,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  metaSep: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.base,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.primaryFaint,
    letterSpacing: typography.letterSpacing.wide,
  },
  playLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.black,
    letterSpacing: typography.letterSpacing.normal,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Puzzle } from '../../api/types';

interface PuzzleCardProps {
  puzzle: Puzzle;
  onPress: () => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({ puzzle, onPress }) => {
  const getDifficultyLabel = () => {
    switch (puzzle.difficulty) {
      case 'beginner':   return 'EASY';
      case 'intermediate': return 'MED';
      case 'expert':     return 'HARD';
      default:           return '—';
    }
  };

  const getDifficultyColor = () => {
    switch (puzzle.difficulty) {
      case 'beginner':     return '#4a7c4e';
      case 'intermediate': return '#8a6a1a';
      case 'expert':       return '#7c2a2a';
      default:             return '#444';
    }
  };

  // Strip the hash suffix from title for cleaner display
  const cleanTitle = puzzle.title.replace(/ #[a-f0-9]{6}$/, '');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top bar — catalog number style */}
      <View style={styles.topBar}>
        <Text style={styles.catalogNumber}>
          {`VOL. ${String(puzzle.id).padStart(3, '0')}`}
        </Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
          <Text style={styles.difficultyText}>{getDifficultyLabel()}</Text>
        </View>
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
    backgroundColor: '#1a1600',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3020',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    padding: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catalogNumber: {
    fontSize: 9,
    color: '#6a5a20',
    letterSpacing: 3,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#5a4a10',
  },
  difficultyText: {
    color: '#E8D5A3',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    lineHeight: 20,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3020',
    marginBottom: 10,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: '#6a5a20',
    letterSpacing: 2,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    color: '#C8A951',
    fontWeight: '700',
    letterSpacing: 1,
  },
  metaSep: {
    width: 1,
    height: 28,
    backgroundColor: '#3a3020',
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 9,
    color: '#6a5a20',
    letterSpacing: 3,
  },
  playLabel: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '900',
    letterSpacing: 2,
  },
});

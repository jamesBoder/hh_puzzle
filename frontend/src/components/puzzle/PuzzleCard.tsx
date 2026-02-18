import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Puzzle } from '../../api/types';

interface PuzzleCardProps {
  puzzle: Puzzle;
  onPress: () => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({ puzzle, onPress }) => {
  const getDifficultyColor = () => {
    switch (puzzle.difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'expert':
        return '#F44336';
      default:
        return '#999';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {puzzle.title}
        </Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor() },
          ]}
        >
          <Text style={styles.difficultyText}>
            {puzzle.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {puzzle.description}
      </Text>

      <View style={styles.metadata}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Region:</Text>
          <Text style={styles.metaValue}>{puzzle.region || 'Various'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Era:</Text>
          <Text style={styles.metaValue}>{puzzle.decade || 'Various'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Points:</Text>
          <Text style={styles.metaValue}>{puzzle.base_points}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.time}>⏱️ ~{puzzle.estimated_time} min</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#999',
  },
  metaValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
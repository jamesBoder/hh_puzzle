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
import { usePuzzle } from '../../hooks/usePuzzles';

export const PuzzleDetailScreen = ({ route, navigation }: any) => {
  const { puzzleId, isDaily } = route.params;
  const { data: puzzle, isLoading } = usePuzzle(puzzleId);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD700" />
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

  const handleStartPuzzle = () => {
    navigation.navigate('Game', { puzzleId: puzzle.id });
  };

  const cluesAcrossCount = Object.keys(puzzle.clues_across || {}).length;
  const cluesDownCount = Object.keys(puzzle.clues_down || {}).length;
  const totalClues = cluesAcrossCount + cluesDownCount;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isDaily && (
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>🔥 DAILY CHALLENGE</Text>
          </View>
        )}
        
        <Text style={styles.title}>{puzzle.title}</Text>
        
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  dailyBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  dailyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: '#FFD700',
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
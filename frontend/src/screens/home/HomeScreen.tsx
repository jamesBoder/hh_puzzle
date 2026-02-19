import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { usePuzzles, useDailyChallenge } from '../../hooks/usePuzzles';
import { PuzzleCard } from '../../components/puzzle/PuzzleCard';
import { useAuth } from '../../hooks/useAuth';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>();
  
  const { data: puzzles, isLoading, refetch } = usePuzzles({
    difficulty: selectedDifficulty,
  });
  
  const { data: dailyChallenge } = useDailyChallenge();

  const difficulties = ['All', 'beginner', 'intermediate', 'expert'];

  const handleDifficultyFilter = (difficulty: string) => {
    setSelectedDifficulty(difficulty === 'All' ? undefined : difficulty);
  };

  const handlePuzzlePress = (puzzleId: number) => {
    navigation.navigate('PuzzleDetail', { puzzleId });
  };

  const handleDailyChallengePress = () => {
    if (dailyChallenge) {
      navigation.navigate('PuzzleDetail', { 
        puzzleId: dailyChallenge.id,
        isDaily: true 
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {user ? (
            <>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>{user.username}!</Text>
            </>
          ) : (
            <>
              <Text style={styles.greeting}>Hip-Hop</Text>
              <Text style={styles.username}>Crossword Puzzles 🎵</Text>
            </>
          )}
        </View>
      </View>

      {/* User Stats — only shown when logged in */}
      {user && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.total_points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.puzzles_completed || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.current_streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
        <TouchableOpacity 
          style={styles.dailyChallenge}
          onPress={handleDailyChallengePress}
        >
          <View style={styles.dailyHeader}>
            <Text style={styles.dailyTitle}>🔥 Daily Challenge</Text>
            <Text style={styles.dailyBadge}>NEW</Text>
          </View>
          <Text style={styles.dailyPuzzle}>{dailyChallenge.title}</Text>
          <Text style={styles.dailyDescription}>
            Complete today's puzzle for bonus points!
          </Text>
        </TouchableOpacity>
      )}

      {/* Difficulty Filter */}
      <View style={styles.filterContainer}>
        {difficulties.map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            style={[
              styles.filterButton,
              (difficulty === 'All' && !selectedDifficulty) ||
              difficulty === selectedDifficulty
                ? styles.filterButtonActive
                : null,
            ]}
            onPress={() => handleDifficultyFilter(difficulty)}
          >
            <Text
              style={[
                styles.filterText,
                (difficulty === 'All' && !selectedDifficulty) ||
                difficulty === selectedDifficulty
                  ? styles.filterTextActive
                  : null,
              ]}
            >
              {difficulty === 'All' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Puzzle List */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={puzzles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PuzzleCard
              puzzle={item}
              onPress={() => handlePuzzlePress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#FFD700"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No puzzles found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#999',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dailyChallenge: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  dailyBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  dailyPuzzle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  dailyDescription: {
    fontSize: 14,
    color: '#999',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 14,
    color: '#999',
  },
  filterTextActive: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
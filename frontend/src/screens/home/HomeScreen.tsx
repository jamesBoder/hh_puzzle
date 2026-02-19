import React from 'react';
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

  const { data: puzzles, isLoading, refetch } = usePuzzles({});

  const { data: dailyChallenge } = useDailyChallenge();

  const handlePuzzlePress = (puzzleId: number) => {
    navigation.navigate('PuzzleDetail', { puzzleId });
  };

  const handleDailyChallengePress = () => {
    if (dailyChallenge) {
      navigation.navigate('PuzzleDetail', {
        puzzleId: dailyChallenge.id,
        isDaily: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Vintage Header */}
      <View style={styles.header}>
        <View style={styles.headerDivider} />
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>◆ EST. 1973 ◆</Text>
          <Text style={styles.headerTitle}>HH PUZZLE</Text>
          <Text style={styles.headerSubtitle}>
            {user ? `WELCOME BACK, ${user.username.toUpperCase()}` : 'HIP-HOP CROSSWORD SERIES'}
          </Text>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* User Stats — vintage record label style */}
      {user && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.total_points || 0}</Text>
            <Text style={styles.statLabel}>PTS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.puzzles_completed || 0}</Text>
            <Text style={styles.statLabel}>SOLVED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.current_streak || 0}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
        </View>
      )}

      {/* Daily Challenge — vintage cassette style */}
      {dailyChallenge && (
        <TouchableOpacity
          style={styles.dailyChallenge}
          onPress={handleDailyChallengePress}
          activeOpacity={0.8}
        >
          <View style={styles.dailyInner}>
            <View style={styles.dailySideLabel}>
              <Text style={styles.dailySideLabelText}>SIDE{'\n'}A</Text>
            </View>
            <View style={styles.dailyContent}>
              <Text style={styles.dailyTag}>◆ DAILY DROP ◆</Text>
              <Text style={styles.dailyPuzzle} numberOfLines={1}>
                {dailyChallenge.title}
              </Text>
              <Text style={styles.dailyDescription}>
                BONUS POINTS AVAILABLE · TAP TO PLAY
              </Text>
            </View>
            <View style={styles.dailyArrow}>
              <Text style={styles.dailyArrowText}>▶</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Section label */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionLabel}>ALL PUZZLES</Text>
        <View style={styles.sectionLine} />
      </View>

      {/* Puzzle List */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>LOADING TRACKS...</Text>
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
              <Text style={styles.emptyIcon}>◈</Text>
              <Text style={styles.emptyText}>NO PUZZLES FOUND</Text>
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
    backgroundColor: '#111111',
  },
  // ── Vintage Header ──────────────────────────────────────
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFD700',
    marginVertical: 6,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  headerLabel: {
    fontSize: 10,
    color: '#B8860B',
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#C8A951',
    letterSpacing: 3,
    marginTop: 2,
  },
  // ── Stats Bar ───────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3a3020',
    backgroundColor: '#1e1a0e',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#8a7a40',
    letterSpacing: 3,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#3a3020',
  },
  // ── Daily Challenge (Cassette Style) ────────────────────
  dailyChallenge: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#1a1500',
  },
  dailyInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailySideLabel: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: '#FFD700',
    paddingVertical: 14,
    backgroundColor: '#FFD700',
  },
  dailySideLabelText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 1,
  },
  dailyContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dailyTag: {
    fontSize: 9,
    color: '#B8860B',
    letterSpacing: 3,
    marginBottom: 4,
  },
  dailyPuzzle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dailyDescription: {
    fontSize: 9,
    color: '#8a7a40',
    letterSpacing: 2,
  },
  dailyArrow: {
    paddingHorizontal: 14,
  },
  dailyArrowText: {
    fontSize: 18,
    color: '#FFD700',
  },
  // ── Section Header ──────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3a3020',
  },
  sectionLabel: {
    fontSize: 10,
    color: '#8a7a40',
    letterSpacing: 4,
    marginHorizontal: 10,
    fontWeight: '700',
  },
  // ── List ────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    color: '#8a7a40',
    letterSpacing: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    color: '#3a3020',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#8a7a40',
    letterSpacing: 4,
  },
});

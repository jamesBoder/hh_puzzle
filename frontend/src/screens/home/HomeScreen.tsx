import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePuzzles, useDailyChallenge } from '../../hooks/usePuzzles';
import { PuzzleCard } from '../../components/puzzle/PuzzleCard';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing, borders } from '../../constants/theme';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // ── Title glow animation ─────────────────────────────────────────────────
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleTitlePressIn = () => {
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleTitlePressOut = () => {
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const glowShadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const { data: puzzles, isLoading, isError, error, refetch } = usePuzzles({});

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Vintage Header */}
      <View style={styles.header}>
        <View style={styles.headerDivider} />
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>◆ EST. 19780 ◆</Text>
          <Pressable onPressIn={handleTitlePressIn} onPressOut={handleTitlePressOut}>
            <Animated.Text
              style={[
                styles.headerTitle,
                {
                  textShadowColor: colors.primary,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: glowShadowRadius,
                },
              ]}
            >
              HH PUZZLE
            </Animated.Text>
          </Pressable>
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
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>LOADING TRACKS...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>NETWORK ERROR</Text>
          <Text style={styles.errorDetail} selectable>
            {(error as any)?.message || 'Could not reach server'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>RETRY</Text>
          </TouchableOpacity>
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
              tintColor={colors.primary}
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
    backgroundColor: colors.background,
  },
  // ── Vintage Header ──────────────────────────────────────
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerDivider: {
    width: '100%',
    height: borders.medium,
    backgroundColor: colors.primary,
    marginVertical: spacing.sm,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  headerLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primaryDark,
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xxs,
  },
  headerTitle: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.widest,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.primaryMid,
    letterSpacing: typography.letterSpacing.wide,
    marginTop: spacing.xxs,
  },
  // ── Stats Bar ───────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xxxl,
    marginBottom: spacing.xl,
    paddingVertical: spacing.base,
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wide,
    marginTop: spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  // ── Daily Challenge (Cassette Style) ────────────────────
  dailyChallenge: {
    marginHorizontal: spacing.xxxl,
    marginBottom: spacing.xxl,
    borderWidth: borders.medium,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceDark,
  },
  dailyInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailySideLabel: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: borders.medium,
    borderRightColor: colors.primary,
    paddingVertical: spacing.xl,
    backgroundColor: colors.primary,
  },
  dailySideLabelText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.black,
    color: colors.textOnPrimary,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
  dailyContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  dailyTag: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  dailyPuzzle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  dailyDescription: {
    fontSize: typography.sizes.xs,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  dailyArrow: {
    paddingHorizontal: spacing.xl,
  },
  dailyArrowText: {
    fontSize: typography.sizes.xxxl,
    color: colors.primary,
  },
  // ── Section Header ──────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xxxl,
    marginBottom: spacing.lg,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
    marginHorizontal: spacing.base,
    fontWeight: typography.weights.bold,
  },
  // ── List ────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
  },
  emptyState: {
    padding: spacing.hero,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    color: colors.border,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.primaryMuted,
    letterSpacing: typography.letterSpacing.wider,
  },
  errorState: {
    padding: spacing.hero,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  errorDetail: {
    fontSize: typography.sizes.sm,
    color: colors.primaryMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  retryText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weights.bold,
  },
});

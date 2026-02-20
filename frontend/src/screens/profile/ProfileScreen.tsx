/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing, borderRadius, borders } from '../../constants/theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  // When not logged in, show login/register options
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatar}>
            <Text style={styles.guestAvatarText}>🎵</Text>
          </View>
          <Text style={styles.guestTitle}>Join HH Puzzle</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to track your progress, earn points, and compete on the leaderboard
          </Text>
        </View>

        <View style={styles.guestFeatures}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⭐</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Earn Points</Text>
              <Text style={styles.featureDesc}>Complete puzzles to earn points and level up</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔥</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Streaks</Text>
              <Text style={styles.featureDesc}>Keep your streak alive with daily challenges</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Achievements</Text>
              <Text style={styles.featureDesc}>Unlock achievements as you master hip-hop trivia</Text>
            </View>
          </View>
        </View>

        <View style={styles.guestActions}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  const stats = [
    { label: 'Total Points', value: user.total_points || 0, icon: '⭐' },
    { label: 'Puzzles Completed', value: user.puzzles_completed || 0, icon: '✅' },
    { label: 'Current Streak', value: user.current_streak || 0, icon: '🔥' },
  ];

  const achievements = [
    { title: 'First Puzzle', description: 'Complete your first puzzle', unlocked: user.puzzles_completed > 0 },
    { title: 'Speed Demon', description: 'Complete a puzzle in under 10 minutes', unlocked: false },
    { title: 'Perfect Score', description: 'Complete a puzzle without hints', unlocked: false },
    { title: 'Week Warrior', description: 'Maintain a 7-day streak', unlocked: user.current_streak >= 7 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement, index) => (
          <View
            key={index}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementLocked,
            ]}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementIconText}>
                {achievement.unlocked ? '🏆' : '🔒'}
              </Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked,
                ]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.achievementDescriptionLocked,
                ]}
              >
                {achievement.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    alignItems: 'center',
    padding: spacing.page,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarText: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textOnPrimary,
  },
  username: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sizes.lg,
    color: colors.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: typography.sizes.h2,
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    padding: spacing.xxxl,
    borderTopWidth: borders.thin,
    borderTopColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xxl,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xxl,
  },
  achievementIconText: {
    fontSize: typography.sizes.h2,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  achievementTitleLocked: {
    color: colors.textMuted,
  },
  achievementDescription: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  achievementDescriptionLocked: {
    color: colors.textFaint,
  },
  actionButton: {
    backgroundColor: colors.card,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
  logoutButtonText: {
    fontWeight: typography.weights.bold,
  },
  // Guest (unauthenticated) styles
  guestHeader: {
    alignItems: 'center',
    padding: spacing.hero,
    paddingTop: spacing.giant,
  },
  guestAvatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    borderWidth: borders.medium,
    borderColor: colors.primary,
  },
  guestAvatarText: {
    fontSize: typography.sizes.display,
  },
  guestTitle: {
    fontSize: typography.sizes.h2 + 4,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  guestSubtitle: {
    fontSize: typography.sizes.xl,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  guestFeatures: {
    paddingHorizontal: spacing.section,
    marginBottom: spacing.page + 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: spacing.xxl,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDesc: {
    fontSize: typography.sizes.lg - 1,
    color: colors.textMuted,
  },
  guestActions: {
    paddingHorizontal: spacing.section,
    gap: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  registerButton: {
    backgroundColor: 'transparent',
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: borders.medium,
    borderColor: colors.primary,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
});

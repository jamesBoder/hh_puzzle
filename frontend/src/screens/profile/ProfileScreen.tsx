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
    backgroundColor: '#1a1a1a',
  },
  header: {
    alignItems: 'center',
    padding: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#999',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  achievementDescriptionLocked: {
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    fontWeight: 'bold',
  },
  // Guest (unauthenticated) styles
  guestHeader: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  guestAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  guestAvatarText: {
    fontSize: 48,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  guestSubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  guestFeatures: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#999',
  },
  guestActions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  registerButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

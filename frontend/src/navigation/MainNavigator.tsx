import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PuzzleDetailScreen } from '../screens/home/PuzzleDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { GameScreen } from '../screens/game/GameScreen';
import { GameCompleteScreen } from '../screens/game/GameCompleteScreen';
import { Text } from 'react-native';
import { colors, typography } from '../constants/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack — includes puzzle browsing
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundAlt,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: typography.weights.bold,
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'HH Puzzle' }}
      />
      <Stack.Screen
        name="PuzzleDetail"
        component={PuzzleDetailScreen}
        options={{ title: 'Puzzle Details' }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: 'Play', headerShown: false }}
      />
      <Stack.Screen
        name="GameComplete"
        component={GameCompleteScreen}
        options={{ title: 'Results', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack — includes login/register for unauthenticated users
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundAlt,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: typography.weights.bold,
        },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login', headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.borderLight,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

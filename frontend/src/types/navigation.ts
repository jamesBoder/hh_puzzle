import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Auth Stack (kept for AuthNavigator compatibility)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeMain: undefined;
  PuzzleDetail: { puzzleId: number; isDaily?: boolean };
};

// Profile Stack — includes Login/Register accessible from Profile tab
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Login: undefined;
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};

// Navigation Props
export type HomeScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'HomeMain'
>;

export type PuzzleDetailScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'PuzzleDetail'
>;

export type PuzzleDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  'PuzzleDetail'
>;

export type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'ProfileMain'
>;

export type LoginScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Login'
>;

export type RegisterScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Register'
>;

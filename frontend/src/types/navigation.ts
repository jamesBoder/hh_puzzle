import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeMain: undefined;
  PuzzleDetail: { puzzleId: number; isDaily?: boolean };
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

export type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;

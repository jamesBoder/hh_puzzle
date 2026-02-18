// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  total_points: number;
  puzzles_completed: number;
  current_streak: number;
  created_at: string;
}

// Puzzle Types
export interface Puzzle {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  decade: string;
  region: string;
  city: string;
  base_points: number;
  estimated_time: number;
  grid_data: any;
  clues_across: Record<string, Clue>;
  clues_down: Record<string, Clue>;
  is_daily_challenge: boolean;
}

export interface Clue {
  clue: string;
  answer: string;
  x: number;
  y: number;
  length: number;
}

// Attempt Types
export interface PuzzleAttempt {
  id: number;
  puzzle_id: number;
  user_id: number;
  completed: boolean;
  time_taken: number;
  hints_used: number;
  points_earned: number;
  started_at: string;
  completed_at?: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_points: number;
  puzzles_completed: number;
}
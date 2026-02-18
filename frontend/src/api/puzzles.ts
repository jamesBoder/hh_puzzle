import apiClient from './client';
import { Puzzle, PuzzleAttempt } from './types';

export const puzzlesAPI = {
  // Get all puzzles
  getPuzzles: async (params?: {
    difficulty?: string;
    region?: string;
    decade?: string;
  }): Promise<Puzzle[]> => {
    const response = await apiClient.get('/puzzles', { params });
    return response.data;
  },

  // Get single puzzle
  getPuzzle: async (id: number): Promise<Puzzle> => {
    const response = await apiClient.get(`/puzzles/${id}`);
    return response.data;
  },

  // Get daily challenge
  getDailyChallenge: async (): Promise<Puzzle> => {
    const response = await apiClient.get('/puzzles/daily');
    return response.data;
  },

  // Start puzzle attempt
  startAttempt: async (puzzleId: number): Promise<PuzzleAttempt> => {
    const response = await apiClient.post('/attempts', {
      puzzle_id: puzzleId,
    });
    return response.data;
  },

  // Submit puzzle attempt
  submitAttempt: async (
    attemptId: number,
    data: {
      completed: boolean;
      time_taken: number;
      hints_used: number;
    }
  ): Promise<PuzzleAttempt> => {
    const response = await apiClient.put(`/attempts/${attemptId}`, data);
    return response.data;
  },

  // Get user's attempts
  getUserAttempts: async (): Promise<PuzzleAttempt[]> => {
    const response = await apiClient.get('/attempts/me');
    return response.data;
  },
};
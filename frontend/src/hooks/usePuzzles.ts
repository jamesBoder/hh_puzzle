import { useQuery } from '@tanstack/react-query';
import { puzzlesAPI } from '../api/puzzles';

export const usePuzzles = (filters?: {
  difficulty?: string;
  region?: string;
  decade?: string;
}) => {
  return useQuery({
    queryKey: ['puzzles', filters],
    queryFn: () => puzzlesAPI.getPuzzles(filters),
  });
};

export const usePuzzle = (id: number) => {
  return useQuery({
    queryKey: ['puzzle', id],
    queryFn: () => puzzlesAPI.getPuzzle(id),
    enabled: !!id,
  });
};

export const useDailyChallenge = () => {
  return useQuery({
    queryKey: ['daily-challenge'],
    queryFn: () => puzzlesAPI.getDailyChallenge(),
  });
};
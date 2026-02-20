import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from './types';

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // response.data is unwrapped by interceptor → { user, token }
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // response.data is unwrapped by interceptor → { user, token }
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    // GET /api/auth/me → unwrapped: { user_id, email, is_guest, profile }
    const response = await apiClient.get('/auth/me');
    const d = response.data as any;
    return {
      id: d.user_id,
      email: d.email,
      username: d.profile?.display_name || d.email?.split('@')[0] || '',
      total_points: d.profile?.total_points ?? 0,
      puzzles_completed: d.profile?.puzzles_completed ?? 0,
      current_streak: d.profile?.current_streak ?? 0,
      created_at: d.profile?.created_at ?? new Date().toISOString(),
    };
  },
};

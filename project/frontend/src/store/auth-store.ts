import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { saveToken, deleteToken } from '@/lib/auth';
import { User } from '@food-delivery/types';

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<User | null>;
  updateProfile: (data: UpdateProfilePayload) => Promise<User>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      await saveToken(res.data.token);
      set({ user: res.data.user, isLoading: false });
      return res.data.user;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', data);
      return await get().login(data.email, data.password);
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    await deleteToken();
    set({ user: null, error: null });
  },

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<User>('/auth/me');
      set({ user: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || 'Failed to fetch user profile',
        isLoading: false,
      });
      throw err;
    }
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    set({ isUpdating: true, error: null });
    try {
      const res = await apiClient.patch<User>('/auth/profile', data);
      set({ user: res.data, isUpdating: false });
      return res.data;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || 'Failed to update profile',
        isUpdating: false,
      });
      throw err;
    }
  },

  clearUser: () => set({ user: null, error: null }),
}));

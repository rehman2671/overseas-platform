'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'job_seeker' | 'recruiter' | 'admin';
  plan_type: 'free' | 'pro' | 'premium';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'job_seeker' | 'recruiter';
  company_name?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/login', { email, password });
          
          const { user, token } = response.data.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Ignore logout errors
        } finally {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
          toast.success('Logged out successfully');
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/register', data);
          
          const { user, token } = response.data.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      checkAuth: () => {
        const token = get().token;
        if (token) {
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, deleteToken } from '@/lib/auth';
import { User } from '@food-delivery/types';
import { useAuthStore, RegisterPayload } from '@/store/auth-store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    fetchMe,
    clearUser,
  } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const token = await getToken();
      if (token) {
        await fetchMe();
      }
    } catch (error) {
      await deleteToken();
      clearUser();
    } finally {
      setIsInitializing(false);
    }
  }

  async function login(email: string, password: string) {
    await storeLogin(email, password);
  }

  async function register(data: RegisterPayload) {
    await storeRegister(data);
  }

  async function logout() {
    await storeLogout();
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading: isInitializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

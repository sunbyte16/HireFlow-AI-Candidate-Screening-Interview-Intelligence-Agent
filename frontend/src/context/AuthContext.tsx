import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  loginAsDemo: (role: 'admin' | 'recruiter') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          console.warn('Stored session invalid or expired, resetting auth.');
          setAuthToken(null);
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await api.login({ email, password });
    setUser(resp.user);
    setToken(resp.access_token);
  };

  const register = async (email: string, password: string, fullName: string, role?: string) => {
    const resp = await api.register({
      email,
      password,
      full_name: fullName,
      role: role || 'recruiter'
    });
    setUser(resp.user);
    setToken(resp.access_token);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  const loginAsDemo = async (role: 'admin' | 'recruiter') => {
    if (role === 'admin') {
      await login('admin@hireflow.ai', 'AdminPassword123!');
    } else {
      await login('recruiter@hireflow.ai', 'RecruiterPassword123!');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        loginAsDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

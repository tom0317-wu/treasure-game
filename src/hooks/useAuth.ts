import { useState, useEffect } from 'react';
import * as api from '../lib/api';

export interface AuthUser {
  username: string;
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (username: string, password: string) => Promise<boolean>;
  signin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  playAsGuest: () => void;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('auth_username');
    return token && username ? { token, username } : null;
  });
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.signup(username, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_username', data.username);
      setUser({ token: data.token, username: data.username });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.signin(username, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_username', data.username);
      setUser({ token: data.token, username: data.username });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    setUser(null);
    setIsGuest(false);
    setError(null);
  };

  const playAsGuest = () => {
    setIsGuest(true);
    setError(null);
  };

  const clearError = () => setError(null);

  return { user, isGuest, isLoading, error, signup, signin, logout, playAsGuest, clearError };
}

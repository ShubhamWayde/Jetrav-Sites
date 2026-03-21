'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api';
import { clearAuth, getAccessToken, storeAccessToken } from '../utils/auth';
import { AUTH_API } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  saveToken: (token: string) => void;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = getAccessToken();
    setState({ accessToken: token, isLoading: false });
  }, []);

  const saveToken = useCallback((token: string) => {
    storeAccessToken(token);
    setState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(AUTH_API.LOGOUT, {});
    } catch {
      // Swallow errors — still clear locally
    }
    clearAuth();
    setState({ accessToken: null, isLoading: false });
    window.location.href = '/signin';
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

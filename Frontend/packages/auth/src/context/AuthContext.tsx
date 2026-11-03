'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { endSession, refreshAccessToken } from '../api';
import { configureAuth, getAccessToken, storeAccessToken } from '../utils/auth';

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

interface AuthProviderProps {
  children: ReactNode;
  /** 'admin' | 'user' — isolates the token and refresh cookie per app. */
  role?: string;
}

export function AuthProvider({ children, role }: AuthProviderProps) {
  // Configure during render, not in an effect: children's effects run before
  // this component's effects, and pages fetch on mount.
  if (role) configureAuth(role);

  const [state, setState] = useState<AuthState>({
    accessToken: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setState({ accessToken: getAccessToken(), isLoading: false });
    };
    // No token in memory after a reload — restore it from the refresh cookie
    if (getAccessToken()) done();
    else refreshAccessToken().finally(done);
    return () => {
      cancelled = true;
    };
  }, [role]);

  const saveToken = useCallback((token: string) => {
    storeAccessToken(token);
    setState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  const logout = useCallback(async () => {
    await endSession();
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

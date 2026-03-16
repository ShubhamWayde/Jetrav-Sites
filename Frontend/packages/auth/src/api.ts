/**
 * api.ts — Typed fetch wrapper with automatic Bearer token injection
 * and silent token-refresh on 401 responses.
 */

import { clearAuth, getAccessToken, storeAccessToken } from './auth';
import { AUTH_API } from './constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  url: string,
  options: RequestInit = {},
  retried = false
): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send httpOnly refresh_token cookie
  });

  // ── Auto-refresh on 401 ───────────────────────────────────────────────────
  if (res.status === 401 && !retried) {
    const refreshed = await attemptRefresh();
    if (refreshed) return request<T>(url, options, true);

    // Clear local state then ask the backend to clear the httpOnly cookie so
    // the Next.js middleware won't redirect back to /dashboard.
    clearAuth();
    await fetch(AUTH_API.LOGOUT, { method: 'POST', credentials: 'include' }).catch(() => {});
    if (typeof window !== 'undefined') window.location.href = '/signin';
    throw new Error('Session expired. Please sign in again.');
  }

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed (${res.status})`);
  }

  return json;
}

// ─── Token refresh ────────────────────────────────────────────────────────────

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(AUTH_API.REFRESH, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;

    const data = (await res.json()) as ApiResponse<{ accessToken: string }>;
    if (data?.data?.accessToken) {
      storeAccessToken(data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  get:    <T>(url: string) =>
    request<T>(url, { method: 'GET' }),

  post:   <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  put:    <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};

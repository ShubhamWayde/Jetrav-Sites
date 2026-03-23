/**
 * api.ts — Typed fetch wrapper with automatic Bearer token injection
 * and silent token-refresh on 401 responses.
 */

import { clearAuth, getAccessToken, storeAccessToken } from './utils/auth';
import { AUTH_API } from './constants';

// Configured once by AuthProvider so the refresh call can tell the backend
// which role-specific cookie to use.
let _appRole = '';
export function configureApiRole(role: string): void {
  _appRole = role;
}

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
  // Public auth routes (signup, send-otp, verify-otp, login) can legitimately
  // return 401 for business reasons (e.g. "user not found"). Do NOT treat those
  // as expired sessions — only protected endpoints should trigger a token refresh.
  const PUBLIC_AUTH_ROUTES = [AUTH_API.SIGNUP, AUTH_API.SEND_OTP, AUTH_API.VERIFY_OTP, AUTH_API.LOGIN];
  const isPublicAuthRoute  = PUBLIC_AUTH_ROUTES.some(endpoint => url.startsWith(endpoint));

  if (res.status === 401 && !retried && !isPublicAuthRoute) {
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
    const url = _appRole ? `${AUTH_API.REFRESH}?role=${_appRole}` : AUTH_API.REFRESH;
    const res = await fetch(url, {
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

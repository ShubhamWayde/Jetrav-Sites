/**
 * api.ts — Typed fetch wrapper with automatic Bearer token injection
 * and silent token-refresh on 401 responses.
 */

import { clearAuth, configureAuth, getAccessToken, getAuthRole, storeAccessToken } from './utils/auth';
import { AUTH_API } from './constants';

/** @deprecated AuthProvider configures the role; kept for existing callers. */
export function configureApiRole(role: string): void {
  configureAuth(role);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/** Thrown for non-2xx responses; `status` lets callers tell 401/404/409 apart. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Public auth routes (signup, send-otp, verify-otp, login) legitimately return
// 401 for business reasons (e.g. a wrong OTP) — never treat those as an expired session.
const PUBLIC_AUTH_ROUTES = [AUTH_API.SIGNUP, AUTH_API.SEND_OTP, AUTH_API.VERIFY_OTP, AUTH_API.LOGIN];

function withRole(url: string): string {
  const role = getAuthRole();
  return role ? `${url}?role=${encodeURIComponent(role)}` : url;
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  url: string,
  options: RequestInit = {},
  retried = false
): Promise<ApiResponse<T>> {
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((endpoint) => url.startsWith(endpoint));

  // After a reload the in-memory token is gone: get one before the first call
  // instead of sending an unauthenticated request just to collect a 401.
  if (!isPublicAuthRoute && !getAccessToken()) await refreshAccessToken();

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
  if (res.status === 401 && !retried && !isPublicAuthRoute) {
    if (await refreshAccessToken()) return request<T>(url, options, true);

    // Clear local state then ask the backend to clear the httpOnly cookie so
    // the Next.js proxy won't redirect back into the app.
    await endSession();
    if (typeof window !== 'undefined') window.location.href = '/signin';
    throw new ApiError('Session expired. Please sign in again.', 401);
  }

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T> & { error?: string };

  if (!res.ok) {
    // Auth middleware errors historically used `error`; everything else `message`
    throw new ApiError(json.message ?? json.error ?? `Request failed (${res.status})`, res.status);
  }

  return json;
}

// ─── Token refresh ────────────────────────────────────────────────────────────

// Several requests can 401 at once; they all share one refresh call.
let refreshInFlight: Promise<boolean> | null = null;

export function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(withRole(AUTH_API.REFRESH), {
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
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** Revokes this app's session server-side and forgets the local token. */
export async function endSession(): Promise<void> {
  clearAuth();
  await fetch(withRole(AUTH_API.LOGOUT), { method: 'POST', credentials: 'include' }).catch(() => {});
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  get:    <T>(url: string, init?: RequestInit) =>
    request<T>(url, { ...init, method: 'GET' }),

  post:   <T>(url: string, body: unknown, init?: RequestInit) =>
    request<T>(url, { ...init, method: 'POST', body: JSON.stringify(body) }),

  put:    <T>(url: string, body: unknown, init?: RequestInit) =>
    request<T>(url, { ...init, method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(url: string, init?: RequestInit) =>
    request<T>(url, { ...init, method: 'DELETE' }),
};

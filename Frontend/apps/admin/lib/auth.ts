/**
 * auth.ts — Client-side token & session helpers.
 * All functions guard against SSR (typeof window check).
 */

import {
  COOKIE_TOKEN,
  SESSION_DAYS,
  STORAGE_ACCESS_TOKEN,
  STORAGE_DEVICE_ID,
} from './constants';

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Strict`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ─── Access Token ─────────────────────────────────────────────────────────────

/**
 * Persist the access token in both localStorage AND a readable cookie
 * so Next.js middleware can check authentication status.
 * Cookie is set to SESSION_DAYS so it persists across browser restarts;
 * the actual validity is enforced by the backend (15-min JWT) combined
 * with auto-refresh via the httpOnly refresh_token cookie.
 */
export function storeAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ACCESS_TOKEN, token);
  setCookie(COOKIE_TOKEN, token, SESSION_DAYS);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_ACCESS_TOKEN);
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  deleteCookie(COOKIE_TOKEN);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ─── Device ID ───────────────────────────────────────────────────────────────

/** Returns an existing unique device-ID or creates one and saves it. */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = localStorage.getItem(STORAGE_DEVICE_ID);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(STORAGE_DEVICE_ID, id);
  return id;
}

// ─── OTP flow helpers (sessionStorage) ───────────────────────────────────────

export function storeOTPContext(mobile: string, purpose: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('otp_mobile', mobile);
  sessionStorage.setItem('otp_purpose', purpose);
}

export function getOTPContext(): { mobile: string; purpose: string } | null {
  if (typeof window === 'undefined') return null;
  const mobile  = sessionStorage.getItem('otp_mobile');
  const purpose = sessionStorage.getItem('otp_purpose');
  if (!mobile || !purpose) return null;
  return { mobile, purpose };
}

export function clearOTPContext(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('otp_mobile');
  sessionStorage.removeItem('otp_purpose');
}

// ─── Dev-mode OTP (returned by backend when APP_ENV=development) ─────────────

/** Store the plaintext OTP returned by the backend in dev mode. */
export function storeDevOTP(otp: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('dev_otp', otp);
}

/** Retrieve the stored dev OTP — null if not present or not in dev mode. */
export function getDevOTP(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('dev_otp');
}

/** Clear the dev OTP once it has been used. */
export function clearDevOTP(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('dev_otp');
}

/**
 * auth.ts — Client-side token & session helpers.
 * All functions guard against SSR (typeof window check).
 *
 * The access token lives in memory only: it is never written to localStorage or
 * a JS-readable cookie, so an XSS bug can't lift a long-lived copy of it. After a
 * reload the API client silently gets a fresh one from the httpOnly refresh cookie.
 */

import { STORAGE_DEVICE_ID } from '../constants';

// ─── Per-app configuration ────────────────────────────────────────────────────
// AuthProvider calls configureAuth(role) so each app (admin / user) keeps its
// own token and refresh cookie even when both run in the same browser.

let _role = '';
let _accessToken: string | null = null;

export function configureAuth(role: string): void {
  if (role === _role) return;
  _role = role;
  _accessToken = null; // never reuse a token issued for another role
}

export function getAuthRole(): string {
  return _role;
}

// ─── Access Token ─────────────────────────────────────────────────────────────

export function storeAccessToken(token: string): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function clearAuth(): void {
  _accessToken = null;
}

export function isAuthenticated(): boolean {
  return !!_accessToken;
}

// ─── Device ID ───────────────────────────────────────────────────────────────

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

// ─── Dev-mode OTP ─────────────────────────────────────────────────────────────
// The backend only returns an OTP when APP_ENV=development.

export function storeDevOTP(otp: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('dev_otp', otp);
}

export function getDevOTP(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('dev_otp');
}

export function clearDevOTP(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('dev_otp');
}

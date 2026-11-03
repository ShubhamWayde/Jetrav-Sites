// ─── API ──────────────────────────────────────────────────────────────────────

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

// Must be NEXT_PUBLIC_* and accessed literally so Next.js inlines them into the browser bundle
export const API_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://api.jetrav.com' : 'http://localhost:8080'),
);

/** Defaults to the API host over ws:// / wss:// when NEXT_PUBLIC_WS_URL is not set */
export const WS_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace(/^http/, 'ws'),
);

/** Shared auth endpoints — same for all apps (admin, user, etc.) */
export const AUTH_API = {
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  LOGOUT_ALL: `${API_BASE_URL}/api/auth/logout-all`,
} as const;

// ─── Storage / Cookie Keys ───────────────────────────────────────────────────

export const STORAGE_DEVICE_ID = 'device_id';

// ─── Session ──────────────────────────────────────────────────────────────────

export const SESSION_DAYS = 7;
export const OTP_RESEND_SECONDS = 30;
export const OTP_LENGTH = 6;

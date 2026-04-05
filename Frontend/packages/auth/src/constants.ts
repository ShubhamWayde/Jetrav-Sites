// ─── API ──────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://api.yourdomain.com'
    : 'http://localhost:8080');

/** Shared auth endpoints — same for all apps (admin, user, etc.) */
export const AUTH_API = {
  SIGNUP:     `${API_BASE_URL}/api/auth/signup`,
  SEND_OTP:   `${API_BASE_URL}/api/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  LOGIN:      `${API_BASE_URL}/api/auth/login`,
  REFRESH:    `${API_BASE_URL}/api/auth/refresh`,
  LOGOUT:     `${API_BASE_URL}/api/auth/logout`,
  LOGOUT_ALL: `${API_BASE_URL}/api/auth/logout-all`,
} as const;

// ─── Storage / Cookie Keys ───────────────────────────────────────────────────

export const STORAGE_ACCESS_TOKEN = 'access_token';
export const STORAGE_DEVICE_ID    = 'device_id';
export const COOKIE_TOKEN         = 'token';   // read by Next.js middleware

// ─── Session ──────────────────────────────────────────────────────────────────

export const SESSION_DAYS       = 7;
export const OTP_RESEND_SECONDS = 30;
export const OTP_LENGTH         = 6;

import { API_BASE_URL } from '@repo/auth';

/** Every backend endpoint the user app calls — the single source of API URLs. */
export const USER_API = {
  // ── Profile ───────────────────────────────────────────────────────────────
  PROFILE_GET:  `${API_BASE_URL}/api/user/profile`,
  PROFILE_PUT:  `${API_BASE_URL}/api/user/profile`,
  SET_PASSWORD: `${API_BASE_URL}/api/user/profile/set-password`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: `${API_BASE_URL}/api/user/dashboard`,

  // ── Leads & Quotations ────────────────────────────────────────────────────
  LEADS:      `${API_BASE_URL}/api/user/leads`,
  QUOTATIONS: `${API_BASE_URL}/api/user/quotations`,

  // ── Account / Subscription ────────────────────────────────────────────────
  SUBSCRIPTION: `${API_BASE_URL}/api/user/subscription`,

  // ── Plans & payments ──────────────────────────────────────────────────────
  PLANS:          `${API_BASE_URL}/api/user/plans`,
  SUBSCRIBE:      `${API_BASE_URL}/api/user/plans/subscribe`,
  CREATE_ORDER:   `${API_BASE_URL}/api/user/plans/create-order`,
  VERIFY_PAYMENT: `${API_BASE_URL}/api/user/plans/verify-payment`,
} as const;

export const SITE_URL = 'https://user.jetrav.com';

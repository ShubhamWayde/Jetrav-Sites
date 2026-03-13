// ─── API ─────────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const ADMIN_API = {
  SIGNUP:       `${API_BASE_URL}/api/admin/auth/signup`,
  SEND_OTP:     `${API_BASE_URL}/api/admin/auth/send-otp`,
  VERIFY_OTP:   `${API_BASE_URL}/api/admin/auth/verify-otp`,
  LOGIN:        `${API_BASE_URL}/api/admin/auth/login`,
  REFRESH:      `${API_BASE_URL}/api/admin/auth/refresh`,
  LOGOUT:       `${API_BASE_URL}/api/admin/auth/logout`,
  LOGOUT_ALL:   `${API_BASE_URL}/api/admin/auth/logout-all`,
  PROFILE_GET:  `${API_BASE_URL}/api/admin/profile`,
  PROFILE_PUT:  `${API_BASE_URL}/api/admin/profile`,
  SET_PASSWORD: `${API_BASE_URL}/api/admin/profile/set-password`,

  // ── Customers ──────────────────────────────────────────────────────────────
  CUSTOMERS:        `${API_BASE_URL}/api/admin/customers`,
  CUSTOMER_BY_ID:   (id: number) => `${API_BASE_URL}/api/admin/customers/${id}`,

  // ── Quotations (nested under customer) ────────────────────────────────────
  QUOTATIONS:         (customerId: number) => `${API_BASE_URL}/api/admin/customers/${customerId}/quotations`,
  QUOTATION_BY_ID:    (customerId: number, quotationId: number) => `${API_BASE_URL}/api/admin/customers/${customerId}/quotations/${quotationId}`,

  // ── Leads ─────────────────────────────────────────────────────────────────
  LEADS:       `${API_BASE_URL}/api/admin/leads`,
  LEAD_BY_ID:  (id: number) => `${API_BASE_URL}/api/admin/leads/${id}`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
} as const;

// ─── Storage / Cookie Keys ───────────────────────────────────────────────────
export const STORAGE_ACCESS_TOKEN = 'admin_access_token';
export const STORAGE_DEVICE_ID    = 'admin_device_id';
export const STORAGE_OTP_MOBILE   = 'admin_otp_mobile';
export const STORAGE_OTP_PURPOSE  = 'admin_otp_purpose';

export const COOKIE_TOKEN         = 'token';          // readable by middleware

// ─── Session ──────────────────────────────────────────────────────────────────
export const SESSION_DAYS = 7;                        // refresh_token lifetime
export const OTP_RESEND_SECONDS = 30;                 // resend cooldown
export const OTP_LENGTH = 6;

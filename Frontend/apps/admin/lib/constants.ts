import { API_BASE_URL } from '@repo/auth';

export const ADMIN_API = {
  // ── Profile ──────────────────────────────────────────────────────────────
  PROFILE_GET:  `${API_BASE_URL}/api/admin/profile`,
  PROFILE_PUT:  `${API_BASE_URL}/api/admin/profile`,
  SET_PASSWORD: `${API_BASE_URL}/api/admin/profile/set-password`,

  // ── Customers ─────────────────────────────────────────────────────────────
  CUSTOMERS:      `${API_BASE_URL}/api/admin/customers`,
  CUSTOMER_BY_ID: (id: number) => `${API_BASE_URL}/api/admin/customers/${id}`,

  // ── Leads ─────────────────────────────────────────────────────────────────
  LEADS:      `${API_BASE_URL}/api/admin/leads`,
  LEAD_BY_ID: (id: number) => `${API_BASE_URL}/api/admin/leads/${id}`,

  // ── Quotations ────────────────────────────────────────────────────────────
  QUOTATIONS:      (customerId: number) => `${API_BASE_URL}/api/admin/customers/${customerId}/quotations`,
  QUOTATION_BY_ID: (customerId: number, quotationId: number) => `${API_BASE_URL}/api/admin/customers/${customerId}/quotations/${quotationId}`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
} as const;

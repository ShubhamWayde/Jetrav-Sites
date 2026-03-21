import { API_BASE_URL } from '@repo/auth';

export const USER_API = {
  PROFILE_GET:  `${API_BASE_URL}/api/user/profile`,
  PROFILE_PUT:  `${API_BASE_URL}/api/user/profile`,
  SET_PASSWORD: `${API_BASE_URL}/api/user/profile/set-password`,
  DASHBOARD:    `${API_BASE_URL}/api/user/dashboard`,
  LEADS:        `${API_BASE_URL}/api/user/leads`,
  QUOTATIONS:   `${API_BASE_URL}/api/user/quotations`,
  SUBSCRIPTION: `${API_BASE_URL}/api/user/subscription`,
} as const;

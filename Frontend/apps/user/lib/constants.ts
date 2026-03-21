import { API_BASE_URL } from '@repo/auth';

export const USER_API = {
  PROFILE_GET:  `${API_BASE_URL}/api/user/profile`,
  PROFILE_PUT:  `${API_BASE_URL}/api/user/profile`,
  SET_PASSWORD: `${API_BASE_URL}/api/user/profile/set-password`,
} as const;

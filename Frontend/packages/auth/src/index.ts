// ─── Types ────────────────────────────────────────────────────────────────────
export type { OTPInputProps, VerifyOTPData, SignupFormType, AuthConfig } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────
export {
  API_BASE_URL,
  AUTH_API,
  STORAGE_ACCESS_TOKEN,
  STORAGE_DEVICE_ID,
  COOKIE_TOKEN,
  SESSION_DAYS,
  OTP_RESEND_SECONDS,
  OTP_LENGTH,
} from './constants';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export {
  storeAccessToken,
  getAccessToken,
  clearAuth,
  isAuthenticated,
  getOrCreateDeviceId,
  storeOTPContext,
  getOTPContext,
  clearOTPContext,
  storeDevOTP,
  getDevOTP,
  clearDevOTP,
} from './auth';

// ─── API wrapper ──────────────────────────────────────────────────────────────
export { api } from './api';
export type { ApiResponse } from './api';

// ─── Context ──────────────────────────────────────────────────────────────────
export { AuthProvider, useAuth } from './AuthContext';

// ─── Components ───────────────────────────────────────────────────────────────
export { default as AuthCard } from './components/AuthCard/AuthCard';
export { default as OTPInput } from './components/OTPInput/OTPInput';

// ─── Views ────────────────────────────────────────────────────────────────────
export { default as SigninView } from './views/SigninView/SigninView';
export { default as SignupView } from './views/SignupView/SignupView';
export { default as OTPView }   from './views/OTPView/OTPView';

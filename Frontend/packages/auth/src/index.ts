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
} from './utils/auth';

// ─── API wrapper ──────────────────────────────────────────────────────────────
export { api, configureApiRole } from './api';
export type { ApiResponse } from './api';

// ─── Context ──────────────────────────────────────────────────────────────────
export { AuthProvider, useAuth } from './context/AuthContext';

// ─── Components ───────────────────────────────────────────────────────────────
export { default as AuthCard } from './components/AuthCard/AuthCard';
export { default as OTPInput } from './components/OTPInput/OTPInput';

// ─── Toast helpers ────────────────────────────────────────────────────────────
export { showSuccess, showError, showInfo, showWarning, getErrorMessage } from './utils/toast';

// ─── Views ────────────────────────────────────────────────────────────────────
export { default as SigninView } from './views/SigninView/SigninView';
export { default as SignupView } from './views/SignupView/SignupView';
export { default as OTPView }   from './views/OTPView/OTPView';

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useSocket } from './hooks/useSocket';
export type { SocketMessage } from './hooks/useSocket';
export { useNotifications } from './hooks/useNotifications';
export type { AppNotification } from './hooks/useNotifications';

// ─── Notifications ────────────────────────────────────────────────────────────
export { default as NotificationListener } from './components/NotificationListener/NotificationListener';

// ─── Shared pages ─────────────────────────────────────────────────────────────
export { default as ProfilePage } from './components/ProfilePage/ProfilePage';
export type { ProfilePageProps }  from './components/ProfilePage/ProfilePage';

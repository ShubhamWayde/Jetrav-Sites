// ─── OTP Component ───────────────────────────────────────────────────────────

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  label?: string;
  length?: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface VerifyOTPData {
  accessToken: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface SignupFormType {
  firstName:    string;
  lastName:     string;
  email:        string;
  mobileNumber: string;
}

// ─── Auth Config (passed to shared view components) ──────────────────────────

export interface AuthConfig {
  /** Role to assign on signup: 'admin' | 'user' */
  role: 'admin' | 'user';
  /** Where to redirect after successful login/OTP verify */
  afterAuthRedirect: string;
  /** Used in subtitle text, e.g. "admin panel" | "your account" */
  appLabel: string;
}

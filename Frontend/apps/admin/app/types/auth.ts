export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  label?: string;
  length?: number;
}

export interface VerifyOTPData {
  accessToken: string;
}

export interface SignupType {
  firstName:    string;
  lastName:     string;
  email:        string;
  mobileNumber: string;
}
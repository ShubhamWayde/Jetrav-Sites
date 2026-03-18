'use client';

import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

import AuthCard from '../../components/AuthCard/AuthCard';
import OTPInput from '../../components/OTPInput/OTPInput';
import { useAuth } from '../../AuthContext';
import { api } from '../../api';
import {
  clearDevOTP,
  clearOTPContext,
  getDevOTP,
  getOTPContext,
  getOrCreateDeviceId,
  storeDevOTP,
} from '../../auth';
import { AUTH_API, OTP_LENGTH, OTP_RESEND_SECONDS } from '../../constants';
import type { AuthConfig, VerifyOTPData } from '../../types';

import styles from './OTPView.module.css';
import Button from '@repo/ui/Button';

interface Props {
  config: AuthConfig;
}

export default function OTPView({ config }: Props) {
  const router = useRouter();
  const { saveToken } = useAuth();

  const [ready, setReady]                 = useState(false);
  const [mobile, setMobile]               = useState('');
  const [purpose, setPurpose]             = useState('signin');
  const [isDevMode, setIsDevMode]         = useState(false);

  const [otp, setOtp]                     = useState('');
  const [otpError, setOtpError]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [timer, setTimer]                 = useState(OTP_RESEND_SECONDS);
  const [canResend, setCanResend]         = useState(false);
  const timerRef                          = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setCanResend(false);
    setTimer(OTP_RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => { if (timerRef.current) clearInterval(timerRef.current); },
    []
  );

  useEffect(() => {
    const ctx = getOTPContext();
    if (!ctx) { router.replace('/signin'); return; }
    setMobile(ctx.mobile);
    setPurpose(ctx.purpose);
    if (getDevOTP()) setIsDevMode(true);
    setReady(true);
    startTimer();
  }, [router, startTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = otp.replace(/\D/g, '');
    if (digits.length !== OTP_LENGTH) {
      setOtpError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      const res = await api.post<VerifyOTPData>(AUTH_API.VERIFY_OTP, {
        mobileNumber: mobile,
        otp:          digits,
        deviceID:     getOrCreateDeviceId(),
        role:         config.role,
      });
      if (res.data?.accessToken) {
        saveToken(res.data.accessToken);
        clearOTPContext();
        clearDevOTP();
        toast.success(res.message ?? 'OTP verified! Welcome back.');
        router.replace(config.afterAuthRedirect);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.');
      setOtp('');
      setIsDevMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await api.post<{ mobileNumber: string; otp?: string }>(
        AUTH_API.SEND_OTP,
        { mobileNumber: mobile, purpose, role: config.role }
      );
      if (res.data?.otp) { storeDevOTP(res.data.otp); setIsDevMode(true); }
      toast.success(res.message ?? 'A new OTP has been sent to your mobile.');
      startTimer();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const maskedMobile = mobile
    ? `+91 ${'•'.repeat(Math.max(0, mobile.length - 4))}${mobile.slice(-4)}`
    : '';

  if (!ready) return null;

  return (
    <AuthCard
      title="Verify OTP"
      subtitle="Enter the 6-digit code sent to your mobile"
      footer={<Link href="/signin">Back to Sign In</Link>}
    >
      <p className={styles.mobile}>
        Code sent to <strong>{maskedMobile}</strong>
      </p>

      {isDevMode && (
        <p className={styles.devBanner}>
          🛠 Dev mode: OTP is printed in the backend console. Enter it manually.
        </p>
      )}

      <form onSubmit={handleVerify} className={styles.form}>
        <div className={styles.otpWrapper}>
          <OTPInput
            value={otp}
            onChange={(val: SetStateAction<string>) => { setOtp(val); setOtpError(''); setIsDevMode(false); }}
            error={!!otpError && otp.replace(/\D/g, '').length < OTP_LENGTH}
          />
          {otpError && <p className={styles.otpErrorText}>{otpError}</p>}
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Verify OTP
        </Button>
      </form>

      <div className={styles.resendRow}>
        {canResend ? (
          <Button variant="ghost" type="button" loading={resendLoading} onClick={handleResend}>
            Resend OTP
          </Button>
        ) : (
          <span>Resend in <span className={styles.timer}>{timer}s</span></span>
        )}
      </div>

      <div className={styles.changeLink}>
        <Link href="/signin">Change mobile number</Link>
      </div>
    </AuthCard>
  );
}

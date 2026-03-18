'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

import Button from '@repo/ui/Button';
import AuthCard from '../../components/AuthCard/AuthCard';
import { useAuth } from '../../AuthContext';
import { api } from '../../api';
import { getOrCreateDeviceId, storeDevOTP, storeOTPContext } from '../../auth';
import { AUTH_API } from '../../constants';
import type { AuthConfig } from '../../types';

import styles from './SigninView.module.css';
import InputField from '@repo/ui/InputField';

type Tab = 'otp' | 'password';
const MOBILE_RE = /^[6-9]\d{9}$/;

interface Props {
  config: AuthConfig;
}

export default function SigninView({ config }: Props) {
  const router = useRouter();
  const { saveToken } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('otp');

  const [otpMobile, setOtpMobile]       = useState('');
  const [otpMobileErr, setOtpMobileErr] = useState('');
  const [otpLoading, setOtpLoading]     = useState(false);

  const [pwMobile, setPwMobile]         = useState('');
  const [pwMobileErr, setPwMobileErr]   = useState('');
  const [password, setPassword]         = useState('');
  const [passwordErr, setPasswordErr]   = useState('');
  const [pwLoading, setPwLoading]       = useState(false);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setOtpMobileErr('');
    setPwMobileErr('');
    setPasswordErr('');
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!MOBILE_RE.test(otpMobile.trim())) {
      setOtpMobileErr('Enter a valid 10-digit mobile number.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.post<{ mobileNumber: string; otp?: string }>(
        AUTH_API.SEND_OTP,
        { mobileNumber: otpMobile.trim(), purpose: 'signin', role: config.role }
      );
      if (res.data?.otp) storeDevOTP(res.data.otp);
      storeOTPContext(otpMobile.trim(), 'signin');
      toast.success(res.message ?? 'OTP sent to your mobile number.');
      router.push('/otp');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!MOBILE_RE.test(pwMobile.trim())) {
      setPwMobileErr('Enter a valid 10-digit mobile number.');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordErr('Password is required.');
      valid = false;
    }
    if (!valid) return;
    setPwLoading(true);
    try {
      const res = await api.post<{ accessToken: string }>(AUTH_API.LOGIN, {
        mobileNumber: pwMobile.trim(),
        password,
        deviceID: getOrCreateDeviceId(),
        role: config.role,
      });
      if (res.data?.accessToken) {
        saveToken(res.data.accessToken);
        toast.success(res.message ?? 'Signed in successfully!');
        router.replace(config.afterAuthRedirect);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle={`Sign in to continue to the ${config.appLabel}`}
      footer={<>Don&apos;t have an account? <Link href="/signup">Sign Up</Link></>}
    >
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'otp' ? styles.tabActive : ''}`}
          onClick={() => switchTab('otp')}
        >
          OTP Login
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'password' ? styles.tabActive : ''}`}
          onClick={() => switchTab('password')}
        >
          Password Login
        </button>
      </div>

      {activeTab === 'otp' && (
        <form onSubmit={handleOTPLogin} noValidate className={styles.form}>
          <InputField
            label="Mobile Number"
            name="otpMobile"
            type="tel"
            placeholder="9876543210"
            value={otpMobile}
            onChange={(e) => { setOtpMobile(e.target.value); setOtpMobileErr(''); }}
            error={otpMobileErr}
            required
            autoComplete="tel"
            maxLength={10}
          />
          <Button type="submit" fullWidth loading={otpLoading}>
            Send OTP
          </Button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordLogin} noValidate className={styles.form}>
          <InputField
            label="Mobile Number"
            name="pwMobile"
            type="tel"
            placeholder="9876543210"
            value={pwMobile}
            onChange={(e) => { setPwMobile(e.target.value); setPwMobileErr(''); }}
            error={pwMobileErr}
            required
            autoComplete="tel"
            maxLength={10}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordErr(''); }}
            error={passwordErr}
            required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth loading={pwLoading}>
            Sign In
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

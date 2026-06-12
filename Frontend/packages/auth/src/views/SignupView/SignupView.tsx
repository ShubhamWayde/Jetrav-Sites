'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Button from '@repo/ui/button';
import InputField from '@repo/ui/inputfield';
import AuthCard from '../../components/AuthCard/AuthCard';
import { api } from '../../api';
import { storeDevOTP, storeOTPContext } from '../../utils/auth';
import { AUTH_API } from '../../constants';
import { showSuccess, showError, getErrorMessage } from '../../utils/toast';
import type { AuthConfig, SignupFormType } from '../../types';

import styles from './SignupView.module.css';

type FieldErrors = Partial<SignupFormType>;

const EMPTY: SignupFormType = {
  firstName:    '',
  lastName:     '',
  email:        '',
  mobileNumber: '',
};

interface Props {
  config: AuthConfig;
}

export default function SignupView({ config }: Props) {
  const router = useRouter();

  const [form, setForm]               = useState<SignupFormType>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading]         = useState(false);

  const handleChange =
    (field: keyof SignupFormType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required.';
    if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim()))
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    // Client-side validation → show inline under each field
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post<{ mobileNumber: string; otp?: string }>(
        AUTH_API.SIGNUP,
        {
          firstName:    form.firstName.trim(),
          lastName:     form.lastName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          role:         config.role,
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
        },
      );
      if (res.data?.otp) storeDevOTP(res.data.otp);
      storeOTPContext(form.mobileNumber.trim(), 'signup');
      showSuccess(res.message ?? 'Account created! OTP sent to your mobile.');
      router.push('/otp');
    } catch (err) {
      // API error → toast (e.g. "mobile number is already registered")
      showError(getErrorMessage(err, 'Sign up failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle={`Sign up to access the ${config.appLabel}`}
      footer={<>Already have an account? <Link href="/signin">Sign In</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.nameRow}>
          <InputField
            label="First Name"
            name="firstName"
            placeholder="John"
            value={form.firstName}
            onChange={handleChange('firstName')}
            error={fieldErrors.firstName}
            required
            autoComplete="given-name"
          />
          <InputField
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            value={form.lastName}
            onChange={handleChange('lastName')}
            error={fieldErrors.lastName}
            required
            autoComplete="family-name"
          />
        </div>

        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={handleChange('email')}
          error={fieldErrors.email}
          autoComplete="email"
        />

        <InputField
          label="Mobile Number"
          name="mobileNumber"
          type="tel"
          placeholder="9876543210"
          value={form.mobileNumber}
          onChange={handleChange('mobileNumber')}
          error={fieldErrors.mobileNumber}
          required
          autoComplete="tel"
          maxLength={10}
        />

        <Button type="submit" fullWidth loading={loading}>
          Continue
        </Button>
      </form>
    </AuthCard>
  );
}

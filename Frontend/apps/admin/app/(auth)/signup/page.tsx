'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

import AuthCard from '@/components/auth/auth-card/AuthCard';
import Button from '@/components/ui/button/Button';
import InputField from '@/components/ui/input-field/InputField';
import { api } from '@/lib/api';
import { storeDevOTP, storeOTPContext } from '@/lib/auth';
import { ADMIN_API } from '@/lib/constants';

import styles from './signup.module.css';
import { SignupType } from '@/app/types/auth';


type FieldErrors = Partial<SignupType>;

const EMPTY: SignupType = {
  firstName:    '',
  lastName:     '',
  email:        '',
  mobileNumber: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm]               = useState<SignupType>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading]         = useState(false);

  // ── Field change helper ───────────────────────────────────────────────────

  const handleChange =
    (field: keyof SignupType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (!form.firstName.trim())
      errs.firstName = 'First name is required.';

    if (!form.lastName.trim())
      errs.lastName = 'Last name is required.';

    if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim()))
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const signupRes = await api.post<{ mobileNumber: string; otp?: string }>(
        ADMIN_API.SIGNUP,
        {
          firstName:    form.firstName.trim(),
          lastName:     form.lastName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
        }
      );

      if (signupRes.data?.otp) storeDevOTP(signupRes.data.otp);
      storeOTPContext(form.mobileNumber.trim(), 'signup');

      toast.success(signupRes.message ?? 'Account created! OTP sent to your mobile.');
      router.push('/otp');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthCard
      title="Create Account"
      subtitle="Sign up to access the admin panel"
      footer={
        <>Already have an account? <Link href="/signin">Sign In</Link></>
      }
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

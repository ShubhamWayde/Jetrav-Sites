'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_BASE_URL } from '@repo/auth';

/**
 * Root page — smart redirect after authentication.
 *
 * Middleware already blocks unauthenticated users → /signin.
 * This page is only ever reached by authenticated users and
 * determines whether to send them to /plan (no subscription)
 * or /dashboard (active subscription).
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    api.get<{ hasPlan: boolean }>(`${API_BASE_URL}/api/user/subscription`)
      .then(res => {
        if (res.data?.hasPlan) {
          router.replace('/dashboard');
        } else {
          router.replace('/plan');
        }
      })
      .catch(() => router.replace('/signin'));
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
        Loading…
      </span>
    </div>
  );
}

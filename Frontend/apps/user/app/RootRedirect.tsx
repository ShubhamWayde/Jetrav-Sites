'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@repo/ui/Button';
import { EmptyState } from '@repo/ui/EmptyState';
import Spinner from '@repo/ui/Spinner';
import StatusScreen from '@/components/StatusScreen/StatusScreen';
import { USER_API } from '@/lib/constants';
import { useApiQuery } from '@/lib/useApiQuery';
import type { SubscriptionStatus } from '@/app/types/account';

/**
 * Smart redirect after sign-in. The proxy already sends signed-out visitors to
 * /signin, so this only decides between /plan (no subscription) and /dashboard.
 *
 * Only a 401 goes back to /signin. Any other failure (backend down, 5xx) shows
 * a retry: redirecting would bounce between / and /signin forever, because the
 * proxy sends /signin back here while the refresh cookie exists.
 */
export default function RootRedirect() {
  const router = useRouter();
  const { data, loading, error, errorStatus, reload } = useApiQuery<SubscriptionStatus>(
    USER_API.SUBSCRIPTION,
    "We couldn't reach Jetrav right now. Check your connection and try again.",
  );

  useEffect(() => {
    if (loading) return;
    if (errorStatus === 401) router.replace('/signin');
    else if (!error) router.replace(data?.hasPlan ? '/dashboard' : '/plan');
  }, [loading, error, errorStatus, data, router]);

  if (error && errorStatus !== 401) {
    return (
      <StatusScreen>
        <EmptyState
          variant="error"
          title="Couldn't open your account"
          description={error}
          action={<Button onClick={reload}>Try again</Button>}
        />
      </StatusScreen>
    );
  }

  return (
    <StatusScreen>
      <Spinner size={28} label="Opening your account…" />
    </StatusScreen>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@repo/ui/Button';
import { EmptyState } from '@repo/ui/EmptyState';
import StatusScreen, { StatusActions } from '@/components/StatusScreen/StatusScreen';

/** Catches render errors anywhere below the root layout. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen>
      <EmptyState
        variant="error"
        title="Something went wrong"
        description="This page hit an unexpected problem. Try again, or head back to your dashboard."
        action={
          <StatusActions>
            <Button onClick={reset}>Try again</Button>
            <Link href="/dashboard">Go to dashboard</Link>
          </StatusActions>
        }
      />
    </StatusScreen>
  );
}

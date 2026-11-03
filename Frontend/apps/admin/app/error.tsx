'use client';

import { useEffect } from 'react';
import Button from '@repo/ui/Button';
import StatusScreen, { StatusLink } from '@/components/feedback/StatusScreen';

// Last-resort boundary for anything outside the signed-in shell
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      standalone
      code="Error"
      title="Something went wrong"
      text="An unexpected error stopped this page from loading. Try again, or head back to the dashboard."
      actions={
        <>
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <StatusLink href="/dashboard">Go to dashboard</StatusLink>
        </>
      }
      footnote={error.digest ? `Reference: ${error.digest}` : undefined}
    />
  );
}

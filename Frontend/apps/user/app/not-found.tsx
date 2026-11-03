import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@repo/ui/EmptyState';
import StatusScreen from '@/components/StatusScreen/StatusScreen';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <StatusScreen>
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<Link href="/">Back to my account</Link>}
      />
    </StatusScreen>
  );
}

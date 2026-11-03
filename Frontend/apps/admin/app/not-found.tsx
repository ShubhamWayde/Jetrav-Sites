import type { Metadata } from 'next';
import StatusScreen, { StatusLink } from '@/components/feedback/StatusScreen';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <StatusScreen
      standalone
      code="404"
      title="Page not found"
      text="The page you were looking for doesn't exist or has moved."
      actions={<StatusLink href="/dashboard">Go to dashboard</StatusLink>}
    />
  );
}

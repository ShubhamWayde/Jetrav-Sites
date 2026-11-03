import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

// Signed-in pages are private: keep them out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PagesLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

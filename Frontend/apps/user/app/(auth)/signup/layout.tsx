import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Create your account',
  description:
    'Create a free Jetrav account: earn 15% back in Jet Points on every flight and let our concierges manage your trips from ₹199.',
  alternates: { canonical: '/signup' },
  openGraph: { url: '/signup', title: 'Create your account · Jetrav' },
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}

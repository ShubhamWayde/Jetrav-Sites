import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to your Jetrav account with your mobile number to track trip requests, quotations, Jet Points and your plan.',
  alternates: { canonical: '/signin' },
  openGraph: { url: '/signin', title: 'Sign in · Jetrav' },
};

export default function SigninLayout({ children }: { children: ReactNode }) {
  return children;
}

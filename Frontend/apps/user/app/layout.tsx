import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontOutfit } from '@repo/ui/fonts/fonts';
import { SITE_URL } from '@/lib/constants';
import Providers from './providers';
import '@repo/ui/styles/css/base.css';
import '@repo/ui/styles/css/app.css';
import './globals.css';

const DESCRIPTION =
  'Your Jetrav travel account: track trip requests and quotations, see your Jet Points balance and manage your plan. Earn 15% back in Jet Points on every flight, with trip management from ₹199.';

const OG_IMAGE = {
  url: 'https://jetrav.com/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Jetrav — Travel seamlessly, earn instantly',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jetrav — My travel account',
    template: '%s · Jetrav',
  },
  description: DESCRIPTION,
  applicationName: 'Jetrav',
  authors: [{ name: 'Jetrav LLP' }],
  creator: 'Jetrav',
  publisher: 'Jetrav LLP',
  category: 'travel',
  openGraph: {
    type: 'website',
    siteName: 'Jetrav',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'Jetrav — My travel account',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@jetrav',
    title: 'Jetrav — My travel account',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: '/favicon.ico',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN" className={`${fontOutfit.variable} ${fontOutfit.className}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

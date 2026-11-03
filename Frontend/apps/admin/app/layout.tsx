import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontOutfit } from '@repo/ui/fonts/fonts';
import Providers from './providers';
import '@repo/ui/styles/css/base.css';
import '@repo/ui/styles/css/app.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Jetrav Admin',
    template: '%s · Jetrav Admin',
  },
  description:
    'Internal Jetrav console for managing customers, travel leads, quotations and upcoming trips.',
  applicationName: 'Jetrav Admin',
  // Internal tool: keep it out of search engines and caches entirely
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: '/favicon.ico',
  },
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

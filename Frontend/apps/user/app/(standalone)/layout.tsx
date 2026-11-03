import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@repo/ui/Logo';
import styles from './standalone.module.css';

// Signed-in, full-width pages (plan checkout) — private, so not indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className={styles.bar}>
        <Link href="/dashboard" className={styles.logo} aria-label="Jetrav — go to dashboard">
          <Logo />
        </Link>
        <Link href="/dashboard" className={styles.back}>
          ← Back to dashboard
        </Link>
      </header>
      <main id="main-content" tabIndex={-1} className={styles.main}>
        {children}
      </main>
    </div>
  );
}

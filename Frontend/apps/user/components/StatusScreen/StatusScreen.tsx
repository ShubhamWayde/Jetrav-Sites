import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@repo/ui/Logo';
import styles from './StatusScreen.module.css';

/** Full-screen centred panel for states outside the app shell (redirects, errors, 404). */
export default function StatusScreen({ children }: { children: ReactNode }) {
  return (
    <main className={styles.screen}>
      <div className={styles.panel}>
        <Link href="/" className={styles.logo} aria-label="Jetrav home">
          <Logo />
        </Link>
        {children}
      </div>
    </main>
  );
}

/** Row of actions (button + link) under a status message; wraps on narrow screens. */
export function StatusActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

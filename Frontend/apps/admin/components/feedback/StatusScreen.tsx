import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@repo/ui/Logo';
import styles from './StatusScreen.module.css';

interface StatusScreenProps {
  /** Small label above the title, e.g. "404". */
  code?: string;
  title: string;
  text?: ReactNode;
  actions?: ReactNode;
  /** Rendered outside the app shell: fill the viewport and show the logo. */
  standalone?: boolean;
  footnote?: ReactNode;
}

/** Centred panel for error, not-found and similar full-page states. */
export default function StatusScreen({ code, title, text, actions, standalone, footnote }: StatusScreenProps) {
  return (
    <div className={`${styles.screen}${standalone ? ` ${styles.standalone}` : ''}`}>
      <div className={styles.panel}>
        {standalone && (
          <Link href="/dashboard" className={styles.logo} aria-label="Jetrav Admin dashboard">
            <Logo />
          </Link>
        )}
        {code && <p className={styles.code}>{code}</p>}
        <h1 className={styles.title}>{title}</h1>
        {text && <p className={styles.text}>{text}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
        {footnote && <p className={styles.digest}>{footnote}</p>}
      </div>
    </div>
  );
}

/** Secondary-button-styled link for use in `actions`. */
export function StatusLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.link}>
      {children}
    </Link>
  );
}

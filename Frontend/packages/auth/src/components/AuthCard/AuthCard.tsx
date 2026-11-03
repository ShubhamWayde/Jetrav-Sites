import type { ReactNode } from 'react';
import { Logo } from '@repo/ui/Logo';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand} aria-label="Jetrav" role="img">
          <Logo className={styles.logo} />
        </div>

        <div className={styles.header}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </main>
  );
}

import type { ReactNode } from 'react';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * AuthCard — centred card wrapper used by all auth pages.
 * Provides consistent page layout, header, body and footer slots.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

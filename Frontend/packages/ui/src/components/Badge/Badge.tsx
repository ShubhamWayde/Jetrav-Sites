import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

export interface BadgeProps {
  tone?: BadgeTone;
  /** Small leading dot — useful for statuses. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', dot = false, children, className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}${className ? ` ${className}` : ''}`}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}

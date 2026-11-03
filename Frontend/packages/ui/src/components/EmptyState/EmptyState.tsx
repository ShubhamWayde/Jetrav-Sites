import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  /** Use 'error' for failed loads (announced to screen readers). */
  variant?: 'empty' | 'error';
}

export function EmptyState({ title, description, icon, action, variant = 'empty' }: EmptyStateProps) {
  return (
    <div
      className={`${styles.empty}${variant === 'error' ? ` ${styles.error}` : ''}`}
      role={variant === 'error' ? 'alert' : undefined}
    >
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

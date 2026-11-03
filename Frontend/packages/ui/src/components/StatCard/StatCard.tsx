import type { ReactNode } from 'react';
import type { BadgeTone } from '../Badge/Badge';
import styles from './StatCard.module.css';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** Small supporting line, e.g. "this month". */
  hint?: ReactNode;
  /** Colours the icon chip to match a status. */
  tone?: Extract<BadgeTone, 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'>;
  loading?: boolean;
}

export function StatCard({ label, value, icon, hint, tone = 'accent', loading = false }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[tone]}`} aria-busy={loading || undefined}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      </div>
      {loading ? (
        <span className={styles.skeleton} aria-label="Loading" />
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

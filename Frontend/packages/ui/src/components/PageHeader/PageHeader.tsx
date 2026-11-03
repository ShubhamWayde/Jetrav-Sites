import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Buttons shown on the right (stack under the title on small screens). */
  actions?: ReactNode;
  /** Breadcrumb or back link rendered above the title. */
  eyebrow?: ReactNode;
}

/** The single <h1> of a page. */
export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

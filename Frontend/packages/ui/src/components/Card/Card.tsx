import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional heading row. */
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Remove body padding (e.g. when the card wraps a table). */
  flush?: boolean;
  as?: 'section' | 'div' | 'article';
}

export function Card({
  title,
  description,
  actions,
  flush = false,
  as: Tag = 'section',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag className={`${styles.card}${className ? ` ${className}` : ''}`} {...rest}>
      {(title || actions) && (
        <div className={styles.head}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={flush ? undefined : styles.body}>{children}</div>
    </Tag>
  );
}

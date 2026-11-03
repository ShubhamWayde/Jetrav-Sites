'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from '../spinner';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  /** Icon shown before the label (hidden from screen readers). */
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      // A loading button is always disabled, even if `disabled={false}` is passed
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.full : '',
        !children ? styles.iconOnly : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : 16} />
      ) : (
        icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  );
}

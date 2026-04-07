'use client';

import { CarryOnBagChecked, Icon, Insurance } from '@repo/ui/icon';
import styles from './FormError.module.css';

interface FormErrorProps {
  message: string;
  type?: 'error' | 'success';
}

export default function FormError({ message, type = 'error' }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`${styles.error} ${type === 'success' ? styles.success : ''}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.icon}>
        {type === 'error' ? <Icon icon={Insurance} size="sm" /> : <Icon icon={CarryOnBagChecked} size="sm" />}
      </span>
      <span>{message}</span>
    </div>
  );
}

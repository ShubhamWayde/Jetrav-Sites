'use client';

import { CheckCircleIcon, WarningIcon } from '../Icons/Icons';
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
        {type === 'error' ? <WarningIcon size={14} /> : <CheckCircleIcon size={14} />}
      </span>
      <span>{message}</span>
    </div>
  );
}

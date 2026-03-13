'use client';

import type { InputHTMLAttributes } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputField({
  label,
  error,
  required,
  className,
  id,
  ...rest
}: InputFieldProps) {
  const inputId = id ?? rest.name;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputWrap}>
        <input
          id={inputId}
          required={required}
          className={`${styles.input} ${error ? styles.hasError : ''} ${className ?? ''}`}
          {...rest}
        />
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

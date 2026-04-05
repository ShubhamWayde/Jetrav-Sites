'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: ReactNode;
}

export default function InputField({
  label,
  error,
  suffix,
  required,
  className,
  id,
  disabled,
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
          disabled={disabled}
          className={`${styles.input} ${error ? styles.hasError : ''} ${disabled ? styles.disabled : ''} ${suffix ? styles.hasSuffix : ''} ${className ?? ''}`}
          {...rest}
        />
        {suffix && <div className={styles.suffix}>{suffix}</div>}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

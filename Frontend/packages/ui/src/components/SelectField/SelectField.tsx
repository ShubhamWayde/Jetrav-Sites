'use client';

import type { SelectHTMLAttributes } from 'react';
import styles from './SelectField.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export default function SelectField({
  label,
  error,
  options = [],
  placeholder,
  required,
  className,
  id,
  ...rest
}: SelectFieldProps) {
  const selectId = id ?? rest.name;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <select
        id={selectId}
        required={required}
        className={`${styles.select} ${error ? styles.hasError : ''} ${className ?? ''}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

'use client';

import { useId, type SelectHTMLAttributes } from 'react';
import styles from './SelectField.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export default function SelectField({
  label,
  error,
  hint,
  options = [],
  placeholder,
  required,
  className,
  id,
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? rest.name ?? autoId;
  const messageId = `${selectId}-message`;
  const message = error || hint;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <select
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={[styles.select, error ? styles.hasError : '', className ?? '']
          .filter(Boolean)
          .join(' ')}
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

      {message && (
        <span id={messageId} className={error ? styles.errorText : styles.hintText}>
          {message}
        </span>
      )}
    </div>
  );
}

'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Helper text shown under the field when there is no error. */
  hint?: string;
  suffix?: ReactNode;
}

export default function InputField({
  label,
  error,
  hint,
  suffix,
  required,
  className,
  id,
  disabled,
  ...rest
}: InputFieldProps) {
  // Always have an id so the <label> and error text are linked for screen readers
  const autoId = useId();
  const inputId = id ?? rest.name ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error || hint;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <div className={styles.inputWrap}>
        <input
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={[
            styles.input,
            error ? styles.hasError : '',
            suffix ? styles.hasSuffix : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {suffix && <div className={styles.suffix}>{suffix}</div>}
      </div>

      {message && (
        <span id={messageId} className={error ? styles.errorText : styles.hintText}>
          {message}
        </span>
      )}
    </div>
  );
}

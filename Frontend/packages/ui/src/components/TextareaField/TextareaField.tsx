'use client';

import { useId, type TextareaHTMLAttributes } from 'react';
import styles from './TextareaField.module.css';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Applied to the wrapper (kept for existing callers). */
  className?: string;
}

export default function TextareaField({
  label,
  error,
  hint,
  rows = 3,
  required,
  className,
  id,
  ...rest
}: TextareaFieldProps) {
  const autoId = useId();
  const textareaId = id ?? rest.name ?? autoId;
  const messageId = `${textareaId}-message`;
  const message = error || hint;

  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ''}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`${styles.textarea}${error ? ` ${styles.hasError}` : ''}`}
        {...rest}
      />
      {message && (
        <span id={messageId} className={error ? styles.errorText : styles.hintText}>
          {message}
        </span>
      )}
    </div>
  );
}

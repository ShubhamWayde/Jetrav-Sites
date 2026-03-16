import type { ChangeEvent } from 'react';
import styles from './TextareaField.module.css';

interface TextareaFieldProps {
  label?:       string;
  value:        string;
  onChange:     (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?:        number;
  disabled?:    boolean;
  className?:   string;
}

export default function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
  className,
}: TextareaFieldProps) {
  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={styles.textarea}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </div>
  );
}

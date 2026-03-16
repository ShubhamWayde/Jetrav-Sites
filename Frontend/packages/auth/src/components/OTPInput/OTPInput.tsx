'use client';

import {
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { OTP_LENGTH } from '../../constants';
import type { OTPInputProps } from '../../types';
import styles from './OTPInput.module.css';

export default function OTPInput({
  value,
  onChange,
  error = false,
  label,
  length = OTP_LENGTH,
}: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>(
    Array.from({ length }, () => null)
  );

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focus = (index: number) => refs.current[index]?.focus();

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const next = digits.slice();
    next[index] = raw[raw.length - 1] ?? '';
    onChange(next.join('').slice(0, length));
    if (index < length - 1) focus(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        focus(index - 1);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) focus(index - 1);
    if (e.key === 'ArrowRight' && index < length - 1) focus(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, '').slice(0, length));
    focus(Math.min(pasted.length, length - 1));
  };

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.boxes}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoFocus={i === 0}
            autoComplete="one-time-code"
            className={[
              styles.box,
              digit ? styles.filled : '',
              error ? styles.hasError : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    </div>
  );
}

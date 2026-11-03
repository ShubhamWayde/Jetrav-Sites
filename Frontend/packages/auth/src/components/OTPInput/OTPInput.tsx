'use client';

import {
  useId,
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
  const labelId = useId();
  const refs = useRef<Array<HTMLInputElement | null>>(
    Array.from({ length }, () => null)
  );

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focus = (index: number) => refs.current[index]?.focus();

  // Writes digits starting at `index`; handles typing, paste and SMS autofill
  // (which types the whole code into the first box at once).
  const fill = (index: number, incoming: string) => {
    const next = digits.slice();
    for (let i = 0; i < incoming.length && index + i < length; i++) next[index + i] = incoming[i]!;
    onChange(next.join('').slice(0, length));
    focus(Math.min(index + incoming.length, length - 1));
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    // A single typed key replaces the box's digit; longer input spreads across boxes
    fill(index, raw.length > 1 && raw.length < length ? raw.slice(-1) : raw);
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
    fill(0, pasted);
  };

  const groupLabel = label ?? 'One-time password';

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label} id={labelId}>{label}</span>}

      <div className={styles.boxes} role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : groupLabel}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            // First box accepts the full code from SMS autofill / password managers
            maxLength={i === 0 ? length : 1}
            value={digit}
            autoFocus={i === 0}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error || undefined}
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

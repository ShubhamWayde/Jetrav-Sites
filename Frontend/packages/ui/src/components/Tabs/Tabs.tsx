'use client';

import type { ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabOption<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Optional count shown after the label. */
  count?: number;
}

export interface TabsProps<V extends string = string> {
  options: TabOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Accessible name for the group, e.g. "Filter leads by type". */
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Segmented filter control. Implemented as a toggle-button group (aria-pressed)
 * because it filters the content below rather than switching tab panels.
 * Scrolls horizontally when the options don't fit.
 */
export function Tabs<V extends string = string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: TabsProps<V>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`${styles.tabs} ${styles[size]}${className ? ` ${className}` : ''}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            className={`${styles.tab}${active ? ` ${styles.active}` : ''}`}
            onClick={() => !active && onChange(option.value)}
          >
            {option.label}
            {option.count !== undefined && <span className={styles.count}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useId, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  title?:     string;
  subtitle?:  string;
  maxWidth?:  number;
  className?: string;
  children:   ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.footer}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 720,
  className,
  children,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose without re-running effects when the parent passes a new function
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Lock page scroll, move focus into the dialog, and restore it on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const firstField = panel?.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    (firstField ?? panel)?.focus();

    return () => {
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Keep Tab / Shift+Tab inside the dialog
  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`${styles.modal}${className ? ` ${className}` : ''}`}
        style={{ maxWidth } as CSSProperties}
        onKeyDown={trapFocus}
      >
        {title && (
          <div className={styles.header}>
            <div>
              <h2 id={titleId} className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close dialog">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

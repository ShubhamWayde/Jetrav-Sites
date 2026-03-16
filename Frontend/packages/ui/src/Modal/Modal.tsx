'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import Button from '../button/button';
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
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`${styles.modal}${className ? ` ${className}` : ''}`}
        style={{ maxWidth } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <Button title='Close Modal' className={styles.closeButton} variant="ghost" type="button" onClick={onClose}>X</Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

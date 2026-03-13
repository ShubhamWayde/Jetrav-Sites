'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { TrashIcon } from '@/components/ui/icons-library/Icons';
import styles from './ConfirmDeleteModal.module.css';

interface ConfirmDeleteModalProps {
  isOpen:       boolean;
  title?:       string;
  description?: string;
  confirmLabel?: string;
  loading?:     boolean;
  onClose:      () => void;
  onConfirm:    () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title        = 'Confirm Delete',
  description  = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  loading      = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={styles.iconWrap}>
          <TrashIcon size={24} className={styles.icon} />
        </div>

        {/* Content */}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            loading={loading}
            onClick={onConfirm}
            className={styles.deleteBtn}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

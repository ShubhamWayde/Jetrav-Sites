'use client';

import Button from '@repo/ui/Button';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import { Delete, Icon } from '@repo/ui/icon';
import styles from './ConfirmDeleteModal.module.css';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Confirm delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title} maxWidth={440}>
      <div className={styles.body}>
        <span className={styles.icon} aria-hidden="true">
          <Icon icon={Delete} size="md" />
        </span>
        <p className={styles.description}>{description}</p>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

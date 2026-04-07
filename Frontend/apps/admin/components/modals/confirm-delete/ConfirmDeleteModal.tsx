"use client";

import Button from "@repo/ui/Button";
import Modal from "@repo/ui/Modal";
import { Icon, Delete } from "@repo/ui/icon";
import styles from "./ConfirmDeleteModal.module.css";

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
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={400}
      className={styles.body}
    >
      {/* Icon */}
      <div className={styles.iconWrap}>
        <Icon icon={Delete} size="lg" className={styles.icon} />
      </div>

      {/* Content */}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      {/* Actions */}
      <div className={styles.actions}>
        <Button
          title="Cancel"
          className="btn-md"
          variant="secondary"
          type="button"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          title={confirmLabel}
          variant="primary"
          type="button"
          loading={loading}
          onClick={onConfirm}
          className={styles.deleteBtn}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

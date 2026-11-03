'use client';

import { useState } from 'react';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import Button from '@repo/ui/Button';
import InputField from '@repo/ui/InputField';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import { Tabs } from '@repo/ui/Tabs';
import TextareaField from '@repo/ui/TextareaField';
import { ADMIN_API } from '@/lib/constants';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { QUOTATION_TYPES, type QuotationType } from '@/app/types/quotation';
import TripDetailsFields from '@/components/trip-details/TripDetailsFields';
import { defaultTripDetails, validateTripDetails } from '@/components/trip-details/tripDetailsConfig';
import styles from '../ModalForm.module.css';

interface AddQuotationModalProps {
  isOpen: boolean;
  customerId: number;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddQuotationModal({ isOpen, customerName, ...props }: AddQuotationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={props.onClose}
      title="Add quotation"
      subtitle={customerName ? `For ${customerName}` : undefined}
      maxWidth={760}
    >
      <AddQuotationForm {...props} />
    </Modal>
  );
}

function AddQuotationForm({ customerId, onClose, onSuccess }: Omit<AddQuotationModalProps, 'isOpen' | 'customerName'>) {
  const [type, setType] = useState<QuotationType>('air');
  const [details, setDetails] = useState(() => defaultTripDetails('air', 'quotation'));
  const [assignTo, setAssignTo] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleTypeChange = (next: QuotationType) => {
    setType(next);
    setDetails(defaultTripDetails(next, 'quotation'));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const errs = validateTripDetails(type, details);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setSubmitting(true);
    try {
      const res = await api.post(ADMIN_API.QUOTATIONS(customerId), {
        type,
        assignTo: assignTo.trim(),
        remark: remark.trim(),
        details,
      });
      showSuccess(res.message || 'Quotation created successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to create quotation.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.typeBar}>
        <Tabs options={QUOTATION_TYPES} value={type} onChange={handleTypeChange} label="Service type" size="sm" />
      </div>

      <div className={styles.body}>
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Trip details</legend>
          <TripDetailsFields
            type={type}
            context="quotation"
            values={details}
            errors={errors}
            onChange={(key, value) => {
              setDetails((prev) => ({ ...prev, [key]: value }));
              setErrors((prev) => ({ ...prev, [key]: '' }));
            }}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Follow-up</legend>
          <div className={styles.grid}>
            <div className={styles.full}>
              <InputField
                id="quotation-assign-to"
                label="Assign to"
                placeholder="e.g. John (Sales)"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
              />
            </div>
            <TextareaField
              id="quotation-remark"
              className={styles.full}
              label="Remark"
              placeholder="Any additional notes…"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </fieldset>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save quotation
        </Button>
      </ModalFooter>
    </form>
  );
}

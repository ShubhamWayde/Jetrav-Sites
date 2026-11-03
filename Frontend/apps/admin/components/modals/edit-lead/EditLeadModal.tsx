'use client';

import { useState } from 'react';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import Button from '@repo/ui/Button';
import InputField from '@repo/ui/InputField';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import SelectField from '@repo/ui/SelectField';
import { Tabs } from '@repo/ui/Tabs';
import TextareaField from '@repo/ui/TextareaField';
import { ADMIN_API } from '@/lib/constants';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { LEAD_STATUSES, LEAD_TYPES, type LeadResponse, type LeadStatus, type LeadType } from '@/app/types/lead';
import TripDetailsFields from '@/components/trip-details/TripDetailsFields';
import {
  defaultTripDetails,
  tripDetailsFrom,
  validateTripDetails,
} from '@/components/trip-details/tripDetailsConfig';
import styles from '../ModalForm.module.css';

interface EditLeadModalProps {
  isOpen: boolean;
  lead: LeadResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLeadModal({ isOpen, lead, onClose, onSuccess }: EditLeadModalProps) {
  return (
    <Modal
      isOpen={isOpen && !!lead}
      onClose={onClose}
      title="Edit lead"
      subtitle={lead ? `Lead for ${lead.customerName}` : undefined}
      maxWidth={760}
    >
      {/* Keyed by id so switching leads always starts from that lead's data */}
      {lead && <EditLeadForm key={lead.id} lead={lead} onClose={onClose} onSuccess={onSuccess} />}
    </Modal>
  );
}

function EditLeadForm({ lead, onClose, onSuccess }: Omit<EditLeadModalProps, 'isOpen'> & { lead: LeadResponse }) {
  const [type, setType] = useState<LeadType>(lead.type);
  const [details, setDetails] = useState(() => tripDetailsFrom(lead.type, 'lead', lead.details));
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [assignTo, setAssignTo] = useState(lead.assignTo ?? '');
  const [remark, setRemark] = useState(lead.remark ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleTypeChange = (next: LeadType) => {
    setType(next);
    // Switching back to the original service restores the stored details
    setDetails(next === lead.type ? tripDetailsFrom(next, 'lead', lead.details) : defaultTripDetails(next, 'lead'));
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
      const res = await api.put(ADMIN_API.LEAD_BY_ID(lead.id), {
        type,
        status,
        details,
        assignTo: assignTo.trim(),
        remark: remark.trim(),
      });
      showSuccess(res.message || 'Lead updated successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to update lead.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.typeBar}>
        <Tabs options={LEAD_TYPES} value={type} onChange={handleTypeChange} label="Service type" size="sm" />
      </div>

      <div className={styles.body}>
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Trip details</legend>
          <TripDetailsFields
            type={type}
            context="lead"
            values={details}
            errors={errors}
            onChange={(key, value) => {
              setDetails((prev) => ({ ...prev, [key]: value }));
              setErrors((prev) => ({ ...prev, [key]: '' }));
            }}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Pipeline</legend>
          <div className={styles.grid}>
            <SelectField
              id="edit-lead-status"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              options={LEAD_STATUSES}
            />
            <InputField
              id="edit-lead-assign-to"
              label="Assign to"
              placeholder="e.g. John (Sales)"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
            />
            <TextareaField
              id="edit-lead-remark"
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
          Save changes
        </Button>
      </ModalFooter>
    </form>
  );
}

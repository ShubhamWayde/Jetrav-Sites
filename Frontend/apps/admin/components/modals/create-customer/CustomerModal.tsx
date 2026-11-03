'use client';

import { useState } from 'react';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import Button from '@repo/ui/Button';
import { EmptyState } from '@repo/ui/EmptyState';
import InputField from '@repo/ui/InputField';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import SelectField from '@repo/ui/SelectField';
import Spinner from '@repo/ui/Spinner';
import { ADMIN_API } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import { useApiQuery } from '@/lib/useApiQuery';
import { EMAIL_RE, MOBILE_RE, hasErrors, sanitizeMobile, type FieldErrors } from '@/lib/validation';
import type { CustomerFormValues, CustomerResponse } from '@/app/types/customer';
import styles from '../ModalForm.module.css';

const PLAN_TYPES = ['Silver', 'Gold', 'Platinum', 'Diamond'].map((p) => ({ value: p, label: p }));

const EMPTY: CustomerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
  planType: 'Silver',
  totalTrips: '0',
  totalStays: '0',
  reference: '',
};

function toFormValues(c: CustomerResponse): CustomerFormValues {
  return {
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email ?? '',
    mobileNumber: c.mobileNumber,
    planType: c.planType || 'Silver',
    totalTrips: String(c.totalTrips ?? 0),
    totalStays: String(c.totalStays ?? 0),
    reference: c.reference ?? '',
  };
}

interface CustomerModalProps {
  isOpen: boolean;
  /** undefined = create mode, number = edit mode */
  customerId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomerModal({ isOpen, customerId, onClose, onSuccess }: CustomerModalProps) {
  const isEdit = customerId !== undefined;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit customer' : 'Add customer'} maxWidth={600}>
      {isEdit ? (
        <EditCustomer key={customerId} customerId={customerId} onClose={onClose} onSuccess={onSuccess} />
      ) : (
        <CustomerForm initial={EMPTY} onClose={onClose} onSuccess={onSuccess} />
      )}
    </Modal>
  );
}

// ── Edit: load once per customer, then hand the values to the form ───────────
// The form owns its state from then on, so nothing can refetch over edits.

function EditCustomer({ customerId, onClose, onSuccess }: { customerId: number; onClose: () => void; onSuccess: () => void }) {
  const { data, loading, error, reload } = useApiQuery<CustomerResponse>(
    ADMIN_API.CUSTOMER_BY_ID(customerId),
    'Failed to load customer data.',
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading customer" /> Loading customer…
      </div>
    );
  }
  if (error || !data) {
    return (
      <EmptyState
        variant="error"
        title="Couldn't load this customer"
        description={error || 'The customer was not found.'}
        action={<Button variant="secondary" size="sm" onClick={reload}>Try again</Button>}
      />
    );
  }
  return (
    <CustomerForm
      initial={toFormValues(data)}
      customerId={customerId}
      jetcoins={data.jetcoins}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

// ── Form ─────────────────────────────────────────────────────────────────────

interface CustomerFormProps {
  initial: CustomerFormValues;
  customerId?: number;
  /** Shown read-only: Jetcoins are earned, not edited by admins. */
  jetcoins?: number;
  onClose: () => void;
  onSuccess: () => void;
}

function CustomerForm({ initial, customerId, jetcoins, onClose, onSuccess }: CustomerFormProps) {
  const isEdit = customerId !== undefined;
  const [form, setForm] = useState<CustomerFormValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof CustomerFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = field === 'mobileNumber' ? sanitizeMobile(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!MOBILE_RE.test(form.mobileNumber)) errs.mobileNumber = 'Enter a valid 10-digit mobile number.';
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (!form.planType) errs.planType = 'Plan type is required.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const errs = validate();
    setErrors(errs);
    if (hasErrors(errs)) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      mobileNumber: form.mobileNumber,
      planType: form.planType,
      totalTrips: Math.max(0, parseInt(form.totalTrips, 10) || 0),
      totalStays: Math.max(0, parseInt(form.totalStays, 10) || 0),
      reference: form.reference.trim(),
    };

    setSubmitting(true);
    try {
      const res = isEdit
        ? await api.put(ADMIN_API.CUSTOMER_BY_ID(customerId), payload)
        : await api.post(ADMIN_API.CUSTOMERS, payload);
      showSuccess(res.message || `Customer ${isEdit ? 'updated' : 'created'} successfully.`);
      onSuccess();
      onClose();
    } catch (err) {
      showError(getErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} customer.`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.body}>
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Contact</legend>
          <div className={styles.grid}>
            <InputField
              label="First name"
              name="firstName"
              required
              autoComplete="off"
              value={form.firstName}
              onChange={set('firstName')}
              error={errors.firstName}
            />
            <InputField
              label="Last name"
              name="lastName"
              required
              autoComplete="off"
              value={form.lastName}
              onChange={set('lastName')}
              error={errors.lastName}
            />
            <InputField
              label="Mobile number"
              name="mobileNumber"
              type="tel"
              inputMode="numeric"
              required
              autoComplete="off"
              placeholder="9876543210"
              value={form.mobileNumber}
              onChange={set('mobileNumber')}
              error={errors.mobileNumber}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="name@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />
            <div className={styles.full}>
              <InputField
                label="Reference"
                name="reference"
                placeholder="Referred by"
                value={form.reference}
                onChange={set('reference')}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Membership</legend>
          <div className={styles.grid}>
            <SelectField
              label="Plan type"
              name="planType"
              required
              value={form.planType}
              onChange={set('planType')}
              error={errors.planType}
              options={PLAN_TYPES}
            />
            {isEdit && (
              <InputField
                label="Jetcoins"
                name="jetcoins"
                value={formatNumber(jetcoins)}
                readOnly
                hint="Earned by the customer; not editable."
              />
            )}
            <InputField
              label="Total trips"
              name="totalTrips"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.totalTrips}
              onChange={set('totalTrips')}
            />
            <InputField
              label="Total stays"
              name="totalStays"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.totalStays}
              onChange={set('totalStays')}
            />
          </div>
        </fieldset>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Save changes' : 'Add customer'}
        </Button>
      </ModalFooter>
    </form>
  );
}

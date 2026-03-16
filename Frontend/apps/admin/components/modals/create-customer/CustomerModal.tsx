'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '@repo/ui/Button';
import InputField from '@repo/ui/InputField';
import SelectField from '@repo/ui/SelectField';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import Spinner from '@repo/ui/Spinner';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import styles from './CustomerModal.module.css';
import { CustomerFormValues, CustomerResponse } from '@/app/types/customer';

type FieldErrors = Partial<CustomerFormValues>;

const PLAN_TYPES  = ['Silver', 'Gold', 'Platinum', 'Diamond'];
const MOBILE_RE   = /^[6-9]\d{9}$/;

const EMPTY: CustomerFormValues = {
  firstName:    '',
  lastName:     '',
  email:        '',
  mobileNumber: '',
  planType:     'Silver',
  jetcoins:     '0',
  totalTrips:   '0',
  totalStays:   '0',
  reference:    '',
};

interface CustomerModalProps {
  isOpen:      boolean;
  customerId?: number;   // undefined = create mode, number = edit mode
  onClose:     () => void;
  onSuccess:   () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomerModal({
  isOpen,
  customerId,
  onClose,
  onSuccess,
}: CustomerModalProps) {
  const isEdit = customerId !== undefined;

  const [form, setForm]               = useState<CustomerFormValues>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(false);

  // ── Real-time form validity (enables / disables the Save button) ──────────
  // All required fields must be non-empty and the mobile must be a valid
  // 10-digit Indian number. Optional fields (email, reference, etc.) are not
  // included here — they are only validated on submit.
  const isFormValid = useMemo(() => (
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    MOBILE_RE.test(form.mobileNumber.trim()) &&
    Boolean(form.planType)
  ), [form.firstName, form.lastName, form.mobileNumber, form.planType]);

  // ── Load existing data in edit mode ───────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    if (!isEdit) {
      setForm(EMPTY);
      setFieldErrors({});
      return;
    }

    setFetching(true);
    api.get<CustomerResponse>(ADMIN_API.CUSTOMER_BY_ID(customerId))
      .then((res) => {
        const d = res.data!;
        setForm({
          firstName:    d.firstName,
          lastName:     d.lastName,
          email:        d.email        ?? '',
          mobileNumber: d.mobileNumber,
          planType:     d.planType,
          jetcoins:     String(d.jetcoins),
          totalTrips:   String(d.totalTrips),
          totalStays:   String(d.totalStays),
          reference:    d.reference    ?? '',
        });
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to load customer data.');
        onClose();
      })
      .finally(() => setFetching(false));
  }, [isOpen, isEdit, customerId, onClose]);

  // ── Close on Escape ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Field helpers ─────────────────────────────────────────────────────────

  const handleChange =
    (field: keyof CustomerFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (!form.firstName.trim())
      errs.firstName = 'First name is required.';
    if (!form.lastName.trim())
      errs.lastName = 'Last name is required.';
    if (!MOBILE_RE.test(form.mobileNumber.trim()))
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = 'Enter a valid email address.';
    if (!form.planType)
      errs.planType = 'Plan type is required.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const payload = {
      firstName:    form.firstName.trim(),
      lastName:     form.lastName.trim(),
      email:        form.email.trim(),
      mobileNumber: form.mobileNumber.trim(),
      planType:     form.planType,
      jetcoins:     parseFloat(form.jetcoins)  || 0,
      totalTrips:   parseInt(form.totalTrips)  || 0,
      totalStays:   parseInt(form.totalStays)  || 0,
      reference:    form.reference.trim(),
    };

    try {
      let res;
      if (isEdit) {
        res = await api.put(ADMIN_API.CUSTOMER_BY_ID(customerId), payload);
        toast.success(res.message ?? 'Customer updated successfully.');
      } else {
        res = await api.post(ADMIN_API.CUSTOMERS, payload);
        toast.success(res.message ?? 'Customer created successfully.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'create'} customer.`
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Add Customer'} maxWidth={560}>
      {/* Body */}
      {fetching ? (
        <div className={styles.loading}>
          <Spinner />
          Loading customer data…
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.grid}>
            <InputField
              label="First Name"
              name="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange('firstName')}
              error={fieldErrors.firstName}
              required
              autoComplete="given-name"
            />
            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange('lastName')}
              error={fieldErrors.lastName}
              required
              autoComplete="family-name"
            />
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              type="tel"
              placeholder="9876543210"
              value={form.mobileNumber}
              onChange={handleChange('mobileNumber')}
              error={fieldErrors.mobileNumber}
              required
              autoComplete="tel"
              maxLength={10}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={fieldErrors.email}
              autoComplete="email"
            />

            <SelectField
              label="Plan Type"
              required
              value={form.planType}
              onChange={handleChange('planType')}
              error={fieldErrors.planType}
              options={PLAN_TYPES.map((p) => ({ value: p, label: p }))}
            />

            <InputField
              label="Reference"
              name="reference"
              placeholder="Referred by"
              value={form.reference}
              onChange={handleChange('reference')}
            />
            <InputField
              label="Jetcoins"
              name="jetcoins"
              type="number"
              placeholder="0"
              value={form.jetcoins}
              onChange={handleChange('jetcoins')}
              min={0}
            />
            <InputField
              label="Total Trips"
              name="totalTrips"
              type="number"
              placeholder="0"
              value={form.totalTrips}
              onChange={handleChange('totalTrips')}
              min={0}
            />
            <InputField
              label="Total Stays"
              name="totalStays"
              type="number"
              placeholder="0"
              value={form.totalStays}
              onChange={handleChange('totalStays')}
              min={0}
            />
          </div>

          {/* Footer */}
        <ModalFooter>
            <Button title="Cancel" className='btn-md' variant="secondary" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button title="Save Customer" className='btn-md' type="submit" loading={loading} disabled={!isFormValid || loading}>
              {isEdit ? 'Update Customer' : 'Save Customer'}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}

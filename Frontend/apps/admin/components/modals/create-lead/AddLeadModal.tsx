'use client';

import { useMemo, useState } from 'react';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import Button from '@repo/ui/Button';
import InputField from '@repo/ui/InputField';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import SelectField from '@repo/ui/SelectField';
import Spinner from '@repo/ui/Spinner';
import { Tabs } from '@repo/ui/Tabs';
import TextareaField from '@repo/ui/TextareaField';
import { ADMIN_API } from '@/lib/constants';
import { useApiQuery } from '@/lib/useApiQuery';
import { EMAIL_RE, MOBILE_RE, hasErrors, sanitizeMobile, type FieldErrors } from '@/lib/validation';
import type { CustomerResponse } from '@/app/types/customer';
import { LEAD_STATUSES, LEAD_TYPES, type LeadStatus, type LeadType } from '@/app/types/lead';
import TripDetailsFields from '@/components/trip-details/TripDetailsFields';
import { defaultTripDetails, validateTripDetails } from '@/components/trip-details/tripDetailsConfig';
import styles from '../ModalForm.module.css';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CustomerMode = 'existing' | 'new';

const CUSTOMER_MODES: { value: CustomerMode; label: string }[] = [
  { value: 'existing', label: 'Existing customer' },
  { value: 'new', label: 'New customer' },
];

const EMPTY_NEW_CUSTOMER = { firstName: '', lastName: '', mobileNumber: '', email: '', reference: '' };

function matchesSearch(customer: CustomerResponse, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    customer.fullName.toLowerCase().includes(q) ||
    customer.mobileNumber.includes(q) ||
    (customer.email ?? '').toLowerCase().includes(q)
  );
}

// ── Dialog wrapper: the form only mounts while open, so every open starts fresh ─

export default function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add lead" subtitle="Capture a new enquiry" maxWidth={760}>
      <AddLeadForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

function AddLeadForm({ onClose, onSuccess }: Omit<AddLeadModalProps, 'isOpen'>) {
  // ── Customer ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<CustomerMode>('existing');
  const customersQuery = useApiQuery<CustomerResponse[]>(ADMIN_API.CUSTOMERS, 'Failed to load customers.');
  const [customerSearch, setCustomerSearch] = useState('');
  // No default: the admin must pick a customer explicitly
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState(EMPTY_NEW_CUSTOMER);

  // ── Lead ──────────────────────────────────────────────────────────────────
  const [type, setType] = useState<LeadType>('air');
  const [details, setDetails] = useState(() => defaultTripDetails('air', 'lead'));
  const [status, setStatus] = useState<LeadStatus>('quotation');
  const [assignTo, setAssignTo] = useState('');
  const [remark, setRemark] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const customers = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);
  const filteredCustomers = useMemo(
    () => customers.filter((c) => matchesSearch(c, customerSearch)),
    [customers, customerSearch],
  );

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));

  const handleSearch = (value: string) => {
    setCustomerSearch(value);
    // Never keep a selection the admin can no longer see in the list
    if (customerId !== null && !customers.some((c) => c.id === customerId && matchesSearch(c, value))) {
      setCustomerId(null);
    }
  };

  const handleTypeChange = (next: LeadType) => {
    setType(next);
    setDetails(defaultTripDetails(next, 'lead'));
    setErrors({});
  };

  const handleNewCustomer = (key: keyof typeof EMPTY_NEW_CUSTOMER, value: string) => {
    setNewCustomer((prev) => ({ ...prev, [key]: key === 'mobileNumber' ? sanitizeMobile(value) : value }));
    clearError(key);
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): FieldErrors => {
    const errs: FieldErrors = { ...validateTripDetails(type, details) };
    if (mode === 'existing') {
      if (customerId === null) errs.customerId = 'Select a customer.';
    } else {
      if (!newCustomer.firstName.trim()) errs.firstName = 'First name is required.';
      if (!newCustomer.lastName.trim()) errs.lastName = 'Last name is required.';
      if (!MOBILE_RE.test(newCustomer.mobileNumber)) errs.mobileNumber = 'Enter a valid 10-digit mobile number.';
      if (newCustomer.email.trim() && !EMAIL_RE.test(newCustomer.email.trim()))
        errs.email = 'Enter a valid email address.';
    }
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const errs = validate();
    setErrors(errs);
    if (hasErrors(errs)) return;

    const customer =
      mode === 'existing'
        ? { existingCustomerId: customerId }
        : {
            newCustomer: {
              firstName: newCustomer.firstName.trim(),
              lastName: newCustomer.lastName.trim(),
              mobileNumber: newCustomer.mobileNumber,
              email: newCustomer.email.trim(),
              reference: newCustomer.reference.trim(),
            },
          };

    setSubmitting(true);
    try {
      const res = await api.post(ADMIN_API.LEADS, {
        ...customer,
        type,
        status,
        details,
        assignTo: assignTo.trim(),
        remark: remark.trim(),
      });
      showSuccess(res.message || 'Lead created successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to create lead.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderExistingCustomer = () => {
    if (customersQuery.loading) {
      return (
        <div className={styles.loading}>
          <Spinner label="Loading customers" /> Loading customers…
        </div>
      );
    }
    if (customersQuery.error) {
      return (
        <div className={styles.grid}>
          <p className={`${styles.note} ${styles.full}`} role="alert">
            {customersQuery.error}{' '}
            <Button variant="ghost" size="sm" onClick={customersQuery.reload}>
              Try again
            </Button>
          </p>
        </div>
      );
    }
    return (
      <div className={styles.grid}>
        <InputField
          id="lead-customer-search"
          label="Search customers"
          type="search"
          placeholder="Name, mobile or email"
          value={customerSearch}
          onChange={(e) => handleSearch(e.target.value)}
          hint={`${filteredCustomers.length} of ${customers.length} customers`}
        />
        <SelectField
          id="lead-customer"
          label="Customer"
          required
          placeholder={filteredCustomers.length ? 'Select a customer' : 'No matching customers'}
          value={customerId === null ? '' : String(customerId)}
          onChange={(e) => {
            setCustomerId(e.target.value ? Number(e.target.value) : null);
            clearError('customerId');
          }}
          error={errors.customerId}
          options={filteredCustomers.map((c) => ({
            value: String(c.id),
            label: `${c.fullName} · ${c.mobileNumber}`,
          }))}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.typeBar}>
        <Tabs options={LEAD_TYPES} value={type} onChange={handleTypeChange} label="Service type" size="sm" />
      </div>

      <div className={styles.body}>
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Customer</legend>
          <Tabs
            options={CUSTOMER_MODES}
            value={mode}
            onChange={(next) => {
              setMode(next);
              setErrors({});
            }}
            label="Customer source"
            size="sm"
          />

          {mode === 'existing' ? (
            renderExistingCustomer()
          ) : (
            <div className={styles.grid}>
              <InputField
                id="lead-first-name"
                label="First name"
                required
                autoComplete="off"
                value={newCustomer.firstName}
                onChange={(e) => handleNewCustomer('firstName', e.target.value)}
                error={errors.firstName}
              />
              <InputField
                id="lead-last-name"
                label="Last name"
                required
                autoComplete="off"
                value={newCustomer.lastName}
                onChange={(e) => handleNewCustomer('lastName', e.target.value)}
                error={errors.lastName}
              />
              <InputField
                id="lead-mobile"
                label="Mobile number"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                placeholder="9876543210"
                value={newCustomer.mobileNumber}
                onChange={(e) => handleNewCustomer('mobileNumber', e.target.value)}
                error={errors.mobileNumber}
              />
              <InputField
                id="lead-email"
                label="Email"
                type="email"
                autoComplete="off"
                placeholder="name@example.com"
                value={newCustomer.email}
                onChange={(e) => handleNewCustomer('email', e.target.value)}
                error={errors.email}
              />
              <div className={styles.full}>
                <InputField
                  id="lead-reference"
                  label="Reference"
                  placeholder="e.g. Agent, walk-in"
                  value={newCustomer.reference}
                  onChange={(e) => handleNewCustomer('reference', e.target.value)}
                />
              </div>
            </div>
          )}
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Trip details</legend>
          <TripDetailsFields
            type={type}
            context="lead"
            values={details}
            errors={errors}
            onChange={(key, value) => {
              setDetails((prev) => ({ ...prev, [key]: value }));
              clearError(key);
            }}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>Pipeline</legend>
          <div className={styles.grid}>
            <SelectField
              id="lead-status"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              options={LEAD_STATUSES}
            />
            <InputField
              id="lead-assign-to"
              label="Assign to"
              placeholder="e.g. John (Sales)"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
            />
            <TextareaField
              id="lead-remark"
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
          Save lead
        </Button>
      </ModalFooter>
    </form>
  );
}

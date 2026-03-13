'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import { CustomerResponse } from '@/app/types/customer';
import {
  LEAD_DEFAULT_DETAILS,
  LEAD_STATUSES,
  LEAD_TYPES,
  LeadDetails,
  LeadStatus,
  LeadType,
} from '@/app/types/lead';
import styles from './AddLeadModal.module.css';

// ── Shared field sub-components ───────────────────────────────────────────────

interface FieldProps {
  label:        string;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?:        string;
  placeholder?: string;
  disabled?:    boolean;
}

function Field({ label, value, onChange, type = 'text', placeholder, disabled }: FieldProps) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={`${styles.input} ${disabled ? styles.inputDisabled : ''}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={disabled}
      />
    </div>
  );
}

interface SelectFieldProps {
  label:    string;
  value:    string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options:  { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <select className={styles.select} value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function countOptions(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), label: String(i) }));
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AddLeadModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {

  // ── Customer mode ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  // Existing customer state
  const [customers, setCustomers]             = useState<CustomerResponse[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch]   = useState('');
  const [existingCustomerId, setExistingCustomerId] = useState<number>(0);

  // New customer state
  const [newFirstName, setNewFirstName]   = useState('');
  const [newLastName, setNewLastName]     = useState('');
  const [newGender, setNewGender]         = useState('Male');
  const [newMobile, setNewMobile]         = useState('');
  const [newEmail, setNewEmail]           = useState('');
  const [newReference, setNewReference]   = useState('');

  // ── Lead fields ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState<LeadType>('air');
  const [details, setDetails]       = useState<LeadDetails>({ ...LEAD_DEFAULT_DETAILS.air });
  const [status, setStatus]         = useState<LeadStatus>('quotation');
  const [assignTo, setAssignTo]     = useState('');
  const [remark, setRemark]         = useState('');
  const [loading, setLoading]       = useState(false);

  // ── Reset on open ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    setMode('existing');
    setCustomerSearch('');
    setExistingCustomerId(0);
    setNewFirstName(''); setNewLastName(''); setNewGender('Male');
    setNewMobile(''); setNewEmail(''); setNewReference('');
    setActiveTab('air');
    setDetails({ ...LEAD_DEFAULT_DETAILS.air });
    setStatus('quotation');
    setAssignTo('');
    setRemark('');
  }, [isOpen]);

  // ── Fetch customers (for Existing mode) ───────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    setCustomersLoading(true);
    api.get<CustomerResponse[]>(ADMIN_API.CUSTOMERS)
      .then((res) => {
        const list = res.data ?? [];
        setCustomers(list);
        if (list.length > 0) setExistingCustomerId(list[0]?.id ?? 0);
      })
      .catch(() => toast.error('Failed to load customers.'))
      .finally(() => setCustomersLoading(false));
  }, [isOpen]);

  // ── Keyboard / scroll lock ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Tab change ────────────────────────────────────────────────────────────
  // Must be defined before the early return to satisfy Rules of Hooks.

  const handleTabChange = useCallback((tab: LeadType) => {
    setActiveTab(tab);
    setDetails({ ...LEAD_DEFAULT_DETAILS[tab] });
  }, []);

  // ── Detail field updater ──────────────────────────────────────────────────

  const handleDetailChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  if (!isOpen) return null;

  // ── Filtered customers ────────────────────────────────────────────────────

  const filteredCustomers = customerSearch.trim()
    ? customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.mobileNumber.includes(customerSearch) ||
          (c.email ?? '').toLowerCase().includes(customerSearch.toLowerCase()),
      )
    : customers;

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer selection
    if (mode === 'existing' && !existingCustomerId) {
      toast.error('Please select a customer.');
      return;
    }
    if (mode === 'new') {
      if (!newFirstName.trim() || !newLastName.trim() || !newMobile.trim()) {
        toast.error('First name, last name, and mobile number are required.');
        return;
      }
    }

    setLoading(true);
    try {
      const body =
        mode === 'existing'
          ? {
              existingCustomerId: existingCustomerId,
              type:     activeTab,
              status,
              details,
              assignTo: assignTo.trim(),
              remark:   remark.trim(),
            }
          : {
              newCustomer: {
                firstName:    newFirstName.trim(),
                lastName:     newLastName.trim(),
                gender:       newGender,
                mobileNumber: newMobile.trim(),
                email:        newEmail.trim(),
                reference:    newReference.trim(),
              },
              type:     activeTab,
              status,
              details,
              assignTo: assignTo.trim(),
              remark:   remark.trim(),
            };

      const res = await api.post(ADMIN_API.LEADS, body);
      toast.success(res.message ?? 'Lead created successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create lead.');
    } finally {
      setLoading(false);
    }
  };

  // ── Per-type dynamic fields ───────────────────────────────────────────────

  const renderTypeFields = () => {
    switch (activeTab) {
      case 'air':
        return (
          <>
            <div className={styles.row2}>
              <Field label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai (BOM)" />
              <Field label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Dubai (DXB)" />
            </div>
            <div className={styles.row2}>
              <Field label="Departure" type="date" value={details['departure'] ?? ''} onChange={handleDetailChange('departure')} />
              <Field label="Return"    type="date" value={details['return'] ?? ''}    onChange={handleDetailChange('return')} />
            </div>
            <div className={styles.row3}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
              <SelectField label="Infant"   value={details['infant'] ?? '0'}   onChange={handleDetailChange('infant')}   options={countOptions(5)} />
            </div>
            <div className={styles.row1}>
              <Field label="SSR (Special Service Request)" value={details['ssr'] ?? ''} onChange={handleDetailChange('ssr')} placeholder="e.g. Wheelchair, Vegan meal" />
            </div>
          </>
        );

      case 'train':
        return (
          <>
            <div className={styles.row2}>
              <Field label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai" />
              <Field label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Delhi" />
            </div>
            <div className={styles.row2}>
              <Field label="Departure" type="date" value={details['departure'] ?? ''} onChange={handleDetailChange('departure')} />
              <Field label="Return"    type="date" value={details['return'] ?? ''}    onChange={handleDetailChange('return')} />
            </div>
            <div className={styles.row2}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
            </div>
          </>
        );

      case 'hotel':
        return (
          <>
            <div className={styles.row1}>
              <Field label="City" value={details['city'] ?? ''} onChange={handleDetailChange('city')} placeholder="e.g. Dubai" />
            </div>
            <div className={styles.row2}>
              <Field label="Check-In"  type="date" value={details['checkIn'] ?? ''}  onChange={handleDetailChange('checkIn')} />
              <Field label="Check-Out" type="date" value={details['checkOut'] ?? ''} onChange={handleDetailChange('checkOut')} />
            </div>
            <div className={styles.row3}>
              <SelectField label="Rooms"    value={details['rooms'] ?? '1'}    onChange={handleDetailChange('rooms')}    options={countOptions(10)} />
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
            </div>
          </>
        );

      case 'visa':
        return (
          <>
            <div className={styles.row2}>
              <Field label="Country"   value={details['country'] ?? ''}   onChange={handleDetailChange('country')}   placeholder="e.g. UAE" />
              <Field label="Visa Type" value={details['visaType'] ?? ''} onChange={handleDetailChange('visaType')} placeholder="e.g. Tourist" />
            </div>
            <div className={styles.row1}>
              <Field label="Travel Date" type="date" value={details['travelDate'] ?? ''} onChange={handleDetailChange('travelDate')} />
            </div>
            <div className={styles.row2}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
            </div>
          </>
        );

      case 'insurance':
        return (
          <>
            <div className={styles.row1}>
              <Field label="Country" value={details['country'] ?? ''} onChange={handleDetailChange('country')} placeholder="e.g. Europe" />
            </div>
            <div className={styles.row2}>
              <Field label="Start Date" type="date" value={details['startDate'] ?? ''} onChange={handleDetailChange('startDate')} />
              <Field label="End Date"   type="date" value={details['endDate'] ?? ''}   onChange={handleDetailChange('endDate')} />
            </div>
            <div className={styles.row1}>
              <SelectField label="Adults" value={details['adults'] ?? '1'} onChange={handleDetailChange('adults')} options={countOptions(10)} />
            </div>
          </>
        );

      case 'bus':
        return (
          <>
            <div className={styles.row2}>
              <Field label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai" />
              <Field label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Pune" />
            </div>
            <div className={styles.row1}>
              <Field label="Departure" type="date" value={details['departure'] ?? ''} onChange={handleDetailChange('departure')} />
            </div>
            <div className={styles.row2}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
            </div>
          </>
        );

      case 'car':
        return (
          <>
            <div className={styles.row2}>
              <Field label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai" />
              <Field label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Pune" />
            </div>
            <div className={styles.row2}>
              <Field label="Pickup Date" type="date" value={details['pickupDate'] ?? ''} onChange={handleDetailChange('pickupDate')} />
              <Field label="Drop Date"   type="date" value={details['dropDate'] ?? ''}   onChange={handleDetailChange('dropDate')} />
            </div>
            <div className={styles.row1}>
              <Field label="Car Type" value={details['carType'] ?? ''} onChange={handleDetailChange('carType')} placeholder="e.g. Sedan, SUV" />
            </div>
          </>
        );

      case 'foreign_exchange':
        return (
          <>
            <div className={styles.row2}>
              <Field label="Currency" value={details['currency'] ?? ''} onChange={handleDetailChange('currency')} placeholder="e.g. USD" />
              <Field label="Amount"   type="number" value={details['amount'] ?? ''} onChange={handleDetailChange('amount')} placeholder="0" />
            </div>
            <div className={styles.row1}>
              <Field label="Purpose" value={details['purpose'] ?? ''} onChange={handleDetailChange('purpose')} placeholder="e.g. Travel, Business" />
            </div>
          </>
        );

      case 'package':
        return (
          <>
            <div className={styles.row1}>
              <Field label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Dubai" />
            </div>
            <div className={styles.row2}>
              <Field label="Start Date" type="date" value={details['startDate'] ?? ''} onChange={handleDetailChange('startDate')} />
              <Field label="End Date"   type="date" value={details['endDate'] ?? ''}   onChange={handleDetailChange('endDate')} />
            </div>
            <div className={styles.row3}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
              <div className={styles.fieldWrap}>
                <label className={styles.fieldLabel}>Package Type</label>
                <select
                  className={styles.select}
                  value={details['packageType'] ?? 'domestic'}
                  onChange={handleDetailChange('packageType')}
                >
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add Lead</h2>
          <button className={styles.closeBtn} type="button" onClick={onClose}>Close</button>
        </div>

        {/* ── Type tab bar ─────────────────────────────────────────────── */}
        <div className={styles.tabBar}>
          {LEAD_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.tab} ${activeTab === value ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          {/* ── Customer section ─────────────────────────────────────── */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Customer</p>

            {/* Sub-tabs: Existing | New */}
            <div className={styles.subTabBar}>
              <button
                type="button"
                className={`${styles.subTab} ${mode === 'existing' ? styles.subTabActive : ''}`}
                onClick={() => setMode('existing')}
              >
                Existing Customer
              </button>
              <button
                type="button"
                className={`${styles.subTab} ${mode === 'new' ? styles.subTabActive : ''}`}
                onClick={() => setMode('new')}
              >
                New Customer
              </button>
            </div>

            {mode === 'existing' ? (
              <>
                {/* Search input */}
                <div className={styles.row1}>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Search Customer</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Search by name, mobile, or email…"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Customer select */}
                <div className={styles.row1}>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Select Customer</label>
                    {customersLoading ? (
                      <p className={styles.loadingText}>Loading customers…</p>
                    ) : filteredCustomers.length === 0 ? (
                      <p className={styles.loadingText}>No customers found.</p>
                    ) : (
                      <select
                        className={styles.select}
                        value={existingCustomerId}
                        onChange={(e) => setExistingCustomerId(Number(e.target.value))}
                      >
                        <option value={0} disabled>— Select a customer —</option>
                        {filteredCustomers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} — {c.mobileNumber}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.row2}>
                  <Field label="First Name" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="First name" />
                  <Field label="Last Name"  value={newLastName}  onChange={(e) => setNewLastName(e.target.value)}  placeholder="Last name" />
                </div>
                <div className={styles.row2}>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Gender</label>
                    <select className={styles.select} value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Field label="Mobile Number" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} placeholder="e.g. 9876543210" />
                </div>
                <div className={styles.row2}>
                  <Field label="Email"     value={newEmail}     onChange={(e) => setNewEmail(e.target.value)}     placeholder="email@example.com" />
                  <Field label="Reference" value={newReference} onChange={(e) => setNewReference(e.target.value)} placeholder="e.g. Agent / Walk-in" />
                </div>
              </>
            )}
          </div>

          {/* ── Type-specific fields ──────────────────────────────────── */}
          <div className={styles.divider} />
          {renderTypeFields()}

          {/* ── Status ───────────────────────────────────────────────── */}
          <div className={styles.row1}>
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
          </div>

          {/* ── Assign To ────────────────────────────────────────────── */}
          <div className={styles.row1}>
            <Field label="Assign To" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="e.g. John (Sales)" />
          </div>

          {/* ── Remark ───────────────────────────────────────────────── */}
          <div className={styles.row1}>
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>Remark</label>
              <textarea
                className={styles.textarea}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Any additional notes…"
                rows={3}
              />
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <div className={styles.footer}>
            <button className="btn btn-md" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary btn-md" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

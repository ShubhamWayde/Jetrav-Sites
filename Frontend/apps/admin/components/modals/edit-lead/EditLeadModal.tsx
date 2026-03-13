'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import {
  LEAD_DEFAULT_DETAILS,
  LEAD_STATUSES,
  LEAD_TYPES,
  LeadDetails,
  LeadResponse,
  LeadStatus,
  LeadType,
} from '@/app/types/lead';
import styles from './EditLeadModal.module.css';

// ── Shared field sub-components ───────────────────────────────────────────────

interface FieldProps {
  label:        string;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?:        string;
  placeholder?: string;
}

function Field({ label, value, onChange, type = 'text', placeholder }: FieldProps) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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

interface EditLeadModalProps {
  isOpen:    boolean;
  lead:      LeadResponse | null;
  onClose:   () => void;
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditLeadModal({ isOpen, lead, onClose, onSuccess }: EditLeadModalProps) {
  const [activeTab, setActiveTab] = useState<LeadType>('air');
  const [details, setDetails]     = useState<LeadDetails>({ ...LEAD_DEFAULT_DETAILS.air });
  const [status, setStatus]       = useState<LeadStatus>('quotation');
  const [assignTo, setAssignTo]   = useState('');
  const [remark, setRemark]       = useState('');
  const [loading, setLoading]     = useState(false);

  // ── Populate from lead when it changes ────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !lead) return;

    setActiveTab(lead.type);
    setStatus(lead.status);
    setAssignTo(lead.assignTo ?? '');
    setRemark(lead.remark ?? '');

    // Convert Record<string, unknown> → Record<string, string> for form state
    const converted: LeadDetails = Object.fromEntries(
      Object.entries(lead.details ?? {}).map(([k, v]) => [k, String(v ?? '')]),
    );
    // Merge with defaults to ensure all fields for the type exist
    setDetails({ ...LEAD_DEFAULT_DETAILS[lead.type], ...converted });
  }, [isOpen, lead]);

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
    if (tab === activeTab) return;          // keep existing details for same type
    setActiveTab(tab);
    setDetails({ ...LEAD_DEFAULT_DETAILS[tab] });
  }, [activeTab]);

  // ── Detail field updater ──────────────────────────────────────────────────

  const handleDetailChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  if (!isOpen || !lead) return null;

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        type:     activeTab,
        status,
        details,
        assignTo: assignTo.trim(),
        remark:   remark.trim(),
      };

      const res = await api.put(ADMIN_API.LEAD_BY_ID(lead.id), body);
      toast.success(res.message ?? 'Lead updated successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update lead.');
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
          <div>
            <h2 className={styles.title}>Edit Lead</h2>
            <p className={styles.subtitle}>{lead.customerName}</p>
          </div>
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

          {/* Type-specific fields */}
          {renderTypeFields()}

          {/* Status */}
          <div className={styles.row1}>
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
          </div>

          {/* Assign To */}
          <div className={styles.row1}>
            <Field label="Assign To" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="e.g. John (Sales)" />
          </div>

          {/* Remark */}
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

          {/* Footer */}
          <div className={styles.footer}>
            <button className="btn btn-md" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary btn-md" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

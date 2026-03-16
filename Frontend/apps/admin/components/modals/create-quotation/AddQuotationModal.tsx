'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import InputField from '@repo/ui/InputField';
import TextareaField from '@repo/ui/TextareaField';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import {
  DEFAULT_DETAILS,
  QUOTATION_TYPES,
  QuotationDetails,
  QuotationType,
} from '@/app/types/quotation';
import SelectField from '@repo/ui/SelectField';
import Button from '@repo/ui/Button';
import Modal, { ModalFooter } from '@repo/ui/Modal';
import styles from './AddQuotationModal.module.css';

function countOptions(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), label: String(i) }));
}

// ── Main component ────────────────────────────────────────────────────────────

interface AddQuotationModalProps {
  isOpen:       boolean;
  customerId:   number;
  customerName: string;
  onClose:      () => void;
  onSuccess:    () => void;
}

export default function AddQuotationModal({
  isOpen,
  customerId,
  customerName,
  onClose,
  onSuccess,
}: AddQuotationModalProps) {
  const [activeTab, setActiveTab] = useState<QuotationType>('air');
  const [details, setDetails]     = useState<QuotationDetails>({ ...DEFAULT_DETAILS.air });
  const [assignTo, setAssignTo]   = useState('');
  const [remark, setRemark]       = useState('');
  const [loading, setLoading]     = useState(false);

  // ── Reset when modal opens ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('air');
    setDetails({ ...DEFAULT_DETAILS.air });
    setAssignTo('');
    setRemark('');
  }, [isOpen]);

  // ── Tab switch ────────────────────────────────────────────────────────────

  const handleTabChange = (tab: QuotationType) => {
    setActiveTab(tab);
    setDetails({ ...DEFAULT_DETAILS[tab] });
  };

  // ── Detail field updater ──────────────────────────────────────────────────

  const handleDetailChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setDetails((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(ADMIN_API.QUOTATIONS(customerId), {
        type:     activeTab,
        assignTo: assignTo.trim(),
        remark:   remark.trim(),
        details,
      });
      toast.success(res.message ?? 'Quotation created successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create quotation.');
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
              <InputField label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai (BOM)" />
              <InputField label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Dubai (DXB)" />
            </div>
            <div className={styles.row2}>
              <InputField label="Departure" type="date" value={details['departure'] ?? ''} onChange={handleDetailChange('departure')} />
              <InputField label="Return"    type="date" value={details['return'] ?? ''}    onChange={handleDetailChange('return')} />
            </div>
            <div className={styles.row3}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
              <SelectField label="Infant"   value={details['infant'] ?? '0'}   onChange={handleDetailChange('infant')}   options={countOptions(5)} />
            </div>
          </>
        );

      case 'train':
        return (
          <>
            <div className={styles.row2}>
              <InputField label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai" />
              <InputField label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Delhi" />
            </div>
            <div className={styles.row2}>
              <InputField label="Departure" type="date" value={details['departure'] ?? ''} onChange={handleDetailChange('departure')} />
              <InputField label="Return"    type="date" value={details['return'] ?? ''}    onChange={handleDetailChange('return')} />
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
              <InputField label="City" value={details['city'] ?? ''} onChange={handleDetailChange('city')} placeholder="e.g. Dubai" />
            </div>
            <div className={styles.row2}>
              <InputField label="Check-In"  type="date" value={details['checkIn'] ?? ''}  onChange={handleDetailChange('checkIn')} />
              <InputField label="Check-Out" type="date" value={details['checkOut'] ?? ''} onChange={handleDetailChange('checkOut')} />
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
              <InputField label="Country"   value={details['country'] ?? ''}   onChange={handleDetailChange('country')}   placeholder="e.g. UAE" />
              <InputField label="Visa Type" value={details['visaType'] ?? ''} onChange={handleDetailChange('visaType')} placeholder="e.g. Tourist" />
            </div>
            <div className={styles.row1}>
              <InputField label="Travel Date" type="date" value={details['travelDate'] ?? ''} onChange={handleDetailChange('travelDate')} />
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
              <InputField label="Country" value={details['country'] ?? ''} onChange={handleDetailChange('country')} placeholder="e.g. Europe" />
            </div>
            <div className={styles.row2}>
              <InputField label="Start Date" type="date" value={details['startDate'] ?? ''} onChange={handleDetailChange('startDate')} />
              <InputField label="End Date"   type="date" value={details['endDate'] ?? ''}   onChange={handleDetailChange('endDate')} />
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
              <InputField label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai" />
              <InputField label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Pune" />
            </div>
            <div className={styles.row1}>
              <InputField label="Departure" type="date" value={details['departure'] ?? ''} onChange={handleDetailChange('departure')} />
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
              <InputField label="Source"      value={details['source'] ?? ''}      onChange={handleDetailChange('source')}      placeholder="e.g. Mumbai" />
              <InputField label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Pune" />
            </div>
            <div className={styles.row2}>
              <InputField label="Pickup Date" type="date" value={details['pickupDate'] ?? ''} onChange={handleDetailChange('pickupDate')} />
              <InputField label="Drop Date"   type="date" value={details['dropDate'] ?? ''}   onChange={handleDetailChange('dropDate')} />
            </div>
            <div className={styles.row1}>
              <InputField label="Car Type" value={details['carType'] ?? ''} onChange={handleDetailChange('carType')} placeholder="e.g. Sedan, SUV" />
            </div>
          </>
        );

      case 'foreign_exchange':
        return (
          <>
            <div className={styles.row2}>
              <InputField label="Currency" value={details['currency'] ?? ''} onChange={handleDetailChange('currency')} placeholder="e.g. USD" />
              <InputField label="Amount"   type="number" value={details['amount'] ?? ''} onChange={handleDetailChange('amount')} placeholder="0" />
            </div>
            <div className={styles.row1}>
              <InputField label="Purpose" value={details['purpose'] ?? ''} onChange={handleDetailChange('purpose')} placeholder="e.g. Travel, Business" />
            </div>
          </>
        );

      case 'package':
        return (
          <>
            <div className={styles.row1}>
              <InputField label="Destination" value={details['destination'] ?? ''} onChange={handleDetailChange('destination')} placeholder="e.g. Dubai" />
            </div>
            <div className={styles.row2}>
              <InputField label="Start Date" type="date" value={details['startDate'] ?? ''} onChange={handleDetailChange('startDate')} />
              <InputField label="End Date"   type="date" value={details['endDate'] ?? ''}   onChange={handleDetailChange('endDate')} />
            </div>
            <div className={styles.row3}>
              <SelectField label="Adults"   value={details['adults'] ?? '1'}   onChange={handleDetailChange('adults')}   options={countOptions(10)} />
              <SelectField label="Children" value={details['children'] ?? '0'} onChange={handleDetailChange('children')} options={countOptions(10)} />
              <SelectField
                label="Package Type"
                value={details['packageType'] ?? 'domestic'}
                onChange={handleDetailChange('packageType')}
                options={[
                  { value: 'domestic', label: 'Domestic' },
                  { value: 'international', label: 'International' },
                ]}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Quotation" maxWidth={720}>
      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className={styles.tabBar}>
        {QUOTATION_TYPES.map(({ value, label }) => (
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
        <div className={styles.formWrapper}>
          {/* Customer name (read-only) */}
          <div className={styles.row1}>
            <InputField
              label="Customer Name"
              value={customerName}
              onChange={() => {}}
              disabled
            />
          </div>

          {/* Type-specific dynamic fields */}
          {renderTypeFields()}

          {/* Assign To */}
          <div className={styles.row1}>
            <InputField
              label="Assign To"
              type="text"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              placeholder="e.g. John (Sales)"
            />
          </div>

          {/* Remark */}
          <div className={styles.row1}>
            <TextareaField
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Any additional notes…"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button title="Cancel" className='btn-md' variant="secondary" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button title="Save Quotation" className='btn-md' type="submit" loading={loading}>Save</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

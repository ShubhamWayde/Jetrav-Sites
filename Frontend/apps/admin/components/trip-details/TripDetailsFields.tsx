'use client';

import InputField from '@repo/ui/InputField';
import SelectField from '@repo/ui/SelectField';
import type { LeadType } from '@/app/types/lead';
import { getTripFields, type TripDetails, type TripDetailsContext, type TripField } from './tripDetailsConfig';
import styles from './TripDetailsFields.module.css';

interface TripDetailsFieldsProps {
  type: LeadType;
  context: TripDetailsContext;
  values: TripDetails;
  onChange: (key: string, value: string) => void;
  /** Errors keyed by detail key (e.g. from `validateTripDetails`). */
  errors?: Record<string, string>;
  disabled?: boolean;
}

const countOptions = (max: number) =>
  Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), label: String(i) }));

/** The service-specific fields of a lead or quotation, rendered from config. */
export default function TripDetailsFields({
  type,
  context,
  values,
  onChange,
  errors = {},
  disabled,
}: TripDetailsFieldsProps) {
  const renderField = (field: TripField) => {
    const common = {
      // Prefix keeps ids unique when several forms are mounted
      id: `trip-${context}-${field.key}`,
      label: field.label,
      value: values[field.key] ?? '',
      error: errors[field.key],
      disabled,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        onChange(field.key, e.target.value),
    };

    switch (field.kind) {
      case 'count':
        return <SelectField {...common} options={countOptions(field.max)} />;
      case 'select':
        return <SelectField {...common} placeholder="Not set" options={field.options} />;
      case 'date':
        return <InputField {...common} type="date" />;
      case 'number':
        return <InputField {...common} type="number" inputMode="decimal" min={0} placeholder={field.placeholder} />;
      default:
        return <InputField {...common} placeholder={field.placeholder} />;
    }
  };

  return (
    <div className={styles.grid}>
      {getTripFields(type, context).map((field) => (
        <div key={field.key} className={`${styles.cell} ${styles[`span${field.span}`]}`} data-kind={field.kind}>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}

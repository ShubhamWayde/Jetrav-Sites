import type { LeadType } from '@/app/types/lead';

/**
 * Single source of truth for the per-service "details" JSON shared by leads and
 * quotations: which fields each service has, their defaults, and which date
 * pairs must be in order. The backend stores `details` as free-form JSONB.
 */

export type TripDetails = Record<string, string>;

/** Where the fields are rendered — a few fields only make sense on leads. */
export type TripDetailsContext = 'lead' | 'quotation';

interface BaseField {
  key: string;
  label: string;
  /** Grid columns the field spans (out of 6) on wide screens. */
  span: 2 | 3 | 6;
  leadOnly?: boolean;
}

export type TripField =
  | (BaseField & { kind: 'text'; placeholder?: string })
  | (BaseField & { kind: 'number'; placeholder?: string })
  | (BaseField & { kind: 'date' })
  | (BaseField & { kind: 'count'; max: number })
  | (BaseField & { kind: 'select'; options: { value: string; label: string }[] });

/** `end` may not be before `start` (both `YYYY-MM-DD`). */
export interface DateRule {
  start: string;
  end: string;
  message: string;
}

interface TripTypeConfig {
  fields: TripField[];
  dateRule?: DateRule;
}

export const TRIP_SCOPE_OPTIONS = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'international', label: 'International' },
];

// ── Reusable field builders ───────────────────────────────────────────────────

const text = (key: string, label: string, placeholder?: string, span: BaseField['span'] = 3): TripField =>
  ({ kind: 'text', key, label, placeholder, span });
const date = (key: string, label: string, span: BaseField['span'] = 3): TripField =>
  ({ kind: 'date', key, label, span });
const count = (key: string, label: string, max = 10, span: BaseField['span'] = 2): TripField =>
  ({ kind: 'count', key, label, max, span });
const scope = (key: string, label: string, span: BaseField['span'] = 2): TripField =>
  ({ kind: 'select', key, label, options: TRIP_SCOPE_OPTIONS, span });

// ── Per-service configuration ────────────────────────────────────────────────

export const TRIP_TYPE_CONFIG: Record<LeadType, TripTypeConfig> = {
  air: {
    fields: [
      text('source', 'Source', 'e.g. Mumbai (BOM)'),
      text('destination', 'Destination', 'e.g. Dubai (DXB)'),
      date('departure', 'Departure'),
      date('return', 'Return'),
      count('adults', 'Adults'),
      count('children', 'Children'),
      count('infant', 'Infant', 5),
      scope('tripType', 'Trip type', 6),
      { ...text('ssr', 'SSR (special service request)', 'e.g. Wheelchair, vegan meal', 6), leadOnly: true },
    ],
    dateRule: { start: 'departure', end: 'return', message: 'Return must be on or after departure.' },
  },
  train: {
    fields: [
      text('source', 'Source', 'e.g. Mumbai'),
      text('destination', 'Destination', 'e.g. Delhi'),
      date('departure', 'Departure'),
      date('return', 'Return'),
      count('adults', 'Adults', 10, 3),
      count('children', 'Children', 10, 3),
    ],
    dateRule: { start: 'departure', end: 'return', message: 'Return must be on or after departure.' },
  },
  hotel: {
    fields: [
      text('city', 'City', 'e.g. Dubai'),
      scope('tripType', 'Trip type', 3),
      date('checkIn', 'Check-in'),
      date('checkOut', 'Check-out'),
      count('rooms', 'Rooms'),
      count('adults', 'Adults'),
      count('children', 'Children'),
    ],
    dateRule: { start: 'checkIn', end: 'checkOut', message: 'Check-out must be on or after check-in.' },
  },
  visa: {
    fields: [
      text('country', 'Country', 'e.g. UAE'),
      text('visaType', 'Visa type', 'e.g. Tourist'),
      date('travelDate', 'Travel date', 6),
      count('adults', 'Adults', 10, 3),
      count('children', 'Children', 10, 3),
    ],
  },
  insurance: {
    fields: [
      text('country', 'Country', 'e.g. Europe', 6),
      date('startDate', 'Start date', 2),
      date('endDate', 'End date', 2),
      count('adults', 'Adults'),
    ],
    dateRule: { start: 'startDate', end: 'endDate', message: 'End date must be on or after the start date.' },
  },
  bus: {
    fields: [
      text('source', 'Source', 'e.g. Mumbai'),
      text('destination', 'Destination', 'e.g. Pune'),
      date('departure', 'Departure', 2),
      count('adults', 'Adults'),
      count('children', 'Children'),
    ],
  },
  car: {
    fields: [
      text('source', 'Source', 'e.g. Mumbai'),
      text('destination', 'Destination', 'e.g. Pune'),
      date('pickupDate', 'Pickup date', 2),
      date('dropDate', 'Drop date', 2),
      text('carType', 'Car type', 'e.g. Sedan, SUV', 2),
    ],
    dateRule: { start: 'pickupDate', end: 'dropDate', message: 'Drop date must be on or after the pickup date.' },
  },
  foreign_exchange: {
    fields: [
      text('currency', 'Currency', 'e.g. USD', 2),
      { kind: 'number', key: 'amount', label: 'Amount', placeholder: '0', span: 2 },
      text('purpose', 'Purpose', 'e.g. Travel, business', 2),
    ],
  },
  package: {
    fields: [
      text('destination', 'Destination', 'e.g. Dubai'),
      scope('packageType', 'Package type', 3),
      date('startDate', 'Start date'),
      date('endDate', 'End date'),
      count('adults', 'Adults', 10, 3),
      count('children', 'Children', 10, 3),
    ],
    dateRule: { start: 'startDate', end: 'endDate', message: 'End date must be on or after the start date.' },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTripFields(type: LeadType, context: TripDetailsContext): TripField[] {
  return TRIP_TYPE_CONFIG[type].fields.filter((f) => context === 'lead' || !f.leadOnly);
}

function defaultValue(field: TripField): string {
  if (field.kind === 'count') return field.key === 'adults' || field.key === 'rooms' ? '1' : '0';
  if (field.kind === 'select') return field.options[0]?.value ?? '';
  return '';
}

/** Fresh form state for a service. */
export function defaultTripDetails(type: LeadType, context: TripDetailsContext): TripDetails {
  return Object.fromEntries(getTripFields(type, context).map((f) => [f.key, defaultValue(f)]));
}

/** Form state for an existing record: stored values win over defaults. */
export function tripDetailsFrom(
  type: LeadType,
  context: TripDetailsContext,
  stored: Record<string, unknown> | null | undefined,
): TripDetails {
  const values: TripDetails = { ...defaultTripDetails(type, context) };
  // Don't guess a choice the record never had (e.g. domestic vs international)
  for (const field of getTripFields(type, context)) {
    if (field.kind === 'select' && !(stored && field.key in stored)) values[field.key] = '';
  }
  for (const [key, value] of Object.entries(stored ?? {})) {
    if (value !== null && value !== undefined) values[key] = String(value);
  }
  return values;
}

/** Field-level errors (keyed by detail key) for invalid date ranges. */
export function validateTripDetails(type: LeadType, details: TripDetails): Record<string, string> {
  const rule = TRIP_TYPE_CONFIG[type].dateRule;
  if (!rule) return {};
  const start = details[rule.start];
  const end = details[rule.end];
  // ISO dates compare correctly as strings
  return start && end && end < start ? { [rule.end]: rule.message } : {};
}

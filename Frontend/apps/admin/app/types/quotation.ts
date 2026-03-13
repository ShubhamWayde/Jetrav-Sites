// ── Quotation type union ───────────────────────────────────────────────────────
export type QuotationType =
  | 'air'
  | 'train'
  | 'hotel'
  | 'visa'
  | 'insurance'
  | 'bus'
  | 'car'
  | 'foreign_exchange'
  | 'package';

export interface QuotationTypeOption {
  value: QuotationType;
  label: string;
}

export const QUOTATION_TYPES: QuotationTypeOption[] = [
  { value: 'air',              label: 'Air' },
  { value: 'train',            label: 'Train' },
  { value: 'hotel',            label: 'Hotel' },
  { value: 'visa',             label: 'Visa' },
  { value: 'insurance',        label: 'Insurance' },
  { value: 'bus',              label: 'Bus' },
  { value: 'car',              label: 'Car' },
  { value: 'foreign_exchange', label: 'Foreign Exchange' },
  { value: 'package',          label: 'Package' },
];

// ── API response type ─────────────────────────────────────────────────────────
export interface QuotationResponse {
  id:         number;
  customerId: number;
  type:       QuotationType;
  assignTo:   string;
  remark:     string;
  details:    Record<string, unknown>;
  createdAt:  string;
  updatedAt:  string;
}

// ── Per-type detail shapes (used for form state) ──────────────────────────────

export type QuotationDetails = Record<string, string>;

export const DEFAULT_DETAILS: Record<QuotationType, QuotationDetails> = {
  air: {
    source:      '',
    destination: '',
    departure:   '',
    return:      '',
    adults:      '1',
    children:    '0',
    infant:      '0',
  },
  train: {
    source:      '',
    destination: '',
    departure:   '',
    return:      '',
    adults:      '1',
    children:    '0',
  },
  hotel: {
    city:      '',
    checkIn:   '',
    checkOut:  '',
    rooms:     '1',
    adults:    '1',
    children:  '0',
  },
  visa: {
    country:    '',
    visaType:   '',
    travelDate: '',
    adults:     '1',
    children:   '0',
  },
  insurance: {
    country:   '',
    startDate: '',
    endDate:   '',
    adults:    '1',
  },
  bus: {
    source:      '',
    destination: '',
    departure:   '',
    adults:      '1',
    children:    '0',
  },
  car: {
    source:      '',
    destination: '',
    pickupDate:  '',
    dropDate:    '',
    carType:     '',
  },
  foreign_exchange: {
    currency: '',
    amount:   '',
    purpose:  '',
  },
  package: {
    destination:  '',
    startDate:    '',
    endDate:      '',
    adults:       '1',
    children:     '0',
    packageType:  'domestic',
  },
};

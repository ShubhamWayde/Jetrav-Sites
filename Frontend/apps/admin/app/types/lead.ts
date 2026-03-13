// ── Lead type union ────────────────────────────────────────────────────────────

export type LeadType =
  | 'air'
  | 'train'
  | 'hotel'
  | 'visa'
  | 'insurance'
  | 'bus'
  | 'car'
  | 'foreign_exchange'
  | 'package';

export interface LeadTypeOption {
  value: LeadType;
  label: string;
}

export const LEAD_TYPES: LeadTypeOption[] = [
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

// ── Lead status ───────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'contacted'
  | 'quotation'
  | 'confirmed'
  | 'quoted'
  | 'negotiation'
  | 'cancelled'
  | 'lost';

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'contacted',   label: 'Contacted' },
  { value: 'quotation',   label: 'Quotation' },
  { value: 'confirmed',   label: 'Confirmed' },
  { value: 'quoted',      label: 'Quoted' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'cancelled',   label: 'Cancelled' },
  { value: 'lost',        label: 'Lost' },
];

// ── API response type ─────────────────────────────────────────────────────────

export interface LeadResponse {
  id:            number;
  customerId:    number;
  customerName:  string;
  mobileNumber:  string;
  type:          LeadType;
  status:        LeadStatus;
  details:       Record<string, unknown>;
  assignTo:      string;
  remark:        string;
  createdBy:     number;
  createdByName: string;
  createdAt:     string;
  updatedAt:     string;
}

// ── Per-type detail shapes (used for form state) ──────────────────────────────

export type LeadDetails = Record<string, string>;

export const LEAD_DEFAULT_DETAILS: Record<LeadType, LeadDetails> = {
  air: {
    source:      '',
    destination: '',
    departure:   '',
    return:      '',
    adults:      '1',
    children:    '0',
    infant:      '0',
    ssr:         '',
    tripType:    'domestic',
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
    tripType:  'domestic',
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

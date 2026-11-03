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

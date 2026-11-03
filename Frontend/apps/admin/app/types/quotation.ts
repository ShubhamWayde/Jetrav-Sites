import type { LeadType, LeadTypeOption } from './lead';
import { LEAD_TYPES } from './lead';

// Quotations cover the same services as leads
export type QuotationType = LeadType;
export const QUOTATION_TYPES: LeadTypeOption[] = LEAD_TYPES;

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

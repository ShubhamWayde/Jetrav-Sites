import type { BadgeTone } from '@repo/ui/Badge';
import type { LeadStatus } from '@/app/types/lead';

// Lead pipeline: early stages are informational, late stages carry outcome colours
export const LEAD_STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  contacted:   'info',
  quotation:   'accent',
  quoted:      'accent',
  negotiation: 'warning',
  confirmed:   'success',
  cancelled:   'neutral',
  lost:        'danger',
};

export function leadStatusTone(status: string): BadgeTone {
  return LEAD_STATUS_TONE[status as LeadStatus] ?? 'neutral';
}

const PLAN_TONE: Record<string, BadgeTone> = {
  silver:   'silver',
  gold:     'gold',
  platinum: 'platinum',
  diamond:  'diamond',
};

export function planTone(plan: string): BadgeTone {
  return PLAN_TONE[plan.toLowerCase()] ?? 'neutral';
}

export function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

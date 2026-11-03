import type { BadgeTone } from '@repo/ui/Badge';

/** Display order of plan tiers, lowest first. */
export const TIER_ORDER = ['silver', 'gold', 'platinum', 'diamond'] as const;

export function tierRank(tier: string): number {
  const index = TIER_ORDER.indexOf(tier?.toLowerCase() as (typeof TIER_ORDER)[number]);
  return index === -1 ? TIER_ORDER.length : index;
}

/** Badge tone for a plan tier; unknown tiers stay neutral. */
export function tierTone(tier: string): BadgeTone {
  switch (tier?.toLowerCase()) {
    case 'silver':   return 'silver';
    case 'gold':     return 'gold';
    case 'platinum': return 'platinum';
    case 'diamond':  return 'diamond';
    default:         return 'neutral';
  }
}

import Link from 'next/link';
import { Badge } from '@repo/ui/Badge';
import { tierTone } from '@/lib/plans';
import { formatDate } from '@/lib/format';
import type { SubscriptionStatus } from '@/app/types/account';
import styles from './PlanSummary.module.css';

interface PlanSummaryProps {
  subscription: SubscriptionStatus | null;
}

/** Compact "current plan" block pinned to the bottom of the sidebar. */
export default function PlanSummary({ subscription }: PlanSummaryProps) {
  // Stay quiet while loading or on error — the accounts page owns the full error state.
  if (!subscription) return null;

  const plan = subscription.hasPlan ? subscription.plan : null;

  if (!plan) {
    return (
      <div className={styles.summary}>
        <span className={styles.label}>No active plan</span>
        <Link href="/plan" className={styles.link}>Choose a plan →</Link>
      </div>
    );
  }

  return (
    <div className={styles.summary}>
      <span className={styles.label}>Current plan</span>
      <div className={styles.row}>
        <span className={styles.name}>{plan.name}</span>
        <Badge tone={tierTone(plan.tier)}>{plan.tier}</Badge>
      </div>
      {subscription.endDate && (
        <span className={styles.meta}>Valid until {formatDate(subscription.endDate)}</span>
      )}
      <Link href="/accounts" className={styles.link}>Manage plan →</Link>
    </div>
  );
}

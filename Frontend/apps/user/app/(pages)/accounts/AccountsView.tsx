'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import { PageHeader } from '@repo/ui/PageHeader';
import Spinner from '@repo/ui/Spinner';
import { CarryOnBagChecked, Icon, JetPoints, StarShine } from '@repo/ui/icon';
import { useAccount } from '@/components/layout/AccountContext';
import { capitalize, daysUntil, formatDate, formatNumber, formatRupees } from '@/lib/format';
import { tierTone } from '@/lib/plans';
import type { SubscriptionStatus } from '@/app/types/account';
import styles from './account.module.css';

// ── Sub-components ─────────────────────────────────────────────────────────────

function PointsCard({ coins }: { coins: number }) {
  return (
    <section className={styles.points} aria-labelledby="points-heading">
      <div className={styles.pointsIcon} aria-hidden="true">
        <Icon icon={JetPoints} size="lg" />
      </div>
      <div className={styles.pointsBody}>
        <h2 id="points-heading" className={styles.pointsLabel}>Jet Points balance</h2>
        <p className={styles.pointsValue}>
          <span aria-hidden="true">🪙 </span>
          {formatNumber(coins)}
        </p>
        <p className={styles.pointsHint}>
          You earn 15% back in Jet Points on every flight booked through Jetrav.
        </p>
      </div>
    </section>
  );
}

function PlanCard({ data, onChangePlan }: { data: SubscriptionStatus; onChangePlan: () => void }) {
  const plan = data.plan;

  if (!data.hasPlan || !plan) {
    return (
      <Card>
        <EmptyState
          icon={<Icon icon={StarShine} size="md" />}
          title="No active plan"
          description="Pick a plan to have Jetrav manage your trips and start earning more Jet Points."
          action={<Button onClick={onChangePlan}>Choose a plan</Button>}
        />
      </Card>
    );
  }

  const daysLeft = daysUntil(data.endDate);
  const features = plan.features ?? [];

  return (
    <Card
      title="Current plan"
      actions={<Button size="sm" variant="secondary" onClick={onChangePlan}>Change plan</Button>}
    >
      <div className={styles.planTop}>
        <p className={styles.planName}>{plan.name}</p>
        <Badge tone={tierTone(plan.tier)}>{plan.tier}</Badge>
        {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
          <Badge tone="warning" dot>
            {daysLeft === 0 ? 'Ends today' : `Ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
          </Badge>
        )}
      </div>

      <dl className={styles.meta}>
        <div className={styles.metaItem}>
          <dt>Billing</dt>
          <dd>{capitalize(plan.billingCycle)}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt>Price</dt>
          <dd>{plan.price > 0 ? formatRupees(plan.price) : 'Free'}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt>Started</dt>
          <dd>{formatDate(data.startDate)}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt>Valid until</dt>
          <dd>{formatDate(data.endDate)}</dd>
        </div>
      </dl>

      {features.length > 0 && (
        <div className={styles.features}>
          <h3 className={styles.featuresTitle}>What&apos;s included</h3>
          <ul className={styles.featureList}>
            {features.map((feature, i) => (
              <li key={`${i}-${feature}`} className={styles.feature}>
                <Icon icon={CarryOnBagChecked} size="sm" className={styles.featureIcon} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ── View ───────────────────────────────────────────────────────────────────────

export default function AccountsView() {
  const router = useRouter();
  const { subscription } = useAccount();
  const { data, loading, error, reload } = subscription;
  const goToPlans = () => router.push('/plan');

  return (
    <>
      <PageHeader
        title="My account"
        description="Your Jet Points balance and plan details."
        actions={<Link href="/profile">Edit profile</Link>}
      />

      {loading ? (
        <div className={styles.centered}>
          <Spinner size={32} label="Loading your account" />
        </div>
      ) : error || !data ? (
        // Never fall back to "No active plan" on a failed load: a paying
        // customer would be told to buy a plan they already have.
        <Card>
          <EmptyState
            variant="error"
            title="Couldn't load your plan"
            description={error ?? 'Your plan details are unavailable right now.'}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      ) : (
        <div className={styles.grid}>
          <PointsCard coins={data.coins ?? 0} />
          <PlanCard data={data} onChangePlan={goToPlans} />
        </div>
      )}
    </>
  );
}

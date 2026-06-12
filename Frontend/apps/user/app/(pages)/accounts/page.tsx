'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {api} from '@repo/auth';
import Button from '@repo/ui/button';
import Spinner from '@repo/ui/spinner';
import {CarryOnBagChecked, Icon} from '@repo/ui/icon';
import {USER_API} from '@/lib/constants';
import {SubscriptionStatus} from '@/app/types/account';
import {formatDate} from '@/app/utils/main';
import styles from './account.module.css';

// ── Helpers ────────────────────────────────────────────────────────────────────

function tierColor(tier: string): string {
  switch (tier?.toLowerCase()) {
    case 'gold':
      return styles.tierGold ?? '';
    case 'platinum':
      return styles.tierPlatinum ?? '';
    default:
      return styles.tierSilver ?? '';
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const router = useRouter();
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<SubscriptionStatus>(USER_API.SUBSCRIPTION)
      .then(res => {
        if (res.data) setData(res.data);
      })
      .catch(() => {
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Account</h1>
          <p className={styles.pageSubtitle}>View your plan details and Jetcoins balance.</p>
        </div>
      </div>

      {/* Jetcoins Card */}
      <div className={styles.coinsCard}>
        <div className={styles.coinsIcon}>🪙</div>
        <div className={styles.coinsInfo}>
          <p className={styles.coinsLabel}>Jetcoins Balance</p>
          <p className={styles.coinsValue}>{(data?.coins ?? 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Plan Card */}
      {data?.hasPlan && data.plan ? (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Current Plan</h2>
              <p className={styles.planName}>{data.plan.name}</p>
            </div>
            <span className={`${styles.tierBadge} ${tierColor(data.plan.tier)}`}>
              {data.plan.tier}
            </span>
          </div>

          <div className={styles.planMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Billing Cycle</span>
              <span className={styles.metaValue}>{data.plan.billingCycle}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Price</span>
              <span className={styles.metaValue}>₹{data.plan.price.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Start Date</span>
              <span className={styles.metaValue}>{formatDate(data.startDate)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>End Date</span>
              <span className={styles.metaValue}>{formatDate(data.endDate)}</span>
            </div>
          </div>

          {data.plan.features?.length > 0 && (
            <div className={styles.features}>
              <p className={styles.featuresTitle}>Included Features</p>
              <ul className={styles.featuresList}>
                {data.plan.features.map((f, i) => (
                  <li key={i} className={styles.featureItem}>
                    <Icon icon={CarryOnBagChecked} size="sm" className={styles.featureCheck} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.cardFooter}>
            <Button className="btn-sm" variant="secondary" onClick={() => router.push('/plan')}>
              Change Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.emptyPlan}>
            <p className={styles.emptyTitle}>No active plan</p>
            <p className={styles.emptySubtitle}>Choose a plan to unlock all features.</p>
            <Button className="btn-sm" onClick={() => router.push('/plan')}>
              Choose a Plan
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

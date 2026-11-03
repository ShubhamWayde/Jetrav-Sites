'use client';

import Link from 'next/link';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import { PageHeader } from '@repo/ui/PageHeader';
import { StatCard } from '@repo/ui/StatCard';
import { AirplaneTicket, Icon, JetPoints, SmartSearch, TrackBooking, YourTrips } from '@repo/ui/icon';
import { useAccount } from '@/components/layout/AccountContext';
import { USER_API } from '@/lib/constants';
import { capitalize, formatDate, formatNumber } from '@/lib/format';
import { CLOSED_LEAD_STATUSES, leadStatusTone, serviceMeta } from '@/lib/travel';
import { useApiQuery } from '@/lib/useApiQuery';
import type { LeadResponse, QuotationResponse, UserDashboard } from '@/app/types/profile';
import styles from './dashboard.module.css';

// ── Sub-components ─────────────────────────────────────────────────────────────

function LeadItem({ lead }: { lead: LeadResponse }) {
  const service = serviceMeta(lead.type);
  return (
    <li className={styles.item}>
      <span className={styles.itemIcon} aria-hidden="true">
        <Icon icon={service.icon} size="md" />
      </span>
      <div className={styles.itemBody}>
        <div className={styles.itemTop}>
          <h3 className={styles.itemTitle}>{service.label}</h3>
          <Badge tone={leadStatusTone(lead.status)} dot>{lead.status}</Badge>
        </div>
        {lead.remark && <p className={styles.itemRemark}>{lead.remark}</p>}
        <p className={styles.itemMeta}>
          <span>Requested {formatDate(lead.createdAt)}</span>
          {lead.assignTo && <span>Handled by {lead.assignTo}</span>}
        </p>
      </div>
    </li>
  );
}

function QuotationItem({ quotation }: { quotation: QuotationResponse }) {
  const service = serviceMeta(quotation.type);
  return (
    <li className={styles.item}>
      <span className={styles.itemIcon} aria-hidden="true">
        <Icon icon={service.icon} size="md" />
      </span>
      <div className={styles.itemBody}>
        <div className={styles.itemTop}>
          <h3 className={styles.itemTitle}>{service.label} quotation</h3>
          <span className={styles.itemDate}>{formatDate(quotation.createdAt)}</span>
        </div>
        {quotation.remark && <p className={styles.itemRemark}>{quotation.remark}</p>}
        {quotation.assignTo && (
          <p className={styles.itemMeta}>
            <span>Prepared by {quotation.assignTo}</span>
          </p>
        )}
      </div>
    </li>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className={styles.skeletonList} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => <span key={i} />)}
    </div>
  );
}

// ── View ───────────────────────────────────────────────────────────────────────

export default function DashboardView() {
  const { profile, subscription } = useAccount();
  const { data, loading, error, reload } = useApiQuery<UserDashboard>(
    USER_API.DASHBOARD,
    "Couldn't load your trip requests. Please try again.",
  );

  const leads = data?.leads ?? [];
  const quotations = data?.quotations ?? [];
  const openLeads = leads.filter((l) => !CLOSED_LEAD_STATUSES.includes(l.status?.toLowerCase())).length;
  const firstName = profile.data?.firstName?.trim();

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${capitalize(firstName)}` : 'Welcome back'}
        description="Here's what's happening with your trips."
      />

      <div className={styles.stats}>
        <StatCard
          label="Trip requests"
          value={formatNumber(leads.length)}
          hint={`${formatNumber(openLeads)} in progress`}
          icon={<Icon icon={SmartSearch} size="sm" />}
          loading={loading}
        />
        <StatCard
          label="Quotations"
          value={formatNumber(quotations.length)}
          icon={<Icon icon={TrackBooking} size="sm" />}
          tone="info"
          loading={loading}
        />
        <StatCard
          label="Jet Points"
          value={formatNumber(subscription.data?.coins ?? 0)}
          hint={<Link href="/accounts">View balance</Link>}
          icon={<Icon icon={JetPoints} size="sm" />}
          tone="warning"
          loading={subscription.loading}
        />
        <StatCard
          label="Trips taken"
          value={formatNumber(profile.data?.totalTrips ?? 0)}
          hint={`${formatNumber(profile.data?.totalStays ?? 0)} hotel stays`}
          icon={<Icon icon={YourTrips} size="sm" />}
          tone="success"
          loading={profile.loading}
        />
      </div>

      {error ? (
        <Card>
          <EmptyState
            variant="error"
            title="Couldn't load your trips"
            description={error}
            action={<Button onClick={reload}>Try again</Button>}
          />
        </Card>
      ) : (
        <div className={styles.columns}>
          <Card title="My trip requests" description="Every request you've raised with Jetrav." aria-busy={loading || undefined}>
            {loading ? (
              <ListSkeleton rows={3} />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={<Icon icon={AirplaneTicket} size="md" />}
                title="No trip requests yet"
                description="Call or message your Jetrav concierge to plan a trip — it'll show up here."
              />
            ) : (
              <ul className={styles.list}>
                {leads.map((lead) => <LeadItem key={lead.id} lead={lead} />)}
              </ul>
            )}
          </Card>

          <Card title="My quotations" description="Prices our team has prepared for you." aria-busy={loading || undefined}>
            {loading ? (
              <ListSkeleton rows={2} />
            ) : quotations.length === 0 ? (
              <EmptyState
                icon={<Icon icon={TrackBooking} size="md" />}
                title="No quotations yet"
                description="When we price a trip for you, the quotation appears here."
              />
            ) : (
              <ul className={styles.list}>
                {quotations.map((q) => <QuotationItem key={q.id} quotation={q} />)}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

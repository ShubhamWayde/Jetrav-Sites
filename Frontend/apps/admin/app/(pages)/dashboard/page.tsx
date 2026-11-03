'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import { PageHeader } from '@repo/ui/PageHeader';
import { StatCard, type StatCardProps } from '@repo/ui/StatCard';
import Table, { type Column } from '@repo/ui/Table';
import { Tabs } from '@repo/ui/Tabs';
import { ADMIN_API } from '@/lib/constants';
import { detailValue, formatDate, formatNumber, localDateFromToday } from '@/lib/format';
import { capitalize, leadStatusTone } from '@/lib/tones';
import { useApiQuery } from '@/lib/useApiQuery';
import type {
  CustomerType,
  DashboardResponse,
  DashboardStats,
  DateRange,
  TripDateFilter,
  TripFilter,
} from '@/app/types/dashboard';
import type { LeadResponse } from '@/app/types/lead';
import styles from './dashboard.module.css';

// ── Filter options ────────────────────────────────────────────────────────────

const DATE_RANGE_OPTS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last_3_days', label: '3 days' },
  { value: 'last_7_days', label: '7 days' },
  { value: 'last_month', label: '30 days' },
  { value: 'all_time', label: 'All time' },
];

const CUSTOMER_TYPE_OPTS: { value: CustomerType; label: string }[] = [
  { value: 'all', label: 'All customers' },
  { value: 'new', label: 'New' },
  { value: 'existing', label: 'Existing' },
];

const TRIP_DATE_OPTS: { value: TripDateFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'in_1_day', label: 'Tomorrow' },
  { value: 'in_2_days', label: 'In 2 days' },
  { value: 'upcoming', label: 'Later' },
];

const TRIP_SCOPE_OPTS: { value: TripFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'domestic', label: 'Domestic' },
  { value: 'international', label: 'International' },
];

const STAT_CARDS: { key: keyof DashboardStats; label: string; tone: StatCardProps['tone'] }[] = [
  { key: 'contacted', label: 'Contacted', tone: 'info' },
  { key: 'quotation', label: 'Quotation', tone: 'accent' },
  { key: 'quoted', label: 'Quoted', tone: 'accent' },
  { key: 'negotiation', label: 'Negotiation', tone: 'warning' },
  { key: 'confirmed', label: 'Confirmed', tone: 'success' },
  { key: 'lost', label: 'Lost', tone: 'danger' },
];

// ── Trip filtering (client-side: the API returns every upcoming trip) ─────────

const DAY_OFFSET: Record<Exclude<TripDateFilter, 'upcoming'>, number> = {
  today: 0,
  in_1_day: 1,
  in_2_days: 2,
};

function filterTrips(trips: LeadResponse[], dateKey: string, when: TripDateFilter, scope: TripFilter) {
  // Local calendar dates — UTC would shift the day for IST users before 05:30
  const target = when === 'upcoming' ? localDateFromToday(2) : localDateFromToday(DAY_OFFSET[when]);
  return trips.filter((trip) => {
    const date = trip.details?.[dateKey];
    if (typeof date !== 'string') return false;
    const day = date.slice(0, 10);
    const dateMatch = when === 'upcoming' ? day > target : day === target;
    return dateMatch && (scope === 'all' || trip.details?.tripType === scope);
  });
}

// ── Columns ───────────────────────────────────────────────────────────────────

const customerColumns: Column<LeadResponse>[] = [
  {
    key: 'customerName',
    header: 'Customer',
    render: (t) => (
      <div className={styles.customer}>
        <span className={styles.name}>{t.customerName}</span>
        <span className={styles.sub}>{t.mobileNumber || '—'}</span>
      </div>
    ),
  },
];

const trailingColumns: Column<LeadResponse>[] = [
  {
    key: 'tripType',
    header: 'Scope',
    render: (t) => {
      const scope = detailValue(t.details, 'tripType');
      return scope === '—' ? scope : <Badge tone="neutral">{capitalize(scope)}</Badge>;
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => <Badge tone={leadStatusTone(t.status)} dot>{capitalize(t.status)}</Badge>,
  },
  { key: 'assignTo', header: 'Assigned to', render: (t) => t.assignTo || '—' },
];

const AIR_COLUMNS: Column<LeadResponse>[] = [
  ...customerColumns,
  {
    key: 'route',
    header: 'Route',
    render: (t) => `${detailValue(t.details, 'source')} → ${detailValue(t.details, 'destination')}`,
  },
  { key: 'departure', header: 'Departure', render: (t) => formatDate(t.details?.departure) },
  { key: 'return', header: 'Return', render: (t) => formatDate(t.details?.return) },
  {
    key: 'pax',
    header: 'Pax (A/C/I)',
    align: 'right',
    render: (t) =>
      ['adults', 'children', 'infant'].map((k) => detailValue(t.details, k).replace('—', '0')).join(' / '),
  },
  { key: 'ssr', header: 'SSR', render: (t) => detailValue(t.details, 'ssr') },
  ...trailingColumns,
];

const HOTEL_COLUMNS: Column<LeadResponse>[] = [
  ...customerColumns,
  { key: 'city', header: 'City', render: (t) => detailValue(t.details, 'city') },
  { key: 'checkIn', header: 'Check-in', render: (t) => formatDate(t.details?.checkIn) },
  { key: 'checkOut', header: 'Check-out', render: (t) => formatDate(t.details?.checkOut) },
  { key: 'rooms', header: 'Rooms', align: 'right', render: (t) => detailValue(t.details, 'rooms') },
  {
    key: 'guests',
    header: 'Guests (A/C)',
    align: 'right',
    render: (t) => ['adults', 'children'].map((k) => detailValue(t.details, k).replace('—', '0')).join(' / '),
  },
  ...trailingColumns,
];

// ── Upcoming trips card ───────────────────────────────────────────────────────

interface TripsCardProps {
  title: string;
  noun: string;
  trips: LeadResponse[];
  dateKey: string;
  columns: Column<LeadResponse>[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}

function TripsCard({ title, noun, trips, dateKey, columns, loading, error, onRetry }: TripsCardProps) {
  const [when, setWhen] = useState<TripDateFilter>('today');
  const [scope, setScope] = useState<TripFilter>('all');
  const rows = useMemo(() => filterTrips(trips, dateKey, when, scope), [trips, dateKey, when, scope]);

  return (
    <Card
      title={title}
      description={loading ? 'Loading…' : `${rows.length} ${noun}${rows.length === 1 ? '' : 's'} shown`}
      actions={
        <Tabs options={TRIP_SCOPE_OPTS} value={scope} onChange={setScope} label={`${title}: trip scope`} size="sm" />
      }
    >
      <div className={styles.cardFilters}>
        <Tabs options={TRIP_DATE_OPTS} value={when} onChange={setWhen} label={`${title}: travel date`} size="sm" />
      </div>
      <Table
        caption={title}
        columns={columns}
        rows={rows}
        rowKey={(t) => t.id}
        loading={loading}
        error={error}
        onRetry={onRetry}
        minWidth={880}
        empty={<EmptyState title={`No ${noun}s`} description="Try another date or scope filter." />}
      />
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('all_time');
  const [customerType, setCustomerType] = useState<CustomerType>('all');

  const url = `${ADMIN_API.DASHBOARD}?${new URLSearchParams({ date_range: dateRange, customer_type: customerType })}`;
  const { data, loading, error, reload } = useApiQuery<DashboardResponse>(url, 'Failed to load the dashboard.');

  const stats = data?.stats;
  const totalLeads = stats ? STAT_CARDS.reduce((sum, s) => sum + (stats[s.key] ?? 0), 0) : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your lead pipeline and the trips departing soon."
        actions={
          <Tabs options={DATE_RANGE_OPTS} value={dateRange} onChange={setDateRange} label="Pipeline period" />
        }
      />

      <div className={styles.stack}>
        <Card
          title="Lead pipeline"
          description={loading || error ? 'Leads you created, by status' : `${formatNumber(totalLeads)} leads you created`}
          actions={
            <Tabs
              options={CUSTOMER_TYPE_OPTS}
              value={customerType}
              onChange={setCustomerType}
              label="Customer type"
              size="sm"
            />
          }
        >
          {error && !loading ? (
            <EmptyState
              variant="error"
              title="Couldn't load the dashboard"
              description={error}
              action={<Button variant="secondary" size="sm" onClick={reload}>Try again</Button>}
            />
          ) : (
            <div className={styles.stats}>
              {STAT_CARDS.map(({ key, label, tone }) => (
                <StatCard
                  key={key}
                  label={label}
                  tone={tone}
                  loading={loading}
                  value={formatNumber(stats?.[key])}
                />
              ))}
            </div>
          )}
        </Card>

        <TripsCard
          title="Upcoming air trips"
          noun="flight"
          trips={data?.upcomingAirTrips ?? []}
          dateKey="departure"
          columns={AIR_COLUMNS}
          loading={loading}
          error={error}
          onRetry={reload}
        />

        <TripsCard
          title="Upcoming hotel stays"
          noun="stay"
          trips={data?.upcomingHotelTrips ?? []}
          dateKey="checkIn"
          columns={HOTEL_COLUMNS}
          loading={loading}
          error={error}
          onRetry={reload}
        />
      </div>
    </>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import type {
  DashboardResponse,
  DateRange,
  CustomerType,
  TripDateFilter,
  TripFilter,
} from '@/app/types/dashboard';
import type { LeadResponse } from '@/app/types/lead';
import Table, { Tr, Td } from '@repo/ui/Table';
import Spinner from '@repo/ui/Spinner';
import styles from './dashboard.module.css';
import Button from '@repo/ui/Button';

function fmt(val: string): string {
  if (!val || val === '—') return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return val; }
}

function det(lead: LeadResponse, key: string): string {
  const d = lead.details as Record<string, unknown>;
  const v = d?.[key];
  return v !== undefined && v !== '' ? String(v) : '—';
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

interface TabsProps<T extends string> {
  options: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}
function Tabs<T extends string>({ options, active, onChange }: TabsProps<T>) {
  return (
    <div className={styles.tabGroup}>
      {options.map(o => (
        <button
          key={o.value}
          className={`${styles.tab} ${active === o.value ? styles.tabActive : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AirTripTable({ trips }: { trips: LeadResponse[] }) {
  if (trips.length === 0) return <div className={styles.emptyTrips}>No upcoming air trips.</div>;
  return (
    <Table columns={[
      { header: 'Name' },
      { header: 'Mobile no.' },
      { header: 'Origin' },
      { header: 'Destination' },
      { header: 'Departure' },
      { header: 'Return' },
      { header: 'Adults' },
      { header: 'Children' },
      { header: 'Infant' },
      { header: 'SSR' },
      { header: 'Updated on' },
      { header: 'Assign to' },
    ]}>
      {trips.map(t => (
        <Tr key={t.id}>
          <Td className={styles.name}>{t.customerName}</Td>
          <Td>{t.mobileNumber || '—'}</Td>
          <Td>{det(t, 'source')}</Td>
          <Td>{det(t, 'destination')}</Td>
          <Td>{fmt(det(t, 'departure'))}</Td>
          <Td>{fmt(det(t, 'return'))}</Td>
          <Td>{det(t, 'adults')}</Td>
          <Td>{det(t, 'children')}</Td>
          <Td>{det(t, 'infant')}</Td>
          <Td>{det(t, 'ssr')}</Td>
          <Td>{fmt(t.updatedAt)}</Td>
          <Td>{t.assignTo || '—'}</Td>
        </Tr>
      ))}
    </Table>
  );
}

function HotelTripTable({ trips }: { trips: LeadResponse[] }) {
  if (trips.length === 0) return <div className={styles.emptyTrips}>No upcoming hotel trips.</div>;
  return (
    <Table columns={[
      { header: 'Name' },
      { header: 'Mobile no.' },
      { header: 'City' },
      { header: 'Check-in' },
      { header: 'Check-out' },
      { header: 'Rooms' },
      { header: 'Adults' },
      { header: 'Children' },
      { header: 'Updated on' },
      { header: 'Assign to' },
    ]}>
      {trips.map(t => (
        <Tr key={t.id}>
          <Td className={styles.name}>{t.customerName}</Td>
          <Td>{t.mobileNumber || '—'}</Td>
          <Td>{det(t, 'city')}</Td>
          <Td>{fmt(det(t, 'checkIn'))}</Td>
          <Td>{fmt(det(t, 'checkOut'))}</Td>
          <Td>{det(t, 'rooms')}</Td>
          <Td>{det(t, 'adults')}</Td>
          <Td>{det(t, 'children')}</Td>
          <Td>{fmt(t.updatedAt)}</Td>
          <Td>{t.assignTo || '—'}</Td>
        </Tr>
      ))}
    </Table>
  );
}

const DATE_RANGE_OPTS: { value: DateRange; label: string }[] = [
  { value: 'today',       label: 'Today' },
  { value: 'last_3_days', label: 'Last 3 days' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_month',  label: 'Last Month' },
  { value: 'all_time',    label: 'All time' },
];

const CUSTOMER_TYPE_OPTS: { value: CustomerType; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'new',      label: 'New' },
  { value: 'existing', label: 'Existing' },
];

const TRIP_DATE_OPTS: { value: TripDateFilter; label: string }[] = [
  { value: 'today',     label: 'Today' },
  { value: 'in_1_day',  label: 'In 1 Day' },
  { value: 'in_2_days', label: 'In 2 Days' },
  { value: 'upcoming',  label: 'Upcoming' },
];

const TRIP_FILTER_OPTS: { value: TripFilter; label: string }[] = [
  { value: 'all',           label: 'All' },
  { value: 'international', label: 'International' },
  { value: 'domestic',      label: 'Domestic' },
];

export default function DashboardPage() {
  const [data,    setData]    = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [dateRange,    setDateRange]    = useState<DateRange>('all_time');
  const [customerType, setCustomerType] = useState<CustomerType>('all');

  // Per-section independent filters (changing one does not affect the other)
  const [airDateFilter,   setAirDateFilter]   = useState<TripDateFilter>('today');
  const [airTripFilter,   setAirTripFilter]   = useState<TripFilter>('all');
  const [hotelDateFilter, setHotelDateFilter] = useState<TripDateFilter>('today');
  const [hotelTripFilter, setHotelTripFilter] = useState<TripFilter>('all');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        date_range:    dateRange,
        customer_type: customerType,
      });
      const res = await api.get<DashboardResponse>(`${ADMIN_API.DASHBOARD}?${params.toString()}`);
      setData(res.data ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally { setLoading(false); }
  }, [dateRange, customerType]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const stats = data?.stats;

  function applyDateFilter(trips: LeadResponse[], dateKey: string, filter: TripDateFilter): LeadResponse[] {
    const today = new Date(); today.setHours(0,0,0,0);
    if (filter === 'upcoming') {
      // More than 2 days away
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() + 2);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return trips.filter(t => {
        const d = (t.details as Record<string, unknown>)?.[dateKey];
        return typeof d === 'string' && d.slice(0, 10) > cutoffStr;
      });
    }
    const target = new Date(today);
    if (filter === 'in_1_day') target.setDate(target.getDate() + 1);
    if (filter === 'in_2_days') target.setDate(target.getDate() + 2);
    const targetStr = target.toISOString().slice(0, 10);
    return trips.filter(t => {
      const d = (t.details as Record<string, unknown>)?.[dateKey];
      return typeof d === 'string' && d.slice(0, 10) === targetStr;
    });
  }

  function applyTripFilter(trips: LeadResponse[], filter: TripFilter): LeadResponse[] {
    if (filter === 'all') return trips;
    return trips.filter(t => {
      const d = (t.details as Record<string, unknown>)?.tripType;
      return d === filter;
    });
  }

  const rawAir   = data?.upcomingAirTrips   ?? [];
  const rawHotel = data?.upcomingHotelTrips ?? [];
  const airTrips   = applyTripFilter(applyDateFilter(rawAir,   'departure', airDateFilter),   airTripFilter);
  const hotelTrips = applyTripFilter(applyDateFilter(rawHotel, 'checkIn',   hotelDateFilter), hotelTripFilter);

  return (
    <div className={styles.page}>

      <div className={styles.sectionHeader}>
        <div className={styles.sectionLeft}>
          <h2 className={styles.sectionTitle}>Customers</h2>
          <Tabs options={CUSTOMER_TYPE_OPTS} active={customerType} onChange={setCustomerType} />
        </div>
        <Tabs options={DATE_RANGE_OPTS} active={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className={styles.statsRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.statCard} ${styles.statCardSkeleton}`} />
          ))}
        </div>
      ) : error ? (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <Button title="Retry" variant="secondary" onClick={fetchDashboard}>Retry</Button>
        </div>
      ) : (
        <div className={styles.statsRow}>
          <StatCard label="Contacted"   value={stats?.contacted   ?? 0} />
          <StatCard label="Quotation"   value={stats?.quotation   ?? 0} />
          <StatCard label="Quoted"      value={stats?.quoted      ?? 0} />
          <StatCard label="Negotiation" value={stats?.negotiation ?? 0} />
          <StatCard label="Confirmed"   value={stats?.confirmed   ?? 0} />
          <StatCard label="Lost"        value={stats?.lost        ?? 0} />
        </div>
      )}

      <div className={styles.tripSection}>
        <div className={styles.tripHeader}>
          <div className={styles.tripTitleRow}>
            <h3 className={styles.tripTitle}>
              Upcoming Air Trips
              {!loading && <span className={styles.tripCount}>{airTrips.length}</span>}
            </h3>
            <Tabs options={TRIP_FILTER_OPTS} active={airTripFilter} onChange={setAirTripFilter} />
          </div>
          <Tabs options={TRIP_DATE_OPTS} active={airDateFilter} onChange={setAirDateFilter} />
        </div>
        {loading
          ? <div className={styles.tableLoading}><Spinner /></div>
          : <AirTripTable trips={airTrips} />}
      </div>

      <div className={styles.tripSection}>
        <div className={styles.tripHeader}>
          <div className={styles.tripTitleRow}>
            <h3 className={styles.tripTitle}>
              Upcoming Hotel Trips
              {!loading && <span className={styles.tripCount}>{hotelTrips.length}</span>}
            </h3>
            <Tabs options={TRIP_FILTER_OPTS} active={hotelTripFilter} onChange={setHotelTripFilter} />
          </div>
          <Tabs options={TRIP_DATE_OPTS} active={hotelDateFilter} onChange={setHotelDateFilter} />
        </div>
        {loading
          ? <div className={styles.tableLoading}><Spinner /></div>
          : <HotelTripTable trips={hotelTrips} />}
      </div>

    </div>
  );
}

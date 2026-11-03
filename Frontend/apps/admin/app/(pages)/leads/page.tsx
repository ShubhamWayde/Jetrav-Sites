'use client';

import { useState } from 'react';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import { PageHeader } from '@repo/ui/PageHeader';
import Table, { type Column } from '@repo/ui/Table';
import { Tabs } from '@repo/ui/Tabs';
import { Delete, Edit, Icon, SmartSearch } from '@repo/ui/icon';
import { ADMIN_API } from '@/lib/constants';
import { detailValue, formatDate } from '@/lib/format';
import { capitalize, leadStatusTone } from '@/lib/tones';
import { useApiQuery } from '@/lib/useApiQuery';
import { LEAD_TYPES, type LeadResponse, type LeadType } from '@/app/types/lead';
import AddLeadModal from '@/components/modals/create-lead/AddLeadModal';
import EditLeadModal from '@/components/modals/edit-lead/EditLeadModal';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import styles from './leads.module.css';

type LeadFilter = LeadType | 'all';

const FILTER_TABS: { value: LeadFilter; label: string }[] = [{ value: 'all', label: 'All' }, ...LEAD_TYPES];

function typeLabel(type: string): string {
  return LEAD_TYPES.find((t) => t.value === type)?.label ?? type;
}

// ── Detail columns per service ────────────────────────────────────────────────

interface DetailColumn {
  header: string;
  /** First non-empty key wins (lets "All" show mixed services in one column). */
  keys: string[];
  date?: boolean;
}

const DETAIL_COLUMNS: Record<LeadFilter, DetailColumn[]> = {
  all: [
    { header: 'From / where', keys: ['source', 'city', 'country', 'currency'] },
    { header: 'To', keys: ['destination'] },
    { header: 'Start', keys: ['departure', 'checkIn', 'startDate', 'travelDate', 'pickupDate'], date: true },
    { header: 'End', keys: ['return', 'checkOut', 'endDate', 'dropDate'], date: true },
    { header: 'Adults', keys: ['adults'] },
  ],
  air: [
    { header: 'Origin', keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Departure', keys: ['departure'], date: true },
    { header: 'Return', keys: ['return'], date: true },
    { header: 'Scope', keys: ['tripType'] },
    { header: 'Adults', keys: ['adults'] },
    { header: 'Children', keys: ['children'] },
    { header: 'Infant', keys: ['infant'] },
    { header: 'SSR', keys: ['ssr'] },
  ],
  train: [
    { header: 'Source', keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Departure', keys: ['departure'], date: true },
    { header: 'Return', keys: ['return'], date: true },
    { header: 'Adults', keys: ['adults'] },
    { header: 'Children', keys: ['children'] },
  ],
  hotel: [
    { header: 'City', keys: ['city'] },
    { header: 'Scope', keys: ['tripType'] },
    { header: 'Check-in', keys: ['checkIn'], date: true },
    { header: 'Check-out', keys: ['checkOut'], date: true },
    { header: 'Rooms', keys: ['rooms'] },
    { header: 'Adults', keys: ['adults'] },
    { header: 'Children', keys: ['children'] },
  ],
  visa: [
    { header: 'Country', keys: ['country'] },
    { header: 'Visa type', keys: ['visaType'] },
    { header: 'Travel date', keys: ['travelDate'], date: true },
    { header: 'Adults', keys: ['adults'] },
    { header: 'Children', keys: ['children'] },
  ],
  insurance: [
    { header: 'Country', keys: ['country'] },
    { header: 'Start date', keys: ['startDate'], date: true },
    { header: 'End date', keys: ['endDate'], date: true },
    { header: 'Adults', keys: ['adults'] },
  ],
  bus: [
    { header: 'Source', keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Departure', keys: ['departure'], date: true },
    { header: 'Adults', keys: ['adults'] },
    { header: 'Children', keys: ['children'] },
  ],
  car: [
    { header: 'Source', keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Pickup', keys: ['pickupDate'], date: true },
    { header: 'Drop', keys: ['dropDate'], date: true },
    { header: 'Car type', keys: ['carType'] },
  ],
  foreign_exchange: [
    { header: 'Currency', keys: ['currency'] },
    { header: 'Amount', keys: ['amount'] },
    { header: 'Purpose', keys: ['purpose'] },
  ],
  package: [
    { header: 'Destination', keys: ['destination'] },
    { header: 'Start date', keys: ['startDate'], date: true },
    { header: 'End date', keys: ['endDate'], date: true },
    { header: 'Adults', keys: ['adults'] },
    { header: 'Children', keys: ['children'] },
    { header: 'Package type', keys: ['packageType'] },
  ],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  // The filter is the single source of truth: changing it changes the URL, and
  // useApiQuery refetches (aborting any request still in flight).
  const [filter, setFilter] = useState<LeadFilter>('all');
  const url = filter === 'all' ? ADMIN_API.LEADS : `${ADMIN_API.LEADS}?type=${encodeURIComponent(filter)}`;
  const { data, loading, error, reload } = useApiQuery<LeadResponse[]>(url, 'Failed to load leads.');
  const leads = data ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<LeadResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await api.delete(ADMIN_API.LEAD_BY_ID(deleteTarget.id));
      showSuccess(res.message || 'Lead deleted.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete lead.'));
    } finally {
      setDeleting(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<LeadResponse>[] = [
    {
      key: 'customerName',
      header: 'Customer',
      render: (lead) => (
        <div className={styles.customer}>
          <span className={styles.name}>{lead.customerName}</span>
          <span className={styles.sub}>{lead.mobileNumber || '—'}</span>
        </div>
      ),
    },
    ...(filter === 'all'
      ? [{ key: 'type', header: 'Service', render: (lead: LeadResponse) => typeLabel(lead.type) }]
      : []),
    {
      key: 'status',
      header: 'Status',
      render: (lead) => (
        <Badge tone={leadStatusTone(lead.status)} dot>
          {capitalize(lead.status)}
        </Badge>
      ),
    },
    ...DETAIL_COLUMNS[filter].map((col) => ({
      key: `detail-${col.header}`,
      header: col.header,
      render: (lead: LeadResponse) => {
        const value = detailValue(lead.details, ...col.keys);
        return col.date ? formatDate(value === '—' ? '' : value) : value;
      },
    })),
    { key: 'assignTo', header: 'Assigned to', render: (lead) => lead.assignTo || '—' },
    { key: 'updatedAt', header: 'Updated', render: (lead) => formatDate(lead.updatedAt) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (lead) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon icon={Edit} size="sm" />}
            aria-label={`Edit lead for ${lead.customerName}`}
            title="Edit"
            onClick={() => setEditTarget(lead)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon icon={Delete} size="sm" />}
            aria-label={`Delete lead for ${lead.customerName}`}
            title="Delete"
            className={styles.danger}
            onClick={() => setDeleteTarget(lead)}
          />
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  const filterLabel = filter === 'all' ? '' : ` for ${typeLabel(filter)}`;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every enquiry across services, from first contact to confirmation."
        actions={<Button onClick={() => setShowAdd(true)}>Add lead</Button>}
      />

      <Card
        title={filter === 'all' ? 'All leads' : `${typeLabel(filter)} leads`}
        description={loading ? 'Loading…' : `${leads.length} lead${leads.length === 1 ? '' : 's'}`}
      >
        <div className={styles.filters}>
          <Tabs options={FILTER_TABS} value={filter} onChange={setFilter} label="Filter leads by service" size="sm" />
        </div>
        <Table
          caption={`Leads${filterLabel}`}
          columns={columns}
          rows={leads}
          rowKey={(lead) => lead.id}
          loading={loading}
          error={error}
          onRetry={reload}
          minWidth={960}
          empty={
            <EmptyState
              icon={<Icon icon={SmartSearch} size="md" />}
              title={`No leads${filterLabel}`}
              description="New enquiries you add will show up here."
              action={<Button size="sm" onClick={() => setShowAdd(true)}>Add lead</Button>}
            />
          }
        />
      </Card>

      <AddLeadModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={reload} />

      <EditLeadModal
        isOpen={!!editTarget}
        lead={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={reload}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete lead"
        description={deleteTarget ? `Delete the lead for ${deleteTarget.customerName}? This can't be undone.` : ''}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

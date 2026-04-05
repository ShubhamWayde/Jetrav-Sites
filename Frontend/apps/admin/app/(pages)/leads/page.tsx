'use client';

import {useCallback, useEffect, useState} from 'react';
import {showError, showSuccess} from '@repo/auth';
import {api} from '@/lib/api';
import {ADMIN_API} from '@/lib/constants';
import {LEAD_TYPES, LeadResponse, LeadType} from '@/app/types/lead';
import AddLeadModal from '@/components/modals/create-lead/AddLeadModal';
import EditLeadModal from '@/components/modals/edit-lead/EditLeadModal';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import {LeadsIcon, PencilIcon, TrashIcon} from '@repo/ui/icon';
import Table, {type Column} from '@repo/ui/Table';
import styles from './leads.module.css';
import {formatDate} from '@/utility/date';
import Button from '@repo/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function detailVal(details: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = details[key];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '—';
}

function getTypeLabel(type: string): string {
  const found = LEAD_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS: { value: string; label: string }[] = [
  {value: '', label: 'All'},
  ...LEAD_TYPES,
];

// ── Dynamic column definitions per lead type ──────────────────────────────────

interface ColDef {
  header: string;
  keys: string[]
}

const TYPE_COLUMNS: Record<string, ColDef[]> = {
  '': [
    {header: 'Origin / City', keys: ['source', 'city', 'country']},
    {header: 'Destination', keys: ['destination']},
    {header: 'Date', keys: ['departure', 'checkIn', 'startDate', 'travelDate', 'pickupDate']},
    {header: 'Return / Out', keys: ['return', 'checkOut', 'endDate', 'dropDate']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
  ],
  air: [
    {header: 'Origin', keys: ['source']},
    {header: 'Destination', keys: ['destination']},
    {header: 'Departure', keys: ['departure']},
    {header: 'Return', keys: ['return']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
    {header: 'Infant', keys: ['infant']},
    {header: 'SSR', keys: ['ssr']},
  ],
  train: [
    {header: 'Source', keys: ['source']},
    {header: 'Destination', keys: ['destination']},
    {header: 'Departure', keys: ['departure']},
    {header: 'Return', keys: ['return']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
  ],
  hotel: [
    {header: 'City', keys: ['city']},
    {header: 'Check-In', keys: ['checkIn']},
    {header: 'Check-Out', keys: ['checkOut']},
    {header: 'Rooms', keys: ['rooms']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
  ],
  visa: [
    {header: 'Country', keys: ['country']},
    {header: 'Visa Type', keys: ['visaType']},
    {header: 'Travel Date', keys: ['travelDate']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
  ],
  insurance: [
    {header: 'Country', keys: ['country']},
    {header: 'Start Date', keys: ['startDate']},
    {header: 'End Date', keys: ['endDate']},
    {header: 'Adults', keys: ['adults']},
  ],
  bus: [
    {header: 'Source', keys: ['source']},
    {header: 'Destination', keys: ['destination']},
    {header: 'Departure', keys: ['departure']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
  ],
  car: [
    {header: 'Source', keys: ['source']},
    {header: 'Destination', keys: ['destination']},
    {header: 'Pickup Date', keys: ['pickupDate']},
    {header: 'Drop Date', keys: ['dropDate']},
    {header: 'Car Type', keys: ['carType']},
  ],
  foreign_exchange: [
    {header: 'Currency', keys: ['currency']},
    {header: 'Amount', keys: ['amount']},
    {header: 'Purpose', keys: ['purpose']},
  ],
  package: [
    {header: 'Destination', keys: ['destination']},
    {header: 'Start Date', keys: ['startDate']},
    {header: 'End Date', keys: ['endDate']},
    {header: 'Adults', keys: ['adults']},
    {header: 'Children', keys: ['children']},
    {header: 'Package Type', keys: ['packageType']},
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeFilter, setActiveFilter] = useState<LeadType | ''>('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<LeadResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchLeads = useCallback(async (typeFilter?: string) => {
    const filter = typeFilter !== undefined ? typeFilter : activeFilter;
    setLoading(true);
    setFetchError('');
    try {
      const url = filter ? `${ADMIN_API.LEADS}?type=${filter}` : ADMIN_API.LEADS;
      const res = await api.get<LeadResponse[]>(url);
      setLeads(res.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads.';
      setFetchError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (value: LeadType | '') => {
    setActiveFilter(value);
    fetchLeads(value);
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(ADMIN_API.LEAD_BY_ID(deleteTarget.id));
      showSuccess(res.message ?? 'Lead deleted successfully.');
      setDeleteTarget(null);
      fetchLeads();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete lead.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const typeCols: ColDef[] = TYPE_COLUMNS[activeFilter] ?? [];
  const showTypeCol = activeFilter === '';

  const columns: Column<LeadResponse>[] = [
    {
      key: 'customerName', header: 'Name',
      render: (lead) => <span className={styles.name}>{lead.customerName}</span>,
    },
    ...(showTypeCol ? [{
      key: 'type', header: 'Type',
      render: (lead: LeadResponse) => getTypeLabel(lead.type),
    }] : []),
    {
      key: 'status', header: 'Status',
      render: (lead) => {
        const statusClass = styles[`status${lead.status}` as keyof typeof styles];
        return (
          <span className={`${styles.statusBadge} ${statusClass ?? ''}`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
        );
      },
    },
    ...typeCols.map((col) => ({
      key: col.header,
      header: col.header,
      render: (lead: LeadResponse) => detailVal(lead.details ?? {}, ...col.keys),
    })),
    {
      key: 'mobileNumber', header: 'Mobile No.',
      render: (lead) => lead.mobileNumber || <span className={styles.muted}>—</span>,
    },
    {key: 'updatedAt', header: 'Updated On', render: (lead) => formatDate(lead.updatedAt)},
    {
      key: 'assignTo', header: 'Assign To',
      render: (lead) => lead.assignTo || <span className={styles.muted}>—</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (lead) => (
        <div className={styles.actions}>
          <button className={styles.editBtn} type="button" title="Edit lead"
                  onClick={() => setEditTarget(lead)}>
            <PencilIcon size={14} />
          </button>
          <button className={styles.deleteBtn} type="button" title="Delete lead"
                  onClick={() => setDeleteTarget(lead)}>
            <TrashIcon size={14} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Leads</h1>
        <Button title="Add Lead" className="btn-md" type="button" onClick={() => setShowAdd(true)}>
          + Add Lead
        </Button>
      </div>

      <div className={styles.filterBar}>
        {FILTER_TABS.map(({value, label}) => (
          <button
            key={value}
            type="button"
            className={`${styles.filterTab} ${activeFilter === value ? styles.filterTabActive : ''}`}
            onClick={() => handleFilterChange(value as LeadType | '')}
          >
            {label}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        rows={leads}
        rowKey={(lead) => lead.id}
        loading={loading}
        error={fetchError}
        onRetry={() => fetchLeads()}
        empty={
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><LeadsIcon size={40} /></span>
            <p>No leads yet{activeFilter ? ` for ${getTypeLabel(activeFilter)}` : ''}.</p>
          </div>
        }
      />

      <AddLeadModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={fetchLeads} />

      <EditLeadModal
        isOpen={!!editTarget}
        lead={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={fetchLeads}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Lead"
        description={deleteTarget ? `Are you sure you want to delete the lead for ${deleteTarget.customerName}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

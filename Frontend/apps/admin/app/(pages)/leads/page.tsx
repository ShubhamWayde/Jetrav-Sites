'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import { LEAD_TYPES, LeadResponse, LeadType } from '@/app/types/lead';
import AddLeadModal from '@/components/modals/create-lead/AddLeadModal';
import EditLeadModal from '@/components/modals/edit-lead/EditLeadModal';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import { LeadsIcon, PencilIcon, TrashIcon } from '@/components/ui/icons-library/Icons';
import styles from './leads.module.css';
import { formatDate } from '@/utility/date';

/** Extract a display value from a lead's details map, trying multiple keys. */
function detailVal(details: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = details[key];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '—';
}

/** Return the label for a lead type. */
function getTypeLabel(type: string): string {
  const found = LEAD_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

// ── Filter tab config ─────────────────────────────────────────────────────────

const FILTER_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...LEAD_TYPES,
];

// ── Dynamic column definitions per lead type ──────────────────────────────────

interface ColDef { header: string; keys: string[] }

const TYPE_COLUMNS: Record<string, ColDef[]> = {
  '': [
    { header: 'Origin / City',  keys: ['source', 'city', 'country'] },
    { header: 'Destination',    keys: ['destination'] },
    { header: 'Date',           keys: ['departure', 'checkIn', 'startDate', 'travelDate', 'pickupDate'] },
    { header: 'Return / Out',   keys: ['return', 'checkOut', 'endDate', 'dropDate'] },
    { header: 'Adults',         keys: ['adults'] },
    { header: 'Children',       keys: ['children'] },
  ],
  air: [
    { header: 'Origin',      keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Departure',   keys: ['departure'] },
    { header: 'Return',      keys: ['return'] },
    { header: 'Adults',      keys: ['adults'] },
    { header: 'Children',    keys: ['children'] },
    { header: 'Infant',      keys: ['infant'] },
    { header: 'SSR',         keys: ['ssr'] },
  ],
  train: [
    { header: 'Source',      keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Departure',   keys: ['departure'] },
    { header: 'Return',      keys: ['return'] },
    { header: 'Adults',      keys: ['adults'] },
    { header: 'Children',    keys: ['children'] },
  ],
  hotel: [
    { header: 'City',      keys: ['city'] },
    { header: 'Check-In',  keys: ['checkIn'] },
    { header: 'Check-Out', keys: ['checkOut'] },
    { header: 'Rooms',     keys: ['rooms'] },
    { header: 'Adults',    keys: ['adults'] },
    { header: 'Children',  keys: ['children'] },
  ],
  visa: [
    { header: 'Country',     keys: ['country'] },
    { header: 'Visa Type',   keys: ['visaType'] },
    { header: 'Travel Date', keys: ['travelDate'] },
    { header: 'Adults',      keys: ['adults'] },
    { header: 'Children',    keys: ['children'] },
  ],
  insurance: [
    { header: 'Country',    keys: ['country'] },
    { header: 'Start Date', keys: ['startDate'] },
    { header: 'End Date',   keys: ['endDate'] },
    { header: 'Adults',     keys: ['adults'] },
  ],
  bus: [
    { header: 'Source',      keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Departure',   keys: ['departure'] },
    { header: 'Adults',      keys: ['adults'] },
    { header: 'Children',    keys: ['children'] },
  ],
  car: [
    { header: 'Source',      keys: ['source'] },
    { header: 'Destination', keys: ['destination'] },
    { header: 'Pickup Date', keys: ['pickupDate'] },
    { header: 'Drop Date',   keys: ['dropDate'] },
    { header: 'Car Type',    keys: ['carType'] },
  ],
  foreign_exchange: [
    { header: 'Currency', keys: ['currency'] },
    { header: 'Amount',   keys: ['amount'] },
    { header: 'Purpose',  keys: ['purpose'] },
  ],
  package: [
    { header: 'Destination',   keys: ['destination'] },
    { header: 'Start Date',    keys: ['startDate'] },
    { header: 'End Date',      keys: ['endDate'] },
    { header: 'Adults',        keys: ['adults'] },
    { header: 'Children',      keys: ['children'] },
    { header: 'Package Type',  keys: ['packageType'] },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads]               = useState<LeadResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState('');
  const [activeFilter, setActiveFilter] = useState<LeadType | ''>('');

  // Modal states
  const [showAdd, setShowAdd]             = useState(false);
  const [editTarget, setEditTarget]       = useState<LeadResponse | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<LeadResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch leads ───────────────────────────────────────────────────────────

  const fetchLeads = useCallback(async (typeFilter?: string) => {
    const filter = typeFilter !== undefined ? typeFilter : activeFilter;
    setLoading(true);
    setFetchError('');
    try {
      const url = filter
        ? `${ADMIN_API.LEADS}?type=${filter}`
        : ADMIN_API.LEADS;
      const res = await api.get<LeadResponse[]>(url);
      setLeads(res.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads.';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Filter tab change ─────────────────────────────────────────────────────

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
      toast.success(res.message ?? 'Lead deleted successfully.');
      setDeleteTarget(null);
      fetchLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lead.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Dynamic columns ───────────────────────────────────────────────────────

  const typeCols: ColDef[] = TYPE_COLUMNS[activeFilter] ?? [];
  const showTypeCol = activeFilter === '';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Leads</h1>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setShowAdd(true)}
        >
          + Add Lead
        </button>
      </div>

      {/* ── Type filter tabs ─────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        {FILTER_TABS.map(({ value, label }) => (
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

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={styles.centered}>
          <span className={styles.spinner} />
          Loading leads…
        </div>
      ) : fetchError ? (
        <div className={styles.centered}>
          <span className={styles.errorText}>{fetchError}</span>
          <button className={styles.retryBtn} onClick={() => fetchLeads()}>Retry</button>
        </div>
      ) : leads.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><LeadsIcon size={40} /></span>
          <p>No leads yet{activeFilter ? ` for ${getTypeLabel(activeFilter)}` : ''}.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                {showTypeCol && <th className={styles.th}>Type</th>}
                <th className={styles.th}>Status</th>
                {typeCols.map((col) => (
                  <th key={col.header} className={styles.th}>{col.header}</th>
                ))}
                <th className={styles.th}>Mobile No.</th>
                <th className={styles.th}>Updated On</th>
                <th className={styles.th}>Assign To</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const d = lead.details ?? {};
                const statusClass = styles[`status${lead.status}` as keyof typeof styles];
                return (
                  <tr key={lead.id} className={styles.row}>
                    {/* Name */}
                    <td className={styles.td}>
                      <span className={styles.name}>{lead.customerName}</span>
                    </td>

                    {/* Type — only shown on All tab */}
                    {showTypeCol && (
                      <td className={styles.td}>{getTypeLabel(lead.type)}</td>
                    )}

                    {/* Status */}
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${statusClass ?? ''}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>

                    {/* Dynamic detail columns */}
                    {typeCols.map((col) => (
                      <td key={col.header} className={styles.td}>
                        {detailVal(d, ...col.keys)}
                      </td>
                    ))}

                    {/* Mobile */}
                    <td className={styles.td}>
                      {lead.mobileNumber || <span className={styles.muted}>—</span>}
                    </td>

                    {/* Updated On */}
                    <td className={styles.td}>{formatDate(lead.updatedAt)}</td>

                    {/* Assign To */}
                    <td className={styles.td}>
                      {lead.assignTo || <span className={styles.muted}>—</span>}
                    </td>

                    {/* Actions */}
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          type="button"
                          title="Edit lead"
                          onClick={() => setEditTarget(lead)}
                        >
                          <PencilIcon size={14} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          type="button"
                          title="Delete lead"
                          onClick={() => setDeleteTarget(lead)}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Lead modal ────────────────────────────────────────────────── */}
      <AddLeadModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchLeads}
      />

      {/* ── Edit Lead modal ───────────────────────────────────────────────── */}
      <EditLeadModal
        isOpen={!!editTarget}
        lead={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={fetchLeads}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Lead"
        description={
          deleteTarget
            ? `Are you sure you want to delete the lead for ${deleteTarget.customerName}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

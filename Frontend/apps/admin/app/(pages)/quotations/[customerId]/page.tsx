'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { showSuccess, showError } from '@repo/auth';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import { QUOTATION_TYPES, QuotationResponse } from '@/app/types/quotation';
import { CustomerResponse } from '@/app/types/customer';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import AddQuotationModal from '@/components/modals/create-quotation/AddQuotationModal';
import { ClipboardIcon, TrashIcon } from '@repo/ui/Icons';
import Table, { type Column } from '@repo/ui/Table';
import styles from './quotations.module.css';
import { formatDate } from '@/utility/date';
import Button from '@repo/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTypeLabel(type: string): string {
  const found = QUOTATION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function DetailsList({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details).filter(([, v]) => v !== '' && v !== null && v !== undefined);
  if (entries.length === 0) return <span className={styles.muted}>—</span>;
  return (
    <ul className={styles.detailsList}>
      {entries.map(([k, v]) => (
        <li key={k} className={styles.detailsItem}>
          <span className={styles.detailsKey}>{k}</span>
          <span className={styles.detailsVal}>{String(v)}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuotationsPage() {
  const params     = useParams();
  const router     = useRouter();
  const customerId = Number(params['customerId']);

  const [customer, setCustomer]         = useState<CustomerResponse | null>(null);
  const [quotations, setQuotations]     = useState<QuotationResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState('');
  const [showAdd, setShowAdd]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuotationResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [cRes, qRes] = await Promise.all([
        api.get<CustomerResponse>(ADMIN_API.CUSTOMER_BY_ID(customerId)),
        api.get<QuotationResponse[]>(ADMIN_API.QUOTATIONS(customerId)),
      ]);
      setCustomer(cRes.data ?? null);
      setQuotations(qRes.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load quotations.';
      setFetchError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(ADMIN_API.QUOTATION_BY_ID(customerId, deleteTarget.id));
      showSuccess(res.message ?? 'Quotation deleted successfully.');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete quotation.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<QuotationResponse>[] = [
    { key: 'index',    header: '#',         render: (_, i) => i + 1 },
    {
      key: 'type', header: 'Type',
      render: (q) => (
        <span className={`${styles.typeBadge} ${styles[`type_${q.type}`] ?? ''}`}>
          {getTypeLabel(q.type)}
        </span>
      ),
    },
    {
      key: 'details', header: 'Details',
      render: (q) => <DetailsList details={q.details as Record<string, unknown>} />,
    },
    {
      key: 'assignTo', header: 'Assign To',
      render: (q) => q.assignTo || <span className={styles.muted}>—</span>,
    },
    {
      key: 'remark', header: 'Remark',
      render: (q) => q.remark
        ? <span className={styles.remarkText}>{q.remark}</span>
        : <span className={styles.muted}>—</span>,
    },
    { key: 'createdAt', header: 'Created On', render: (q) => formatDate(q.createdAt) },
    {
      key: 'actions', header: 'Actions',
      render: (q) => (
        <button className={styles.deleteBtn} type="button" title="Delete quotation"
          onClick={() => setDeleteTarget(q)}>
          <TrashIcon size={14} />
        </button>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadCrumbs}>
            <Button title="Back to Customers" variant="ghost" type="button"
              onClick={() => router.push('/customers')}>
              ← Customers
            </Button>
            {customer && (
              <span className={styles.breadCrumb}>
                <span className={styles.breadSep}>/</span>
                <span className={styles.breadName}>{customer.fullName}</span>
              </span>
            )}
          </div>
          <h1 className={styles.pageTitle}>Quotations</h1>
        </div>
        <Button title="Add Quotation" className="btn-md" type="button" onClick={() => setShowAdd(true)}>
          + Add Quotation
        </Button>
      </div>

      <Table
        columns={columns}
        rows={quotations}
        rowKey={(q) => q.id}
        loading={loading}
        error={fetchError}
        onRetry={fetchData}
        empty={
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><ClipboardIcon size={40} /></span>
            <p>No quotations yet for this customer.</p>
          </div>
        }
      />

      <AddQuotationModal
        isOpen={showAdd}
        customerId={customerId}
        customerName={customer?.fullName ?? ''}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchData}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Quotation"
        description={deleteTarget ? `Are you sure you want to delete this ${getTypeLabel(deleteTarget.type)} quotation? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

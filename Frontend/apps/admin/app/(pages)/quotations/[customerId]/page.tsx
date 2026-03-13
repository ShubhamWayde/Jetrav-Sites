'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import { QUOTATION_TYPES, QuotationResponse } from '@/app/types/quotation';
import { CustomerResponse } from '@/app/types/customer';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import AddQuotationModal from '@/components/modals/create-quotation/AddQuotationModal';
import { ClipboardIcon, TrashIcon } from '@/components/ui/icons-library/Icons';
import styles from './quotations.module.css';
import { formatDate } from '@/utility/date';


// ── Helpers ───────────────────────────────────────────────────────────────────

function getTypeLabel(type: string): string {
  const found = QUOTATION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function DetailsList({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details).filter(
    ([, v]) => v !== '' && v !== null && v !== undefined,
  );
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

  const [customer, setCustomer]           = useState<CustomerResponse | null>(null);
  const [quotations, setQuotations]       = useState<QuotationResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState('');

  // Modal states
  const [showAdd, setShowAdd]             = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<QuotationResponse | null>(null);
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
      toast.error(msg);
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
      toast.success(res.message ?? 'Quotation deleted successfully.');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete quotation.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backBtn}
            type="button"
            onClick={() => router.push('/customers')}
          >
            ← Customers
          </button>
          {customer && (
            <span className={styles.breadCrumb}>
              <span className={styles.breadSep}>/</span>
              <span className={styles.breadName}>{customer.fullName}</span>
            </span>
          )}
          <h1 className={styles.pageTitle}>Quotations</h1>
        </div>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setShowAdd(true)}
        >
          + Add Quotation
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={styles.centered}>
          <span className={styles.spinner} />
          Loading quotations…
        </div>
      ) : fetchError ? (
        <div className={styles.centered}>
          <span className={styles.errorText}>{fetchError}</span>
          <button className={styles.retryBtn} onClick={fetchData}>Retry</button>
        </div>
      ) : quotations.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><ClipboardIcon size={40} /></span>
          <p>No quotations yet for this customer.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Details</th>
                <th className={styles.th}>Assign To</th>
                <th className={styles.th}>Remark</th>
                <th className={styles.th}>Created On</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q, i) => (
                <tr key={q.id} className={styles.row}>
                  <td className={styles.td}>{i + 1}</td>
                  <td className={styles.td}>
                    <span className={`${styles.typeBadge} ${styles[`type_${q.type}`] ?? ''}`}>
                      {getTypeLabel(q.type)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <DetailsList details={q.details as Record<string, unknown>} />
                  </td>
                  <td className={styles.td}>
                    {q.assignTo || <span className={styles.muted}>—</span>}
                  </td>
                  <td className={styles.td}>
                    {q.remark
                      ? <span className={styles.remarkText}>{q.remark}</span>
                      : <span className={styles.muted}>—</span>
                    }
                  </td>
                  <td className={styles.td}>{formatDate(q.createdAt)}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.deleteBtn}
                      type="button"
                      title="Delete quotation"
                      onClick={() => setDeleteTarget(q)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Quotation modal ──────────────────────────────────────────── */}
      <AddQuotationModal
        isOpen={showAdd}
        customerId={customerId}
        customerName={customer?.fullName ?? ''}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchData}
      />

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Quotation"
        description={
          deleteTarget
            ? `Are you sure you want to delete this ${getTypeLabel(deleteTarget.type)} quotation? This action cannot be undone.`
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

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import CustomerModal from '@/components/modals/create-customer/CustomerModal';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import AddQuotationModal from '@/components/modals/create-quotation/AddQuotationModal';
import { PencilIcon, TrashIcon, UsersIcon } from '@/components/ui/icons-library/Icons';
import styles from './customers.module.css';
import { CustomerResponse } from '@/app/types/customer';
import { formatDate, formatNumber } from '@/utility/date';

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers]         = useState<CustomerResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState('');

  // Modal states
  const [showCreate, setShowCreate]         = useState(false);
  const [editId, setEditId]                 = useState<number | undefined>();
  const [deleteTarget, setDeleteTarget]     = useState<CustomerResponse | null>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);
  const [quotationTarget, setQuotationTarget] = useState<CustomerResponse | null>(null);

  // ── Fetch list ───────────────────────────────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await api.get<CustomerResponse[]>(ADMIN_API.CUSTOMERS);
      setCustomers(res.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch customers.';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(ADMIN_API.CUSTOMER_BY_ID(deleteTarget.id));
      toast.success(res.message ?? `${deleteTarget.fullName} deleted successfully.`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete customer.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Quotation handlers ────────────────────────────────────────────────────

  const handleCreateQuotation = (customer: CustomerResponse) => {
    setQuotationTarget(customer);
  };

  const handleViewQuotations = (customer: CustomerResponse) => {
    router.push(`/quotations/${customer.id}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Customers</h1>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => { setEditId(undefined); setShowCreate(true); }}
        >
          + Add Customer
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={styles.centered}>
          <span className={styles.spinner} />
          Loading customers…
        </div>
      ) : fetchError ? (
        <div className={styles.centered}>
          <span className={styles.errorText}>{fetchError}</span>
          <button className={styles.retryBtn} onClick={fetchCustomers}>Retry</button>
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><UsersIcon size={40} /></span>
          <p>No customers yet.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: 32 }} />
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Plan Type</th>
                <th className={styles.th}>Jetcoins</th>
                <th className={styles.th}>Total Trips</th>
                <th className={styles.th}>Total Stays</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Mobile Number</th>
                <th className={styles.th}>Reference</th>
                <th className={styles.th}>Added on</th>
                <th className={styles.th}>Added by</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className={styles.row}>
                  <td className={styles.td}>
                    <span className={styles.radioIcon} />
                  </td>
                  <td className={styles.td}>
                    <span className={styles.name}>{c.fullName}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.planBadge} ${styles[`plan${c.planType}`] ?? ''}`}>
                      {c.planType}
                    </span>
                  </td>
                  <td className={styles.td}>{formatNumber(c.jetcoins)}</td>
                  <td className={styles.td}>{formatNumber(c.totalTrips)}</td>
                  <td className={styles.td}>{formatNumber(c.totalStays)}</td>
                  <td className={styles.td}>
                    {c.email
                      ? <a className={styles.emailLink} href={`mailto:${c.email}`}>{c.email}</a>
                      : <span className={styles.muted}>—</span>
                    }
                  </td>
                  <td className={styles.td}>{c.mobileNumber}</td>
                  <td className={styles.td}>
                    {c.reference || <span className={styles.muted}>—</span>}
                  </td>
                  <td className={styles.td}>{formatDate(c.addedOn)}</td>
                  <td className={styles.td}>{c.addedByName?.trim() || '—'}</td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        type="button"
                        title="Edit customer"
                        onClick={() => { setEditId(c.id); setShowCreate(true); }}
                      >
                        <PencilIcon size={14} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        type="button"
                        title="Delete customer"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <TrashIcon size={14} />
                      </button>
                      <button
                        className={styles.quotationBtn}
                        type="button"
                        title="Add quotation"
                        onClick={() => handleCreateQuotation(c)}
                      >
                        + Quotation
                      </button>
                      <button
                        className={styles.viewBtn}
                        type="button"
                        title="View quotations"
                        onClick={() => handleViewQuotations(c)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit modal ──────────────────────────────────────────── */}
      <CustomerModal
        isOpen={showCreate}
        customerId={editId}
        onClose={() => { setShowCreate(false); setEditId(undefined); }}
        onSuccess={fetchCustomers}
      />

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Customer"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.fullName}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* ── Add Quotation modal ───────────────────────────────────────────── */}
      <AddQuotationModal
        isOpen={!!quotationTarget}
        customerId={quotationTarget?.id ?? 0}
        customerName={quotationTarget?.fullName ?? ''}
        onClose={() => setQuotationTarget(null)}
        onSuccess={() => setQuotationTarget(null)}
      />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import CustomerModal from '@/components/modals/create-customer/CustomerModal';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import AddQuotationModal from '@/components/modals/create-quotation/AddQuotationModal';
import { PencilIcon, TrashIcon, UsersIcon } from '@repo/ui/Icons';
import Table, { Tr, Td } from '@repo/ui/Table';
import styles from './customers.module.css';
import { CustomerResponse } from '@/app/types/customer';
import Button from '@repo/ui/Button';
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
        <Button className='btn-md' type="button" onClick={() => { setEditId(undefined); setShowCreate(true); }}>
          + Add Customer
        </Button>
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
          <Button variant="secondary" onClick={fetchCustomers}>Retry</Button>
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><UsersIcon size={40} /></span>
          <p>No customers yet.</p>
        </div>
      ) : (
        <Table columns={[
          { header: '',              width: 32 },
          { header: 'Name' },
          { header: 'Plan Type' },
          { header: 'Jetcoins' },
          { header: 'Total Trips' },
          { header: 'Total Stays' },
          { header: 'Email' },
          { header: 'Mobile Number' },
          { header: 'Reference' },
          { header: 'Added on' },
          { header: 'Added by' },
          { header: 'Actions' },
        ]}>
          {customers.map((c) => (
            <Tr key={c.id}>
              <Td>
                <span className={styles.radioIcon} />
              </Td>
              <Td>
                <span className={styles.name}>{c.fullName}</span>
              </Td>
              <Td>
                <span className={`${styles.planBadge} ${styles[`plan${c.planType}`] ?? ''}`}>
                  {c.planType}
                </span>
              </Td>
              <Td>{formatNumber(c.jetcoins)}</Td>
              <Td>{formatNumber(c.totalTrips)}</Td>
              <Td>{formatNumber(c.totalStays)}</Td>
              <Td>
                {c.email
                  ? <a className={styles.emailLink} href={`mailto:${c.email}`}>{c.email}</a>
                  : <span className={styles.muted}>—</span>
                }
              </Td>
              <Td>{c.mobileNumber}</Td>
              <Td>
                {c.reference || <span className={styles.muted}>—</span>}
              </Td>
              <Td>{formatDate(c.addedOn)}</Td>
              <Td>{c.addedByName?.trim() || '—'}</Td>
              <Td>
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
                  <Button className='btn-sm' variant="secondary" type="button" title="Add quotation" onClick={() => handleCreateQuotation(c)}>
                    + Quotation
                  </Button>
                  <Button className='btn-sm' variant="secondary" type="button" title="View quotations" onClick={() => handleViewQuotations(c)}>
                    View
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
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

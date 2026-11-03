'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import InputField from '@repo/ui/InputField';
import { PageHeader } from '@repo/ui/PageHeader';
import Table, { type Column } from '@repo/ui/Table';
import { Delete, Edit, Icon, Workspaces } from '@repo/ui/icon';
import { ADMIN_API } from '@/lib/constants';
import { formatDate, formatNumber } from '@/lib/format';
import { planTone } from '@/lib/tones';
import { useApiQuery } from '@/lib/useApiQuery';
import type { CustomerResponse } from '@/app/types/customer';
import CustomerModal from '@/components/modals/create-customer/CustomerModal';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import AddQuotationModal from '@/components/modals/create-quotation/AddQuotationModal';
import styles from './customers.module.css';

// `undefined` = closed, `null` = create, number = edit that customer
type EditorState = number | null | undefined;

export default function CustomersPage() {
  const { data, loading, error, reload } = useApiQuery<CustomerResponse[]>(
    ADMIN_API.CUSTOMERS,
    'Failed to load customers.',
  );
  const customers = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<EditorState>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CustomerResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [quotationTarget, setQuotationTarget] = useState<CustomerResponse | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        (c.email ?? '').toLowerCase().includes(q),
    );
  }, [customers, search]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await api.delete(ADMIN_API.CUSTOMER_BY_ID(deleteTarget.id));
      showSuccess(res.message || `${deleteTarget.fullName} deleted.`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete customer.'));
    } finally {
      setDeleting(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<CustomerResponse>[] = [
    {
      key: 'fullName',
      header: 'Customer',
      render: (c) => (
        <div className={styles.customer}>
          <Link href={`/quotations/${c.id}`} className={styles.name}>
            {c.fullName}
          </Link>
          <span className={styles.sub}>
            {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : 'No email'}
          </span>
        </div>
      ),
    },
    { key: 'mobileNumber', header: 'Mobile' },
    {
      key: 'planType',
      header: 'Plan',
      render: (c) => <Badge tone={planTone(c.planType)}>{c.planType}</Badge>,
    },
    { key: 'jetcoins', header: 'Jetcoins', align: 'right', render: (c) => formatNumber(c.jetcoins) },
    { key: 'totalTrips', header: 'Trips', align: 'right', render: (c) => formatNumber(c.totalTrips) },
    { key: 'totalStays', header: 'Stays', align: 'right', render: (c) => formatNumber(c.totalStays) },
    { key: 'reference', header: 'Reference', render: (c) => c.reference || '—' },
    {
      key: 'addedOn',
      header: 'Added',
      render: (c) => (
        <div className={styles.customer}>
          <span>{formatDate(c.addedOn)}</span>
          <span className={styles.sub}>{c.addedByName?.trim() || '—'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => setQuotationTarget(c)}>
            Add quotation
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon icon={Edit} size="sm" />}
            aria-label={`Edit ${c.fullName}`}
            title="Edit"
            onClick={() => setEditor(c.id)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon icon={Delete} size="sm" />}
            aria-label={`Delete ${c.fullName}`}
            title="Delete"
            className={styles.danger}
            onClick={() => setDeleteTarget(c)}
          />
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone you've added, their plan and travel history. Open a customer to see their quotations."
        actions={<Button onClick={() => setEditor(null)}>Add customer</Button>}
      />

      <Card
        title="All customers"
        description={loading ? 'Loading…' : `${rows.length} of ${customers.length} shown`}
        actions={
          <div className={styles.search}>
            <InputField
              id="customer-search"
              type="search"
              aria-label="Search customers"
              placeholder="Search name, mobile or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      >
        <Table
          caption="Customers"
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          loading={loading}
          error={error}
          onRetry={reload}
          minWidth={1040}
          empty={
            search ? (
              <EmptyState title="No matching customers" description="Try a different name, number or email." />
            ) : (
              <EmptyState
                icon={<Icon icon={Workspaces} size="md" />}
                title="No customers yet"
                description="Add your first customer to start creating leads and quotations."
                action={<Button size="sm" onClick={() => setEditor(null)}>Add customer</Button>}
              />
            )
          }
        />
      </Card>

      <CustomerModal
        isOpen={editor !== undefined}
        customerId={editor ?? undefined}
        onClose={() => setEditor(undefined)}
        onSuccess={reload}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete customer"
        description={
          deleteTarget ? `Delete ${deleteTarget.fullName}? This can't be undone.` : ''
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <AddQuotationModal
        isOpen={!!quotationTarget}
        customerId={quotationTarget?.id ?? 0}
        customerName={quotationTarget?.fullName ?? ''}
        onClose={() => setQuotationTarget(null)}
        onSuccess={() => setQuotationTarget(null)}
      />
    </>
  );
}

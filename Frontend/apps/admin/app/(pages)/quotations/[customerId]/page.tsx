'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, getErrorMessage, showError, showSuccess } from '@repo/auth';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import { PageHeader } from '@repo/ui/PageHeader';
import Table, { type Column } from '@repo/ui/Table';
import { Delete, Icon, TrackBooking } from '@repo/ui/icon';
import { ADMIN_API } from '@/lib/constants';
import { formatDate, formatNumber, humanizeKey } from '@/lib/format';
import { planTone } from '@/lib/tones';
import { useApiQuery } from '@/lib/useApiQuery';
import type { CustomerResponse } from '@/app/types/customer';
import { QUOTATION_TYPES, type QuotationResponse } from '@/app/types/quotation';
import ConfirmDeleteModal from '@/components/modals/confirm-delete/ConfirmDeleteModal';
import AddQuotationModal from '@/components/modals/create-quotation/AddQuotationModal';
import styles from './quotations.module.css';

const DATE_KEY_RE = /date|departure|return|check(in|out)/i;

function typeLabel(type: string): string {
  return QUOTATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Parses the route param; anything but a positive integer is "not found". */
function parseCustomerId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function DetailsList({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details ?? {}).filter(([, v]) => v !== '' && v !== null && v !== undefined);
  if (entries.length === 0) return <span className={styles.muted}>—</span>;
  return (
    <dl className={styles.details}>
      {entries.map(([key, value]) => (
        <div key={key} className={styles.detail}>
          <dt>{humanizeKey(key)}</dt>
          <dd>{DATE_KEY_RE.test(key) ? formatDate(value) : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuotationsPage() {
  const customerId = parseCustomerId(useParams<{ customerId: string }>().customerId);

  if (customerId === null) {
    return (
      <>
        <PageHeader title="Customer not found" eyebrow={<Link href="/customers">← Customers</Link>} />
        <Card>
          <EmptyState
            title="This customer doesn't exist"
            description="The link may be wrong or the customer may have been deleted."
            action={
              <Link href="/customers" className={styles.backLink}>
                Back to customers
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  return <CustomerQuotations customerId={customerId} />;
}

function CustomerQuotations({ customerId }: { customerId: number }) {
  const customerQuery = useApiQuery<CustomerResponse>(ADMIN_API.CUSTOMER_BY_ID(customerId), 'Failed to load customer.');
  const quotationsQuery = useApiQuery<QuotationResponse[]>(
    ADMIN_API.QUOTATIONS(customerId),
    'Failed to load quotations.',
  );
  const customer = customerQuery.data;
  const quotations = quotationsQuery.data ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuotationResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await api.delete(ADMIN_API.QUOTATION_BY_ID(customerId, deleteTarget.id));
      showSuccess(res.message || 'Quotation deleted.');
      setDeleteTarget(null);
      quotationsQuery.reload();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete quotation.'));
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<QuotationResponse>[] = [
    { key: 'index', header: '#', width: 48, render: (_, i) => i + 1 },
    { key: 'type', header: 'Service', render: (q) => <Badge tone="accent">{typeLabel(q.type)}</Badge> },
    { key: 'details', header: 'Details', render: (q) => <DetailsList details={q.details} /> },
    { key: 'assignTo', header: 'Assigned to', render: (q) => q.assignTo || '—' },
    {
      key: 'remark',
      header: 'Remark',
      render: (q) => (q.remark ? <span className={styles.remark} title={q.remark}>{q.remark}</span> : '—'),
    },
    { key: 'createdAt', header: 'Created', render: (q) => formatDate(q.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (q) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon icon={Delete} size="sm" />}
          aria-label={`Delete ${typeLabel(q.type)} quotation #${q.id}`}
          title="Delete"
          className={styles.danger}
          onClick={() => setDeleteTarget(q)}
        />
      ),
    },
  ];

  const name = customer?.fullName ?? '';

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/customers">← Customers</Link>}
        title={name ? `Quotations · ${name}` : 'Quotations'}
        description={
          customer ? (
            <span className={styles.meta}>
              <Badge tone={planTone(customer.planType)}>{customer.planType}</Badge>
              <span>{customer.mobileNumber}</span>
              {customer.email && <a href={`mailto:${customer.email}`}>{customer.email}</a>}
              <span>{formatNumber(customer.jetcoins)} Jetcoins</span>
            </span>
          ) : customerQuery.error ? (
            customerQuery.error
          ) : undefined
        }
        actions={<Button onClick={() => setShowAdd(true)}>Add quotation</Button>}
      />

      <Card
        title="Quotations"
        description={
          quotationsQuery.loading ? 'Loading…' : `${quotations.length} quotation${quotations.length === 1 ? '' : 's'}`
        }
      >
        <Table
          caption={name ? `Quotations for ${name}` : 'Quotations'}
          columns={columns}
          rows={quotations}
          rowKey={(q) => q.id}
          loading={quotationsQuery.loading}
          error={quotationsQuery.error}
          onRetry={quotationsQuery.reload}
          minWidth={900}
          empty={
            <EmptyState
              icon={<Icon icon={TrackBooking} size="md" />}
              title="No quotations yet"
              description="Quotations you send this customer will be listed here."
              action={<Button size="sm" onClick={() => setShowAdd(true)}>Add quotation</Button>}
            />
          }
        />
      </Card>

      <AddQuotationModal
        isOpen={showAdd}
        customerId={customerId}
        customerName={name}
        onClose={() => setShowAdd(false)}
        onSuccess={quotationsQuery.reload}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete quotation"
        description={
          deleteTarget ? `Delete this ${typeLabel(deleteTarget.type)} quotation? This can't be undone.` : ''
        }
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

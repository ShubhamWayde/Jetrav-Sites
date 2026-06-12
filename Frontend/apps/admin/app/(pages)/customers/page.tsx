"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@repo/auth";
import { api } from "@/lib/api";
import { ADMIN_API } from "@/lib/constants";
import CustomerModal from "@/components/modals/create-customer/CustomerModal";
import ConfirmDeleteModal from "@/components/modals/confirm-delete/ConfirmDeleteModal";
import AddQuotationModal from "@/components/modals/create-quotation/AddQuotationModal";
import { Icon, Edit, Delete, Workspaces } from "@repo/ui/icon";
import Table, { type Column } from "@repo/ui/table";
import styles from "./customers.module.css";
import { CustomerResponse } from "@/app/types/customer";
import Button from "@repo/ui/button";
import { formatDate, formatNumber } from "@/utility/date";

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CustomerResponse | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quotationTarget, setQuotationTarget] =
    useState<CustomerResponse | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get<CustomerResponse[]>(ADMIN_API.CUSTOMERS);
      setCustomers(res.data ?? []);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch customers.";
      setFetchError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(ADMIN_API.CUSTOMER_BY_ID(deleteTarget.id));
      showSuccess(
        res.message ?? `${deleteTarget.fullName} deleted successfully.`,
      );
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete customer.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<CustomerResponse>[] = [
    {
      key: "radio",
      header: "",
      width: 32,
      render: () => <span className={styles.radioIcon} />,
    },
    {
      key: "fullName",
      header: "Name",
      render: (c) => <span className={styles.name}>{c.fullName}</span>,
    },
    {
      key: "planType",
      header: "Plan Type",
      render: (c) => (
        <span
          className={`${styles.planBadge} ${styles[`plan${c.planType}`] ?? ""}`}
        >
          {c.planType}
        </span>
      ),
    },
    {
      key: "jetcoins",
      header: "Jetcoins",
      render: (c) => formatNumber(c.jetcoins),
    },
    {
      key: "totalTrips",
      header: "Total Trips",
      render: (c) => formatNumber(c.totalTrips),
    },
    {
      key: "totalStays",
      header: "Total Stays",
      render: (c) => formatNumber(c.totalStays),
    },
    {
      key: "email",
      header: "Email",
      render: (c) =>
        c.email ? (
          <a className={styles.emailLink} href={`mailto:${c.email}`}>
            {c.email}
          </a>
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
    { key: "mobileNumber", header: "Mobile Number" },
    {
      key: "reference",
      header: "Reference",
      render: (c) => c.reference || <span className={styles.muted}>—</span>,
    },
    {
      key: "addedOn",
      header: "Added on",
      render: (c) => formatDate(c.addedOn),
    },
    {
      key: "addedByName",
      header: "Added by",
      render: (c) => c.addedByName?.trim() || "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className={styles.actions}>
          <button
            className={styles.editBtn}
            type="button"
            title="Edit customer"
            onClick={() => {
              setEditId(c.id);
              setShowCreate(true);
            }}
          >
            <Icon icon={Edit} size="sm" />
          </button>
          <button
            className={styles.deleteBtn}
            type="button"
            title="Delete customer"
            onClick={() => setDeleteTarget(c)}
          >
            <Icon icon={Delete} size="sm" />
          </button>
          <Button
            className="btn-sm"
            variant="secondary"
            type="button"
            title="Add quotation"
            onClick={() => setQuotationTarget(c)}
          >
            + Quotation
          </Button>
          <Button
            className="btn-sm"
            variant="secondary"
            type="button"
            title="View quotations"
            onClick={() => router.push(`/quotations/${c.id}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Customers</h1>
        <Button
          title="Add Customer"
          className="btn-md"
          type="button"
          onClick={() => {
            setEditId(undefined);
            setShowCreate(true);
          }}
        >
          + Add Customer
        </Button>
      </div>

      <Table
        columns={columns}
        rows={customers}
        rowKey={(c) => c.id}
        loading={loading}
        error={fetchError}
        onRetry={fetchCustomers}
        empty={
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Icon icon={Workspaces} size="xl" />
            </span>
            <p>No customers yet.</p>
          </div>
        }
      />

      <CustomerModal
        isOpen={showCreate}
        customerId={editId}
        onClose={() => {
          setShowCreate(false);
          setEditId(undefined);
        }}
        onSuccess={fetchCustomers}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Customer"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.fullName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <AddQuotationModal
        isOpen={!!quotationTarget}
        customerId={quotationTarget?.id ?? 0}
        customerName={quotationTarget?.fullName ?? ""}
        onClose={() => setQuotationTarget(null)}
        onSuccess={() => setQuotationTarget(null)}
      />
    </div>
  );
}

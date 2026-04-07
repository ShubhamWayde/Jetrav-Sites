"use client";

import { useCallback, useEffect, useState } from "react";
import { showSuccess, showError } from "@repo/auth";
import InputField from "@repo/ui/InputField";
import TextareaField from "@repo/ui/TextareaField";
import { api } from "@/lib/api";
import { ADMIN_API } from "@/lib/constants";
import {
  LEAD_DEFAULT_DETAILS,
  LEAD_STATUSES,
  LEAD_TYPES,
  LeadDetails,
  LeadResponse,
  LeadStatus,
  LeadType,
} from "@/app/types/lead";
import SelectField from "@repo/ui/SelectField";
import Button from "@repo/ui/Button";
import Modal, { ModalFooter } from "@repo/ui/Modal";
import styles from "./EditLeadModal.module.css";

function countOptions(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => ({
    value: String(i),
    label: String(i),
  }));
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface EditLeadModalProps {
  isOpen: boolean;
  lead: LeadResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditLeadModal({
  isOpen,
  lead,
  onClose,
  onSuccess,
}: EditLeadModalProps) {
  const [activeTab, setActiveTab] = useState<LeadType>("air");
  const [details, setDetails] = useState<LeadDetails>({
    ...LEAD_DEFAULT_DETAILS.air,
  });
  const [status, setStatus] = useState<LeadStatus>("quotation");
  const [assignTo, setAssignTo] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Populate from lead when it changes ────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !lead) return;

    setActiveTab(lead.type);
    setStatus(lead.status);
    setAssignTo(lead.assignTo ?? "");
    setRemark(lead.remark ?? "");

    // Convert Record<string, unknown> → Record<string, string> for form state
    const converted: LeadDetails = Object.fromEntries(
      Object.entries(lead.details ?? {}).map(([k, v]) => [k, String(v ?? "")]),
    );
    // Merge with defaults to ensure all fields for the type exist
    setDetails({ ...LEAD_DEFAULT_DETAILS[lead.type], ...converted });
  }, [isOpen, lead]);

  // ── Tab change ────────────────────────────────────────────────────────────
  // Must be defined before the early return to satisfy Rules of Hooks.

  const handleTabChange = useCallback(
    (tab: LeadType) => {
      if (tab === activeTab) return; // keep existing details for same type
      setActiveTab(tab);
      setDetails({ ...LEAD_DEFAULT_DETAILS[tab] });
    },
    [activeTab],
  );

  // ── Detail field updater ──────────────────────────────────────────────────

  const handleDetailChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!lead) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        type: activeTab,
        status,
        details,
        assignTo: assignTo.trim(),
        remark: remark.trim(),
      };

      const res = await api.put(ADMIN_API.LEAD_BY_ID(lead.id), body);
      showSuccess(res.message ?? "Lead updated successfully.");
      onSuccess();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update lead.");
    } finally {
      setLoading(false);
    }
  };

  // ── Per-type dynamic fields ───────────────────────────────────────────────

  const renderTypeFields = () => {
    switch (activeTab) {
      case "air":
        return (
          <>
            <div className={styles.row2}>
              <InputField
                label="Source"
                value={details["source"] ?? ""}
                onChange={handleDetailChange("source")}
                placeholder="e.g. Mumbai (BOM)"
              />
              <InputField
                label="Destination"
                value={details["destination"] ?? ""}
                onChange={handleDetailChange("destination")}
                placeholder="e.g. Dubai (DXB)"
              />
            </div>
            <div className={styles.row2}>
              <InputField
                label="Departure"
                type="date"
                value={details["departure"] ?? ""}
                onChange={handleDetailChange("departure")}
              />
              <InputField
                label="Return"
                type="date"
                value={details["return"] ?? ""}
                onChange={handleDetailChange("return")}
              />
            </div>
            <div className={styles.row3}>
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
              <SelectField
                label="Children"
                value={details["children"] ?? "0"}
                onChange={handleDetailChange("children")}
                options={countOptions(10)}
              />
              <SelectField
                label="Infant"
                value={details["infant"] ?? "0"}
                onChange={handleDetailChange("infant")}
                options={countOptions(5)}
              />
            </div>
            <div className={styles.row1}>
              <InputField
                label="SSR (Special Service Request)"
                value={details["ssr"] ?? ""}
                onChange={handleDetailChange("ssr")}
                placeholder="e.g. Wheelchair, Vegan meal"
              />
            </div>
          </>
        );

      case "train":
        return (
          <>
            <div className={styles.row2}>
              <InputField
                label="Source"
                value={details["source"] ?? ""}
                onChange={handleDetailChange("source")}
                placeholder="e.g. Mumbai"
              />
              <InputField
                label="Destination"
                value={details["destination"] ?? ""}
                onChange={handleDetailChange("destination")}
                placeholder="e.g. Delhi"
              />
            </div>
            <div className={styles.row2}>
              <InputField
                label="Departure"
                type="date"
                value={details["departure"] ?? ""}
                onChange={handleDetailChange("departure")}
              />
              <InputField
                label="Return"
                type="date"
                value={details["return"] ?? ""}
                onChange={handleDetailChange("return")}
              />
            </div>
            <div className={styles.row2}>
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
              <SelectField
                label="Children"
                value={details["children"] ?? "0"}
                onChange={handleDetailChange("children")}
                options={countOptions(10)}
              />
            </div>
          </>
        );

      case "hotel":
        return (
          <>
            <div className={styles.row1}>
              <InputField
                label="City"
                value={details["city"] ?? ""}
                onChange={handleDetailChange("city")}
                placeholder="e.g. Dubai"
              />
            </div>
            <div className={styles.row2}>
              <InputField
                label="Check-In"
                type="date"
                value={details["checkIn"] ?? ""}
                onChange={handleDetailChange("checkIn")}
              />
              <InputField
                label="Check-Out"
                type="date"
                value={details["checkOut"] ?? ""}
                onChange={handleDetailChange("checkOut")}
              />
            </div>
            <div className={styles.row3}>
              <SelectField
                label="Rooms"
                value={details["rooms"] ?? "1"}
                onChange={handleDetailChange("rooms")}
                options={countOptions(10)}
              />
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
              <SelectField
                label="Children"
                value={details["children"] ?? "0"}
                onChange={handleDetailChange("children")}
                options={countOptions(10)}
              />
            </div>
          </>
        );

      case "visa":
        return (
          <>
            <div className={styles.row2}>
              <InputField
                label="Country"
                value={details["country"] ?? ""}
                onChange={handleDetailChange("country")}
                placeholder="e.g. UAE"
              />
              <InputField
                label="Visa Type"
                value={details["visaType"] ?? ""}
                onChange={handleDetailChange("visaType")}
                placeholder="e.g. Tourist"
              />
            </div>
            <div className={styles.row1}>
              <InputField
                label="Travel Date"
                type="date"
                value={details["travelDate"] ?? ""}
                onChange={handleDetailChange("travelDate")}
              />
            </div>
            <div className={styles.row2}>
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
              <SelectField
                label="Children"
                value={details["children"] ?? "0"}
                onChange={handleDetailChange("children")}
                options={countOptions(10)}
              />
            </div>
          </>
        );

      case "insurance":
        return (
          <>
            <div className={styles.row1}>
              <InputField
                label="Country"
                value={details["country"] ?? ""}
                onChange={handleDetailChange("country")}
                placeholder="e.g. Europe"
              />
            </div>
            <div className={styles.row2}>
              <InputField
                label="Start Date"
                type="date"
                value={details["startDate"] ?? ""}
                onChange={handleDetailChange("startDate")}
              />
              <InputField
                label="End Date"
                type="date"
                value={details["endDate"] ?? ""}
                onChange={handleDetailChange("endDate")}
              />
            </div>
            <div className={styles.row1}>
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
            </div>
          </>
        );

      case "bus":
        return (
          <>
            <div className={styles.row2}>
              <InputField
                label="Source"
                value={details["source"] ?? ""}
                onChange={handleDetailChange("source")}
                placeholder="e.g. Mumbai"
              />
              <InputField
                label="Destination"
                value={details["destination"] ?? ""}
                onChange={handleDetailChange("destination")}
                placeholder="e.g. Pune"
              />
            </div>
            <div className={styles.row1}>
              <InputField
                label="Departure"
                type="date"
                value={details["departure"] ?? ""}
                onChange={handleDetailChange("departure")}
              />
            </div>
            <div className={styles.row2}>
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
              <SelectField
                label="Children"
                value={details["children"] ?? "0"}
                onChange={handleDetailChange("children")}
                options={countOptions(10)}
              />
            </div>
          </>
        );

      case "car":
        return (
          <>
            <div className={styles.row2}>
              <InputField
                label="Source"
                value={details["source"] ?? ""}
                onChange={handleDetailChange("source")}
                placeholder="e.g. Mumbai"
              />
              <InputField
                label="Destination"
                value={details["destination"] ?? ""}
                onChange={handleDetailChange("destination")}
                placeholder="e.g. Pune"
              />
            </div>
            <div className={styles.row2}>
              <InputField
                label="Pickup Date"
                type="date"
                value={details["pickupDate"] ?? ""}
                onChange={handleDetailChange("pickupDate")}
              />
              <InputField
                label="Drop Date"
                type="date"
                value={details["dropDate"] ?? ""}
                onChange={handleDetailChange("dropDate")}
              />
            </div>
            <div className={styles.row1}>
              <InputField
                label="Car Type"
                value={details["carType"] ?? ""}
                onChange={handleDetailChange("carType")}
                placeholder="e.g. Sedan, SUV"
              />
            </div>
          </>
        );

      case "foreign_exchange":
        return (
          <>
            <div className={styles.row2}>
              <InputField
                label="Currency"
                value={details["currency"] ?? ""}
                onChange={handleDetailChange("currency")}
                placeholder="e.g. USD"
              />
              <InputField
                label="Amount"
                type="number"
                value={details["amount"] ?? ""}
                onChange={handleDetailChange("amount")}
                placeholder="0"
              />
            </div>
            <div className={styles.row1}>
              <InputField
                label="Purpose"
                value={details["purpose"] ?? ""}
                onChange={handleDetailChange("purpose")}
                placeholder="e.g. Travel, Business"
              />
            </div>
          </>
        );

      case "package":
        return (
          <>
            <div className={styles.row1}>
              <InputField
                label="Destination"
                value={details["destination"] ?? ""}
                onChange={handleDetailChange("destination")}
                placeholder="e.g. Dubai"
              />
            </div>
            <div className={styles.row2}>
              <InputField
                label="Start Date"
                type="date"
                value={details["startDate"] ?? ""}
                onChange={handleDetailChange("startDate")}
              />
              <InputField
                label="End Date"
                type="date"
                value={details["endDate"] ?? ""}
                onChange={handleDetailChange("endDate")}
              />
            </div>
            <div className={styles.row3}>
              <SelectField
                label="Adults"
                value={details["adults"] ?? "1"}
                onChange={handleDetailChange("adults")}
                options={countOptions(10)}
              />
              <SelectField
                label="Children"
                value={details["children"] ?? "0"}
                onChange={handleDetailChange("children")}
                options={countOptions(10)}
              />
              <SelectField
                label="Package Type"
                value={details["packageType"] ?? "domestic"}
                onChange={handleDetailChange("packageType")}
                options={[
                  { value: "domestic", label: "Domestic" },
                  { value: "international", label: "International" },
                ]}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Lead"
      subtitle={`Edit ${lead?.customerName} lead data`}
      maxWidth={720}
    >
      {/* ── Type tab bar ─────────────────────────────────────────────── */}
      <div className={styles.tabBar}>
        {LEAD_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`${styles.tab} ${activeTab === value ? styles.tabActive : ""}`}
            onClick={() => handleTabChange(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.formWrapper}>
          {/* Type-specific fields */}
          {renderTypeFields()}

          {/* Status */}
          <div className={styles.row1}>
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              options={LEAD_STATUSES.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </div>

          {/* Assign To */}
          <div className={styles.row1}>
            <InputField
              label="Assign To"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              placeholder="e.g. John (Sales)"
            />
          </div>

          {/* Remark */}
          <div className={styles.row1}>
            <TextareaField
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Any additional notes…"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button
            title="Cancel"
            className="btn-md"
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            title="Save Lead Changes"
            className="btn-md"
            type="submit"
            loading={loading}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

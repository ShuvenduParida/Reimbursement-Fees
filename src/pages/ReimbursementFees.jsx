// src/pages/ReimbursementFees.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { FiPlus, FiAlertCircle, FiRefreshCw, FiDownload, FiBarChart2, FiList } from "react-icons/fi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import DashboardLayout from "../components/layout/DashboardLayout";
import SummaryCards from "../components/reimbursement/SummaryCards";
import ReimbursementFilters from "../components/reimbursement/ReimbursementFilters";
import ReimbursementTable from "../components/reimbursement/ReimbursementTable";
import ReimbursementDetailsModal from "../components/reimbursement/ReimbursementDetailsModal";
import ReimbursementUploadModal from "../components/reimbursement/ReimbursementUploadModal"; // NEW
import { getReimbursementOrderList } from "../services/productServices";
import {
  filterRecords,
  safeText,
  formatApiDate,
  getOutstandingAmount,
  getPaymentStatusLabel,
} from "../utils/reimbursementUtils";
import {
  AMOUNT_RANGE_OPTIONS,
  DUE_RANGE_OPTIONS,
  resolveAmount,
  applyAmountRange,
  applyDueRange,
} from "../utils/reimbursementFilterRanges";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  search: "",
  customer: "",
  status: "",
  overdue: "",
  amountRange: "all",
  dueRange: "",
  dateFrom: "",
  dateTo: "",
};

// ---- Range filters ----
// The amount-range definitions/logic (AMOUNT_RANGE_OPTIONS, resolveAmount,
// applyAmountRange) now live in utils/reimbursementFilterRanges.js, moved
// unchanged, so the Dashboard charts use exactly the same boundaries and the
// same amount-field detection as this page. dueRange is the new companion
// filter set by the Dashboard's Due Date chart.

// The Dashboard links here with ?amountRange=... or ?dueRange=... . Only known
// values are accepted; anything else is ignored.
const readFiltersFromUrl = (searchParams) => {
  const amountRange = searchParams.get("amountRange");
  const dueRange = searchParams.get("dueRange");
  return {
    ...EMPTY_FILTERS,
    amountRange: AMOUNT_RANGE_OPTIONS.some((o) => o.value === amountRange)
      ? amountRange
      : EMPTY_FILTERS.amountRange,
    dueRange: DUE_RANGE_OPTIONS.some((o) => o.value === dueRange) ? dueRange : EMPTY_FILTERS.dueRange,
  };
};

// ---- Page-level styling (moved out of ReimbursementFees.css) ----

const Page = styled.div`
  width: 100%;
  max-width: 1500px;
  box-sizing: border-box;
  margin: 0 auto;
  min-width: 0;
  padding: 24px 24px 40px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-family: var(--rf-font-serif, inherit);
  font-size: 28px;
  font-weight: 700;
  color: var(--rf-ink);
  margin: 0 0 4px;
`;

const Subtitle = styled.p`
  font-size: 13.5px;
  color: var(--rf-slate);
  margin: 0;
`;

// Scrollbar fix: this bar used to draw its bottom rule with `border-bottom`
// and let each tab overlap it with `margin-bottom: -1px`. Because the bar has
// `overflow-x: auto` (kept so the tabs can scroll sideways on very narrow
// screens), CSS also computes overflow-y as `auto`, so the 1px the tabs
// stuck out below the bar's padding box counted as scrollable overflow and a
// scrollbar appeared. Now the rule is an inset box-shadow (paints inside the
// bar, adds no overflow), the tabs no longer use a negative margin, and
// overflow-y is explicitly hidden. The horizontal scroll still appears, but
// only when the tabs genuinely don't fit.
const TabBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 20px;
  box-shadow: inset 0 -1px 0 var(--rf-line);
  overflow-x: auto;
  overflow-y: hidden;
`;

const Tab = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 12px 26px;
  border: 1px solid ${({ $active }) => ($active ? "var(--rf-brass)" : "transparent")};
  border-bottom: none;
  border-radius: var(--rf-radius-md) var(--rf-radius-md) 0 0;
  background: ${({ $active }) => ($active ? "var(--rf-brass-soft)" : "var(--rf-paper)")};
  color: ${({ $active }) => ($active ? "var(--rf-brass-dark)" : "var(--rf-ink-soft)")};
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  cursor: ${({ $active }) => ($active ? "default" : "pointer")};
  transition: background-color 0.15s ease, color 0.15s ease;

  &::after {
    content: "";
    position: absolute;
    left: 26px;
    right: 26px;
    bottom: 0;
    height: 3px;
    border-radius: 2px 2px 0 0;
    background: ${({ $active }) => ($active ? "var(--rf-brass)" : "transparent")};
  }

  &:hover {
    color: var(--rf-brass-dark);
  }

  /* Inset ring: an outward ring would be clipped by the bar's overflow. */
  &:focus-visible {
    outline: 2px solid var(--rf-brass);
    outline-offset: -2px;
  }

  @media (max-width: 560px) {
    padding: 10px 18px;
    font-size: 14px;

    &::after {
      left: 18px;
      right: 18px;
    }
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--rf-radius-sm);
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  background: var(--rf-brass);
  color: #ffffff;
  box-shadow: var(--rf-shadow-sm);
  transition: background-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--rf-brass-dark);
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 560px) {
    justify-content: center;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--rf-radius-sm);
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--rf-line-strong);
  background: var(--rf-surface);
  color: var(--rf-ink-soft);

  &:hover {
    background: var(--rf-paper);
  }
`;

const StateCard = styled.div`
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: var(--rf-slate);

  ${({ $variant }) =>
    $variant === "error" &&
    `
    color: var(--rf-rust);

    p {
      color: var(--rf-ink-soft);
      margin: 0;
      max-width: 420px;
    }
  `}

  ${({ $variant }) =>
    $variant === "loading" &&
    `
    p {
      margin: 0;
      font-size: 13.5px;
    }
  `}
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid var(--rf-line);
  border-top-color: var(--rf-brass);
  border-radius: 50%;
  animation: rf-spin 0.7s linear infinite;

  @keyframes rf-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ---- Export to Excel section (placed after the table/pagination) ----

const ExportSection = styled.div`
  margin-top: 20px;
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  box-shadow: var(--rf-shadow-sm);
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const ExportText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ExportTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--rf-ink);
`;

const ExportSubtitle = styled.span`
  font-size: 12.5px;
  color: var(--rf-slate);
`;

const ReimbursementFees = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Seeded once from the URL (e.g. arriving from a Dashboard bar); after that
  // `filters` stays the single source of truth for the page.
  const [filters, setFilters] = useState(() => readFiltersFromUrl(searchParams));
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [uploadRecord, setUploadRecord] = useState(null); // NEW: record the Upload modal is open for
  const [currentPage, setCurrentPage] = useState(1);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // db_name is resolved dynamically inside ConstantServies.js /
  // getReimbursementOrderList — nothing here reads or hardcodes it.
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReimbursementOrderList();
      const data = Array.isArray(res?.data) ? res.data : [];
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch reimbursement list:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Something went wrong while loading reimbursement invoices."
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Diagnostic: if no record yields a usable amount, the amount filter can
  // never match anything. Log the real keys so the field can be added to
  // PREFERRED_AMOUNT_KEYS (utils/reimbursementFilterRanges.js).
  useEffect(() => {
    if (records.length === 0) return;
    const resolved = records.map(resolveAmount).filter((r) => r.key);
    if (resolved.length === 0) {
      console.warn(
        "[ReimbursementFees] Amount Range: no amount field found on any record. Sample record keys/values:",
        records[0]
      );
    } else {
      console.info("[ReimbursementFees] Amount Range is using field:", resolved[0].key);
    }
  }, [records]);

  const customerOptions = useMemo(
    () => [...new Set(records.map((r) => r.customer_name).filter(Boolean))].sort(),
    [records]
  );

  // Existing filters first, then the amount range, then the due range (set by
  // the Dashboard) on top of the result, so all filters combine (AND).
  const filteredRecords = useMemo(
    () => applyDueRange(applyAmountRange(filterRecords(records, filters), filters.amountRange), filters.dueRange),
    [records, filters]
  );

  // True when at least one filter differs from its default. Used by the
  // Export section so its wording and the file name reflect what is exported.
  const hasActiveFilters = useMemo(
    () => Object.keys(EMPTY_FILTERS).some((key) => filters[key] !== EMPTY_FILTERS[key]),
    [filters]
  );

  // Keeps ?amountRange / ?dueRange in step with the filters (replace, not push,
  // so Back still returns to the Dashboard). Removing a chip or "Clear all"
  // therefore also removes the param, and a refresh restores the same view.
  // Any other query params are left untouched.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (filters.amountRange && filters.amountRange !== "all") next.set("amountRange", filters.amountRange);
    else next.delete("amountRange");
    if (filters.dueRange) next.set("dueRange", filters.dueRange);
    else next.delete("dueRange");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [filters.amountRange, filters.dueRange, searchParams, setSearchParams]);

  // Filtering happens before pagination (API records -> filter -> paginate
  // -> table), per spec. Any change to the filters or to the underlying
  // record set resets pagination back to page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, records]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  // Guards against being stranded on a page that no longer exists (e.g. the
  // filtered set shrinks while on page 3).
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  const pagination = {
    currentPage,
    totalPages,
    totalCount: filteredRecords.length,
    startIdx: filteredRecords.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
    endIdx: Math.min(currentPage * PAGE_SIZE, filteredRecords.length),
    onPageChange: (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages)),
  };

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearAllFilters = () => setFilters(EMPTY_FILTERS);

  const statusLabel = filters.status === "paid" ? "Paid" : filters.status === "not_paid" ? "Not Paid" : "";
  const overdueLabel =
    filters.overdue === "yes"
      ? "Overdue only"
      : filters.overdue === "no"
      ? "Not overdue"
      : filters.overdue === "today"
      ? "Due today"
      : "";
  const amountRangeLabel =
    AMOUNT_RANGE_OPTIONS.find((o) => o.value === filters.amountRange)?.chipLabel || "";
  const dueRangeLabel = DUE_RANGE_OPTIONS.find((o) => o.value === filters.dueRange)?.chipLabel || "";

  const activeChips = [
    filters.customer && {
      key: "customer",
      label: filters.customer,
      onRemove: () => updateFilter("customer", ""),
    },
    filters.status && {
      key: "status",
      label: statusLabel,
      onRemove: () => updateFilter("status", ""),
    },
    filters.overdue && {
      key: "overdue",
      label: overdueLabel,
      onRemove: () => updateFilter("overdue", ""),
    },
    amountRangeLabel && {
      key: "amountRange",
      label: amountRangeLabel,
      onRemove: () => updateFilter("amountRange", "all"),
    },
    dueRangeLabel && {
      key: "dueRange",
      label: dueRangeLabel,
      onRemove: () => updateFilter("dueRange", ""),
    },
    (filters.dateFrom || filters.dateTo) && {
      key: "dateRange",
      label: `${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`,
      onRemove: () => {
        updateFilter("dateFrom", "");
        updateFilter("dateTo", "");
      },
    },
  ].filter(Boolean);

  // Exports EVERY record matching the current filters (`filteredRecords`,
  // across all pages — not just the visible page) into a single
  // "Reimbursement Fees" worksheet. With no filters applied this is the full
  // set of records, so the behaviour is unchanged. Uses the same field
  // interpretation the table already uses (reimbursementUtils), restricted to
  // the six reimbursement-level columns. No second API call, no mutation of
  // `records`, no touching filters/pagination.
  const handleExportToExcel = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      toast.info(
        hasActiveFilters
          ? "No records match the current filters to export."
          : "No reimbursement records available to export."
      );
      return;
    }

    const exportRows = filteredRecords.map((r) => ({
      "Customer Name": safeText(r.customer_name),
      "Invoice Number": safeText(r.invoice_number),
      "Invoice Date": formatApiDate(r.invoice_date),
      "Due Date": formatApiDate(r.invoice_due_date),
      "Outstanding Amount": getOutstandingAmount(r),
      "Payment Status": getPaymentStatusLabel(r),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reimbursement Fees");

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    XLSX.writeFile(workbook, `Reimbursement_Fees${hasActiveFilters ? "_Filtered" : ""}_${dateStr}.xlsx`);
  };

  // NEW: called by the Upload modal when the user clicks "Upload".
  // The form data is ready to send; connect your real upload API where marked.
  // If the API call fails, show toast.error(...) and `throw err` so the modal
  // stays open and the user does not lose the file or note.
  const handleUploadSubmit = async ({ record, file, refNote }) => {
    const formData = new FormData();
    formData.append("invoice_number", record.invoice_number);
    formData.append("file", file);
    formData.append("ref_note", refNote);

    // TODO: replace the next two lines with your upload API call, e.g.
    //   await uploadReimbursementDocument(formData);
    //   toast.success("Document uploaded successfully.");
    console.log("Upload payload:", { invoice_number: record.invoice_number, fileName: file.name, refNote });
    toast.info("Upload form works. Connect the upload API in handleUploadSubmit.");
  };

  return (
    <DashboardLayout
      activeNav="reimbursement-fees"
      breadcrumb="Sales / Reimbursement Fees"
      pageTitle="Reimbursement Fees"
    >
      <Page>
        <HeaderRow>
          <div>
            <Title>Reimbursement Fees</Title>
            <Subtitle>Track outstanding patent-related fees paid on behalf of clients.</Subtitle>
          </div>
          <PrimaryButton type="button" onClick={() => navigate("/reimbursement-fees/add")}>
            <FiPlus size={16} />
            <span>Add Reimbursement</span>
          </PrimaryButton>
        </HeaderRow>

        <TabBar role="tablist" aria-label="Reimbursement Fees sections">
          <Tab type="button" role="tab" aria-selected="true" $active>
            <FiList size={18} />
            <span>Reimbursements</span>
          </Tab>
          <Tab
            type="button"
            role="tab"
            aria-selected="false"
            onClick={() => navigate("/reimbursement-fees/dashboard")}
          >
            <FiBarChart2 size={18} />
            <span>Dashboard</span>
          </Tab>
        </TabBar>

        {loading ? (
          <StateCard $variant="loading">
            <Spinner />
            <p>Loading reimbursement invoices…</p>
          </StateCard>
        ) : error ? (
          <StateCard $variant="error">
            <FiAlertCircle size={22} />
            <p>{error}</p>
            <SecondaryButton type="button" onClick={fetchRecords}>
              <FiRefreshCw size={14} />
              <span>Retry</span>
            </SecondaryButton>
          </StateCard>
        ) : (
          <>
            {/* Summary reflects ALL records matching the current filters (not just
                the current page), so it uses filteredRecords, never
                paginatedRecords. */}
            <SummaryCards records={filteredRecords} />

            {/* <div className="rf-page__dashboards">
              <AgingDashboard records={records} />
              <AmountDistribution records={records} />
            </div> */}

            <ReimbursementFilters
              filters={filters}
              onChange={updateFilter}
              onClearAll={clearAllFilters}
              customerOptions={customerOptions}
              amountRangeOptions={AMOUNT_RANGE_OPTIONS}
              activeChips={activeChips}
              resultCount={filteredRecords.length}
              totalCount={records.length}
            />

            <ReimbursementTable
              records={paginatedRecords}
              onView={setSelectedRecord}
              onUpload={setUploadRecord} // NEW
              onCustomerSelect={(customerName) => updateFilter("customer", customerName)}
              pagination={pagination}
            />

            <ExportSection>
              <ExportText>
                <ExportTitle>Export Data</ExportTitle>
                <ExportSubtitle>
                  {hasActiveFilters
                    ? `Download the ${filteredRecords.length} record${
                        filteredRecords.length === 1 ? "" : "s"
                      } matching your current filters`
                    : "Download all reimbursement records"}
                </ExportSubtitle>
              </ExportText>
              <SecondaryButton type="button" onClick={handleExportToExcel}>
                <FiDownload size={14} />
                <span>{hasActiveFilters ? "Export Filtered to Excel" : "Export to Excel"}</span>
              </SecondaryButton>
            </ExportSection>
          </>
        )}
      </Page>

      {selectedRecord && (
        <ReimbursementDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}

      {/* NEW: Upload modal (file + Ref No / Note) */}
      {uploadRecord && (
        <ReimbursementUploadModal
          record={uploadRecord}
          onClose={() => setUploadRecord(null)}
          onSubmit={handleUploadSubmit}
        />
      )}
    </DashboardLayout>
  );
};

export default ReimbursementFees;
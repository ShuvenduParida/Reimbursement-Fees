// src/pages/ReimbursementFees.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiPlus, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import DashboardLayout from "../components/layout/DashboardLayout";
import SummaryCards from "../components/reimbursement/SummaryCards";
import ReimbursementFilters from "../components/reimbursement/ReimbursementFilters";
import ReimbursementTable from "../components/reimbursement/ReimbursementTable";
import ReimbursementDetailsModal from "../components/reimbursement/ReimbursementDetailsModal";
import { getReimbursementOrderList } from "../services/productServices";
import { filterRecords } from "../utils/reimbursementUtils";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  search: "",
  customer: "",
  status: "",
  overdue: "",
  amountRange: "all",
  dateFrom: "",
  dateTo: "",
};

// ---- Amount range filter (frontend only, on already-loaded records) ----

// Keys tried first, in this order. If your outstanding amount uses a
// different key, add it at the top of this list.
const PREFERRED_AMOUNT_KEYS = [
  "outstanding_amount",
  "outstandingAmount",
  "outstanding",
  "outstanding_balance",
  "balance_amount",
  "balance",
  "due_amount",
  "pending_amount",
  "invoice_amount",
  "total_amount",
  "grand_total",
  "amount",
  "total",
];

// Fallback scan: keys that look like money, minus keys that clearly aren't.
const AMOUNT_KEY_PATTERN = /outstanding|balance|due|pending|amount|total/i;
const NON_AMOUNT_KEY_PATTERN = /date|status|over_?due|days|number|_id$|^id$|_no$|name|email|phone/i;

const AMOUNT_RANGE_OPTIONS = [
  { value: "all", label: "All amounts", chipLabel: "", test: () => true },
  { value: "0-2000", label: "0 - 2,000", chipLabel: "Amount: 0 - 2,000", test: (n) => n >= 0 && n <= 2000 },
  { value: "2000-4000", label: "2,000 - 4,000", chipLabel: "Amount: 2,000 - 4,000", test: (n) => n > 2000 && n <= 4000 },
  { value: "4000-8000", label: "4,000 - 8,000", chipLabel: "Amount: 4,000 - 8,000", test: (n) => n > 4000 && n <= 8000 },
  { value: "8000+", label: "More than 8,000", chipLabel: "Amount: More than 8,000", test: (n) => n > 8000 },
];

// Safe numeric conversion: handles null / undefined / "" / strings with
// commas or currency symbols. Returns NaN when no usable number is found
// (Number("") would otherwise silently become 0).
const toNumericAmount = (value) => {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  return Number(cleaned);
};

const hasValue = (v) => v !== undefined && v !== null && v !== "";

// Returns { key, amount } for the first usable amount on the record,
// or { key: null, amount: NaN } if none is found.
const resolveAmount = (record) => {
  if (!record || typeof record !== "object") return { key: null, amount: NaN };

  for (const key of PREFERRED_AMOUNT_KEYS) {
    if (hasValue(record[key])) {
      const amount = toNumericAmount(record[key]);
      if (Number.isFinite(amount)) return { key, amount };
    }
  }

  for (const key of Object.keys(record)) {
    if (!AMOUNT_KEY_PATTERN.test(key) || NON_AMOUNT_KEY_PATTERN.test(key)) continue;
    if (!hasValue(record[key]) || typeof record[key] === "object") continue;
    const amount = toNumericAmount(record[key]);
    if (Number.isFinite(amount)) return { key, amount };
  }

  return { key: null, amount: NaN };
};

const applyAmountRange = (records, amountRange) => {
  if (!amountRange || amountRange === "all") return records;
  const option = AMOUNT_RANGE_OPTIONS.find((o) => o.value === amountRange);
  if (!option) return records;
  return records.filter((record) => {
    const { amount } = resolveAmount(record);
    return Number.isFinite(amount) && option.test(amount);
  });
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

const ReimbursementFees = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState(null);
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
  // PREFERRED_AMOUNT_KEYS.
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

  // Existing filters first, then the amount range on top of the result, so
  // all filters combine (AND).
  const filteredRecords = useMemo(
    () => applyAmountRange(filterRecords(records, filters), filters.amountRange),
    [records, filters]
  );

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
    filters.overdue === "yes" ? "Overdue only" : filters.overdue === "no" ? "Not overdue" : "";
  const amountRangeLabel =
    AMOUNT_RANGE_OPTIONS.find((o) => o.value === filters.amountRange)?.chipLabel || "";

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
    (filters.dateFrom || filters.dateTo) && {
      key: "dateRange",
      label: `${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`,
      onRemove: () => {
        updateFilter("dateFrom", "");
        updateFilter("dateTo", "");
      },
    },
  ].filter(Boolean);

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
            <SummaryCards records={records} />

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

            <ReimbursementTable records={paginatedRecords} onView={setSelectedRecord} pagination={pagination} />
          </>
        )}
      </Page>

      {selectedRecord && (
        <ReimbursementDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </DashboardLayout>
  );
};

export default ReimbursementFees;
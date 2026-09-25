// src/utils/reimbursementUtils.js
//
// Helpers built around the REAL reimbursement_order_list API response shape:
// { id, invoice_number, order_items[], total, tax_amount, currency_symbol,
//   invoice_status ("A" = Not Paid, "B" = Paid), invoice_date, invoice_due_date,
//   outstanding_amt, is_over_due, customer_name }
//
// Nothing here assumes the old dummy-data shape (clientCompany, feeType,
// governmentPaymentDate, amountPaid, amountReimbursed, etc.) — none of that
// is used on the Reimbursement Fees page anymore.

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// API dates arrive pre-formatted as "23-Sep-2026". We only ever parse them
// for filtering/comparison — never to re-format for display, since the API
// string is already display-ready.
export function parseApiDate(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.trim().split("-");
  if (parts.length !== 3) return null;
  const [day, mon, year] = parts;
  const monthIndex = MONTHS[mon.toLowerCase().slice(0, 3)];
  if (monthIndex === undefined) return null;
  const d = new Date(Number(year), monthIndex, Number(day));
  return Number.isNaN(d.getTime()) ? null : d;
}

// <input type="date"> gives us "YYYY-MM-DD". new Date("YYYY-MM-DD") parses
// that as UTC midnight (per the ES spec for date-only strings), NOT local
// midnight. In any timezone ahead of UTC (e.g. IST, UTC+5:30) that UTC
// midnight lands *later* than local midnight on the same calendar day, so
// "invoiceDate < new Date(dateFrom)" was true even when the invoice date
// and the selected "from" date were the same day — silently dropping the
// first day of the range. Parsing the y/m/d components ourselves and
// building a local Date (matching how parseApiDate already builds record
// dates) keeps both sides of the comparison in the same local-midnight
// space, so the comparison is a true calendar-date comparison.
export function parseInputDate(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split("-"); // "YYYY-MM-DD"
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Pulls a numeric amount out of either a plain number or a pre-formatted
// string like "₹10,000.00" / "$5,000.00".
export function parseAmount(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function getCurrencySymbol(record) {
  return record?.currency_symbol || "";
}

export function getTotalAmount(record) {
  return parseAmount(record?.total);
}

// outstanding_amt is provided directly by the API; fall back to total only
// if it is missing, so the UI never shows a blank figure.
export function getOutstandingAmount(record) {
  if (record?.outstanding_amt === null || record?.outstanding_amt === undefined) {
    return getTotalAmount(record);
  }
  return parseAmount(record.outstanding_amt);
}

// Reliable because outstanding_amt comes straight from the API — this is
// simply total minus that figure, never an assumption based on status.
export function getPaidAmount(record) {
  const paid = getTotalAmount(record) - getOutstandingAmount(record);
  return paid > 0 ? paid : 0;
}

export function isPaid(record) {
  return record?.invoice_status === "B";
}

export function getPaymentStatusLabel(record) {
  return isPaid(record) ? "Paid" : "Not Paid";
}

export function isOverdueRecord(record) {
  return Boolean(record?.is_over_due);
}

export function formatCurrency(amount, symbol = "") {
  const value = Number(amount) || 0;
  return `${symbol}${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// API dates are already display-ready strings ("23-Sep-2026"); this just
// guards against null/missing values.
export function formatApiDate(value) {
  return value ? value : "—";
}

export function safeText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

// ---- Currency-grouped aggregation ----
// Sums are grouped by currency symbol rather than combined, since invoices
// in this dataset can use different currencies and converting would mean
// inventing an exchange rate.

export function sumByCurrency(records, amountGetter) {
  const groups = {};
  records.forEach((r) => {
    const symbol = getCurrencySymbol(r) || "—";
    const amount = amountGetter(r);
    groups[symbol] = (groups[symbol] || 0) + amount;
  });
  return groups;
}

export function formatGroupedAmount(groups) {
  const entries = Object.entries(groups || {});
  if (entries.length === 0) return "—";
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, amount]) => formatCurrency(amount, symbol === "—" ? "" : symbol))
    .join(" · ");
}

// ---- Summary cards ----

export function getSummary(records) {
  const paidRecords = records.filter(isPaid);
  const notPaidRecords = records.filter((r) => !isPaid(r));
  const overdueRecords = records.filter(isOverdueRecord);

  return {
    totalInvoices: records.length,
    totalInvoiceAmountGrouped: sumByCurrency(records, getTotalAmount),
    totalOutstandingGrouped: sumByCurrency(records, getOutstandingAmount),
    paidCount: paidRecords.length,
    notPaidCount: notPaidRecords.length,
    overdueCount: overdueRecords.length,
  };
}

// ---- Total Outstanding Fees (page-level summary) ----
// Sums the API's own outstanding_amt field, restricted to records whose
// invoice_status marks them as not-paid — matches "Only include records
// that are actually pending/unpaid" rather than trusting outstanding_amt
// alone to already be zero on paid rows.
export function getPendingOutstandingGrouped(records) {
  return sumByCurrency(records.filter((r) => !isPaid(r)), getOutstandingAmount);
}

// ---- Overdue panel ----

export function getOverdueSummary(records) {
  const overdueRecords = records.filter(isOverdueRecord);
  return {
    overdueCount: overdueRecords.length,
    overdueOutstandingGrouped: sumByCurrency(overdueRecords, getOutstandingAmount),
  };
}

// ---- Amount distribution: paid vs outstanding, per currency ----

export function getAmountDistribution(records) {
  const paidGrouped = sumByCurrency(records, getPaidAmount);
  const outstandingGrouped = sumByCurrency(records, getOutstandingAmount);
  const symbols = [...new Set([...Object.keys(paidGrouped), ...Object.keys(outstandingGrouped)])].sort();

  return symbols.map((symbol) => {
    const paid = paidGrouped[symbol] || 0;
    const outstanding = outstandingGrouped[symbol] || 0;
    const total = paid + outstanding;
    return {
      symbol: symbol === "—" ? "" : symbol,
      paid,
      outstanding,
      paidShare: total > 0 ? paid / total : 0,
      outstandingShare: total > 0 ? outstanding / total : 0,
    };
  });
}

// ---- Filtering ----

export function filterRecords(records, filters) {
  const {
    search = "",
    customer = "",
    status = "", // "paid" | "not_paid" | ""
    overdue = "", // "yes" | "no" | ""
    dateFrom = "",
    dateTo = "",
  } = filters;

  const q = search.trim().toLowerCase();

  return records.filter((r) => {
    if (q) {
      const haystack = [r.customer_name, r.invoice_number].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (customer && r.customer_name !== customer) return false;
    if (status === "paid" && !isPaid(r)) return false;
    if (status === "not_paid" && isPaid(r)) return false;
    if (overdue === "yes" && !isOverdueRecord(r)) return false;
    if (overdue === "no" && isOverdueRecord(r)) return false;

    if (dateFrom || dateTo) {
      const invoiceDate = parseApiDate(r.invoice_date);
      if (!invoiceDate) return false;

      if (dateFrom) {
        const fromDate = parseInputDate(dateFrom);
        // Both sides are local-midnight Dates, so this is an inclusive
        // calendar-date comparison — the "from" day itself is included.
        if (fromDate && invoiceDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = parseInputDate(dateTo);
        // Same here — the "to" day itself is included.
        if (toDate && invoiceDate > toDate) return false;
      }
    }
    return true;
  });
}

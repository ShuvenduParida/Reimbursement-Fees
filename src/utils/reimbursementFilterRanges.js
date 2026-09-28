// src/utils/reimbursementFilterRanges.js
//
// Single source of truth for the two range filters that can be applied to the
// Reimbursement Fees list AND are charted on the Reimbursement Dashboard:
//
//   1. Amount range  – moved VERBATIM out of pages/ReimbursementFees.jsx so the
//      list page and the dashboard use literally the same boundaries and the
//      same amount-field detection. Nothing about the logic changed.
//   2. Due range     – new. "How many calendar days ago was the due date?"
//
// Because the dashboard computes every bar count by calling the same
// apply*Range function the list page uses to filter, a bar's count can never
// disagree with the number of rows shown after clicking it.

import { parseApiDate } from "./reimbursementUtils";

// ===========================================================================
// 1. Amount range (frontend only, on already-loaded records)
// ===========================================================================

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

export const AMOUNT_RANGE_OPTIONS = [
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
export const resolveAmount = (record) => {
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

export const applyAmountRange = (records, amountRange) => {
  if (!amountRange || amountRange === "all") return records;
  const option = AMOUNT_RANGE_OPTIONS.find((o) => o.value === amountRange);
  if (!option) return records;
  return records.filter((record) => {
    const { amount } = resolveAmount(record);
    return Number.isFinite(amount) && option.test(amount);
  });
};

// Dashboard bars for the amount chart. Each count is produced by
// applyAmountRange itself (the list page's own filter), so the two can't drift.
// `unclassified` = records that land in none of the four ranges (no readable
// amount, or a negative amount).
export const getAmountRangeStats = (records) => {
  const bars = AMOUNT_RANGE_OPTIONS.filter((o) => o.value !== "all").map((o) => ({
    key: o.value,
    label: o.label,
    count: applyAmountRange(records, o.value).length,
  }));
  const classified = bars.reduce((sum, b) => sum + b.count, 0);
  return { bars, unclassified: records.length - classified };
};

// ===========================================================================
// 2. Due range: whole calendar days between the due date and today
// ===========================================================================
//
// daysPastDue = (today's calendar date) - (due calendar date)
//
//    0  → due today            4  → due 4 days ago
//    5  → due 5 days ago       ...
//   <0  → due in the future    (never placed in a bucket, see below)
//
// Buckets are non-overlapping and contain whole days only:
//   "0-5"   → daysPastDue  0..4
//   "5-10"  → daysPastDue  5..9
//   "10-15" → daysPastDue 10..14
//   "15+"   → daysPastDue 15 and more
// e.g. with today = 28-Sep-2026:  24..28 Sep / 19..23 Sep / 14..18 Sep / ≤ 13 Sep.

const MS_PER_DAY = 86400000;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Reduces a Date to a whole "day number" using ONLY its local calendar
// components (year / month / day). Date.UTC has no DST, so the difference of
// two day numbers is always an exact whole number of days — no 23h/25h days,
// no timezone-offset drift, regardless of the time of day `today` was read.
const toDayNumber = (date) =>
  Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);

const makeDueOption = (value, label, chipLabel, min, max) => ({
  value,
  label,
  chipLabel,
  min,
  max,
  test: (daysPastDue) => daysPastDue >= min && daysPastDue <= max,
});

export const DUE_RANGE_OPTIONS = [
  makeDueOption("0-5", "0 - 5 Days", "Due 0 - 5 days ago", 0, 4),
  makeDueOption("5-10", "5 - 10 Days", "Due 5 - 10 days ago", 5, 9),
  makeDueOption("10-15", "10 - 15 Days", "Due 10 - 15 days ago", 10, 14),
  makeDueOption("15+", "More than 15 Days", "Due 15+ days ago", 15, Infinity),
];

// Returns a whole number of days, or null when the record has no parseable
// due date. Negative = due date is in the future.
export const getDaysPastDue = (record, today = new Date()) => {
  const due = parseApiDate(record?.invoice_due_date);
  if (!due) return null;
  return toDayNumber(today) - toDayNumber(due);
};

// Future and missing due dates fall through (return false) for every bucket,
// so they are never forced into a past-aging bucket.
export const applyDueRange = (records, dueRange, today = new Date()) => {
  if (!dueRange) return records;
  const option = DUE_RANGE_OPTIONS.find((o) => o.value === dueRange);
  if (!option) return records;
  return records.filter((record) => {
    const days = getDaysPastDue(record, today);
    return days !== null && option.test(days);
  });
};

const formatDate = (d) => `${String(d.getDate()).padStart(2, "0")}-${MONTH_LABELS[d.getMonth()]}-${d.getFullYear()}`;
const shiftDays = (today, n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);

// Human-readable due-date window for a bucket, used in the chart tooltip so
// the "0 - 5" / "5 - 10" labels are unambiguous.
export const describeDueWindow = (option, today = new Date()) => {
  const newest = formatDate(shiftDays(today, option.min));
  if (!Number.isFinite(option.max)) return `Due on or before ${newest}`;
  return `Due ${formatDate(shiftDays(today, option.max))} to ${newest}`;
};

// Dashboard bars for the due-date chart, plus how many records were left out
// of all four buckets and why.
export const getDueRangeStats = (records, today = new Date()) => {
  const bars = DUE_RANGE_OPTIONS.map((o) => ({
    key: o.value,
    label: o.label,
    count: applyDueRange(records, o.value, today).length,
    hint: describeDueWindow(o, today),
  }));

  let future = 0;
  let missing = 0;
  records.forEach((r) => {
    const days = getDaysPastDue(r, today);
    if (days === null) missing += 1;
    else if (days < 0) future += 1;
  });

  return { bars, future, missing };
};

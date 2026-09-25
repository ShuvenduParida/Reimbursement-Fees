// src/components/reimbursement/ReimbursementFilters.jsx
import styled from "styled-components";
import { FiSearch, FiX } from "react-icons/fi";

const Wrap = styled.div`
  background: var(--rf-surface);
  border: 1.5px solid var(--rf-line-strong);
  border-radius: var(--rf-radius-md);
  padding: 14px 16px;
  box-shadow: var(--rf-shadow-sm);
  margin-bottom: 16px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

// Column sizing: the date range gets a protected minimum width (so the full
// dd-mm-yyyy value always fits) and the other fields share what is left.
// Below 1400px the row wraps early so the date column never gets squeezed
// when the sidebar is expanded.
const Row = styled.div`
  display: grid;
  grid-template-columns:
    minmax(0, 1.3fr)
    minmax(0, 1fr)
    minmax(0, 0.9fr)
    minmax(0, 0.9fr)
    minmax(0, 1fr)
    minmax(310px, 1.9fr);

  gap: 10px;
  align-items: center;
  width: 100%;
  min-width: 0;

  > * {
    min-width: 0;
    max-width: 100%;
  }

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    > *:first-child {
      grid-column: 1 / -1;
    }

    > *:nth-child(6) {
      grid-column: 1 / -1;
      max-width: none;
    }
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > * {
      width: 100%;
      min-width: 0;
    }

    > *:first-child,
    > *:nth-child(6) {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);

    > * {
      grid-column: auto !important;
      width: 100%;
      max-width: 100%;
    }
  }
`;

const SearchField = styled.div`
  min-width: 0;
  width: 100%;

  display: flex;
  align-items: center;
  gap: 10px;

  height: 42px;
  box-sizing: border-box;

  padding: 0 14px;

  border: 1px solid var(--rf-line-strong);
  border-radius: var(--rf-radius-sm);

  background: var(--rf-paper);
  color: var(--rf-slate);

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus-within {
    border-color: var(--rf-brass);
    box-shadow: 0 0 0 3px var(--rf-brass-soft);
  }

  svg {
    flex-shrink: 0;
  }

  input,
  input:hover,
  input:focus,
  input:focus-visible {
    min-width: 0;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0;

    border: none !important;
    border-radius: 0;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;

    font-family: inherit;
    font-size: 13px;
    color: var(--rf-ink);
  }
`;

const Select = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  width: 100%;
  min-width: 0;
  height: 42px;

  box-sizing: border-box;

  padding: 0 34px 0 14px;

  border: 1px solid var(--rf-line-strong);
  border-radius: var(--rf-radius-sm);

  background-color: var(--rf-surface);

  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b6255' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");

  background-repeat: no-repeat;
  background-position: right 11px center;

  font-family: inherit;
  font-size: 13px;
  font-weight: 500;

  color: var(--rf-ink);

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: var(--rf-brass);
  }

  &:focus {
    outline: none;
    border-color: var(--rf-brass);
    box-shadow: 0 0 0 3px var(--rf-brass-soft);
  }
`;

const DateRange = styled.div`
  width: 100%;
  min-width: 0;

  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;

  gap: 6px;

  font-size: 13px;
  color: var(--rf-slate);

  span {
    white-space: nowrap;
    text-align: center;
  }
`;

const DateField = styled.div`
  width: 100%;
  min-width: 0;
  height: 42px;

  overflow: hidden;

  border-radius: var(--rf-radius-sm);

  input {
    display: block;

    width: 100%;
    min-width: 0;
    height: 42px;

    box-sizing: border-box;

    padding: 0 8px;

    border: 1px solid var(--rf-line-strong);
    border-radius: var(--rf-radius-sm);

    background: var(--rf-surface);

    font-family: inherit;
    font-size: 13px;

    color: var(--rf-ink);

    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      border-color: var(--rf-brass);
    }

    &:focus {
      outline: none;
      border-color: var(--rf-brass);
      box-shadow: 0 0 0 3px var(--rf-brass-soft);
    }
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const Chips = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px 5px 10px;
  border-radius: 999px;
  background: var(--rf-brass-soft);
  color: var(--rf-brass-dark);
  font-size: 12px;
  font-weight: 600;

  button {
    display: grid;
    place-items: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: none;
    background: rgba(138, 95, 34, 0.15);
    color: var(--rf-brass-dark);
    cursor: pointer;
  }
`;

const ClearAll = styled.button`
  background: transparent;
  border: none;
  color: var(--rf-rust);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 2px;
`;

const Count = styled.span`
  font-size: 12.5px;
  color: var(--rf-slate);
  white-space: nowrap;
`;

// Only filters supported by real API fields: customer_name, invoice_status,
// is_over_due, invoice_date. Fee type / govt. payment date / partial
// reimbursement filters have been removed entirely.
// Amount range is applied on the frontend to the already-loaded records.
const ReimbursementFilters = ({
  filters,
  onChange,
  onClearAll,
  customerOptions,
  amountRangeOptions = [],
  activeChips,
  resultCount,
  totalCount,
}) => {
  const hasAnyFilter =
    Boolean(filters.search) ||
    Boolean(filters.customer) ||
    Boolean(filters.status) ||
    Boolean(filters.overdue) ||
    Boolean(filters.amountRange && filters.amountRange !== "all") ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <Wrap>
      <Row>
        <SearchField>
          <FiSearch size={15} />
          <input
            type="text"
            placeholder="Search customer or invoice number"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </SearchField>

        <Select value={filters.customer} onChange={(e) => onChange("customer", e.target.value)}>
          <option value="">All customers</option>
          {customerOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="not_paid">Not Paid</option>
        </Select>

        <Select value={filters.overdue} onChange={(e) => onChange("overdue", e.target.value)}>
          <option value="">Overdue: any</option>
          <option value="yes">Overdue only</option>
          <option value="no">Not overdue</option>
        </Select>

        <Select
          value={filters.amountRange}
          onChange={(e) => onChange("amountRange", e.target.value)}
          aria-label="Amount Range"
        >
          {amountRangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <DateRange>
          <DateField>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange("dateFrom", e.target.value)}
              aria-label="Invoice date from"
            />
          </DateField>
          <span>to</span>
          <DateField>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange("dateTo", e.target.value)}
              aria-label="Invoice date to"
            />
          </DateField>
        </DateRange>
      </Row>

      <Meta>
        <Chips>
          {activeChips.map((chip) => (
            <Chip key={chip.key}>
              {chip.label}
              <button type="button" onClick={chip.onRemove} aria-label={`Remove ${chip.label} filter`}>
                <FiX size={12} />
              </button>
            </Chip>
          ))}
          {hasAnyFilter && (
            <ClearAll type="button" onClick={onClearAll}>
              Clear all filters
            </ClearAll>
          )}
        </Chips>

        <Count>
          Showing {resultCount} of {totalCount}
        </Count>
      </Meta>
    </Wrap>
  );
};

export default ReimbursementFilters;
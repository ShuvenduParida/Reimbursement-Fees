// src/components/reimbursement/ReimbursementFilters.jsx
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FiSearch, FiX, FiChevronDown, FiCheck } from "react-icons/fi";

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

// --- Animated dropdown (replaces the native <select> look/feel below) ---
// Same visual sizing/border/focus styling the old <select> had; only the
// options panel is new, and it animates open/closed instead of using the
// browser's native (unstyleable) option list.
const dropdownOpen = keyframes`
  from {
    opacity: 0;
    transform: translateY(-6px) scaleY(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
`;

const dropdownClose = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
  to {
    opacity: 0;
    transform: translateY(-6px) scaleY(0.96);
  }
`;

const SelectShell = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

const SelectInput = styled.input`
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

  font-family: inherit;
  font-size: 13px;
  font-weight: 500;

  color: var(--rf-ink);

  cursor: text;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::placeholder {
    color: var(--rf-ink);
    opacity: 0.85;
  }

  &:hover {
    border-color: var(--rf-brass);
  }

  &:focus {
    outline: none;
    border-color: var(--rf-brass);
    box-shadow: 0 0 0 3px var(--rf-brass-soft);
  }
`;

const SelectChevron = styled(FiChevronDown)`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%) rotate(${(p) => (p.$open ? "180deg" : "0deg")});

  flex-shrink: 0;
  color: #6b6255;
  pointer-events: none;
  transition: transform 0.18s ease;
`;

const SelectEmpty = styled.div`
  padding: 10px 10px;
  font-size: 13px;
  color: var(--rf-slate);
`;

const SelectMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 40;

  max-height: 260px;
  overflow-y: auto;

  background: var(--rf-surface);
  border: 1px solid var(--rf-line-strong);
  border-radius: var(--rf-radius-sm);
  box-shadow: 0 10px 30px rgba(30, 22, 10, 0.14);

  padding: 6px;

  transform-origin: top center;
  animation: ${(p) => (p.$closing ? dropdownClose : dropdownOpen)} 0.16s ease both;
`;

const SelectOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;

  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: ${(p) => (p.$active ? "var(--rf-brass-soft)" : "transparent")};

  font-family: inherit;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  text-align: left;

  color: ${(p) => (p.$active ? "var(--rf-brass-dark)" : "var(--rf-ink)")};

  cursor: pointer;
  transition: background-color 0.12s ease;

  &:hover {
    background: var(--rf-brass-soft);
  }

  svg {
    flex-shrink: 0;
    color: var(--rf-brass-dark);
  }
`;

// Drop-in replacement for a native <select>: same `value` / `onChange(e)` /
// <option> API (call sites still read `e.target.value`), so nothing outside
// this component needs to change. The options panel animates open/closed
// instead of being the browser's native, unstyleable list, and typing into
// the field filters that list live (e.g. typing "atom" narrows it down to
// customers whose name contains "atom").
const AnimatedSelect = ({ value, onChange, children, "aria-label": ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const shellRef = useRef(null);
  const inputRef = useRef(null);
  const closeTimer = useRef(null);

  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child) => ({ value: child.props.value, label: child.props.children })),
    [children]
  );

  const selected = options.find((opt) => opt.value === value) || options[0];

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => String(opt.label ?? "").toLowerCase().includes(q));
  }, [options, query]);

  const closeMenu = () => {
    setOpen((isOpen) => {
      if (!isOpen) return isOpen;
      setClosing(true);
      clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setOpen(false);
        setClosing(false);
        setQuery("");
      }, 150);
      return isOpen;
    });
  };

  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (e) => {
      if (shellRef.current && !shellRef.current.contains(e.target)) closeMenu();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        closeMenu();
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handlePick = (val) => {
    onChange({ target: { value: val } });
    closeMenu();
    inputRef.current?.blur();
  };

  return (
    <SelectShell ref={shellRef}>
      <SelectInput
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={selected?.label ?? ""}
        value={open ? query : ""}
        onFocus={openMenu}
        onClick={openMenu}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) openMenu();
        }}
      />
      <SelectChevron size={14} $open={open && !closing} />

      {open && (
        <SelectMenu role="listbox" $closing={closing}>
          {filteredOptions.length === 0 ? (
            <SelectEmpty>No matches found.</SelectEmpty>
          ) : (
            filteredOptions.map((opt) => (
              <SelectOption
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                $active={opt.value === value}
                onClick={() => handlePick(opt.value)}
              >
                <span>{opt.label}</span>
                {opt.value === value && <FiCheck size={13} />}
              </SelectOption>
            ))
          )}
        </SelectMenu>
      )}
    </SelectShell>
  );
};

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
            placeholder="Search customer or inv number"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </SearchField>

        <AnimatedSelect value={filters.customer} onChange={(e) => onChange("customer", e.target.value)}>
          <option value="">All customers</option>
          {customerOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </AnimatedSelect>

        <AnimatedSelect value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="not_paid">Not Paid</option>
        </AnimatedSelect>

        <AnimatedSelect value={filters.overdue} onChange={(e) => onChange("overdue", e.target.value)}>
          <option value="">Overdue: all</option>
          <option value="yes">Overdue only</option>
          <option value="no">Not overdue</option>
        </AnimatedSelect>

        <AnimatedSelect
          value={filters.amountRange}
          onChange={(e) => onChange("amountRange", e.target.value)}
          aria-label="Amount Range"
        >
          {amountRangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AnimatedSelect>

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
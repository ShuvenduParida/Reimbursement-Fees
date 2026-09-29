// src/components/reimbursement/ReimbursementTable.jsx
import styled from "styled-components";
import { FiInbox, FiChevronLeft, FiChevronRight, FiUpload } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import ReimbursementRowActions from "./ReimbursementRowActions";
import {
  formatCurrency,
  formatApiDate,
  getCurrencySymbol,
  getOutstandingAmount,
  isPaid,
  isOverdueRecord,
  safeText,
} from "../../utils/reimbursementUtils";

const TableWrap = styled.div`
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  box-shadow: var(--rf-shadow-sm);
`;

const Scroller = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1180px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 13px;

  thead th {
    position: sticky;
    top: 0;
    background: var(--rf-paper);
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--rf-ink);
    padding: 13px 14px;
    border-bottom: 1px solid var(--rf-line);
    white-space: nowrap;
  }

  tbody td {
    padding: 13px 14px;
    border-bottom: 1px solid var(--rf-line);
    color: var(--rf-ink-soft);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: var(--rf-paper);
  }
`;

// Outstanding Amount gets a dedicated, fixed-width column and is centered
// within it, rather than being right-aligned straight against the Payment
// Status column — that's what was making it visually read as "attached" to
// the status column before.
const NumCell = styled.th`
  text-align: center;
  width: 170px;
`;

const IdTd = styled.td`
  font-weight: 600;
  color: var(--rf-ink);
  white-space: nowrap;
`;

const DateTd = styled.td`
  ${({ $overdue }) =>
    $overdue &&
    `
    color: var(--rf-rust);
    font-weight: 500;
  `}
`;

const OutstandingTd = styled.td`
  text-align: center;
  font-weight: 700;
  color: var(--rf-ink);
  width: 170px;
`;

const StatusTd = styled.td`
  padding-left: 20px;
`;

const StatusHeadCell = styled.th`
  padding-left: 20px;
`;

// Rows are clickable to filter by customer. Hover background is already
// handled by `tbody tr:hover td` in Table; this only adds the pointer and a
// keyboard focus ring.
const ClickableRow = styled.tr`
  ${({ $clickable }) => $clickable && "cursor: pointer;"}

  &:focus-visible {
    outline: 2px solid var(--rf-brass);
    outline-offset: -2px;
  }
`;

// "Actions" column holds only the View button.
const ActionsCell = styled.td`
  text-align: left;
  white-space: nowrap;
`;

const ActionsHeadCell = styled.th`
  text-align: left;
`;

// NEW: separate "Upload" column so it has its own header.
const UploadCell = styled.td`
  text-align: left;
  white-space: nowrap;
  width: 170px;
  padding-left: 30px;
`;

const UploadHeadCell = styled.th`
  text-align: left;
  width: 170px;
  padding-left: 30px;
`;

// Outlined button so it does not compete with the dark View button.
const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid var(--rf-line-strong);
  background: var(--rf-surface);
  color: var(--rf-ink-soft);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--rf-brass-soft);
    border-color: var(--rf-brass);
    color: var(--rf-brass-dark);
  }

  &:focus-visible {
    outline: 2px solid var(--rf-brass);
    outline-offset: 2px;
  }
`;

const Empty = styled.div`
  background: var(--rf-surface);
  border: 1px dashed var(--rf-line-strong);
  border-radius: var(--rf-radius-md);
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--rf-slate);
  text-align: center;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);

  svg {
    color: var(--rf-slate-light);
    margin-bottom: 6px;
  }

  p {
    margin: 0;
    font-weight: 600;
    color: var(--rf-ink-soft);
    font-size: 13.5px;
  }

  span {
    font-size: 12.5px;
  }
`;

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-top: 1px solid var(--rf-line);
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const PageInfo = styled.span`
  font-size: 12.5px;
  color: var(--rf-slate);
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PageBtn = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid var(--rf-line);
  background: ${({ $active }) => ($active ? "var(--rf-brass)" : "var(--rf-surface)")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--rf-ink-soft)")};
  font-family: inherit;
  font-weight: 600;
  font-size: 12.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? "var(--rf-brass-dark)" : "var(--rf-paper)")};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  padding: 0 4px;
  color: var(--rf-slate-light);
  font-size: 12.5px;
`;

// total <= 7: show every page. Otherwise show first/last plus a window
// around the current page, with ellipses filled in by the caller.
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

const ReimbursementTable = ({ records, onView, onUpload, onCustomerSelect, pagination }) => {
  const selectCustomer = (name) => {
    if (onCustomerSelect && name) onCustomerSelect(name);
  };

  const totalCount = pagination ? pagination.totalCount : records.length;

  if (totalCount === 0) {
    return (
      <Empty>
        <FiInbox size={26} />
        <p>No reimbursement invoices match the current filters.</p>
        <span>Try clearing a filter or widening the date range.</span>
      </Empty>
    );
  }

  let pageNumbers = [];
  if (pagination) {
    pageNumbers = getPageNumbers(pagination.currentPage, pagination.totalPages);
  }

  return (
    <TableWrap>
      <Scroller>
        <Table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Reimbursement Number</th>
              <th>Reimbursement Date</th>
              <th>Due Date</th>
              <NumCell>Outstanding Amount</NumCell>
              <StatusHeadCell>Payment Status</StatusHeadCell>
              <ActionsHeadCell>Actions</ActionsHeadCell>
              {/* NEW: Upload column header */}
              <UploadHeadCell>Upload</UploadHeadCell>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const overdue = isOverdueRecord(r);
              const paid = isPaid(r);
              return (
                <ClickableRow
                  key={r.id}
                  $clickable={Boolean(onCustomerSelect && r.customer_name)}
                  onClick={() => selectCustomer(r.customer_name)}
                  onKeyDown={(e) => {
                    // Ignore keys pressed on inner controls (e.g. the View button).
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectCustomer(r.customer_name);
                    }
                  }}
                  tabIndex={onCustomerSelect && r.customer_name ? 0 : undefined}
                  title={onCustomerSelect && r.customer_name ? `Filter by ${r.customer_name}` : undefined}
                >
                  <td>{safeText(r.customer_name)}</td>
                  <IdTd>{safeText(r.invoice_number)}</IdTd>
                  <td>{formatApiDate(r.invoice_date)}</td>
                  <DateTd $overdue={overdue}>{formatApiDate(r.invoice_due_date)}</DateTd>
                  <OutstandingTd>{formatCurrency(getOutstandingAmount(r), getCurrencySymbol(r))}</OutstandingTd>
                  <StatusTd>
                    <StatusBadge paid={paid} overdue={overdue} />
                  </StatusTd>

                  {/* Stop propagation so clicking View / Upload never triggers the
                      row's customer filter. */}
                  <ActionsCell onClick={(e) => e.stopPropagation()}>
                    <ReimbursementRowActions record={r} onView={() => onView(r)} />
                  </ActionsCell>

                  {/* NEW: Upload cell */}
                  <UploadCell onClick={(e) => e.stopPropagation()}>
                    {onUpload && (
                      <UploadButton
                        type="button"
                        onClick={() => onUpload(r)}
                        aria-label={`Upload document for ${safeText(r.invoice_number)}`}
                      >
                        <FiUpload size={14} />
                        <span>Upload</span>
                      </UploadButton>
                    )}
                  </UploadCell>
                </ClickableRow>
              );
            })}
          </tbody>
        </Table>
      </Scroller>

      {pagination && (
        <PaginationBar>
          <PageInfo>
            Showing {pagination.startIdx}–{pagination.endIdx} of {pagination.totalCount}
          </PageInfo>
          <PageControls>
            <PageBtn
              type="button"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              aria-label="Previous page"
            >
              <FiChevronLeft size={13} />
              Previous
            </PageBtn>

            {pageNumbers.map((page, idx) => {
              const prev = pageNumbers[idx - 1];
              const showEllipsisBefore = idx > 0 && page - prev > 1;
              return (
                <span key={page} style={{ display: "inline-flex", alignItems: "center" }}>
                  {showEllipsisBefore && <Ellipsis>…</Ellipsis>}
                  <PageBtn
                    type="button"
                    $active={page === pagination.currentPage}
                    onClick={() => pagination.onPageChange(page)}
                    aria-label={`Page ${page}`}
                    aria-current={page === pagination.currentPage ? "page" : undefined}
                  >
                    {page}
                  </PageBtn>
                </span>
              );
            })}

            <PageBtn
              type="button"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              aria-label="Next page"
            >
              Next
              <FiChevronRight size={13} />
            </PageBtn>
          </PageControls>
        </PaginationBar>
      )}
    </TableWrap>
  );
};

export default ReimbursementTable;
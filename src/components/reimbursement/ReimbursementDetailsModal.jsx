// src/components/reimbursement/ReimbursementDetailsModal.jsx
import styled from "styled-components";
import { FiX, FiFileText } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import {
  formatCurrency,
  formatApiDate,
  getCurrencySymbol,
  getTotalAmount,
  getOutstandingAmount,
  isPaid,
  isOverdueRecord,
  safeText,
} from "../../utils/reimbursementUtils";

// ---------------------------------------------------------------------
// Remark field names — change ONLY these two constants if the backend
// names differ. Everything else below reads through the helpers.
//   ITEM_REMARK_FIELD       -> key on each entry of record.order_items
//   ADDITIONAL_REMARK_FIELD -> key on the reimbursement record itself
// ---------------------------------------------------------------------
const ITEM_REMARK_FIELD = "remark";
const ADDITIONAL_REMARK_FIELD = "add_remarks";

const getItemRemark = (item) => item?.[ITEM_REMARK_FIELD] ?? "";
const getAdditionalRemark = (record) => record?.[ADDITIONAL_REMARK_FIELD] ?? "";

// null / undefined / empty / whitespace-only / non-text values -> "—".
// Never renders "undefined", "null" or "[object Object]".
const displayRemark = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return "—";
  const text = value.trim();
  return text || "—";
};

// Modal shell mirrors AddReimbursementModal.jsx so the module keeps one
// modal convention; this file adds the wider card, the detail-grid and the
// item-table layout that are specific to this view.
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(22, 33, 62, 0.45);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: 16px;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--rf-surface);
  border-radius: var(--rf-radius-lg);
  box-shadow: var(--rf-shadow-md);
  overflow: hidden;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--rf-line);
  flex-shrink: 0;
`;

const HeadTitle = styled.span`
  font-family: var(--rf-font-serif, "IBM Plex Serif", Georgia, serif);
  font-size: 14.5px;
  font-weight: 600;
  color: var(--rf-ink);
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--rf-slate);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--rf-radius-sm);

  &:hover {
    background: var(--rf-paper);
  }
`;

const Body = styled.div`
  align-items: stretch;
  text-align: left;
  color: var(--rf-ink);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 22px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 20px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const FieldLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--rf-slate);
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const FieldValue = styled.span`
  font-size: 13.5px;
  color: var(--rf-ink);
  font-weight: 500;
  ${({ $outstanding }) => $outstanding && `color: var(--rf-rust); font-weight: 700;`}
`;

const RemarkBox = styled.div`
  font-size: 13px;
  line-height: 1.5;
  color: var(--rf-ink);
  padding: 10px 12px;
  background: var(--rf-paper);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-sm);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const ItemsTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rf-ink);
  margin: 4px 0 10px;
`;

const ItemsEmpty = styled.p`
  font-size: 12.5px;
  color: var(--rf-slate);
  margin: 0;
`;

const ItemsWrap = styled.div`
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-sm);
  overflow: auto;
  max-height: 260px;
`;

// Sits below the product/item section as its own card — a two-up row on
// desktop, stacked on small screens.
const AmountSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  padding: 16px 18px;
  background: var(--rf-paper);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-sm);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  min-width: 620px;

  thead th {
    position: sticky;
    top: 0;
    background: var(--rf-paper);
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--rf-slate);
    padding: 9px 12px;
    border-bottom: 1px solid var(--rf-line);
    white-space: nowrap;
  }

  thead th.rf-num {
    text-align: right;
  }

  tbody td {
    padding: 9px 12px;
    border-bottom: 1px solid var(--rf-line);
    color: var(--rf-ink-soft);
  }

  tbody td.rf-num {
    text-align: right;
  }

  tbody td.rf-remark {
    min-width: 140px;
    max-width: 240px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const Foot = styled.div`
  padding: 14px 18px;
  border-top: 1px solid var(--rf-line);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const SecondaryBtn = styled.button`
  padding: 9px 16px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid var(--rf-line);
  background: var(--rf-surface);
  color: var(--rf-ink);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--rf-paper);
  }
`;

// Reuses the same overlay/card convention as AddReimbursementModal.jsx.
const ReimbursementDetailsModal = ({ record, onClose }) => {
  if (!record) return null;

  const symbol = getCurrencySymbol(record);
  const items = Array.isArray(record.order_items) ? record.order_items : [];

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <Head>
          <HeadTitle>Reimbursement Fee for {safeText(record.invoice_number)}</HeadTitle>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </CloseBtn>
        </Head>

        <Body>
          <Top>
            <StatusBadge paid={isPaid(record)} overdue={isOverdueRecord(record)} />
          </Top>

          <Grid>
            <Field>
              <FieldLabel>Customer</FieldLabel>
              <FieldValue>{safeText(record.customer_name)}</FieldValue>
            </Field>
            <Field>
              <FieldLabel>Reimbursement date</FieldLabel>
              <FieldValue>{formatApiDate(record.invoice_date)}</FieldValue>
            </Field>
            <Field>
              <FieldLabel>Due date</FieldLabel>
              <FieldValue>{formatApiDate(record.invoice_due_date)}</FieldValue>
            </Field>
          </Grid>

          <Field>
            <FieldLabel>Additional Remarks</FieldLabel>
            <RemarkBox>{displayRemark(getAdditionalRemark(record))}</RemarkBox>
          </Field>

          <div>
            <ItemsTitle>
              <FiFileText size={14} />
              <span>Product / item details</span>
            </ItemsTitle>
            {items.length === 0 ? (
              <ItemsEmpty>No item details available for this invoice.</ItemsEmpty>
            ) : (
              <ItemsWrap>
                <ItemsTable>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="rf-num">Quantity</th>
                      <th className="rf-num">Price</th>
                      <th>Remark</th>
                      <th className="rf-num">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{safeText(item.product?.product_name)}</td>
                        <td className="rf-num">{safeText(item.quantity)}</td>
                        <td className="rf-num">
                          {item.price !== undefined && item.price !== null
                            ? formatCurrency(item.price, symbol)
                            : "—"}
                        </td>
                        <td className="rf-remark">{displayRemark(getItemRemark(item))}</td>
                        <td className="rf-num">
                          {item.final_price !== undefined && item.final_price !== null
                            ? formatCurrency(item.final_price, symbol)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ItemsTable>
              </ItemsWrap>
            )}
          </div>

          <AmountSummary>
            <Field>
              <FieldLabel>Total amount</FieldLabel>
              <FieldValue>{formatCurrency(getTotalAmount(record), symbol)}</FieldValue>
            </Field>
            <Field>
              <FieldLabel>Outstanding amount</FieldLabel>
              <FieldValue $outstanding>{formatCurrency(getOutstandingAmount(record), symbol)}</FieldValue>
            </Field>
          </AmountSummary>
        </Body>

        <Foot>
          <SecondaryBtn type="button" onClick={onClose}>
            Close
          </SecondaryBtn>
        </Foot>
      </ModalCard>
    </Overlay>
  );
};

export default ReimbursementDetailsModal;
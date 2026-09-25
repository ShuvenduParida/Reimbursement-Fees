// src/components/reimbursement/StatusBadge.jsx
import styled, { css } from "styled-components";

const toneStyles = {
  pending: css`
    background: var(--rf-amber-soft);
    color: #8a5622;
    border-color: rgba(192, 122, 44, 0.25);

    span {
      background: var(--rf-amber);
    }
  `,
  overdue: css`
    background: var(--rf-rust-soft);
    color: #8a2a25;
    border-color: rgba(178, 58, 52, 0.3);

    span {
      background: var(--rf-rust);
    }
  `,
  reimbursed: css`
    background: var(--rf-green-soft);
    color: #1f5c3d;
    border-color: rgba(47, 122, 84, 0.25);

    span {
      background: var(--rf-green);
    }
  `,
};

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border-radius: 999px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;

  ${({ $tone }) => toneStyles[$tone]}
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
`;

// invoice_status only gives us Paid ("B") / Not Paid ("A"). is_over_due adds
// a third visual state for unpaid invoices that are past their due date.
const StatusBadge = ({ paid, overdue }) => {
  let tone = "pending";
  let label = "Not Paid";

  if (paid) {
    tone = "reimbursed";
    label = "Paid";
  } else if (overdue) {
    tone = "overdue";
    label = "Not Paid · Overdue";
  }

  return (
    <Badge $tone={tone}>
      <Dot />
      {label}
    </Badge>
  );
};

export default StatusBadge;

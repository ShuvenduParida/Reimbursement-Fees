// src/components/reimbursement/SummaryCards.jsx
import styled from "styled-components";
import { FiFileText, FiCheckCircle, FiClock, FiAlertTriangle, FiDollarSign } from "react-icons/fi";
import { getSummary, getPendingOutstandingGrouped, formatGroupedAmount } from "../../utils/reimbursementUtils";

const Wrap = styled.div`
  margin-bottom: 20px;
`;

// The outstanding-fees figure gets its own banner above the four count
// cards so it stays visually prominent without crowding the count grid.
const OutstandingBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, var(--rf-ink) 0%, #1f3252 100%);
  border-radius: var(--rf-radius-md);
  padding: 18px 22px;
  margin-bottom: 14px;
  box-shadow: var(--rf-shadow-sm);
`;

const OutstandingIcon = styled.span`
  width: 44px;
  height: 44px;
  border-radius: var(--rf-radius-sm);
  background: rgba(255, 255, 255, 0.12);
  color: var(--rf-brass, #c9974a);
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const OutstandingBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const OutstandingLabel = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
`;

const OutstandingFigure = styled.span`
  font-family: var(--rf-font-serif, inherit);
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  word-break: break-word;
`;

const OutstandingNote = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const toneColor = {
  ink: "var(--rf-ink)",
  brass: "var(--rf-brass)",
  rust: "var(--rf-rust)",
  green: "var(--rf-green)",
  slate: "var(--rf-slate-light)",
};

const Card = styled.div`
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  padding: 18px 18px 16px;
  box-shadow: var(--rf-shadow-sm);
  border-left: 3px solid ${({ $tone }) => toneColor[$tone] || "var(--rf-line-strong)"};
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Label = styled.span`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rf-slate);
`;

const IconWrap = styled.span`
  width: 28px;
  height: 28px;
  border-radius: var(--rf-radius-sm);
  background: var(--rf-paper);
  color: var(--rf-ink-soft);
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const Figure = styled.div`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--rf-ink);
  line-height: 1.25;
  margin-bottom: 6px;
  word-break: break-word;
`;

const Detail = styled.div`
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
  font-size: 12.5px;
  color: var(--rf-slate);
`;

// Trimmed to the four count-based cards for now (Total / Paid / Not Paid /
// Overdue), plus the Total Outstanding Fees banner above them. The amount
// cards and the two lower panels (aging + amount distribution) are
// intentionally not rendered on the page yet — bring them back later by
// re-adding <AgingDashboard /> / <AmountDistribution /> on the page and
// restoring the extra card entries here.
const SummaryCards = ({ records }) => {
  const summary = getSummary(records);

  // Only records whose invoice_status marks them as not-paid are counted —
  // matches "Total Outstanding Fees" as the sum of currently pending
  // invoices, computed from the real outstanding_amt field, never hardcoded.
  const outstandingGrouped = getPendingOutstandingGrouped(records);
  const outstandingLabel = formatGroupedAmount(outstandingGrouped);

  const cards = [
    {
      key: "totalInvoices",
      label: "Total Invoices",
      figure: summary.totalInvoices,
      detail: "All reimbursement invoices",
      icon: FiFileText,
      tone: "ink",
    },
    {
      key: "paid",
      label: "Paid Invoices",
      figure: summary.paidCount,
      detail: "Fully paid",
      icon: FiCheckCircle,
      tone: "green",
    },
    {
      key: "notPaid",
      label: "Not Paid Invoices",
      figure: summary.notPaidCount,
      detail: "Awaiting payment",
      icon: FiClock,
      tone: "brass",
    },
    {
      key: "overdue",
      label: "Overdue Invoices",
      figure: summary.overdueCount,
      detail: "Past the due date",
      icon: FiAlertTriangle,
      tone: "rust",
    },
  ];

  return (
    <Wrap>
      <OutstandingBanner>
        <OutstandingIcon>
          <FiDollarSign size={20} />
        </OutstandingIcon>
        <OutstandingBody>
          <OutstandingLabel>Total Outstanding Fees</OutstandingLabel>
          <OutstandingFigure>{outstandingLabel}</OutstandingFigure>
          <OutstandingNote>Sum of pending amounts across all not-paid invoices</OutstandingNote>
        </OutstandingBody>
      </OutstandingBanner>

      <Grid>
        {cards.map(({ key, label, figure, detail, icon: Icon, tone }) => (
          <Card $tone={tone} key={key}>
            <CardTop>
              <Label>{label}</Label>
              <IconWrap>
                <Icon size={16} />
              </IconWrap>
            </CardTop>
            <Figure>{figure}</Figure>
            <Detail>{detail}</Detail>
          </Card>
        ))}
      </Grid>
    </Wrap>
  );
};

export default SummaryCards;

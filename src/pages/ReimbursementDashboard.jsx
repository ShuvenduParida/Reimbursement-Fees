// src/pages/ReimbursementDashboard.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FiAlertCircle, FiBarChart2, FiList, FiRefreshCw } from "react-icons/fi";
import DashboardLayout from "../components/layout/DashboardLayout";
import ReimbursementBarChart from "../components/reimbursement/ReimbursementBarChart";
import { getReimbursementOrderList } from "../services/productServices";
import { getAmountRangeStats, getDueRangeStats } from "../utils/reimbursementFilterRanges";

// Same page shell as ReimbursementFees so the two screens line up.
const Page = styled.div`
  width: 100%;
  max-width: 1500px;
  box-sizing: border-box;
  margin: 0 auto;
  min-width: 0;
  padding: 24px 24px 40px;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const Header = styled.div`
  margin-bottom: 22px;
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

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
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

  p {
    margin: 0;
    font-size: 13.5px;
  }

  ${({ $variant }) =>
    $variant === "error" &&
    `
    color: var(--rf-rust);

    p {
      color: var(--rf-ink-soft);
      max-width: 420px;
    }
  `}
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid var(--rf-line);
  border-top-color: var(--rf-brass);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
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

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const ReimbursementDashboard = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Same call, same response handling as the list page — no new API.
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReimbursementOrderList();
      setRecords(Array.isArray(res?.data) ? res.data : []);
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

  // Bar counts come from the SAME apply*Range functions the list page filters
  // with (see utils/reimbursementFilterRanges.js), so a bar's count always
  // equals the row count after clicking it.
  const amountStats = useMemo(() => getAmountRangeStats(records), [records]);
  const dueStats = useMemo(() => getDueRangeStats(records, new Date()), [records]);

  // The list page reads these query params on load and applies them through
  // its existing filter pipeline. URLSearchParams matters here: the "8000+"
  // and "15+" values contain a "+", which must be sent as %2B — a literal "+"
  // in a query string is decoded as a space.
  const openList = (param, value) => {
    const query = new URLSearchParams({ [param]: value }).toString();
    navigate({ pathname: "/reimbursement-fees", search: `?${query}` });
  };

  const amountFootnote =
    amountStats.unclassified > 0
      ? `${plural(amountStats.unclassified, "record", "records")} without a positive readable amount fall outside these ranges and are not shown.`
      : "";

  const dueNotShown = dueStats.future + dueStats.missing;
  const dueFootnote =
    dueNotShown > 0
      ? `${plural(dueNotShown, "record", "records")} not shown (${[
          dueStats.future > 0 && `${dueStats.future} due in the future`,
          dueStats.missing > 0 && `${dueStats.missing} without a due date`,
        ]
          .filter(Boolean)
          .join(", ")}).`
      : "";

  return (
    <DashboardLayout
      activeNav="reimbursement-fees"
      breadcrumb="Sales / Reimbursement Fees / Dashboard"
      pageTitle="Reimbursement Dashboard"
    >
      <Page>
        <Header>
          <Title>Reimbursement Dashboard</Title>
          <Subtitle>Select a bar to open those invoices in the Reimbursement Fees list.</Subtitle>
        </Header>

        <TabBar role="tablist" aria-label="Reimbursement Fees sections">
          <Tab type="button" role="tab" aria-selected="false" onClick={() => navigate("/reimbursement-fees")}>
            <FiList size={18} />
            <span>Reimbursements</span>
          </Tab>
          <Tab type="button" role="tab" aria-selected="true" $active>
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
          <ChartGrid>
            <ReimbursementBarChart
              title="Reimbursement Amount Distribution"
              subtitle="Number of reimbursement records in each amount range."
              data={amountStats.bars}
              onBarClick={(key) => openList("amountRange", key)}
              footnote={amountFootnote}
            />
            <ReimbursementBarChart
              title="Due Date Distribution"
              subtitle="Number of records by how many days ago the due date was, counted in calendar days from today."
              data={dueStats.bars}
              onBarClick={(key) => openList("dueRange", key)}
              footnote={dueFootnote}
            />
          </ChartGrid>
        )}
      </Page>
    </DashboardLayout>
  );
};

export default ReimbursementDashboard;
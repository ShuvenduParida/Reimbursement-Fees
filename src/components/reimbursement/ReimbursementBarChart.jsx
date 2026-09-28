// src/components/reimbursement/ReimbursementBarChart.jsx
//
// Small dependency-free bar chart (plain React + styled-components) so the
// dashboard doesn't need a charting package. Every bar is a real <button>:
// it is keyboard-focusable, announces its value to screen readers, and calls
// onBarClick(key) when activated. Colours, radii, shadows and fonts all come
// from the existing --rf-* CSS variables.
import styled from "styled-components";

const Card = styled.section`
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  box-shadow: var(--rf-shadow-sm);
  padding: 20px 22px 18px;
  min-width: 0;
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const CardTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: var(--rf-ink);
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 12.5px;
  color: var(--rf-slate);
`;

// Row 1 = axis + plot, row 2 = category labels. The top margin leaves room
// for the count printed above the tallest bar.
const Chart = styled.div`
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  grid-template-rows: 230px auto;
  column-gap: 8px;
  margin-top: 34px;
`;

const YAxis = styled.div`
  position: relative;
  grid-row: 1;
  grid-column: 1;
`;

const Tick = styled.span`
  position: absolute;
  right: 0;
  transform: translateY(50%);
  font-size: 11.5px;
  line-height: 1;
  color: var(--rf-slate);
`;

const Plot = styled.div`
  position: relative;
  grid-row: 1;
  grid-column: 2;
  border-bottom: 1px solid var(--rf-line-strong);
`;

const GridLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px solid var(--rf-line);
  pointer-events: none;
`;

const Bars = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, minmax(0, 1fr));
`;

const BarFill = styled.span`
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 0;
  background: var(--rf-brass);
  border-radius: 4px 4px 0 0;
  transition: filter 0.15s ease;
`;

const BarValue = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--rf-ink);
  pointer-events: none;
`;

const Tip = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 10px;
  border-radius: var(--rf-radius-sm);
  background: var(--rf-ink);
  color: #ffffff;
  font-size: 12px;
  line-height: 1.3;
  text-align: left;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(30, 22, 10, 0.2);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.12s ease;

  strong {
    font-weight: 700;
  }

  small {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const BarSlot = styled.button`
  position: relative;
  height: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover,
  &:focus-visible {
    background: var(--rf-paper);
  }

  &:hover ${BarFill}, &:focus-visible ${BarFill} {
    filter: brightness(0.9);
  }

  &:hover ${Tip}, &:focus-visible ${Tip} {
    opacity: 1;
    visibility: visible;
  }

  &:focus-visible {
    outline: 2px solid var(--rf-brass);
    outline-offset: -2px;
  }
`;

const XLabels = styled.div`
  grid-row: 2;
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, minmax(0, 1fr));
  padding-top: 10px;
`;

const XLabel = styled.span`
  padding: 0 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--rf-ink-soft);

  @media (max-width: 560px) {
    font-size: 11px;
  }
`;

const Footnote = styled.p`
  margin: 14px 0 0;
  font-size: 12px;
  color: var(--rf-slate);
`;

// Whole-number y-axis: a "nice" step (1, 2, 5, 10, 20, 50 …) and a top that is
// an exact multiple of it, so bar heights line up with the gridlines.
function getScale(max) {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const rough = max / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const step = Math.max(1, (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * pow);
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}

const plural = (n) => (n === 1 ? "record" : "records");

// data: [{ key, label, count, hint? }]
const ReimbursementBarChart = ({ title, subtitle, data, onBarClick, footnote }) => {
  const max = Math.max(0, ...data.map((d) => d.count));
  const { top, ticks } = getScale(max);
  const pct = (n) => (n / top) * 100;

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}

      <Chart>
        <YAxis aria-hidden="true">
          {ticks.map((t) => (
            <Tick key={t} style={{ bottom: `${pct(t)}%` }}>
              {t}
            </Tick>
          ))}
        </YAxis>

        <Plot role="group" aria-label={title}>
          {ticks
            .filter((t) => t > 0)
            .map((t) => (
              <GridLine key={t} style={{ bottom: `${pct(t)}%` }} />
            ))}

          <Bars $cols={data.length}>
            {data.map((d) => (
              <BarSlot
                key={d.key}
                type="button"
                onClick={() => onBarClick(d.key)}
                aria-label={`${d.label}: ${d.count} ${plural(d.count)}. Show these in the list.`}
              >
                <BarFill style={{ height: `${pct(d.count)}%` }} />
                <BarValue style={{ bottom: `calc(${pct(d.count)}% + 4px)` }}>{d.count}</BarValue>
                {/* Sits above the bar, but never leaves the top of the plot for tall bars. */}
                <Tip style={{ bottom: `min(calc(${pct(d.count)}% + 28px), calc(100% - 56px))` }} aria-hidden="true">
                  <strong>{d.label}</strong>
                  <span>
                    Records: {d.count}
                  </span>
                  {d.hint && <small>{d.hint}</small>}
                </Tip>
              </BarSlot>
            ))}
          </Bars>
        </Plot>

        <XLabels $cols={data.length} aria-hidden="true">
          {data.map((d) => (
            <XLabel key={d.key}>{d.label}</XLabel>
          ))}
        </XLabels>
      </Chart>

      {footnote && <Footnote>{footnote}</Footnote>}
    </Card>
  );
};

export default ReimbursementBarChart;

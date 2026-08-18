import React from "react";

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      {label != null && <div className="chart-tooltip-label">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: entry.color || entry.fill }} />
          <span>
            {entry.name}: <b>{entry.value}</b>
          </span>
        </div>
      ))}
    </div>
  );
}

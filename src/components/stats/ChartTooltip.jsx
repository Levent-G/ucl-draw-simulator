import React from "react";

// formatter (opsiyonel): değeri özel biçimlendirmek için (ör. para
// tutarlarını "12.4 M €" gibi göstermek). Verilmezse ham değer basılır --
// mevcut tüm çağıranlar davranışını AYNEN korur.
export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      {label != null && <div className="chart-tooltip-label">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: entry.color || entry.fill }} />
          <span>
            {entry.name}: <b>{formatter ? formatter(entry.value) : entry.value}</b>
          </span>
        </div>
      ))}
    </div>
  );
}

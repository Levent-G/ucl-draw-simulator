import React from "react";

export default function MatchdayTabs({ matchdays, active, onSelect }) {
  return (
    <div className="matchday-tabs">
      {matchdays.map((md) => (
        <button
          key={md.number}
          className={`matchday-tab ${active === md.number ? "active" : ""}`}
          onClick={() => onSelect(md.number)}
          title={md.label}
        >
          {md.number}. Hafta
        </button>
      ))}
    </div>
  );
}

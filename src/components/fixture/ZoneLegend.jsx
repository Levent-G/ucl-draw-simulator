import React from "react";

// Puan durumu tablosundaki renk kodlu "Durum" rozetlerinin (bkz.
// StandingsTable.jsx -- status-tone-good/neutral/bad) ne anlama geldiğini
// açıklayan küçük bir lejant. zones: competition.zones (predictionEngine.js
// buildSwissZones/buildLeagueZones çıktısı) -- her yarışma kendi bölge
// şemasını taşıdığından burada hiçbir şey sabit kodlanmaz.
export default function ZoneLegend({ zones }) {
  if (!zones || zones.length === 0) return null;
  return (
    <div className="zone-legend">
      {zones.map((z) => (
        <span key={z.key} className={`zone-legend-item status-tone-${z.tone}`}>
          <span className="zone-legend-dot" aria-hidden="true" />
          {z.label}
        </span>
      ))}
    </div>
  );
}

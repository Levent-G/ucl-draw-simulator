import React from "react";
import Crest from "../Crest.jsx";

// teams: o yarışmanın takım listesi (yarışmadan bağımsız bileşen).
export default function StandingsTable({ standings, title, teams }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="standings-card">
        {title && <h3 className="standings-title">{title}</h3>}
        <p className="standings-empty">Henüz veri yok.</p>
      </div>
    );
  }

  const teamById = Object.fromEntries((teams || []).map((t) => [t.id, t]));

  return (
    <div className="standings-card">
      {title && <h3 className="standings-title">{title}</h3>}
      <div className="standings-scroll">
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th className="standings-team-header">Takım</th>
              <th>O</th>
              <th>G</th>
              <th>B</th>
              <th>M</th>
              <th>A</th>
              <th>Y</th>
              <th>AV</th>
              <th>P</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const team = teamById[s.teamId];
              if (!team) return null;
              return (
                <tr key={s.teamId} className={`standings-row status-tone-${s.statusTone}`}>
                  <td>{s.rank}</td>
                  <td className="standings-team-cell">
                    <Crest team={team} size={18} />
                    <span>{team.name}</span>
                  </td>
                  <td>{s.played}</td>
                  <td>{s.w}</td>
                  <td>{s.d}</td>
                  <td>{s.l}</td>
                  <td>{s.gf}</td>
                  <td>{s.ga}</td>
                  <td>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                  <td className="pts-cell">{s.pts}</td>
                  <td>
                    <span className={`status-badge status-tone-${s.statusTone}`}>{s.statusLabel}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

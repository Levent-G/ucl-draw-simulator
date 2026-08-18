import React, { useMemo, useState } from "react";
import Crest from "../Crest.jsx";

function resolveZone(zones, rank) {
  for (const z of zones) if (rank <= z.max) return z;
  return zones[zones.length - 1];
}

// Kullanıcının takımları SÜRÜKLEYEREK kendi tahmini final sıralamasını
// oluşturduğu panel. Masaüstünde HTML5 drag&drop, dokunmatikte yukarı/aşağı
// butonlarıyla da taşınabilir (drag olayları touch'ta güvenilir değildir).
export default function DragStandings({ teams, order, onReorder, zones }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);

  function reorder(from, to) {
    if (from === to || from == null || to == null) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    onReorder(next);
  }

  return (
    <div className="drag-standings">
      {order.map((teamId, i) => {
        const team = teamById[teamId];
        if (!team) return null;
        const zone = resolveZone(zones, i + 1);
        return (
          <div
            key={teamId}
            className={`drag-row ${dragIndex === i ? "dragging" : ""} ${
              overIndex === i ? "drag-over" : ""
            }`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragEnter={() => setOverIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              reorder(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <span className="drag-handle" aria-hidden="true">
              ⠿
            </span>
            <span className="drag-rank">{i + 1}</span>
            <Crest team={team} size={22} />
            <span className="drag-team-name">{team.name}</span>

            <span className="drag-mobile-controls">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`${team.name} yukarı taşı`}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label={`${team.name} aşağı taşı`}
              >
                ▼
              </button>
            </span>

            <label className="drag-zone-check" title={zone.label}>
              <input type="checkbox" checked readOnly disabled />
              <span className={`status-badge status-tone-${zone.tone}`}>{zone.label}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FORMATIONS } from "../state/DreamTeamContext.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";

const FORMATION_KEY = "4-3-3";

// Takımın kayıtlı oyuncularından, mevkiine göre en yüksek reytingli
// olanları formasyon slotlarına atar -- bu GERÇEK/doğrulanmış bir ilk 11
// DEĞİLDİR (öyle bir veri kaynağımız yok), sadece kadro gücüne dayalı
// örnek/olası bir diziliş. Aynı oyuncu iki slota atanmaz.
function buildProbableLineup(players, slots) {
  const byPosition = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) {
    if (byPosition[p.position]) byPosition[p.position].push(p);
  }
  for (const pos in byPosition) {
    byPosition[pos].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  const used = new Set();
  return slots.map((slot) => {
    const pool = byPosition[slot.position] || [];
    const player = pool.find((p) => !used.has(p.id)) || null;
    if (player) used.add(player.id);
    return { slot, player };
  });
}

// Maç Analizi'ndeki "Olası Kadro" -- Rüya Takım'daki saha (pitch) tasarımıyla
// AYNI görsel dilde (bkz. pitch/pitch-slot CSS'i), ama salt okunur ve tek bir
// gerçek kulübün kayıtlı kadrosundan besleniyor.
export default function ProbableLineup({ team, players, competitionKey }) {
  const slots = FORMATIONS[FORMATION_KEY].slots;
  const assigned = useMemo(() => buildProbableLineup(players || [], slots), [players, slots]);

  return (
    <div className="probable-lineup">
      <div className="probable-lineup-head">
        <h4>🔮 Olası Kadro — {team.short} ({FORMATION_KEY})</h4>
        <p className="footnote">
          Resmi/doğrulanmış bir ilk 11 DEĞİLDİR -- kulübün kayıtlı oyuncularından, reytinge göre otomatik
          oluşturulan örnek bir diziliş.
        </p>
      </div>
      <div className="pitch pitch-readonly pitch-compact">
        <div className="pitch-lines" aria-hidden="true">
          <span className="pitch-center-circle" />
          <span className="pitch-center-line" />
        </div>
        {assigned.map(({ slot, player }) => (
          <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} key={slot.id}>
            {player ? (
              <Link to={`/${competitionKey}/oyuncu/${player.id}`} className="pitch-slot-filled">
                <PlayerAvatar player={player} size={30} />
                <span className="pitch-slot-name">{player.name}</span>
                <span className="pitch-slot-meta">{player.rating}</span>
              </Link>
            ) : (
              <div className="pitch-slot-empty">
                <span className="pitch-slot-pos">{slot.position}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

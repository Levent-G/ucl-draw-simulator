import React, { useState } from "react";
import { TACTICS } from "../../utils/predictionEngine.js";
import TeamFilterSelect from "../stats/TeamFilterSelect.jsx";
import Crest from "../Crest.jsx";

// "Antrenör Modu": bir takıma hücum/defansif oyun tarzı atayıp simülasyona
// (predictionEngine.js'teki TACTICS çarpanları üzerinden) yansıtır.
export default function TacticsPanel({ teams, teamTactics, setTeamTactic, onChanged }) {
  const [pickTeamId, setPickTeamId] = useState("");
  const assignedIds = Object.keys(teamTactics);

  // onChanged'e, henüz React state'ine işlenmemiş olsa bile YENİ taktik
  // haritasını doğrudan hesaplayıp veriyoruz -- setTeamTactic'in state
  // güncellemesi asenkron olduğu için runSimulation'ın state'in henüz
  // güncellenmemiş (eski) halini kullanmasını önler.
  const handlePick = (tacticKey) => {
    if (!pickTeamId) return;
    const next = { ...teamTactics };
    if (tacticKey === "balanced") delete next[pickTeamId];
    else next[pickTeamId] = tacticKey;
    setTeamTactic(pickTeamId, tacticKey);
    onChanged?.(next);
  };

  const handleRemove = (teamId) => {
    const next = { ...teamTactics };
    delete next[teamId];
    setTeamTactic(teamId, "balanced");
    onChanged?.(next);
  };

  return (
    <div className="tactics-panel">
      <div className="tactics-panel-head">
        <span className="tactics-panel-title">🎯 Taktik Ayarları (Antrenör Modu)</span>
        <span className="tactics-panel-hint">
          Bir takım seç, oyun tarzını belirle. Hücum ağırlıklı tarz daha çok gol atar ama
          savunması zayıflar; defansif tarz tam tersi. Seçim anında yeniden simüle edilir.
        </span>
      </div>
      <div className="tactics-panel-controls">
        <TeamFilterSelect teams={teams} value={pickTeamId} onChange={setPickTeamId} />
        <div className="tactics-buttons">
          {Object.values(TACTICS).map((t) => (
            <button
              key={t.key}
              type="button"
              className={pickTeamId && (teamTactics[pickTeamId] || "balanced") === t.key ? "active" : ""}
              disabled={!pickTeamId}
              onClick={() => handlePick(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      {assignedIds.length > 0 && (
        <div className="tactics-chips">
          {assignedIds.map((teamId) => {
            const team = teams.find((t) => t.id === teamId);
            const tactic = TACTICS[teamTactics[teamId]];
            if (!team || !tactic) return null;
            return (
              <span className="tactics-chip" key={teamId}>
                <Crest team={team} size={16} />
                {team.short} · {tactic.icon} {tactic.label}
                <button type="button" onClick={() => handleRemove(teamId)}>
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

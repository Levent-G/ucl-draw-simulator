import React, { useMemo, useState } from "react";
import { getAllPlayersEverywhere } from "../../utils/crossCompetitionPlayers.js";
import PlayerAvatar from "../PlayerAvatar.jsx";
import Crest from "../Crest.jsx";

// Tüm yarışmalardaki oyuncuları arayıp seçebileceğin bir modal.
// position verilirse (ör. "GK") sadece o mevkideki oyuncular listelenir.
// excludeGlobalIds verilirse (ör. kadroya zaten eklenmiş oyuncular) o
// oyuncular listeden çıkarılır -- aynı oyuncu iki kez seçilemez.
export default function PlayerPickerModal({ position, excludeGlobalIds, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const allPlayers = useMemo(() => getAllPlayersEverywhere(), []);
  const excludeSet = useMemo(() => new Set(excludeGlobalIds || []), [excludeGlobalIds]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = position ? allPlayers.filter((p) => p.position === position) : allPlayers;
    if (excludeSet.size > 0) pool = pool.filter((p) => !excludeSet.has(p.globalId));
    if (q) pool = pool.filter((p) => p.name.toLowerCase().includes(q));
    return pool.slice(0, 60);
  }, [allPlayers, position, query, excludeSet]);

  return (
    <div className="player-picker-overlay" onClick={onClose}>
      <div className="player-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="player-picker-head">
          <span>{position ? `Oyuncu seç (${position})` : "Oyuncu seç"}</span>
          <button className="btn-ghost" onClick={onClose}>
            Kapat
          </button>
        </div>
        <input
          autoFocus
          type="text"
          className="prediction-search"
          placeholder="İsim ara…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="player-picker-results">
          {results.map((p) => (
            <button key={p.globalId} className="player-picker-result" onClick={() => onSelect(p)}>
              <PlayerAvatar player={p} size={30} />
              <span className="player-picker-result-info">
                <b>{p.name}</b>
                <small>
                  {p.teamName} · {p.competitionName} · {p.rating}
                </small>
              </span>
              {p.team && <Crest team={p.team} size={20} />}
            </button>
          ))}
          {results.length === 0 && <p className="standings-empty">Eşleşen oyuncu yok.</p>}
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { thermalColor } from "../../utils/chartTheme.js";
import { generatePlayerHeatGrid } from "../../utils/heatmapZones.js";
import PlayerAvatar from "../PlayerAvatar.jsx";

// Seçilen oyuncunun sahada en çok bulunduğu bölgeleri kırmızı/sarı/yeşil/mavi
// termal ısı haritasıyla gösterir -- yayın/analiz programlarındaki klasik
// oyuncu ısı haritası gibi. Gerçek maç takip verisi yok; mevkiye göre
// gerçekçi bir yayılımdan TÜRETİLMİŞ tahmini bir yoğunluktur (bkz. dosya
// başındaki not).
export default function PlayerHeatmap({ rows, positionLabels }) {
  const [selectedId, setSelectedId] = useState(() => rows[0]?.id);
  const player = useMemo(
    () => rows.find((p) => p.id === selectedId) || rows[0],
    [rows, selectedId]
  );

  const { grid } = useMemo(
    () => (player ? generatePlayerHeatGrid(player) : { grid: [] }),
    [player]
  );

  if (!player) return null;

  const rowsN = grid.length;
  const colsN = grid[0]?.length || 0;

  return (
    <div className="chart-card chart-card-wide">
      <div className="heatmap-head">
        <h3>Isı Haritası — Sahadaki Yoğunluk</h3>
        <select
          className="player-select heatmap-player-select"
          value={player.id}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {rows.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.teamShort || p.teamName})
            </option>
          ))}
        </select>
      </div>

      <div className="heatmap-player-head">
        <PlayerAvatar player={player} size={40} />
        <div>
          <div className="player-profile-name">{player.name}</div>
          <div className="player-profile-meta">
            {player.teamName} · {positionLabels[player.position]}
          </div>
        </div>
      </div>

      <p className="heatmap-note">
        Kırmızı bölgeler oyuncunun sahada en yoğun bulunduğu alanları temsil
        eder. Gerçek maç takip (tracking) verisi kullanılmaz -- mevkiye göre
        gerçekçi bir yayılımdan üretilmiş <b>tahmini</b> bir yoğunluktur.
      </p>

      <div className="heat-pitch">
        <div className="heat-pitch-lines" aria-hidden="true">
          <span className="heat-pitch-center-circle" />
          <span className="heat-pitch-center-line" />
          <span className="heat-pitch-box heat-pitch-box-top" />
          <span className="heat-pitch-box heat-pitch-box-bottom" />
        </div>
        <div
          className="heat-pitch-grid"
          style={{ gridTemplateColumns: `repeat(${colsN}, 1fr)`, gridTemplateRows: `repeat(${rowsN}, 1fr)` }}
        >
          {grid.map((row, j) =>
            row.map((v, i) => (
              <div key={`${j}-${i}`} className="heat-pitch-cell" style={{ background: thermalColor(v) }} />
            ))
          )}
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Az</span>
        <div className="heatmap-legend-bar heatmap-legend-bar-thermal" />
        <span>Çok</span>
      </div>
    </div>
  );
}

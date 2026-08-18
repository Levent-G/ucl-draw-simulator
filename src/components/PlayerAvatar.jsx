import React from "react";
import { POSITION_COLORS } from "../utils/chartTheme.js";

// Gerçek oyuncu fotoğrafı YOK -- lisanssız/doğrulanamayan görsel kullanmamak
// için (Crest.jsx'teki takım amblemi fallback deseniyle aynı mantık) mevkiye
// göre renklendirilmiş, baş harflerden oluşan bir rozet gösteriyoruz.
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerAvatar({ player, size = 34 }) {
  if (!player) return null;
  const color = POSITION_COLORS[player.position] || "#5468ff";
  return (
    <span
      className="player-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(155deg, ${color}cc, ${color}44)`,
        borderColor: color,
      }}
      title={player.name}
    >
      {initials(player.name)}
    </span>
  );
}

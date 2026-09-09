import React from "react";
import { POT_COLORS } from "../../data/teams.js";

// Recharts <Scatter>'ın `shape` prop'u için özel nokta çizici -- düz bir
// renkli daire yerine takımın gerçek logosunu marker olarak kullanır (bkz.
// TeamAxisTick.jsx -- eksen etiketleri için aynı fikrin karşılığı). Logo
// yoksa torba rengine boyalı, kısaltmalı bir daireye düşer.
export default function TeamScatterShape({ cx, cy, payload, size = 26, highlightTeamId }) {
  const team = payload?.team;
  if (!team || cx == null || cy == null) return null;
  const r = size / 2;
  const isHighlight = highlightTeamId && team.id === highlightTeamId;

  return (
    <g>
      {isHighlight && <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#fbbf24" strokeWidth={2} />}
      {team.logo ? (
        <image
          href={team.logo}
          x={cx - r}
          y={cy - r}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={isHighlight ? "#fbbf24" : team.pot ? POT_COLORS[team.pot]?.main || "#5468ff" : "#5468ff"}
          />
          <text x={cx} y={cy} dy={4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
            {team.short}
          </text>
        </>
      )}
    </g>
  );
}

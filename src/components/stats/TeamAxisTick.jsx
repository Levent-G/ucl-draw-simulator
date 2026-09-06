import React from "react";
import { POT_COLORS } from "../../data/teams.js";

// Recharts, bir eksen etiketini (tick) özelleştirmek için bu şekilde bir
// bileşen/fonksiyon kabul eder -- SVG <g> içine render edilir. Sadece takım
// kısaltmasını (ör. "GAL") yazmak yerine, yanına küçük bir takım logosu da
// ekler -- "kısaltma neyin kısaltması?" sorusuna anında görsel cevap.
// `teamsByKey`: eksendeki değeri (genelde "short") gerçek takım nesnesine
// (logo/pot alanları için) eşleyen bir sözlük -- her grafik kendi takım
// listesinden kurar.
export default function TeamAxisTick({
  x,
  y,
  payload,
  teamsByKey,
  fill = "#94a3b8",
  fontSize = 11,
  imgSize = 16,
  orientation = "left",
}) {
  const team = teamsByKey?.[payload.value];
  const label = payload.value;

  if (orientation === "bottom") {
    if (!team) {
      return (
        <text x={x} y={y} dy={12} textAnchor="middle" fontSize={fontSize} fill={fill}>
          {label}
        </text>
      );
    }
    return (
      <g>
        {team.logo ? (
          <image
            href={team.logo}
            x={x - imgSize / 2}
            y={y + 6}
            width={imgSize}
            height={imgSize}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <circle cx={x} cy={y + 6 + imgSize / 2} r={imgSize / 2} fill={team.pot ? POT_COLORS[team.pot]?.main || "#5468ff" : "#5468ff"} />
        )}
        <text x={x} y={y + imgSize + 22} textAnchor="middle" fontSize={fontSize} fill={fill}>
          {label}
        </text>
      </g>
    );
  }

  if (!team) {
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fontSize={fontSize} fill={fill}>
        {label}
      </text>
    );
  }

  const gap = 4;
  const textX = x - imgSize - gap;

  return (
    <g>
      {team.logo ? (
        <image
          href={team.logo}
          x={x - imgSize}
          y={y - imgSize / 2}
          width={imgSize}
          height={imgSize}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <circle cx={x - imgSize / 2} cy={y} r={imgSize / 2} fill={team.pot ? POT_COLORS[team.pot]?.main || "#5468ff" : "#5468ff"} />
      )}
      <text x={textX} y={y} dy={4} textAnchor="end" fontSize={fontSize} fill={fill}>
        {label}
      </text>
    </g>
  );
}

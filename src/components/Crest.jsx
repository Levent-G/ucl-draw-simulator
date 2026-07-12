import React, { useState } from 'react'
import { POT_COLORS } from '../data/teams.js'

// Önce team.logo yolundaki dosyayı dener (kendi lisanslı logolarını
// public/logos/ altına ekleyince otomatik görünür). Dosya yoksa (404),
// telifsiz özgün SVG rozete geri döner -- bkz. /public/logos/README.md
export default function Crest({ team, size = 266 }) {
  const [imgFailed, setImgFailed] = useState(false)
  const color = POT_COLORS[team.pot].main

  if (team.logo && !imgFailed) {
    return (
      <img
        src={team.logo}
        alt={`${team.name} logosu`}
        width={size}
        height={size}
        style={{ objectFit: 'contain', flexShrink: 0 }}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <svg
      width={size}
      height={size * 1.12}
      viewBox="0 0 40 46"
      className="crest-svg"
      aria-label={`${team.name} amblemi`}
    >
      <path
        d="M20 1 L38 7.5 V21 C38 33.5 30.5 41.5 20 45 C9.5 41.5 2 33.5 2 21 V7.5 Z"
        fill={color}
        stroke="rgba(5,7,15,0.55)"
        strokeWidth="1.4"
      />
      <path
        d="M20 3.4 L35.6 8.6 V21 C35.6 32 29 39 20 42.3 C11 39 4.4 32 4.4 21 V8.6 Z"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.8"
      />
      <ellipse cx="14.5" cy="11" rx="9.5" ry="5.5" fill="#ffffff" opacity="0.16" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="Oswald, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="#0a0f22"
      >
        {team.short}
      </text>
    </svg>
  )
}


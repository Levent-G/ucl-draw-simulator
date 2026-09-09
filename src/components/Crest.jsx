import React, { useState } from 'react'
import { POT_COLORS } from '../data/teams.js'

// Galatasaray'ın 5 şampiyonluk yıldızı -- resmi formada yer alan bu vurgu,
// kulübün amblemi her göründüğü yerde (tablolar, maç satırları, grafikler)
// tutarlı kalsın diye tek bir noktadan (Crest.jsx) ekleniyor, her kullanım
// yerine ayrı ayrı işlenmiyor. Sadece amblem yeterince büyükse (>=20px)
// gösterilir -- çok küçük boyutlarda okunmaz/dağınık görünür.
const FIVE_STAR_TEAM_NAME = 'Galatasaray'
const FIVE_STAR_SIZE_BUMP = 1.12

// Önce team.logo yolundaki dosyayı dener (kendi lisanslı logolarını
// public/logos/ altına ekleyince otomatik görünür). Dosya yoksa (404),
// telifsiz özgün SVG rozete geri döner -- bkz. /public/logos/README.md
export default function Crest({ team, size = 266 }) {
  const [imgFailed, setImgFailed] = useState(false)
  // team.pot yoksa (ör. Süper Lig gibi torbasız/lig formatı takımları) nötr
  // bir vurgu rengine düşer.
  const color = team.pot ? POT_COLORS[team.pot]?.main || '#5468ff' : '#5468ff'

  const isFiveStar = team.name === FIVE_STAR_TEAM_NAME
  const effectiveSize = isFiveStar ? Math.round(size * FIVE_STAR_SIZE_BUMP) : size
  const showStars = isFiveStar && effectiveSize >= 20

  const inner = team.logo && !imgFailed ? (
    <img
      src={team.logo}
      alt={`${team.name} logosu`}
      width={effectiveSize}
      height={effectiveSize}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      onError={() => setImgFailed(true)}
    />
  ) : (
    <svg
      width={effectiveSize}
      height={effectiveSize * 1.12}
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

  if (!showStars) return inner

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span
        aria-hidden="true"
        className="crest-five-stars"
        style={{ fontSize: Math.max(5, Math.round(effectiveSize * 0.2)) }}
      >
        ★★★★★
      </span>
      {inner}
    </span>
  )
}


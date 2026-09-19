import React, { useState } from 'react'
import { POT_COLORS } from '../data/teams.js'

// Galatasaray'ın amblemi, resmi formadaki 5 şampiyonluk yıldızını da içeren
// versiyonuyla kullanılıyor (bkz. assets/logos/.../Galatasaray.png). Kullanıcı
// isteği ("Galatasaray logosunu diğer takımlara göre daha büyük yap -- HER
// YERDE") üzerine, bu tek bileşenin (Crest) kullanıldığı HER yerde (sidebar,
// puan durumu, istatistik satırları, takım profili vb.) diğer takımlardan
// görünür şekilde daha büyük render edilir.
//
// NOT: İlk bumpta (1.35x, sonra 1.6x) kullanıcı "hâlâ büyük gelmiyor" dedi --
// kök neden çarpan DEĞİL, dosyanın kendisiydi: eski Galatasaray.png kare bir
// tuvale sığdırılırken (bkz. proje geçmişi) etrafında büyük, boşa giden
// şeffaf bir boşluk bırakılmıştı (görünür logo, 2366x2366'lık tuvalin sadece
// %68'i genişlik / %87'si yükseklikti) -- oysa diğer takımların dosyaları
// kendi çerçevelerini %93-99 dolduruyor. Kare bir tuval + object-fit:contain
// ile bu boşluk çarpanla birlikte büyütülüyor ama görünür amblem yine de
// diğer takımlara göre orantısız KÜÇÜK kalıyordu. Asıl düzeltme: dosya, diğer
// takımların dosyalarıyla aynı sıkı kırpma kuralına uyacak şekilde yeniden
// kırpıldı (artık %98.5/%98.9 dolu) -- ÇARPAN bundan sonra beklendiği gibi
// çalışıyor.
const FIVE_STAR_TEAM_NAME = 'Galatasaray'
const FIVE_STAR_SIZE_BUMP = 1.3

// Önce team.logo yolundaki dosyayı dener (kendi lisanslı logolarını
// public/logos/ altına ekleyince otomatik görünür). Dosya yoksa (404),
// telifsiz özgün SVG rozete geri döner -- bkz. /public/logos/README.md
export default function Crest({ team, size = 266 }) {
  const [imgFailed, setImgFailed] = useState(false)
  // team.pot yoksa (ör. Süper Lig gibi torbasız/lig formatı takımları) nötr
  // bir vurgu rengine düşer.
  const color = team.pot ? POT_COLORS[team.pot]?.main || '#00c46a' : '#00c46a'

  const effectiveSize = team.name === FIVE_STAR_TEAM_NAME ? Math.round(size * FIVE_STAR_SIZE_BUMP) : size

  if (team.logo && !imgFailed) {
    return (
      <img
        src={team.logo}
        alt={`${team.name} logosu`}
        title={team.name}
        width={effectiveSize}
        height={effectiveSize}
        style={{ objectFit: 'contain', flexShrink: 0 }}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <svg
      width={effectiveSize}
      height={effectiveSize * 1.12}
      viewBox="0 0 40 46"
      className="crest-svg"
      aria-label={`${team.name} amblemi`}
    >
      <title>{team.name}</title>
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
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="#0a0f22"
      >
        {team.short}
      </text>
    </svg>
  )
}


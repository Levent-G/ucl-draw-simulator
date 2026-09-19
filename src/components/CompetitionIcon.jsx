import React, { useState } from "react";

// UCL/Avrupa Ligi için henüz gerçek bir logo dosyamız yok (emoji yeterli) --
// Süper Lig için ise `competition.logo` alanı (bkz. data/competitions.js)
// bir dosya yolu TANIMLIYOR ama dosyanın kendisini biz eklemiyoruz (telifli
// marka içeriği -- bkz. public/logos/README.md'deki aynı ilke). Kullanıcı
// kendi logosunu oraya koyarsa otomatik görünür; koymadıysa (404) sessizce
// emoji rozete geri döner -- Crest.jsx'teki desenin aynısı.
const FALLBACK_EMOJI = { ucl: "🏆", europa: "🌟", superlig: "🇹🇷" };

export default function CompetitionIcon({ competition, size = 18 }) {
  const [failed, setFailed] = useState(false);
  if (competition?.logo && !failed) {
    return (
      <img
        src={competition.logo}
        alt={competition.shortName}
        width={size}
        height={size}
        style={{ objectFit: "contain", flexShrink: 0 }}
        onError={() => setFailed(true)}
      />
    );
  }
  return <span aria-hidden="true">{FALLBACK_EMOJI[competition?.key] || "⚽"}</span>;
}

import React from "react";
import Crest from "./Crest.jsx";

// Tek, ortak, iyi tasarlanmış kazanma olasılığı gösterimi -- sitede
// dağınık/eski (bar genişliğiyle etiket hizası tutarsız kalabilen)
// `.match-row-probs`/`.matchpreview-probs` yerine BUNU kullan. `size`:
// "full" (Maç Analizi/Merkezi -- takım amblemleriyle, büyük) ya da "mini"
// (Puan Durumu satırı gibi dar alanlar için tek satır, küçük rozet).
export default function ProbabilityBar({ homeTeam, awayTeam, homePct, drawPct, awayPct, size = "full" }) {
  // Yuvarlama üç yüzdeyi tam 100 tutmayabilir (ör. 33/33/33 -> 99) --
  // en büyük payı ayarlayıp farkı orada emiyoruz, bar her zaman tam dolu
  // görünsün diye.
  const sum = homePct + drawPct + awayPct;
  const diff = 100 - sum;
  const adj = { home: homePct, draw: drawPct, away: awayPct };
  if (diff !== 0) {
    const maxKey = homePct >= drawPct && homePct >= awayPct ? "home" : drawPct >= awayPct ? "draw" : "away";
    adj[maxKey] += diff;
  }

  if (size === "mini") {
    const favIsHome = homePct >= awayPct && homePct >= drawPct;
    const favIsDraw = drawPct > homePct && drawPct >= awayPct;
    const favLabel = favIsDraw ? "Berabere" : favIsHome ? homeTeam?.short : awayTeam?.short;
    const favPct = favIsDraw ? drawPct : favIsHome ? homePct : awayPct;
    return (
      <div className="prob-mini" title={`${homeTeam?.short} ${homePct}% · Berabere ${drawPct}% · ${awayTeam?.short} ${awayPct}%`}>
        <div className="prob-mini-track">
          <span className="prob-seg prob-home" style={{ width: `${adj.home}%` }} />
          <span className="prob-seg prob-draw" style={{ width: `${adj.draw}%` }} />
          <span className="prob-seg prob-away" style={{ width: `${adj.away}%` }} />
        </div>
        <span className="prob-mini-label">{favLabel} {favPct}%</span>
      </div>
    );
  }

  return (
    <div className="prob-full">
      <div className="prob-full-track">
        <span className="prob-seg prob-home" style={{ width: `${adj.home}%` }} />
        <span className="prob-seg prob-draw" style={{ width: `${adj.draw}%` }} />
        <span className="prob-seg prob-away" style={{ width: `${adj.away}%` }} />
      </div>
      <div className="prob-full-legend">
        <div className="prob-full-legend-item">
          {homeTeam && <Crest team={homeTeam} size={20} />}
          <span className="prob-full-legend-name">{homeTeam?.short}</span>
          <b className="prob-full-legend-pct prob-home-text">{homePct}%</b>
        </div>
        <div className="prob-full-legend-item prob-full-legend-draw">
          <span className="prob-full-legend-name">Berabere</span>
          <b className="prob-full-legend-pct prob-draw-text">{drawPct}%</b>
        </div>
        <div className="prob-full-legend-item prob-full-legend-away">
          <b className="prob-full-legend-pct prob-away-text">{awayPct}%</b>
          <span className="prob-full-legend-name">{awayTeam?.short}</span>
          {awayTeam && <Crest team={awayTeam} size={20} />}
        </div>
      </div>
    </div>
  );
}

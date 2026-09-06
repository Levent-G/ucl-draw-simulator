import React from "react";
import { Link } from "react-router-dom";
import Crest from "../Crest.jsx";
import { isMatchPlayed, formatMatchDate } from "../../utils/matchDate.js";

// Haftanın en çekişmeli maçını (kazanma olasılıkları birbirine en yakın)
// büyük ve dikkat çekici gösterir -- kullanıcı hangi maça bakacağına karar
// vermek zorunda kalmasın diye. Maç henüz OYNANMADIYSA (bkz. isMatchPlayed)
// gerçek gibi görünen bir skor göstermek yerine tarih + "bekleniyor" notu ve
// model analizine bağlantı gösterilir.
export default function HighlightMatchCard({ match, competitionKey }) {
  if (!match) return null;
  const played = isMatchPlayed(match);
  const homePct = Math.round((match.homeWinProb ?? 0) * 100);
  const drawPct = Math.round((match.drawProb ?? 0) * 100);
  const awayPct = Math.max(0, 100 - homePct - drawPct);
  const dateLabel = formatMatchDate(match.date);

  return (
    <div className="highlight-match-card">
      <span className="highlight-match-badge">
        ⭐ Haftanın Öne Çıkan Maçı{dateLabel ? ` · ${dateLabel}` : ""}
      </span>
      <div className="highlight-match-body">
        <div className="highlight-match-team">
          <Crest team={match.homeTeam} size={48} />
          <span>{match.homeTeam.name}</span>
        </div>
        <div className="highlight-match-center">
          {played ? (
            <div className="highlight-match-score">
              {match.homeGoals} : {match.awayGoals}
            </div>
          ) : (
            <div className="highlight-match-score highlight-match-score-pending">⏳ Bekleniyor</div>
          )}
          <div
            className="highlight-match-probs"
            title={`Modelin tahmini -- ${homePct}% · ${drawPct}% · ${awayPct}%`}
          >
            <span className="prob-seg prob-home" style={{ width: `${homePct}%` }} />
            <span className="prob-seg prob-draw" style={{ width: `${drawPct}%` }} />
            <span className="prob-seg prob-away" style={{ width: `${awayPct}%` }} />
          </div>
          <div className="highlight-match-prob-labels">
            <span>{homePct}%</span>
            <span>{drawPct}%</span>
            <span>{awayPct}%</span>
          </div>
        </div>
        <div className="highlight-match-team highlight-match-team-away">
          <span>{match.awayTeam.name}</span>
          <Crest team={match.awayTeam} size={48} />
        </div>
      </div>
      <Link to={`/${competitionKey}/mac/${match.id}`} className="highlight-match-link">
        {played ? "Maç Merkezi'nde İzle →" : "Maç Analizini Gör →"}
      </Link>
    </div>
  );
}

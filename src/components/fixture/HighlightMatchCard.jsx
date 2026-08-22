import React from "react";
import { Link } from "react-router-dom";
import Crest from "../Crest.jsx";

// Haftanın en çekişmeli maçını (kazanma olasılıkları birbirine en yakın)
// büyük ve dikkat çekici gösterir -- kullanıcı hangi maça bakacağına karar
// vermek zorunda kalmasın diye.
export default function HighlightMatchCard({ match, competitionKey }) {
  if (!match) return null;
  const homePct = Math.round((match.homeWinProb ?? 0) * 100);
  const drawPct = Math.round((match.drawProb ?? 0) * 100);
  const awayPct = Math.max(0, 100 - homePct - drawPct);

  return (
    <div className="highlight-match-card">
      <span className="highlight-match-badge">⭐ Haftanın Öne Çıkan Maçı</span>
      <div className="highlight-match-body">
        <div className="highlight-match-team">
          <Crest team={match.homeTeam} size={48} />
          <span>{match.homeTeam.name}</span>
        </div>
        <div className="highlight-match-center">
          <div className="highlight-match-score">
            {match.homeGoals} : {match.awayGoals}
          </div>
          <div className="highlight-match-probs" title={`${homePct}% · ${drawPct}% · ${awayPct}%`}>
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
      {match.events && (
        <Link to={`/${competitionKey}/mac/${match.id}`} className="highlight-match-link">
          Maç Merkezi'nde İzle →
        </Link>
      )}
    </div>
  );
}

import React from "react";
import Crest from "../Crest.jsx";

export default function TieCard({ tie, favoriteTeamId = null }) {
  const { teamA, teamB, winner, leg1, leg2, aggA, aggB, penalty, twoLegged, isDerby } = tie;
  const isFavoriteTie = favoriteTeamId && (teamA.id === favoriteTeamId || teamB.id === favoriteTeamId);
  return (
    <div className={`knockout-tie ${isFavoriteTie ? "knockout-tie-favorite" : ""}`}>
      {isDerby && <span className="match-row-derby-badge knockout-tie-derby">🔥 Derbi</span>}
      <div className={`knockout-tie-team ${winner.id === teamA.id ? "winner" : ""}`}>
        <Crest team={teamA} size={18} />
        {teamA.name}
        {favoriteTeamId === teamA.id && <span className="favorite-star" title="Tuttuğun takım">⭐</span>}
        <span className="knockout-tie-score">{aggA}</span>
      </div>
      <div className={`knockout-tie-team ${winner.id === teamB.id ? "winner" : ""}`}>
        <Crest team={teamB} size={18} />
        {teamB.name}
        {favoriteTeamId === teamB.id && <span className="favorite-star" title="Tuttuğun takım">⭐</span>}
        <span className="knockout-tie-score">{aggB}</span>
      </div>
      <div className="knockout-tie-legs">
        {twoLegged ? (
          <>
            1. maç: {teamB.short} {leg1.homeGoals}-{leg1.awayGoals} {teamA.short} · 2. maç: {teamA.short}{" "}
            {leg2.homeGoals}-{leg2.awayGoals} {teamB.short}
          </>
        ) : (
          <>
            Final: {teamB.short} {leg1.homeGoals}-{leg1.awayGoals} {teamA.short}
          </>
        )}
      </div>
      {penalty && <div className="knockout-penalty">Penaltılarla {winner.name} kazandı</div>}
    </div>
  );
}

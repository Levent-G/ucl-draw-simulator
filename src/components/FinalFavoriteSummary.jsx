import React from "react";
import { POT_COLORS } from "../data/teams.js";
import Crest from "./Crest.jsx";
import { computeToughestGroup } from "../utils/deathGroup.js";
import { downloadShareCard } from "../utils/shareCard.js";

export default function FinalFavoriteSummary({
  teams,
  results,
  favoriteTeamId,
  predictions,
}) {
  const toughest = computeToughestGroup(results, teams);
  const favoriteTeam = teams.find((t) => t.id === favoriteTeamId);

  let opponents = [];
  let predictionScore = null;
  if (favoriteTeam) {
    const fixtures = results[favoriteTeam.id];
    opponents = [1, 2, 3, 4].flatMap((pot) =>
      ["home", "away"].map((venue) => ({
        viaPot: pot,
        home: venue === "home",
        team: fixtures[pot][venue],
      }))
    );
    if (predictions.length > 0) {
      const oppIds = new Set(opponents.map((o) => o.team?.id));
      const correct = predictions.filter((id) => oppIds.has(id)).length;
      predictionScore = { correct, total: predictions.length };
    }
  }

  return (
    <section className="favorite-summary">
      <div className="death-group-badge">
        <span className="death-group-emoji">💀</span>
        <span>
          <b>Ölüm Grubu:</b> {toughest.team.name} — rakiplerinin toplam
          katsayısı <b>{Math.round(toughest.total)}</b>
        </span>
      </div>

      {favoriteTeam && (
        <div className="favorite-card">
          <div className="favorite-card-header">
            <Crest team={favoriteTeam} size={40} />
            <div className="favorite-card-heading">
              <div className="favorite-card-title">Senin Takımın</div>
              <div className="favorite-card-name">{favoriteTeam.name}</div>
            </div>
            {predictionScore && (
              <div className="favorite-prediction-score">
                Tahmin:{" "}
                <b>
                  {predictionScore.correct}/{predictionScore.total}
                </b>{" "}
                tuttu
              </div>
            )}
            <button
              className="btn btn-primary btn-small"
              onClick={() => downloadShareCard(favoriteTeam, opponents)}
            >
              Sonucu İndir
            </button>
          </div>
          <div className="favorite-card-rows">
            {opponents.map((o, i) => (
              <div key={i} className="favorite-card-row">
                <span
                  className="favorite-card-pot-dot"
                  style={{
                    background: POT_COLORS[o.viaPot].main,
                    color: POT_COLORS[o.viaPot].main,
                  }}
                />
                {o.team && <Crest team={o.team} size={20} />}
                <span className="favorite-card-opp-name">
                  {o.team ? o.team.name : "—"}
                </span>
                <span
                  className={`favorite-card-venue ${o.home ? "home" : "away"}`}
                >
                  {o.home ? "İÇ SAHA" : "DEPLASMAN"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

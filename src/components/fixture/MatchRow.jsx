import React from "react";
import { Link } from "react-router-dom";
import Crest from "../Crest.jsx";

export default function MatchRow({ match, userScore, onUserScoreChange, competitionKey, readOnly = false, favoriteTeamId = null }) {
  const { homeTeam, awayTeam } = match;
  const isFavoriteMatch = favoriteTeamId && (homeTeam.id === favoriteTeamId || awayTeam.id === favoriteTeamId);
  const hasSim = match.homeGoals != null && match.awayGoals != null;
  const homePct = Math.round((match.homeWinProb ?? 0) * 100);
  const drawPct = Math.round((match.drawProb ?? 0) * 100);
  const awayPct = Math.max(0, 100 - homePct - drawPct);

  const homeVal = userScore?.home ?? "";
  const awayVal = userScore?.away ?? "";
  const predicted = homeVal !== "" && awayVal !== "";

  function step(field, current, delta) {
    const next = Math.min(20, Math.max(0, (Number(current) || 0) + delta));
    onUserScoreChange(field, String(next));
  }

  return (
    <div className={`match-row ${isFavoriteMatch ? "match-row-favorite" : ""}`}>
      <div className="match-row-team match-row-home">
        <Crest team={homeTeam} size={26} />
        <span>
          {homeTeam.name}
          {favoriteTeamId === homeTeam.id && <span className="favorite-star" title="Tuttuğun takım">⭐</span>}
        </span>
      </div>

      <div className="match-row-center">
        {hasSim && match.isDerby && <span className="match-row-derby-badge">🔥 Derbi</span>}
        <div className="match-row-score">
          {hasSim ? `${match.homeGoals} : ${match.awayGoals}` : "– : –"}
        </div>

        {hasSim && match.events && (
          <Link to={`/${competitionKey}/mac/${match.id}`} className="match-row-details-link">
            Maç Merkezi →
          </Link>
        )}

        {hasSim && (
          <>
            <div
              className="match-row-probs"
              title={`Ev sahibi ${homePct}% · Berabere ${drawPct}% · Deplasman ${awayPct}%`}
            >
              <span className="prob-seg prob-home" style={{ width: `${homePct}%` }} />
              <span className="prob-seg prob-draw" style={{ width: `${drawPct}%` }} />
              <span className="prob-seg prob-away" style={{ width: `${awayPct}%` }} />
            </div>
            <div className="match-row-prob-labels">
              <span>{homePct}%</span>
              <span>{drawPct}%</span>
              <span>{awayPct}%</span>
            </div>
          </>
        )}

        {!readOnly && (
        <div className={`predict-box ${predicted ? "predict-box-filled" : ""}`}>
          <label className="predict-check" title="Bu maça tahmin girdin mi?">
            <input type="checkbox" checked={predicted} readOnly disabled />
            <span className="predict-check-mark" aria-hidden="true">
              ✓
            </span>
          </label>

          <div className="predict-stepper">
            <button
              type="button"
              className="predict-step-btn"
              onClick={() => step("home", homeVal, -1)}
              aria-label={`${homeTeam.short} tahminini azalt`}
            >
              –
            </button>
            <input
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              className="predict-input"
              value={homeVal}
              onChange={(e) => onUserScoreChange("home", e.target.value)}
              placeholder="–"
            />
            <button
              type="button"
              className="predict-step-btn"
              onClick={() => step("home", homeVal, 1)}
              aria-label={`${homeTeam.short} tahminini artır`}
            >
              +
            </button>
          </div>

          <span className="predict-sep">:</span>

          <div className="predict-stepper">
            <button
              type="button"
              className="predict-step-btn"
              onClick={() => step("away", awayVal, -1)}
              aria-label={`${awayTeam.short} tahminini azalt`}
            >
              –
            </button>
            <input
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              className="predict-input"
              value={awayVal}
              onChange={(e) => onUserScoreChange("away", e.target.value)}
              placeholder="–"
            />
            <button
              type="button"
              className="predict-step-btn"
              onClick={() => step("away", awayVal, 1)}
              aria-label={`${awayTeam.short} tahminini artır`}
            >
              +
            </button>
          </div>
        </div>
        )}
      </div>

      <div className="match-row-team match-row-away">
        <span>
          {favoriteTeamId === awayTeam.id && <span className="favorite-star" title="Tuttuğun takım">⭐</span>}
          {awayTeam.name}
        </span>
        <Crest team={awayTeam} size={26} />
      </div>
    </div>
  );
}

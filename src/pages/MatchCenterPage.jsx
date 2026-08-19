import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionSubNav from "../components/CompetitionSubNav.jsx";
import Crest from "../components/Crest.jsx";

const EVENT_ICON = { goal: "⚽", yellow: "🟨", red: "🟥", sub: "🔄" };

function EventRow({ event, homeTeamId }) {
  const isHome = event.teamId === homeTeamId;
  const content = (() => {
    if (event.type === "goal") {
      return (
        <>
          <b>{event.player?.name || "Bilinmeyen oyuncu"}</b>
          {event.assist && <span className="timeline-sub-info"> (asist: {event.assist.name})</span>}
        </>
      );
    }
    if (event.type === "yellow" || event.type === "red") {
      return <b>{event.player?.name || "Bilinmeyen oyuncu"}</b>;
    }
    return (
      <>
        <span className="timeline-sub-out">{event.outPlayer?.name}</span>
        <span className="timeline-sub-arrow"> ➜ </span>
        <b>{event.inPlayer?.name}</b>
      </>
    );
  })();

  return (
    <div className="timeline-event">
      <span className="timeline-desc timeline-desc-away">{!isHome ? content : null}</span>
      <span className="timeline-center">
        <span className="timeline-minute">{event.minute}'</span>
        <span className="timeline-icon" aria-hidden="true">
          {EVENT_ICON[event.type]}
        </span>
      </span>
      <span className="timeline-desc timeline-desc-home">{isHome ? content : null}</span>
    </div>
  );
}

export default function MatchCenterPage() {
  const { competitionKey, matchId } = useParams();
  const { competition, hasFixture, simulation } = useCompetition(competitionKey);

  const match = useMemo(
    () => simulation?.matchResults.find((m) => String(m.id) === matchId) || null,
    [simulation, matchId]
  );

  if (!hasFixture || !simulation) {
    return (
      <div className="page-shell">
        <CompetitionSubNav competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Önce bir model tahmini gerekiyor</h2>
          <p>Maç Merkezi'ni görebilmek için önce Fikstür &amp; Tahmin sayfasından bir simülasyon üretilmeli.</p>
          <div className="empty-card-actions">
            <Link to={`/${competitionKey}/fikstur`} className="btn-primary">
              Fikstür &amp; Tahmin sayfasına git
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="page-shell">
        <CompetitionSubNav competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Maç bulunamadı</h2>
          <p>Bu maç şu anki fikstürde yok -- fikstür yeniden dağıtılmış olabilir.</p>
          <div className="empty-card-actions">
            <Link to={`/${competitionKey}/fikstur`} className="btn-primary">
              Fikstür &amp; Tahmin sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { homeTeam, awayTeam, events } = match;

  return (
    <div className="page-shell">
      <CompetitionSubNav competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {competition.shortName} · {match.matchdayNumber}. Hafta · Maç Merkezi
          </div>
          <h1>
            {homeTeam.name} — {awayTeam.name}
          </h1>
          <p>
            Dakika dakika simüle edilmiş gol, kart ve oyuncu değişikliği akışı. Gerçek maç
            verisi değildir -- model tahminine göre üretilmiş bir anlatımdır.
          </p>
        </div>
      </header>

      <div className="matchcenter-scorebar">
        <div className="matchcenter-team">
          <Crest team={homeTeam} size={54} />
          <span>{homeTeam.name}</span>
        </div>
        <div className="matchcenter-score">
          {match.homeGoals} : {match.awayGoals}
        </div>
        <div className="matchcenter-team matchcenter-team-away">
          <span>{awayTeam.name}</span>
          <Crest team={awayTeam} size={54} />
        </div>
      </div>

      <div className="matchcenter-timeline-card">
        <div className="timeline-marker">Maç Başladı — 0'</div>
        {events.length === 0 ? (
          <p className="standings-empty">Bu maçta kayda değer bir olay üretilmedi.</p>
        ) : (
          events.map((ev, i) => <EventRow key={i} event={ev} homeTeamId={homeTeam.id} />)
        )}
        <div className="timeline-marker timeline-marker-end">
          Maç Bitti — {match.homeGoals} : {match.awayGoals}
        </div>
      </div>
    </div>
  );
}

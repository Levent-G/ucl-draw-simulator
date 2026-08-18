import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionSubNav from "../components/CompetitionSubNav.jsx";
import Crest from "../components/Crest.jsx";

function TieCard({ tie }) {
  const { teamA, teamB, winner, leg1, leg2, aggA, aggB, penalty, twoLegged } = tie;
  return (
    <div className="knockout-tie">
      <div className={`knockout-tie-team ${winner.id === teamA.id ? "winner" : ""}`}>
        <Crest team={teamA} size={18} />
        {teamA.name}
        <span className="knockout-tie-score">{aggA}</span>
      </div>
      <div className={`knockout-tie-team ${winner.id === teamB.id ? "winner" : ""}`}>
        <Crest team={teamB} size={18} />
        {teamB.name}
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

export default function KnockoutPage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { hasFixture, simulation, knockout, generateKnockout } = useCompetition(competitionKey);

  useEffect(() => {
    if (simulation && !knockout) generateKnockout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation]);

  if (!competition.hasKnockout) {
    return (
      <div className="page-shell">
        <CompetitionSubNav competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Bu yarışmada eleme turu yok</h2>
          <p>{competition.name} çift devreli bir lig formatıdır; şampiyon doğrudan puan durumuna göre belirlenir.</p>
        </div>
      </div>
    );
  }

  if (!hasFixture || !simulation) {
    return (
      <div className="page-shell">
        <CompetitionSubNav competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Önce lig fazı tamamlanmalı</h2>
          <p>
            Eleme turlarını görebilmek için önce Fikstür &amp; Tahmin
            sayfasından bir model tahmini oluşturulmalı.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <CompetitionSubNav competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Lig Fazı Sonrası</div>
          <h1>{competition.shortName} — Eleme Turu</h1>
          <p>
            1-8. sıradakiler doğrudan Son 16'ya, 9-24. sıradakiler play-off
            oynayarak Son 16'ya yükselir. Final hariç tüm turlar gidiş-dönüş
            oynanır; toplam skor eşitse penaltılarla kazanan belirlenir.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={generateKnockout}>
            Eleme Turlarını Yeniden Simüle Et
          </button>
        </div>
      </header>

      {knockout ? (
        <>
          {knockout.rounds.map((round) => (
            <div key={round.name} className="knockout-round">
              <h3>{round.name}</h3>
              <div className="knockout-ties">
                {round.ties.map((tie, i) => (
                  <TieCard key={i} tie={tie} />
                ))}
              </div>
            </div>
          ))}
          {knockout.champion && (
            <div className="knockout-champion">
              <Crest team={knockout.champion} size={56} />
              <div>
                <div className="knockout-champion-label">Şampiyon</div>
                <div className="knockout-champion-name">{knockout.champion.name}</div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Simüle ediliyor…</p>
      )}
    </div>
  );
}

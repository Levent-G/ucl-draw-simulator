import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useSeasonArchive } from "../state/SeasonArchiveContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import Crest from "../components/Crest.jsx";
import NextStepCta from "../components/NextStepCta.jsx";
import TieCard from "../components/knockout/TieCard.jsx";
import { topScorers } from "../utils/statsSelectors.js";

export default function KnockoutPage() {
  const { competitionKey } = useParams();
  const { competition, hasFixture, simulation, knockout, generateKnockout, careerSeason, advanceToNextSeason } =
    useCompetition(competitionKey);
  const { addEntry } = useSeasonArchive();
  const savedKnockoutRef = useRef(null);

  useEffect(() => {
    if (simulation && !knockout) generateKnockout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation]);

  // Şampiyon belli olur olmaz (knockout bracket'i her yeniden simüle
  // edilişte de dahil) sezon arşivine bir özet kaydeder -- aynı bracket
  // objesi için tekrar kaydetmemek adına ref ile takip edilir.
  useEffect(() => {
    if (!knockout?.champion || !simulation || savedKnockoutRef.current === knockout) return;
    savedKnockoutRef.current = knockout;
    const teamById = Object.fromEntries(competition.teams.map((t) => [t.id, t]));
    const scorer = topScorers(competition.getAllPlayers(), simulation.playerStats, 1)[0];
    const champ = knockout.champion;
    addEntry({
      competitionKey,
      competitionName: competition.name,
      competitionShortName: competition.shortName,
      viaKnockout: true,
      champion: {
        id: champ.id,
        name: champ.name,
        short: champ.short,
        pot: champ.pot,
        country: champ.country,
        coeff: champ.coeff,
        logo: champ.logo,
      },
      meta: null,
      standingsTop: (simulation.standings || []).slice(0, 5).map((s) => ({
        teamId: s.teamId,
        short: teamById[s.teamId]?.short || "",
        rank: s.rank,
        pts: s.pts,
      })),
      topScorer:
        scorer && scorer.goals > 0
          ? { name: scorer.name, teamName: teamById[scorer.teamId]?.name || "", goals: scorer.goals }
          : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knockout, simulation]);

  if (!competition.hasKnockout) {
    return (
      <div className="page-shell">
        <CompetitionStepper competitionKey={competitionKey} />
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
        <CompetitionStepper competitionKey={competitionKey} />
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
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            Lig Fazı Sonrası
            {careerSeason > 1 && <span className="career-season-badge">🏟️ Kariyer · {careerSeason}. Sezon</span>}
          </div>
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
            <>
              <div className="knockout-champion">
                <Crest team={knockout.champion} size={56} />
                <div>
                  <div className="knockout-champion-label">Şampiyon</div>
                  <div className="knockout-champion-name">{knockout.champion.name}</div>
                </div>
              </div>
              <NextStepCta
                title="Şampiyon belli oldu -- peki istatistikler ne diyor?"
                description={`${knockout.champion.name} ve turnuvanın tüm gol kralı/kart/kadro istatistiklerini incele.`}
                to={`/${competitionKey}/istatistik`}
                label="İstatistiklere Git"
                icon="📊"
              />
              <button
                className="btn-primary knockout-advance-season-btn"
                onClick={() => advanceToNextSeason(knockout.champion.id)}
                title="Bu sezonun performansına göre katsayılar güncellenir, yeni bir kura/sezona geçilir"
              >
                🏟️ Yeni Sezona Geç (Kariyer)
              </button>
            </>
          )}
        </>
      ) : (
        <p>Simüle ediliyor…</p>
      )}
    </div>
  );
}

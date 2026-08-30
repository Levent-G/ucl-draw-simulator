import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";
import Crest from "../components/Crest.jsx";

// İki takım arasındaki TÜM geçmiş simülasyon sonuçlarını (her "tahminleri
// yenile" birikerek matchHistory'ye eklenir -- bkz. CompetitionContext)
// tarar ve aralarındaki eşleşmeleri + toplu istatistiği çıkarır.
function computeHeadToHead(matchHistory, teamAId, teamBId) {
  const meetings = [];
  matchHistory.forEach((run, runIndex) => {
    for (const m of run.matches) {
      const isAB = m.homeTeam.id === teamAId && m.awayTeam.id === teamBId;
      const isBA = m.homeTeam.id === teamBId && m.awayTeam.id === teamAId;
      if (!isAB && !isBA) continue;
      meetings.push({
        runIndex: runIndex + 1,
        matchdayNumber: m.matchdayNumber,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoals: m.homeGoals,
        awayGoals: m.awayGoals,
      });
    }
  });

  const stats = { played: meetings.length, aWins: 0, bWins: 0, draws: 0, aGoals: 0, bGoals: 0 };
  for (const m of meetings) {
    const aGoals = m.homeTeam.id === teamAId ? m.homeGoals : m.awayGoals;
    const bGoals = m.homeTeam.id === teamBId ? m.homeGoals : m.awayGoals;
    stats.aGoals += aGoals;
    stats.bGoals += bGoals;
    if (aGoals > bGoals) stats.aWins++;
    else if (bGoals > aGoals) stats.bWins++;
    else stats.draws++;
  }
  return { meetings, stats };
}

export default function HeadToHeadPage() {
  const { competitionKey } = useParams();
  const { competition, matchHistory, hasSimulation } = useCompetition(competitionKey);
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");

  const teamA = competition.teams.find((t) => t.id === teamAId) || null;
  const teamB = competition.teams.find((t) => t.id === teamBId) || null;
  const sameTeam = teamAId && teamBId && teamAId === teamBId;

  const { meetings, stats } = useMemo(() => {
    if (!teamAId || !teamBId || sameTeam) return { meetings: [], stats: null };
    return computeHeadToHead(matchHistory, teamAId, teamBId);
  }, [matchHistory, teamAId, teamBId, sameTeam]);

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">İki Takım · Tüm Simülasyonlar</div>
          <h1>{competition.shortName} — Karşılıklı Geçmiş</h1>
          <p>
            İki takım seç; bu oturumda çalıştırdığın TÜM simülasyonlarda (ilk model
            tahmini + her "Model Tahminlerini Yenile") bu iki takımın karşılaştığı
            maçları ve toplu istatistiği burada birikimli olarak görürsün.
          </p>
        </div>
      </header>

      {!hasSimulation && (
        <EmptyState
          variant="inline"
          description="Henüz bir model tahmini üretilmedi."
          primaryCta={{ label: "Fikstür & Tahmin sayfasına git", to: `/${competitionKey}/fikstur` }}
        />
      )}

      <div className="h2h-picker-row">
        <TeamFilterSelect teams={competition.teams} value={teamAId} onChange={setTeamAId} />
        <span className="h2h-vs">VS</span>
        <TeamFilterSelect teams={competition.teams} value={teamBId} onChange={setTeamBId} />
      </div>

      {sameTeam && <p className="stats-callout">Aynı takımı iki kez seçemezsin.</p>}

      {teamA && teamB && !sameTeam && (
        <>
          {stats && stats.played > 0 ? (
            <>
              <div className="h2h-summary-card">
                <div className="h2h-summary-team">
                  <Crest team={teamA} size={44} />
                  <span>{teamA.name}</span>
                </div>
                <div className="h2h-summary-stats">
                  <div className="h2h-summary-row">
                    <span>{stats.aWins}</span>
                    <span>Galibiyet</span>
                    <span>{stats.bWins}</span>
                  </div>
                  <div className="h2h-summary-row">
                    <span />
                    <span>{stats.draws} Beraberlik</span>
                    <span />
                  </div>
                  <div className="h2h-summary-row">
                    <span>{stats.aGoals}</span>
                    <span>Gol</span>
                    <span>{stats.bGoals}</span>
                  </div>
                  <div className="h2h-summary-total">{stats.played} karşılaşma (bu oturumda)</div>
                </div>
                <div className="h2h-summary-team h2h-summary-team-away">
                  <span>{teamB.name}</span>
                  <Crest team={teamB} size={44} />
                </div>
              </div>

              <div className="chart-card chart-card-wide">
                <h3>Tüm Karşılaşmalar</h3>
                <div className="h2h-meetings-list">
                  {meetings.map((m, i) => (
                    <div className="h2h-meeting-row" key={i}>
                      <span className="h2h-meeting-run">Simülasyon #{m.runIndex} · {m.matchdayNumber}. Hafta</span>
                      <span className="h2h-meeting-teams">
                        <Crest team={m.homeTeam} size={18} />
                        {m.homeTeam.short}
                        <b className="h2h-meeting-score">
                          {m.homeGoals} - {m.awayGoals}
                        </b>
                        {m.awayTeam.short}
                        <Crest team={m.awayTeam} size={18} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="stats-callout">
              Bu iki takım bu oturumda henüz hiç karşılaşmadı (kura eşleştirmemiş olabilir,
              ya da henüz yeterince simülasyon çalıştırılmadı). Fikstür sayfasından "Model
              Tahminlerini Yenile"ye birkaç kez basarsan buradaki geçmiş birikmeye başlar.
            </div>
          )}
        </>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useTransferMarket } from "../state/TransferContext.jsx";
import { useTeamTactics } from "../state/TacticsContext.jsx";
import { standingsFromOrder } from "../utils/predictionEngine.js";
import { teamsByCoeffDesc } from "../utils/statsSelectors.js";
import CompetitionSubNav from "../components/CompetitionSubNav.jsx";
import MatchdayTabs from "../components/fixture/MatchdayTabs.jsx";
import MatchRow from "../components/fixture/MatchRow.jsx";
import StandingsTable from "../components/fixture/StandingsTable.jsx";
import DragStandings from "../components/fixture/DragStandings.jsx";
import TacticsPanel from "../components/fixture/TacticsPanel.jsx";

export default function FixturePage() {
  const { competitionKey } = useParams();
  const {
    competition,
    hasDraw,
    fixture,
    ensureFixture,
    regenerateFixture,
    simulation,
    runSimulation,
    userScores,
    updateUserScore,
    clearUserScores,
    standingsOrder,
    setStandingsOrder,
    startLeagueSeason,
  } = useCompetition(competitionKey);
  const { effectiveAllPlayers, hasTransfers } = useTransferMarket(competitionKey);
  const { teamTactics, setTeamTactic } = useTeamTactics(competitionKey);

  const [activeMatchday, setActiveMatchday] = useState(1);
  const [standingsView, setStandingsView] = useState("model");

  useEffect(() => {
    setActiveMatchday(1);
    setStandingsView("model");
  }, [competitionKey]);

  useEffect(() => {
    if (hasDraw && !fixture) ensureFixture();
  }, [hasDraw, fixture, ensureFixture]);

  useEffect(() => {
    if (fixture && !simulation) runSimulation(fixture, effectiveAllPlayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture, simulation, runSimulation]);

  const simMatchById = useMemo(() => {
    if (!simulation) return {};
    return Object.fromEntries(simulation.matchResults.map((m) => [m.id, m]));
  }, [simulation]);

  const activeMatches = useMemo(() => {
    if (!fixture) return [];
    const md = fixture.find((m) => m.number === activeMatchday);
    if (!md) return [];
    return md.matches.map((m) => ({ ...m, ...(simMatchById[m.id] || {}) }));
  }, [fixture, activeMatchday, simMatchById]);

  const totalMatchCount = useMemo(
    () => (fixture ? fixture.reduce((sum, md) => sum + md.matches.length, 0) : 0),
    [fixture]
  );

  const dragOrder = useMemo(() => {
    if (standingsOrder && standingsOrder.length === competition.teams.length) return standingsOrder;
    if (simulation) return simulation.standings.map((s) => s.teamId);
    return teamsByCoeffDesc(competition.teams).map((t) => t.id);
  }, [standingsOrder, simulation, competition]);

  const dragStandingsRows = useMemo(
    () => standingsFromOrder(dragOrder, competition.teams, competition.zones),
    [dragOrder, competition]
  );

  if (!hasDraw) {
    return (
      <div className="page-shell fixture-empty">
        <CompetitionSubNav competitionKey={competitionKey} />
        <div className="empty-card">
          {competition.format === "swiss" ? (
            <>
              <h2>Önce bir kura çekimi lazım</h2>
              <p>
                Fikstür ve tahmin sayfasını görebilmek için önce lig fazı kura
                çekiminin tamamlanmış olması gerekiyor.
              </p>
              <div className="empty-card-actions">
                <Link to={`/${competitionKey}`} className="btn-primary">
                  Kura Çekimine Git
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2>Sezon henüz başlamadı</h2>
              <p>
                {competition.name} için çift devreli lig fikstürünü oluşturup
                tahminlere başlayabilirsin.
              </p>
              <div className="empty-card-actions">
                <button className="btn-secondary" onClick={startLeagueSeason}>
                  Sezonu Başlat ({competition.teams.length} Takım)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="page-shell fixture-empty">
        <CompetitionSubNav competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Fikstür oluşturuluyor…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <CompetitionSubNav competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {fixture.length} Hafta · {totalMatchCount} Maç
          </div>
          <h1>{competition.shortName} — Fikstür &amp; Tahmin</h1>
          <p>
            {competition.format === "swiss"
              ? "Kura sonucuna göre oluşturulan haftalık lig fazı takvimi"
              : "Çift devreli lig takvimi"}{" "}
            ve takım katsayılarına dayalı istatistiksel modelle üretilen
            tahmini skorlar. İstersen kendi tahminini de girebilirsin.
          </p>
          {hasTransfers && (
            <p className="fixture-transfer-note">
              🔁 Transfer Merkezi'nde yaptığın transferler bu simülasyona
              yansıtılıyor.
            </p>
          )}
        </div>
        <div className="page-header-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              regenerateFixture();
              clearUserScores();
            }}
          >
            {competition.format === "swiss" ? "Haftaları Yeniden Dağıt" : "Fikstürü Yeniden Oluştur"}
          </button>
          <button className="btn-primary" onClick={() => runSimulation(fixture, effectiveAllPlayers)}>
            Model Tahminlerini Yenile
          </button>
        </div>
      </header>

      <TacticsPanel
        teams={competition.teams}
        teamTactics={teamTactics}
        setTeamTactic={setTeamTactic}
        onChanged={(nextTactics) => runSimulation(fixture, effectiveAllPlayers, nextTactics)}
      />

      <section className="fixture-standings-section">
        <div className="standings-toggle">
          <button
            className={standingsView === "model" ? "active" : ""}
            onClick={() => setStandingsView("model")}
          >
            Model Tahmini Puan Durumu
          </button>
          <button
            className={standingsView === "drag" ? "active" : ""}
            onClick={() => setStandingsView("drag")}
          >
            Sıralama Tahminim (Sürükle)
          </button>
        </div>

        {standingsView === "model" && (
          <StandingsTable standings={simulation?.standings} teams={competition.teams} />
        )}
        {standingsView === "drag" && (
          <div className="standings-card">
            <p className="drag-standings-hint">
              Takımları sürükleyerek (ya da ok butonlarıyla) kendi tahmini final
              sıralamanı oluştur. Rozet, o sıradaki bölgeyi ({competition.zones
                .map((z) => z.label)
                .join(" / ")}) gösterir.
            </p>
            <DragStandings
              teams={competition.teams}
              order={dragOrder}
              onReorder={setStandingsOrder}
              zones={competition.zones}
            />
          </div>
        )}
      </section>

      <section className="fixture-matches-section">
        <MatchdayTabs matchdays={fixture} active={activeMatchday} onSelect={setActiveMatchday} />
        <div className="match-list">
          {activeMatches.map((m) => (
            <MatchRow
              key={m.id}
              match={m}
              competitionKey={competitionKey}
              userScore={userScores[m.id]}
              onUserScoreChange={(field, value) => updateUserScore(m.id, field, value)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

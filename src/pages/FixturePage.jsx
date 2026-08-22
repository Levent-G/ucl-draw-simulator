import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useTransferMarket } from "../state/TransferContext.jsx";
import { useTeamTactics } from "../state/TacticsContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import MatchdayTabs from "../components/fixture/MatchdayTabs.jsx";
import MatchRow from "../components/fixture/MatchRow.jsx";
import StandingsTable from "../components/fixture/StandingsTable.jsx";
import TacticsPanel from "../components/fixture/TacticsPanel.jsx";
import HighlightMatchCard from "../components/fixture/HighlightMatchCard.jsx";
import NextStepCta from "../components/NextStepCta.jsx";

// Tahmin özetini (puan durumu + tüm fikstür) düz metin olarak indirilebilir
// bir dosyaya çevirir. Backend yok -- tamamen istemci tarafında bir Blob
// indirmesi.
function buildPredictionExport(competition, simulation, fixture) {
  const lines = [];
  lines.push(`${competition.name} — Fikstür & Tahmin Özeti`);
  lines.push(`Oluşturulma: ${new Date().toLocaleString("tr-TR")}`);
  lines.push("");

  if (simulation?.standings) {
    lines.push("MODEL TAHMİNİ PUAN DURUMU");
    simulation.standings.forEach((s, i) => {
      const team = competition.teams.find((t) => t.id === s.teamId);
      lines.push(
        `${i + 1}. ${team?.name ?? s.teamId} — ${s.pts} puan (${s.w}G ${s.d}B ${s.l}M, AV ${s.gd > 0 ? "+" : ""}${s.gd}) [${s.statusLabel}]`
      );
    });
    lines.push("");
  }

  const simMatchById = simulation
    ? Object.fromEntries(simulation.matchResults.map((m) => [m.id, m]))
    : {};

  lines.push("FİKSTÜR VE TAHMİNİ SKORLAR");
  for (const md of fixture) {
    lines.push(`-- ${md.number}. Hafta --`);
    for (const m of md.matches) {
      const sim = simMatchById[m.id];
      const score = sim ? `${sim.homeGoals} - ${sim.awayGoals}` : "- : -";
      lines.push(`  ${m.homeTeam.name} ${score} ${m.awayTeam.name}`);
    }
  }
  lines.push("");
  lines.push("Not: Bu tahminler gerçek bir spor verisi değildir, bu simülatörün");
  lines.push("kura/katsayı/model motoruna göre üretilmiş kurgusal bir sonuçtur.");

  return lines.join("\n");
}

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
    clearUserScores,
    startLeagueSeason,
  } = useCompetition(competitionKey);
  const { effectiveAllPlayers, hasTransfers } = useTransferMarket(competitionKey);
  const { teamTactics, setTeamTactic } = useTeamTactics(competitionKey);

  const [activeMatchday, setActiveMatchday] = useState(1);

  useEffect(() => {
    setActiveMatchday(1);
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

  // Kullanıcı hangi maça bakacağını düşünmesin diye, bu haftanın en çekişmeli
  // (kazanma olasılıkları en birbirine yakın) maçını öne çıkarıyoruz.
  const highlightMatch = useMemo(() => {
    const withSim = activeMatches.filter((m) => m.homeGoals != null);
    if (!withSim.length) return null;
    return withSim.reduce((best, m) => {
      const margin = Math.abs((m.homeWinProb ?? 0) - (m.awayWinProb ?? 0));
      if (!best) return m;
      const bestMargin = Math.abs((best.homeWinProb ?? 0) - (best.awayWinProb ?? 0));
      return margin < bestMargin ? m : best;
    }, null);
  }, [activeMatches]);

  const handleDownload = () => {
    if (!simulation || !fixture) return;
    const text = buildPredictionExport(competition, simulation, fixture);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${competition.shortName.replace(/\s+/g, "-")}-tahminler.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!hasDraw) {
    return (
      <div className="page-shell fixture-empty">
        <CompetitionStepper competitionKey={competitionKey} />
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
        <CompetitionStepper competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Fikstür oluşturuluyor…</h2>
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
            {fixture.length} Hafta · {totalMatchCount} Maç
          </div>
          <h1>{competition.shortName} — Fikstür</h1>
          <p>
            {competition.format === "swiss"
              ? "Kura sonucuna göre oluşturulan haftalık lig fazı takvimi"
              : "Çift devreli lig takvimi"}{" "}
            ve takım katsayılarına dayalı istatistiksel modelle üretilen
            tahmini skorlar. Kendi tahminini (sıralamayı sürükleme, skor
            girme, gol kralı seçme) Canlı Skorlar sayfasından yapabilirsin.
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
          <button className="btn-secondary" onClick={handleDownload} disabled={!simulation}>
            ⬇ Tahminlerini İndir
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
        <StandingsTable
          standings={simulation?.standings}
          teams={competition.teams}
          title="Model Tahmini Puan Durumu"
          competitionKey={competitionKey}
        />
      </section>

      <section className="fixture-matches-section">
        <MatchdayTabs matchdays={fixture} active={activeMatchday} onSelect={setActiveMatchday} />
        <HighlightMatchCard match={highlightMatch} competitionKey={competitionKey} />
        <div className="match-list">
          {activeMatches.map((m) => (
            <MatchRow key={m.id} match={m} competitionKey={competitionKey} readOnly />
          ))}
        </div>
      </section>

      {simulation && (
        <div className="next-step-cta-row">
          {competition.hasKnockout && (
            <NextStepCta
              title="Lig fazı tamam, sırada eleme turu var"
              description="1-8. sıradakiler doğrudan Son 16'ya, 9-24. sıradakiler play-off oynayarak yükselir. Şampiyona kadar tüm turları simüle et."
              to={`/${competitionKey}/eleme-turu`}
              label="Eleme Turlarını Gör"
              icon="🏆"
            />
          )}
          <NextStepCta
            title="Takım ve oyuncu istatistiklerini incele"
            description="Gol kralı, ısı haritası, puan durumu ve daha fazlası -- bu simülasyona göre üretilen tüm grafik ve tablolar İstatistikler sayfasında."
            to={`/${competitionKey}/istatistik`}
            label="İstatistiklere Git"
            icon="📊"
          />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { COMPETITION_LIST, getCompetition } from "../data/competitions.js";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useTeamTactics } from "../state/TacticsContext.jsx";
import { useSettings } from "../state/SettingsContext.jsx";
import {
  SUPER_LIG_LIVE_ASOF,
  SUPER_LIG_LIVE_STANDINGS,
  SUPER_LIG_LIVE_RESULTS,
  UCL_SEASON_STATUS,
  EUROPA_SEASON_STATUS,
  buildSuperLigContinuation,
} from "../data/liveStatus.js";
import Crest from "../components/Crest.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import ChartTooltip from "../components/stats/ChartTooltip.jsx";
import StandingsTable from "../components/fixture/StandingsTable.jsx";
import InteractivePrediction from "../components/live/InteractivePrediction.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";
import { topScorers } from "../utils/statsSelectors.js";
import { simulateSeason } from "../utils/predictionEngine.js";
import { generateFullDraw } from "../utils/drawEngine.js";
import { buildResultsFromMatches } from "../utils/resultsHelpers.js";

// Gerçek 1. Hafta zaten oynandığı için o haftayı yeniden "tahmin etmiyoruz"
// -- gerçek puan durumundan devam ederek SADECE henüz oynanmamış maçları
// (sıradaki hafta + kalan sezon) simüle ediyoruz. Süper Lig sezonu
// LeagueHomePage'den başlatılmış olmalı (fikstür orada üretiliyor).
function SuperLigPrediction() {
  const { competition, hasDraw, fixture } = useCompetition("superlig");
  const { teamTactics } = useTeamTactics("superlig");
  const { settings } = useSettings();

  const continuation = useMemo(() => {
    if (!fixture) return null;
    const { remainingFixture, initialStandings } = buildSuperLigContinuation(competition.teams, fixture);
    if (remainingFixture.length === 0) return null;
    const sim = simulateSeason(remainingFixture, {
      teams: competition.teams,
      allPlayers: competition.getAllPlayers(),
      zones: competition.zones,
      tacticsById: teamTactics,
      initialStandings,
      settings,
    });
    return { remainingFixture, initialStandings, sim };
  }, [competition, fixture, teamTactics, settings]);

  if (!hasDraw || !fixture) {
    return (
      <div className="stats-callout live-sim-empty">
        Sıradaki maçlar ve sıralama tahminini görebilmek için önce sezonu
        başlatmalısın. <Link to="/superlig">Süper Lig'e git →</Link>
      </div>
    );
  }

  if (!continuation) {
    return (
      <div className="stats-callout live-sim-empty">
        Fikstürdeki tüm maçlar zaten gerçek sonuçlarla eşleşiyor, tahmin
        edilecek yeni bir maç kalmadı.
      </div>
    );
  }

  const nextMatchday = continuation.remainingFixture[0];
  const nextMatches = nextMatchday
    ? continuation.sim.matchResults.filter((m) => m.matchdayNumber === nextMatchday.number)
    : [];

  return (
    <div className="live-sim-preview">
      <div className="live-asof live-sim-badge">
        🎲 Tahmin — gerçek 1. Hafta sonuçlarından devam eden, henüz oynanmamış
        maçların model tahmini
      </div>

      <div className="chart-card chart-card-wide">
        <h3>Sıradaki Maçlar{nextMatchday ? ` — ${nextMatchday.number}. Hafta` : ""}</h3>
        <div className="live-results-list">
          {nextMatches.map((m) => (
            <div key={m.id} className="live-result-row">
              <span className="live-result-label">Tahmin</span>
              <span className="live-result-team">
                <Crest team={m.homeTeam} size={20} />
                <span className="live-result-team-name">{m.homeTeam.name}</span>
              </span>
              <span className="live-result-score">
                {m.homeGoals} - {m.awayGoals}
              </span>
              <span className="live-result-team">
                <span className="live-result-team-name">{m.awayTeam.name}</span>
                <Crest team={m.awayTeam} size={20} />
              </span>
            </div>
          ))}
          {nextMatches.length === 0 && <p className="standings-empty">Sıradaki hafta bulunamadı.</p>}
        </div>
      </div>

      <h3 className="ip-section-title">Tahminini Kendin Şekillendir</h3>
      <InteractivePrediction
        competitionKey="superlig"
        dataSource={{
          fixture: continuation.remainingFixture,
          modelStandings: continuation.sim.standings,
          modelKnockout: null,
          modelMatchResults: continuation.sim.matchResults,
          modelPlayerStats: continuation.sim.playerStats,
          initialStandings: continuation.initialStandings,
          hasKnockout: false,
        }}
      />
    </div>
  );
}

function SuperLigLive() {
  const competition = getCompetition("superlig");
  const teamByName = useMemo(
    () => Object.fromEntries(competition.teams.map((t) => [t.name, t])),
    [competition]
  );

  const byAttack = useMemo(
    () => [...SUPER_LIG_LIVE_STANDINGS].sort((a, b) => b.gf - a.gf || a.rank - b.rank),
    []
  );
  const byDefense = useMemo(
    () => [...SUPER_LIG_LIVE_STANDINGS].sort((a, b) => a.ga - b.ga || a.rank - b.rank),
    []
  );

  return (
    <>
      <div className="live-asof">📡 Gerçek veri — güncelleme anı: {SUPER_LIG_LIVE_ASOF}</div>

      <div className="chart-card chart-card-wide">
        <h3>Gerçek Puan Durumu</h3>
        <div className="standings-scroll">
          <table className="standings-table">
            <thead>
              <tr>
                <th>#</th>
                <th className="standings-team-header">Takım</th>
                <th>O</th>
                <th>G</th>
                <th>B</th>
                <th>M</th>
                <th>A</th>
                <th>Y</th>
                <th>AV</th>
                <th>P</th>
              </tr>
            </thead>
            <tbody>
              {SUPER_LIG_LIVE_STANDINGS.map((row) => {
                const team = teamByName[row.teamName];
                return (
                  <tr key={row.teamName}>
                    <td style={{ textAlign: "center" }}>{row.rank}</td>
                    <td className="standings-team-cell">
                      {team && <Crest team={team} size={18} />}
                      <span>{row.teamName}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>{row.played}</td>
                    <td style={{ textAlign: "center" }}>{row.w}</td>
                    <td style={{ textAlign: "center" }}>{row.d}</td>
                    <td style={{ textAlign: "center" }}>{row.l}</td>
                    <td style={{ textAlign: "center" }}>{row.gf}</td>
                    <td style={{ textAlign: "center" }}>{row.ga}</td>
                    <td style={{ textAlign: "center" }}>
                      {row.gf - row.ga > 0 ? "+" : ""}
                      {row.gf - row.ga}
                    </td>
                    <td className="pts-cell" style={{ textAlign: "center" }}>
                      {row.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-card chart-card-wide live-results-card">
        <h3>1. Hafta — Tüm Sonuçlar ({SUPER_LIG_LIVE_RESULTS.length} maç)</h3>
        <div className="live-results-list">
          {SUPER_LIG_LIVE_RESULTS.map((r, i) => {
            const home = teamByName[r.home];
            const away = teamByName[r.away];
            return (
              <div key={i} className="live-result-row">
                <span className="live-result-label">
                  {r.label}
                  {r.date ? ` · ${r.date}` : ""}
                </span>
                <span className="live-result-team">
                  {home && <Crest team={home} size={20} />}
                  <span className="live-result-team-name">{r.home}</span>
                </span>
                <span className="live-result-score">
                  {r.homeGoals} - {r.awayGoals}
                </span>
                <span className="live-result-team">
                  <span className="live-result-team-name">{r.away}</span>
                  {away && <Crest team={away} size={20} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <SuperLigPrediction />

      <div className="stats-grid live-stats-grid">
        <div className="chart-card">
          <h3>En Golcü Takımlar</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={byAttack} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="teamName"
                width={110}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="gf" name="Attığı Gol" fill={CHART_SERIES[1]} radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>En Az Gol Yiyen Takımlar</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={byDefense} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="teamName"
                width={110}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="ga" name="Yediği Gol" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {byDefense.map((row, i) => (
                  <Cell key={row.teamName} fill={i === 0 ? "#0ca30c" : CHART_SERIES[3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

// Gerçek sezon henüz başlamadığında bile, kullanıcı BURADAN (törensiz,
// anında) kendi kurasını çekip tam bir tahmin üretebilir: kiminle
// karşılaşacağı, ligde kaçıncı olacağı, eleme turundaki eşleşme sonuçları.
// Bu, "tahmin" deneyiminin TEK adresi -- Fikstür/Eleme Turu sayfaları hâlâ
// var (Maç Merkezi, taktik ayarları gibi detaylar için) ama birincil akış
// artık burası.
function YourSimulationPreview({ competitionKey }) {
  const {
    competition,
    hasDraw,
    fixture,
    simulation,
    knockout,
    setDrawResults,
    ensureFixture,
    runSimulation,
    generateKnockout,
  } = useCompetition(competitionKey);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (hasDraw && !fixture) ensureFixture();
  }, [hasDraw, fixture, ensureFixture]);

  useEffect(() => {
    if (fixture && !simulation) runSimulation(fixture, competition.getAllPlayers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture, simulation]);

  useEffect(() => {
    if (simulation && !knockout && competition.hasKnockout) generateKnockout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation, knockout]);

  const handleInstantDraw = () => {
    setDrawing(true);
    try {
      const matches = generateFullDraw(competition.teams);
      const results = buildResultsFromMatches(competition.teams, matches);
      setDrawResults(results);
    } finally {
      setDrawing(false);
    }
  };

  if (!hasDraw) {
    return (
      <div className="live-sim-cta">
        <p>
          Ligde kiminle eşleşeceğini, kaçıncı olacağını ve eleme turu
          sonuçlarını görmek için kendi kurani hemen burada çek -- tören
          animasyonu olmadan, anında.
        </p>
        <button className="btn-primary" onClick={handleInstantDraw} disabled={drawing}>
          🎲 Kura Çek ve Tahmin Yap
        </button>
      </div>
    );
  }

  if (!simulation) {
    return <div className="stats-callout live-sim-empty">Tahmin hesaplanıyor…</div>;
  }

  const allPlayers = competition.getAllPlayers();
  const scorers = topScorers(allPlayers, simulation.playerStats, 5);

  return (
    <div className="live-sim-preview">
      <div className="live-asof live-sim-badge">
        🎲 Senin Simülasyonun — gerçek veri değil, bu oturumda ürettiğin model tahmini
      </div>
      <div className="stats-grid">
        <StandingsTable
          standings={simulation.standings}
          teams={competition.teams}
          title="Tahmini Puan Durumu"
          competitionKey={competitionKey}
        />
        <div className="chart-card">
          <h3>Tahmini Gol Kralı</h3>
          <div className="live-sim-scorers">
            {scorers.map((p, i) => (
              <div className="live-sim-scorer-row" key={p.id}>
                <span className="live-sim-scorer-rank">{i + 1}</span>
                <PlayerAvatar player={p} size={26} />
                <span className="live-sim-scorer-name">{p.name}</span>
                <span className="live-sim-scorer-goals">{p.goals} gol</span>
              </div>
            ))}
            {scorers.length === 0 && <p className="standings-empty">Henüz gol verisi yok.</p>}
          </div>
        </div>
      </div>

      <h3 className="ip-section-title">Tahminini Kendin Şekillendir</h3>
      <InteractivePrediction
        competitionKey={competitionKey}
        dataSource={{
          fixture,
          modelStandings: simulation.standings,
          modelKnockout: knockout,
          modelMatchResults: simulation.matchResults,
          modelPlayerStats: simulation.playerStats,
          initialStandings: undefined,
          hasKnockout: competition.hasKnockout,
        }}
      />

      <div className="live-sim-actions">
        <button className="btn-secondary" onClick={handleInstantDraw} disabled={drawing}>
          🔄 Yeni Kura Çek (Baştan)
        </button>
        <Link to={`/${competitionKey}/fikstur`} className="btn-secondary">
          Maç Maç Detay ve Taktikler →
        </Link>
      </div>
    </div>
  );
}

function SeasonNotStarted({ competitionKey, status }) {
  const competition = getCompetition(competitionKey);
  return (
    <>
      <div className="empty-card live-not-started">
        <h2>Gerçek lig fazı henüz başlamadı</h2>
        <p>
          {competition.name} 2026-27 sezonu lig fazı <b>{status.phaseStart}</b>{" "}
          tarihinde başlıyor.
        </p>
        {status.note && <p className="live-not-started-note">{status.note}</p>}
        <p className="live-not-started-note">
          Gerçek sonuçlar başladığında bu sayfa güncellenecek. Bu arada aşağıdan
          kendi tahminini oluşturabilirsin.
        </p>
      </div>
      <YourSimulationPreview competitionKey={competitionKey} />
    </>
  );
}

export default function LiveScoresPage() {
  const [poolKey, setPoolKey] = useState("superlig");
  const competition = getCompetition(poolKey);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Gerçek Veri</div>
          <h1>Canlı Skorlar &amp; Puan Durumu</h1>
          <p>
            Simülasyon değil — bu sayfa gerçek dünyadaki 2026-27 sezonu
            sonuçlarını gösterir. Bu bir statik anlık görüntüdür (deploy'dan
            bağımsız otomatik/gerçek-zamanlı bir canlı skor akışı değildir --
            aşağıdaki notu oku).
          </p>
        </div>
      </header>

      <div className="pool-tabs">
        {COMPETITION_LIST.map((c) => (
          <button key={c.key} className={poolKey === c.key ? "active" : ""} onClick={() => setPoolKey(c.key)}>
            {c.shortName}
          </button>
        ))}
      </div>

      {poolKey === "superlig" && <SuperLigLive />}
      {poolKey === "ucl" && <SeasonNotStarted competitionKey="ucl" status={UCL_SEASON_STATUS} />}
      {poolKey === "europa" && <SeasonNotStarted competitionKey="europa" status={EUROPA_SEASON_STATUS} />}

      <div className="stats-callout live-tech-note">
        ⚠️ <b>Neden gerçek zamanlı değil:</b> Bu proje sunucusuz, statik bir
        site (backend'i yok). Gerçek dünya skorlarını göstermek için
        kullanabileceğim ücretsiz/tarayıcıdan-erişilebilir (CORS'a açık) canlı
        bir spor API'si yok — bu yüzden veriler benim web araştırmasıyla
        topladığım, koda gömülü bir anlık görüntü. Gerçek bir "her zaman canlı"
        deneyim için ya ücretli bir spor verisi API'si + bir backend/proxy
        (anahtarı gizlemek için) eklenmeli, ya da bu sayfayı düzenli aralıklarla
        (ör. her gün) yeniden araştırıp güncellememi isteyebilirsin.
      </div>

      <p className="footnote">
        Kaynaklar: Türkçe Vikipedi ("2026-27 Süper Lig" sezon sayfası ve puan
        durumu şablonu), UEFA.com ve haber siteleri (Ağustos 2026).{" "}
        {competition.name} için veriler statik bir anlık görüntüdür.
      </p>
    </div>
  );
}

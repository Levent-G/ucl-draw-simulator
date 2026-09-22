import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ReferenceArea,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import Crest from "../Crest.jsx";
import ProbabilityBar from "../ProbabilityBar.jsx";
import MatchRow from "../fixture/MatchRow.jsx";
import Pagination from "../Pagination.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import TeamAxisTick from "./TeamAxisTick.jsx";
import TeamScatterShape from "./TeamScatterShape.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../../utils/chartTheme.js";
import { isMatchPlayed } from "../../utils/matchDate.js";
import { TOP_SCORERS } from "../../data/topScorers.js";
import {
  getDomesticForm,
  getSuperLigTeamForm,
  buildDisplayMatches,
  getStandingsProgression,
  getHomeAwaySplit,
  getExpectedPointsTable,
  getUpsetMatches,
  getStreaks,
  getMatchStatsSummary,
  getGoalDistribution,
  getHighestScoringMatches,
  getFixtureDifficulty,
  getResultDistribution,
  getAttackDefenseMatrix,
  getGoalsPerMatchdayTrend,
  getSeasonEndProjection,
  getTitleOdds,
  getRootingGuide,
  getGoalTimingDistribution,
  getComebackAndBlownLeads,
  getXgPerformance,
  getDisciplineRanking,
  getPenaltyStats,
  getSquadRatingRanking,
  getInjuryCountsByTeam,
  getPowerIndex,
  getGoalDependency,
  getZoneBoundaryDistance,
  getGoalDifferenceFragility,
  getTitleRaceTension,
  getWeakestPositionGroup,
  getExpectedVsActualRank,
  getGoalScoringDepth,
  getHomeAwayGap,
} from "../../utils/realStandingsSelectors.js";

const POSITION_LABELS_TR = { GK: "Kaleci", DF: "Defans", MF: "Orta Saha", FW: "Forvet" };

const FORM_PAGE_SIZE = 12;

function FormCell({ result }) {
  return <span className={`form-badge form-badge-${result}`}>{result}</span>;
}

// UCL/Süper Lig İstatistikler sayfasının "📈 Analiz" sekmesi -- gerçek puan
// durumundan türetilen hücum/savunma grafikleri, modelin sezon sonu puan
// projeksiyonu, sıradaki haftanın model tahminleri ve tüm takımların form
// tablosu (sayfalanmış -- bkz. Pagination.jsx, tek uzun liste yerine).
export default function RealAnalysisTab({ competition, competitionKey, standings, fixture, favoriteTeamId }) {
  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const teamByShort = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.short, t])), [competition]);
  const topRef = useRef(null);

  const goalsData = useMemo(
    () =>
      (standings || [])
        .filter((s) => s.played > 0)
        .map((s) => ({ ...s, team: teamById[s.teamId], short: teamById[s.teamId]?.short }))
        .filter((s) => s.team),
    [standings, teamById]
  );
  const byAttack = useMemo(() => [...goalsData].sort((a, b) => b.gf - a.gf).slice(0, 15), [goalsData]);
  const byDefense = useMemo(() => [...goalsData].sort((a, b) => a.ga - b.ga).slice(0, 15), [goalsData]);

  const projectionData = useMemo(() => getSeasonEndProjection(competitionKey).slice(0, 15), [competitionKey]);
  const titleOdds = useMemo(() => getTitleOdds(competitionKey).slice(0, 10), [competitionKey]);
  // Ağır bir Monte Carlo hesabı (bkz. getRootingGuide) -- SADECE tuttuğun
  // takım varsa ve o takımın gerçekten bir şampiyonluk ihtimali varsa
  // çalışır, bu yüzden favoriteTeamId olmayan/şansı ~0 olan ziyaretçiler
  // için maliyetsiz.
  const rootingGuide = useMemo(() => getRootingGuide(competitionKey, favoriteTeamId), [competitionKey, favoriteTeamId]);
  const goalTiming = useMemo(() => getGoalTimingDistribution(competitionKey), [competitionKey]);
  const comebackEvents = useMemo(() => getComebackAndBlownLeads(competitionKey), [competitionKey]);
  const comebacks = useMemo(() => comebackEvents.filter((e) => e.type === "comeback"), [comebackEvents]);
  const blownLeads = useMemo(() => comebackEvents.filter((e) => e.type === "blown"), [comebackEvents]);
  const xgPerformance = useMemo(() => getXgPerformance(competitionKey), [competitionKey]);
  const disciplineRanking = useMemo(() => getDisciplineRanking(competitionKey), [competitionKey]);
  const penaltyStats = useMemo(() => getPenaltyStats(competitionKey).filter((p) => p.scored > 0 || p.conceded > 0), [competitionKey]);

  const nextMatchday = useMemo(() => {
    for (const md of fixture || []) {
      if (md.matches.some((m) => !isMatchPlayed(m))) return md;
    }
    return null;
  }, [fixture]);
  const nextMatches = useMemo(
    () => (nextMatchday ? buildDisplayMatches(competitionKey, nextMatchday.matches).filter((m) => !isMatchPlayed(m)) : []),
    [nextMatchday, competitionKey]
  );
  // "Bu takım bir sonraki maçını kazanır mı?" -- yukarıdaki nextMatches ZATEN
  // sıradaki haftanın maçlarını model olasılıklarıyla (homeWinProb/drawProb/
  // awayWinProb) taşıyor, burada sadece her maçı İKİ takım satırına (ev
  // sahibi + deplasman, kendi kazanma yüzdesiyle) açıp kazanma ihtimaline
  // göre sıralıyoruz -- yeni bir hesaplama gerekmiyor.
  const nextMatchWinRows = useMemo(() => {
    const rows = [];
    for (const m of nextMatches) {
      rows.push({
        key: `${m.id}-h`,
        team: m.homeTeam,
        opponent: m.awayTeam,
        isHome: true,
        winPct: Math.round((m.homeWinProb ?? 0) * 100),
        drawPct: Math.round((m.drawProb ?? 0) * 100),
      });
      rows.push({
        key: `${m.id}-a`,
        team: m.awayTeam,
        opponent: m.homeTeam,
        isHome: false,
        winPct: Math.round((m.awayWinProb ?? 0) * 100),
        drawPct: Math.round((m.drawProb ?? 0) * 100),
      });
    }
    return rows.sort((a, b) => b.winPct - a.winPct);
  }, [nextMatches]);

  const formRows = useMemo(() => {
    const sorted = [...(standings || [])].sort((a, b) => a.rank - b.rank);
    return sorted
      .map((s) => {
        const team = teamById[s.teamId];
        if (!team) return null;
        const form = competitionKey === "superlig" ? getSuperLigTeamForm(team.name) : getDomesticForm(team.id)?.form;
        return { ...s, team, form: form || [] };
      })
      .filter(Boolean);
  }, [standings, teamById, competitionKey]);

  // Puan Durumu Gelişimi -- en üstteki 6 takım + (aralarında değilse)
  // favori takım, hafta hafta birikimli puan çizgisi. Çok fazla takımı aynı
  // anda çizmek okunmaz hale getirir, bu yüzden sınırlı tutuluyor.
  const progression = useMemo(() => getStandingsProgression(competitionKey), [competitionKey]);
  const progressionTeamIds = useMemo(() => {
    const top = [...(standings || [])].sort((a, b) => a.rank - b.rank).slice(0, 6).map((s) => s.teamId);
    if (favoriteTeamId && !top.includes(favoriteTeamId)) top.push(favoriteTeamId);
    return top;
  }, [standings, favoriteTeamId]);

  const homeAwayData = useMemo(() => {
    const top = [...(standings || [])].sort((a, b) => a.rank - b.rank).slice(0, 10);
    return top
      .map((s) => {
        const team = teamById[s.teamId];
        if (!team) return null;
        const split = getHomeAwaySplit(competitionKey, s.teamId);
        if (split.home.played === 0 && split.away.played === 0) return null;
        return { teamId: s.teamId, short: team.short, homePts: split.home.pts, awayPts: split.away.pts };
      })
      .filter(Boolean);
  }, [standings, teamById, competitionKey]);

  const xptsData = useMemo(() => getExpectedPointsTable(competitionKey), [competitionKey]);
  const upsets = useMemo(() => getUpsetMatches(competitionKey, 8), [competitionKey]);
  const streaks = useMemo(() => getStreaks(competitionKey), [competitionKey]);
  const hotStreaks = useMemo(() => streaks.filter((s) => s.type === "W" && s.length >= 2).slice(0, 8), [streaks]);
  const coldStreaks = useMemo(() => streaks.filter((s) => s.type === "L" && s.length >= 2).slice(0, 8), [streaks]);
  const matchStats = useMemo(() => getMatchStatsSummary(competitionKey), [competitionKey]);
  const goalDistribution = useMemo(() => getGoalDistribution(competitionKey), [competitionKey]);
  const highestScoring = useMemo(() => getHighestScoringMatches(competitionKey, 6), [competitionKey]);
  const fixtureDifficulty = useMemo(() => getFixtureDifficulty(competitionKey), [competitionKey]);
  const resultDistribution = useMemo(() => getResultDistribution(competitionKey), [competitionKey]);
  const attackDefenseMatrix = useMemo(() => getAttackDefenseMatrix(competitionKey), [competitionKey]);
  const matrixAverages = useMemo(() => {
    if (attackDefenseMatrix.length === 0) return null;
    const avgGf = attackDefenseMatrix.reduce((sum, r) => sum + r.gfPerGame, 0) / attackDefenseMatrix.length;
    const avgGa = attackDefenseMatrix.reduce((sum, r) => sum + r.gaPerGame, 0) / attackDefenseMatrix.length;
    const gfs = attackDefenseMatrix.map((r) => r.gfPerGame);
    const gas = attackDefenseMatrix.map((r) => r.gaPerGame);
    return {
      avgGf,
      avgGa,
      gfMin: Math.min(...gfs, avgGf) - 0.4,
      gfMax: Math.max(...gfs, avgGf) + 0.4,
      gaMin: Math.min(...gas, avgGa) - 0.4,
      gaMax: Math.max(...gas, avgGa) + 0.4,
    };
  }, [attackDefenseMatrix]);
  const goalsTrend = useMemo(() => getGoalsPerMatchdayTrend(competitionKey), [competitionKey]);
  const squadRatings = useMemo(() => getSquadRatingRanking(competitionKey).slice(0, 15), [competitionKey]);
  const injuryCounts = useMemo(() => getInjuryCountsByTeam(competitionKey), [competitionKey]);
  const powerIndex = useMemo(() => getPowerIndex(competitionKey).slice(0, 15), [competitionKey]);
  const goalDependency = useMemo(() => getGoalDependency(competitionKey).slice(0, 15), [competitionKey]);
  const zoneDistance = useMemo(() => getZoneBoundaryDistance(competitionKey), [competitionKey]);
  const gdFragility = useMemo(() => getGoalDifferenceFragility(competitionKey), [competitionKey]);
  const titleTension = useMemo(() => getTitleRaceTension(competitionKey), [competitionKey]);
  const weakestGroups = useMemo(() => getWeakestPositionGroup(competitionKey).slice(0, 12), [competitionKey]);
  const expectedVsActual = useMemo(() => getExpectedVsActualRank(competitionKey), [competitionKey]);
  const goalScoringDepth = useMemo(() => getGoalScoringDepth(competitionKey).slice(0, 15), [competitionKey]);
  const homeAwayGap = useMemo(() => getHomeAwayGap(competitionKey).slice(0, 12), [competitionKey]);
  const mostAbsences = useMemo(
    () => [...getPowerIndex(competitionKey)].filter((r) => r.unavailableCount > 0).sort((a, b) => b.missingImpact - a.missingImpact).slice(0, 10),
    [competitionKey]
  );

  // Gol Kralları -- gerçek, kaynağı belirtilmiş oyuncu bazlı gol verisi (bkz.
  // src/data/topScorers.js). Simülasyon motorunun ürettiği bir şey DEĞİL;
  // sadece o ana kadar GERÇEKTEN oynanmış maçlardaki doğrulanmış golleri
  // yansıtır -- bu yüzden site genelindeki diğer "gerçek veri" bölümleriyle
  // aynı disiplinde: kaynaksız/doğrulanamayan hiçbir gol eklenmez.
  const topScorers = useMemo(
    () =>
      TOP_SCORERS.filter((s) => s.competitionKey === competitionKey)
        .map((s) => ({ ...s, team: teamById[s.teamId] }))
        .filter((s) => s.team)
        .sort((a, b) => b.goals - a.goals),
    [competitionKey, teamById]
  );

  return (
    <div className="stats-grid" ref={topRef}>
      {goalsData.length === 0 ? (
        <div className="chart-card chart-card-wide">
          <p className="standings-empty">Analiz için henüz oynanmış maç verisi yok.</p>
        </div>
      ) : (
        <>
          <div className="chart-card">
            <h3>En Golcü Takımlar</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={byAttack} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="short"
                  width={78}
                  stroke={CHART_AXIS}
                  tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="gf" name="Attığı Gol" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {byAttack.map((row) => (
                    <Cell key={row.teamId} fill={row.teamId === favoriteTeamId ? "#fbbf24" : CHART_SERIES[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>En Az Gol Yiyen Takımlar</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={byDefense} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="short"
                  width={78}
                  stroke={CHART_AXIS}
                  tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="ga" name="Yediği Gol" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {byDefense.map((row) => (
                    <Cell key={row.teamId} fill={row.teamId === favoriteTeamId ? "#fbbf24" : CHART_SERIES[3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {projectionData.length > 0 && (
            <div className="chart-card chart-card-wide">
              <h3>🔮 Model: Sezon Sonu Puan Projeksiyonu</h3>
              <p className="footnote">
                Bu gerçek bir sonuç değildir -- takımın ŞU ANA KADAR GERÇEKTEN topladığı puana, kalan HER maç için
                modelin (katsayı + kadro gücü + ev sahibi avantajı) hesapladığı beklenen puanın eklenmesiyle üretilir.
                Yani sadece güncel formu düz bir çizgiyle uzatmaz -- kalan fikstürün gerçekten kolay mı zor mu
                olduğunu da hesaba katar (zor bir kalan programı olan lider, kolay programı olandan daha düşük
                projekte edilir).
              </p>
              <ResponsiveContainer width="100%" height={Math.max(320, projectionData.length * 26)}>
                <BarChart data={projectionData} layout="vertical" margin={{ left: 16, right: 24 }}>
                  <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="short"
                    width={78}
                    stroke={CHART_AXIS}
                    tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Legend wrapperStyle={{ color: CHART_AXIS, fontSize: 12 }} />
                  <Bar dataKey="pts" name="Güncel Puan" fill={CHART_SERIES[0]} radius={[0, 4, 4, 0]} maxBarSize={14} />
                  <Bar dataKey="projected" name="Projeksiyon (sezon sonu)" fill={CHART_SERIES[2]} radius={[0, 4, 4, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {nextMatchWinRows.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🔮 Bir Sonraki Maçını Kazanır mı?</h3>
          <p className="footnote">
            Her takımın SIRADAKİ maçı için modelin (katsayı + kadro gücü + ev sahibi avantajı) hesapladığı galibiyet
            ihtimali -- gerçek bir bahis oranı değildir, sadece istatistiksel bir tahmindir.
          </p>
          <div className="next-win-list">
            {nextMatchWinRows.map((r) => {
              const lossPct = Math.max(0, 100 - r.winPct - r.drawPct);
              return (
                <div key={r.key} className="next-win-row">
                  <div className="next-win-focus">
                    <Crest team={r.team} size={22} />
                    <span className="next-win-focus-name">{r.team.short}</span>
                    <b className="next-win-focus-pct">%{r.winPct}</b>
                  </div>
                  <ProbabilityBar
                    size="mini"
                    homeTeam={r.isHome ? r.team : r.opponent}
                    awayTeam={r.isHome ? r.opponent : r.team}
                    homePct={r.isHome ? r.winPct : lossPct}
                    drawPct={r.drawPct}
                    awayPct={r.isHome ? lossPct : r.winPct}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {titleOdds.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>{competitionKey === "superlig" ? "🏆 Şampiyonluk İhtimali" : "🏆 Lig Fazını Zirvede Bitirme İhtimali"}</h3>
          <p className="footnote">
            {competitionKey === "superlig" ? (
              <>
                Kalan fikstürün TAMAMI, modelin galibiyet/beraberlik/mağlubiyet olasılıklarına göre 300 kez baştan
                sona simüle edilerek her takımın kaç simülasyonda 1. bitirdiği sayılır -- bu bir bahis oranı değildir,
                sadece güncel puan durumu ve kalan fikstürün zorluğuna dayalı istatistiksel bir modeldir.
              </>
            ) : (
              <>
                UCL'de lig fazını 1. bitirmek turnuvanın kendisini kazanmak DEĞİLDİR (eleme turları var) -- bu sadece
                kalan lig fazı maçlarının 300 kez simüle edilmesiyle "lig fazı 1.liği" ihtimalini gösterir.
              </>
            )}{" "}
            Düşük görünen bir yüzde "imkansız" demek değildir -- sadece bu kadar denemede az gözlendiği anlamına gelir.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(260, titleOdds.length * 30)}>
            <BarChart data={titleOdds} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} unit="%" />
              <YAxis
                type="category"
                dataKey="team.short"
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="titlePct" name="Şampiyonluk İhtimali" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {titleOdds.map((row) => (
                  <Cell key={row.teamId} fill={row.teamId === favoriteTeamId ? "#fbbf24" : CHART_SERIES[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {rootingGuide && (
        <div className="chart-card chart-card-wide rooting-guide-card">
          <h3>🧭 Bu Hafta Kimi Tutmalısın?</h3>
          <p className="footnote">
            {teamById[favoriteTeamId]?.short}'in {rootingGuide.metricLabel} şu an <b>%{rootingGuide.baselinePct}</b>.
            Kendi maçın dışında bu hafta oynanan diğer maçların HER BİRİNİ (o maç ev sahibi kazanırsa / deplasman
            kazanırsa diye 1-0 ve 0-1 varsayımıyla) yeniden simüle ettik -- hangi sonucun senin takımının şansını EN
            ÇOK değiştirdiğini gösteriyoruz. Bu bir gerçek tahmin değil, "ne olursa ne olur" senaryo analizidir; başka
            hiçbir sitede yok çünkü hem tuttuğun takıma özel hem de tam bir Monte Carlo simülasyonu gerektiriyor.
          </p>
          <div className="rooting-guide-list">
            {rootingGuide.rows.map((r) => (
              <div key={r.matchId} className="rooting-guide-row">
                <div className={`rooting-guide-team ${r.rootFor === "home" ? "is-rooting" : ""}`}>
                  {r.rootFor === "home" && <span className="rooting-guide-star">👉</span>}
                  <Crest team={r.homeTeam} size={20} />
                  <span>{r.homeTeam.short}</span>
                  <span className="rooting-guide-pct">%{r.homeWinPct}</span>
                </div>
                <span className="rooting-guide-vs">vs</span>
                <div className={`rooting-guide-team rooting-guide-team-away ${r.rootFor === "away" ? "is-rooting" : ""}`}>
                  <span className="rooting-guide-pct">%{r.awayWinPct}</span>
                  <span>{r.awayTeam.short}</span>
                  <Crest team={r.awayTeam} size={20} />
                  {r.rootFor === "away" && <span className="rooting-guide-star">👈</span>}
                </div>
                <span className="rooting-guide-impact">Etki: ±%{r.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {goalTiming.total > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>⏱️ Kritik Dakika Analizi</h3>
          <p className="footnote">
            Gollerin maç içinde hangi dakika aralığında yoğunlaştığı -- şu an sadece detaylı gol-dakikası verisi olan{" "}
            <b>{goalTiming.matchCount} maçtan</b> ({goalTiming.total} gol), sezonun tamamından değil. Daha fazla hafta
            için detaylı istatistik eklendikçe bu örneklem büyüyecek.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={goalTiming.bands} margin={{ left: 0, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} unit="%" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="pct" name="Gollerin %'si" fill={CHART_SERIES[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(comebacks.length > 0 || blownLeads.length > 0) && (
        <div className="chart-card chart-card-wide">
          <h3>🔄 Geriden Gelip Kazanma / Elden Kaçırma</h3>
          <p className="footnote">
            Detaylı gol-dakikası verisi olan maçlarda, maçın bir anında geride olup sonunda KAZANAN takımlar
            ("geriden gelme") ve bir anında önde olup sonunda kazanamayan takımlar ("elden kaçırma").
          </p>
          <div className="comeback-columns">
            <div>
              <h4 className="comeback-subhead">✅ Geriden Gelip Kazandı</h4>
              {comebacks.length === 0 ? (
                <p className="footnote">Bu maçlarda hiç görülmedi.</p>
              ) : (
                <ul className="comeback-list">
                  {comebacks.map((e, i) => (
                    <li key={i} className="comeback-item">
                      <Crest team={e.team} size={18} /> <b>{e.team.short}</b>
                      <span className="comeback-score">
                        {e.homeTeam.short} {e.homeGoals}-{e.awayGoals} {e.awayTeam.short}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="comeback-subhead">❌ Elden Kaçırdı</h4>
              {blownLeads.length === 0 ? (
                <p className="footnote">Bu maçlarda hiç görülmedi.</p>
              ) : (
                <ul className="comeback-list">
                  {blownLeads.map((e, i) => (
                    <li key={i} className="comeback-item">
                      <Crest team={e.team} size={18} /> <b>{e.team.short}</b>
                      <span className="comeback-score">
                        {e.homeTeam.short} {e.homeGoals}-{e.awayGoals} {e.awayTeam.short}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {xgPerformance.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🍀 Şanslı mı Şanssız mı? (xG Farkı)</h3>
          <p className="footnote">
            Takımın GERÇEKTEN attığı gol sayısı, o maçlar için elimizdeki xG (beklenen gol) değerinden ne kadar
            sapıyor -- pozitif: attığı fırsatlardan beklenenden FAZLA gol buluyor (klinik/şanslı), negatif: beklenen
            fırsatları gole çeviremiyor (şanssız/verimsiz). Sadece xG verisi olan{" "}
            <b>{xgPerformance[0]?.matches ? "birkaç" : ""} maçtan</b> hesaplanır, küçük bir örneklem.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(220, xgPerformance.length * 28)}>
            <BarChart data={xgPerformance} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="team.short"
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <ReferenceLine x={0} stroke={CHART_AXIS} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="luck" name="Gol - xG farkı" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {xgPerformance.map((row) => (
                  <Cell key={row.teamId} fill={row.luck >= 0 ? CHART_SERIES[1] : CHART_SERIES[6] || "#dc2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {disciplineRanking.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🟨 Fair Play / Kart Ligi</h3>
          <p className="footnote">
            Faul + sarı/kırmızı kart verisi olan maçlardan bir disiplin skoru (sarı=1, kırmızı=3, faul=0.1 ağırlıklı
            toplam) -- düşük skor daha disiplinli demektir. En disiplinliden en az disiplinliye sıralı.
          </p>
          <div className="fixture-difficulty-grid">
            {disciplineRanking.map((row) => (
              <div key={row.teamId} className="fixture-difficulty-row">
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name">{row.team.short}</span>
                <span className="footnote" style={{ flex: 1 }}>
                  <span className="footnote-note">
                    {row.yellow} 🟨 · {row.red} 🟥 · {row.fouls} faul ({row.matches} maç)
                  </span>
                </span>
                <span className="fixture-difficulty-pct">{row.disciplineScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {penaltyStats.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🎯 Penaltı İstatistikleri</h3>
          <p className="footnote">Detaylı gol verisi olan maçlarda penaltıdan atılan/yenen gol sayısı.</p>
          <div className="fixture-difficulty-grid">
            {penaltyStats.map((row) => (
              <div key={row.teamId} className="fixture-difficulty-row">
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name">{row.team.short}</span>
                <span className="footnote" style={{ flex: 1 }}>
                  <span className="footnote-note">
                    {row.scored} atılan · {row.conceded} yenen
                  </span>
                </span>
                <span className="fixture-difficulty-pct" style={{ color: row.net >= 0 ? "var(--accent-bright)" : "var(--pink)" }}>
                  {row.net > 0 ? `+${row.net}` : row.net}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {progression.length > 1 && progressionTeamIds.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>📈 Puan Durumu Gelişimi</h3>
          <p className="footnote">
            En üstteki 6 takım{favoriteTeamId && !progressionTeamIds.slice(0, 6).includes(favoriteTeamId) ? " + tuttuğun takım" : ""}
            'ın hafta hafta birikimli puanı -- gerçek sonuçlardan.
          </p>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={progression} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="matchday" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} label={{ value: "Hafta", position: "insideBottom", offset: -2, fill: CHART_AXIS, fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: CHART_AXIS, fontSize: 11 }} />
              {progressionTeamIds.map((teamId, i) => {
                const isFav = teamId === favoriteTeamId;
                return (
                  <Line
                    key={teamId}
                    type="monotone"
                    dataKey={teamId}
                    name={teamById[teamId]?.short || teamId}
                    stroke={isFav ? "#fbbf24" : CHART_SERIES[i % CHART_SERIES.length]}
                    strokeWidth={isFav ? 3 : 1.5}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {homeAwayData.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🏟️ İç Saha / Deplasman Performansı</h3>
          <p className="footnote">İlk 10 takımın gerçek sonuçlardan iç saha ve deplasman puanları.</p>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={homeAwayData} margin={{ left: 0, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="short"
                height={54}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} orientation="bottom" />}
              />
              <YAxis allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ color: CHART_AXIS, fontSize: 12 }} />
              <Bar dataKey="homePts" name="İç Saha Puanı" fill={CHART_SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="awayPts" name="Deplasman Puanı" fill={CHART_SERIES[4] || CHART_SERIES[2]} radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {xptsData.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🎯 Beklenen Puan (xPTS) vs Gerçek Puan</h3>
          <p className="footnote">
            xPTS, her maç ÖNCESİNDE modelin (katsayı + kadro gücüne göre) hesapladığı kazanma/beraberlik
            olasılıklarının sezon boyunca toplamıdır -- "modele göre normalde kaç puan almalıydı" sorusunun cevabı.
            Farkın pozitif olması (yeşil) takımın modelin beklediğinden İYİ performans gösterdiğini, negatif (kırmızı)
            beklentinin altında kaldığını gösterir. Gerçek bir istatistik kaynağından (ör. Opta) alınan xG/xPTS
            DEĞİLDİR -- bu sitenin kendi modelinin türevidir.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(320, xptsData.length * 24)}>
            <BarChart data={xptsData} layout="vertical" margin={{ left: 16, right: 40 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={(d) => d.team.short}
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ color: CHART_AXIS, fontSize: 12 }} />
              <Bar dataKey="xpts" name="Beklenen Puan (xPTS)" fill={CHART_SERIES[3]} radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="actualPts" name="Gerçek Puan" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {xptsData.map((row) => (
                  <Cell key={row.teamId} fill={row.diff >= 0 ? "#4ade80" : "#f87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(hotStreaks.length > 0 || coldStreaks.length > 0) && (
        <div className="chart-card chart-card-wide">
          <h3>🔥 Form Serileri</h3>
          <p className="footnote">Güncel, kesintisiz galibiyet/mağlubiyet serileri -- gerçek sonuçlardan.</p>
          <div className="streaks-grid">
            <div>
              <h4 className="streaks-subtitle streaks-subtitle-hot">🔥 Sıcak Takımlar</h4>
              {hotStreaks.length === 0 ? (
                <p className="standings-empty">Şu an 2+ galibiyet serisi olan takım yok.</p>
              ) : (
                <ul className="streaks-list">
                  {hotStreaks.map((s) => (
                    <li key={s.teamId}>
                      <Link to={`/${competitionKey}/takim/${s.teamId}`} className="streaks-list-team">
                        <Crest team={s.team} size={20} />
                        {s.team.name}
                      </Link>
                      <span className="streaks-badge streaks-badge-hot">{s.length} maçtır galip</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="streaks-subtitle streaks-subtitle-cold">🧊 Kötü Gidenler</h4>
              {coldStreaks.length === 0 ? (
                <p className="standings-empty">Şu an 2+ mağlubiyet serisi olan takım yok.</p>
              ) : (
                <ul className="streaks-list">
                  {coldStreaks.map((s) => (
                    <li key={s.teamId}>
                      <Link to={`/${competitionKey}/takim/${s.teamId}`} className="streaks-list-team">
                        <Crest team={s.team} size={20} />
                        {s.team.name}
                      </Link>
                      <span className="streaks-badge streaks-badge-cold">{s.length} maçtır mağlup</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {upsets.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>😲 Sürpriz Sonuçlar</h3>
          <p className="footnote">
            Gerçek sonucun maç öncesi model beklentisinden en çok saptığı maçlar -- yani favorinin kaybettiği/beraber
            kaldığı en büyük sürprizler.
          </p>
          <div className="upset-list">
            {upsets.map((u) => (
              <Link key={u.matchId} to={`/${competitionKey}/mac/${u.matchId}`} className="upset-row">
                <span className="upset-row-week">{u.matchdayLabel}</span>
                <span className="upset-row-team">
                  <Crest team={u.homeTeam} size={20} />
                </span>
                <span className="upset-row-score">{u.homeGoals} - {u.awayGoals}</span>
                <span className="upset-row-team upset-row-team-away">
                  <Crest team={u.awayTeam} size={20} />
                </span>
                <span className="upset-row-surprise">%{Math.round(u.surprise * 100)} sürpriz</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {matchStats.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🧤 Maç İstatistikleri</h3>
          <p className="footnote">Temiz sayfa (gol yemeden), karşılıklı gol (KG Var) ve 2.5 üstü gol yüzdeleri -- gerçek sonuçlardan.</p>
          <div className="standings-scroll">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="standings-team-header">Takım</th>
                  <th>O</th>
                  <th>Temiz Sayfa</th>
                  <th>KG Var</th>
                  <th>2.5 Üst</th>
                </tr>
              </thead>
              <tbody>
                {[...matchStats]
                  .sort((a, b) => b.cleanSheets / b.played - a.cleanSheets / a.played)
                  .map((row) => (
                    <tr key={row.teamId} className={row.teamId === favoriteTeamId ? "standings-row-favorite" : ""}>
                      <td className="standings-team-cell">
                        <span className="standings-team-link">
                          <Crest team={row.team} size={18} />
                          <span>{row.team.name}</span>
                        </span>
                      </td>
                      <td>{row.played}</td>
                      <td>{row.cleanSheets} (%{Math.round((row.cleanSheets / row.played) * 100)})</td>
                      <td>{row.btts} (%{Math.round((row.btts / row.played) * 100)})</td>
                      <td>{row.over25} (%{Math.round((row.over25 / row.played) * 100)})</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {goalDistribution.length > 0 && (
        <div className="chart-card">
          <h3>⚽ Gol Dağılımı</h3>
          <p className="footnote">Oynanan gerçek maçların toplam gol sayısına göre dağılımı.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={goalDistribution} margin={{ left: 0, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="goals" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} label={{ value: "Maç başına toplam gol", position: "insideBottom", offset: -2, fill: CHART_AXIS, fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" name="Maç Sayısı" fill={CHART_SERIES[2]} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {highestScoring.length > 0 && (
        <div className="chart-card">
          <h3>🎉 En Golcü Maçlar</h3>
          <p className="footnote">Gerçek sonuçlara göre en çok gol atılan maçlar.</p>
          <div className="upset-list">
            {highestScoring.map((m) => (
              <Link key={m.matchId} to={`/${competitionKey}/mac/${m.matchId}`} className="upset-row">
                <span className="upset-row-week">{m.matchdayLabel}</span>
                <span className="upset-row-team">
                  <Crest team={m.homeTeam} size={20} />
                </span>
                <span className="upset-row-score">{m.homeGoals} - {m.awayGoals}</span>
                <span className="upset-row-team upset-row-team-away">
                  <Crest team={m.awayTeam} size={20} />
                </span>
                <span className="upset-row-surprise">{m.totalGoals} gol</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {topScorers.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🥅 Gol Kralları</h3>
          <p className="footnote">
            Gerçek, kaynağı belirtilmiş sezon gol verisi -- simülasyon motorunun ürettiği bir tahmin DEĞİLDİR. Sadece
            o ana kadar GERÇEKTEN oynanmış maçlardaki, en az bir güvenilir kaynaktan doğrulanmış goller listelenir;
            bu yüzden liste henüz oynanmamış maçları veya doğrulanamayan gol iddialarını kapsamaz.
          </p>
          <div className="scorer-list">
            {topScorers.map((s, i) => (
              <Link
                key={`${s.playerName}-${s.teamId}`}
                to={`/${competitionKey}/takim/${s.teamId}`}
                className={`scorer-row ${s.teamId === favoriteTeamId ? "is-favorite" : ""}`}
              >
                <span className="scorer-row-rank">#{i + 1}</span>
                <span className="scorer-row-player">
                  <Crest team={s.team} size={20} />
                  <span className="scorer-row-name">{s.playerName}</span>
                </span>
                <span className="scorer-row-goals">{s.goals} gol</span>
                <span className="scorer-row-matches">{s.matchesPlayed} maç</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {attackDefenseMatrix.length > 0 && matrixAverages && (
        <div className="chart-card chart-card-wide">
          <h3>🎯 Hücum-Savunma Matrisi</h3>
          <p className="footnote">
            Her nokta bir takım -- yatay eksen maç başına attığı gol, dikey eksen maç başına yediği gol. Yeşil
            bölge (çok atan, az yiyen) en güçlü takımları, kırmızı bölge (az atan, çok yiyen) en zayıf takımları,
            sarı bölgeler ise karışık (biri iyi biri kötü) profilleri işaret eder. Kesikli çizgiler ligin
            ortalamasıdır -- gerçek sonuçlardan.
          </p>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid stroke={CHART_GRID} />
              <XAxis
                type="number"
                dataKey="gfPerGame"
                name="Maç Başına Gol (Attığı)"
                domain={[matrixAverages.gfMin, matrixAverages.gfMax]}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                label={{ value: "Maç başına attığı gol →", position: "insideBottom", offset: -8, fill: CHART_AXIS, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="gaPerGame"
                name="Maç Başına Gol (Yediği)"
                domain={[matrixAverages.gaMin, matrixAverages.gaMax]}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                label={{ value: "← Maç başına yediği gol", angle: -90, position: "insideLeft", fill: CHART_AXIS, fontSize: 11 }}
              />
              {/* İyi (sağ-alt: çok atan/az yiyen) yeşil, kötü (sol-üst: az
                  atan/çok yiyen) kırmızı, karışık iki kadran sarı -- kadranlar
                  net ayırt edilsin diye (bkz. kullanıcı isteği). */}
              <ReferenceArea x1={matrixAverages.avgGf} x2={matrixAverages.gfMax} y1={matrixAverages.gaMin} y2={matrixAverages.avgGa} fill="#4ade80" fillOpacity={0.1} strokeOpacity={0} />
              <ReferenceArea x1={matrixAverages.gfMin} x2={matrixAverages.avgGf} y1={matrixAverages.avgGa} y2={matrixAverages.gaMax} fill="#f87171" fillOpacity={0.1} strokeOpacity={0} />
              <ReferenceArea x1={matrixAverages.avgGf} x2={matrixAverages.gfMax} y1={matrixAverages.avgGa} y2={matrixAverages.gaMax} fill="#fbbf24" fillOpacity={0.06} strokeOpacity={0} />
              <ReferenceArea x1={matrixAverages.gfMin} x2={matrixAverages.avgGf} y1={matrixAverages.gaMin} y2={matrixAverages.avgGa} fill="#fbbf24" fillOpacity={0.06} strokeOpacity={0} />
              <ReferenceLine x={matrixAverages.avgGf} stroke={CHART_AXIS} strokeDasharray="4 4" />
              <ReferenceLine y={matrixAverages.avgGa} stroke={CHART_AXIS} strokeDasharray="4 4" />
              <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={attackDefenseMatrix}
                shape={(props) => <TeamScatterShape {...props} size={26} highlightTeamId={favoriteTeamId} />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {resultDistribution.length > 0 && (
        <div className="chart-card">
          <h3>🏠 Ev Sahibi Avantajı</h3>
          <p className="footnote">Oynanan tüm gerçek maçlarda sonuç dağılımı.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resultDistribution} layout="vertical" margin={{ left: 16, right: 32 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} unit="%" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={110} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="pct" name="Yüzde" radius={[0, 4, 4, 0]} maxBarSize={26}>
                {resultDistribution.map((row) => (
                  <Cell
                    key={row.key}
                    fill={row.key === "home" ? CHART_SERIES[0] : row.key === "draw" ? CHART_SERIES[2] : CHART_SERIES[3]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {goalsTrend.length > 1 && (
        <div className="chart-card">
          <h3>📉 Haftalık Gol Ortalaması Trendi</h3>
          <p className="footnote">Her haftada oynanan maçların ortalama toplam gol sayısı -- sezon ilerledikçe golcülük değişiyor mu?</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={goalsTrend} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="matchday" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} label={{ value: "Hafta", position: "insideBottom", offset: -2, fill: CHART_AXIS, fontSize: 11 }} />
              <YAxis allowDecimals stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="avgGoals" name="Ort. Gol/Maç" stroke={CHART_SERIES[2]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {fixtureDifficulty.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🗓️ Kalan Fikstür Zorluğu (tüm takımlar)</h3>
          <p className="footnote">
            Sitenin maç modelinin (kadro gücünden türetilen hücum/savunma oranları + ev sahibi avantajı -- SADECE
            katsayı değil) kalan maçların HER BİRİ için hesapladığı kazanma olasılığının ortalaması. Yüksek yüzde
            (yeşil) daha kolay, düşük yüzde (kırmızı) daha zor bir kalan programa işaret eder -- en kolaydan en zora
            sıralı. Parantez içindeki değer, ortalama rakip katsayısıdır (referans amaçlı).
          </p>
          <div className="fixture-difficulty-grid">
            {fixtureDifficulty.map((row) => (
              <Link
                key={row.teamId}
                to={`/${competitionKey}/takim/${row.teamId}`}
                className={`fixture-difficulty-row ${row.teamId === favoriteTeamId ? "is-favorite" : ""}`}
              >
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name">{row.team.name}</span>
                <span className="fixture-difficulty-track">
                  <span
                    className="fixture-difficulty-fill"
                    style={{
                      width: `${row.avgWinProbability}%`,
                      background: `hsl(${Math.round(row.avgWinProbability * 1.3)}, 65%, 46%)`,
                    }}
                  />
                </span>
                <span className="fixture-difficulty-pct">
                  %{row.avgWinProbability}
                  <span className="fixture-difficulty-coeff">({row.avgOpponentCoeff})</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {powerIndex.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>⚡ Güç Endeksi</h3>
          <p className="footnote">
            Sitenin kendi birleşik modeli -- resmi bir istatistik DEĞİLDİR. Kadronun ortalama reytingine, o an
            sakat/cezalı olduğu için oynayamayacak oyuncuların (ortalamanın üstündeki oyuncular daha çok kırar) ve
            son 5 maçlık formun etkisini ekleyerek "kağıt üzerinde güçlü ama şu an eksik" takımları ortaya çıkarır.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(320, powerIndex.length * 30)}>
            <BarChart data={powerIndex} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" domain={[50, 100]} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={(d) => d.team.short}
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <Tooltip
                content={<ChartTooltip formatter={(v) => v} />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                labelFormatter={(label, payload) => {
                  const row = payload?.[0]?.payload;
                  if (!row) return label;
                  const missingLabel = row.missingImpact > 0 ? `-${row.missingImpact}` : "0";
                  return `${label} -- Kadro: ${row.baseRating} · Eksik etkisi: ${missingLabel} (${row.unavailableCount} oyuncu) · Form: ${row.formAdjustment >= 0 ? "+" : ""}${row.formAdjustment}`;
                }}
              />
              <Bar dataKey="powerIndex" name="Güç Endeksi" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {powerIndex.map((row) => (
                  <Cell key={row.teamId} fill={row.teamId === favoriteTeamId ? "#b45309" : CHART_SERIES[5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {titleTension && (
        <div className="chart-card chart-card-wide">
          <h3>🔥 Şampiyonluk Gerilimi Endeksi</h3>
          <p className="footnote">
            Lider ile 2. sıradaki takım arasındaki puan farkı -- SADECE bu sezonun şu anki durumu (geçmiş
            sezonlarla kıyaslama yapılmaz, o veri yok).
          </p>
          <div className="title-tension-row">
            <span className="title-tension-team">
              <Crest team={titleTension.leaderTeam} size={26} />
              {titleTension.leaderTeam.name} <b>{titleTension.leaderPts}P</b>
            </span>
            <span className={`title-tension-badge title-tension-${titleTension.tension}`}>
              {titleTension.gap} puan fark
              {titleTension.tension === "high" ? " · Çok Gergin 🔥" : titleTension.tension === "medium" ? " · Normal" : " · Rahat"}
            </span>
            <span className="title-tension-team">
              {titleTension.secondTeam.name} <b>{titleTension.secondPts}P</b>
              <Crest team={titleTension.secondTeam} size={26} />
            </span>
          </div>
        </div>
      )}

      {weakestGroups.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🔗 Zayıf Halka</h3>
          <p className="footnote">
            Her takımın kadrosunu mevkiye göre gruplayıp lig ortalamasıyla kıyaslar -- en büyük eksi sapmaya sahip
            mevki, o takımın "zayıf halkası"dır. En az 2 oyunculu mevki grupları sayılır.
          </p>
          <div className="fixture-difficulty-grid">
            {weakestGroups.map((row) => (
              <Link key={row.teamId} to={`/${competitionKey}/takim/${row.teamId}`} className={`fixture-difficulty-row ${row.teamId === favoriteTeamId ? "is-favorite" : ""}`}>
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name">{row.team.name}</span>
                <span className="footnote" style={{ flex: 1 }}>
                  {POSITION_LABELS_TR[row.position]}: {row.avg} <span className="footnote-note">(lig ort. {row.leagueAvg})</span>
                </span>
                <span className="fixture-difficulty-pct" style={{ color: "#b91c1c" }}>{row.deviation}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {expectedVsActual.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>📐 Beklenen vs Gerçek Sıra</h3>
          <p className="footnote">
            Sadece kadro kalitesine (Kadro Gücü Sıralaması) göre "olması gereken" sıra ile gerçek puan durumundaki
            sırası arasındaki fark. Pozitif (yeşil) = kadrosunun ÜSTÜNDE performans, negatif (kırmızı) = ALTINDA.
            xPTS'ten farklı olarak maç sonuçlarına değil, ham kadro kalitesine kıyaslar.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(320, expectedVsActual.length * 24)}>
            <BarChart data={expectedVsActual} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={(d) => d.team.short}
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <ReferenceLine x={0} stroke={CHART_AXIS} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="diff" name="Sıra Farkı (beklenen - gerçek)" radius={[4, 4, 4, 4]} maxBarSize={14}>
                {expectedVsActual.map((row) => (
                  <Cell key={row.teamId} fill={row.diff >= 0 ? "#15803d" : "#b91c1c"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {goalScoringDepth.length > 0 && (
        <div className="chart-card">
          <h3>🎽 Gol Çeşitliliği</h3>
          <p className="footnote">Kaç farklı oyuncunun gol attığı -- yüksek çeşitlilik, gol yükünün paylaşıldığı anlamına gelir.</p>
          <ResponsiveContainer width="100%" height={Math.max(280, goalScoringDepth.length * 22)}>
            <BarChart data={goalScoringDepth} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={(d) => d.team.short}
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="scorerCount" name="Farklı Golcü Sayısı" fill={CHART_SERIES[6]} radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {homeAwayGap.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🏠✈️ Ev Sahibi / Deplasman Karakteri</h3>
          <p className="footnote">
            İç saha ve deplasmandaki maç başı puan ortalaması arasındaki fark -- büyük fark, "evinde aslan
            deplasmanda kuzu" (ya da tam tersi) bir profile işaret eder.
          </p>
          <div className="fixture-difficulty-grid">
            {homeAwayGap.map((row) => (
              <Link key={row.teamId} to={`/${competitionKey}/takim/${row.teamId}`} className={`fixture-difficulty-row ${row.teamId === favoriteTeamId ? "is-favorite" : ""}`}>
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name">{row.team.name}</span>
                <span className="footnote" style={{ flex: 1 }}>
                  Ev {row.homePpg} P/M · Dep {row.awayPpg} P/M -- {row.strongerAt === "home" ? "evinde daha güçlü" : "deplasmanda daha güçlü"}
                </span>
                <span className="fixture-difficulty-pct">{row.gap}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {mostAbsences.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🚑 En Eksik Kadroyla Sahaya Çıkanlar</h3>
          <p className="footnote">
            Güç Endeksi'nin "eksik etkisi" bileşenine göre, o an sakat/cezalı oyuncularının kaybı takıma en çok
            zarar veren takımlar -- sadece kadro ortalamasının ÜSTÜNDE reytingli eksik oyuncular sayılır.
          </p>
          <div className="fixture-difficulty-grid">
            {mostAbsences.map((row) => (
              <Link key={row.teamId} to={`/${competitionKey}/takim/${row.teamId}`} className={`fixture-difficulty-row ${row.teamId === favoriteTeamId ? "is-favorite" : ""}`}>
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name">{row.team.name}</span>
                <span className="footnote" style={{ flex: 1 }}>{row.unavailableCount} oyuncu eksik</span>
                <span className="fixture-difficulty-pct" style={{ color: "#b91c1c" }}>
                  {row.missingImpact > 0 ? `-${row.missingImpact}` : "0"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {zoneDistance.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>📏 Zirveye / Düşme Hattına Mesafe</h3>
          <p className="footnote">
            Her takımın bir ÜST bölgeye çıkmak için o bölgedeki en son sıradaki takıma kaç puan geride olduğu, ve bir
            ALT bölgeye düşmemek için o bölgenin ilk takımına kaç puan önde olduğu -- sadece gerçek puan durumundan.
            Sezon başında (az maç oynanmışken) bu sayılar bir sonuçla hızla değişebilir, dikkatli okunmalı.
          </p>
          <div className="standings-scroll">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="standings-team-header">Takım</th>
                  <th>P</th>
                  <th>Bölge</th>
                  <th>Yukarı Çıkmak İçin</th>
                  <th>Aşağı Düşmemek İçin</th>
                </tr>
              </thead>
              <tbody>
                {zoneDistance.map((row) => (
                  <tr key={row.teamId} className={row.teamId === favoriteTeamId ? "standings-row-favorite" : ""}>
                    <td className="standings-team-cell">
                      <span className="standings-team-link">
                        <Crest team={row.team} size={18} />
                        <span>{row.team.name}</span>
                      </span>
                    </td>
                    <td className="pts-cell">{row.pts}</td>
                    <td>
                      <span className={`status-badge status-tone-${row.zoneTone}`}>{row.zoneLabel}</span>
                    </td>
                    <td>
                      {row.pointsToClimb == null ? (
                        <span className="standings-empty">--</span>
                      ) : row.pointsToClimb === 0 ? (
                        <span className="zone-distance-safe">Sınırda</span>
                      ) : (
                        <>+{row.pointsToClimb} puan <span className="footnote-note">({row.climbTargetZoneLabel})</span></>
                      )}
                    </td>
                    <td>
                      {row.pointsCushion == null ? (
                        <span className="standings-empty">--</span>
                      ) : row.pointsCushion === 0 ? (
                        <span className="zone-distance-risky">Sınırda</span>
                      ) : (
                        <>{row.pointsCushion} puan önde <span className="footnote-note">({row.cushionZoneLabel})</span></>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gdFragility.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>⚠️ Averaj Kırılganlığı</h3>
          <p className="footnote">
            Aynı puana sahip, averaj farkı sadece 1-2 gol olan komşu takım çiftleri -- büyük skorlu TEK bir maç,
            aralarındaki sırayı değiştirebilir. Sadece gerçek puan durumundan; hipotetik bir maç UYDURULMAZ.
          </p>
          <div className="gd-fragility-list">
            {gdFragility.map((row) => (
              <div key={row.teamId} className="gd-fragility-row">
                <Link to={`/${competitionKey}/takim/${row.teamId}`} className="gd-fragility-team">
                  <Crest team={row.team} size={22} />
                  <span className="gd-fragility-name">{row.team.name}</span>
                  <span className="gd-fragility-stat">{row.pts}P · AV {row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                </Link>
                <span className="gd-fragility-gap">sadece {row.gdGap} gol fark</span>
                <Link to={`/${competitionKey}/takim/${row.rivalTeam.id}`} className="gd-fragility-team gd-fragility-team-away">
                  <span className="gd-fragility-stat">{row.pts}P · AV {row.rivalGd > 0 ? `+${row.rivalGd}` : row.rivalGd}</span>
                  <span className="gd-fragility-name">{row.rivalTeam.name}</span>
                  <Crest team={row.rivalTeam} size={22} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {goalDependency.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🎯 Kilit Oyuncu Bağımlılığı</h3>
          <p className="footnote">
            Takımın gerçek Gol Kralları verisindeki en golcü oyuncusunun, takımın puan durumundaki TOPLAM gol
            sayısına oranı -- yüksek yüzde, "bu oyuncu sakatlanırsa/cezalı olursa takım hücumda çok zorlanır" demek.
            Sadece gerçek, doğrulanmış gol verisi olan takımlar listelenir.
          </p>
          <div className="fixture-difficulty-grid">
            {goalDependency.map((row) => (
              <Link
                key={row.teamId}
                to={`/${competitionKey}/takim/${row.teamId}`}
                className={`fixture-difficulty-row ${row.teamId === favoriteTeamId ? "is-favorite" : ""}`}
              >
                <Crest team={row.team} size={22} />
                <span className="fixture-difficulty-name" title={`${row.playerName} (${row.playerGoals}/${row.teamGoals} gol)`}>
                  {row.playerName}
                </span>
                <span className="fixture-difficulty-track">
                  <span
                    className="fixture-difficulty-fill"
                    style={{
                      width: `${row.dependencyPct}%`,
                      background: `hsl(${Math.round((100 - row.dependencyPct) * 1.3)}, 65%, 46%)`,
                    }}
                  />
                </span>
                <span className="fixture-difficulty-pct">
                  %{row.dependencyPct}
                  <span className="fixture-difficulty-coeff">({row.playerGoals}/{row.teamGoals})</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {squadRatings.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>⭐ Kadro Gücü Sıralaması</h3>
          <p className="footnote">
            Kadrodaki oyuncuların araştırılmış, gerçek reytinglerinin (bkz. Takım/Oyuncu profil sayfaları) ortalaması
            -- maç sonuçlarından değil, doğrudan kadro kalitesinden türetilir. Katsayıdan (UEFA/geçmiş performans)
            farklı bir bakış açısı: şu anki kadronun kağıt üzerindeki gücü.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(320, squadRatings.length * 26)}>
            <BarChart data={squadRatings} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" domain={[60, 100]} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={(d) => d.team.short}
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="avgRating" name="Ortalama Kadro Reytingi" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {squadRatings.map((row) => (
                  <Cell key={row.teamId} fill={row.teamId === favoriteTeamId ? "#b45309" : CHART_SERIES[6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {injuryCounts.length > 0 && (
        <div className="chart-card">
          <h3>🩹 Sakatlık Durumu</h3>
          <p className="footnote">
            Şu an sakat/cezalı olduğu bilinen oyuncu sayısı (bkz. her takımın sayfasındaki "Olası Kadro" -- sakat
            oyuncular yanda ayrıca listelenir). Statik bir anlık görüntüdür, günlük güncellenmez.
          </p>
          <ResponsiveContainer width="100%" height={Math.max(220, injuryCounts.length * 26)}>
            <BarChart data={injuryCounts} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey={(d) => d.team.short}
                width={78}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} />}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" name="Sakat/Cezalı Sayısı" fill="#b91c1c" radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {nextMatches.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🔮 Model: {nextMatchday.number}. Hafta Tahminleri</h3>
          <p className="footnote">Tek maçlık model kazanma olasılığı (katsayı + kadro gücüne dayalı) -- gerçek bahis oranı değildir.</p>
          <Pagination items={nextMatches} pageSize={8} topRef={topRef}>
            {(pageItems) => (
              <div className="match-list">
                {pageItems.map((m) => (
                  <MatchRow key={m.id} match={m} competitionKey={competitionKey} readOnly favoriteTeamId={favoriteTeamId} />
                ))}
              </div>
            )}
          </Pagination>
        </div>
      )}

      <div className="chart-card chart-card-wide">
        <h3>📋 Form Durumu (tüm takımlar)</h3>
        <p className="footnote">
          {competitionKey === "superlig"
            ? "Süper Lig'deki son 5 gerçek maç sonucu."
            : "Kulübün kendi ülke ligindeki son 5 gerçek maç sonucu."}
        </p>
        <Pagination items={formRows} pageSize={FORM_PAGE_SIZE} topRef={topRef}>
          {(pageItems) => (
            <div className="form-guide-list">
              {pageItems.map((row) => (
                <Link
                  key={row.teamId}
                  to={`/${competitionKey}/takim/${row.teamId}`}
                  className={`form-guide-row ${row.teamId === favoriteTeamId ? "is-favorite" : ""}`}
                >
                  <span className="form-guide-rank">#{row.rank}</span>
                  <span className="form-guide-team">
                    <Crest team={row.team} size={22} />
                    {row.team.name}
                  </span>
                  <span className="form-guide-badges">
                    {row.form.length === 0 ? (
                      <span className="standings-empty">Veri yok</span>
                    ) : (
                      row.form.map((r, i) => <FormCell key={i} result={r} />)
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Pagination>
      </div>
    </div>
  );
}

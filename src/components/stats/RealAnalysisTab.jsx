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
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import Crest from "../Crest.jsx";
import MatchRow from "../fixture/MatchRow.jsx";
import Pagination from "../Pagination.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import TeamAxisTick from "./TeamAxisTick.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../../utils/chartTheme.js";
import { isMatchPlayed } from "../../utils/matchDate.js";
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
} from "../../utils/realStandingsSelectors.js";

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
    return { avgGf, avgGa };
  }, [attackDefenseMatrix]);
  const goalsTrend = useMemo(() => getGoalsPerMatchdayTrend(competitionKey), [competitionKey]);

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
                  {u.homeTeam.short}
                </span>
                <span className="upset-row-score">{u.homeGoals} - {u.awayGoals}</span>
                <span className="upset-row-team upset-row-team-away">
                  {u.awayTeam.short}
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
                        <Crest team={row.team} size={18} />
                        <span>{row.team.name}</span>
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
                  {m.homeTeam.short}
                </span>
                <span className="upset-row-score">{m.homeGoals} - {m.awayGoals}</span>
                <span className="upset-row-team upset-row-team-away">
                  {m.awayTeam.short}
                  <Crest team={m.awayTeam} size={20} />
                </span>
                <span className="upset-row-surprise">{m.totalGoals} gol</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {attackDefenseMatrix.length > 0 && matrixAverages && (
        <div className="chart-card chart-card-wide">
          <h3>🎯 Hücum-Savunma Matrisi</h3>
          <p className="footnote">
            Her nokta bir takım -- yatay eksen maç başına attığı gol, dikey eksen maç başına yediği gol. Sağ-alt
            kadran (çok atan, az yiyen) en güçlü takımları, sol-üst kadran (az atan, çok yiyen) en zayıf takımları
            işaret eder. Kesikli çizgiler ligin ortalamasıdır -- gerçek sonuçlardan.
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid stroke={CHART_GRID} />
              <XAxis
                type="number"
                dataKey="gfPerGame"
                name="Maç Başına Gol (Attığı)"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                label={{ value: "Maç başına attığı gol →", position: "insideBottom", offset: -8, fill: CHART_AXIS, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="gaPerGame"
                name="Maç Başına Gol (Yediği)"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                label={{ value: "← Maç başına yediği gol", angle: -90, position: "insideLeft", fill: CHART_AXIS, fontSize: 11 }}
              />
              <ReferenceLine x={matrixAverages.avgGf} stroke={CHART_AXIS} strokeDasharray="4 4" />
              <ReferenceLine y={matrixAverages.avgGa} stroke={CHART_AXIS} strokeDasharray="4 4" />
              <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={attackDefenseMatrix} fill={CHART_SERIES[0]}>
                {attackDefenseMatrix.map((row) => (
                  <Cell key={row.teamId} fill={row.teamId === favoriteTeamId ? "#fbbf24" : CHART_SERIES[0]} />
                ))}
                <LabelList dataKey="short" position="top" style={{ fill: CHART_AXIS, fontSize: 10 }} />
              </Scatter>
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
                <span className="fixture-difficulty-name">{row.team.short}</span>
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

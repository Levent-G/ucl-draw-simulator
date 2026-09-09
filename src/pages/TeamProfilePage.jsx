import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useTransferMarket } from "../state/TransferContext.jsx";
import { useCareer } from "../state/CareerContext.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { FORMATIONS } from "../state/DreamTeamContext.jsx";
import Crest from "../components/Crest.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import { topScorers } from "../utils/statsSelectors.js";
import { getRivalsOf } from "../utils/derbies.js";
import { derivePhysicalAttributes } from "../utils/playerAttributes.js";
import { estimateFinancialPower, estimateSquadValue, estimateCompetitionEarnings, formatMoney } from "../utils/financeEngine.js";
import { getCompetition } from "../data/competitions.js";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import { CURRENT_INJURIES } from "../data/injuries.js";
import {
  hasRealDataSupport,
  getRealStandings,
  getRealFixture,
  getRealMatchResult,
  getDomesticForm,
  getSuperLigTeamForm,
  getTeamRadarProfile,
} from "../utils/realStandingsSelectors.js";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";

const RESULT_LABEL = { W: "G", D: "B", L: "M" };
const POSITION_ORDER = ["GK", "DF", "MF", "FW"];
const POSITION_LABEL_TR = { GK: "Kaleci", DF: "Defans", MF: "Orta Saha", FW: "Forvet" };
const PITCH_FORMATION_KEY = "4-3-3";

const INJURED_NAMES_BY_TEAM = CURRENT_INJURIES.reduce((acc, entry) => {
  const normalized = entry.playerName.trim().toLowerCase();
  if (!acc[entry.teamId]) acc[entry.teamId] = new Set();
  acc[entry.teamId].add(normalized);
  return acc;
}, {});

// Kadroyu Rüya Takım'daki gibi bir sahada gösterir -- mevkiine göre en
// yüksek reytingli (ve hâlihazırda sakat/cezalı OLMAYAN, bkz.
// src/data/injuries.js) oyuncular ilk 11 slotlarına atanır, geri kalanlar
// (kadro derinliği + sakatlar) "Yedekler" listesine düşer. Bu GERÇEK/
// doğrulanmış bir ilk 11 DEĞİLDİR, sadece kadro gücüne dayalı bir
// görselleştirmedir.
function buildPitchSquad(players, teamId) {
  const injuredNames = INJURED_NAMES_BY_TEAM[teamId];
  const isInjured = (p) => injuredNames?.has((p.name || "").trim().toLowerCase()) || false;
  const slots = FORMATIONS[PITCH_FORMATION_KEY].slots;
  const byPosition = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) {
    if (byPosition[p.position] && !isInjured(p)) byPosition[p.position].push(p);
  }
  for (const pos in byPosition) byPosition[pos].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const used = new Set();
  const starters = slots.map((slot) => {
    const pool = byPosition[slot.position] || [];
    const player = pool.find((p) => !used.has(p.id)) || null;
    if (player) used.add(player.id);
    return { slot, player };
  });
  const bench = players
    .filter((p) => !used.has(p.id))
    .map((p) => ({ ...p, injured: isInjured(p) }))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return { starters, bench };
}

// Bir gerçek kulübün (isim eşleşmesiyle) hangi GERÇEK VERİ yarışmalarında
// (UCL/Süper Lig) yer aldığını bulur -- ör. Galatasaray/Fenerbahçe hem UCL
// (t-id) hem Süper Lig'de (s-id) ayrı bir kayıt olarak var. "Avrupa Ligi"
// hiç dahil edilmez (gerçek veri kaynağı yok) -- bu yüzden orada olmayan bir
// takım için asla "Avrupa fikstürü" seçeneği ÖNERİLMEZ.
function findRealCompetitionEntries(teamName) {
  const entries = [];
  for (const key of ["ucl", "superlig"]) {
    const comp = getCompetition(key);
    const match = comp.teams.find((t) => t.name === teamName);
    if (match) entries.push({ competitionKey: key, competitionLabel: comp.shortName, team: match });
  }
  return entries;
}

// Bir gerçek yarışmadaki (UCL/Süper Lig) TÜM sezonu, sadece bu takımın
// maçlarına indirgeyerek döner -- kronolojik, tarihli, gerçek sonuçlu
// (varsa) satırlar.
function buildRealTeamFixtureRows(competitionKey, teamId) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const rows = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      if (m.homeTeam.id !== teamId && m.awayTeam.id !== teamId) continue;
      const real = getRealMatchResult(competitionKey, m);
      rows.push({
        id: m.id,
        matchdayLabel: md.label,
        date: m.date,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoals: real?.homeGoals ?? null,
        awayGoals: real?.awayGoals ?? null,
        hasResult: real != null,
        pending: !isMatchPlayed(m) && real == null,
      });
    }
  }
  return rows;
}

// Bir takımın "form"unu (son N maçtaki galibiyet/beraberlik/mağlubiyet
// harfleri) simulation.matchResults'tan çıkarır -- en yeniye en sağda.
function computeForm(matchResults, teamId) {
  if (!matchResults) return [];
  const teamMatches = matchResults
    .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    .sort((a, b) => a.matchdayNumber - b.matchdayNumber);
  return teamMatches.map((m) => {
    const isHome = m.homeTeam.id === teamId;
    const gf = isHome ? m.homeGoals : m.awayGoals;
    const ga = isHome ? m.awayGoals : m.homeGoals;
    const result = gf > ga ? "W" : gf < ga ? "L" : "D";
    return { matchId: m.id, matchdayNumber: m.matchdayNumber, result, gf, ga, opponent: isHome ? m.awayTeam : m.homeTeam };
  });
}

// Takımın TÜM maçlarını (simüle edilmişse skorla, değilse sadece rakip/saha
// bilgisiyle) tek bir listede birleştirir -- "form" sadece son 8'i gösterir,
// bu ise sezonun tamamını kapsar.
function buildAllTeamMatches(fixture, matchResults, teamId) {
  if (matchResults) {
    return matchResults
      .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
      .sort((a, b) => a.matchdayNumber - b.matchdayNumber)
      .map((m) => ({
        id: m.id,
        matchdayNumber: m.matchdayNumber,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoals: m.homeGoals,
        awayGoals: m.awayGoals,
        isDerby: m.isDerby,
        sidelined: m.sidelined,
        simulated: true,
      }));
  }
  if (!fixture) return [];
  const rows = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      if (m.homeTeam.id === teamId || m.awayTeam.id === teamId) {
        rows.push({
          id: m.id,
          matchdayNumber: md.number,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          simulated: false,
        });
      }
    }
  }
  return rows;
}

export default function TeamProfilePage() {
  const { competitionKey, teamId } = useParams();
  const { competition, simulation, knockout, hasFixture, fixture } = useCompetition(competitionKey);
  const { getEffectivePlayersByTeam, transfers } = useTransferMarket(competitionKey);
  const { getCoeffDelta } = useCareer();
  const { favoriteTeamId, setFavoriteTeam } = useFavoriteTeam(competitionKey);
  const isFavorite = favoriteTeamId === teamId;

  const team = useMemo(() => competition.teams.find((t) => t.id === teamId), [competition, teamId]);
  const coeffDelta = teamId ? getCoeffDelta(competitionKey, teamId) : 0;
  const roster = useMemo(() => (team ? getEffectivePlayersByTeam(team.id) : []), [getEffectivePlayersByTeam, team]);
  const rosterWithAttrs = useMemo(
    () => roster.map((p) => ({ ...p, ...derivePhysicalAttributes({ ...p, globalId: `${competitionKey}:${p.id}` }) })),
    [roster, competitionKey]
  );
  const transferInByPlayerId = useMemo(
    () => Object.fromEntries(transfers.filter((t) => t.toTeam?.id === teamId).map((t) => [t.playerId, t.fromTeam])),
    [transfers, teamId]
  );
  const financialPower = useMemo(() => (team ? estimateFinancialPower(team) : 0), [team]);
  const squadValue = useMemo(() => estimateSquadValue(rosterWithAttrs), [rosterWithAttrs]);
  const seasonEarnings = useMemo(() => {
    if (!simulation) return null;
    const earnings = estimateCompetitionEarnings(competition, simulation, knockout);
    return earnings[teamId] ?? null;
  }, [competition, simulation, knockout, teamId]);

  const standingRow = useMemo(
    () => simulation?.standings?.find((s) => s.teamId === teamId) || null,
    [simulation, teamId]
  );
  const showReal = hasRealDataSupport(competitionKey);
  const realStandingRow = useMemo(
    () => (showReal ? getRealStandings(competitionKey).standings?.find((s) => s.teamId === teamId) || null : null),
    [showReal, competitionKey, teamId]
  );
  const domesticForm = useMemo(() => (showReal && team ? getDomesticForm(team.id) : null), [showReal, team]);
  const realCompetitionForm = useMemo(
    () => (showReal && competitionKey === "superlig" && team ? getSuperLigTeamForm(team.name) : null),
    [showReal, competitionKey, team]
  );
  const radarProfile = useMemo(
    () => (showReal && team ? getTeamRadarProfile(competitionKey, team.id) : []),
    [showReal, competitionKey, team]
  );
  const form = useMemo(() => computeForm(simulation?.matchResults, teamId), [simulation, teamId]);
  const allMatches = useMemo(
    () => buildAllTeamMatches(fixture, simulation?.matchResults, teamId),
    [fixture, simulation, teamId]
  );
  // Sezonun en son oynanan haftasında bu takımdan kadro dışı kalanlar --
  // "şu an sakat/cezalı olabilecekler" için yaklaşık bir gösterge.
  const lastSidelined = useMemo(() => {
    const played = allMatches.filter((m) => m.simulated);
    if (played.length === 0) return [];
    const last = played[played.length - 1];
    return (last.sidelined || []).filter((s) => s.teamId === teamId);
  }, [allMatches, teamId]);
  const teamTopScorers = useMemo(() => {
    if (!simulation?.playerStats) return [];
    return topScorers(roster, simulation.playerStats, 5).filter((p) => p.goals > 0);
  }, [roster, simulation]);
  const rivals = useMemo(() => (team ? getRivalsOf(team.short) : []), [team]);
  const rivalTeamByShort = useMemo(
    () => Object.fromEntries(competition.teams.map((t) => [t.short, t])),
    [competition]
  );

  // Kadroyu Rüya Takım'daki gibi bir sahada göster -- ilk 11 solda/ortada,
  // yedekler sağda bir panelde (bkz. buildPitchSquad).
  const pitchSquad = useMemo(() => buildPitchSquad(rosterWithAttrs, teamId), [rosterWithAttrs, teamId]);

  // Bu gerçek kulüp hangi GERÇEK VERİ yarışmalarında oynuyor (UCL/Süper
  // Lig, isim eşleşmesiyle) -- Galatasaray/Fenerbahçe gibi ikisinde birden
  // oynayan kulüpler için AYRI sekmeler, sadece birinde oynayanlar için tek
  // (sekmesiz) bir bölüm gösterilir. Avrupa Ligi'nin gerçek verisi olmadığı
  // için hiçbir zaman bir seçenek olarak önerilmez.
  const realCompetitionEntries = useMemo(() => (team ? findRealCompetitionEntries(team.name) : []), [team]);
  const [activeFixtureCompKey, setActiveFixtureCompKey] = useState(null);
  const effectiveFixtureCompKey =
    activeFixtureCompKey && realCompetitionEntries.some((e) => e.competitionKey === activeFixtureCompKey)
      ? activeFixtureCompKey
      : realCompetitionEntries.find((e) => e.competitionKey === competitionKey)?.competitionKey ||
        realCompetitionEntries[0]?.competitionKey ||
        null;
  const activeFixtureEntry = realCompetitionEntries.find((e) => e.competitionKey === effectiveFixtureCompKey) || null;
  const realFixtureRows = useMemo(
    () => (activeFixtureEntry ? buildRealTeamFixtureRows(activeFixtureEntry.competitionKey, activeFixtureEntry.team.id) : []),
    [activeFixtureEntry]
  );

  const squadSummary = useMemo(() => {
    if (rosterWithAttrs.length === 0) return null;
    const avgRating = Math.round(rosterWithAttrs.reduce((s, p) => s + p.rating, 0) / rosterWithAttrs.length);
    const avgAge = (rosterWithAttrs.reduce((s, p) => s + p.age, 0) / rosterWithAttrs.length).toFixed(1);
    const posCounts = { GK: 0, DF: 0, MF: 0, FW: 0 };
    for (const p of rosterWithAttrs) posCounts[p.position] = (posCounts[p.position] || 0) + 1;
    return { avgRating, avgAge, posCounts };
  }, [rosterWithAttrs]);

  if (!team) {
    return (
      <div className="page-shell">
        <div className="empty-card">
          <h2>Takım bulunamadı</h2>
          <p>Bu yarışmada böyle bir takım yok -- Rüya Takım enjeksiyonu bu takımı değiştirmiş olabilir.</p>
          <div className="empty-card-actions">
            <Link to={`/${competitionKey}`} className="btn-primary">
              {competition.shortName} sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="team-profile-header">
        <Crest team={team} size={72} />
        <div>
          <div className="page-eyebrow">
            {competition.shortName}
            {team.country && ` · ${competition.countryNames?.[team.country] || team.country}`}
          </div>
          <h1>{team.name}</h1>
          {showReal && (
            <button
              type="button"
              className={`favorite-toggle-btn ${isFavorite ? "is-favorite" : ""}`}
              onClick={() => setFavoriteTeam(isFavorite ? null : team.id)}
            >
              {isFavorite ? "⭐ Tuttuğun Takım" : "☆ Takımım Olarak Seç"}
            </button>
          )}
          <div className="team-profile-meta">
            {team.coeff != null && (
              <span>
                Katsayı: <b>{team.coeff}</b>
                {coeffDelta !== 0 && (
                  <span className={`team-profile-coeff-delta ${coeffDelta > 0 ? "is-up" : "is-down"}`}>
                    {" "}
                    ({coeffDelta > 0 ? "+" : ""}
                    {coeffDelta} kariyer)
                  </span>
                )}
              </span>
            )}
            {team.pot && <span>Torba: <b>{team.pot}</b></span>}
            {standingRow && (
              <span>
                Sıra: <b>#{standingRow.rank}</b>{" "}
                <span className={`status-badge status-tone-${standingRow.statusTone}`}>{standingRow.statusLabel}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="team-profile-stat-row">
        <div className="team-profile-stat"><span>{formatMoney(financialPower)}</span><small>💰 Mali Güç</small></div>
        <div className="team-profile-stat"><span>{formatMoney(squadValue)}</span><small>Kadro Değeri</small></div>
        {seasonEarnings != null && (
          <div className="team-profile-stat"><span>{formatMoney(seasonEarnings)}</span><small>Bu Sezon Kazanç</small></div>
        )}
      </div>

      {standingRow && (
        <div className="team-profile-stat-row">
          <div className="team-profile-stat"><span>{standingRow.played}</span><small>Oynadı</small></div>
          <div className="team-profile-stat"><span>{standingRow.w}</span><small>Galibiyet</small></div>
          <div className="team-profile-stat"><span>{standingRow.d}</span><small>Beraberlik</small></div>
          <div className="team-profile-stat"><span>{standingRow.l}</span><small>Mağlubiyet</small></div>
          <div className="team-profile-stat"><span>{standingRow.gf}:{standingRow.ga}</span><small>Averaj</small></div>
          <div className="team-profile-stat"><span>{standingRow.pts}</span><small>Puan</small></div>
        </div>
      )}

      {showReal && realStandingRow && (
        <div className="team-profile-stat-row">
          <div className="team-profile-stat"><span>{realStandingRow.played}</span><small>Oynadı</small></div>
          <div className="team-profile-stat"><span>{realStandingRow.w}</span><small>Galibiyet</small></div>
          <div className="team-profile-stat"><span>{realStandingRow.d}</span><small>Beraberlik</small></div>
          <div className="team-profile-stat"><span>{realStandingRow.l}</span><small>Mağlubiyet</small></div>
          <div className="team-profile-stat"><span>{realStandingRow.gf}:{realStandingRow.ga}</span><small>Averaj</small></div>
          <div className="team-profile-stat"><span>{realStandingRow.pts}</span><small>Puan</small></div>
        </div>
      )}

      {showReal && (domesticForm || realCompetitionForm) && (
        <div className="chart-card">
          <h3>📈 Form &amp; Lig Durumu</h3>
          {realCompetitionForm && (
            <div className="team-profile-form">
              <span className="team-profile-form-label">Süper Lig Formu (son 5):</span>
              <div className="team-profile-form-badges">
                {realCompetitionForm.map((r, i) => (
                  <span key={i} className={`form-badge form-badge-${r}`}>{r}</span>
                ))}
              </div>
            </div>
          )}
          {domesticForm && (
            <>
              <p className="footnote">
                {domesticForm.league} — {domesticForm.position ? `${domesticForm.position}. sıra` : "?"}
                {domesticForm.played != null ? ` (${domesticForm.played} maç, ${domesticForm.pts} puan)` : ""}
                {domesticForm.asOf ? ` · Anlık görüntü: ${domesticForm.asOf}` : ""}
              </p>
              <div className="team-profile-form">
                <span className="team-profile-form-label">Son 5 maç:</span>
                <div className="team-profile-form-badges">
                  {(domesticForm.form || []).length === 0 && <span className="standings-empty">Form verisi yok</span>}
                  {(domesticForm.form || []).map((r, i) => (
                    <span key={i} className={`form-badge form-badge-${r}`}>{r}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showReal && radarProfile.length > 0 && (
        <div className="chart-card">
          <h3>🕸️ Takım Profili</h3>
          <p className="footnote">
            Gerçek girdilerden (kadro gücü, katsayı, form, lig konumu) türetilmiş, 0-100 arasında normalize edilmiş
            karşılaştırma görünümü -- resmi bir istatistik değil, sitenin kendi karşılaştırma ölçeğidir.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarProfile} outerRadius={100}>
              <PolarGrid stroke={CHART_GRID} />
              <PolarAngleAxis dataKey="axis" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <PolarRadiusAxis stroke={CHART_GRID} tick={{ fill: CHART_AXIS, fontSize: 10 }} domain={[0, 100]} />
              <Radar dataKey="value" name={team.name} stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {form.length > 0 && (
        <div className="team-profile-form">
          <span className="team-profile-form-label">Form:</span>
          <div className="team-profile-form-badges">
            {form.slice(-8).map((f) => (
              <Link
                key={f.matchId}
                to={`/${competitionKey}/mac/${f.matchId}`}
                className={`form-badge form-badge-${f.result}`}
                title={`${f.matchdayNumber}. hafta · ${f.opponent.name} · ${f.gf}-${f.ga}`}
              >
                {RESULT_LABEL[f.result]}
              </Link>
            ))}
          </div>
        </div>
      )}

      {lastSidelined.length > 0 && (
        <div className="team-profile-sidelined">
          <span className="team-profile-sidelined-label">🩹 Son Maçta Kadro Dışı:</span>
          {lastSidelined.map((s) => (
            <Link key={s.playerId} to={`/${competitionKey}/oyuncu/${s.playerId}`} className="team-profile-sidelined-chip">
              {s.name}
              <span className="team-profile-sidelined-reason">
                {s.reason === "kırmızı kart cezası" ? "🟥" : "🩹"}
              </span>
            </Link>
          ))}
        </div>
      )}

      {rivals.length > 0 && (
        <div className="team-profile-rivals">
          <span className="team-profile-rivals-label">🔥 Ezeli Rakip{rivals.length > 1 ? "ler" : ""}:</span>
          {rivals.map((r) => {
            const opp = rivalTeamByShort[r.opponentShort];
            return opp ? (
              <Link key={r.opponentShort} to={`/${competitionKey}/takim/${opp.id}`} className="team-profile-rival-chip">
                <Crest team={opp} size={16} /> {opp.name}
                <span className="team-profile-rival-tag">{r.label}</span>
              </Link>
            ) : null;
          })}
        </div>
      )}

      {!showReal && !hasFixture && (
        <div className="stats-callout">
          Henüz bir kura/fikstür üretilmedi -- sıra/form/istatistik bilgisi için önce{" "}
          <Link to={`/${competitionKey}`}>{competition.shortName} sayfasından</Link> başla.
        </div>
      )}

      {squadSummary && (
        <div className="team-profile-stat-row">
          <div className="team-profile-stat"><span>{squadSummary.avgRating}</span><small>Ort. Güç</small></div>
          <div className="team-profile-stat"><span>{squadSummary.avgAge}</span><small>Ort. Yaş (tahmini)</small></div>
          {POSITION_ORDER.map((pos) => (
            <div className="team-profile-stat" key={pos}>
              <span>{squadSummary.posCounts[pos] || 0}</span>
              <small>{POSITION_LABEL_TR[pos]}</small>
            </div>
          ))}
        </div>
      )}

      {teamTopScorers.length > 0 && (
        <div className="chart-card">
          <h3>Takımın Gol Kralları (bu simülasyonda)</h3>
          <div className="team-profile-scorers">
            {teamTopScorers.map((p) => (
              <Link key={p.id} to={`/${competitionKey}/oyuncu/${p.id}`} className="team-profile-scorer-row">
                <PlayerAvatar player={p} size={30} />
                <span className="team-profile-scorer-name">{p.name}</span>
                <span className="team-profile-scorer-goals">{p.goals} gol</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="chart-card chart-card-wide">
        <h3>🏟️ Kadro ({rosterWithAttrs.length} oyuncu)</h3>
        <p className="footnote">
          İlk 11, mevkiine göre en yüksek reytingli oyunculardan otomatik oluşturulmuştur -- resmi bir dizilim
          değildir. {showReal && "Hâlihazırda sakat/cezalı bilinen oyuncular sahaya değil yedek listesine düşer."}
        </p>
        <div className="team-profile-pitch-layout">
          <div className="pitch pitch-readonly pitch-compact">
            <div className="pitch-lines" aria-hidden="true">
              <span className="pitch-center-circle" />
              <span className="pitch-center-line" />
            </div>
            {pitchSquad.starters.map(({ slot, player }) => (
              <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} key={slot.id}>
                {player ? (
                  <Link to={`/${competitionKey}/oyuncu/${player.id}`} className="pitch-slot-filled">
                    <PlayerAvatar player={player} size={30} />
                    <span className="pitch-slot-name">{player.name}</span>
                    <span className="pitch-slot-meta">{player.rating}</span>
                  </Link>
                ) : (
                  <div className="pitch-slot-empty">
                    <span className="pitch-slot-pos">{slot.position}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="team-profile-bench">
            <h4>Yedekler ({pitchSquad.bench.length})</h4>
            <div className="team-profile-bench-list">
              {pitchSquad.bench.map((p) => {
                const fromTeam = transferInByPlayerId[p.id];
                return (
                  <Link key={p.id} to={`/${competitionKey}/oyuncu/${p.id}`} className={`team-profile-bench-row ${p.injured ? "is-injured" : ""}`}>
                    <PlayerAvatar player={p} size={26} />
                    <span className="team-profile-bench-name">
                      {p.name}
                      {p.injured && <span title="Sakat/cezalı">🩹</span>}
                      {fromTeam && (
                        <span className="team-profile-roster-transfer-tag" title={`${fromTeam.name} takımından transfer edildi`}>
                          🔁 {fromTeam.short}
                        </span>
                      )}
                    </span>
                    <span className="team-profile-bench-pos">{p.position}</span>
                    <span className="team-profile-bench-rating">{p.rating}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {realCompetitionEntries.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>🗓️ Fikstür</h3>
          {realCompetitionEntries.length > 1 && (
            <div className="stats-tabs team-profile-fixture-tabs">
              {realCompetitionEntries.map((e) => (
                <button
                  key={e.competitionKey}
                  className={effectiveFixtureCompKey === e.competitionKey ? "active" : ""}
                  onClick={() => setActiveFixtureCompKey(e.competitionKey)}
                >
                  {e.competitionLabel}
                </button>
              ))}
            </div>
          )}
          <div className="team-profile-matches">
            {realFixtureRows.map((m) => {
              const isHome = m.homeTeam.id === activeFixtureEntry.team.id;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const row = (
                <>
                  <span className="team-profile-match-md">{formatMatchDate(m.date) || m.matchdayLabel}</span>
                  <span className="team-profile-match-venue">{isHome ? "İç Saha" : "Deplasman"}</span>
                  <span className="team-profile-match-opp">
                    <Crest team={opponent} size={18} /> {opponent.name}
                  </span>
                  <span className="team-profile-match-score">
                    {m.hasResult ? `${m.homeGoals} : ${m.awayGoals}` : m.pending ? "⏳" : "vs"}
                  </span>
                </>
              );
              return (
                <Link key={m.id} to={`/${activeFixtureEntry.competitionKey}/mac/${m.id}`} className="team-profile-match-row">
                  {row}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!showReal && allMatches.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>Tüm Maçlar ({allMatches.length})</h3>
          <div className="team-profile-matches">
            {allMatches.map((m) => {
              const isHome = m.homeTeam.id === teamId;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const row = (
                <>
                  <span className="team-profile-match-md">{m.matchdayNumber}. Hafta</span>
                  <span className="team-profile-match-venue">{isHome ? "İç Saha" : "Deplasman"}</span>
                  <span className="team-profile-match-opp">
                    <Crest team={opponent} size={18} /> {opponent.name}
                  </span>
                  {m.isDerby && <span className="match-row-derby-badge">🔥</span>}
                  <span className="team-profile-match-score">
                    {m.simulated ? `${m.homeGoals} : ${m.awayGoals}` : "vs"}
                  </span>
                </>
              );
              return m.simulated ? (
                <Link key={m.id} to={`/${competitionKey}/mac/${m.id}`} className="team-profile-match-row">
                  {row}
                </Link>
              ) : (
                <div key={m.id} className="team-profile-match-row team-profile-match-row-static">
                  {row}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

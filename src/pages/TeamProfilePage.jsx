import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useTransferMarket } from "../state/TransferContext.jsx";
import { useCareer } from "../state/CareerContext.jsx";
import Crest from "../components/Crest.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import { topScorers } from "../utils/statsSelectors.js";
import { getRivalsOf } from "../utils/derbies.js";
import { derivePhysicalAttributes } from "../utils/playerAttributes.js";
import { estimateFinancialPower, estimateSquadValue, estimateCompetitionEarnings, formatMoney } from "../utils/financeEngine.js";

const RESULT_LABEL = { W: "G", D: "B", L: "M" };
const POSITION_ORDER = ["GK", "DF", "MF", "FW"];
const POSITION_LABEL_TR = { GK: "Kaleci", DF: "Defans", MF: "Orta Saha", FW: "Forvet" };

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

      {!hasFixture && (
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

      <div className="chart-card">
        <h3>Kadro ({rosterWithAttrs.length} oyuncu)</h3>
        <div className="team-profile-roster">
          {rosterWithAttrs.map((p) => {
            const fromTeam = transferInByPlayerId[p.id];
            return (
              <Link key={p.id} to={`/${competitionKey}/oyuncu/${p.id}`} className="team-profile-roster-row">
                <PlayerAvatar player={p} size={32} />
                <span className="team-profile-roster-name">
                  {p.name}
                  {fromTeam && (
                    <span className="team-profile-roster-transfer-tag" title={`${fromTeam.name} takımından transfer edildi`}>
                      🔁 {fromTeam.short}'dan geldi
                    </span>
                  )}
                </span>
                <span className="team-profile-roster-age">{p.age}y</span>
                <span className="team-profile-roster-pos">{p.position}</span>
                <span className="team-profile-roster-rating">{p.rating}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {allMatches.length > 0 && (
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

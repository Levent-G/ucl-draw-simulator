import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useTransferMarket } from "../state/TransferContext.jsx";
import Crest from "../components/Crest.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import { POSITION_LABELS as POS_LABELS_FALLBACK } from "../data/players.js";
import { derivePhysicalAttributes } from "../utils/playerAttributes.js";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";

const EVENT_TYPE_LABEL = { goal: "⚽ Gol", yellow: "🟨 Sarı Kart", red: "🟥 Kırmızı Kart" };

export default function PlayerProfilePage() {
  const { competitionKey, playerId } = useParams();
  const { competition, simulation, hasFixture } = useCompetition(competitionKey);
  const { effectiveAllPlayers, transfers } = useTransferMarket(competitionKey);

  const player = useMemo(
    () => effectiveAllPlayers.find((p) => p.id === playerId) || null,
    [effectiveAllPlayers, playerId]
  );
  const team = useMemo(
    () => (player ? competition.teams.find((t) => t.id === player.teamId) : null),
    [competition, player]
  );
  const transferRecord = useMemo(() => transfers.find((t) => t.playerId === playerId) || null, [transfers, playerId]);
  const physical = useMemo(
    () => (player ? derivePhysicalAttributes({ ...player, globalId: `${competitionKey}:${player.id}` }) : null),
    [player, competitionKey]
  );

  const stats = simulation?.playerStats?.[playerId] || null;
  const positionLabel = (competition.positionLabels || POS_LABELS_FALLBACK)[player?.position] || player?.position;

  const goalRank = useMemo(() => {
    if (!simulation?.playerStats || !stats || stats.goals === 0) return null;
    const allGoals = Object.values(simulation.playerStats)
      .map((s) => s.goals)
      .filter((g) => g > 0)
      .sort((a, b) => b - a);
    return allGoals.indexOf(stats.goals) + 1;
  }, [simulation, stats]);

  // Bu oyuncunun katıldığı TÜM olayları (gol/sarı/kırmızı) sezon genelinde
  // maç akışından tarar -- her satır ilgili Maç Merkezi'ne bağlanır.
  const eventHistory = useMemo(() => {
    if (!simulation?.matchResults) return [];
    const rows = [];
    for (const m of simulation.matchResults) {
      for (const ev of m.events) {
        if (ev.type !== "goal" && ev.type !== "yellow" && ev.type !== "red") continue;
        if (ev.player?.id !== playerId) continue;
        const opponent = ev.teamId === m.homeTeam.id ? m.awayTeam : m.homeTeam;
        rows.push({ matchId: m.id, matchdayNumber: m.matchdayNumber, type: ev.type, minute: ev.minute, opponent, assist: ev.assist });
      }
    }
    return rows.sort((a, b) => a.matchdayNumber - b.matchdayNumber);
  }, [simulation, playerId]);

  const radarData = useMemo(() => {
    if (!player) return [];
    const allStatValues = simulation?.playerStats ? Object.values(simulation.playerStats) : [];
    const maxGoals = Math.max(1, ...allStatValues.map((s) => s.goals || 0));
    const maxAssists = Math.max(1, ...allStatValues.map((s) => s.assists || 0));
    const maxCoeff = Math.max(1, ...competition.teams.map((t) => t.coeff || 0));
    const goals = stats?.goals || 0;
    const assists = stats?.assists || 0;
    return [
      { axis: "Güç Puanı", value: player.rating },
      { axis: "Gol", value: Math.round((goals / maxGoals) * 99) },
      { axis: "Asist", value: Math.round((assists / maxAssists) * 99) },
      { axis: "Takım Gücü", value: Math.round(((team?.coeff || 0) / maxCoeff) * 99) },
      { axis: "Skor Katkısı", value: Math.round(((goals + assists) / (maxGoals + maxAssists || 1)) * 99) },
    ];
  }, [player, stats, simulation, team, competition]);

  if (!player) {
    return (
      <div className="page-shell">
        <div className="empty-card">
          <h2>Oyuncu bulunamadı</h2>
          <p>Bu yarışmada böyle bir oyuncu yok -- transfer edilmiş ya da Rüya Takım tarafından değiştirilmiş olabilir.</p>
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
      <div className="player-profile-header">
        <PlayerAvatar player={player} size={72} />
        <div>
          <div className="page-eyebrow">
            {competition.shortName} · {positionLabel}
          </div>
          <h1>{player.name}</h1>
          <div className="player-profile-meta">
            {team && (
              <Link to={`/${competitionKey}/takim/${team.id}`} className="player-profile-team-link">
                <Crest team={team} size={20} /> {team.name}
              </Link>
            )}
            <span>Uyruk: <b>{player.nationality}</b></span>
            <span>Güç Puanı: <b>{player.rating}</b></span>
          </div>
        </div>
      </div>

      {transferRecord && (
        <div className="stats-callout player-profile-transfer-banner">
          🔁 Bu oyuncu Transfer Merkezi'nde{" "}
          <Link to={`/${competitionKey}/takim/${transferRecord.fromTeam.id}`}>
            <b>{transferRecord.fromTeam.name}</b>
          </Link>{" "}
          takımından{" "}
          <Link to={`/${competitionKey}/takim/${transferRecord.toTeam.id}`}>
            <b>{transferRecord.toTeam.name}</b>
          </Link>{" "}
          takımına transfer edildi.
        </div>
      )}

      {physical && (
        <div className="team-profile-stat-row">
          <div className="team-profile-stat"><span>{physical.age}</span><small>Yaş (tahmini)</small></div>
          <div className="team-profile-stat"><span>{physical.height} cm</span><small>Boy (tahmini)</small></div>
          <div className="team-profile-stat"><span>{physical.weight} kg</span><small>Kilo (tahmini)</small></div>
          <div className="team-profile-stat"><span>{physical.foot}</span><small>Ayak (tahmini)</small></div>
        </div>
      )}

      {stats ? (
        <div className="team-profile-stat-row">
          <div className="team-profile-stat"><span>{stats.goals}</span><small>Gol</small></div>
          <div className="team-profile-stat"><span>{stats.assists}</span><small>Asist</small></div>
          <div className="team-profile-stat"><span>{stats.yellows}</span><small>Sarı Kart</small></div>
          <div className="team-profile-stat"><span>{stats.reds}</span><small>Kırmızı Kart</small></div>
          {goalRank && (
            <div className="team-profile-stat"><span>#{goalRank}</span><small>Gol Kralı Sırası</small></div>
          )}
        </div>
      ) : (
        <div className="stats-callout">
          Bu oyuncu için henüz simülasyon istatistiği yok -- önce{" "}
          <Link to={`/${competitionKey}/fikstur`}>Fikstür sayfasından</Link> bir model tahmini üretilmeli.
          {!hasFixture && " (önce kura/sezon başlatılmalı)"}
        </div>
      )}

      {stats && (
        <div className="chart-card">
          <h3>Oyuncu Profili</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius={110}>
              <PolarGrid stroke={CHART_GRID} />
              <PolarAngleAxis dataKey="axis" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <PolarRadiusAxis stroke={CHART_GRID} tick={{ fill: CHART_AXIS, fontSize: 10 }} domain={[0, 99]} />
              <Radar dataKey="value" name={player.name} stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {eventHistory.length > 0 && (
        <div className="chart-card chart-card-wide">
          <h3>Sezon Olayları ({eventHistory.length})</h3>
          <div className="player-profile-events">
            {eventHistory.map((ev, i) => (
              <Link key={i} to={`/${competitionKey}/mac/${ev.matchId}`} className="player-profile-event-row">
                <span className="player-profile-event-type">{EVENT_TYPE_LABEL[ev.type]}</span>
                <span className="player-profile-event-minute">{ev.minute}'</span>
                <span className="player-profile-event-md">{ev.matchdayNumber}. Hafta</span>
                <span className="player-profile-event-opp">
                  <Crest team={ev.opponent} size={16} /> vs {ev.opponent.short}
                </span>
                {ev.assist && <span className="player-profile-event-assist">asist: {ev.assist.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="footnote">
        Uyruk/mevki/güç puanı gerçek kulüp kadrolarına yakın seçilmiştir ancak transfer/güncellik
        garantisi yoktur; boy/kilo/yaş/ayak tercihi ve gol/asist/kart istatistikleri gerçek sezon
        verisi DEĞİLDİR, bu simülatörün tahmin motoruna göre üretilmiştir.
      </p>
    </div>
  );
}

import React, { useMemo, useState } from "react";
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
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import SortableTable from "./SortableTable.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import PlayerHeatmap from "./PlayerHeatmap.jsx";
import PlayerAvatar from "../PlayerAvatar.jsx";
import { CHART_SERIES, POSITION_COLORS, CHART_GRID, CHART_AXIS } from "../../utils/chartTheme.js";
import { topScorers, topCarded, allPlayersWithStats, positionCounts } from "../../utils/statsSelectors.js";

export default function PlayersTab({ competition, simulation, selectedTeam, competitionKey }) {
  const { teams, getAllPlayers, positionLabels } = competition;
  const allPlayers = useMemo(() => getAllPlayers(), [getAllPlayers]);
  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);

  const scopedPlayers = useMemo(
    () => (selectedTeam ? allPlayers.filter((p) => p.teamId === selectedTeam.id) : allPlayers),
    [allPlayers, selectedTeam]
  );

  const playerStats = simulation?.playerStats;
  const scorers = useMemo(() => topScorers(scopedPlayers, playerStats, 12), [scopedPlayers, playerStats]);
  const carded = useMemo(() => topCarded(scopedPlayers, playerStats, 12), [scopedPlayers, playerStats]);
  const rows = useMemo(
    () => allPlayersWithStats(teams, scopedPlayers, playerStats),
    [teams, scopedPlayers, playerStats]
  );
  const posCounts = useMemo(() => positionCounts(scopedPlayers), [scopedPlayers]);
  const [selectedId, setSelectedId] = useState(() => allPlayers[0]?.id);
  const scopeLabel = selectedTeam ? selectedTeam.name : null;

  const posData = Object.entries(posCounts).map(([pos, count]) => ({
    pos,
    label: positionLabels[pos],
    count,
  }));

  const selectedPlayer = rows.find((p) => p.id === selectedId) || rows[0];
  const maxGoals = Math.max(1, ...rows.map((p) => p.goals || 0));
  const maxAssists = Math.max(1, ...rows.map((p) => p.assists || 0));
  const maxContribution = Math.max(1, ...rows.map((p) => (p.goals || 0) + (p.assists || 0)));

  const radarData = selectedPlayer
    ? [
        { axis: "Güç Puanı", value: selectedPlayer.rating },
        { axis: "Gol", value: Math.round(((selectedPlayer.goals || 0) / maxGoals) * 99) },
        { axis: "Asist", value: Math.round(((selectedPlayer.assists || 0) / maxAssists) * 99) },
        {
          axis: "Takım Gücü",
          value: Math.round(((teamById[selectedPlayer.teamId]?.coeff || 0) / 136) * 99),
        },
        {
          axis: "Skor Katkısı",
          value: Math.round((((selectedPlayer.goals || 0) + (selectedPlayer.assists || 0)) / maxContribution) * 99),
        },
      ]
    : [];

  return (
    <div className="stats-grid">
      {!simulation && (
        <div className="stats-callout chart-card-wide">
          Gol/asist/kart istatistikleri için önce Fikstür &amp; Tahmin sayfasından bir
          model tahmini oluşturulmalı. Aşağıdaki kadro ve mevki verileri her
          zaman gösterilir.
        </div>
      )}

      {selectedTeam && (
        <div className="stats-callout chart-card-wide">
          <b>{selectedTeam.name}</b> kadrosuna göre filtrelendi — aşağıdaki tüm
          grafik ve tablolar sadece bu takımın oyuncularını gösteriyor.
        </div>
      )}

      {simulation && (
        <div className="chart-card">
          <h3>{scopeLabel ? `${scopeLabel} — Gol Kralı` : "Simülasyonda Gol Kralı (İlk 12)"}</h3>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={scorers} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="goals" name="Gol" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {scorers.map((p) => (
                  <Cell key={p.id} fill={POSITION_COLORS[p.position]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {simulation && carded.length > 0 && (
        <div className="chart-card">
          <h3>Sarı/Kırmızı Kart Sıralaması (İlk {carded.length})</h3>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={carded} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ color: CHART_AXIS }} />
              <Bar dataKey="yellows" name="Sarı Kart" fill="#c98500" radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="reds" name="Kırmızı Kart" fill="#e66767" radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="chart-card">
        <h3>Kadro Havuzunda Mevki Dağılımı</h3>
        <ResponsiveContainer width="100%" height={420}>
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ color: CHART_AXIS }} />
            <Pie
              data={posData}
              dataKey="count"
              nameKey="label"
              innerRadius={70}
              outerRadius={130}
              paddingAngle={2}
            >
              {posData.map((d) => (
                <Cell key={d.pos} fill={POSITION_COLORS[d.pos]} stroke="var(--bg-panel)" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Oyuncu Profili</h3>
        <div className="player-profile-head">
          <PlayerAvatar player={selectedPlayer} size={52} />
          <div>
            <div className="player-profile-name">{selectedPlayer?.name}</div>
            <div className="player-profile-meta">
              {selectedPlayer?.teamName} · {positionLabels[selectedPlayer?.position]} ·{" "}
              {selectedPlayer?.nationality}
            </div>
          </div>
        </div>
        <select
          className="player-select"
          value={selectedPlayer?.id || ""}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {rows.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.teamShort})
            </option>
          ))}
        </select>
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={radarData} outerRadius={110}>
            <PolarGrid stroke={CHART_GRID} />
            <PolarAngleAxis dataKey="axis" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <PolarRadiusAxis stroke={CHART_GRID} tick={{ fill: CHART_AXIS, fontSize: 10 }} domain={[0, 99]} />
            <Radar dataKey="value" name={selectedPlayer?.name} stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <PlayerHeatmap rows={rows} positionLabels={positionLabels} />

      <div className="chart-card chart-card-wide">
        <h3>Tüm Oyuncular ({rows.length})</h3>
        <SortableTable
          rowKey={(r) => r.id}
          defaultSortKey={simulation ? "goals" : "rating"}
          columns={[
            {
              key: "name",
              label: "Oyuncu",
              render: (p) => (
                <Link to={`/${competitionKey}/oyuncu/${p.id}`} className="table-player-cell">
                  <PlayerAvatar player={p} size={26} />
                  {p.name}
                </Link>
              ),
            },
            { key: "teamName", label: "Takım" },
            { key: "position", label: "Mevki", render: (p) => positionLabels[p.position] },
            { key: "nationality", label: "Uyruk" },
            { key: "rating", label: "Güç" },
            { key: "goals", label: "Gol", render: (p) => p.goals ?? 0 },
            { key: "assists", label: "Asist", render: (p) => p.assists ?? 0 },
            { key: "yellows", label: "Sarı", render: (p) => p.yellows ?? 0 },
            { key: "reds", label: "Kırmızı", render: (p) => p.reds ?? 0 },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
}

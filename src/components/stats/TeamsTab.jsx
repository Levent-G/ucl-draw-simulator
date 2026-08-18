import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts";
import Crest from "../Crest.jsx";
import SortableTable from "./SortableTable.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../../utils/chartTheme.js";
import { teamsByCoeffDesc, teamsWithSimPoints } from "../../utils/statsSelectors.js";

function potAverages(teams) {
  const pots = [...new Set(teams.map((t) => t.pot).filter(Boolean))].sort((a, b) => a - b);
  if (pots.length === 0) return [];
  const sums = {};
  const counts = {};
  for (const t of teams) {
    if (!t.pot) continue;
    sums[t.pot] = (sums[t.pot] || 0) + t.coeff;
    counts[t.pot] = (counts[t.pot] || 0) + 1;
  }
  return pots.map((p) => ({
    pot: p,
    label: `Torba ${p}`,
    avg: Math.round((sums[p] / counts[p]) * 10) / 10,
  }));
}

export default function TeamsTab({ competition, simulation, selectedTeam }) {
  const { teams, countryNames } = competition;
  const allByCoeff = useMemo(() => teamsByCoeffDesc(teams), [teams]);
  const topByCoeff = useMemo(() => allByCoeff.slice(0, 15), [allByCoeff]);
  const pots = useMemo(() => potAverages(teams), [teams]);
  const teamsWithSim = useMemo(() => teamsWithSimPoints(teams, simulation?.standings), [teams, simulation]);
  const hasPots = pots.length > 0;

  const selectedInfo = useMemo(() => {
    if (!selectedTeam) return null;
    const coeffRank = allByCoeff.findIndex((t) => t.id === selectedTeam.id) + 1;
    const withSim = teamsWithSim.find((t) => t.id === selectedTeam.id);
    return { coeffRank, ...withSim };
  }, [selectedTeam, allByCoeff, teamsWithSim]);

  const tableRows = selectedTeam ? teamsWithSim.filter((t) => t.id === selectedTeam.id) : teamsWithSim;

  return (
    <div className="stats-grid">
      {selectedInfo && (
        <div className="chart-card chart-card-wide team-profile-card">
          <Crest team={selectedTeam} size={48} />
          <div className="team-profile-info">
            <div className="team-profile-name">{selectedTeam.name}</div>
            <div className="team-profile-meta">
              {countryNames[selectedTeam.country] || selectedTeam.country}
              {selectedTeam.pot ? ` · Torba ${selectedTeam.pot}` : ""} · Katsayı sırası #{selectedInfo.coeffRank}
            </div>
          </div>
          <div className="team-profile-stats">
            <div>
              <span className="team-profile-stat-value">{selectedTeam.coeff}</span>
              <span className="team-profile-stat-label">Katsayı</span>
            </div>
            <div>
              <span className="team-profile-stat-value">{selectedInfo.simPoints ?? "–"}</span>
              <span className="team-profile-stat-label">Sim. Puan</span>
            </div>
            <div>
              <span className="team-profile-stat-value">{selectedInfo.simRank ?? "–"}</span>
              <span className="team-profile-stat-label">Sim. Sıra</span>
            </div>
            {selectedInfo.statusLabel && (
              <span className={`status-badge status-tone-${selectedInfo.statusTone}`}>
                {selectedInfo.statusLabel}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="chart-card">
        <h3>Katsayıya Göre En Güçlü {topByCoeff.length} Takım</h3>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={topByCoeff} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="short"
              width={54}
              stroke={CHART_AXIS}
              tick={{ fill: CHART_AXIS, fontSize: 12 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="coeff" name="Katsayı" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {topByCoeff.map((t) => (
                <Cell
                  key={t.id}
                  fill={selectedTeam && t.id === selectedTeam.id ? "#fbbf24" : CHART_SERIES[0]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hasPots && (
        <div className="chart-card">
          <h3>Torba Başına Ortalama Katsayı</h3>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={pots}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="avg" name="Ortalama Katsayı" radius={[4, 4, 0, 0]} maxBarSize={64}>
                {pots.map((entry, i) => (
                  <Cell key={entry.pot} fill={CHART_SERIES[i % CHART_SERIES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {simulation && (
        <div className={`chart-card ${hasPots ? "chart-card-wide" : ""}`}>
          <h3>Katsayı vs. Simüle Edilmiş Puan</h3>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 12, right: 24, bottom: 12, left: 0 }}>
              <CartesianGrid stroke={CHART_GRID} />
              <XAxis
                type="number"
                dataKey="coeff"
                name="Katsayı"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="simPoints"
                name="Simüle Puan"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 12 }}
              />
              <ZAxis range={[80, 80]} />
              <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ color: CHART_AXIS }} />
              {hasPots ? (
                pots.map((p, i) => (
                  <Scatter
                    key={p.pot}
                    name={p.label}
                    data={teamsWithSim.filter((t) => t.pot === p.pot)}
                    fill={CHART_SERIES[i % CHART_SERIES.length]}
                  />
                ))
              ) : (
                <Scatter name="Takımlar" data={teamsWithSim} fill={CHART_SERIES[0]} />
              )}
              {selectedTeam && selectedInfo?.simPoints != null && (
                <Scatter
                  name={selectedTeam.name}
                  data={[selectedInfo]}
                  fill="#fbbf24"
                  shape="star"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="chart-card chart-card-wide">
        <h3>{selectedTeam ? selectedTeam.name : `Tüm Takımlar (${teams.length})`}</h3>
        <SortableTable
          rowKey={(r) => r.id}
          defaultSortKey="coeff"
          columns={[
            {
              key: "name",
              label: "Takım",
              render: (t) => (
                <span className="table-team-cell">
                  <Crest team={t} size={18} />
                  {t.name}
                </span>
              ),
            },
            {
              key: "country",
              label: "Ülke",
              accessor: (t) => t.country,
              render: (t) => countryNames[t.country] || t.country,
            },
            ...(hasPots ? [{ key: "pot", label: "Torba" }] : []),
            { key: "coeff", label: "Katsayı" },
            {
              key: "simPoints",
              label: "Sim. Puan",
              sortAccessor: (t) => t.simPoints ?? -1,
              render: (t) => t.simPoints ?? "–",
            },
            {
              key: "simRank",
              label: "Sim. Sıra",
              sortAccessor: (t) => (t.simRank == null ? 999 : t.simRank),
              render: (t) => t.simRank ?? "–",
            },
            {
              key: "status",
              label: "Durum",
              sortAccessor: (t) => t.status || "",
              render: (t) =>
                t.statusLabel ? (
                  <span className={`status-pill status-tone-${t.statusTone}`}>{t.statusLabel}</span>
                ) : (
                  "–"
                ),
            },
          ]}
          rows={tableRows}
        />
      </div>
    </div>
  );
}

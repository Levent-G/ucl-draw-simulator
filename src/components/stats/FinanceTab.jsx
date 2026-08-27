import React, { useMemo } from "react";
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import Crest from "../Crest.jsx";
import SortableTable from "./SortableTable.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../../utils/chartTheme.js";
import {
  buildFinancialPowerMap,
  buildSquadValueMap,
  estimateCompetitionEarnings,
  describeKnockoutRun,
  formatMoney,
} from "../../utils/financeEngine.js";

export default function FinanceTab({ competition, simulation, knockout, selectedTeam, competitionKey }) {
  const { teams, countryNames } = competition;

  const rows = useMemo(() => {
    const powerMap = buildFinancialPowerMap(teams);
    const valueMap = buildSquadValueMap(competition.getAllPlayers());
    const earningsMap = estimateCompetitionEarnings(competition, simulation, knockout);
    return teams.map((t) => ({
      ...t,
      financialPower: powerMap[t.id] || 0,
      squadValue: valueMap[t.id] || 0,
      earnings: simulation ? earningsMap[t.id] ?? 0 : null,
      knockoutRun: describeKnockoutRun(knockout, t.id),
    }));
  }, [teams, competition, simulation, knockout]);

  const byPower = useMemo(() => [...rows].sort((a, b) => b.financialPower - a.financialPower), [rows]);
  const topByPower = useMemo(() => byPower.slice(0, 15), [byPower]);
  const hasEarnings = simulation != null;
  const topByEarnings = useMemo(
    () => (hasEarnings ? [...rows].sort((a, b) => b.earnings - a.earnings).slice(0, 15) : []),
    [rows, hasEarnings]
  );
  const hasKnockoutColumn = rows.some((r) => r.knockoutRun != null);

  const tableRows = selectedTeam ? rows.filter((r) => r.id === selectedTeam.id) : rows;

  return (
    <div className="stats-grid">
      <div className="chart-card">
        <h3>En Yüksek Mali Güce Sahip {topByPower.length} Takım</h3>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={topByPower} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="short"
              width={54}
              stroke={CHART_AXIS}
              tick={{ fill: CHART_AXIS, fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => formatMoney(v)} />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="financialPower" name="Mali Güç" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {topByPower.map((t) => (
                <Cell
                  key={t.id}
                  fill={selectedTeam && t.id === selectedTeam.id ? "#fbbf24" : CHART_SERIES[0]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Mali Güç vs. Kadro Değeri</h3>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 12, right: 24, bottom: 12, left: 0 }}>
            <CartesianGrid stroke={CHART_GRID} />
            <XAxis
              type="number"
              dataKey="financialPower"
              name="Mali Güç"
              stroke={CHART_AXIS}
              tick={{ fill: CHART_AXIS, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="squadValue"
              name="Kadro Değeri"
              stroke={CHART_AXIS}
              tick={{ fill: CHART_AXIS, fontSize: 12 }}
            />
            <ZAxis range={[80, 80]} />
            <Tooltip content={<ChartTooltip formatter={(v) => formatMoney(v)} />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Takımlar" data={rows} fill={CHART_SERIES[2]} />
            {selectedTeam && (
              <Scatter
                name={selectedTeam.name}
                data={rows.filter((r) => r.id === selectedTeam.id)}
                fill="#fbbf24"
                shape="star"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {hasEarnings && (
        <div className="chart-card chart-card-wide">
          <h3>Bu Sezon En Çok Kazanan {topByEarnings.length} Takım</h3>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={topByEarnings} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="short"
                width={54}
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 12 }}
              />
              <Tooltip
                content={<ChartTooltip formatter={(v) => formatMoney(v)} />}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="earnings" name="Sezon Kazancı" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {topByEarnings.map((t) => (
                  <Cell
                    key={t.id}
                    fill={selectedTeam && t.id === selectedTeam.id ? "#fbbf24" : CHART_SERIES[4]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="chart-card chart-card-wide">
        <h3>{selectedTeam ? selectedTeam.name : `Tüm Takımlar (${teams.length})`}</h3>
        <SortableTable
          rowKey={(r) => r.id}
          defaultSortKey="financialPower"
          columns={[
            {
              key: "name",
              label: "Takım",
              render: (t) => (
                <Link to={`/${competitionKey}/takim/${t.id}`} className="table-team-cell">
                  <Crest team={t} size={18} />
                  {t.name}
                </Link>
              ),
            },
            {
              key: "country",
              label: "Ülke",
              accessor: (t) => t.country,
              render: (t) => countryNames[t.country] || t.country,
            },
            {
              key: "financialPower",
              label: "Mali Güç",
              render: (t) => formatMoney(t.financialPower),
            },
            {
              key: "squadValue",
              label: "Kadro Değeri",
              render: (t) => formatMoney(t.squadValue),
            },
            ...(hasEarnings
              ? [
                  {
                    key: "earnings",
                    label: "Bu Sezon Kazanç",
                    sortAccessor: (t) => t.earnings ?? -1,
                    render: (t) => formatMoney(t.earnings),
                  },
                ]
              : []),
            ...(hasKnockoutColumn
              ? [
                  {
                    key: "knockoutRun",
                    label: "Ulaşılan Tur",
                    sortAccessor: (t) => t.knockoutRun || "",
                    render: (t) => t.knockoutRun || "–",
                  },
                ]
              : []),
          ]}
          rows={tableRows}
        />
      </div>

      <p className="footnote">
        Mali güç, kadro değeri ve sezon kazancı TAMAMEN KURGUSALDIR — gerçek
        kulüp bilançolarını yansıtmaz. Katsayı ve oyuncu reytinglerinden
        türetilen eğlence amaçlı bir tahmindir; sezon kazancı sadece bir model
        tahmini/eleme turu üretildikten sonra hesaplanabilir.
      </p>
    </div>
  );
}

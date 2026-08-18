import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Crest from "../Crest.jsx";
import SortableTable from "./SortableTable.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../../utils/chartTheme.js";
import { countryAggregates } from "../../utils/statsSelectors.js";

export default function CountriesTab({ competition }) {
  const { teams, countryNames } = competition;
  const countries = useMemo(() => countryAggregates(teams, countryNames), [teams, countryNames]);
  const hasPots = teams.some((t) => t.pot);
  const singleCountry = countries.length <= 1;

  const byTeamCount = useMemo(
    () => [...countries].sort((a, b) => b.teamCount - a.teamCount || b.totalCoeff - a.totalCoeff),
    [countries]
  );
  const byCoeff = useMemo(() => [...countries].sort((a, b) => b.totalCoeff - a.totalCoeff), [countries]);
  const stackedData = useMemo(
    () =>
      countries.map((c) => ({
        name: c.name,
        1: c.potCounts[1],
        2: c.potCounts[2],
        3: c.potCounts[3],
        4: c.potCounts[4],
      })),
    [countries]
  );

  if (singleCountry) {
    return (
      <div className="stats-grid">
        <div className="stats-callout chart-card-wide">
          Bu yarışma tek bir ülkenin kulüplerinden oluştuğu için "ülke bazlı"
          karşılaştırma anlamlı değil — takım ve oyuncu sekmelerindeki
          grafikleri inceleyebilirsin.
        </div>
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <div className="chart-card">
        <h3>Ülke Başına Takım Sayısı</h3>
        <ResponsiveContainer width="100%" height={460}>
          <BarChart data={byTeamCount} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              stroke={CHART_AXIS}
              tick={{ fill: CHART_AXIS, fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="teamCount" name="Takım Sayısı" fill={CHART_SERIES[0]} radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Ülke Başına Toplam Katsayı</h3>
        <ResponsiveContainer width="100%" height={460}>
          <BarChart data={byCoeff} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              stroke={CHART_AXIS}
              tick={{ fill: CHART_AXIS, fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="totalCoeff" name="Toplam Katsayı" fill={CHART_SERIES[1]} radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hasPots && (
        <div className="chart-card chart-card-wide">
          <h3>Ülke Başına Torba Dağılımı</h3>
          <ResponsiveContainer width="100%" height={440}>
            <BarChart data={stackedData} margin={{ bottom: 60 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="name"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_AXIS, fontSize: 10 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis allowDecimals={false} stroke={CHART_AXIS} tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ color: CHART_AXIS }} formatter={(v) => `Torba ${v}`} />
              {[1, 2, 3, 4].map((pot, i) => (
                <Bar
                  key={pot}
                  dataKey={pot}
                  name={`Torba ${pot}`}
                  stackId="pot"
                  fill={CHART_SERIES[i]}
                  radius={pot === 4 ? [4, 4, 0, 0] : 0}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="chart-card chart-card-wide">
        <h3>Tüm Ülkeler ({countries.length})</h3>
        <SortableTable
          rowKey={(r) => r.country}
          defaultSortKey="totalCoeff"
          columns={[
            { key: "name", label: "Ülke" },
            { key: "teamCount", label: "Takım Sayısı" },
            {
              key: "totalCoeff",
              label: "Toplam Katsayı",
              render: (c) => Math.round(c.totalCoeff * 10) / 10,
            },
            {
              key: "avgCoeff",
              label: "Ortalama Katsayı",
              render: (c) => Math.round(c.avgCoeff * 10) / 10,
            },
            {
              key: "strongestTeam",
              label: "En Güçlü Takım",
              sortAccessor: (c) => c.strongestTeam?.coeff || 0,
              render: (c) => (
                <span className="table-team-cell">
                  <Crest team={c.strongestTeam} size={18} />
                  {c.strongestTeam?.name}
                </span>
              ),
            },
          ]}
          rows={countries}
        />
      </div>
    </div>
  );
}

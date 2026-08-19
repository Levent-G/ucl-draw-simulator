import React, { useMemo, useState } from "react";
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
import {
  SUPER_LIG_LIVE_ASOF,
  SUPER_LIG_LIVE_STANDINGS,
  SUPER_LIG_LIVE_RESULTS,
  UCL_SEASON_STATUS,
  EUROPA_SEASON_STATUS,
} from "../data/liveStatus.js";
import Crest from "../components/Crest.jsx";
import ChartTooltip from "../components/stats/ChartTooltip.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";

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

function SeasonNotStarted({ competitionKey, status }) {
  const competition = getCompetition(competitionKey);
  return (
    <div className="empty-card live-not-started">
      <h2>Lig fazı henüz başlamadı</h2>
      <p>
        {competition.name} 2026-27 sezonu lig fazı <b>{status.phaseStart}</b>{" "}
        tarihinde başlıyor.
      </p>
      {status.note && <p className="live-not-started-note">{status.note}</p>}
      <p className="live-not-started-note">
        Gerçek sonuçlar başladığında bu sayfa güncellenecek. Bu arada
        yukarıdaki menüden kendi kura çekimini/simülasyonunu çalıştırabilirsin.
      </p>
    </div>
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

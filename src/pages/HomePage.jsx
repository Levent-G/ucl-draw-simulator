import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TEAMS } from "../data/teams.js";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport, getRealStandings, getRealFixture } from "../utils/realStandingsSelectors.js";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import { getCompetition } from "../data/competitions.js";
import Crest from "../components/Crest.jsx";
import CompetitionIcon from "../components/CompetitionIcon.jsx";
import logoFull from "../assets/logo-full-transparent.png";
import TeamAxisTick from "../components/stats/TeamAxisTick.jsx";
import ChartTooltip from "../components/stats/ChartTooltip.jsx";
import { CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";
import { useReveal, useCountUp } from "../hooks/useReveal.js";

// Site artık BİRİNCİL olarak gerçek UCL/Süper Lig verisi sunuyor (kura
// çekimi/sezon simülasyonu ikinci plana alındı, bkz. Eğlence Modu) --
// kullanıcı geri bildirimi: "bizimki kura çekimi uygulaması değil futbol
// uygulaması, ana sayfa direkt UCL/Süper Lig'e yollamalı". Bu yüzden ana
// sayfanın birincil akışı SADECE gerçek veri destekli yarışmaları (bkz.
// hasRealDataSupport) gösterir; kura çekimi/simülasyon isteyenler için ayrı,
// açıkça etiketli bir "🎮 Eğlence Modu" bölümü var.
const REAL_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));

const COMPETITION_ICONS = { ucl: "🏆", europa: "🌟", superlig: "🇹🇷" };

// Kullanıcı geri bildirimi (3. tur): "kart ızgarası hâlâ herkesin kullandığı
// AI şablonu gibi duruyor, FARKLI bir şey yap". Izgara/kart yapısını
// TAMAMEN bırakıp yatayda kayan bir "çip şeridi"ne geçildi -- bir dashboard
// değil, bir skor bandı/ticker hissi (bkz. .home-chip-strip).
const QUICK_LINKS = [
  { icon: "📅", title: "Gerçek Fikstür", to: "/ucl/fikstur" },
  { icon: "📡", title: "Canlı Skorlar", to: "/canli" },
  { icon: "🏆", title: "Tahmin Ligi", to: "/tahmin-ligi" },
  { icon: "🤝", title: "Karşılıklı Geçmiş", to: "/ucl/karsilikli" },
  { icon: "🔎", title: "Takım & Oyuncu Ara", to: "/ucl" },
  { icon: "🏅", title: "Başarılar", to: "/basarilar" },
  { icon: "⭐", title: "Rüya Takım", to: "/ruya-takim" },
  { icon: "🎮", title: "Eğlence Modu", to: "/eglence-modu" },
];

const STATS = [
  { n: 2, suffix: "", label: "Gerçek Lig" },
  { n: 50, suffix: "+", label: "Takım" },
];

// Hero arka planındaki amblem şeridi -- her açılışta rastgele bir dilim
// (gerçek logo/telifsiz özgün amblemler, zaten sitenin her yerinde
// kullanılan aynı Crest bileşeni ile).
function CrestMarquee() {
  const sample = useMemo(() => {
    const shuffled = [...TEAMS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 16);
  }, []);
  return (
    <div className="home-marquee" aria-hidden="true">
      <div className="home-marquee-track">
        {[...sample, ...sample].map((t, i) => (
          <span className="home-marquee-item" key={`${t.id}-${i}`}>
            <Crest team={t} size={34} />
          </span>
        ))}
      </div>
    </div>
  );
}

// Sayaç gibi 0'dan hedefe sayan istatistik -- görünür olana kadar beklenir.
function StatCounter({ n, suffix, label, visible, delay }) {
  const value = useCountUp(n, visible, 1200);
  return (
    <div className={`broadcast-stat broadcast-in ${visible ? "is-in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      <span className="broadcast-stat-n">
        {value}
        {suffix}
      </span>
      <span className="broadcast-stat-label">{label}</span>
    </div>
  );
}

// Üstteki canlı "skor bandı" -- gerçek liderlik verisinden üretilen kısa
// metin parçaları sonsuz döngüde kayar (haber kanalı alt bandı hissi).
function useTickerItems() {
  return useMemo(() => {
    const items = [];
    for (const comp of REAL_COMPETITIONS) {
      const { standings, started } = getRealStandings(comp.key);
      if (!started) continue;
      const sorted = [...(standings || [])].sort((a, b) => a.rank - b.rank);
      const leader = sorted[0];
      if (!leader) continue;
      const teamById = Object.fromEntries(getCompetition(comp.key).teams.map((t) => [t.id, t]));
      const team = teamById[leader.teamId];
      if (!team) continue;
      items.push(`${COMPETITION_ICONS[comp.key] || "⚽"} ${comp.shortName} ZİRVESİ: ${team.name.toUpperCase()} · ${leader.pts} PUAN`);

      const fixture = getRealFixture(comp.key);
      for (const md of fixture || []) {
        const m = md.matches.find((x) => !isMatchPlayed(x));
        if (m) {
          items.push(`🔮 SIRADAKİ: ${m.homeTeam.short} — ${m.awayTeam.short} · ${formatMatchDate(m.date) || ""}`);
          break;
        }
      }
    }
    if (items.length === 0) items.push("⚽ SÜPER ANALİZ — GERÇEK VERİ, GERÇEK ANALİZ");
    return items;
  }, []);
}

// İki yarışma kartı artık yan yana bir ızgarada DEĞİL, hafif döndürülmüş,
// üst üste binen bir "deste" gibi duruyor -- üzerine gelinen kart öne çıkıp
// düzleşiyor. Kart ızgarası yerine FARKLI bir kompozisyon (kullanıcı
// geri bildirimi: "farklı tasarımlar kullan").
function CompetitionStackCard({ comp, index, hovered, onHover, onLeave }) {
  const { standings, started } = getRealStandings(comp.key);
  const teamById = useMemo(
    () => Object.fromEntries(getCompetition(comp.key).teams.map((t) => [t.id, t])),
    [comp.key]
  );
  const teamByShort = useMemo(
    () => Object.fromEntries(getCompetition(comp.key).teams.map((t) => [t.short, t])),
    [comp.key]
  );
  const sortedStandings = useMemo(
    () => (started ? [...(standings || [])].sort((a, b) => a.rank - b.rank) : []),
    [standings, started]
  );
  const leader = sortedStandings[0] || null;
  const leaderTeam = leader ? teamById[leader.teamId] : null;

  const nextMatch = useMemo(() => {
    const fixture = getRealFixture(comp.key);
    for (const md of fixture || []) {
      const m = md.matches.find((x) => !isMatchPlayed(x));
      if (m) return m;
    }
    return null;
  }, [comp.key]);

  const topAttack = useMemo(() => {
    return sortedStandings
      .filter((s) => s.played > 0)
      .map((s) => ({ ...s, team: teamById[s.teamId], short: teamById[s.teamId]?.short }))
      .filter((s) => s.team)
      .sort((a, b) => b.gf - a.gf)
      .slice(0, 4);
  }, [sortedStandings, teamById]);

  const isHovered = hovered === index;
  const isOther = hovered !== null && hovered !== index;
  const baseRotate = index === 0 ? -6 : 5;
  const baseX = index === 0 ? -18 : 18;

  return (
    <Link
      to={`/${comp.key}`}
      className={`stack-card ${isHovered ? "is-hovered" : ""} ${isOther ? "is-other" : ""}`}
      style={{
        "--base-rotate": `${baseRotate}deg`,
        "--base-x": `${baseX}px`,
        zIndex: isHovered ? 5 : 2 - index,
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
    >
      <div className="stack-card-head">
        <span className="stack-card-icon"><CompetitionIcon competition={comp} size={24} /></span>
        <div className="stack-card-headline">
          <span className="stack-card-name">{comp.shortName}</span>
          <span className="stack-card-live"><span className="bento-live-dot" aria-hidden="true" /> Gerçek Veri</span>
        </div>
      </div>

      {leaderTeam ? (
        <div className="stack-card-leader">
          <Crest team={leaderTeam} size={28} />
          <div className="stack-card-leader-text">
            <span className="stack-card-leader-label">Zirvede</span>
            <span className="stack-card-leader-name">{leaderTeam.name}</span>
          </div>
          <span className="stack-card-leader-pts">{leader.pts} P</span>
        </div>
      ) : (
        <p className="bento-comp-tagline">Sezona hazır, ilk maçlar yakında.</p>
      )}

      {topAttack.length > 0 && (
        <div className="stack-card-chart">
          <ResponsiveContainer width="100%" height={92}>
            <BarChart data={topAttack} layout="vertical" margin={{ left: 4, right: 14, top: 2, bottom: 2 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="short"
                width={50}
                stroke={CHART_AXIS}
                tick={(props) => <TeamAxisTick {...props} teamsByKey={teamByShort} fill={CHART_AXIS} imgSize={12} fontSize={9.5} />}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="gf" name="Attığı Gol" radius={[0, 4, 4, 0]} maxBarSize={9} fill="var(--accent-bright)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {nextMatch && (
        <div className="stack-card-next">
          <Crest team={nextMatch.homeTeam} size={16} /> {nextMatch.homeTeam.short}
          <span className="bento-comp-next-vs">–</span>
          {nextMatch.awayTeam.short} <Crest team={nextMatch.awayTeam} size={16} />
        </div>
      )}

      <span className="stack-card-cta">{comp.shortName}'e Git →</span>
    </Link>
  );
}

export default function HomePage() {
  const tickerItems = useTickerItems();
  const [heroRef, heroVisible] = useReveal(0.05);
  const [stackRef, stackVisible] = useReveal(0.2);
  const [chipRef, chipVisible] = useReveal(0.2);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="page-shell home-page home-page-broadcast">
      <section className="broadcast-hero" ref={heroRef}>
        <span className="home-hero-aurora home-hero-aurora-1" aria-hidden="true" />
        <span className="home-hero-aurora home-hero-aurora-2" aria-hidden="true" />
        <span className="home-hero-aurora home-hero-aurora-3" aria-hidden="true" />
        <CrestMarquee />

        <div className="broadcast-hero-inner broadcast-hero-split">
          <div className={`broadcast-hero-logo-col broadcast-in ${heroVisible ? "is-in" : ""}`}>
            <img src={logoFull} alt="Süper Analiz — Türkiye Futbol Veri Merkezi" className="broadcast-logo-full" />
          </div>
          <div className="broadcast-hero-text-col">
            <h1 className="sr-only">Süper Analiz — Türkiye Futbol Veri Merkezi</h1>
            <div className={`page-eyebrow broadcast-in ${heroVisible ? "is-in" : ""}`} style={{ transitionDelay: "60ms" }}>
              UEFA Şampiyonlar Ligi · Trendyol Süper Lig
            </div>
            <p className={`home-hero-sub broadcast-in ${heroVisible ? "is-in" : ""}`} style={{ transitionDelay: "200ms" }}>
              Gerçek fikstür, güncel puan durumu, canlı skorlar, derinlemesine istatistiksel analiz ve
              arkadaşlarınla oynayabileceğin bir Tahmin Ligi -- hepsi tek bir sitede.
            </p>
            <div className={`home-hero-actions broadcast-in ${heroVisible ? "is-in" : ""}`} style={{ transitionDelay: "280ms" }}>
              <Link to="/ucl" className="btn-primary home-hero-btn home-hero-btn-shine">
                <span className="home-hero-btn-shine-sweep" aria-hidden="true" />
                <span className="home-hero-btn-icon"><CompetitionIcon competition={getCompetition("ucl")} size={18} /></span>
                UCL'ye Git →
              </Link>
              <Link to="/superlig" className="btn-secondary home-hero-btn">
                <span className="home-hero-btn-icon"><CompetitionIcon competition={getCompetition("superlig")} size={18} /></span>
                Süper Lig'e Git →
              </Link>
            </div>
            <div className="broadcast-stats">
              {STATS.map((s, i) => (
                <StatCounter key={s.label} {...s} visible={heroVisible} delay={340 + i * 90} />
              ))}
            </div>
          </div>
        </div>

        {/* Canlı skor bandı -- haber kanalı alt bandı gibi sonsuz kayan gerçek veri */}
        <div className="broadcast-ticker" aria-hidden="true">
          <div className="broadcast-ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span className="broadcast-ticker-item" key={i}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-stack-section" ref={stackRef}>
        <div className="home-bento-head">
          <span className="home-analytics-preview-eyebrow">📈 Sadece Skor Değil</span>
          <h2 className="home-section-title">Gerçek Verinin Analizi, Anında</h2>
          <p className="home-cat-desc">
            Diğer uygulamalardan farkımız bu: sadece skor değil, o skorun arkasındaki hikayeyi de gösteriyoruz --
            gerçek sonuçlardan türetilen grafikler, model tahminleri ve derinlemesine istatistikler.
          </p>
        </div>
        <div className={`stack-deck ${stackVisible ? "is-in" : ""}`}>
          {REAL_COMPETITIONS.map((comp, i) => (
            <CompetitionStackCard
              key={comp.key}
              comp={comp}
              index={i}
              hovered={hovered}
              onHover={setHovered}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>
      </section>

      <section className="home-chips-section" ref={chipRef}>
        <h2 className="home-section-title home-chips-title">Keşfet</h2>
        <div className={`home-chip-strip ${chipVisible ? "is-in" : ""}`}>
          {QUICK_LINKS.map((l, i) => (
            <Link key={l.title} to={l.to} className="home-chip" style={{ transitionDelay: `${i * 45}ms` }}>
              <span className="home-chip-icon" aria-hidden="true">{l.icon}</span>
              {l.title}
            </Link>
          ))}
        </div>
      </section>

      <p className="footnote home-footnote">
        UCL ve Süper Lig sayfalarındaki fikstür, puan durumu, sonuçlar, haberler ve analizler GERÇEK veridir
        (statik bir anlık görüntü -- bkz. her sayfadaki güncelleme notu). Sadece "🎮 Eğlence Modu" (kura çekimi,
        sezon simülasyonu, Avrupa Ligi, Rüya Takım, oyuncu istatistikleri) kurgusaldır ve bir Poisson tabanlı
        model tarafından üretilir.
      </p>
    </div>
  );
}

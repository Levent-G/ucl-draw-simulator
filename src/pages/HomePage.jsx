import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { TEAMS } from "../data/teams.js";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport, getRealStandings, getRealFixture } from "../utils/realStandingsSelectors.js";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import { getCompetition } from "../data/competitions.js";
import Crest from "../components/Crest.jsx";

// Site artık BİRİNCİL olarak gerçek UCL/Süper Lig verisi sunuyor (kura
// çekimi/sezon simülasyonu ikinci plana alındı, bkz. Eğlence Modu) --
// kullanıcı geri bildirimi: "bizimki kura çekimi uygulaması değil futbol
// uygulaması, ana sayfa direkt UCL/Süper Lig'e yollamalı". Bu yüzden ana
// sayfanın birincil akışı SADECE gerçek veri destekli yarışmaları (bkz.
// hasRealDataSupport) gösterir; kura çekimi/simülasyon isteyenler için ayrı,
// açıkça etiketli bir "🎮 Eğlence Modu" bölümü var.
const REAL_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));

const COMPETITION_ICONS = { ucl: "🏆", europa: "🌟", superlig: "🇹🇷" };

const CATEGORIES = [
  {
    key: "follow",
    title: "Takip Et & Tahmin Et",
    desc: "Gerçek fikstür, canlı skorlar ve arkadaşlarınla tahmin yarışı.",
    features: [
      {
        icon: "📅",
        title: "Gerçek Fikstür",
        desc: "UCL ve Süper Lig'in gerçek, tarihli fikstürü -- hafta hafta, takım aramalı, takvim görünümlü.",
        to: "/ucl/fikstur",
        cta: "Fikstürü Gör",
        stat: "Haftalık",
      },
      {
        icon: "📡",
        title: "Canlı Skorlar",
        desc: "Gerçek puan durumu ve oynanan haftaların gerçek sonuçları -- kurgusal değil.",
        to: "/canli",
        cta: "Skorları Gör",
        stat: "Güncel",
      },
      {
        icon: "🏆",
        title: "Tahmin Ligi",
        desc: "Arkadaşlarınla bir lig odası kur, her hafta gerçek maçların skorunu tahmin et, en çok puanı toplayan kazansın.",
        to: "/tahmin-ligi",
        cta: "Lig Kur",
        stat: "Arkadaşlarla",
      },
      {
        icon: "📊",
        title: "İstatistik & Analiz",
        desc: "Puan durumu gelişimi, xPTS, form serileri, hücum-savunma matrisi ve daha fazlası -- gerçek sonuçlardan.",
        to: "/ucl/istatistik",
        cta: "Analizi Gör",
        stat: "Grafikler",
      },
    ],
  },
  {
    key: "analyze",
    title: "İncele & Karşılaştır",
    desc: "Takımların geçmişini ve birbirleriyle olan hikayesini keşfet.",
    features: [
      {
        icon: "🤝",
        title: "Karşılıklı Geçmiş",
        desc: "İki takım seç, gerçek Avrupa/derbi geçmişlerini ve model kazanma olasılığını gör.",
        to: "/ucl/karsilikli",
        cta: "Takımları Karşılaştır",
        stat: "H2H",
      },
      {
        icon: "🔎",
        title: "Takım & Oyuncu Profilleri",
        desc: "Navbar'daki arama kutusundan istediğin takımı bul -- gerçek kadro, form ve lig durumu tek sayfada.",
        to: "/ucl",
        cta: "Profillere Göz At",
        stat: "Arama",
      },
      {
        icon: "🏅",
        title: "Başarılar",
        desc: "Siteyi kullandıkça açılan rozetler.",
        to: "/basarilar",
        cta: "Rozetleri Gör",
        stat: "26 Rozet",
      },
    ],
  },
  {
    key: "fun",
    title: "🎮 Eğlence Modu",
    desc: "Gerçek verilerden tamamen ayrı, kurgusal bir simülasyon alanı.",
    features: [
      {
        icon: "🎲",
        title: "Kura Çekimi & Sezon Simülasyonu",
        desc: "UCL, Avrupa Ligi ve Süper Lig için kendi kurani çek, kendi sezonunu simüle et -- hiçbir sonuç gerçek değildir.",
        to: "/eglence-modu",
        cta: "Eğlence Moduna Git",
        stat: "Simülasyon",
      },
      {
        icon: "⭐",
        title: "Rüya Takım",
        desc: "5 dizilişten birini seç, oyuncuları sahada serbestçe sürükle ve kurgusal bir lige gönder.",
        to: "/ruya-takim",
        cta: "Kadromu Kur",
        stat: "Serbest Sürükle",
      },
    ],
  },
];

const STATS = [
  { n: "2", label: "Gerçek Lig" },
  { n: "50+", label: "Takım" },
  { n: "📡", label: "Canlı Puan Durumu" },
  { n: "🏆", label: "Tahmin Ligi" },
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

// Gerçek veri destekli bir yarışma (UCL/Süper Lig) için ana sayfa kartı --
// eski sürüm buraya kura çekimi/sezon simülasyonu durumuna göre ("kura
// çekildi mi, fikstür hazır mı...") bir CTA üretiyordu; bu yarışmalar için
// artık böyle bir durum makinesi YOK (sezon zaten gerçek ve sürüyor). Kart
// artık sadece bir link değil -- lider takım ve sıradaki gerçek maç gibi
// CANLI verilerle "hemen bir şey gösteren" bir önizleme kartı (kullanıcı
// geri bildirimi: sayfaya girince "vay be" dedirtecek kadar veri dolu olsun).
function RealCompetitionCard({ comp }) {
  const { standings, started } = getRealStandings(comp.key);
  const teamById = useMemo(
    () => Object.fromEntries(getCompetition(comp.key).teams.map((t) => [t.id, t])),
    [comp.key]
  );
  const leader = started && standings?.length > 0 ? [...standings].sort((a, b) => a.rank - b.rank)[0] : null;
  const leaderTeam = leader ? teamById[leader.teamId] : null;

  const nextMatch = useMemo(() => {
    const fixture = getRealFixture(comp.key);
    for (const md of fixture || []) {
      const m = md.matches.find((x) => !isMatchPlayed(x));
      if (m) return m;
    }
    return null;
  }, [comp.key]);

  return (
    <Link to={`/${comp.key}`} className="home-comp-card">
      <div className="home-comp-card-top">
        <span className="home-comp-card-icon" aria-hidden="true">
          {COMPETITION_ICONS[comp.key] || "⚽"}
        </span>
        <span className="home-comp-card-status is-active">📡 Gerçek Veri · 2026-27</span>
      </div>
      <div className="home-comp-card-name">{comp.shortName}</div>

      {leaderTeam ? (
        <div className="home-comp-card-live">
          <span className="home-comp-card-live-label">Zirvede</span>
          <span className="home-comp-card-live-team">
            <Crest team={leaderTeam} size={24} />
            {leaderTeam.name}
          </span>
          <span className="home-comp-card-live-pts">{leader.pts} puan</span>
        </div>
      ) : (
        <p className="home-comp-card-tagline">Gerçek fikstür ve kadrolarla sezona hazır, ilk maçlar yakında.</p>
      )}

      {nextMatch && (
        <div className="home-comp-card-live home-comp-card-next">
          <span className="home-comp-card-live-label">Sıradaki Maç</span>
          <span className="home-comp-card-next-teams">
            <Crest team={nextMatch.homeTeam} size={20} /> {nextMatch.homeTeam.short}
            <span className="home-comp-card-next-vs">–</span>
            {nextMatch.awayTeam.short} <Crest team={nextMatch.awayTeam} size={20} />
          </span>
          {formatMatchDate(nextMatch.date) && <span className="home-comp-card-live-pts">{formatMatchDate(nextMatch.date)}</span>}
        </div>
      )}

      <span className="home-comp-card-btn">{comp.shortName}'e Git →</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="page-shell home-page">
      <section className="home-hero">
        <span className="home-hero-aurora home-hero-aurora-1" aria-hidden="true" />
        <span className="home-hero-aurora home-hero-aurora-2" aria-hidden="true" />
        <CrestMarquee />
        <div className="home-hero-content">
          <div className="page-eyebrow home-hero-in" style={{ animationDelay: "0ms" }}>
            UEFA Şampiyonlar Ligi · Trendyol Süper Lig
          </div>
          <h1 className="home-hero-title home-hero-in" style={{ animationDelay: "80ms" }}>
            Futbol Analiz
          </h1>
          <p className="home-hero-sub home-hero-in" style={{ animationDelay: "160ms" }}>
            Gerçek fikstür, güncel puan durumu, canlı skorlar, derinlemesine istatistiksel analiz ve
            arkadaşlarınla oynayabileceğin bir Tahmin Ligi -- hepsi tek bir sitede.
          </p>
          <div className="home-hero-actions home-hero-in" style={{ animationDelay: "240ms" }}>
            <Link to="/ucl" className="btn-primary home-hero-btn home-hero-btn-shine">
              <span className="home-hero-btn-shine-sweep" aria-hidden="true" />
              🏆 UCL'ye Git →
            </Link>
            <Link to="/superlig" className="btn-secondary home-hero-btn">
              🇹🇷 Süper Lig'e Git →
            </Link>
          </div>
          <div className="home-hero-stats home-hero-in" style={{ animationDelay: "320ms" }}>
            {STATS.map((s) => (
              <div className="home-hero-stat" key={s.label}>
                <span className="home-hero-stat-n">{s.n}</span>
                <span className="home-hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-competitions">
        <div className="home-competitions-head">
          <h2 className="home-section-title">Hangi Ligi İncelemek İstiyorsun?</h2>
          <p className="home-cat-desc">
            Gerçek, güncel veri -- kura çekimi ya da kurgusal bir simülasyon değil.
          </p>
        </div>
        <div className="home-comp-grid">
          {REAL_COMPETITIONS.map((comp) => (
            <RealCompetitionCard key={comp.key} comp={comp} />
          ))}
        </div>
        <p className="footnote home-fun-mode-note">
          Kura çekimi ya da kendi sezonunu simüle etmek mi istiyorsun? <Link to="/eglence-modu">🎮 Eğlence Modu'na göz at →</Link>
        </p>
      </section>

      <section className="home-secondary-tools">
        <div className="home-secondary-head">
          <h2 className="home-section-title">Diğer Araçlar</h2>
          <p className="home-cat-desc">
            Ligini seçtikten sonra keşfedebileceğin ek özellikler.
          </p>
        </div>
        {CATEGORIES.map((cat) => (
          <section className={`home-cat home-cat-${cat.key} home-cat-compact`} key={cat.key}>
            <div className="home-cat-head">
              <h3 className="home-cat-title">{cat.title}</h3>
              <p className="home-cat-desc">{cat.desc}</p>
            </div>
            <div className="home-feature-grid home-feature-grid-compact">
              {cat.features.map((f, i) => (
                <Link
                  to={f.to}
                  className={`home-feature-card home-feature-card-compact home-feature-card-in home-feature-card-${cat.key}`}
                  key={f.title}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="home-feature-card-glow" aria-hidden="true" />
                  <div className="home-feature-card-top">
                    <span className="home-feature-icon-badge" aria-hidden="true">
                      {f.icon}
                    </span>
                    {f.stat && <span className="home-feature-stat">{f.stat}</span>}
                  </div>
                  <div className="home-feature-title">{f.title}</div>
                  <p className="home-feature-desc">{f.desc}</p>
                  <span className="home-feature-cta">
                    {f.cta} <span className="home-feature-cta-arrow">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
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

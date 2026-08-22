import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { TEAMS } from "../data/teams.js";
import Crest from "../components/Crest.jsx";

const CATEGORIES = [
  {
    key: "play",
    title: "Simülasyonu Oyna",
    desc: "Kura çekiminden şampiyona giden tüm yolu buradan yönet.",
    features: [
      {
        icon: "🏆",
        title: "Kura Çekimi",
        desc: "UCL, Avrupa Ligi ve Trendyol Süper Lig -- gerçek İsviçre modeli/lig kurallarına sadık, sesli anlatımlı, animasyonlu bir çekiliş töreni.",
        to: "/ucl",
        cta: "Çekilişi Başlat",
        stat: "3 Lig",
      },
      {
        icon: "📡",
        title: "Canlı Skorlar & Tahmin",
        desc: "Gerçek sonuçların yanında kendi tahminini yap: sıralamayı sürükle, skorları kendin gir, gol kralını seç -- eleme turu buna göre anında güncellenir.",
        to: "/canli",
        cta: "Tahminini Yap",
        stat: "Anlık",
      },
      {
        icon: "⚽",
        title: "Maç Merkezi",
        desc: "Herhangi bir maçı seç, ▶ Canlı İzle ile dakika dakika gol/kart/sakatlık akışını gerçek zamanlı gibi takip et -- istersen sesli anlatımı da aç.",
        to: "/ucl/fikstur",
        cta: "Bir Maç İzle",
        stat: "Sesli Anlatım",
      },
      {
        icon: "🎯",
        title: "Taktik Ayarları",
        desc: "Takımlara hücum ağırlıklı ya da defansif bir oyun tarzı ver -- sonuçlar seçimine göre anında yeniden hesaplanır.",
        to: "/ucl/fikstur",
        cta: "Taktik Ver",
        stat: "3 Stil",
      },
    ],
  },
  {
    key: "analyze",
    title: "İncele & Karşılaştır",
    desc: "Sayılar, grafikler ve geçmişin izini sür.",
    features: [
      {
        icon: "📊",
        title: "İstatistikler",
        desc: "Gol kralı, ısı haritası, takım/ülke grafikleri -- tüm kadro ve simülasyon verisi görselleştirilmiş halde.",
        to: "/ucl/istatistik",
        cta: "İstatistiklere Bak",
        stat: "Isı Haritası",
      },
      {
        icon: "🤝",
        title: "Karşılıklı Geçmiş",
        desc: "İki takım seç, bu oturumdaki tüm simülasyonlarda aralarında geçen maçları ve toplu istatistiği gör.",
        to: "/ucl/karsilikli",
        cta: "Takımları Karşılaştır",
        stat: "H2H",
      },
    ],
  },
  {
    key: "build",
    title: "Kendi Takımını Kur",
    desc: "Kadroyu şekillendir, transferleri sen yap.",
    features: [
      {
        icon: "🔁",
        title: "Transfer Merkezi",
        desc: "Animasyonlu transfer haberleri akışını izle, istediğin oyuncuyu istediğin takıma sürükleyerek transfer et.",
        to: "/transferler",
        cta: "Transfer Yap",
        stat: "Sürükle-Bırak",
      },
      {
        icon: "⭐",
        title: "Rüya Takım",
        desc: "5 dizilişten birini seç, oyuncuları sahada istediğin noktaya serbestçe sürükle, hangi banda bıraktığını canlı gör ve bir lige gönder.",
        to: "/ruya-takim",
        cta: "Kadromu Kur",
        stat: "Serbest Sürükle",
      },
    ],
  },
  {
    key: "track",
    title: "Keşfet & Takip Et",
    desc: "Takım/oyuncu profillerinden sezon geçmişine, rozetlere kadar her şey.",
    features: [
      {
        icon: "🔎",
        title: "Takım & Oyuncu Profilleri",
        desc: "Navbar'daki arama kutusundan istediğin takım/oyuncuyu bul -- kadro, form, ezeli rakip, transfer geçmişi ve sezon olayları tek sayfada.",
        to: "/ucl",
        cta: "Profillere Göz At",
        stat: "Arama",
      },
      {
        icon: "🌠",
        title: "Sezonun 11'i",
        desc: "O simülasyondaki gol/asist/reyting performansına göre otomatik seçilen en iyi kadro, sahada 4-3-3 diziliminde.",
        to: "/ucl/istatistik",
        cta: "Kadroyu Gör",
        stat: "Otomatik XI",
      },
      {
        icon: "🗂️",
        title: "Sezon Arşivi",
        desc: "Şampiyon belirlendiğinde sezon özeti otomatik kaydedilir -- tarayıcında kalıcı, fotoğraf olarak da indirebilirsin.",
        to: "/arsiv",
        cta: "Arşive Git",
        stat: "Kalıcı",
      },
      {
        icon: "🏅",
        title: "Başarılar",
        desc: "Kura çekmekten kadro kurmaya, doğru tahmin tutturmaya kadar 26 rozet -- uygulamayı kullandıkça otomatik açılır.",
        to: "/basarilar",
        cta: "Rozetleri Gör",
        stat: "26 Rozet",
      },
    ],
  },
];

const STEPS = [
  { n: 1, title: "Kura Çek", desc: "Bir lig seç, çekiliş törenini izle (ya da anında sonuca atla)." },
  { n: 2, title: "Tahmin Oluştur", desc: "Fikstür otomatik kurulur, model her maçı tahmin eder. İstersen taktik ver." },
  { n: 3, title: "Sonuçları İzle", desc: "Maç Merkezi'nde dakika dakika izle, eleme turuna geç, şampiyonu gör." },
];

const STATS = [
  { n: "3", label: "Lig" },
  { n: "100+", label: "Takım" },
  { n: "2000+", label: "Oyuncu" },
  { n: "∞", label: "Simülasyon" },
  { n: "26", label: "Rozet" },
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

export default function HomePage() {
  return (
    <div className="page-shell home-page">
      <section className="home-hero">
        <span className="home-hero-aurora home-hero-aurora-1" aria-hidden="true" />
        <span className="home-hero-aurora home-hero-aurora-2" aria-hidden="true" />
        <CrestMarquee />
        <div className="home-hero-content">
          <div className="page-eyebrow home-hero-in" style={{ animationDelay: "0ms" }}>
            UCL · Avrupa Ligi · Trendyol Süper Lig
          </div>
          <h1 className="home-hero-title home-hero-in" style={{ animationDelay: "80ms" }}>
            Futbol Simülatör
          </h1>
          <p className="home-hero-sub home-hero-in" style={{ animationDelay: "160ms" }}>
            Kura çek, fikstürünü kur, maçları dakika dakika izle, kendi Rüya
            Takımını oluştur. Gerçek kurallara sadık, eğlenceli ve gerçeğe
            yakın bir istatistiksel model -- hepsi tek bir sitede.
          </p>
          <div className="home-hero-actions home-hero-in" style={{ animationDelay: "240ms" }}>
            <Link to="/ucl" className="btn-primary home-hero-btn home-hero-btn-shine">
              <span className="home-hero-btn-shine-sweep" aria-hidden="true" />
              Hemen Başla →
            </Link>
            <Link to="/ruya-takim" className="btn-secondary home-hero-btn">
              ⭐ Rüya Takımını Kur
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

      <section className="home-steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="home-step home-step-in" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="home-step-num">{s.n}</span>
              <div>
                <div className="home-step-title">{s.title}</div>
                <div className="home-step-desc">{s.desc}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && <span className="home-step-arrow" aria-hidden="true">→</span>}
          </React.Fragment>
        ))}
      </section>

      {CATEGORIES.map((cat) => (
        <section className={`home-cat home-cat-${cat.key}`} key={cat.key}>
          <div className="home-cat-head">
            <h2 className="home-section-title">{cat.title}</h2>
            <p className="home-cat-desc">{cat.desc}</p>
          </div>
          <div className="home-feature-grid">
            {cat.features.map((f, i) => (
              <Link
                to={f.to}
                className={`home-feature-card home-feature-card-in home-feature-card-${cat.key}`}
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

      <p className="footnote home-footnote">
        Bu site bir simülasyon/eğlence projesidir. Skorlar, oyuncu istatistikleri
        ve turnuva sonuçları gerçek bir spor verisi değildir -- takım
        katsayılarına dayalı Poisson tabanlı bir model tarafından üretilir.
        Sadece "Canlı Skorlar" sayfasındaki gerçek veri etiketli bölümler
        gerçek dünya verisi içerir.
      </p>
    </div>
  );
}

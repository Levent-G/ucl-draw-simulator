import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import NavSearch from "./NavSearch.jsx";
import NavMoreMenu from "./NavMoreMenu.jsx";
import RealCompetitionSubNav from "./RealCompetitionSubNav.jsx";

// Sitenin birincil işi 2 gerçek veri ligini (UCL/Süper Lig) takip etmek --
// bu yüzden navbar'ın birincil satırı SADECE Ana Sayfa + bu ligler + Canlı
// Skorlar'dan oluşur. Avrupa Ligi'nin gerçek veri desteği yok (henüz kaynağı
// yok, bkz. hasRealDataSupport) -- tamamen simülasyon, bu yüzden üst
// menüden KALDIRILDI (rota/sayfa SİLİNMEDİ, hâlâ "🎮 Eğlence Modu"
// üzerinden erişilebilir). Geri kalan ikincil araçlar (Rüya Takım/
// Başarılar/Ayarlar/Yenilikler) "Diğer" menüsüne toplanır (bkz.
// NavMoreMenu.jsx). Transfer Merkezi ve Arşiv de (tamamen kurgusal
// simülasyon verisine dayandıkları için) menüden kaldırıldı -- sayfaları
// SİLİNMEDİ, sadece artık ana menüden erişilemiyorlar.
const MORE_ITEMS = [
  { to: "/eglence-modu", label: "Eğlence Modu (Simülasyon)", icon: "🎮" },
  { to: "/ruya-takim", label: "Rüya Takım", icon: "⭐" },
  { to: "/basarilar", label: "Başarılar", icon: "🏅" },
  { to: "/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

const COMPETITION_KEYS = COMPETITION_LIST.map((c) => c.key);
const NAV_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));
// Bir yarışma gerçek veri desteklese bile (ucl/superlig), bu alt yollar HÂLÂ
// tamamen eski simülasyon motorunu kullanır (kura töreni, sahte sezon
// simülasyonu, eleme turu tahmini) -- "gerçek veri" rozeti YANLIŞLIKLA
// buralarda gösterilmesin diye ayrıca işaretleniyor (bkz. DataModeBanner).
// "oyuncu" da buraya dahil -- oyuncu profili takım/isim/pozisyon gerçek olsa
// da gol/asist/kart gibi TÜM performans verisi hâlâ simülasyon motorundan
// gelir (bkz. PlayerProfilePage.jsx: simulation.playerStats).
const SIM_ONLY_SEGMENTS = ["kura-simulasyonu", "sezon-simulasyonu", "eleme-turu", "oyuncu"];

export default function NavBar() {
  const { openTour } = useOnboarding();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Rota her değiştiğinde (bir linke tıklanınca) mobil menüyü otomatik kapat.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // NavBar, <Routes>'un DIŞINDA (üstünde) render edildiğinden useParams()
  // ile competitionKey'i okuyamıyor -- yolu elle ayrıştırıyoruz (ör.
  // /europa/fikstur -> "europa").
  const matchedCompetitionKey = COMPETITION_KEYS.find((key) => location.pathname.startsWith(`/${key}`));
  const showRealSubNav = matchedCompetitionKey && hasRealDataSupport(matchedCompetitionKey);

  // Kullanıcı "gerçek veri mi simülasyon mu?" karışıklığı yaşadığını, sonra
  // da "sayfalarda gezerken hep gerçek veri olsun -- ayrıca bir GERÇEK VERİ
  // rozetine gerek yok, gerçek zaten varsayılan olmalı" geri bildirimini
  // verdi. Bu yüzden ARTIK sadece "eğlence modu" (kura/sezon simülasyonu,
  // eleme turu, oyuncu profili) alt yollarında -- yani sonuçların GERÇEK
  // OLMADIĞI durumlarda -- bir uyarı şeridi gösteriliyor; gerçek veri
  // sayfalarında hiçbir rozet YOK (gezinti sırasında hepsi zaten gerçek).
  const pathSegments = matchedCompetitionKey
    ? location.pathname.slice(matchedCompetitionKey.length + 1).split("/").filter(Boolean)
    : [];
  const firstSegment = pathSegments[0] || "";
  const isSimOnlySegment = SIM_ONLY_SEGMENTS.includes(firstSegment);
  const showSimBanner = showRealSubNav && isSimOnlySegment;

  return (
    <>
    <nav className={`site-nav ${menuOpen ? "menu-open" : ""}`}>
      <div className="site-nav-inner">
        <NavLink to="/" end className="site-nav-brand-link">
          <span className="site-nav-brand">FUTBOL SİMÜLATÖR</span>
        </NavLink>
        <NavSearch />
        <button
          type="button"
          className="site-nav-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`site-nav-links ${menuOpen ? "is-open" : ""}`}>
          <span className="site-nav-group-label">Ligler</span>
          <div className="site-nav-league-grid">
            {NAV_COMPETITIONS.map((comp) => (
              <NavLink
                key={comp.key}
                to={`/${comp.key}`}
                className={({ isActive }) => `site-nav-link site-nav-link-league${isActive ? " active" : ""}`}
              >
                {comp.shortName}
              </NavLink>
            ))}
          </div>
          <span className="site-nav-group-label">Keşfet</span>
          <NavLink
            to="/canli"
            className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`}
          >
            📡 Canlı Skorlar
          </NavLink>
          <NavLink
            to="/tahmin-ligi"
            className={({ isActive }) => `site-nav-link site-nav-link-prediction${isActive ? " active" : ""}`}
          >
            🏆 Tahmin Ligi
          </NavLink>
          <NavMoreMenu items={MORE_ITEMS} onTourClick={openTour} />
        </div>
      </div>
      {showSimBanner && (
        <div className="data-mode-banner data-mode-sim">
          <span className="data-mode-banner-inner">
            🎮 <b>SİMÜLASYON MODU</b> — bu sayfadaki sonuçlar gerçek DEĞİL, kurgusal bir modelin ürettiği tahminlerdir
          </span>
        </div>
      )}
      {showRealSubNav && <RealCompetitionSubNav competitionKey={matchedCompetitionKey} />}
    </nav>
    {menuOpen && <div className="site-nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </>
  );
}

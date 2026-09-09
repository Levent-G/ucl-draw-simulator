import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { COMPETITION_LIST, getCompetition } from "../data/competitions.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import NavSearch from "./NavSearch.jsx";
import NavDropdown from "./NavDropdown.jsx";
import TeamFilterSelect from "./stats/TeamFilterSelect.jsx";

// Kullanıcı geri bildirimi: eskiden UCL/Süper Lig'in Fikstür/İstatistik/
// Karşılıklı Geçmiş/Haberler linkleri navbar'ın AYRI bir ikinci satırında
// (bkz. RealCompetitionSubNav.jsx, artık kullanılmıyor) duruyordu -- "üstte
// menü, altında da menü, çok yanlış" tepkisi aldı. Artık TEK satırlı bir
// menüde, UCL/Süper Lig kendi açılır (dropdown) menüsü -- bkz. NavDropdown.
function realDropdownItems(competitionKey) {
  return [
    { to: `/${competitionKey}`, end: true, icon: "📅", label: "Fikstür" },
    { to: `/${competitionKey}/istatistik`, icon: "📊", label: "İstatistikler" },
    { to: `/${competitionKey}/karsilikli`, icon: "🤝", label: "Karşılıklı Geçmiş" },
    { to: `/${competitionKey}/haberler`, icon: "📰", label: "Haberler" },
  ];
}

// "🎮 Eğlence Modu" bir UCL/Süper Lig sayfasındayken sağ üstte (bkz.
// site-nav-util, o yarışmaya özel kısayol) ayrıca gösteriliyor, ama /canli,
// /tahmin-ligi gibi yarışmadan bağımsız sayfalarda oraya erişim yok -- bu
// yüzden genel giriş noktası (bkz. FunModeLandingPage) olarak burada da
// (her sayfada erişilebilir "Diğer" menüsünde) duruyor.
const MORE_ITEMS = [
  { to: "/eglence-modu", label: "Eğlence Modu", icon: "🎮" },
  { to: "/ruya-takim", label: "Rüya Takım", icon: "⭐" },
  { to: "/basarilar", label: "Başarılar", icon: "🏅" },
  { to: "/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

const COMPETITION_KEYS = COMPETITION_LIST.map((c) => c.key);
const NAV_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));
const COMPETITION_ICONS = { ucl: "🏆", superlig: "🇹🇷" };
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
  const { favoriteTeamId, setFavoriteTeam } = useFavoriteTeam(showRealSubNav ? matchedCompetitionKey : undefined);

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
      <div className="site-nav-search-row">
        <NavSearch />
      </div>
      <div className="site-nav-inner">
        <NavLink to="/" end className="site-nav-brand-link">
          <span className="site-nav-brand">FUTBOL ANALİZ</span>
        </NavLink>
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
              <NavDropdown
                key={comp.key}
                label={comp.shortName}
                icon={COMPETITION_ICONS[comp.key] || "⚽"}
                items={realDropdownItems(comp.key)}
              />
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
          <NavDropdown
            label="Diğer"
            items={[...MORE_ITEMS, { label: "Yenilikler", icon: "✨", onClick: openTour }]}
          />
          {showRealSubNav && (
            <div className="site-nav-util">
              <div className="favorite-team-picker">
                <TeamFilterSelect
                  teams={getCompetition(matchedCompetitionKey).teams}
                  value={favoriteTeamId}
                  onChange={setFavoriteTeam}
                  placeholder="⭐ Takımını Seç"
                />
              </div>
              <Link
                to={`/${matchedCompetitionKey}/${getCompetition(matchedCompetitionKey).format === "swiss" ? "kura-simulasyonu" : "sezon-simulasyonu"}`}
                className="real-data-nav-fun-link"
              >
                🎮 Eğlence Modu
              </Link>
            </div>
          )}
        </div>
      </div>
      {showSimBanner && (
        <div className="data-mode-banner data-mode-sim">
          <span className="data-mode-banner-inner">
            🎮 <b>SİMÜLASYON MODU</b> — bu sayfadaki sonuçlar gerçek DEĞİL, kurgusal bir modelin ürettiği tahminlerdir
          </span>
        </div>
      )}
    </nav>
    {menuOpen && <div className="site-nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </>
  );
}

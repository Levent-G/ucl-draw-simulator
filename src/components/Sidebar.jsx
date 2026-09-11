import React, { useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import NavSearch from "./NavSearch.jsx";
import NavDropdown from "./NavDropdown.jsx";

const NAV_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));
const COMPETITION_ICONS = { ucl: "🏆", superlig: "🇹🇷" };

function realDropdownItems(competitionKey) {
  return [
    { to: `/${competitionKey}`, end: true, icon: "📅", label: "Fikstür" },
    { to: `/${competitionKey}/istatistik`, icon: "📊", label: "İstatistikler" },
    { to: `/${competitionKey}/karsilikli`, icon: "🤝", label: "Karşılıklı Geçmiş" },
    { to: `/${competitionKey}/haberler`, icon: "📰", label: "Haberler" },
  ];
}

// "🎮 Eğlence Modu" bir UCL/Süper Lig sayfasındayken üst çubukta (bkz.
// TopBar.jsx, o yarışmaya özel kısayol) ayrıca gösteriliyor, ama /canli,
// /tahmin-ligi gibi yarışmadan bağımsız sayfalarda oraya erişim yok -- bu
// yüzden genel giriş noktası (bkz. FunModeLandingPage) olarak burada da
// (her sayfada erişilebilir "Diğer" menüsünde) duruyor.
const MORE_ITEMS = [
  { to: "/eglence-modu", label: "Eğlence Modu", icon: "🎮" },
  { to: "/ruya-takim", label: "Rüya Takım", icon: "⭐" },
  { to: "/basarilar", label: "Başarılar", icon: "🏅" },
  { to: "/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

// Sol menü -- kullanıcı geri bildirimi: "menü solda olsun, arama üstte
// [sol menünün üstünde] menü altında". Masaüstünde sabit/kalıcı bir kolon;
// mobilde `open` prop'una göre soldan kayarak açılan bir çekmece (bkz.
// app-sidebar.is-open / app-sidebar-backdrop CSS'i).
export default function Sidebar({ open, onClose }) {
  const { openTour } = useOnboarding();
  const location = useLocation();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="sidebar-brand-link">
          <span className="sidebar-brand">FUTBOL ANALİZ</span>
        </Link>
        <div className="sidebar-search">
          <NavSearch />
        </div>
        <nav className="sidebar-nav">
          {NAV_COMPETITIONS.map((comp) => (
            <NavDropdown
              key={comp.key}
              label={comp.shortName}
              icon={COMPETITION_ICONS[comp.key] || "⚽"}
              items={realDropdownItems(comp.key)}
            />
          ))}
          <NavLink to="/canli" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <span className="sidebar-link-icon">📡</span>
            <span className="sidebar-link-label">Canlı Skorlar</span>
          </NavLink>
          <NavLink
            to="/tahmin-ligi"
            className={({ isActive }) => `sidebar-link sidebar-link-prediction ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">🏆</span>
            <span className="sidebar-link-label">Tahmin Ligi</span>
          </NavLink>
          <NavDropdown
            label="Diğer"
            icon="⋯"
            items={[...MORE_ITEMS, { label: "Yenilikler", icon: "✨", onClick: openTour }]}
          />
        </nav>
      </aside>
      {open && <div className="app-sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
    </>
  );
}

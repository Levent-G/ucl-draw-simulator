import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import NavSearch from "./NavSearch.jsx";

export default function NavBar() {
  const { openTour } = useOnboarding();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Rota her değiştiğinde (bir linke tıklanınca) mobil menüyü otomatik kapat.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="site-nav">
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
          <NavLink to="/" end className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`}>
            Ana Sayfa
          </NavLink>
          {COMPETITION_LIST.map((comp) => (
            <NavLink
              key={comp.key}
              to={`/${comp.key}`}
              className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`}
            >
              {comp.shortName}
            </NavLink>
          ))}
          <NavLink
            to="/canli"
            className={({ isActive }) => `site-nav-link site-nav-link-transfer${isActive ? " active" : ""}`}
          >
            📡 Canlı Skorlar
          </NavLink>
          <NavLink
            to="/transferler"
            className={({ isActive }) => `site-nav-link site-nav-link-transfer${isActive ? " active" : ""}`}
          >
            🔁 Transfer Merkezi
          </NavLink>
          <NavLink
            to="/ruya-takim"
            className={({ isActive }) => `site-nav-link site-nav-link-transfer${isActive ? " active" : ""}`}
          >
            ⭐ Rüya Takım
          </NavLink>
          <NavLink
            to="/arsiv"
            className={({ isActive }) => `site-nav-link site-nav-link-transfer${isActive ? " active" : ""}`}
          >
            🗂️ Arşiv
          </NavLink>
          <NavLink
            to="/basarilar"
            className={({ isActive }) => `site-nav-link site-nav-link-transfer${isActive ? " active" : ""}`}
          >
            🏅 Başarılar
          </NavLink>
          <NavLink
            to="/ayarlar"
            className={({ isActive }) => `site-nav-link site-nav-link-icon${isActive ? " active" : ""}`}
            title="Gelişmiş Ayarlar"
            aria-label="Gelişmiş Ayarlar"
          >
            ⚙️ <span className="site-nav-icon-label">Ayarlar</span>
          </NavLink>
          <button
            type="button"
            className="site-nav-link site-nav-link-icon"
            onClick={openTour}
            title="Yenilikler"
            aria-label="Yenilikler turu"
          >
            ✨ <span className="site-nav-icon-label">Yenilikler</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

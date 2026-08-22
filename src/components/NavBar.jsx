import React from "react";
import { NavLink } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import NavSearch from "./NavSearch.jsx";

export default function NavBar() {
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <NavLink to="/" end className="site-nav-brand-link">
          <span className="site-nav-brand">FUTBOL SİMÜLATÖR</span>
        </NavLink>
        <NavSearch />
        <div className="site-nav-links">
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
            ⚙️
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

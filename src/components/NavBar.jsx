import React from "react";
import { NavLink } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";

export default function NavBar() {
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <span className="site-nav-brand">FUTBOL SİMÜLATÖR</span>
        <div className="site-nav-links">
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
        </div>
      </div>
    </nav>
  );
}

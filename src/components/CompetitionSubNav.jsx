import React from "react";
import { NavLink } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";

export default function CompetitionSubNav({ competitionKey }) {
  const comp = getCompetition(competitionKey);
  const base = `/${competitionKey}`;
  const links = [
    { to: base, label: comp.format === "swiss" ? "Kura Çekimi" : "Sezon", end: true },
    { to: `${base}/fikstur`, label: "Fikstür & Tahmin" },
    { to: `${base}/istatistik`, label: "İstatistikler" },
    { to: `${base}/karsilikli`, label: "Karşılıklı Geçmiş" },
  ];
  if (comp.hasKnockout) links.push({ to: `${base}/eleme-turu`, label: "Eleme Turu" });

  return (
    <nav className="competition-subnav">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

import React from "react";
import { NavLink, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import TeamFilterSelect from "./stats/TeamFilterSelect.jsx";

// Artık ayrı bir "Ana Sayfa" yok -- kök rota (/ucl, /superlig) doğrudan
// Fikstür'ü gösteriyor (bkz. CompetitionHomeRoute.jsx), bu yüzden "Fikstür"
// sekmesi kök yola işaret eder (end:true ile SADECE tam eşleşmede aktif
// olur, /ucl/istatistik gibi alt yollarda yanlışlıkla aktif görünmez).
const VIEWS = [
  { key: "", icon: "📅", label: "Fikstür", end: true },
  { key: "istatistik", icon: "📊", label: "İstatistikler" },
  { key: "karsilikli", icon: "🤝", label: "Karşılıklı Geçmiş" },
  { key: "haberler", icon: "📰", label: "Haberler" },
];

// UCL/Süper Lig için TEK bir gezinme çubuğu -- NavBar'ın (site geneli)
// İKİNCİ satırı olarak render edilir, ayrı bir kutu/panel DEĞİLDİR (bkz.
// NavBar.jsx). Eskiden her sayfa kendi CompetitionStepper panelini ayrıca
// gösteriyordu ("iç içe iki menü" görünümü) -- artık CompetitionStepper
// bu iki yarışma için hiçbir şey render etmiyor (bkz. CompetitionStepper.jsx),
// tüm gezinme burada. Takım seçici de burada -- her sekmede aynı yerde,
// kalıcı (localStorage) ve tutarlı.
export default function RealCompetitionSubNav({ competitionKey }) {
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId, setFavoriteTeam } = useFavoriteTeam(competitionKey);
  const base = `/${competitionKey}`;
  const funModeTo = `${base}/${competition.format === "swiss" ? "kura-simulasyonu" : "sezon-simulasyonu"}`;

  return (
    <div className="site-nav-subrow">
      <div className="site-nav-subrow-inner">
        <nav className="real-data-nav">
          {VIEWS.map((v) => (
            <NavLink
              key={v.key}
              to={v.key ? `${base}/${v.key}` : base}
              end={v.end}
              className={({ isActive }) => `real-data-nav-link ${isActive ? "active" : ""}`}
            >
              {v.icon} {v.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-nav-subrow-right">
          <div className="favorite-team-picker">
            <TeamFilterSelect
              teams={competition.teams}
              value={favoriteTeamId}
              onChange={setFavoriteTeam}
              placeholder="⭐ Takımını Seç"
            />
          </div>
          <Link to={funModeTo} className="real-data-nav-fun-link">
            🎮 Eğlence Modu
          </Link>
        </div>
      </div>
    </div>
  );
}

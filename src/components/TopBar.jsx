import React from "react";
import { Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { useRealCompetitionRoute } from "../state/useRealCompetitionRoute.js";
import TeamFilterSelect from "./stats/TeamFilterSelect.jsx";

// Bir yarışma gerçek veri desteklese bile (ucl/superlig), bu alt yollar HÂLÂ
// tamamen eski simülasyon motorunu kullanır (kura töreni, sahte sezon
// simülasyonu, eleme turu tahmini) -- "gerçek veri" rozeti YANLIŞLIKLA
// buralarda gösterilmesin diye ayrıca işaretleniyor.
const SIM_ONLY_SEGMENTS = ["kura-simulasyonu", "sezon-simulasyonu", "eleme-turu", "oyuncu"];

// Üst çubuk -- kullanıcı geri bildirimi: "tuttuğun takım ve eğlence modu
// üst menüde, en sağında olsun". Mobilde sol menüyü (Sidebar.jsx) açan
// hamburger düğmesi de burada.
export default function TopBar({ onBurgerClick }) {
  const { matchedCompetitionKey, showRealSubNav, pathname } = useRealCompetitionRoute();
  const { favoriteTeamId, setFavoriteTeam } = useFavoriteTeam(showRealSubNav ? matchedCompetitionKey : undefined);

  const pathSegments = matchedCompetitionKey
    ? pathname.slice(matchedCompetitionKey.length + 1).split("/").filter(Boolean)
    : [];
  const firstSegment = pathSegments[0] || "";
  const showSimBanner = showRealSubNav && SIM_ONLY_SEGMENTS.includes(firstSegment);
  const competition = showRealSubNav ? getCompetition(matchedCompetitionKey) : null;

  return (
    <div className="app-topbar-wrap">
      <div className="app-topbar">
        <button type="button" className="app-topbar-burger" onClick={onBurgerClick} aria-label="Menüyü aç">
          ☰
        </button>
        <div className="app-topbar-spacer" />
        {showRealSubNav && competition && (
          <div className="app-topbar-util">
            <div className="app-favorite-team-picker">
              <TeamFilterSelect
                teams={competition.teams}
                value={favoriteTeamId}
                onChange={setFavoriteTeam}
                placeholder="⭐ Takımını Seç"
              />
            </div>
            <Link
              to={`/${matchedCompetitionKey}/${competition.format === "swiss" ? "kura-simulasyonu" : "sezon-simulasyonu"}`}
              className="app-fun-link"
            >
              🎮 Eğlence Modu
            </Link>
          </div>
        )}
      </div>
      {showSimBanner && (
        <div className="data-mode-banner data-mode-sim">
          <span className="data-mode-banner-inner">
            🎮 <b>SİMÜLASYON MODU</b> — bu sayfadaki sonuçlar gerçek DEĞİL, kurgusal bir modelin ürettiği tahminlerdir
          </span>
        </div>
      )}
    </div>
  );
}

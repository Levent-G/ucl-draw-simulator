import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import NavSearch from "./NavSearch.jsx";
import NavMoreMenu from "./NavMoreMenu.jsx";

// Sitenin birincil işi 3 ligden birini oynamak -- bu yüzden navbar'ın
// birincil satırı SADECE Ana Sayfa + 3 lig + Canlı Skorlar'dan oluşur.
// Geri kalan ikincil araçlar (Transfer/Rüya Takım/Arşiv/Başarılar/Ayarlar/
// Yenilikler) "Diğer" menüsüne toplanır (bkz. NavMoreMenu.jsx) -- hepsi eşit
// ağırlıkta 10+ link göstermek yerine, kullanıcının asıl karar vermesi
// gereken "hangi ligi oynayacağım" sorusu görsel olarak öne çıkar.
const MORE_ITEMS = [
  { to: "/transferler", label: "Transfer Merkezi", icon: "🔁" },
  { to: "/ruya-takim", label: "Rüya Takım", icon: "⭐" },
  { to: "/arsiv", label: "Arşiv", icon: "🗂️" },
  { to: "/basarilar", label: "Başarılar", icon: "🏅" },
  { to: "/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

const COMPETITION_KEYS = COMPETITION_LIST.map((c) => c.key);

export default function NavBar() {
  const { openTour } = useOnboarding();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Rota her değiştiğinde (bir linke tıklanınca) mobil menüyü otomatik kapat.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // NavBar, <Routes>'un DIŞINDA (üstünde) render edildiğinden useParams()
  // ile competitionKey'i okuyamıyor -- Tahmin Ligi linkinin "şu an
  // gezindiğin lig" ile açılması için yolu elle ayrıştırıyoruz (ör.
  // /europa/fikstur -> "europa"); eşleşme yoksa (ör. ana sayfa) UCL'e döner.
  const activeCompetitionKey =
    COMPETITION_KEYS.find((key) => location.pathname.startsWith(`/${key}`)) || "ucl";

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
          {COMPETITION_LIST.map((comp) => (
            <NavLink
              key={comp.key}
              to={`/${comp.key}`}
              className={({ isActive }) => `site-nav-link site-nav-link-league${isActive ? " active" : ""}`}
            >
              {comp.shortName}
            </NavLink>
          ))}
          <NavLink
            to="/canli"
            className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`}
          >
            📡 Canlı Skorlar
          </NavLink>
          <NavLink
            to={`/${activeCompetitionKey}/tahmin-ligi`}
            className={({ isActive }) => `site-nav-link site-nav-link-prediction${isActive ? " active" : ""}`}
          >
            🏆 Tahmin Ligi
          </NavLink>
          <NavMoreMenu items={MORE_ITEMS} onTourClick={openTour} />
        </div>
      </div>
    </nav>
  );
}

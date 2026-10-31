import React from "react";
import { Link } from "react-router-dom";
import { getCompetition, COMPETITION_LIST } from "../data/competitions.js";
import { SUPER_LIG_LIVE_ASOF } from "../data/liveStatus.js";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { useRealCompetitionRoute } from "../state/useRealCompetitionRoute.js";
import TeamFilterSelect from "./stats/TeamFilterSelect.jsx";
import NavSearch from "./NavSearch.jsx";

// Bir yarışma gerçek veri desteklese bile bu alt yollar simülasyon motorunu
// kullanır -- "gerçek veri" ile karışmasın diye simülasyon şeridi gösterilir.
const SIM_ONLY_SEGMENTS = ["kura-simulasyonu", "sezon-simulasyonu", "eleme-turu", "oyuncu"];

const PAGE_LABELS = {
  "": "Genel Bakış & Fikstür",
  istatistik: "Lig İstatistikleri",
  karsilikli: "Karşılıklı Geçmiş",
  haberler: "Haberler & Sezon Hikayesi",
  "sezon-hikayesi": "Haberler & Sezon Hikayesi",
  fikstur: "Fikstür",
  mac: "Maç Merkezi",
  takim: "Takım Profili",
  oyuncu: "Oyuncu Profili",
  "kura-simulasyonu": "Kura Simülasyonu",
  "sezon-simulasyonu": "Sezon Simülasyonu",
  "eleme-turu": "Eleme Turu",
};

const TOP_LEVEL_LABELS = {
  "": "Ana Sayfa",
  canli: "Canlı Skorlar",
  "tahmin-ligi": "Tahmin Ligi",
  "eglence-modu": "Eğlence Modu",
  "ruya-takim": "Rüya Takım",
  basarilar: "Başarılar",
  transferler: "Transferler",
  arsiv: "Arşiv",
  ayarlar: "Ayarlar & Tema",
};

const COMPETITION_KEYS = new Set(COMPETITION_LIST.map((c) => c.key));

// "27 Ekim 2026 (9. Hafta TAMAMLANDI ...)" -> "27 Ekim 2026"
const DATA_DATE = SUPER_LIG_LIVE_ASOF.split(/[,(]/)[0].trim();

function getBreadcrumb(pathname) {
  const [first = "", second = ""] = pathname.split("/").filter(Boolean);
  if (COMPETITION_KEYS.has(first)) {
    const competition = getCompetition(first);
    return [
      { label: competition.shortName, to: `/${first}` },
      { label: PAGE_LABELS[second] ?? "Sayfa" },
    ];
  }
  return [{ label: TOP_LEVEL_LABELS[first] ?? "Süper Analiz" }];
}

export default function TopBar({ onBurgerClick }) {
  const { matchedCompetitionKey, showRealSubNav, pathname } = useRealCompetitionRoute();
  const { favoriteTeamId, setFavoriteTeam } = useFavoriteTeam(showRealSubNav ? matchedCompetitionKey : undefined);

  const pathSegments = matchedCompetitionKey
    ? pathname.slice(matchedCompetitionKey.length + 1).split("/").filter(Boolean)
    : [];
  const showSimBanner = showRealSubNav && SIM_ONLY_SEGMENTS.includes(pathSegments[0] || "");
  const competition = showRealSubNav ? getCompetition(matchedCompetitionKey) : null;
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="app-topbar-wrap sa-topbar-wrap">
      <div className="app-topbar sa-topbar">
        <button type="button" className="app-topbar-burger" onClick={onBurgerClick} aria-label="Menüyü aç">
          ☰
        </button>

        <nav className="sa-topbar-crumbs" aria-label="Sayfa yolu">
          {breadcrumb.map((c, i) => (
            <React.Fragment key={c.label + i}>
              {i > 0 && <span className="sa-topbar-crumb-sep">/</span>}
              {c.to ? (
                <Link to={c.to} className="sa-topbar-crumb">
                  {c.label}
                </Link>
              ) : (
                <span className="sa-topbar-crumb is-current">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="sa-topbar-search">
          <NavSearch />
        </div>

        <div className="sa-topbar-right">
          <span className="sa-chip sa-chip-live" title="Verilerin son güncellenme tarihi">
            <span className="sa-dot" /> Veri: {DATA_DATE}
          </span>
          <span className="sa-chip">2026–27</span>
          {showRealSubNav && competition && (
            <>
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
                className="sa-chip sa-chip-sim"
              >
                Eğlence Modu
              </Link>
            </>
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
    </div>
  );
}

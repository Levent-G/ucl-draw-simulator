import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import logoIcon from "../assets/logo-icon-96.png";

// Sol menü -- Stitch "Süper Analiz Football Hub" tasarımı (2026-10-28):
// bölüm başlıklı (Temel Terminal / Turnuvalar / Analitik & Veri), ikonsuz,
// sade bir terminal menüsü. Menüde SADECE gerçekten var olan sayfalar yer
// alır. Turnuva alt menüleri akordeon: aynı anda en fazla bir tanesi açık
// (eski davranış korunuyor -- bkz. kullanıcı geri bildirimi "çok fazla alt
// menü açık kalıyor").
const NAV_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));

const competitionItems = (key) => [
  { to: `/${key}`, end: true, label: "Genel Bakış & Fikstür" },
  { to: `/${key}/istatistik`, label: "Lig İstatistikleri" },
  { to: `/${key}/karsilikli`, label: "Karşılıklı Geçmiş" },
  { to: `/${key}/haberler`, label: "Haberler & Sezon Hikayesi", alsoActive: [`/${key}/sezon-hikayesi`] },
];

const ANALYTICS_ITEMS = [
  { to: "/tahmin-ligi", label: "Tahmin Ligi" },
  { to: "/eglence-modu", label: "Eğlence Modu", badge: "SİM" },
  { to: "/ruya-takim", label: "Rüya Takım" },
  { to: "/basarilar", label: "Başarılar" },
  { to: "/transferler", label: "Transferler" },
  { to: "/arsiv", label: "Arşiv" },
];

const isItemActive = (item, pathname) =>
  (item.end ? pathname === item.to : pathname.startsWith(item.to)) ||
  (item.alsoActive || []).some((p) => pathname.startsWith(p));

const findOpenCompetition = (pathname) =>
  NAV_COMPETITIONS.find((c) => pathname === `/${c.key}` || pathname.startsWith(`/${c.key}/`))?.key ?? null;

export default function Sidebar({ open, onClose }) {
  const { openTour } = useOnboarding();
  const { pathname } = useLocation();
  const [openKey, setOpenKey] = useState(() => findOpenCompetition(pathname));

  useEffect(() => {
    onClose();
    setOpenKey(findOpenCompetition(pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const linkClass = ({ isActive }) => `sa-side-link ${isActive ? "active" : ""}`;

  return (
    <>
      <aside className={`app-sidebar sa-sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="sa-side-brand">
          <img src={logoIcon} alt="" className="sa-side-brand-logo" />
          <span className="sa-side-brand-text">
            <span className="sa-side-brand-name">Süper Analiz</span>
            <span className="sa-side-brand-sub">Türkiye Futbol Veri</span>
          </span>
        </Link>

        <nav className="sa-side-nav">
          <div className="sa-side-section">Temel Terminal</div>
          <NavLink to="/" end className={linkClass}>
            Ana Sayfa
          </NavLink>
          <NavLink to="/canli" className={linkClass}>
            Canlı Skorlar
          </NavLink>

          <div className="sa-side-section">Turnuvalar</div>
          {NAV_COMPETITIONS.map((comp) => {
            const items = competitionItems(comp.key);
            const isOpen = openKey === comp.key;
            const isActive = items.some((i) => isItemActive(i, pathname));
            return (
              <div key={comp.key} className={`sa-side-group ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className={`sa-side-link sa-side-group-trigger ${isActive ? "is-current" : ""}`}
                  aria-expanded={isOpen}
                  onClick={() => setOpenKey((prev) => (prev === comp.key ? null : comp.key))}
                >
                  {comp.shortName}
                  <span className="sa-side-caret" aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="sa-side-sub">
                    {items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={() => `sa-side-sublink ${isItemActive(item, pathname) ? "active" : ""}`}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="sa-side-section">Analitik & Veri</div>
          {ANALYTICS_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
              {item.badge && <span className="sa-side-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sa-side-footer">
          <NavLink to="/ayarlar" className={linkClass}>
            Ayarlar & Tema
          </NavLink>
          <button type="button" className="sa-side-link" onClick={openTour}>
            Yenilikler
          </button>
        </div>
      </aside>
      {open && <div className="app-sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
    </>
  );
}

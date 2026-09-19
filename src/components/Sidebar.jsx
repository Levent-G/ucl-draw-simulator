import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import { useOnboarding } from "../state/OnboardingContext.jsx";
import NavSearch from "./NavSearch.jsx";
import NavDropdown from "./NavDropdown.jsx";
import CompetitionIcon from "./CompetitionIcon.jsx";
import logoIcon from "../assets/logo-icon-96.png";

const NAV_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));

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

function itemsMatchPath(items, pathname) {
  return items.some((item) => {
    if (!item.to) return false;
    return item.end ? pathname === item.to : pathname.startsWith(item.to);
  });
}

// Şu an hangi bölümün (varsa) aktif sayfayla eşleştiğini bulur -- "ucl",
// "superlig" ya da "diger". Eşleşme yoksa null (ör. /canli, /tahmin-ligi
// gibi hiçbir dropdown'a ait olmayan düz sayfalar).
function findActiveDropdownKey(pathname) {
  for (const comp of NAV_COMPETITIONS) {
    if (itemsMatchPath(realDropdownItems(comp.key), pathname)) return comp.key;
  }
  if (itemsMatchPath(MORE_ITEMS, pathname)) return "diger";
  return null;
}

// Sol menü -- kullanıcı geri bildirimi: "menü solda olsun, arama üstte
// [sol menünün üstünde] menü altında". Masaüstünde sabit/kalıcı bir kolon;
// mobilde `open` prop'una göre soldan kayarak açılan bir çekmece (bkz.
// app-sidebar.is-open / app-sidebar-backdrop CSS'i).
//
// AÇIK DROPDOWN durumu (openKey) BİLEREK burada, TEK bir state olarak
// tutuluyor -- kullanıcı geri bildirimi: "çok fazla alt menü açık kalıyor,
// karışık". Eskiden her NavDropdown kendi state'ini tutuyordu ve bir kez
// açılan asla kendiliğinden kapanmıyordu (UCL'ye VE Süper Lig'e uğrayan biri
// ikisinin de alt öğelerini SÜREKLİ açık görüyordu). Artık gerçek bir
// akordeon: aynı anda en fazla BİR bölüm açık, aktif sayfaya göre otomatik
// senkronize olur, elle tıklayarak da açılıp kapatılabilir.
export default function Sidebar({ open, onClose }) {
  const { openTour } = useOnboarding();
  const location = useLocation();
  const [openKey, setOpenKey] = useState(() => findActiveDropdownKey(location.pathname));

  useEffect(() => {
    onClose();
    setOpenKey(findActiveDropdownKey(location.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleKey = (key) => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <>
      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="sidebar-brand-link">
          <img src={logoIcon} alt="Süper Analiz" className="sidebar-brand-logo" />
          <span className="sidebar-brand">SÜPER ANALİZ</span>
        </Link>
        <div className="sidebar-search">
          <NavSearch />
        </div>
        <nav className="sidebar-nav">
          {NAV_COMPETITIONS.map((comp) => {
            const items = realDropdownItems(comp.key);
            return (
              <NavDropdown
                key={comp.key}
                label={comp.shortName}
                icon={<CompetitionIcon competition={comp} size={16} />}
                items={items}
                isActive={itemsMatchPath(items, location.pathname)}
                isOpen={openKey === comp.key}
                onToggle={() => toggleKey(comp.key)}
              />
            );
          })}
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
            isActive={itemsMatchPath(MORE_ITEMS, location.pathname)}
            isOpen={openKey === "diger"}
            onToggle={() => toggleKey("diger")}
          />
        </nav>
      </aside>
      {open && <div className="app-sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
    </>
  );
}

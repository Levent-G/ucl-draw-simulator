import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// Genel amaçlı, tıklayınca açılan navbar dropdown'ı -- "Diğer" VE UCL/Süper
// Lig'in kendi alt sayfalarına (Fikstür/İstatistik/Karşılıklı Geçmiş/
// Haberler) açılan menüler dahil, TÜM navbar dropdown'ları bunu kullanır
// (bkz. NavBar.jsx) -- kullanıcı geri bildirimi: ayrı bir ikinci menü satırı
// yerine, tek satırlı bir menüde açılır kapanır alt menüler daha modern.
// Mobilde burger menüsü zaten her şeyi tek sütuna indirdiğinden, orada ayrı
// bir panel yerine düz, etiketli bir alt bölüme dönüşür (bkz. pages.css).
export default function NavDropdown({ label, icon, items, mobileLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = items.some((item) => {
    if (!item.to) return false;
    return item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  });

  return (
    <div className={`site-nav-dropdown ${open ? "open" : ""}`} ref={ref}>
      <button
        type="button"
        className={`site-nav-link site-nav-dropdown-trigger ${isActive ? "active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {icon} {label} <span className="site-nav-dropdown-caret" aria-hidden="true">▾</span>
      </button>
      <div className="site-nav-dropdown-mobile-label">{mobileLabel || label}</div>
      <div className="site-nav-dropdown-panel">
        {items.map((item) =>
          item.onClick ? (
            <button key={item.label} type="button" className="site-nav-dropdown-item" onClick={item.onClick}>
              {item.icon} {item.label}
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `site-nav-dropdown-item ${isActive ? "active" : ""}`}
            >
              {item.icon} {item.label}
            </NavLink>
          )
        )}
      </div>
    </div>
  );
}

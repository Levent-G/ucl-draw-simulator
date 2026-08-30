import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

// Navbar'daki 3 lig + Canlı Skorlar dışındaki ikincil araçları (Transfer,
// Rüya Takım, Arşiv, Başarılar, Ayarlar, Yenilikler) tek bir "Diğer"
// menüsünde toplar -- birincil akışın (hangi ligi oynayacağım) yanında bu
// linkler eşit ağırlıkta görünüp kullanıcıyı boğmasın diye. Masaüstünde
// açılır bir panel; mobilde (burger menüsü zaten her şeyi tek sütuna
// indirdiğinden) CSS ile düz, etiketli bir alt bölüme dönüşür (bkz.
// pages.css `@media (max-width: 1400px) .site-nav-more*`).
export default function NavMoreMenu({ items, onTourClick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className={`site-nav-more ${open ? "open" : ""}`} ref={ref}>
      <button
        type="button"
        className="site-nav-link site-nav-more-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Diğer <span className="site-nav-more-caret" aria-hidden="true">▾</span>
      </button>
      <div className="site-nav-more-mobile-label">Diğer</div>
      <div className="site-nav-more-panel">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `site-nav-more-item${isActive ? " active" : ""}`}
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
        <button type="button" className="site-nav-more-item site-nav-more-item-btn" onClick={onTourClick}>
          ✨ Yenilikler
        </button>
      </div>
    </div>
  );
}

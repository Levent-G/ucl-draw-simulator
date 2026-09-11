import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// Sol menüdeki (Sidebar.jsx) açılır-kapanır bölüm -- UCL/Süper Lig'in kendi
// alt sayfaları (Fikstür/İstatistik/Karşılıklı Geçmiş/Haberler) VE "Diğer"
// için kullanılır. Bir üst satırda AYRI bir menü yerine, sol menüde tıklayınca
// altına açılan (akordeon) bir bölüm -- kullanıcı geri bildirimi: "menü
// solda olsun, ucl menüsü dropdown ile açılsın".
export default function NavDropdown({ label, icon, items }) {
  const location = useLocation();

  const isActive = items.some((item) => {
    if (!item.to) return false;
    return item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  });

  const [open, setOpen] = useState(isActive);

  // İçindeki bir sayfaya başka bir yerden geçildiğinde (ör. arama kutusundan)
  // bölüm otomatik açılsın -- aktif linkin kapalı bir akordeonun içinde
  // "kaybolmaması" için.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div className={`sidebar-dropdown ${open ? "open" : ""}`}>
      <button
        type="button"
        className={`sidebar-link sidebar-dropdown-trigger ${isActive ? "active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="sidebar-link-icon">{icon}</span>
        <span className="sidebar-link-label">{label}</span>
        <span className="sidebar-dropdown-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="sidebar-dropdown-panel">
          {items.map((item) =>
            item.onClick ? (
              <button key={item.label} type="button" className="sidebar-dropdown-item" onClick={item.onClick}>
                {item.icon} {item.label}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-dropdown-item ${isActive ? "active" : ""}`}
              >
                {item.icon} {item.label}
              </NavLink>
            )
          )}
        </div>
      )}
    </div>
  );
}

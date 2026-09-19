import React from "react";
import { NavLink } from "react-router-dom";

// Sol menüdeki (Sidebar.jsx) açılır-kapanır bölüm -- UCL/Süper Lig'in kendi
// alt sayfaları (Fikstür/İstatistik/Karşılıklı Geçmiş/Haberler) VE "Diğer"
// için kullanılır. Açık/kapalı durumu artık BURADA değil, Sidebar.jsx'te
// (tek bir "hangisi açık" state'i olarak) tutuluyor -- kullanıcı geri
// bildirimi: "çok fazla alt menü açık kalıyor, karışık" -- eskiden her
// dropdown kendi state'ini tutuyordu ve bir kez açılan ASLA kendiliğinden
// kapanmıyordu, bu yüzden UCL'ye VE Süper Lig'e uğrayan biri ikisini de
// sürekli açık görüyordu. Artık gerçek bir akordeon: aynı anda en fazla BİR
// bölüm açık.
export default function NavDropdown({ label, icon, items, isActive, isOpen, onToggle }) {
  return (
    <div className={`sidebar-dropdown ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className={`sidebar-link sidebar-dropdown-trigger ${isActive ? "active" : ""}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="sidebar-link-icon">{icon}</span>
        <span className="sidebar-link-label">{label}</span>
        <span className="sidebar-dropdown-caret" aria-hidden="true">▾</span>
      </button>
      {isOpen && (
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

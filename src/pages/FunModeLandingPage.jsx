import React from "react";
import { Link } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";

// Eğlence Modu'nun TEK, merkezi giriş kapısı -- ana menüden (bkz. NavBar.jsx
// "Diğer" menüsü) doğrudan buraya gelinir; kullanıcı önce hangi yarışmanın
// kura çekimi/sezon simülasyonunu deneyeceğini burada seçer. UCL/Süper
// Lig'in kendi GERÇEK VERİ sayfaları bu akışa hiç karışmaz -- oradaki
// "🎮 Eğlence Modu" kısayolu da yine buradaki AYNI rotalara gider.
export default function FunModeLandingPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Simülasyon</div>
          <h1>🎮 Eğlence Modu</h1>
          <p>
            Burası gerçek veri sayfalarından TAMAMEN AYRI, kurgusal bir simülasyon alanı -- kendi kuranı çek, kendi
            sezonunu simüle et, eleme turlarını izle. Hiçbir sonucu gerçek değildir, sadece bu sitenin istatistiksel
            modeline göre üretilir.
          </p>
        </div>
      </header>

      <div className="fun-mode-grid">
        {COMPETITION_LIST.map((comp) => {
          const to = hasRealDataSupport(comp.key)
            ? `/${comp.key}/${comp.format === "swiss" ? "kura-simulasyonu" : "sezon-simulasyonu"}`
            : `/${comp.key}`;
          return (
            <Link key={comp.key} to={to} className="fun-mode-card">
              <span className="fun-mode-card-icon" aria-hidden="true">
                {comp.format === "swiss" ? "🎲" : "🏆"}
              </span>
              <span className="fun-mode-card-name">{comp.shortName}</span>
              <span className="fun-mode-card-desc">
                {comp.format === "swiss" ? "Kura çekimi simülasyonu" : "Sezon simülasyonu"}
              </span>
              <span className="fun-mode-card-cta">Başlat →</span>
            </Link>
          );
        })}
      </div>

      <p className="footnote">
        Gerçek fikstür/puan durumu/haberler için yarışmaların kendi sayfalarına (ör. UCL, Süper Lig) gidebilirsin --
        bu sayfa sadece simülasyon/eğlence amaçlıdır.
      </p>
    </div>
  );
}

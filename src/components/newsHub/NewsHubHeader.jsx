import React from "react";
import { Link } from "react-router-dom";
import { getCompetition } from "../../data/competitions.js";

// Haberler & Sezon Hikayesi sayfalarının ortak başlığı (Stitch "Football Hub"
// tasarımı): sayfa yolu, durum çipleri, başlık ve iki görünüm arasında geçiş
// yapan sekme düğmeleri. Her iki görünüm de ayrı route olarak kalıyor
// (/:key/haberler ve /:key/sezon-hikayesi) -- sekmeler bu route'lara link.
export default function NewsHubHeader({ competitionKey, active, lastDate, itemCount }) {
  const competition = getCompetition(competitionKey);

  return (
    <header className="sa-hub-header">
      <div className="sa-hub-crumbs">
        <Link to={`/${competitionKey}`}>{competition.name}</Link>
        <span>/</span>
        <span className="is-current">Haberler & Sezon Hikayesi</span>
      </div>

      <div className="sa-hub-status">
        <span className="sa-status-chip">
          <span className="sa-check" aria-hidden="true">✓</span> Kaynaklı gerçek içerik
          {lastDate ? ` · son kayıt ${lastDate}` : ""}
        </span>
        {typeof itemCount === "number" && <span className="sa-status-chip is-green">{itemCount} kayıt</span>}
      </div>

      <div className="sa-hub-title-row">
        <div>
          <h1 className="sa-hub-title">Haberler & Sezon Hikayesi</h1>
          <p className="sa-hub-subtitle">
            Kulüp gelişmeleri, maç özetleri ve haftalık kırılma anlarıyla 2026–27 sezonunun kaynaklı, tarihli
            kronolojisi.
          </p>
        </div>
        <div className="sa-segmented" role="tablist">
          <Link
            to={`/${competitionKey}/haberler`}
            role="tab"
            aria-selected={active === "news"}
            className={`sa-segmented-item ${active === "news" ? "active" : ""}`}
          >
            <span aria-hidden="true">▤</span> Haberler
          </Link>
          <Link
            to={`/${competitionKey}/sezon-hikayesi`}
            role="tab"
            aria-selected={active === "story"}
            className={`sa-segmented-item ${active === "story" ? "active" : ""}`}
          >
            <span aria-hidden="true">↗</span> Sezon Hikayesi (Zaman Çizelgesi)
          </Link>
        </div>
      </div>
    </header>
  );
}

import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeasonArchive } from "../state/SeasonArchiveContext.jsx";
import Crest from "../components/Crest.jsx";

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}

function ArchiveCard({ entry, onRemove }) {
  const captureRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setCapturing(true);
    try {
      // html2canvas oldukça büyük bir kütüphane -- sadece kullanıcı gerçekten
      // indirmeye tıkladığında (dinamik import ile) yüklenir, sayfanın ilk
      // açılış paketini şişirmez.
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0e1d4a",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${entry.competitionShortName.replace(/\s+/g, "-")}-${entry.champion.short || "sampiyon"}-sezon.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="archive-card" ref={captureRef}>
      <div className="archive-card-head">
        <span className="archive-card-comp">{entry.competitionShortName}</span>
        <span className="archive-card-date">{formatDate(entry.savedAt)}</span>
        <button className="btn-ghost archive-card-download" onClick={handleDownload} disabled={capturing} title="Fotoğraf olarak indir">
          {capturing ? "…" : "📸"}
        </button>
        <button className="btn-ghost archive-card-remove" onClick={() => onRemove(entry.id)} title="Arşivden sil">
          ✕
        </button>
      </div>

      <div className="archive-card-champion">
        <Crest team={entry.champion} size={44} />
        <div>
          <div className="archive-card-champion-label">
            {entry.viaKnockout ? "🏆 Şampiyon (Eleme Turu)" : "🏆 Şampiyon"}
          </div>
          <div className="archive-card-champion-name">{entry.champion.name}</div>
          {entry.meta && (
            <div className="archive-card-champion-meta">
              {entry.meta.pts != null && `${entry.meta.pts} puan · `}
              {entry.meta.w}G {entry.meta.d}B {entry.meta.l}M
            </div>
          )}
        </div>
      </div>

      {entry.standingsTop?.length > 0 && (
        <div className="archive-card-standings">
          {entry.standingsTop.map((s) => (
            <div key={s.teamId} className="archive-card-standings-row">
              <span>#{s.rank}</span>
              <span>{s.short}</span>
              <span>{s.pts} p</span>
            </div>
          ))}
        </div>
      )}

      {entry.topScorer && (
        <div className="archive-card-scorer">
          ⚽ Gol Kralı: <b>{entry.topScorer.name}</b> ({entry.topScorer.teamName} · {entry.topScorer.goals} gol)
        </div>
      )}
    </div>
  );
}

export default function ArchivePage() {
  const { entries, removeEntry, clearArchive } = useSeasonArchive();

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Geçmiş Sezonlar</div>
          <h1>Sezon Arşivi</h1>
          <p>
            Bir yarışmada şampiyon belirlendiğinde (Süper Lig sezonu ya da UCL/Avrupa Ligi eleme
            turu finali) o sezonun özeti otomatik olarak buraya kaydedilir -- tarayıcında kalıcıdır,
            sayfayı yenilesen de kaybolmaz.
          </p>
        </div>
        {entries.length > 0 && (
          <div className="page-header-actions">
            <button className="btn-secondary" onClick={clearArchive}>
              Arşivi Tamamen Temizle
            </button>
          </div>
        )}
      </header>

      {entries.length === 0 ? (
        <div className="empty-card">
          <h2>Arşiv henüz boş</h2>
          <p>Bir yarışmayı tamamla (sezonu başlat / eleme turunu bitir) -- şampiyon belirlenince otomatik burada görünecek.</p>
          <div className="empty-card-actions">
            <Link to="/" className="btn-primary">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      ) : (
        <div className="archive-grid">
          {entries.map((entry) => (
            <ArchiveCard key={entry.id} entry={entry} onRemove={removeEntry} />
          ))}
        </div>
      )}
    </div>
  );
}

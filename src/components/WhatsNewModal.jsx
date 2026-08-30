import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext.jsx";

const FEATURES = [
  { icon: "🔎", title: "Global Arama", desc: "Navbar'daki kutudan herhangi bir takım/oyuncuyu bulup profiline atla.", to: null },
  { icon: "🏟️", title: "Kariyer Modu", desc: "Şampiyon olunca \"Yeni Sezona Geç\" ile takım katsayıları kalıcı olarak evrilir.", to: null },
  { icon: "🏅", title: "26 Rozet", desc: "Kura çekmekten kadro kurmaya, tahmin tutturmaya kadar -- otomatik açılır.", to: "/basarilar" },
  { icon: "🔗", title: "Paylaşım Linki", desc: "Rüya Takım kadronu ya da tahminini bir linkle arkadaşına gönder.", to: null },
  { icon: "▶", title: "Canlı Maç İzle", desc: "Maç Merkezi'nde dakika dakika gol/kart akışını sesli anlatımla izle.", to: null },
  { icon: "⚙️", title: "Gelişmiş Ayarlar", desc: "Gol ortalaması, sakatlık sıklığı gibi model parametrelerini kendine göre ayarla.", to: "/ayarlar" },
  { icon: "🖐️", title: "Rüya Takım Sahası", desc: "Oyuncuları sahada istediğin noktaya sürükle -- mobilde de çalışır.", to: "/ruya-takim" },
];

export default function WhatsNewModal() {
  const { isOpen, closeTour } = useOnboarding();
  const navigate = useNavigate();
  if (!isOpen) return null;

  const goTo = (to) => {
    closeTour();
    if (to) navigate(to);
  };

  return (
    <div className="whatsnew-overlay" onClick={closeTour}>
      <div className="whatsnew-modal" onClick={(e) => e.stopPropagation()}>
        <div className="whatsnew-head">
          <div>
            <span className="whatsnew-eyebrow">✨ Yenilikler</span>
            <h2>Futbol Simülatör'de Neler Var?</h2>
            <p>Uygulama epey büyüdü -- işte kısa bir tur.</p>
          </div>
          <button type="button" className="whatsnew-x" onClick={closeTour} aria-label="Kapat">
            ✕
          </button>
        </div>
        <div className="whatsnew-body">
          <div className="whatsnew-grid">
            {FEATURES.map((f) => (
              <button
                key={f.title}
                type="button"
                className={`whatsnew-item ${f.to ? "is-clickable" : ""}`}
                onClick={() => goTo(f.to)}
              >
                <span className="whatsnew-item-icon">{f.icon}</span>
                <div>
                  <div className="whatsnew-item-title">{f.title}</div>
                  <div className="whatsnew-item-desc">{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <button className="btn-primary whatsnew-close-btn" onClick={closeTour}>
            Anladım, Başlayalım →
          </button>
        </div>
      </div>
    </div>
  );
}

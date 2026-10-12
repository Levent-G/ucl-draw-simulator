import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext.jsx";

// 2026-09-27 güncellemesi: eski liste hâlâ simülasyon-döneminden kalma
// özellikleri (ör. "Gelişmiş Ayarlar" -> kaldırılan /ayarlar sayfası)
// listeliyordu ve sitenin şu anki asıl kimliğini (GERÇEK UCL/Süper Lig
// verisi + Tahmin Ligi) hiç yansıtmıyordu. İki bölüme ayrıldı: önce sitenin
// gerçek çekirdek özellikleri, sonra "ekstra" (eğlence modu + yardımcı)
// özellikler -- kullanıcı geri bildirimi: "yenilikler kısmını güncelle,
// daha iyi tasarım yap".
const REAL_FEATURES = [
  {
    icon: "🌍",
    title: "Gerçek UCL & Süper Lig Verisi",
    desc: "Gerçek fikstür, güncel puan durumu, kadrolar ve sonuçlar -- statik bir simülasyon değil.",
    to: null,
  },
  {
    icon: "🏆",
    title: "Tahmin Ligi",
    desc: "Arkadaşlarınla kendi ligini kur, her hafta gerçek maçları tahmin et, sezon sonunda kim kazandı gör.",
    to: "/tahmin-ligi",
  },
  {
    icon: "🧠",
    title: "Model Tahminleri",
    desc: "Formu ve gidişatı hesaba katan istatistiksel model, her maç için olasılık ve tahmini skor üretir.",
    to: null,
  },
  {
    icon: "🔮",
    title: "Gerçek Muhtemel Kadrolar",
    desc: "Takımın son GERÇEK maçındaki dizilişi baz alınır, sonradan sakat/cezalı olanlar otomatik değiştirilir.",
    to: null,
  },
  {
    icon: "📖",
    title: "Sezon Hikayesi",
    desc: "Şampiyonluk yarışı, düşme hattı ve form grafikleriyle sezonun hikayesini tek sayfada özetler.",
    to: null,
  },
];

const EXTRA_FEATURES = [
  {
    icon: "🔎",
    title: "Global Arama",
    desc: "Navbar'daki kutudan herhangi bir takım/oyuncuyu bulup profiline atla.",
    to: null,
  },
  {
    icon: "🏅",
    title: "Rozetler",
    desc: "Kura çekmekten kadro kurmaya, tahmin tutturmaya kadar -- otomatik açılır.",
    to: "/basarilar",
  },
  {
    icon: "🖐️",
    title: "Rüya Takım Sahası",
    desc: "Oyuncuları sahada istediğin noktaya sürükle, kadronu bir linkle arkadaşına gönder.",
    to: "/ruya-takim",
  },
  {
    icon: "🎮",
    title: "Eğlence Modu",
    desc: "Kendi kura çekimini yap, sezonu simüle et -- gerçek verilerden tamamen bağımsız, isteğe bağlı bir alan.",
    to: "/eglence-modu",
  },
];

function WhatsNewSection({ title, items, onSelect }) {
  return (
    <div className="whatsnew-section">
      <h3 className="whatsnew-section-title">{title}</h3>
      <div className="whatsnew-grid">
        {items.map((f) => (
          <button
            key={f.title}
            type="button"
            className={`whatsnew-item ${f.to ? "is-clickable" : ""}`}
            onClick={() => onSelect(f.to)}
          >
            <span className="whatsnew-item-icon">{f.icon}</span>
            <div>
              <div className="whatsnew-item-title">{f.title}</div>
              <div className="whatsnew-item-desc">{f.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

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
            <h2>Süper Analiz'de Neler Var?</h2>
            <p>UCL ve Süper Lig için gerçek veri, akıllı tahminler ve arkadaşlarınla yarışabileceğin bir Tahmin Ligi.</p>
          </div>
          <button type="button" className="whatsnew-x" onClick={closeTour} aria-label="Kapat">
            ✕
          </button>
        </div>
        <div className="whatsnew-body">
          <WhatsNewSection title="🎯 Çekirdek Özellikler" items={REAL_FEATURES} onSelect={goTo} />
          <WhatsNewSection title="✨ Ekstralar" items={EXTRA_FEATURES} onSelect={goTo} />
          <button className="btn-primary whatsnew-close-btn" onClick={closeTour}>
            Anladım, Başlayalım →
          </button>
        </div>
      </div>
    </div>
  );
}

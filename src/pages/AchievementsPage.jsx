import React from "react";
import { ACHIEVEMENTS, useAchievements } from "../state/AchievementsContext.jsx";

export default function AchievementsPage() {
  const { unlockedKeys } = useAchievements();

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {unlockedKeys.length} / {ACHIEVEMENTS.length} Açıldı
          </div>
          <h1>Başarılar</h1>
          <p>
            Uygulamayı kullandıkça (kura çekmek, sezon tamamlamak, kadro kurmak, transfer yapmak,
            tahmin tutturmak…) otomatik olarak açılır -- tarayıcında kalıcıdır.
          </p>
        </div>
      </header>

      <div className="achievement-grid">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedKeys.includes(a.key);
          return (
            <div key={a.key} className={`achievement-card ${unlocked ? "is-unlocked" : "is-locked"}`}>
              <span className="achievement-card-icon">{unlocked ? a.icon : "🔒"}</span>
              <div>
                <div className="achievement-card-name">{a.label}</div>
                <div className="achievement-card-desc">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

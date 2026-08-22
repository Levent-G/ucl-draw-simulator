import React from "react";
import { useAchievements } from "../state/AchievementsContext.jsx";

export default function AchievementToasts() {
  const { toasts, dismissToast } = useAchievements();
  if (toasts.length === 0) return null;

  return (
    <div className="achievement-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className="achievement-toast" onClick={() => dismissToast(t.id)}>
          <span className="achievement-toast-icon">{t.icon}</span>
          <div>
            <div className="achievement-toast-label">Başarı Kazanıldı!</div>
            <div className="achievement-toast-name">{t.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

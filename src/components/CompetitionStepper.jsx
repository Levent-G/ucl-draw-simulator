import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";

// Kullanıcının "şimdi ne yapacağım?" diye düşünmesine gerek kalmasın diye,
// eskiden eşit ağırlıklı sekmeler (Kura/Fikstür/İstatistik/Eleme) yerine
// TEK bir doğrusal akış göstergesi: Kura Çekimi -> Fikstür -> (varsa) Eleme
// Turu. Her adım bir öncekinin tamamlanmasına bağlı olarak kilit açılır;
// tamamlanan adımlar ✓ ile işaretlenir. Tahmin (sıralamayı sürükleme, skor
// girme, gol kralı seçme) artık BURADA değil, Canlı Skorlar sayfasında --
// İstatistikler/Karşılıklı Geçmiş/Canlı Skorlar linkleri küçük ikincil bir
// bağlantı satırında kalır.
export default function CompetitionStepper({ competitionKey }) {
  const { competition, hasDraw, hasFixture } = useCompetition(competitionKey);
  const base = `/${competitionKey}`;

  const steps = [
    {
      key: "draw",
      label: competition.format === "swiss" ? "Kura Çekimi" : "Sezon",
      to: base,
      end: true,
      unlocked: true,
      done: hasDraw,
    },
    {
      key: "fixture",
      label: "Fikstür",
      to: `${base}/fikstur`,
      unlocked: hasDraw,
      done: hasFixture,
    },
  ];
  if (competition.hasKnockout) {
    steps.push({
      key: "knockout",
      label: "Eleme Turu",
      to: `${base}/eleme-turu`,
      unlocked: hasFixture,
      done: false,
    });
  }

  return (
    <div className="competition-stepper-wrap">
      <nav className="competition-stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <span className="stepper-connector" aria-hidden="true" />}
            {s.unlocked ? (
              <NavLink
                to={s.to}
                end={s.end}
                className={({ isActive }) => `stepper-step ${isActive ? "active" : ""} ${s.done ? "done" : ""}`}
              >
                <span className="stepper-step-num">{s.done ? "✓" : i + 1}</span>
                {s.label}
              </NavLink>
            ) : (
              <span className="stepper-step locked" title="Önce önceki adımı tamamla">
                <span className="stepper-step-num">{i + 1}</span>
                {s.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="competition-stepper-more">
        <Link to="/canli">📡 Tahmin & Canlı Skorlar</Link>
        <span aria-hidden="true">·</span>
        <Link to={`${base}/istatistik`}>İstatistikler</Link>
        <span aria-hidden="true">·</span>
        <Link to={`${base}/karsilikli`}>Karşılıklı Geçmiş</Link>
        <span aria-hidden="true">·</span>
        <Link to={`${base}/tahmin-ligi`} className="stepper-prediction-league-link">
          🏆 Tahmin Ligi
        </Link>
      </div>
    </div>
  );
}

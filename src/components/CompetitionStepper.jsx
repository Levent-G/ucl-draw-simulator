import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";

// Kullanıcının "şimdi ne yapacağım?" diye düşünmesine gerek kalmasın diye,
// eskiden eşit ağırlıklı sekmeler (Kura/Fikstür/İstatistik/Eleme) yerine
// TEK bir doğrusal akış göstergesi: Kura Çekimi -> Fikstür -> (varsa) Eleme
// Turu. Bu akış artık KENDİ ÇERÇEVELİ kutusunda ("Sıradaki Adımın"), altta
// İstatistikler/Karşılıklı Geçmiş gibi keşif linklerinden GÖRSEL OLARAK
// NETÇE ayrışıyor -- eskiden ikisi yan yana benzer ağırlıkta durup
// birbirine karışıyordu. Tahmin Ligi artık burada değil, navbar'da (bkz.
// NavBar.jsx) -- "Canlı Skorlar" gibi o da site genelinde birincil bir link.
const SECONDARY_VIEWS = [
  { key: "istatistik", icon: "📊", label: "İstatistikler" },
  { key: "karsilikli", icon: "🤝", label: "Karşılıklı Geçmiş" },
];

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

  const nextStep = steps.find((s) => s.unlocked && !s.done);

  return (
    <div className="competition-stepper-wrap">
      <div className="competition-stepper-panel">
        <div className="competition-stepper-panel-head">
          <span className="competition-stepper-hint">🎯 Sıradaki Adımın</span>
          {nextStep && (
            <NavLink to={nextStep.to} end={nextStep.end} className="competition-stepper-next-link">
              {nextStep.label} →
            </NavLink>
          )}
        </div>
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
                  <span className="stepper-step-num">🔒</span>
                  {s.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="competition-stepper-more">
        <span className="competition-stepper-more-label">Ayrıca incele</span>
        {SECONDARY_VIEWS.map((v) => (
          <Link key={v.key} to={`${base}/${v.key}`} className="competition-stepper-more-link">
            {v.icon} {v.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

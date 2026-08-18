import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionSubNav from "../components/CompetitionSubNav.jsx";
import Crest from "../components/Crest.jsx";
import Confetti from "../components/Confetti.jsx";
import { teamsByCoeffDesc } from "../utils/statsSelectors.js";

// UCL/Avrupa Ligi'ndeki animasyonlu kura törenine karşılık, çift devreli
// (round-robin) liglerde gerçek bir "kura" yok -- bu yüzden burada sezonu
// başlatırken kendi hafif, tören havasında bir açılış animasyonu var
// (banner + konfeti + kadro kartlarının sırayla belirmesi), sezon
// tamamlanıp şampiyon belli olunca da benzer bir kutlama animasyonu var.
export default function LeagueHomePage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { hasDraw, simulation, startLeagueSeason, runSimulation, clearCompetition } =
    useCompetition(competitionKey);
  const sortedTeams = teamsByCoeffDesc(competition.teams);

  const [starting, setStarting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const championStanding = simulation?.standings?.[0] || null;
  const champion = championStanding ? teamById[championStanding.teamId] : null;

  const handleStart = () => {
    setStarting(true);
    setShowConfetti(true);
    // Banner ~2.9sn ekranda kalır, sonra fikstür zaten hazır olduğu için
    // kadro kartları (staggered reveal) ve aksiyon butonları belirir.
    window.setTimeout(() => {
      startLeagueSeason();
      setStarting(false);
    }, 2900);
    window.setTimeout(() => setShowConfetti(false), 4600);
  };

  const handleSimulateSeason = () => {
    const sim = runSimulation();
    if (!sim) return;
    setSimulating(true);
    setCelebrating(true);
    setShowConfetti(true);
    // Şampiyon kutlama banner'ı sezon başlangıcından da uzun kalır.
    window.setTimeout(() => {
      setCelebrating(false);
      setSimulating(false);
    }, 4600);
    window.setTimeout(() => setShowConfetti(false), 6200);
  };

  return (
    <div className="page-shell">
      {showConfetti && <Confetti />}
      {starting && (
        <div className="league-start-overlay">
          <div className="league-start-banner">
            <span className="league-start-eyebrow">{competition.tagline}</span>
            <span className="league-start-title">SEZON BAŞLIYOR</span>
            <span className="league-start-sub">{competition.name}</span>
          </div>
        </div>
      )}
      {celebrating && champion && (
        <div className="league-start-overlay">
          <div className="league-start-banner league-champion-banner">
            <span className="league-start-eyebrow">Sezon Tamamlandı</span>
            <Crest team={champion} size={76} />
            <span className="league-start-title league-champion-title">ŞAMPİYON</span>
            <span className="league-champion-banner-name">{champion.name}</span>
            <span className="league-start-sub">
              {championStanding.pts} puan · {championStanding.w}G {championStanding.d}B{" "}
              {championStanding.l}M
            </span>
          </div>
        </div>
      )}

      <CompetitionSubNav competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">{competition.tagline}</div>
          <h1>{competition.name}</h1>
          <p>
            {competition.teams.length} takımlı çift devreli lig (herkes
            herkesle iki kez oynar). Sezonu başlatınca fikstür otomatik
            oluşur; Fikstür &amp; Tahmin sayfasından maç maç tahmin girebilir,
            İstatistikler'den takım/oyuncu/ülke grafiklerini görebilirsin.
          </p>
        </div>
        <div className="page-header-actions">
          {hasDraw ? (
            <>
              <Link to={`/${competitionKey}/fikstur`} className="btn-primary">
                Fikstürü Görüntüle
              </Link>
              <button className="btn-secondary" onClick={handleSimulateSeason} disabled={simulating}>
                {simulating ? "Simüle Ediliyor…" : champion ? "Şampiyonu Yeniden Belirle" : "Şampiyonu Belirle"}
              </button>
              <button className="btn-secondary" onClick={clearCompetition}>
                Sezonu Sıfırla
              </button>
            </>
          ) : (
            <button className="btn-primary league-start-btn" onClick={handleStart} disabled={starting}>
              <span className="league-start-btn-shine" aria-hidden="true" />
              <span className="league-start-btn-icon" aria-hidden="true">
                🏆
              </span>
              {starting ? "Sezon Hazırlanıyor…" : "Sezonu Başlat"}
            </button>
          )}
        </div>
      </header>

      {champion && (
        <div className="league-champion-card">
          <Crest team={champion} size={56} />
          <div>
            <div className="league-champion-card-label">🏆 Sezonun Şampiyonu</div>
            <div className="league-champion-card-name">{champion.name}</div>
            <div className="league-champion-card-meta">
              {championStanding.pts} puan · {championStanding.w}G {championStanding.d}B{" "}
              {championStanding.l}M · Averaj {championStanding.gd > 0 ? "+" : ""}
              {championStanding.gd}
            </div>
          </div>
        </div>
      )}

      <div className="league-home-grid">
        {sortedTeams.map((t, i) => (
          <div
            className="league-home-card league-home-card-in"
            key={t.id}
            style={{ animationDelay: `${Math.min(i * 25, 500)}ms` }}
          >
            <Crest team={t} size={30} />
            <span className="league-home-card-name">{t.name}</span>
            <span className="league-home-card-coeff">{t.coeff}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

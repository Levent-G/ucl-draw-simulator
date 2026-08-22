import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { useSeasonArchive } from "../state/SeasonArchiveContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import Crest from "../components/Crest.jsx";
import Confetti from "../components/Confetti.jsx";
import NextStepCta from "../components/NextStepCta.jsx";
import { teamsByCoeffDesc, topScorers } from "../utils/statsSelectors.js";

// UCL/Avrupa Ligi'ndeki animasyonlu kura törenine karşılık, çift devreli
// (round-robin) liglerde gerçek bir "kura" yok -- bu yüzden burada sezonu
// başlatırken kendi hafif, tören havasında bir açılış animasyonu var
// (banner + konfeti + kadro kartlarının sırayla belirmesi). Şampiyon,
// sezon başladıktan ~1 saniye sonra OTOMATİK belirlenir -- ayrı bir
// tıklama gerekmez, kullanıcı sadece izler. Tüm tahmin/fikstür detayları
// (sıradaki maçlar, sıralama tahmini) buradan değil Canlı Skorlar
// sayfasından görüntülenir.
export default function LeagueHomePage() {
  const { competitionKey } = useParams();
  const {
    competition,
    hasDraw,
    simulation,
    startLeagueSeason,
    runSimulation,
    clearCompetition,
    careerSeason,
    advanceToNextSeason,
  } = useCompetition(competitionKey);
  const { addEntry } = useSeasonArchive();
  const sortedTeams = teamsByCoeffDesc(competition.teams);

  const [starting, setStarting] = useState(false);
  const [determining, setDetermining] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const autoSimFiredRef = useRef(false);

  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const championStanding = simulation?.standings?.[0] || null;
  const champion = championStanding ? teamById[championStanding.teamId] : null;

  const handleSimulateSeason = () => {
    const sim = runSimulation();
    if (!sim) return;

    const winnerStanding = sim.standings?.[0];
    const winnerTeam = winnerStanding ? teamById[winnerStanding.teamId] : null;
    if (winnerTeam) {
      const scorer = topScorers(competition.getAllPlayers(), sim.playerStats, 1)[0];
      addEntry({
        competitionKey,
        competitionName: competition.name,
        competitionShortName: competition.shortName,
        champion: {
          id: winnerTeam.id,
          name: winnerTeam.name,
          short: winnerTeam.short,
          pot: winnerTeam.pot,
          country: winnerTeam.country,
          coeff: winnerTeam.coeff,
          logo: winnerTeam.logo,
        },
        meta: { pts: winnerStanding.pts, w: winnerStanding.w, d: winnerStanding.d, l: winnerStanding.l },
        standingsTop: sim.standings.slice(0, 5).map((s) => ({
          teamId: s.teamId,
          short: teamById[s.teamId]?.short || "",
          rank: s.rank,
          pts: s.pts,
        })),
        topScorer:
          scorer && scorer.goals > 0
            ? { name: scorer.name, teamName: teamById[scorer.teamId]?.name || "", goals: scorer.goals }
            : null,
      });
    }

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

  const handleStart = () => {
    setStarting(true);
    setShowConfetti(true);
    // Banner ~2.9sn ekranda kalır, sonra fikstür zaten hazır olduğu için
    // kadro kartları (staggered reveal) belirir.
    window.setTimeout(() => {
      startLeagueSeason();
      setStarting(false);
    }, 2900);
    window.setTimeout(() => setShowConfetti(false), 4600);
  };

  // Fikstür oluşur oluşmaz (hasDraw true olur olmaz), ~1 saniye sonra
  // şampiyonu otomatik belirle -- kullanıcı sadece izlesin, ayrı bir
  // "Şampiyonu Belirle" tıklamasına gerek kalmasın. Bu 1 saniyelik
  // bekleme boşlukta geçmesin diye "Şampiyon Belirleniyor…" ekranı
  // gösterilir.
  useEffect(() => {
    if (!hasDraw) {
      autoSimFiredRef.current = false;
      setDetermining(false);
      return;
    }
    if (!simulation && !autoSimFiredRef.current) {
      autoSimFiredRef.current = true;
      setDetermining(true);
      const t = window.setTimeout(() => {
        setDetermining(false);
        handleSimulateSeason();
      }, 1000);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraw, simulation]);

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
      {determining && (
        <div className="league-start-overlay">
          <div className="league-start-banner league-determining-banner">
            <span className="league-start-eyebrow">Lig Fazı Simüle Ediliyor</span>
            <span className="league-determining-spinner" aria-hidden="true" />
            <span className="league-start-title">ŞAMPİYON BELİRLENİYOR…</span>
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

      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {competition.tagline}
            {careerSeason > 1 && <span className="career-season-badge">🏟️ Kariyer · {careerSeason}. Sezon</span>}
          </div>
          <h1>{competition.name}</h1>
          <p>
            {competition.teams.length} takımlı çift devreli lig (herkes
            herkesle iki kez oynar). Sezonu başlatınca fikstür otomatik
            oluşur ve şampiyon kısa süre sonra kendiliğinden belli olur --
            sıradaki maçlar ve sıralama tahminini Canlı Skorlar sayfasından
            takip edebilirsin.
          </p>
        </div>
        <div className="page-header-actions">
          {hasDraw ? (
            <>
              <Link to="/canli" className="btn-primary">
                Canlı Skorlar'da Tahminleri Gör
              </Link>
              {champion && (
                <button className="btn-secondary" onClick={handleSimulateSeason} disabled={simulating}>
                  {simulating ? "Simüle Ediliyor…" : "Şampiyonu Yeniden Belirle"}
                </button>
              )}
              {champion && (
                <button
                  className="btn-primary"
                  onClick={() => advanceToNextSeason(champion.id)}
                  title="Bu sezonun performansına göre katsayılar güncellenir, yeni bir sezona geçilir"
                >
                  🏟️ Yeni Sezona Geç (Kariyer)
                </button>
              )}
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

      {champion && (
        <NextStepCta
          title="Şampiyon belli oldu -- peki istatistikler ne diyor?"
          description={`${champion.name} ve liginin tüm gol kralı/kart/kadro istatistiklerini incele.`}
          to={`/${competitionKey}/istatistik`}
          label="İstatistiklere Git"
          icon="📊"
        />
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

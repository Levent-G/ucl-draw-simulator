import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import Crest from "../components/Crest.jsx";
import { speak, unlockSpeech, cancelSpeech } from "../utils/speech.js";
import { useAchievements } from "../state/AchievementsContext.jsx";

const EVENT_ICON = { goal: "⚽", yellow: "🟨", red: "🟥", sub: "🔄" };
const PLAYBACK_SPEEDS = [
  { key: 1, label: "1x", msPerMinute: 160 },
  { key: 2, label: "2x", msPerMinute: 80 },
  { key: 4, label: "4x", msPerMinute: 35 },
];

function goalCallLine(ev, homeTeam, awayTeam, homeScore, awayScore) {
  const scorerName = ev.player?.name || "bilinmeyen oyuncu";
  const teamName = ev.teamId === homeTeam.id ? homeTeam.name : awayTeam.name;
  return `Gol! ${ev.minute}. dakikada ${teamName} adına ${scorerName}. Skor şimdi ${homeTeam.short} ${homeScore} - ${awayScore} ${awayTeam.short}.`;
}

function EventRow({ event, homeTeamId }) {
  const isHome = event.teamId === homeTeamId;
  const content = (() => {
    if (event.type === "goal") {
      return (
        <>
          <b>{event.player?.name || "Bilinmeyen oyuncu"}</b>
          {event.assist && <span className="timeline-sub-info"> (asist: {event.assist.name})</span>}
        </>
      );
    }
    if (event.type === "yellow" || event.type === "red") {
      return <b>{event.player?.name || "Bilinmeyen oyuncu"}</b>;
    }
    return (
      <>
        <span className="timeline-sub-out">{event.outPlayer?.name}</span>
        <span className="timeline-sub-arrow"> ➜ </span>
        <b>{event.inPlayer?.name}</b>
      </>
    );
  })();

  return (
    <div className="timeline-event timeline-event-in">
      <span className="timeline-desc timeline-desc-away">{!isHome ? content : null}</span>
      <span className="timeline-center">
        <span className="timeline-minute">{event.minute}'</span>
        <span className="timeline-icon" aria-hidden="true">
          {EVENT_ICON[event.type]}
        </span>
      </span>
      <span className="timeline-desc timeline-desc-home">{isHome ? content : null}</span>
    </div>
  );
}

export default function MatchCenterPage() {
  const { competitionKey, matchId } = useParams();
  const { competition, hasFixture, simulation } = useCompetition(competitionKey);

  const match = useMemo(
    () => simulation?.matchResults.find((m) => String(m.id) === matchId) || null,
    [simulation, matchId]
  );
  const events = match?.events || [];
  const homeTeam = match?.homeTeam;
  const awayTeam = match?.awayTeam;

  // idle: henüz izlenmedi (tam akış statik gösterilir) · playing/paused: canlı
  // oynatma sürüyor · finished: canlı oynatma bitti (tam akış gösterilir).
  const [playMode, setPlayMode] = useState("idle");
  const [currentMinute, setCurrentMinute] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const lastAnnouncedRef = useRef(0);
  const { unlock } = useAchievements();

  useEffect(() => {
    if (playMode === "finished") unlock("spiker");
  }, [playMode, unlock]);

  useEffect(() => {
    if (ttsEnabled) unlock("sesli-anlatim-hayrani");
  }, [ttsEnabled, unlock]);

  // Farklı bir maça geçilince (matchId değişince) oynatma durumu sıfırlanır.
  useEffect(() => {
    setPlayMode("idle");
    setCurrentMinute(0);
    lastAnnouncedRef.current = 0;
    cancelSpeech();
    return () => cancelSpeech();
  }, [matchId]);

  // Dakika sayacı -- "playing" iken seçili hıza göre ilerler, 90'a ulaşınca durur.
  useEffect(() => {
    if (playMode !== "playing") return undefined;
    const speedCfg = PLAYBACK_SPEEDS.find((s) => s.key === speed) || PLAYBACK_SPEEDS[0];
    const id = window.setInterval(() => {
      setCurrentMinute((m) => {
        if (m + 1 >= 90) {
          window.clearInterval(id);
          setPlayMode("finished");
          return 90;
        }
        return m + 1;
      });
    }, speedCfg.msPerMinute);
    return () => window.clearInterval(id);
  }, [playMode, speed]);

  // Dakika ilerledikçe sırası gelen olayları "duyurur" -- gol ise (ve sesli
  // anlatım açıksa) TTS ile anons eder. Aynı olay iki kez anons edilmesin
  // diye lastAnnouncedRef ile takip edilir.
  useEffect(() => {
    if (playMode === "idle" || !homeTeam || !awayTeam) return;
    while (lastAnnouncedRef.current < events.length && events[lastAnnouncedRef.current].minute <= currentMinute) {
      const idx = lastAnnouncedRef.current;
      const ev = events[idx];
      if (ev.type === "goal" && ttsEnabled) {
        const soFar = events.slice(0, idx + 1).filter((e) => e.type === "goal");
        const hs = soFar.filter((e) => e.teamId === homeTeam.id).length;
        const as = soFar.filter((e) => e.teamId === awayTeam.id).length;
        speak(goalCallLine(ev, homeTeam, awayTeam, hs, as), true, { cancelFirst: true });
      }
      lastAnnouncedRef.current = idx + 1;
    }
  }, [currentMinute, playMode, events, homeTeam, awayTeam, ttsEnabled]);

  const isLivePlayback = playMode === "playing" || playMode === "paused";
  const visibleEvents = isLivePlayback ? events.filter((e) => e.minute <= currentMinute) : events;
  const liveHomeGoals = isLivePlayback ? visibleEvents.filter((e) => e.type === "goal" && e.teamId === homeTeam?.id).length : match?.homeGoals ?? 0;
  const liveAwayGoals = isLivePlayback ? visibleEvents.filter((e) => e.type === "goal" && e.teamId === awayTeam?.id).length : match?.awayGoals ?? 0;

  const handlePlay = () => {
    unlockSpeech();
    lastAnnouncedRef.current = 0;
    setCurrentMinute(0);
    setPlayMode("playing");
  };
  const handlePauseResume = () => setPlayMode((m) => (m === "playing" ? "paused" : "playing"));
  const handleSkipToEnd = () => {
    cancelSpeech();
    setCurrentMinute(90);
    setPlayMode("finished");
  };

  if (!hasFixture || !simulation) {
    return (
      <div className="page-shell">
        <CompetitionStepper competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Önce bir model tahmini gerekiyor</h2>
          <p>Maç Merkezi'ni görebilmek için önce Fikstür &amp; Tahmin sayfasından bir simülasyon üretilmeli.</p>
          <div className="empty-card-actions">
            <Link to={`/${competitionKey}/fikstur`} className="btn-primary">
              Fikstür &amp; Tahmin sayfasına git
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="page-shell">
        <CompetitionStepper competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Maç bulunamadı</h2>
          <p>Bu maç şu anki fikstürde yok -- fikstür yeniden dağıtılmış olabilir.</p>
          <div className="empty-card-actions">
            <Link to={`/${competitionKey}/fikstur`} className="btn-primary">
              Fikstür &amp; Tahmin sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {competition.shortName} · {match.matchdayNumber}. Hafta · Maç Merkezi
          </div>
          <h1>
            {homeTeam.name} — {awayTeam.name}
          </h1>
          <p>
            Dakika dakika simüle edilmiş gol, kart ve oyuncu değişikliği akışı. Gerçek maç
            verisi değildir -- model tahminine göre üretilmiş bir anlatımdır.
          </p>
        </div>
      </header>

      <div className="matchcenter-scorebar">
        <div className="matchcenter-team">
          <Crest team={homeTeam} size={54} />
          <span>{homeTeam.name}</span>
        </div>
        <div className="matchcenter-score">
          {liveHomeGoals} : {liveAwayGoals}
          {isLivePlayback && <span className="matchcenter-live-minute">{currentMinute}'</span>}
        </div>
        <div className="matchcenter-team matchcenter-team-away">
          <span>{awayTeam.name}</span>
          <Crest team={awayTeam} size={54} />
        </div>
      </div>

      <div className="matchcenter-playback-bar">
        {playMode === "idle" && (
          <button className="btn-primary" onClick={handlePlay}>
            ▶ Canlı İzle
          </button>
        )}
        {isLivePlayback && (
          <>
            <button className="btn-secondary" onClick={handlePauseResume}>
              {playMode === "playing" ? "⏸ Duraklat" : "▶ Devam Et"}
            </button>
            <button className="btn-ghost" onClick={handleSkipToEnd}>
              ⏭ Sona Atla
            </button>
            <div className="matchcenter-speed-picker">
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s.key}
                  className={speed === s.key ? "active" : ""}
                  onClick={() => setSpeed(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
        {playMode === "finished" && (
          <button className="btn-secondary" onClick={handlePlay}>
            🔁 Baştan İzle
          </button>
        )}
        <label className="matchcenter-tts-toggle">
          <input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} />
          🔊 Sesli Anlatım
        </label>
        {isLivePlayback && (
          <div className="matchcenter-progress-track">
            <div className="matchcenter-progress-fill" style={{ width: `${(currentMinute / 90) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="matchcenter-timeline-card">
        <div className="timeline-marker">Maç Başladı — 0'</div>
        {events.length === 0 ? (
          <p className="standings-empty">Bu maçta kayda değer bir olay üretilmedi.</p>
        ) : visibleEvents.length === 0 ? (
          <p className="standings-empty">Maç henüz başlamadı…</p>
        ) : (
          visibleEvents.map((ev, i) => <EventRow key={i} event={ev} homeTeamId={homeTeam.id} />)
        )}
        {(!isLivePlayback || playMode === "finished") && (
          <div className="timeline-marker timeline-marker-end">
            Maç Bitti — {match.homeGoals} : {match.awayGoals}
          </div>
        )}
      </div>

      {match.sidelined?.length > 0 && (
        <div className="matchcenter-sidelined-card">
          <h3>🩹 Kadro Dışı</h3>
          <p className="matchcenter-sidelined-note">
            Önceki haftalardaki kırmızı kart cezası ya da sakatlık nedeniyle bu maçta forma
            giyemeyen oyuncular (kurgusal -- gerçek sakatlık verisi değildir).
          </p>
          <div className="matchcenter-sidelined-list">
            {match.sidelined.map((s) => (
              <div key={s.playerId} className="matchcenter-sidelined-row">
                <Crest team={s.teamId === homeTeam.id ? homeTeam : awayTeam} size={16} />
                <span>{s.name}</span>
                <span className="matchcenter-sidelined-reason">
                  {s.reason === "kırmızı kart cezası" ? "🟥 Kart Cezası" : "🩹 Sakatlık"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

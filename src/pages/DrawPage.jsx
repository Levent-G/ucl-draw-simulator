import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { generateFullDraw, buildAnnouncementPlan } from "../utils/drawEngine.js";
import { createEmptyResults } from "../utils/resultsHelpers.js";
import { findDerby } from "../utils/derbies.js";
import { speak, cancelSpeech, unlockSpeech } from "../utils/speech.js";
import ControlBar from "../components/ControlBar.jsx";
import DrumSphere from "../components/DrumSphere.jsx";
import AnnouncerPanel from "../components/AnnouncerPanel.jsx";
import PotTablesPanel from "../components/PotTablesPanel.jsx";
import FinalResultsGrid from "../components/FinalResultsGrid.jsx";
import FinalFavoriteSummary from "../components/FinalFavoriteSummary.jsx";
import PaperReveal from "../components/PaperReveal.jsx";
import CurrentDrawPanel from "../components/CurrentDrawPanel.jsx";
import DerbyBanner from "../components/DerbyBanner.jsx";
import FavoriteTeamPicker from "../components/FavoriteTeamPicker.jsx";
import StartOrb from "../components/StartOrb.jsx";
import Confetti from "../components/Confetti.jsx";
import FixtureCta from "../components/fixture/FixtureCta.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";

// mix: sıradaki takım çekilmeden önce topların karışma süresi
// eject: topun küreden fırlayıp ekrana gelme süresi
// paper: kağıdın ekranda açık kalma süresi
// reveal: sol alttaki panelde rakiplerin tık tık görünme aralığı (faz 1)
// fill: tablo hücrelerinin tık tık dolma aralığı (faz 2)
// phaseGap: faz 1 bitip faz 2 başlarken aradaki kısa duraklama
const SPEED_DELAYS = {
  slow: { mix: 3200, eject: 950, paper: 2800, reveal: 780, fill: 680, phaseGap: 500 },
  normal: { mix: 2400, eject: 880, paper: 2300, reveal: 620, fill: 540, phaseGap: 420 },
  fast: { mix: 1500, eject: 720, paper: 1500, reveal: 380, fill: 340, phaseGap: 260 },
};

function buildEvents(plan) {
  const events = [];
  for (const group of plan) {
    events.push({ type: "pick", team: group.team, opponents: group.opponents });
    for (const opp of group.opponents) {
      events.push({ type: "reveal", team: group.team, opp });
    }
    for (const opp of group.opponents) {
      events.push({ type: "fill", team: group.team, opp });
    }
  }
  events.push({ type: "complete" });
  return events;
}

function applyMatchToResults(results, team, opp) {
  const next = { ...results };
  const teamFixtures = { ...next[team.id] };
  teamFixtures[opp.viaPot] = {
    ...teamFixtures[opp.viaPot],
    [opp.home ? "home" : "away"]: opp.team,
  };
  next[team.id] = teamFixtures;

  const oppFixtures = { ...next[opp.team.id] };
  oppFixtures[team.pot] = {
    ...oppFixtures[team.pot],
    [opp.home ? "away" : "home"]: team,
  };
  next[opp.team.id] = oppFixtures;

  return next;
}

function cellKeysFor(team, opp) {
  const teamKey = `${team.id}:${opp.viaPot}:${opp.home ? "home" : "away"}`;
  const oppKey = `${opp.team.id}:${team.pot}:${opp.home ? "away" : "home"}`;
  return { teamKey, oppKey };
}

// Tablodaki N takımın 8'er hücresi de dolmuş mu diye bakar. Doluysa artık
// çekilecek/gösterilecek yeni bir şey kalmamış demektir.
function isResultsComplete(results, teams) {
  for (const team of teams) {
    const fixtures = results[team.id];
    for (const pot of [1, 2, 3, 4]) {
      if (!fixtures[pot].home || !fixtures[pot].away) return false;
    }
  }
  return true;
}

// Sadece ?tahminLigi=1 ile buraya yönlendirilmiş bir kura tamamlandığında
// gösterilir. Firebase'i (Auth + Firestore) TAMAMEN dinamik import ile
// yükler -- DrawPage her kullanıcı için (Tahmin Ligi'yle hiç ilgilenmeyenler
// dahil) her zaman yüklenen bir sayfa olduğundan, buraya statik bir Firebase
// import'u main bundle'ı büyütürdü (bkz. PredictionLeaguePage.jsx'teki AYNI
// endişe). `auth`/`db` tekil (singleton) modüller olduğundan, kullanıcı bu
// akışa girmeden önce Tahmin Ligi sayfasında zaten giriş yapmış olmalı --
// dinamik import burada AYNI modül örneğine ulaşır, oturum durumu korunur.
function PredictionLeagueTransferCta({ competitionKey, results }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleTransfer = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const [{ auth, db }, firestore, { buildLeaguePayload }] = await Promise.all([
        import("../lib/firebase.js"),
        import("firebase/firestore"),
        import("../state/PredictionLeagueContext.jsx"),
      ]);
      const { addDoc, collection, doc, setDoc, serverTimestamp } = firestore;
      const user = auth.currentUser;
      if (!user) {
        setError("Önce Tahmin Ligi sayfasından Google ile giriş yapmalısın, sonra buraya dönüp tekrar dene.");
        return;
      }
      // Bu kura, bir ÖNCEKİ ziyarette Tahmin Ligi tarafından mı başlatıldı
      // (bkz. PredictionLeaguePage: "Kura Çek" -> buraya ?tahminLigi=1 ile
      // yönlendirir) yoksa kullanıcı bu kurayı sıradan bir kura olarak mı
      // çekti fark etmez -- her iki durumda da GERÇEKTEN İZLEDİĞİ bu kura
      // (results) yeni bir lig odasının temelini oluşturur.
      const payload = await buildLeaguePayload(competitionKey, null, results);
      const leagueRef = await addDoc(collection(db, "leagues"), {
        ...payload,
        name: name.trim() || `${competitionKey.toUpperCase()} Tahmin Ligi`,
        createdBy: user.uid,
        createdByName: user.displayName || "Bilinmeyen",
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "memberships", `${leagueRef.id}_${user.uid}`), {
        leagueId: leagueRef.id,
        competitionKey,
        uid: user.uid,
        displayName: user.displayName || "Bilinmeyen",
        photoURL: user.photoURL || null,
        joinedAt: serverTimestamp(),
      });
      navigate(`/${competitionKey}/tahmin-ligi/${leagueRef.id}`);
    } catch (e) {
      setError(e.message || "Oluşturulamadı, tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stats-callout prediction-league-transfer-cta">
      <p>🏆 Bu kurayla yeni bir Tahmin Ligi odası oluştur -- linkini arkadaşlarınla paylaşınca onlar da bu AYNI eşleşmeleri görüp tahmin edecek.</p>
      <div className="prediction-league-transfer-form">
        <input
          type="text"
          placeholder={`Lig adı (opsiyonel, ör. "${competitionKey.toUpperCase()} Arkadaş Grubu")`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="prediction-score-input prediction-league-name-input"
        />
        <button className="btn-primary" onClick={handleTransfer} disabled={submitting}>
          {submitting ? "Oluşturuluyor…" : "✅ Tahmin Ligi Oluştur"}
        </button>
      </div>
      {error && <p style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}

export default function DrawPage() {
  const { competitionKey } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Tahmin Ligi'nin "Kura Çek" düğmesi buraya ?tahminLigi=1 ile yönlendirir --
  // kura biter bitmez ekstra bir "Tahmin Ligi'ne Aktar" butonu gösteriyoruz
  // (bkz. aşağıdaki PredictionLeagueTransferCta). Firebase/Firestore bu
  // sayfada HİÇ import edilmiyor (bundle boyutu için, bkz.
  // PredictionLeaguePage.jsx'teki not) -- o kod sadece butona tıklanınca
  // dinamik import ile yüklenir.
  const forPredictionLeague = searchParams.get("tahminLigi") === "1";
  const {
    competition,
    setDrawResults,
    clearCompetition,
    hasDraw,
    results: persistedResults,
  } = useCompetition(competitionKey);
  const { teams: TEAMS, potColors: POT_COLORS, countryNames: COUNTRY_NAMES } = competition;
  const [phase, setPhase] = useState("idle"); // idle | drawing | done
  const [speed, setSpeed] = useState("normal");
  const [results, setResults] = useState(() => createEmptyResults(TEAMS));
  const [drawnTeamIds, setDrawnTeamIds] = useState(new Set());
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [activePot, setActivePot] = useState(1);
  const [currentTeamOpponents, setCurrentTeamOpponents] = useState([]);
  const [pendingCells, setPendingCells] = useState(new Set());
  const [logs, setLogs] = useState([]);
  const [pickSignal, setPickSignal] = useState(0);
  const [sphereVisible, setSphereVisible] = useState(false);
  const [revealTeam, setRevealTeam] = useState(null);
  const [revealKey, setRevealKey] = useState(0);
  const [paperVisible, setPaperVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uclLogoFailed, setUclLogoFailed] = useState(false);

  // Favori takım / tahmin oyunu / sesli anlatım / yerel çekiliş sayacı
  const [favoriteTeamId, setFavoriteTeamId] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [drawCount, setDrawCount] = useState(0);
  const [derbyLabel, setDerbyLabel] = useState(null);
  const [derbyVisible, setDerbyVisible] = useState(false);
  const [derbyKey, setDerbyKey] = useState(0);

  const eventsRef = useRef([]);
  const timeoutRef = useRef(null);
  const speedRef = useRef(speed);
  const tableSectionRef = useRef(null);
  const audioRef = useRef(null);
  const resultsRef = useRef(createEmptyResults(TEAMS));
  const favoriteTeamIdRef = useRef(null);
  const ttsEnabledRef = useRef(true);

  // Yarışma değişirse (rota /ucl'den /europa'ya geçerse) tüm seremoni
  // durumunu bu takımlarla sıfırdan başlat.
  useEffect(() => {
    resultsRef.current = createEmptyResults(TEAMS);
    setPhase("idle");
    setResults(createEmptyResults(TEAMS));
    setDrawnTeamIds(new Set());
    setFavoriteTeamId(null);
    setPredictions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionKey]);

  // Kullanıcı zaten tamamlanmış bir çekilişi olan bir yarışmaya (Fikstür/
  // Eleme Turu sayfalarından ya da başka bir sekmeden) geri dönerse -- bu
  // sayfanın animasyon durumu (phase/results/drawnTeamIds) SADECE bu sayfa
  // örneğine özel yerel state olduğundan, context'teki kalıcı çekiliş
  // sonucundan HABERSİZ kalıp yanılgı yaratacak şekilde "boş, ilk kez
  // buradasın" görünümüne (ÇEKİLİŞİ BAŞLAT overlay'i) dönerdi. Bunun yerine
  // context'te zaten tamam bir çekiliş varsa (hasDraw), animasyonu atlayıp
  // doğrudan tamamlanmış sonucu ve "Yeniden Çek" düğmesini gösteriyoruz --
  // böylece kullanıcı, üstüne yeni bir çekiliş yapmanın MEVCUT fikstürü/
  // eleme turunu sıfırlayacağını görerek bilinçli şekilde "Yeniden Çek"e
  // basabiliyor (bu da handleStart -> resetAll -> clearCompetition() ile
  // fikstür/simülasyon/eleme turunu doğru şekilde temizleyip yeni çekilişe
  // göre yeniden oluşturulmasını tetikler, bkz. FixturePage'teki
  // `if (hasDraw && !fixture) ensureFixture()` efekti).
  useEffect(() => {
    if (hasDraw && persistedResults) {
      resultsRef.current = persistedResults;
      setResults(persistedResults);
      setDrawnTeamIds(new Set(TEAMS.map((t) => t.id)));
      setPhase("done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionKey, hasDraw]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    favoriteTeamIdRef.current = favoriteTeamId;
  }, [favoriteTeamId]);

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  // Çekiliş sayacı bilinçli olarak kalıcı DEĞİL -- sayfa yenilenince (F5)
  // tüm yarışma verileri gibi bu da sıfırdan başlar.
  useEffect(() => {
    setDrawCount(0);
  }, [competitionKey]);

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
      cancelSpeech();
    },
    []
  );

  // Bazı mobil tarayıcılar, sayfa yeniden açıldığında önceki oturumdaki
  // scroll konumunu hatırlayıp otomatik oraya kaydırıyor. Bu yüzden sayfa
  // her yüklendiğinde en başa sarıyoruz.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Çekiliş tamamlandığında (törenle ya da "atla" ile) sonucu paylaşılan
  // competition context'ine yazıyoruz -- Fikstür & İstatistik sayfaları
  // buradan okuyor.
  useEffect(() => {
    if (phase === "done") {
      setDrawResults(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, results]);

  const activeTeam = useMemo(
    () => TEAMS.find((t) => t.id === activeTeamId) || null,
    [activeTeamId, TEAMS]
  );

  const resetAll = useCallback(() => {
    clearTimeout(timeoutRef.current);
    cancelSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    resultsRef.current = createEmptyResults(TEAMS);
    // Çekiliş sıfırlanınca, ona bağlı eski fikstür/tahmin/istatistik de
    // paylaşılan context'ten temizlenir -- yeni çekiliş tamamlanana kadar
    // Fikstür & İstatistik sayfaları "önce kura çek" boş durumunu gösterir.
    clearCompetition();
    setPhase("idle");
    setResults(createEmptyResults(TEAMS));
    setDrawnTeamIds(new Set());
    setActiveTeamId(null);
    setCurrentTeamOpponents([]);
    setPendingCells(new Set());
    setLogs([]);
    setPickSignal(0);
    setSphereVisible(false);
    setRevealTeam(null);
    setPaperVisible(false);
    setShowConfetti(false);
    setProgress(0);
    setError(null);
    setDerbyVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [clearCompetition, TEAMS]);

  const handleToggleFavorite = useCallback((teamId) => {
    setFavoriteTeamId(teamId);
    setPredictions([]);
  }, []);

  const handleTogglePrediction = useCallback((teamId) => {
    setPredictions((prev) => {
      if (prev.includes(teamId)) return prev.filter((id) => id !== teamId);
      if (prev.length >= 3) return prev;
      return [...prev, teamId];
    });
  }, []);

  const processEvent = useCallback((idx) => {
    const events = eventsRef.current;
    if (idx >= events.length) return;
    const ev = events[idx];
    const delays = SPEED_DELAYS[speedRef.current];

    if (ev.type === "pick") {
      setActivePot(ev.team.pot);
      setSphereVisible(true);

      timeoutRef.current = setTimeout(() => {
        setPickSignal((s) => s + 1);

        timeoutRef.current = setTimeout(() => {
          setSphereVisible(false);
          setCurrentTeamOpponents([]);
          setActiveTeamId(ev.team.id);
          setDrawnTeamIds((prev) => new Set(prev).add(ev.team.id));
          setLogs((prev) => [
            ...prev,
            `<b>${
              POT_COLORS[ev.team.pot]?.label
            }</b> — kutudan çıkan takım: <b>${ev.team.name}</b> (${
              COUNTRY_NAMES[ev.team.country] || ev.team.country
            })`,
          ]);
          setRevealTeam(ev.team);
          setRevealKey((k) => k + 1);
          setPaperVisible(true);
          speak(ev.team.name, ttsEnabledRef.current, { cancelFirst: true });

          if (favoriteTeamIdRef.current === ev.team.id) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }

          const allKeys = new Set();
          for (const opp of ev.opponents) {
            const { teamKey, oppKey } = cellKeysFor(ev.team, opp);
            allKeys.add(teamKey);
            allKeys.add(oppKey);
          }
          setPendingCells(allKeys);

          timeoutRef.current = setTimeout(() => {
            setPaperVisible(false);
            timeoutRef.current = setTimeout(() => processEvent(idx + 1), 250);
          }, delays.paper);
        }, delays.eject);
      }, delays.mix);

      setProgress((idx + 1) / events.length);
      return;
    }

    if (ev.type === "reveal") {
      setCurrentTeamOpponents((prev) => [...prev, ev.opp]);
      const venue = ev.opp.home ? "İç sahada" : "Deplasmanda";
      setLogs((prev) => [
        ...prev,
        `${ev.team.name}, ${POT_COLORS[ev.opp.viaPot]?.label} takımı <b>${
          ev.opp.team.name
        }</b> ile eşleşti — ${venue.toLowerCase()} oynayacak.`,
      ]);

      const derby = findDerby(ev.team.short, ev.opp.team.short);
      if (derby) {
        setDerbyLabel(derby.label);
        setDerbyKey((k) => k + 1);
        setDerbyVisible(true);
        setTimeout(() => setDerbyVisible(false), 2000);
      }

      setProgress((idx + 1) / events.length);
      const nextIsFill = events[idx + 1]?.type === "fill";
      const delay = nextIsFill ? delays.phaseGap : delays.reveal;
      timeoutRef.current = setTimeout(() => processEvent(idx + 1), delay);
      return;
    }

    if (ev.type === "fill") {
      const { teamKey, oppKey } = cellKeysFor(ev.team, ev.opp);
      const alreadyFilled =
        resultsRef.current[ev.team.id][ev.opp.viaPot][
          ev.opp.home ? "home" : "away"
        ];
      if (!alreadyFilled) {
        resultsRef.current = applyMatchToResults(
          resultsRef.current,
          ev.team,
          ev.opp
        );
        setResults(resultsRef.current);
      }
      setPendingCells((prev) => {
        const next = new Set(prev);
        next.delete(teamKey);
        next.delete(oppKey);
        return next;
      });

      if (isResultsComplete(resultsRef.current, TEAMS)) {
        setDrawnTeamIds(new Set(TEAMS.map((t) => t.id)));
        setActiveTeamId(null);
        setSphereVisible(false);
        setRevealTeam(null);
        setPaperVisible(false);
        if (audioRef.current) audioRef.current.pause();
        cancelSpeech();
        setLogs((prev) => [
          ...prev,
          `<b>Kura çekimi tamamlandı.</b> Tüm ${TEAMS.length} takımın lig fazı fikstürü belli oldu.`,
        ]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4200);
        setProgress(1);
        setPhase("done");
        return;
      }

      setProgress((idx + 1) / events.length);
      timeoutRef.current = setTimeout(() => processEvent(idx + 1), delays.fill);
      return;
    }

    if (ev.type === "complete") {
      setPhase("done");
      setActiveTeamId(null);
      setSphereVisible(false);
      setRevealTeam(null);
      setPaperVisible(false);
      if (audioRef.current) audioRef.current.pause();
      cancelSpeech();
      setLogs((prev) => [
        ...prev,
        `<b>Kura çekimi tamamlandı.</b> Tüm ${TEAMS.length} takımın lig fazı fikstürü belli oldu.`,
      ]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4200);
      setProgress(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TEAMS, POT_COLORS, COUNTRY_NAMES]);

  const handleStart = useCallback(() => {
    unlockSpeech();
    resetAll();
    try {
      const matches = generateFullDraw(TEAMS);
      const plan = buildAnnouncementPlan(TEAMS, matches);
      eventsRef.current = buildEvents(plan);
      setPhase("drawing");
      setLogs(["Kura çekimi başlıyor..."]);

      setDrawCount((c) => c + 1);

      if (audioRef.current && competitionKey === "ucl") {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.28;
        audioRef.current.play().catch(() => {
          // Ses dosyası eklenmemiş olabilir; sessizce yok say.
        });
      }
      timeoutRef.current = setTimeout(() => processEvent(0), 300);
      if (tableSectionRef.current) {
        tableSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      setError(e.message);
    }
  }, [processEvent, resetAll, drawCount, TEAMS, competitionKey]);

  const handleSkip = useCallback(() => {
    clearTimeout(timeoutRef.current);
    cancelSpeech();
    if (audioRef.current) audioRef.current.pause();
    const events = eventsRef.current;
    let liveResults = createEmptyResults(TEAMS);
    const liveDrawn = new Set();
    const liveLogs = [];
    for (const ev of events) {
      if (ev.type === "pick") {
        liveDrawn.add(ev.team.id);
        liveLogs.push(
          `<b>${POT_COLORS[ev.team.pot]?.label}</b> — kutudan çıkan takım: <b>${
            ev.team.name
          }</b>`
        );
      } else if (ev.type === "fill") {
        liveResults = applyMatchToResults(liveResults, ev.team, ev.opp);
      }
    }
    liveLogs.push(
      `<b>Kura çekimi tamamlandı.</b> Tüm ${TEAMS.length} takımın lig fazı fikstürü belli oldu.`
    );
    resultsRef.current = liveResults;
    setResults(liveResults);
    setDrawnTeamIds(liveDrawn);
    setLogs(liveLogs);
    setActiveTeamId(null);
    setSphereVisible(false);
    setCurrentTeamOpponents([]);
    setPendingCells(new Set());
    setRevealTeam(null);
    setPaperVisible(false);
    setProgress(1);
    setPhase("done");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4200);
  }, [TEAMS, POT_COLORS]);

  const isTumbling = phase === "drawing";

  return (
    <div className="app-shell page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      {showConfetti && <Confetti />}
      {competitionKey === "ucl" && (
        <audio ref={audioRef} src="/audio/anthem.mp3" loop preload="none" />
      )}
      <DrumSphere visible={sphereVisible} activePot={activePot} pickSignal={pickSignal} />
      <PaperReveal team={revealTeam} visible={paperVisible} revealKey={revealKey} countryNames={COUNTRY_NAMES} />
      {phase === "drawing" && (
        <button className="draw-skip-fab" onClick={handleSkip}>
          Sonuca Atla ⏭
        </button>
      )}
      <CurrentDrawPanel
        team={phase === "drawing" ? activeTeam : null}
        revealedOpponents={currentTeamOpponents}
      />
      <DerbyBanner label={derbyLabel} visible={derbyVisible} derbyKey={derbyKey} />

      <header className="top-header">
        <div className="brand-row">
          {competitionKey === "ucl" && !uclLogoFailed && (
            <img
              src="/logos/ucl-logo.png"
              alt="Yarışma logosu"
              className="ucl-logo-img"
              onError={() => setUclLogoFailed(true)}
            />
          )}
          <div>
            <div className="brand-eyebrow">{competition.tagline}</div>
            <h1 className="brand-title">{competition.name} Kura Çekimi Simülatörü</h1>
            <p className="brand-sub">
              {TEAMS.length} takım, 4 torba, takım başına 8 maç. Gerçek UEFA lig fazı
              kurallarına (federasyon kısıtı, torba başına ev/deplasman dengesi)
              sadık bir algoritma ile gerçek zamanlı simülasyon.
            </p>
          </div>
        </div>
        <div className="season-badge">{TEAMS.length} TAKIM · 4 TORBA · 8 MAÇ</div>
      </header>

      <ControlBar
        phase={phase}
        speed={speed}
        onSpeedChange={setSpeed}
        onReset={resetAll}
        onSkip={handleSkip}
        progress={progress}
      />

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {phase === "idle" && (
        <FavoriteTeamPicker
          teams={TEAMS}
          favoriteTeamId={favoriteTeamId}
          onSelectFavorite={handleToggleFavorite}
          predictions={predictions}
          onTogglePrediction={handleTogglePrediction}
          ttsEnabled={ttsEnabled}
          onToggleTts={setTtsEnabled}
          drawCount={drawCount}
        />
      )}

      {phase === "idle" && (
        <div className="mobile-start-cta">
          <StartOrb onClick={handleStart} label="ÇEKİLİŞİ" sublabel="BAŞLAT" />
        </div>
      )}

      <div className="main-layout" ref={tableSectionRef}>
        <div className="main-left">
          <PotTablesPanel
            teams={TEAMS}
            results={results}
            drawnTeamIds={drawnTeamIds}
            activeTeamId={activeTeamId}
            pendingCells={pendingCells}
            phase={phase}
            onStart={handleStart}
          />
        </div>

        <div className="main-right">
          <AnnouncerPanel logs={logs} live={isTumbling} />
        </div>
      </div>

      {phase === "done" && (
        <>
          {forPredictionLeague && <PredictionLeagueTransferCta competitionKey={competitionKey} results={results} />}
          <FinalFavoriteSummary
            teams={TEAMS}
            results={results}
            favoriteTeamId={favoriteTeamId}
            predictions={predictions}
          />
          <FixtureCta competitionKey={competitionKey} />
          <FinalResultsGrid teams={TEAMS} results={results} />
        </>
      )}

      {phase === "idle" && (
        <p className="footnote">
          Kurallar: her takım, kendi torbası dahil 4 torbanın her birinden 2'şer
          rakip çeker (toplam 8 maç); bir torbadan çekilen 2 rakipten biri iç
          sahada, diğeri deplasmanda oynanır. Bir takım kendi federasyonundan
          bir takımla asla eşleşmez ve aynı federasyondan en fazla 2 farklı
          rakiple karşılaşabilir. Takım amblemleri ve başlat düğmesi, gerçek
          kulüp logoları ve resmi UEFA amblemi yerine kullanılan özgün
          tasarımlardır.
        </p>
      )}
    </div>
  );
}

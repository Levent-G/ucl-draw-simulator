import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import {
  PredictionLeagueProvider,
  usePredictionAuth,
  useCreateLeague,
  useLeague,
  useMyLeagues,
  usePredictions,
  scorePrediction,
  pointsForPrediction,
  buildLeaderboard,
  CHAMPION_PICK_POINTS,
  KNOCKOUT_TIE_POINTS,
  DRAW_GUESS_POINTS_PER_HIT,
} from "../state/PredictionLeagueContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import MatchdayTabs from "../components/fixture/MatchdayTabs.jsx";
import DragStandings from "../components/fixture/DragStandings.jsx";
import Crest from "../components/Crest.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";

const START_STAGE_LABEL = {
  draw: "Kura çekiliyor…",
  fixture: "Fikstür oluşturuluyor…",
  simulate: "Sezon simüle ediliyor…",
  knockout: "Eleme turu hesaplanıyor…",
  save: "Kaydediliyor…",
};

const POINT_LABEL = { 5: "Tam İsabet!", 3: "Sonuç + Fark", 1: "Sonuç Doğru", 0: "Iskaladın" };

// Google hesabının bir profil fotoğrafı yoksa (ya da fotoğraf yüklenemezse --
// bazı Google hesaplarında/gizlilik ayarlarında bu URL 404 dönebiliyor) boş
// bir kutu göstermek yerine isminin baş harflerinden oluşan, isme göre sabit
// bir renge boyanmış basit bir rozet gösteriyoruz -- klasik "initials avatar"
// deseni.
function initialsOf(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function avatarColor(name) {
  let hash = 0;
  const s = name || "?";
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 42%)`;
}

function Avatar({ photoURL, name, size = 24 }) {
  const [failed, setFailed] = useState(false);
  if (photoURL && !failed) {
    return (
      <img
        src={photoURL}
        alt=""
        onError={() => setFailed(true)}
        className="prediction-league-avatar"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="prediction-league-avatar prediction-league-avatar-initials"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.42 }}
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}

// Firebase, giriş hatalarını ham bir `error.code` (ör. "auth/configuration-not-found")
// olarak fırlatır -- bunlar Firebase Console'da eksik bir kurulum adımına
// işaret eder, kullanıcının anlayabileceği bir dile çeviriyoruz.
function describeAuthError(error) {
  const code = error?.code || "";
  if (code === "auth/configuration-not-found") {
    return "Firebase projesinde Authentication henüz kurulmamış görünüyor -- Firebase Console'da Authentication -> Sign-in method -> Google'ı etkinleştirmen gerekiyor.";
  }
  if (code === "auth/popup-blocked") {
    return "Tarayıcı giriş penceresini engelledi -- bu site için pop-up engelleyiciyi kapatıp tekrar dene.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return null; // kullanıcı bilerek kapattı, hata göstermeye gerek yok
  }
  if (code === "auth/unauthorized-domain") {
    return "Bu site adresi Firebase projesinde yetkili domainler listesinde değil -- Authentication -> Settings -> Authorized domains'e eklenmesi gerekiyor.";
  }
  return error?.message || "Giriş yapılamadı, lütfen tekrar dene.";
}

// Firestore hatalarını da aynı şekilde eyleme geçirilebilir bir mesaja
// çeviriyoruz -- "client is offline" gibi mesajlar genelde gerçek bir
// internet kopukluğu DEĞİL, Firestore Database'in projede hiç
// oluşturulmamış olmasının (ya da kuralların henüz yayınlanmamış olmasının)
// en yaygın belirtisidir.
function describeFirestoreError(error) {
  const code = error?.code || "";
  const message = error?.message || "";
  if (code === "unavailable" || message.includes("client is offline")) {
    return "Firestore'a bağlanılamadı. Bu genelde internet kopukluğundan değil, Firebase Console'da Firestore Database'in HENÜZ OLUŞTURULMAMIŞ olmasından kaynaklanır -- Firestore Database sayfasına gidip 'Create database' demen gerekebilir. Veritabanı zaten varsa, bir sonraki adım firestore.rules'un yayınlanmış olduğundan emin olmak.";
  }
  if (code === "permission-denied") {
    return "Firestore bu isteği reddetti (permission-denied) -- firestore.rules dosyasının içeriğini Firebase Console -> Firestore Database -> Rules sekmesine yapıştırıp Yayınla demen gerekiyor.";
  }
  if (code === "failed-precondition") {
    return "Firestore Database projede henüz oluşturulmamış görünüyor -- Firebase Console -> Firestore Database -> Create database.";
  }
  return message || "Beklenmeyen bir Firestore hatası oluştu.";
}

// PredictionLeagueProvider (dolayısıyla firebase/auth + firebase/firestore
// paketleri) BİLEREK bu sayfaya ÖZEL, yerel bir sarmalayıcıda tutuluyor --
// main.jsx'te GLOBAL olarak sarılsaydı, Firebase SDK'sı (~650KB) Tahmin
// Ligi'ni hiç kullanmayan herkesin de ilk yükleme paketine dahil olurdu. Bu
// sayfa zaten lazy-load edildiğinden (bkz. main.jsx), sağlayıcıyı da burada
// tutmak Firebase'i SADECE bu sayfaya girildiğinde indirtir.
export default function PredictionLeaguePage() {
  return (
    <PredictionLeagueProvider>
      <PredictionLeagueGate />
    </PredictionLeagueProvider>
  );
}

// /:competitionKey/tahmin-ligi (leagueId YOK) -> Liglerim + Yeni Lig Oluştur.
// /:competitionKey/tahmin-ligi/:leagueId (leagueId VAR) -> o lig odası.
function PredictionLeagueGate() {
  const { leagueId } = useParams();
  return leagueId ? <PredictionLeagueRoom /> : <PredictionLeagueLanding />;
}

function AuthHeader({ competition, title }) {
  const { user, authLoading, signInWithGoogle, signOutUser } = usePredictionAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(null);

  const handleSignIn = async () => {
    setSigningIn(true);
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const message = describeAuthError(e);
      if (message) setSignInError(message);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Kendi Aramızda</div>
          <h1>{title}</h1>
        </div>
        {user && (
          <div className="page-header-actions prediction-league-user">
            <Avatar photoURL={user.photoURL} name={user.displayName} size={28} />
            <span>{user.displayName}</span>
            <button className="btn-secondary" onClick={signOutUser}>
              Çıkış Yap
            </button>
          </div>
        )}
      </header>

      {authLoading && <p className="footnote">Yükleniyor…</p>}

      {!authLoading && !user && (
        <div className="stats-callout prediction-league-signin">
          <p>Tahmin Ligi'ne katılmak için Google hesabınla giriş yapmalısın.</p>
          <button className="btn-primary" onClick={handleSignIn} disabled={signingIn}>
            {signingIn ? "Giriş yapılıyor…" : "🔑 Google ile Giriş Yap"}
          </button>
          {signInError && <p style={{ color: "#f87171" }}>{signInError}</p>}
        </div>
      )}
    </>
  );
}

// ============================================================================
// LANDING: /:competitionKey/tahmin-ligi -- Liglerim + Yeni Lig Oluştur.
// ============================================================================
const MAX_DRAW_GUESS_TEAMS = 5;
const MAX_DRAW_GUESSES_PER_TEAM = 3;

function PredictionLeagueLanding() {
  const { competitionKey } = useParams();
  const navigate = useNavigate();
  const competition = getCompetition(competitionKey);
  const hasDraw = competition.format === "swiss";
  const { user } = usePredictionAuth();
  const createLeague = useCreateLeague();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useMyLeagues(competitionKey);

  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);
  const [startStage, setStartStage] = useState(null);
  const [startError, setStartError] = useState(null);

  // Kura eşleşmesi tahmini (opsiyonel, sadece swiss formatta): lig (ve
  // dolayısıyla gerçek fikstür) oluşmadan HEMEN ÖNCE, kullanıcı BİRDEN FAZLA
  // takım seçip her biri için rakip tahmin edebilir -- bu SADECE burada,
  // lig oluşturulmadan önce yapılabilir (bkz. useCreateLeague'deki not).
  const [drawGuesses, setDrawGuesses] = useState([]); // [{favoriteTeamId, guesses:[]}]
  const [pickerTeamId, setPickerTeamId] = useState("");
  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const sortedTeams = useMemo(
    () => [...competition.teams].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [competition]
  );
  const usedTeamIds = useMemo(() => new Set(drawGuesses.map((g) => g.favoriteTeamId)), [drawGuesses]);
  const pickableTeams = useMemo(() => sortedTeams.filter((t) => !usedTeamIds.has(t.id)), [sortedTeams, usedTeamIds]);

  const addDrawGuessTeam = (teamId) => {
    if (!teamId || drawGuesses.length >= MAX_DRAW_GUESS_TEAMS) return;
    setDrawGuesses((prev) => [...prev, { favoriteTeamId: teamId, guesses: [] }]);
    setPickerTeamId("");
  };
  const removeDrawGuessTeam = (teamId) => {
    setDrawGuesses((prev) => prev.filter((g) => g.favoriteTeamId !== teamId));
  };
  const toggleDrawGuessOpponent = (teamId, opponentId) => {
    setDrawGuesses((prev) =>
      prev.map((g) => {
        if (g.favoriteTeamId !== teamId) return g;
        const has = g.guesses.includes(opponentId);
        if (has) return { ...g, guesses: g.guesses.filter((id) => id !== opponentId) };
        if (g.guesses.length >= MAX_DRAW_GUESSES_PER_TEAM) return g;
        return { ...g, guesses: [...g.guesses, opponentId] };
      })
    );
  };

  // Kura çekimi ekranından TAMAMEN bağımsız: yarışma formatı ne olursa olsun
  // (UCL/Avrupa Ligi'nin İsviçre modeli kura+fikstürü dahil), lig burada
  // doğrudan, arka planda (headless) oluşturulur -- kullanıcının önce
  // animasyonlu kura ekranına gidip kura çekmesi GEREKMEZ. Puanlama şu an
  // bu şekilde üretilen kurgusal simülasyona göre hesaplanıyor; gerçek/canlı
  // sonuçlara göre puanlama ileride ayrı bir iyileştirme olarak eklenecek.
  const handleCreate = async () => {
    setStarting(true);
    setStartError(null);
    setStartStage("draw");
    try {
      const leagueId = await createLeague(competitionKey, name.trim(), setStartStage, drawGuesses);
      navigate(`/${competitionKey}/tahmin-ligi/${leagueId}`);
    } catch (e) {
      setStartError(describeFirestoreError(e));
    } finally {
      setStarting(false);
      setStartStage(null);
    }
  };

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <AuthHeader competition={competition} title={`${competition.shortName} — Tahmin Ligi`} />

      {user && (
        <>
          <div className="stats-callout">
            <p>
              Bir Tahmin Ligi <b>arkadaşlarınla paylaştığın bir link</b> üzerinden çalışır: sen bir lig oluşturursun,
              linkini gönderirsin, onlar da katılıp AYNI eşleşmeleri tahmin eder. Herkes birbirinin tahminini
              görebilir (kendi tahminini yaptıktan sonra).
            </p>
            <div className="prediction-league-transfer-form">
              <input
                type="text"
                placeholder={`Lig adı (opsiyonel, ör. "${competition.shortName} Arkadaş Grubu")`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="prediction-score-input prediction-league-name-input"
              />
              <button className="btn-primary" onClick={handleCreate} disabled={starting}>
                {starting ? (startStage ? START_STAGE_LABEL[startStage] : "Oluşturuluyor…") : "🏆 Yeni Tahmin Ligi Oluştur"}
              </button>
            </div>
            {startError && <p style={{ color: "#f87171" }}>{startError}</p>}
          </div>

          {hasDraw && (
            <div className="chart-card chart-card-wide">
              <h3>🔮 Kura Eşleşmesi Tahmini (opsiyonel)</h3>
              <p className="footnote">
                Lig oluşmadan HEMEN ÖNCE, istediğin kadar takım seç (en fazla {MAX_DRAW_GUESS_TEAMS}) ve her biri için
                kimlerle eşleşeceğini tahmin et (takım başına en fazla {MAX_DRAW_GUESSES_PER_TEAM}) -- doğru bilinen
                her rakip <b>{4} puan</b> kazandırır. Bu tahmin sadece burada, lig kurulmadan önce yapılabilir.
              </p>

              {drawGuesses.map((g) => {
                const favTeam = teamById[g.favoriteTeamId];
                const eligible = sortedTeams.filter((t) => t.id !== g.favoriteTeamId && t.country !== favTeam?.country);
                return (
                  <div key={g.favoriteTeamId} className="prediction-picker">
                    <div className="prediction-title">
                      <Crest team={favTeam} size={22} />
                      <span>{favTeam?.name} için {MAX_DRAW_GUESSES_PER_TEAM} rakip tahmin et</span>
                      <span className="prediction-count">{g.guesses.length}/{MAX_DRAW_GUESSES_PER_TEAM}</span>
                      <button className="btn-ghost btn-small" onClick={() => removeDrawGuessTeam(g.favoriteTeamId)}>
                        ✕ Kaldır
                      </button>
                    </div>
                    <div className="prediction-chips">
                      {eligible.map((t) => {
                        const selected = g.guesses.includes(t.id);
                        const disabled = !selected && g.guesses.length >= MAX_DRAW_GUESSES_PER_TEAM;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            className={`prediction-chip ${selected ? "selected" : ""}`}
                            disabled={disabled}
                            onClick={() => toggleDrawGuessOpponent(g.favoriteTeamId, t.id)}
                          >
                            <Crest team={t} size={16} />
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {drawGuesses.length < MAX_DRAW_GUESS_TEAMS && pickableTeams.length > 0 && (
                <div className="prediction-team-add-row">
                  <TeamFilterSelect
                    teams={pickableTeams}
                    value={pickerTeamId}
                    onChange={addDrawGuessTeam}
                    placeholder="Tahmin eklemek için bir takım seç…"
                    allowClear={false}
                  />
                </div>
              )}
            </div>
          )}

          <div className="chart-card chart-card-wide">
            <h3>Liglerim</h3>
            {leaguesLoading ? (
              <p className="footnote">Yükleniyor…</p>
            ) : leaguesError ? (
              <p style={{ color: "#f87171" }}>⚠️ {describeFirestoreError(leaguesError)}</p>
            ) : leagues.length === 0 ? (
              <p className="footnote">
                Henüz bir Tahmin Ligi'ne katılmadın -- yukarıdan yeni bir tane oluştur, ya da bir arkadaşının sana
                attığı linke tıkla.
              </p>
            ) : (
              <div className="prediction-league-list">
                {leagues.map((l) => (
                  <Link key={l.id} to={`/${competitionKey}/tahmin-ligi/${l.id}`} className="prediction-league-list-row">
                    <span className="prediction-league-list-name">🏆 {l.name}</span>
                    <span className="footnote">{l.createdByName} tarafından oluşturuldu</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// ROOM: /:competitionKey/tahmin-ligi/:leagueId -- gerçek tahmin akışı.
// ============================================================================
function PredictionLeagueRoom() {
  const { competitionKey, leagueId } = useParams();
  const competition = getCompetition(competitionKey);
  const hasDraw = competition.format === "swiss";
  const { user } = usePredictionAuth();
  const { league, loading: leagueLoading, error: leagueError, fixture, deleteLeague } = useLeague(leagueId);
  const {
    predictions,
    myPredictionsByMatch,
    othersPredictionsByMatch,
    submitScorePrediction,
    submitChampionPick,
    submitKnockoutPick,
    submitStandingsPick,
    resetMyPredictions,
  } = usePredictions(leagueId);

  const championPrediction = myPredictionsByMatch.champion;
  const standingsPrediction = myPredictionsByMatch.standings;
  // "Adım adım" akış: 1) Lig Sıralaması (sürükle-bırak) HERKES için ilk adım
  // -- bu yapılmadan haftalık skorlar/eleme turu/şampiyon sekmeleri kilitli
  // kalır. 2) Haftalık skorlar. 3) Eleme turu (varsa). 4) En sonda şampiyon
  // tahmini (varsa).
  const [tab, setTab] = useState("standings");
  const laterStagesUnlocked = !!standingsPrediction;

  const [activeMatchday, setActiveMatchday] = useState(1);
  const [teamFilter, setTeamFilter] = useState(""); // "" = tüm takımlar
  const [drafts, setDrafts] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});
  const [championDraft, setChampionDraft] = useState("");
  const [championSubmitting, setChampionSubmitting] = useState(false);
  const [championError, setChampionError] = useState(null);
  const [standingsDraft, setStandingsDraft] = useState(null);
  const [standingsSubmitting, setStandingsSubmitting] = useState(false);
  const [standingsError, setStandingsError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const leaderboard = useMemo(() => (league ? buildLeaderboard(predictions, league) : []), [predictions, league]);
  const drawPredictions = useMemo(() => predictions.filter((p) => p.kind === "draw"), [predictions]);

  const activeMatches = useMemo(() => {
    const all = fixture?.find((md) => md.number === activeMatchday)?.matches || [];
    if (!teamFilter) return all;
    return all.filter((m) => m.homeTeam.id === teamFilter || m.awayTeam.id === teamFilter);
  }, [fixture, activeMatchday, teamFilter]);

  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const sortedTeams = useMemo(
    () => [...competition.teams].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [competition]
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Linki kopyala:", window.location.href);
    }
  };

  const handleStandingsSubmit = async () => {
    const order = standingsDraft || sortedTeams.map((t) => t.id);
    setStandingsSubmitting(true);
    setStandingsError(null);
    try {
      await submitStandingsPick(order);
      setTab("lig");
    } catch (e) {
      setStandingsError(describeFirestoreError(e));
    } finally {
      setStandingsSubmitting(false);
    }
  };

  const [resettingMine, setResettingMine] = useState(false);
  const [resetMineError, setResetMineError] = useState(null);
  const handleResetMine = async () => {
    if (!window.confirm("Bu ligdeki TÜM tahminlerini silmek istediğine emin misin? Bu işlem geri alınamaz.")) return;
    setResettingMine(true);
    setResetMineError(null);
    try {
      await resetMyPredictions();
    } catch (e) {
      setResetMineError(describeFirestoreError(e));
    } finally {
      setResettingMine(false);
    }
  };

  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const handleDeleteLeague = async () => {
    if (
      !window.confirm(
        "Bu Tahmin Ligi'ni silmek, ligdeki HERKESİN tahminlerini kalıcı olarak silecek. Emin misin?"
      )
    )
      return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteLeague();
      navigate(`/${competitionKey}/tahmin-ligi`);
    } catch (e) {
      setDeleteError(describeFirestoreError(e));
    } finally {
      setDeleting(false);
    }
  };

  const handleDraftChange = (matchId, field, value) => {
    setDrafts((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }));
  };

  const handleSubmit = async (matchId) => {
    const draft = drafts[matchId];
    if (!draft || draft.home === "" || draft.away === "" || draft.home == null || draft.away == null) return;
    setSubmitting((prev) => ({ ...prev, [matchId]: true }));
    setSubmitErrors((prev) => ({ ...prev, [matchId]: null }));
    try {
      await submitScorePrediction(matchId, Number(draft.home), Number(draft.away));
    } catch (e) {
      setSubmitErrors((prev) => ({ ...prev, [matchId]: describeFirestoreError(e) }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const handleChampionSubmit = async () => {
    if (!championDraft) return;
    setChampionSubmitting(true);
    setChampionError(null);
    try {
      await submitChampionPick(championDraft);
      setTab("leaderboard");
    } catch (e) {
      setChampionError(describeFirestoreError(e));
    } finally {
      setChampionSubmitting(false);
    }
  };

  const [knockoutSubmitting, setKnockoutSubmitting] = useState({});
  const [knockoutErrors, setKnockoutErrors] = useState({});
  const handleKnockoutPick = async (tieId, pickedTeamId) => {
    setKnockoutSubmitting((prev) => ({ ...prev, [tieId]: true }));
    setKnockoutErrors((prev) => ({ ...prev, [tieId]: null }));
    try {
      await submitKnockoutPick(tieId, pickedTeamId);
    } catch (e) {
      setKnockoutErrors((prev) => ({ ...prev, [tieId]: describeFirestoreError(e) }));
    } finally {
      setKnockoutSubmitting((prev) => ({ ...prev, [tieId]: false }));
    }
  };

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <AuthHeader competition={competition} title={league ? `🏆 ${league.name}` : `${competition.shortName} — Tahmin Ligi`} />

      {user && (
        <div className="prediction-league-toolbar">
          <button className="btn-secondary btn-small" onClick={handleCopyLink}>
            {linkCopied ? "✅ Kopyalandı" : "🔗 Davet Linkini Kopyala"}
          </button>
          <Link to={`/${competitionKey}/tahmin-ligi`} className="footnote">
            ← Liglerim
          </Link>
          {league && (
            <button className="btn-ghost btn-small" onClick={handleResetMine} disabled={resettingMine}>
              {resettingMine ? "…" : "🔄 Tahminlerimi Sıfırla"}
            </button>
          )}
        </div>
      )}
      {resetMineError && <p style={{ color: "#f87171" }}>{resetMineError}</p>}

      {user && leagueLoading && <p className="footnote">Lig kontrol ediliyor…</p>}

      {user && leagueError && (
        <div className="stats-callout" style={{ borderColor: "#f87171" }}>
          <p style={{ color: "#f87171" }}>⚠️ {describeFirestoreError(leagueError)}</p>
        </div>
      )}

      {user && !leagueLoading && !league && !leagueError && (
        <div className="stats-callout">
          <p>Bu link geçersiz ya da lig silinmiş olabilir.</p>
          <Link to={`/${competitionKey}/tahmin-ligi`} className="btn-primary">
            Tahmin Ligi'ne Dön
          </Link>
        </div>
      )}

      {user && league && fixture && (
        <>
          <p className="footnote">
            {hasDraw && (
              <>
                <b>{CHAMPION_PICK_POINTS} puan</b> şampiyon tahmini ·{" "}
              </>
            )}
            <b>5 puan</b> tam skor · <b>3 puan</b> doğru sonuç + doğru gol farkı · <b>1 puan</b> sadece doğru sonuç
            {hasDraw && (
              <>
                {" "}
                · eleme turunda doğru tahmin, tur ilerledikçe (<b>{KNOCKOUT_TIE_POINTS[0]}</b>→
                <b>{KNOCKOUT_TIE_POINTS[3]}</b> puan) daha değerli.
              </>
            )}
          </p>

          {drawPredictions.length > 0 && (
            <div className="chart-card chart-card-wide">
              <h3>🔮 Kura Eşleşmesi Tahminleri</h3>
              <p className="footnote">
                Lig kurulmadan önce yapılan tahminler -- doğru bilinen her rakip{" "}
                <b>{DRAW_GUESS_POINTS_PER_HIT} puan</b> kazandırdı.
              </p>
              <div className="prediction-league-matches">
                {drawPredictions.map((p) => {
                  const favTeam = teamById[p.favoriteTeamId];
                  const realOpponents = new Set(
                    (fixture || []).flatMap((md) =>
                      md.matches
                        .filter((m) => m.homeTeam.id === p.favoriteTeamId || m.awayTeam.id === p.favoriteTeamId)
                        .map((m) => (m.homeTeam.id === p.favoriteTeamId ? m.awayTeam.id : m.homeTeam.id))
                    )
                  );
                  return (
                    <div key={`${p.uid}_${p.favoriteTeamId}`} className="prediction-row-wrap">
                      <div className="prediction-champion-result">
                        <span className="table-team-cell">
                          <Avatar photoURL={p.photoURL} name={p.displayName} size={20} /> <b>{p.displayName}</b> —{" "}
                          {favTeam?.name} için tahmin:
                        </span>
                        <div className="prediction-others-row">
                          {(p.guesses || []).map((teamId) => (
                            <span
                              key={teamId}
                              className={`prediction-others-chip ${realOpponents.has(teamId) ? "prediction-guess-hit" : ""}`}
                            >
                              {realOpponents.has(teamId) ? "✅" : "❌"} {teamById[teamId]?.name || teamId}
                            </span>
                          ))}
                        </div>
                        <p>
                          <b>{pointsForPrediction(p, league)} puan</b>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="stats-tabs">
            <button className={tab === "standings" ? "active" : ""} onClick={() => setTab("standings")}>
              1. Lig Sıralaması
            </button>
            <button
              className={tab === "lig" ? "active" : ""}
              onClick={() => laterStagesUnlocked && setTab("lig")}
              disabled={!laterStagesUnlocked}
              title={laterStagesUnlocked ? "" : "Önce lig sıralaması tahminini yap"}
            >
              2. Haftalık Skorlar
            </button>
            {league.knockout && (
              <button
                className={tab === "eleme" ? "active" : ""}
                onClick={() => laterStagesUnlocked && setTab("eleme")}
                disabled={!laterStagesUnlocked}
                title={laterStagesUnlocked ? "" : "Önce lig sıralaması tahminini yap"}
              >
                3. Eleme Turu
              </button>
            )}
            {hasDraw && (
              <button
                className={tab === "sampiyon" ? "active" : ""}
                onClick={() => laterStagesUnlocked && setTab("sampiyon")}
                disabled={!laterStagesUnlocked}
                title={laterStagesUnlocked ? "" : "Önce lig sıralaması tahminini yap"}
              >
                4. Şampiyon Tahmini
              </button>
            )}
            <button className={tab === "leaderboard" ? "active" : ""} onClick={() => setTab("leaderboard")}>
              🏅 Sıralama
            </button>
          </div>

          {tab === "standings" && (
            <div className="chart-card chart-card-wide">
              <h3>🖐️ Lig Sıralamasını Sürükle-Bırak ile Tahmin Et</h3>
              {standingsPrediction ? (
                <div className="prediction-champion-result">
                  <p className="footnote">
                    Tahminini kaydettin -- gerçek sıralama, sezonun geri kalanı (haftalık skorlar/eleme turu/şampiyon)
                    açığa çıktıkça netleşecek. Puanın: her takım için tahmin ettiğin sıra gerçeğe ne kadar yakınsa o
                    kadar puan (tam isabet = 3, ±1 sıra = 2, ±2 sıra = 1).
                  </p>
                  <p>
                    <b>{pointsForPrediction(standingsPrediction, league)} puan</b> (şu ana kadarki hesaplama)
                  </p>
                  <button className="btn-secondary btn-small" onClick={() => setTab("lig")}>
                    Haftalık Skorlara Geç →
                  </button>

                  {(othersPredictionsByMatch.standings || []).length > 0 && (
                    <div className="prediction-others-list">
                      <p className="footnote" style={{ marginTop: 14 }}>
                        Diğerlerinin şampiyon tahmini (sıralamalarının 1.si):
                      </p>
                      {(othersPredictionsByMatch.standings || []).map((p) => (
                        <div key={p.uid} className="prediction-other-full-row">
                          <Avatar photoURL={p.photoURL} name={p.displayName} size={18} />
                          <span>{p.displayName}:</span>
                          <b>{teamById[p.order?.[0]]?.name || "?"}</b>
                          <span className="footnote">({pointsForPrediction(p, league)} puan)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="footnote">
                    Kura tamamlandı, eşleşmeler belli oldu -- lig aşaması başlamadan ÖNCE, final puan durumunu
                    (1'den son sıraya) tahmin et. Bu, Tahmin Ligi'nin İLK adımı; diğer sekmeler bunu tamamlayana kadar
                    kilitli kalır.
                  </p>
                  <DragStandings
                    teams={competition.teams}
                    order={standingsDraft || sortedTeams.map((t) => t.id)}
                    onReorder={setStandingsDraft}
                    zones={competition.zones}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleStandingsSubmit}
                    disabled={standingsSubmitting}
                    style={{ marginTop: 12 }}
                  >
                    {standingsSubmitting ? "Kaydediliyor…" : "Tahminimi Kaydet"}
                  </button>
                  {standingsError && <p style={{ color: "#f87171" }}>{standingsError}</p>}
                </>
              )}
            </div>
          )}

          {tab === "sampiyon" && hasDraw && laterStagesUnlocked && (
            <div className="chart-card chart-card-wide">
              <h3>🔮 Son Tahmin: Şampiyon Kim Olur?</h3>
              {championPrediction ? (
                <div className="prediction-champion-result">
                  <p>
                    Tahminin: <b>{teamById[championPrediction.pickedTeamId]?.name || "?"}</b>
                  </p>
                  {league.knockout?.champion ? (
                    <p>
                      Gerçek şampiyon: <b>{teamById[league.knockout.champion]?.name || "?"}</b>{" "}
                      <span
                        className={`prediction-points prediction-points-${
                          league.knockout.champion === championPrediction.pickedTeamId ? 5 : 0
                        }`}
                      >
                        ({pointsForPrediction(championPrediction, league)} puan)
                      </span>
                    </p>
                  ) : (
                    <p className="footnote">Eleme turu henüz oynanmadı -- şampiyon belli olunca burada göreceksin.</p>
                  )}
                  <button className="btn-secondary btn-small" onClick={() => setTab("leaderboard")}>
                    Sıralamaya Bak →
                  </button>

                  {(othersPredictionsByMatch.champion || []).length > 0 && (
                    <div className="prediction-others-list">
                      <p className="footnote" style={{ marginTop: 14 }}>
                        Diğerlerinin şampiyon tahmini:
                      </p>
                      {(othersPredictionsByMatch.champion || []).map((p) => (
                        <div key={p.uid} className="prediction-other-full-row">
                          <Avatar photoURL={p.photoURL} name={p.displayName} size={18} />
                          <span>{p.displayName}:</span>
                          <b>{teamById[p.pickedTeamId]?.name || "?"}</b>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="footnote">
                    Bu, Tahmin Ligi'nin SON adımı -- lig sıralaması, haftalık skorlar ve eleme turu tahminlerini
                    yaptıktan sonra, her şeyi göz önünde bulundurarak kimin şampiyon olacağına karar ver. Doğru
                    bilirsen <b>{CHAMPION_PICK_POINTS} puan</b> kazanırsın (Tahmin Ligi'ndeki en yüksek tekil puan).
                  </p>
                  <div className="prediction-champion-picker">
                    <TeamFilterSelect
                      teams={sortedTeams}
                      value={championDraft}
                      onChange={setChampionDraft}
                      placeholder="Bir takım seç…"
                      allowClear={false}
                    />
                    <button
                      className="btn-primary"
                      onClick={handleChampionSubmit}
                      disabled={!championDraft || championSubmitting}
                    >
                      {championSubmitting ? "Kaydediliyor…" : "Tahminimi Kaydet"}
                    </button>
                  </div>
                  {championError && <p style={{ color: "#f87171" }}>{championError}</p>}
                </>
              )}
            </div>
          )}

          {tab === "lig" && laterStagesUnlocked && (
            <>
              <div className="prediction-league-filter-row">
                <MatchdayTabs matchdays={fixture} active={activeMatchday} onSelect={setActiveMatchday} />
                <TeamFilterSelect teams={sortedTeams} value={teamFilter} onChange={setTeamFilter} />
              </div>
              <div className="chart-card chart-card-wide prediction-league-matches">
                {activeMatches.length === 0 && (
                  <p className="footnote">Bu hafta, seçtiğin takımın oynadığı bir maç yok.</p>
                )}
                {activeMatches.map((m) => {
                  const mine = myPredictionsByMatch[m.id];
                  const actual = league.results[m.id];
                  const draft = drafts[m.id] || {};
                  const points = mine && actual ? scorePrediction(mine, actual) : null;
                  const others = mine ? othersPredictionsByMatch[m.id] || [] : [];
                  return (
                    <div key={m.id} className="prediction-row-wrap">
                      <div className="prediction-row">
                        <div className="prediction-row-team">
                          <Crest team={m.homeTeam} size={22} />
                          <span>{m.homeTeam.name}</span>
                        </div>

                        {mine ? (
                          <div className="prediction-row-result">
                            <span className="prediction-row-mine">
                              {mine.homeGoals} - {mine.awayGoals}
                            </span>
                            <span className="prediction-row-actual">
                              {actual ? `Gerçek: ${actual.homeGoals} - ${actual.awayGoals}` : "Gerçek: ?"}
                              {points != null && (
                                <b className={`prediction-points prediction-points-${points}`}>
                                  {" "}
                                  {POINT_LABEL[points]} (+{points})
                                </b>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="prediction-row-input">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={draft.home ?? ""}
                              onChange={(e) => handleDraftChange(m.id, "home", e.target.value)}
                              className="prediction-score-input"
                              aria-label={`${m.homeTeam.name} tahmini gol`}
                            />
                            <span>-</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={draft.away ?? ""}
                              onChange={(e) => handleDraftChange(m.id, "away", e.target.value)}
                              className="prediction-score-input"
                              aria-label={`${m.awayTeam.name} tahmini gol`}
                            />
                            <button
                              className="btn-primary btn-small"
                              onClick={() => handleSubmit(m.id)}
                              disabled={submitting[m.id]}
                            >
                              {submitting[m.id] ? "…" : "Tahmin Et"}
                            </button>
                            {submitErrors[m.id] && (
                              <span className="footnote" style={{ color: "#f87171" }}>
                                {submitErrors[m.id]}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="prediction-row-team prediction-row-team-away">
                          <span>{m.awayTeam.name}</span>
                          <Crest team={m.awayTeam} size={22} />
                        </div>
                      </div>
                      {others.length > 0 && (
                        <div className="prediction-others-row">
                          {others.map((o) => (
                            <span key={o.uid} className="prediction-others-chip">
                              <Avatar photoURL={o.photoURL} name={o.displayName} size={16} /> {o.displayName}:{" "}
                              {o.homeGoals}-{o.awayGoals}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === "eleme" && laterStagesUnlocked && league.knockout && (
            <div className="chart-card chart-card-wide prediction-league-matches">
              {league.knockout.rounds.map((round) => (
                <div key={round.name} className="prediction-knockout-round">
                  <h3>{round.name}</h3>
                  {round.ties.map((tie) => {
                    const teamA = teamById[tie.teamAId];
                    const teamB = teamById[tie.teamBId];
                    const mine = myPredictionsByMatch[tie.id];
                    const pts = mine ? pointsForPrediction(mine, league) : null;
                    const others = mine ? othersPredictionsByMatch[tie.id] || [] : [];
                    return (
                      <div key={tie.id} className="prediction-row-wrap">
                        <div className="prediction-row">
                          <div className="prediction-row-team">
                            <Crest team={teamA} size={22} />
                            <span>{teamA?.name}</span>
                          </div>

                          {mine ? (
                            <div className="prediction-row-result">
                              <span className="prediction-row-mine">
                                Tahminin: {teamById[mine.pickedTeamId]?.short}
                              </span>
                              <span className="prediction-row-actual">
                                Kazanan: {teamById[tie.winnerId]?.short} ({tie.aggA}-{tie.aggB})
                                {pts != null && (
                                  <b className={`prediction-points prediction-points-${pts > 0 ? 5 : 0}`}>
                                    {" "}
                                    (+{pts} puan)
                                  </b>
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="prediction-row-input">
                              <button
                                className="btn-secondary btn-small"
                                onClick={() => handleKnockoutPick(tie.id, teamA.id)}
                                disabled={knockoutSubmitting[tie.id]}
                              >
                                {teamA?.short} kazanır
                              </button>
                              <button
                                className="btn-secondary btn-small"
                                onClick={() => handleKnockoutPick(tie.id, teamB.id)}
                                disabled={knockoutSubmitting[tie.id]}
                              >
                                {teamB?.short} kazanır
                              </button>
                              {knockoutErrors[tie.id] && (
                                <span className="footnote" style={{ color: "#f87171" }}>
                                  {knockoutErrors[tie.id]}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="prediction-row-team prediction-row-team-away">
                            <span>{teamB?.name}</span>
                            <Crest team={teamB} size={22} />
                          </div>
                        </div>
                        {others.length > 0 && (
                          <div className="prediction-others-row">
                            {others.map((o) => (
                              <span key={o.uid} className="prediction-others-chip">
                                <Avatar photoURL={o.photoURL} name={o.displayName} size={16} /> {o.displayName}:{" "}
                                {teamById[o.pickedTeamId]?.short}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {tab === "leaderboard" && (
            <div className="chart-card chart-card-wide">
              <h3>🏅 {league.name} Sıralaması</h3>
              {leaderboard.length === 0 ? (
                <p className="footnote">Henüz kimse tahmin girmedi -- ilk sen ol!</p>
              ) : (
                <table className="sortable-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Kullanıcı</th>
                      <th>Tahmin Sayısı</th>
                      <th>Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row, i) => (
                      <tr key={row.uid} className={user && row.uid === user.uid ? "sorted" : ""}>
                        <td>{i + 1}</td>
                        <td className="table-team-cell">
                          <Avatar photoURL={row.photoURL} name={row.displayName} size={20} />
                          {row.displayName}
                        </td>
                        <td>{row.predicted}</td>
                        <td>
                          <b>{row.points}</b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="prediction-danger-zone">
                <p className="footnote">Bu Tahmin Ligi'ni tamamen silmek -- HERKESİN tahminini ve puanını kalıcı olarak silmek -- istersen:</p>
                <button className="btn-secondary btn-small" onClick={handleDeleteLeague} disabled={deleting}>
                  {deleting ? "Siliniyor…" : "🗑️ Bu Ligi Sil"}
                </button>
                {deleteError && <p style={{ color: "#f87171" }}>{deleteError}</p>}
              </div>
            </div>
          )}
        </>
      )}

      <p className="footnote">
        Not: Gerçek skorlar teknik olarak lig kaydında (Firestore) saklanır --
        arayüz, sen tahmin etmeden o maçın sonucunu (ve diğerlerinin
        tahminlerini) gizler, ama bu sunucu tarafı bir garanti değildir;
        tamamen dürüst oyuncular için tasarlanmış bir deneyimdir.
      </p>
    </div>
  );
}

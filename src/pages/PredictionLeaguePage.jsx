import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import {
  PredictionLeagueProvider,
  usePredictionAuth,
  useCreateLeague,
  useLeague,
  useMyLeagues,
  usePredictions,
  pointsForPrediction,
  buildLeaderboard,
  isMatchRevealed,
  getLeagueMatchResult,
  OUTCOME_CORRECT_POINTS,
} from "../state/PredictionLeagueContext.jsx";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import { formatMatchDate } from "../utils/matchDate.js";
import { toSearchKey } from "../utils/text.js";
import Crest from "../components/Crest.jsx";

// Tahmin Ligi artık TEK bir yarışmaya bağlı değil -- her lig kurulurken
// hangi gerçek veri destekli yarışma(lar)ı (UCL/Süper Lig, ikisi de olabilir)
// kapsayacağı seçilir (bkz. PredictionLeagueContext.buildLeaguePayload).
const REAL_COMPETITIONS = COMPETITION_LIST.filter((c) => hasRealDataSupport(c.key));

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

// /tahmin-ligi (leagueId YOK) -> Liglerim + Yeni Lig Oluştur.
// /tahmin-ligi/:leagueId (leagueId VAR) -> o lig odası.
// ARTIK BİR YARIŞMAYA BAĞLI DEĞİL (eskiden /:competitionKey/tahmin-ligi idi
// -- UCL'de gezerken tıklayınca otomatik UCL ligi oluyordu, kullanıcı
// bunun kafa karıştırıcı olduğunu belirtti). Hangi yarışma(lar)ın
// kapsanacağı artık SADECE lig oluşturma formunda, açıkça seçiliyor.
function PredictionLeagueGate() {
  const { leagueId } = useParams();
  return leagueId ? <PredictionLeagueRoom /> : <PredictionLeagueLanding />;
}

function AuthHeader({ title, right }) {
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
            {right}
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
// LANDING: /tahmin-ligi -- Liglerim + Yeni Lig Oluştur.
// ============================================================================
function PredictionLeagueLanding() {
  const navigate = useNavigate();
  const { user } = usePredictionAuth();
  const createLeague = useCreateLeague();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useMyLeagues();

  const [selectedKeys, setSelectedKeys] = useState(["ucl"]);
  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const toggleKey = (key) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleCreate = async () => {
    if (selectedKeys.length === 0) return;
    setStarting(true);
    setStartError(null);
    try {
      const leagueId = await createLeague(selectedKeys, name.trim());
      navigate(`/tahmin-ligi/${leagueId}`);
    } catch (e) {
      setStartError(describeFirestoreError(e));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="page-shell">
      <AuthHeader title="🏆 Tahmin Ligi" />

      {/* Kullanıcı geri bildirimi: "Tahmin Ligi'nin ne olduğunu, puanların
          neye göre verildiğini bilsin" -- bu yüzden giriş yapmadan önce bile
          görünen, kısa/net bir açıklama kartı. */}
      <div className="prediction-intro-card">
        <h2>Tahmin Ligi Nedir?</h2>
        <p>
          Arkadaşlarınla (ya da yalnız) kurduğun bir lig odasında, her hafta oynanacak <b>gerçek</b> UCL/Süper Lig
          maçlarının skorunu tahmin edersin. Maçın gerçek tarihi gelip sonuç belli olana kadar kimsenin tahmini
          görünmez; maç oynanınca gerçek sonuca göre otomatik puanlanır.
        </p>
        <div className="prediction-intro-points">
          <div className="prediction-intro-point">
            <span className="prediction-intro-point-icon">🎯</span>
            <div>
              <b>5 puan</b> tam skor · <b>3 puan</b> doğru sonuç + doğru gol farkı · <b>1 puan</b> sadece doğru sonuç
            </div>
          </div>
          <div className="prediction-intro-point">
            <span className="prediction-intro-point-icon">📅</span>
            <div>Her hafta o haftanın gerçek maçlarını görür, istediğin herhangi bir maça tahmin yaparsın.</div>
          </div>
          <div className="prediction-intro-point">
            <span className="prediction-intro-point-icon">🏆</span>
            <div>Sezon sonunda (tüm haftalar tamamlanınca) en çok puanı toplayan kazanır.</div>
          </div>
        </div>
      </div>

      {user && (
        <>
          <div className="stats-callout prediction-league-intro">
            <p>
              🔗 <b>Arkadaşlarınla paylaştığın bir link</b> üzerinden çalışır -- lig oluştur, linki gönder, herkes
              aynı maçları tahmin etsin.
            </p>
            <div className="prediction-create-form">
              <div className="prediction-create-field">
                <label>Hangi lig(ler) için? (birden fazla seçebilirsin)</label>
                <div className="prediction-league-choice-row">
                  {REAL_COMPETITIONS.map((comp) => {
                    const selected = selectedKeys.includes(comp.key);
                    return (
                      <button
                        key={comp.key}
                        type="button"
                        className={`prediction-league-choice ${selected ? "selected" : ""}`}
                        onClick={() => toggleKey(comp.key)}
                        aria-pressed={selected}
                      >
                        <span className="prediction-league-choice-check" aria-hidden="true">
                          {selected ? "✓" : ""}
                        </span>
                        <span className="prediction-league-choice-body">
                          <span className="prediction-league-choice-name">{comp.shortName}</span>
                          <span className="prediction-league-choice-tagline">{comp.tagline}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedKeys.length === 0 && <p className="footnote prediction-league-choice-warning">⚠️ En az bir tane seçmelisin.</p>}
              </div>
              <div className="prediction-create-field">
                <label>Lig adı (opsiyonel)</label>
                <input
                  type="text"
                  placeholder={`ör. "${selectedKeys.map((k) => REAL_COMPETITIONS.find((c) => c.key === k)?.shortName).join(" + ") || "Tahmin"} Arkadaş Grubu"`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="prediction-league-name-input"
                />
              </div>
              <button
                className="btn-primary prediction-create-submit"
                onClick={handleCreate}
                disabled={starting || selectedKeys.length === 0}
              >
                {starting ? "Oluşturuluyor…" : "🏆 Yeni Tahmin Ligi Oluştur"}
              </button>
            </div>
            {startError && <p style={{ color: "#f87171" }}>{startError}</p>}
          </div>

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
                {leagues.map((l) => {
                  const keys = l.competitionKeys || (l.competitionKey ? [l.competitionKey] : []);
                  return (
                    <Link key={l.id} to={`/tahmin-ligi/${l.id}`} className="prediction-league-list-row">
                      <span className="prediction-league-list-name">🏆 {l.name}</span>
                      <span className="prediction-league-list-badges">
                        {keys.map((k) => (
                          <span key={k} className="prediction-league-list-badge">
                            {REAL_COMPETITIONS.find((c) => c.key === k)?.shortName || k}
                          </span>
                        ))}
                      </span>
                      <span className="footnote">{l.createdByName} tarafından oluşturuldu</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function mondayOf(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(weekStartMs) {
  const start = new Date(weekStartMs);
  const end = new Date(weekStartMs);
  end.setDate(end.getDate() + 6);
  const startDay = start.toLocaleDateString("tr-TR", { day: "numeric" });
  const endLabel = end.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return `${startDay}-${endLabel}`;
}

// Birden fazla yarışmanın fikstürünü TEK, tarih sıralı bir maç listesine
// düzleştirip GERÇEK TAKVİM HAFTASINA (Pazartesi başlangıçlı) göre gruplar --
// UCL ile Süper Lig'in kendi hafta numaraları birbirinden bağımsız olduğundan
// ("1. Hafta" ikisinde de farklı tarihe denk gelir) ortak bir "hangi hafta"
// kavramı ancak GERÇEK TARİHLERLE kurulabilir.
function buildWeeks(fixturesByKey) {
  const byWeek = new Map();
  for (const [competitionKey, matchdays] of Object.entries(fixturesByKey || {})) {
    for (const md of matchdays) {
      for (const m of md.matches) {
        if (!m.date) continue;
        const weekStart = mondayOf(m.date).getTime();
        if (!byWeek.has(weekStart)) byWeek.set(weekStart, []);
        byWeek.get(weekStart).push({ ...m, competitionKey, matchdayNumber: md.number, matchdayLabel: md.label });
      }
    }
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekStart, matches]) => ({
      weekStart,
      matches: matches.sort((a, b) => new Date(a.date) - new Date(b.date)),
    }));
}

// ============================================================================
// ROOM: /tahmin-ligi/:leagueId -- gerçek tahmin akışı.
// ============================================================================
function PredictionLeagueRoom() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { user } = usePredictionAuth();
  const { league, loading: leagueLoading, error: leagueError, competitionKeys, fixturesByKey, deleteLeague } = useLeague(leagueId);
  const {
    predictions,
    myPredictionsByMatch,
    othersPredictionsByMatch,
    deletePrediction,
    submitScorePrediction,
    submitOutcomePrediction,
    resetMyPredictions,
  } = usePredictions(leagueId);

  const [tab, setTab] = useState("maclar");
  const [teamQuery, setTeamQuery] = useState("");
  const [drafts, setDrafts] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});
  const [editingMatchIds, setEditingMatchIds] = useState({});
  // Varsayılan tahmin şekli "sadece kazananı tahmin et" (3 tıklamalık, hızlı)
  // -- isteyen bir maç için buradan "Tam skor tahmin et"e geçebilir.
  const [scoreModeMatchIds, setScoreModeMatchIds] = useState({});
  const [linkCopied, setLinkCopied] = useState(false);

  const weeks = useMemo(() => buildWeeks(fixturesByKey), [fixturesByKey]);
  const currentWeekIndex = useMemo(() => {
    const idx = weeks.findIndex((w) => w.matches.some((m) => !isMatchRevealed(league, m.id)));
    return idx === -1 ? Math.max(0, weeks.length - 1) : idx;
  }, [weeks, league]);
  // "Sonraki hafta" YOK -- henüz gelmemiş bir haftaya bakmanın bir anlamı
  // yok (o haftanın maçlarına zaten "şu anki hafta" olduğunda sıra gelecek).
  // Sadece GEÇMİŞ haftaları (varsa) gözden geçirmek için geri gidilebilir.
  const [weekOffset, setWeekOffset] = useState(0);
  const activeWeekIndex = Math.min(Math.max(currentWeekIndex + weekOffset, 0), currentWeekIndex);
  const activeWeek = weeks[activeWeekIndex] || null;
  const isViewingPastWeek = activeWeekIndex < currentWeekIndex;

  const filteredMatches = useMemo(() => {
    if (!activeWeek) return [];
    const q = toSearchKey(teamQuery.trim());
    if (!q) return activeWeek.matches;
    return activeWeek.matches.filter(
      (m) => toSearchKey(m.homeTeam?.name || "").includes(q) || toSearchKey(m.awayTeam?.name || "").includes(q)
    );
  }, [activeWeek, teamQuery]);

  const leaderboard = useMemo(() => (league ? buildLeaderboard(predictions, league) : []), [predictions, league]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Linki kopyala:", window.location.href);
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

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const handleDeleteLeague = async () => {
    if (!window.confirm("Bu Tahmin Ligi'ni silmek, ligdeki HERKESİN tahminlerini kalıcı olarak silecek. Emin misin?")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteLeague();
      navigate("/tahmin-ligi");
    } catch (e) {
      setDeleteError(describeFirestoreError(e));
    } finally {
      setDeleting(false);
    }
  };

  const handleDraftChange = (matchId, field, value) => {
    setDrafts((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }));
  };
  const handleChangePrediction = (matchId, currentPrediction) => {
    if (currentPrediction?.kind === "score") {
      setDrafts((prev) => ({
        ...prev,
        [matchId]: { home: String(currentPrediction.homeGoals), away: String(currentPrediction.awayGoals) },
      }));
      setScoreModeMatchIds((prev) => ({ ...prev, [matchId]: true }));
    } else {
      setScoreModeMatchIds((prev) => ({ ...prev, [matchId]: false }));
    }
    setEditingMatchIds((prev) => ({ ...prev, [matchId]: true }));
  };
  const handleCancelChange = (matchId) => setEditingMatchIds((prev) => ({ ...prev, [matchId]: false }));

  const handleSubmit = async (matchId) => {
    const draft = drafts[matchId];
    if (!draft || draft.home === "" || draft.away === "" || draft.home == null || draft.away == null) return;
    setSubmitting((prev) => ({ ...prev, [matchId]: true }));
    setSubmitErrors((prev) => ({ ...prev, [matchId]: null }));
    try {
      if (myPredictionsByMatch[matchId]) await deletePrediction(matchId);
      await submitScorePrediction(matchId, Number(draft.home), Number(draft.away));
      setEditingMatchIds((prev) => ({ ...prev, [matchId]: false }));
    } catch (e) {
      setSubmitErrors((prev) => ({ ...prev, [matchId]: describeFirestoreError(e) }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  // "Sadece kazananı tahmin et" -- teamId HER ZAMAN ev sahibine sabitlenir,
  // result ev sahibinin bakış açısından "win"/"draw"/"loss" olur (bkz.
  // PredictionLeagueContext.pointsForPrediction "outcome" dalı) -- böylece
  // artık kişisel bir "tuttuğun takım" kavramı olmadan da her iki tarafın
  // sonucu tek, tutarlı bir gösterimle temsil edilebiliyor.
  const handleOutcomeSubmit = async (match, result) => {
    const matchId = match.id;
    setSubmitting((prev) => ({ ...prev, [matchId]: true }));
    setSubmitErrors((prev) => ({ ...prev, [matchId]: null }));
    try {
      if (myPredictionsByMatch[matchId]) await deletePrediction(matchId);
      await submitOutcomePrediction(matchId, match.homeTeam.id, result);
      setEditingMatchIds((prev) => ({ ...prev, [matchId]: false }));
    } catch (e) {
      setSubmitErrors((prev) => ({ ...prev, [matchId]: describeFirestoreError(e) }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  function describeOutcomePrediction(prediction, homeTeam, awayTeam) {
    if (prediction.result === "draw") return "Berabere";
    return prediction.result === "win" ? `${homeTeam.short} Kazanır` : `${awayTeam.short} Kazanır`;
  }

  return (
    <div className="page-shell">
      <AuthHeader
        title={league ? `🏆 ${league.name}` : "Tahmin Ligi"}
        right={
          competitionKeys?.length > 0 && (
            <span className="prediction-room-comp-badges">
              {competitionKeys.map((k) => (
                <span key={k} className="prediction-league-list-badge">
                  {REAL_COMPETITIONS.find((c) => c.key === k)?.shortName || k}
                </span>
              ))}
            </span>
          )
        }
      />

      {user && (
        <div className="prediction-league-toolbar">
          <button className="btn-secondary btn-small" onClick={handleCopyLink}>
            {linkCopied ? "✅ Kopyalandı" : "🔗 Davet Linkini Kopyala"}
          </button>
          <Link to="/tahmin-ligi" className="footnote">
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
          <Link to="/tahmin-ligi" className="btn-primary">
            Tahmin Ligi'ne Dön
          </Link>
        </div>
      )}

      {user && league && (
        <>
          <p className="footnote">
            <b>Sadece kazananı tahmin et:</b> doğru bilirsen <b>{OUTCOME_CORRECT_POINTS} puan</b> · <b>Tam skor tahmin et:</b>{" "}
            <b>5 puan</b> tam skor, <b>3 puan</b> doğru sonuç + doğru gol farkı, <b>1 puan</b> sadece doğru sonuç ·
            sezon sonunda en çok puanı toplayan kazanır. Maçın gerçek tarihi geçene kadar tahminler puanlanmaz.
          </p>

          <div className="stats-tabs">
            <button className={tab === "maclar" ? "active" : ""} onClick={() => setTab("maclar")}>
              📅 Haftalık Maçlar
            </button>
            <button className={tab === "leaderboard" ? "active" : ""} onClick={() => setTab("leaderboard")}>
              🏅 Sıralama
            </button>
          </div>

          {tab === "maclar" && (
            <div className="chart-card chart-card-wide prediction-league-matches">
              {weeks.length === 0 ? (
                <p className="footnote">Bu ligin fikstürü henüz yüklenmedi.</p>
              ) : (
                <>
                  <div className="prediction-week-nav">
                    <button
                      className="btn-ghost btn-small"
                      onClick={() => setWeekOffset((o) => o - 1)}
                      disabled={activeWeekIndex === 0}
                    >
                      ← Önceki Hafta
                    </button>
                    <span className="prediction-week-nav-label">
                      {formatWeekLabel(activeWeek.weekStart)}
                      {!isViewingPastWeek && <span className="prediction-week-current-tag">Şu anki hafta</span>}
                    </span>
                    {isViewingPastWeek && (
                      <button className="btn-ghost btn-small" onClick={() => setWeekOffset(0)}>
                        Şu Anki Haftaya Dön →
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    className="prediction-team-search"
                    placeholder="🔎 Takım ara (bu haftadaki maçları filtrele)…"
                    value={teamQuery}
                    onChange={(e) => setTeamQuery(e.target.value)}
                  />

                  {filteredMatches.length === 0 ? (
                    <p className="footnote">
                      {teamQuery ? "Bu isimde bir takımın bu hafta maçı yok." : "Bu hafta hiç maç yok gibi görünüyor."}
                    </p>
                  ) : (
                    filteredMatches.map((m) => {
                      const mine = myPredictionsByMatch[m.id];
                      const revealed = isMatchRevealed(league, m.id);
                      const actual = revealed ? getLeagueMatchResult(league, m.id) : null;
                      const draft = drafts[m.id] || {};
                      // Kullanıcı geri bildirimi: "diğer kullanıcıların
                      // tahminlerini görebilmeliyiz" -- eskiden bu SADECE sen
                      // de tahmin yaptıysan görünüyordu (anti-spoiler), artık
                      // koşulsuz gösteriliyor.
                      const others = othersPredictionsByMatch[m.id] || [];
                      const points = mine && actual ? pointsForPrediction(mine, league) : null;
                      const isEditing = !!mine && !!editingMatchIds[m.id] && !revealed;
                      const showPicker = !mine || isEditing;
                      const useScoreMode = !!scoreModeMatchIds[m.id];
                      const stateClass = !mine
                        ? "needs-action"
                        : isEditing
                          ? "needs-action"
                          : !revealed
                            ? "is-pending"
                            : points > 0
                              ? "is-correct"
                              : "is-wrong";
                      const compLabel = REAL_COMPETITIONS.find((c) => c.key === m.competitionKey)?.shortName || m.competitionKey;
                      const minePredictionLabel = mine
                        ? mine.kind === "score"
                          ? `${mine.homeGoals} - ${mine.awayGoals}`
                          : describeOutcomePrediction(mine, m.homeTeam, m.awayTeam)
                        : null;
                      return (
                        <div key={m.id} className={`prediction-match ${stateClass}`}>
                          <div className="prediction-match-meta">
                            {competitionKeys.length > 1 && <span className="prediction-match-comp-badge">{compLabel}</span>}
                            <span className="prediction-match-date">{formatMatchDate(m.date, { day: "numeric", month: "short" })}</span>
                          </div>
                          <div className="prediction-match-team-row home">
                            <Crest team={m.homeTeam} size={22} />
                            <span>{m.homeTeam.name}</span>
                            {revealed && actual && <b className="team-score">{actual.homeGoals}</b>}
                          </div>

                          <div className="prediction-match-mid">
                            {!showPicker ? (
                              <div className="prediction-pick-line">
                                <span className="pick-text">
                                  <span className="pick-text-tag">Tahminin</span>
                                  {minePredictionLabel}
                                </span>
                                {revealed ? (
                                  <span className={`pick-badge ${points > 0 ? "ok" : "no"}`}>
                                    {points > 0 ? `✅ Doğru bildin +${points}` : "❌ Tutmadı"}
                                  </span>
                                ) : (
                                  <button type="button" className="prediction-change-link" onClick={() => handleChangePrediction(m.id, mine)}>
                                    ✏️ Değiştir
                                  </button>
                                )}
                              </div>
                            ) : revealed ? (
                              <div className="prediction-row-system">
                                <span className="footnote">Bu maç oynandı, artık tahmin yapılamaz.</span>
                              </div>
                            ) : useScoreMode ? (
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
                                <button className="btn-primary btn-small" onClick={() => handleSubmit(m.id)} disabled={submitting[m.id]}>
                                  {submitting[m.id] ? "…" : "Tahmin Et"}
                                </button>
                                <button
                                  type="button"
                                  className="prediction-change-link"
                                  onClick={() => setScoreModeMatchIds((prev) => ({ ...prev, [m.id]: false }))}
                                >
                                  ← Sadece kazananı tahmin et
                                </button>
                                {isEditing && (
                                  <button type="button" className="prediction-change-link" onClick={() => handleCancelChange(m.id)}>
                                    ✕
                                  </button>
                                )}
                                {submitErrors[m.id] && (
                                  <span className="footnote" style={{ color: "#f87171" }}>
                                    {submitErrors[m.id]}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="prediction-outcome-picker">
                                <div className="prediction-pick-row">
                                  <button
                                    className="prediction-pick-btn"
                                    onClick={() => handleOutcomeSubmit(m, "win")}
                                    disabled={submitting[m.id]}
                                  >
                                    {m.homeTeam.short} Kazanır
                                  </button>
                                  <button
                                    className="prediction-pick-btn"
                                    onClick={() => handleOutcomeSubmit(m, "draw")}
                                    disabled={submitting[m.id]}
                                  >
                                    Berabere
                                  </button>
                                  <button
                                    className="prediction-pick-btn"
                                    onClick={() => handleOutcomeSubmit(m, "loss")}
                                    disabled={submitting[m.id]}
                                  >
                                    {m.awayTeam.short} Kazanır
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  className="prediction-change-link"
                                  onClick={() => setScoreModeMatchIds((prev) => ({ ...prev, [m.id]: true }))}
                                >
                                  Ya da tam skor tahmin et →
                                </button>
                                {isEditing && (
                                  <button type="button" className="prediction-change-link" onClick={() => handleCancelChange(m.id)}>
                                    Vazgeç ✕
                                  </button>
                                )}
                                {submitErrors[m.id] && (
                                  <span className="footnote" style={{ color: "#f87171" }}>
                                    {submitErrors[m.id]}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="prediction-match-team-row away">
                            <Crest team={m.awayTeam} size={22} />
                            <span>{m.awayTeam.name}</span>
                            {revealed && actual && <b className="team-score">{actual.awayGoals}</b>}
                          </div>

                          {others.length > 0 ? (
                            <div className="prediction-others-row prediction-match-others">
                              {others.map((o) => (
                                <span key={o.uid} className="prediction-others-chip">
                                  <Avatar photoURL={o.photoURL} name={o.displayName} size={16} /> {o.displayName}:{" "}
                                  {o.kind === "score" ? `${o.homeGoals}-${o.awayGoals}` : describeOutcomePrediction(o, m.homeTeam, m.awayTeam)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="prediction-match-others prediction-match-participants">
                              👥 Bu maça henüz kimse tahmin girmedi.
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          )}

          {tab === "leaderboard" && (
            <div className="chart-card chart-card-wide">
              <h3>🏅 {league.name} Sıralaması</h3>
              <p className="footnote">Puanlar sadece oynanan maçlar için hesaplanır -- maçların tarihi geldikçe burada güncellenir.</p>
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
    </div>
  );
}

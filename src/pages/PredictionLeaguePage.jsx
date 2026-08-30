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
  computeDerivedStandings,
  standingsPoints,
  isMatchRevealed,
  OUTCOME_CORRECT_POINTS,
} from "../state/PredictionLeagueContext.jsx";
import StandingsTable from "../components/fixture/StandingsTable.jsx";
import Crest from "../components/Crest.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";

const OUTCOME_LABEL = { win: "Galibiyet", draw: "Beraberlik", loss: "Mağlubiyet" };
const OUTCOME_VERB = { win: "Kazanır", draw: "Berabere", loss: "Kaybeder" };

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
function PredictionLeagueLanding() {
  const { competitionKey } = useParams();
  const navigate = useNavigate();
  const competition = getCompetition(competitionKey);
  const { user } = usePredictionAuth();
  const createLeague = useCreateLeague();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useMyLeagues(competitionKey);

  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);
  const [startStage, setStartStage] = useState(null);
  const [startError, setStartError] = useState(null);

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
      const leagueId = await createLeague(competitionKey, name.trim(), setStartStage);
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
      <AuthHeader competition={competition} title={`${competition.shortName} — Tahmin Ligi`} />

      {user && (
        <>
          <div className="stats-callout prediction-league-intro">
            <p>
              🔗 <b>Arkadaşlarınla paylaştığın bir link</b> üzerinden çalışır -- lig oluştur, linki gönder, herkes
              aynı eşleşmeleri tahmin etsin.
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
    deletePrediction,
    submitScorePrediction,
    submitOutcomePrediction,
    submitTeamsPick,
    resetMyPredictions,
  } = usePredictions(leagueId);

  const teamsPrediction = myPredictionsByMatch.teams;
  // "Adım adım" akış: 1) Hangi takım(lar)ın maçlarını SEN tahmin edeceksin
  // (geri kalanı sistemin kendi model sonucuna göre otomatik dolar) -- bu
  // yapılmadan haftalık skorlar/sıralama sekmeleri kilitli kalır. 2) Haftalık
  // maçlar -- UCL/Avrupa Ligi'nde (İsviçre modeli) basit bir "tuttuğun takım
  // bu maçtan kaç puan alır" (Galibiyet/Beraberlik/Mağlubiyet) tahmini,
  // Süper Lig'de (çift devreli) tam skor tahmini. 3) Lig Sıralaması -- elle
  // sürüklenmiyor, tahminlerden OTOMATİK hesaplanıyor. Eleme turu tahmini
  // KALDIRILDI -- lig fazı henüz oynanmadığı için gerçek bir eşleşme yok.
  const [tab, setTab] = useState("takimlar");
  const teamsUnlocked = !!teamsPrediction;
  const selectedTeamIds = useMemo(() => new Set(teamsPrediction?.teamIds || []), [teamsPrediction]);

  const [drafts, setDrafts] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});
  const [linkCopied, setLinkCopied] = useState(false);
  const [systemMatchesOpen, setSystemMatchesOpen] = useState(false);

  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const sortedTeams = useMemo(
    () => [...competition.teams].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [competition]
  );

  // "1. Takımların" -- lig kurulduktan SONRA, gerçek fikstür belli olduktan
  // sonra yapılan bir seçim (bu yüzden landing'deki "kura eşleşmesi
  // tahmini"nden ayrı bir kavram): kaç takım seçersen seç, TEK seferlik.
  const [teamsDraft, setTeamsDraft] = useState([]);
  const [teamsPickerValue, setTeamsPickerValue] = useState("");
  const [teamsSubmitting, setTeamsSubmitting] = useState(false);
  const [teamsError, setTeamsError] = useState(null);
  const [editingTeams, setEditingTeams] = useState(false);
  const pickableTeamsForDraft = useMemo(
    () => sortedTeams.filter((t) => !teamsDraft.includes(t.id)),
    [sortedTeams, teamsDraft]
  );
  const addTeamDraft = (teamId) => {
    if (!teamId) return;
    setTeamsDraft((prev) => (prev.includes(teamId) ? prev : [...prev, teamId]));
    setTeamsPickerValue("");
  };
  const removeTeamDraft = (teamId) => {
    setTeamsDraft((prev) => prev.filter((id) => id !== teamId));
  };
  // Zaten bir takım seçimi (teamsPrediction) varsa, eski tahmin YENİ seçim
  // gerçekten gönderilene kadar silinmez -- "Tahmin Sayısı" (bkz.
  // buildLeaderboard) formu açık tutarken anlık düşmesin diye (bkz. maç
  // tahminlerindeki aynı desen: editingMatchIds/handleChangePrediction).
  const handleTeamsSubmit = async () => {
    if (teamsDraft.length === 0) return;
    setTeamsSubmitting(true);
    setTeamsError(null);
    try {
      if (teamsPrediction) await deletePrediction("teams");
      await submitTeamsPick(teamsDraft);
      setEditingTeams(false);
      setTab("lig");
    } catch (e) {
      setTeamsError(describeFirestoreError(e));
    } finally {
      setTeamsSubmitting(false);
    }
  };
  // Zaten seçilmiş takımları değiştirmek istediğinde: taslağı mevcut
  // seçimle doldurup formu tekrar açar -- eski seçime HENÜZ dokunmaz (bkz.
  // handleTeamsSubmit).
  const handleChangeTeams = () => {
    setTeamsDraft(teamsPrediction?.teamIds || []);
    setEditingTeams(true);
  };
  const handleCancelChangeTeams = () => {
    setEditingTeams(false);
    setTeamsError(null);
  };

  const leaderboard = useMemo(
    () =>
      league
        ? buildLeaderboard(predictions, league, { fixture, teams: competition.teams, zones: competition.zones })
        : [],
    [predictions, league, fixture, competition]
  );

  const derivedStandings = useMemo(() => {
    if (!league || !fixture) return [];
    return computeDerivedStandings(fixture, myPredictionsByMatch, league, competition.teams, competition.zones);
  }, [league, fixture, myPredictionsByMatch, competition]);
  const derivedStandingsPoints = useMemo(
    () => (league ? standingsPoints(derivedStandings.map((s) => s.teamId), league.standings) : 0),
    [derivedStandings, league]
  );

  // "Haftalık Skorlar" artık hafta hafta sekmeli DEĞİL -- sezonun tamamındaki
  // (8 hafta) maçların hepsi tek, sürekli bir listede alt alta sıralanıyor
  // (küçük "X. Hafta" başlıklarıyla gruplanmış); tahmin girmediğin "Sistem
  // Tahmini" maçları ise varsayılan olarak KAPALI, ayrı, katlanabilir bir
  // bölümde -- liste çok uzamasın diye.
  const myMatchesByWeek = useMemo(() => {
    if (!fixture) return [];
    return fixture
      .map((md) => ({
        number: md.number,
        label: md.label,
        matches: md.matches.filter((m) => selectedTeamIds.has(m.homeTeam.id) || selectedTeamIds.has(m.awayTeam.id)),
      }))
      .filter((md) => md.matches.length > 0);
  }, [fixture, selectedTeamIds]);
  const systemMatches = useMemo(() => {
    if (!fixture) return [];
    return fixture.flatMap((md) =>
      md.matches
        .filter((m) => !selectedTeamIds.has(m.homeTeam.id) && !selectedTeamIds.has(m.awayTeam.id))
        .map((m) => ({ ...m, weekLabel: md.label }))
    );
  }, [fixture, selectedTeamIds]);

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

  // "Değiştir"e basınca eski tahmin Firestore'dan HEMEN silinmez -- sadece bu
  // maç için formu tekrar açarız (editingMatchIds). Eski tahmin, kullanıcı
  // YENİ değeri gerçekten gönderene kadar yerinde kalır -- böylece "Tahmin
  // Sayısı" (bkz. buildLeaderboard) formu açık tutarken anlık düşüp
  // yükselmez, sadece submit anında (eski silinip yenisi yazılırken) bir an
  // için değişir.
  const [editingMatchIds, setEditingMatchIds] = useState({});
  const handleChangePrediction = (matchId, currentPrediction) => {
    if (currentPrediction?.kind === "score") {
      setDrafts((prev) => ({
        ...prev,
        [matchId]: { home: String(currentPrediction.homeGoals), away: String(currentPrediction.awayGoals) },
      }));
    }
    setEditingMatchIds((prev) => ({ ...prev, [matchId]: true }));
  };
  const handleCancelChange = (matchId) => {
    setEditingMatchIds((prev) => ({ ...prev, [matchId]: false }));
  };

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

  const [outcomeSubmitting, setOutcomeSubmitting] = useState({});
  const [outcomeErrors, setOutcomeErrors] = useState({});
  const handleOutcomeSubmit = async (matchId, teamId, result) => {
    setOutcomeSubmitting((prev) => ({ ...prev, [matchId]: true }));
    setOutcomeErrors((prev) => ({ ...prev, [matchId]: null }));
    try {
      if (myPredictionsByMatch[matchId]) await deletePrediction(matchId);
      await submitOutcomePrediction(matchId, teamId, result);
      setEditingMatchIds((prev) => ({ ...prev, [matchId]: false }));
    } catch (e) {
      setOutcomeErrors((prev) => ({ ...prev, [matchId]: describeFirestoreError(e) }));
    } finally {
      setOutcomeSubmitting((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="page-shell">
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
            {hasDraw ? (
              <>
                Her maç için tuttuğun takımın <b>Galibiyet</b>/<b>Beraberlik</b>/<b>Mağlubiyet</b> alacağını tahmin
                ediyorsun -- doğru bilirsen <b>{OUTCOME_CORRECT_POINTS} puan</b>, yanlışsa 0 · <b>Lig Sıralaması</b>{" "}
                elle sürüklenmiyor, bu tahminlerden otomatik hesaplanıyor.
              </>
            ) : (
              <>
                <b>5 puan</b> tam skor · <b>3 puan</b> doğru sonuç + doğru gol farkı · <b>1 puan</b> sadece doğru
                sonuç · <b>Lig Sıralaması</b> elle sürüklenmiyor, skor tahminlerinden otomatik hesaplanıyor.
              </>
            )}
          </p>

          <div className="stats-tabs">
            <button className={tab === "takimlar" ? "active" : ""} onClick={() => setTab("takimlar")}>
              1. Takımların
            </button>
            <button
              className={tab === "lig" ? "active" : ""}
              onClick={() => teamsUnlocked && setTab("lig")}
              disabled={!teamsUnlocked}
              title={teamsUnlocked ? "" : "Önce hangi takım(lar)ı tahmin edeceğini seç"}
            >
              2. Haftalık Skorlar
            </button>
            <button
              className={tab === "siralama" ? "active" : ""}
              onClick={() => teamsUnlocked && setTab("siralama")}
              disabled={!teamsUnlocked}
              title={teamsUnlocked ? "" : "Önce hangi takım(lar)ı tahmin edeceğini seç"}
            >
              3. Lig Sıralaması
            </button>
            <button className={tab === "leaderboard" ? "active" : ""} onClick={() => setTab("leaderboard")}>
              🏅 Sıralama
            </button>
          </div>

          {tab === "takimlar" && (
            <div className="chart-card chart-card-wide">
              {teamsPrediction && !editingTeams ? (
                <>
                  <h3>✅ Takımların Belli</h3>
                  <p className="footnote">
                    Seçtiğin takımlar -- bundan sonra sadece bunların maçlarına kendi tahminini giriyorsun, geri kalan
                    tüm maçlar sistemin kendi model sonucuna göre otomatik dolduruluyor.
                  </p>
                  <div className="prediction-others-row">
                    {teamsPrediction.teamIds.map((teamId) => (
                      <span key={teamId} className="prediction-others-chip">
                        {teamById[teamId]?.name || teamId}
                      </span>
                    ))}
                  </div>
                  <div className="prediction-teams-done-actions">
                    <button className="btn-secondary btn-small" onClick={() => setTab("lig")}>
                      Haftalık Skorlara Geç →
                    </button>
                    <button className="btn-ghost btn-small" onClick={handleChangeTeams} disabled={teamsSubmitting}>
                      {teamsSubmitting ? "…" : "✏️ Takımları Değiştir"}
                    </button>
                  </div>
                  {teamsError && <p style={{ color: "#f87171" }}>{teamsError}</p>}
                </>
              ) : (
                <div className="prediction-teams-step">
                  <div className="draw-first-step-eyebrow">1. Adım</div>
                  <h3 className="prediction-teams-step-title">Hangi Takımları Tahmin Edeceksin?</h3>
                  <p className="prediction-teams-step-desc">
                    1 ya da daha fazla takım seç. Örneğin sadece <b>Fenerbahçe</b>'yi seçersen, sadece Fenerbahçe'nin
                    8 maçını sen tahmin edersin -- ligdeki diğer 35 takımın maçlarını sistem kendi modeliyle otomatik
                    tahmin eder. Diğer sekmeler bunu tamamlayana kadar kilitli kalır; bu seçim TEK seferliktir (baştan
                    başlamak istersen "Tahminlerimi Sıfırla"yı kullan).
                  </p>

                  <div className="prediction-teams-picker">
                    <TeamFilterSelect
                      teams={pickableTeamsForDraft}
                      value={teamsPickerValue}
                      onChange={(v) => {
                        setTeamsPickerValue(v);
                        addTeamDraft(v);
                      }}
                      placeholder="🔍 Takım ara ve ekle…"
                      allowClear={false}
                    />
                  </div>

                  {teamsDraft.length > 0 ? (
                    <>
                      <div className="prediction-teams-count">{teamsDraft.length} takım seçtin:</div>
                      <div className="prediction-others-row">
                        {teamsDraft.map((teamId) => (
                          <button
                            key={teamId}
                            type="button"
                            className="prediction-chip selected"
                            onClick={() => removeTeamDraft(teamId)}
                          >
                            <Crest team={teamById[teamId]} size={16} />
                            {teamById[teamId]?.name} ✕
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="prediction-teams-count prediction-teams-count-empty">Henüz takım seçmedin.</p>
                  )}

                  <div className="prediction-teams-done-actions">
                    <button
                      className="btn-primary prediction-teams-submit"
                      onClick={handleTeamsSubmit}
                      disabled={teamsDraft.length === 0 || teamsSubmitting}
                    >
                      {teamsSubmitting
                        ? "Kaydediliyor…"
                        : teamsDraft.length === 0
                          ? "Önce en az 1 takım seç"
                          : `${teamsDraft.length} Takımla Devam Et →`}
                    </button>
                    {editingTeams && (
                      <button className="btn-ghost btn-small" onClick={handleCancelChangeTeams} disabled={teamsSubmitting}>
                        Vazgeç
                      </button>
                    )}
                  </div>
                  {teamsError && <p style={{ color: "#f87171" }}>{teamsError}</p>}
                </div>
              )}
            </div>
          )}

          {tab === "siralama" && teamsUnlocked && (
            <div className="chart-card chart-card-wide">
              <h3>📊 Senin Tahminlerine Göre Lig Sıralaması</h3>
              <p className="footnote">
                Bu tablo elle sürüklenmiyor -- seçtiğin takımların maçları için girdiğin skor tahminleri + geri kalan
                tüm maçlar için sistemin model sonucu birleştirilip otomatik hesaplanıyor. Skor tahminlerini
                değiştirdikçe (yenilerini ekledikçe) bu tablo da güncellenir.
              </p>
              <p>
                <b>{derivedStandingsPoints} puan</b> (şu ana kadarki hesaplama, sezon sonu simülasyon sıralamasına yakınlığa göre)
              </p>
              <StandingsTable
                standings={derivedStandings}
                teams={competition.teams}
                title="Tahminine Göre Puan Durumu"
                competitionKey={competitionKey}
              />
            </div>
          )}

          {tab === "lig" && teamsUnlocked && (
            <>
              <div className="chart-card chart-card-wide prediction-league-matches">
                <h3>Senin Takımların -- Tüm Sezon</h3>
                <p className="footnote">
                  Sezonun 8 haftasındaki TÜM maçların alt alta -- hafta hafta gezinmene gerek yok, sırayla tahminini
                  gir.
                </p>
                {myMatchesByWeek.length === 0 && (
                  <p className="footnote">Seçtiğin takımların bu sezon hiç maçı yok gibi görünüyor.</p>
                )}
                {myMatchesByWeek.map((md) => (
                  <div key={md.number} className="prediction-week-group">
                    <div className="prediction-week-label">{md.label}</div>
                    {md.matches.map((m) => {
                      const mine = myPredictionsByMatch[m.id];
                  const revealed = isMatchRevealed(league, m.id);
                  const actual = revealed ? league.results[m.id] : null;
                  const draft = drafts[m.id] || {};
                  const others = mine ? othersPredictionsByMatch[m.id] || [] : [];
                  const otherPredictorCount = (othersPredictionsByMatch[m.id] || []).length;
                  // hasDraw (swiss, UCL/Avrupa Ligi): basit Galibiyet/Beraberlik/
                  // Mağlubiyet tahmini, tuttuğun takımın perspektifinden.
                  // Değilse (Süper Lig, çift devreli): eskisi gibi tam skor.
                  const favTeam = selectedTeamIds.has(m.homeTeam.id) ? m.homeTeam : m.awayTeam;
                  const outcomePoints = mine?.kind === "outcome" && actual ? pointsForPrediction(mine, league) : null;
                  const scorePoints = mine?.kind === "score" && actual ? scorePrediction(mine, actual) : null;
                  const points = outcomePoints ?? scorePoints;
                  const isEditing = !!mine && !!editingMatchIds[m.id] && !revealed;
                  const showPicker = !mine || isEditing;
                  const stateClass = !mine
                    ? "needs-action"
                    : isEditing
                      ? "needs-action"
                      : !revealed
                        ? "is-pending"
                        : points > 0
                          ? "is-correct"
                          : "is-wrong";
                  return (
                    <div key={m.id} className={`prediction-match ${stateClass}`}>
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
                              {mine.kind === "outcome"
                                ? mine.result === "draw"
                                  ? "Berabere"
                                  : `${favTeam.short} ${OUTCOME_VERB[mine.result]}`
                                : `${mine.homeGoals} - ${mine.awayGoals}`}
                            </span>
                            {revealed ? (
                              <span className={`pick-badge ${points > 0 ? "ok" : "no"}`}>
                                {points > 0 ? `✅ Doğru bildin +${points}` : "❌ Tutmadı"}
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="prediction-change-link"
                                onClick={() => handleChangePrediction(m.id, mine)}
                                aria-label="Tahminini değiştir"
                              >
                                ✏️ Değiştir
                              </button>
                            )}
                          </div>
                        ) : hasDraw ? (
                          <div className="prediction-pick-row">
                            <button
                              className="prediction-pick-btn"
                              onClick={() => handleOutcomeSubmit(m.id, favTeam.id, "win")}
                              disabled={outcomeSubmitting[m.id]}
                            >
                              {favTeam.short} Kazanır
                            </button>
                            <button
                              className="prediction-pick-btn"
                              onClick={() => handleOutcomeSubmit(m.id, favTeam.id, "draw")}
                              disabled={outcomeSubmitting[m.id]}
                            >
                              Berabere
                            </button>
                            <button
                              className="prediction-pick-btn"
                              onClick={() => handleOutcomeSubmit(m.id, favTeam.id, "loss")}
                              disabled={outcomeSubmitting[m.id]}
                            >
                              {favTeam.short} Kaybeder
                            </button>
                            {isEditing && (
                              <button
                                type="button"
                                className="prediction-change-link"
                                onClick={() => handleCancelChange(m.id)}
                              >
                                ✕
                              </button>
                            )}
                            {outcomeErrors[m.id] && (
                              <span className="footnote" style={{ color: "#f87171" }}>
                                {outcomeErrors[m.id]}
                              </span>
                            )}
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
                            {isEditing && (
                              <button
                                type="button"
                                className="prediction-change-link"
                                onClick={() => handleCancelChange(m.id)}
                              >
                                ✕
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
                              {o.kind === "outcome" ? OUTCOME_LABEL[o.result] : `${o.homeGoals}-${o.awayGoals}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="prediction-match-others prediction-match-participants">
                          {mine
                            ? otherPredictorCount === 0
                              ? "👥 Bu maça henüz başka kimse tahmin girmedi."
                              : `👥 ${otherPredictorCount} kişi daha bu maça tahmin girdi.`
                            : otherPredictorCount === 0
                              ? "👥 Bu maça henüz kimse tahmin girmedi."
                              : `👥 ${otherPredictorCount} kişi bu maça tahmin girdi -- sen de tahmin edince tahminlerini görürsün.`}
                        </div>
                      )}
                    </div>
                  );
                    })}
                  </div>
                ))}
              </div>

              {systemMatches.length > 0 && (
                <div className="chart-card chart-card-wide prediction-system-matches">
                  <button
                    type="button"
                    className="prediction-system-toggle"
                    onClick={() => setSystemMatchesOpen((o) => !o)}
                  >
                    {systemMatchesOpen ? "▾" : "▸"} Diğer Maçlar (Sistem Tahmini) -- {systemMatches.length} maç
                  </button>
                  {systemMatchesOpen && (
                    <>
                      <p className="footnote">
                        Bu maçlar seçtiğin takımları içermiyor -- sistemin model sonucuna göre otomatik dolduruluyor,
                        ayrıca tahmin girmen gerekmiyor.
                      </p>
                      {systemMatches.map((m) => {
                        const revealed = isMatchRevealed(league, m.id);
                        const actual = revealed ? league.results[m.id] : null;
                        return (
                          <div key={m.id} className="prediction-row prediction-row-system">
                            <div className="prediction-row-team">
                              <Crest team={m.homeTeam} size={18} />
                              <span>{m.homeTeam.name}</span>
                            </div>
                            <span className="prediction-row-mine">
                              {actual ? `${actual.homeGoals} - ${actual.awayGoals}` : "⏳ ? - ?"}
                            </span>
                            <div className="prediction-row-team prediction-row-team-away">
                              <span>{m.awayTeam.name}</span>
                              <Crest team={m.awayTeam} size={18} />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {tab === "leaderboard" && (
            <div className="chart-card chart-card-wide">
              <h3>🏅 {league.name} Sıralaması</h3>
              <p className="footnote">
                Puanlar sadece oynanan maçlar için hesaplanır -- maçların tarihi geldikçe burada güncellenir.
              </p>
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

import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import {
  PredictionLeagueProvider,
  usePredictionAuth,
  useSharedSeason,
  usePredictions,
  scorePrediction,
  buildLeaderboard,
} from "../state/PredictionLeagueContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import MatchdayTabs from "../components/fixture/MatchdayTabs.jsx";
import Crest from "../components/Crest.jsx";

const POINT_LABEL = { 5: "Tam İsabet!", 3: "Sonuç + Fark", 1: "Sonuç Doğru", 0: "Iskaladın" };

// PredictionLeagueProvider (dolayısıyla firebase/auth + firebase/firestore
// paketleri) BİLEREK bu sayfaya ÖZEL, yerel bir sarmalayıcıda tutuluyor --
// main.jsx'te GLOBAL olarak sarılsaydı, Firebase SDK'sı (~470KB) Tahmin
// Ligi'ni hiç kullanmayan herkesin de ilk yükleme paketine dahil olurdu. Bu
// sayfa zaten lazy-load edildiğinden (bkz. main.jsx), sağlayıcıyı da burada
// tutmak Firebase'i SADECE bu sayfaya girildiğinde indirtir.
export default function PredictionLeaguePage() {
  return (
    <PredictionLeagueProvider>
      <PredictionLeagueContent />
    </PredictionLeagueProvider>
  );
}

function PredictionLeagueContent() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { user, authLoading, signInWithGoogle, signOutUser } = usePredictionAuth();
  const { season, loading: seasonLoading, fixture, startSeason } = useSharedSeason(competitionKey);
  const { predictions, myPredictionsByMatch, submitPrediction } = usePredictions(competitionKey);

  const [tab, setTab] = useState("maclar");
  const [activeMatchday, setActiveMatchday] = useState(1);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [submitting, setSubmitting] = useState({});

  const leaderboard = useMemo(
    () => (season ? buildLeaderboard(predictions, season.results) : []),
    [predictions, season]
  );

  const activeMatches = useMemo(
    () => fixture?.find((md) => md.number === activeMatchday)?.matches || [],
    [fixture, activeMatchday]
  );

  const handleStart = async () => {
    setStarting(true);
    setStartError(null);
    try {
      await startSeason();
    } catch (e) {
      setStartError(e.message || "Sezon oluşturulamadı.");
    } finally {
      setStarting(false);
    }
  };

  const handleDraftChange = (matchId, field, value) => {
    setDrafts((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }));
  };

  const handleSubmit = async (matchId) => {
    const draft = drafts[matchId];
    if (!draft || draft.home === "" || draft.away === "" || draft.home == null || draft.away == null) return;
    setSubmitting((prev) => ({ ...prev, [matchId]: true }));
    try {
      await submitPrediction(matchId, Number(draft.home), Number(draft.away));
    } finally {
      setSubmitting((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Kendi Aramızda</div>
          <h1>{competition.shortName} — Tahmin Ligi</h1>
          <p>
            Arkadaşlarınla ORTAK bir sezon üzerinden maç sonucu tahmin et, doğru
            bildikçe puan topla: <b>5 puan</b> tam skor · <b>3 puan</b> doğru
            sonuç + doğru gol farkı · <b>1 puan</b> sadece doğru sonuç
            (galibiyet/beraberlik) · <b>0 puan</b> ıska.
          </p>
        </div>
        {user && (
          <div className="page-header-actions prediction-league-user">
            {user.photoURL && <img src={user.photoURL} alt="" className="prediction-league-avatar" />}
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
          <button className="btn-primary" onClick={signInWithGoogle}>
            🔑 Google ile Giriş Yap
          </button>
        </div>
      )}

      {user && seasonLoading && <p className="footnote">Sezon kontrol ediliyor…</p>}

      {user && !seasonLoading && !season && (
        <div className="stats-callout">
          <p>
            {competition.shortName} için henüz ortak bir Tahmin Ligi sezonu yok.
            Başlatırsan, o an üretilen kura/fikstür üzerinden herkes AYNI
            maçları tahmin etmeye başlar -- bir kez oluşturulduktan sonra
            sabit kalır, değiştirilemez.
          </p>
          <button className="btn-primary" onClick={handleStart} disabled={starting}>
            {starting ? "Oluşturuluyor…" : "🏆 Tahmin Ligi Sezonunu Başlat"}
          </button>
          {startError && <p style={{ color: "#f87171" }}>{startError}</p>}
        </div>
      )}

      {user && season && fixture && (
        <>
          <div className="stats-tabs">
            <button className={tab === "maclar" ? "active" : ""} onClick={() => setTab("maclar")}>
              Maçlar
            </button>
            <button className={tab === "siralama" ? "active" : ""} onClick={() => setTab("siralama")}>
              🏅 Sıralama
            </button>
          </div>

          {tab === "maclar" && (
            <>
              <MatchdayTabs matchdays={fixture} active={activeMatchday} onSelect={setActiveMatchday} />
              <div className="chart-card chart-card-wide prediction-league-matches">
                {activeMatches.map((m) => {
                  const mine = myPredictionsByMatch[m.id];
                  const actual = season.results[m.id];
                  const draft = drafts[m.id] || {};
                  const points = mine && actual ? scorePrediction(mine, actual) : null;
                  return (
                    <div key={m.id} className="prediction-row">
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
                        </div>
                      )}

                      <div className="prediction-row-team prediction-row-team-away">
                        <span>{m.awayTeam.name}</span>
                        <Crest team={m.awayTeam} size={22} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === "siralama" && (
            <div className="chart-card chart-card-wide">
              <h3>🏅 {competition.shortName} Tahmin Ligi Sıralaması</h3>
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
                          {row.photoURL && <img src={row.photoURL} alt="" className="prediction-league-avatar-sm" />}
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
            </div>
          )}
        </>
      )}

      <p className="footnote">
        Not: Gerçek skorlar teknik olarak ortak sezon kaydında (Firestore)
        saklanır -- arayüz, sen tahmin etmeden o maçın sonucunu gizler, ama bu
        sunucu tarafı bir garanti değildir; tamamen dürüst oyuncular için
        tasarlanmış bir deneyimdir.
      </p>
    </div>
  );
}

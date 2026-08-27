import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase.js";
import { COMPETITIONS } from "../data/competitions.js";
import { generateFullDraw } from "../utils/drawEngine.js";
import { buildResultsFromMatches } from "../utils/resultsHelpers.js";
import {
  generateFixture,
  serializeFixture,
  deserializeFixture,
} from "../utils/fixtureEngine.js";
import {
  generateRoundRobinFixture,
  serializeRoundRobinFixture,
  deserializeRoundRobinFixture,
} from "../utils/roundRobinEngine.js";
import { enrichTeamsWithAttackDefense } from "../utils/predictionEngine.js";
import { simulateSeasonAsync } from "../utils/simulateSeasonAsync.js";
import { generateKnockoutBracket } from "../utils/knockoutEngine.js";

// generateKnockoutBracket takım NESNELERİ (logo import'ları dahil) içeren bir
// bracket döner -- Firestore'a sadece id'leri yazıyoruz. Her eşleşmeye,
// tahminlerin (predictions/{...}) referans verebilmesi için deterministik
// bir id ("{tur}-{sıra}") atanır.
export function serializeKnockout(bracket) {
  if (!bracket) return null;
  return {
    champion: bracket.champion?.id ?? null,
    rounds: bracket.rounds.map((round, roundIdx) => ({
      name: round.name,
      ties: round.ties.map((tie, tieIdx) => ({
        id: `${roundIdx}-${tieIdx}`,
        teamAId: tie.teamA.id,
        teamBId: tie.teamB.id,
        winnerId: tie.winner.id,
        aggA: tie.aggA,
        aggB: tie.aggB,
      })),
    })),
  };
}

// ============================================================================
// Tahmin Ligi -- Firebase (Auth + Firestore) destekli, ÇOKLU/link ile
// paylaşılan "lig odaları" üzerinden çalışan tahmin oyunu.
// ============================================================================
// NEDEN "LİG ODASI" (leagues/{leagueId}) GEREKİYOR (tek bir global sezon
// DEĞİL): Bir kullanıcı "Yeni Tahmin Ligi Oluştur" dediğinde kendi kurasını
// çeker, bu ORTAK VERİYİ (kura+fikstür+simülasyon) yeni, benzersiz bir
// `leagues/{leagueId}` belgesine yazar ve linki (URL'deki leagueId) arkadaş-
// larıyla paylaşır. Aynı anda aynı yarışma (ör. UCL) için Ali'nin kendi
// arkadaş grubuyla kurduğu lig ile Ayşe'nin kendi grubuyla kurduğu lig
// TAMAMEN BAĞIMSIZDIR -- her biri kendi kurasını/fikstürünü/tahminlerini
// taşır. Uygulamanın geri kalanı (CompetitionContext) BİLİNÇLİ OLARAK kalıcı
// değildir (her kullanıcı kendi tarayıcısında kendi rastgele simülasyonunu
// üretir) -- Tahmin Ligi'nin PAYLAŞILABİLİR olması için bu ayrı, kalıcı
// mekanizma gerekiyor.
//
// GÜVENLİK NOTU (kullanıcıya da açıkça söylenmeli): Gerçek skorlar
// `leagues/{leagueId}` belgesinin İÇİNDE, o linke sahip HERKESİN
// okuyabildiği `results` alanında saklanır -- arayüz kullanıcı tahmin
// etmeden bu skoru GÖRSEL olarak gizler/bulanıklaştırır, ama bu bir sunucu
// tarafı erişim kısıtlaması DEĞİLDİR (Cloud Functions olmadan mümkün
// değil). Yani niyet dürüst "kendi aramızda" oyuncular için tasarlanmıştır.
const PredictionLeagueContext = createContext(null);

export function PredictionLeagueProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, signInWithGoogle, signOutUser }),
    [user, authLoading, signInWithGoogle, signOutUser]
  );

  return <PredictionLeagueContext.Provider value={value}>{children}</PredictionLeagueContext.Provider>;
}

export function usePredictionAuth() {
  const ctx = useContext(PredictionLeagueContext);
  if (!ctx) throw new Error("usePredictionAuth bir <PredictionLeagueProvider> içinde kullanılmalıdır.");
  return ctx;
}

// Bir yarışma (competitionKey) için fikstür/simülasyon üretip Firestore'un
// anlayacağı (sadece takım id'leri + düz sonuç haritası içeren)
// SIKIŞTIRILMIŞ bir biçime çevirir -- takım nesnelerinin kendisi (logo
// import'ları dahil) hiçbir zaman Firestore'a yazılmaz, sadece id'ler.
//
// providedDrawResults (opsiyonel, sadece "swiss" formatta anlamlı): GERÇEK
// kura çekimi ekranından (DrawPage.jsx) gelen, kullanıcının bizzat izlediği/
// çektiği bir kuranın `results` çıktısı ({ teamId: { pot: {home,away} } }
// şeklinde, DrawPage zaten bu şekle çeviriyor). Verilmişse YENİ bir kura
// ÜRETİLMEZ, doğrudan bu kullanılır -- "Kura Çek" akışının (bkz.
// PredictionLeaguePage: kura ekranına git, kura çek, geri dön) amacı tam
// olarak bu: yeni lig, arka planda sessizce üretilen başka bir kura değil,
// kullanıcının GERÇEKTEN İZLEDİĞİ o kurayı kullansın. Verilmezse (headless
// senaryo) generateFullDraw ile taze bir kura üretilir.
//
// onProgress(stage): "draw" | "fixture" | "simulate" | "knockout" | "save"
// aşamalarını sırayla bildirir -- kullanıcı önce kuranın, sonra fikstürün,
// sonra simülasyonun bittiğini GÖREREK bekler, arayüz hepsi bitene kadar
// (tek bir opak "Oluşturuluyor…" yerine) hangi adımda olduğunu gösterir.
export async function buildLeaguePayload(competitionKey, onProgress, providedDrawResults) {
  const notify = onProgress || (() => {});
  const comp = COMPETITIONS[competitionKey];
  if (!comp) throw new Error("Bilinmeyen yarışma.");
  const allPlayers = comp.getAllPlayers();
  const enrichedTeams = enrichTeamsWithAttackDefense(comp.teams, allPlayers);

  let fixture;
  let serializedFixture;
  if (comp.format === "swiss") {
    notify("draw");
    if (providedDrawResults) {
      // Kullanıcı bu kurayı GERÇEKTEN çekti (DrawPage'de izledi) -- aynı
      // eşleşmeyi tekrar üretmeye çalışmak yerine doğrudan kullanıyoruz.
      // generateFixture yine de (nadiren) tıkanabilir; bu durumda yeni bir
      // kura üretmenin anlamı yok (kullanıcının izlediği kura BOZULMUŞ
      // olur), o yüzden burada retry YOK -- hata direkt yukarı fırlatılır ve
      // kullanıcıya "kura ekranından yeniden çek" denir.
      fixture = generateFixture(providedDrawResults, enrichedTeams);
    } else {
      // generateFixture (haftalara bölme) matematiksel olarak her zaman
      // çözülebilir bir problemdir (bkz. fixtureEngine.js) ama sınırlı
      // adımlı backtracking arayışı NADİREN tıkanıp "Fikstür haftalara
      // bölünemedi" hatası fırlatabilir -- TAMAMEN YENİ bir kura (farklı
      // eşleşme grafiği) çekmek neredeyse her zaman çözer, o yüzden burada
      // (headless -- kullanıcının izlediği belirli bir kura olmadığı için)
      // birkaç kez otomatik deniyoruz.
      let lastError = null;
      for (let attempt = 0; attempt < 5 && !fixture; attempt++) {
        try {
          // generateFullDraw ham bir { teamId: [{opponentId, home, viaPot}] }
          // haritası döner -- generateFixture ise { teamId: { pot: {home,away} } }
          // şeklinde bir `results` bekler. buildResultsFromMatches (bkz.
          // DrawPage.jsx'in "hızlı kura" senaryosuyla AYNI dönüşüm) bu ikisi
          // arasındaki köprü; bunu atlamak generateFixture'a boş/eksik bir
          // sonuç geçmek anlamına gelir (bu YÜZDEN "Fikstür haftalara
          // bölünemedi" hatası %100 oranında oluyordu -- algoritmanın
          // kendisi değil, burası bozuktu).
          const drawMatches = generateFullDraw(enrichedTeams);
          const drawResults = buildResultsFromMatches(enrichedTeams, drawMatches);
          fixture = generateFixture(drawResults, enrichedTeams);
        } catch (e) {
          lastError = e;
        }
      }
      if (!fixture) throw lastError || new Error("Fikstür oluşturulamadı.");
    }
    notify("fixture");
    serializedFixture = serializeFixture(fixture);
  } else {
    notify("fixture");
    fixture = generateRoundRobinFixture(enrichedTeams);
    serializedFixture = serializeRoundRobinFixture(fixture);
  }

  notify("simulate");
  const sim = await simulateSeasonAsync(fixture, {
    teams: enrichedTeams,
    allPlayers,
    zones: comp.zones,
  });

  const results = {};
  for (const m of sim.matchResults) {
    results[m.id] = { homeGoals: m.homeGoals, awayGoals: m.awayGoals };
  }
  // Lig aşaması SIRALAMA tahmini (sürükle-bırak) burada puanlanır -- final
  // sıra listesi (en iyi -> en kötü) sadece takım id'leri olarak saklanır.
  const standings = sim.standings.map((s) => s.teamId);

  // Lig fazı bittiği anda eleme turu bracket'i de (varsa) hemen üretilip
  // sezonun bir PARÇASI olarak kaydediliyor -- "adım adım" Tahmin Ligi akışı
  // bunu KADEMELİ olarak açığa çıkarır (arayüz her aşamanın gerçek sonucunu
  // kullanıcı tahmin edene kadar gizler), ama VERİNİN kendisi -- diğer her
  // şey gibi -- baştan tek seferde, tutarlı bir şekilde üretilir.
  let knockout = null;
  if (comp.hasKnockout) {
    notify("knockout");
    const teamById = Object.fromEntries(enrichedTeams.map((t) => [t.id, t]));
    const bracket = generateKnockoutBracket(sim.standings, teamById, null);
    knockout = serializeKnockout(bracket);
  }

  notify("save");
  return { competitionKey, format: comp.format, fixture: serializedFixture, results, standings, knockout };
}

// Yeni bir Tahmin Ligi ODASI oluşturur (Firestore'da otomatik id'li bir
// `leagues` belgesi) ve leagueId'sini döner -- bu id, paylaşılabilir linkin
// (/{competitionKey}/tahmin-ligi/{leagueId}) parçası olur. Ayrıca oluşturan
// kişiyi otomatik olarak o liginin bir üyesi yapar (bkz. joinLeague).
export function useCreateLeague() {
  const { user } = usePredictionAuth();
  return useCallback(
    async (competitionKey, name, onProgress, providedDrawResults) => {
      if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
      const payload = await buildLeaguePayload(competitionKey, onProgress, providedDrawResults);
      const ref = await addDoc(collection(db, "leagues"), {
        ...payload,
        name: name || `${COMPETITIONS[competitionKey]?.shortName || competitionKey} Tahmin Ligi`,
        createdBy: user.uid,
        createdByName: user.displayName || "Bilinmeyen",
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "memberships", `${ref.id}_${user.uid}`), {
        leagueId: ref.id,
        competitionKey,
        uid: user.uid,
        displayName: user.displayName || "Bilinmeyen",
        photoURL: user.photoURL || null,
        joinedAt: serverTimestamp(),
      });
      return ref.id;
    },
    [user]
  );
}

const LOAD_TIMEOUT_MS = 8000;

// Belirli bir lig odasını (leagueId) canlı dinler. Aynı zamanda mevcut
// kullanıcıyı bu ligin bir "üyesi" olarak kaydeder (bkz. memberships/*) --
// linki açan HERKES otomatik üye olur, böylece "Liglerim" listesinde görünür
// (henüz hiç tahmin yapmamış olsa bile).
export function useLeague(leagueId) {
  const { user, authLoading } = usePredictionAuth();
  const [state, setState] = useState({ league: null, loading: true, error: null });

  useEffect(() => {
    setState({ league: null, loading: true, error: null });
    if (!leagueId || authLoading || !user) return undefined;

    const ref = doc(db, "leagues", leagueId);
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setState({
        league: null,
        loading: false,
        error: new Error(
          "Firestore'dan yanıt alınamadı (zaman aşımı). Firebase Console'da Firestore Database'in oluşturulduğundan ve firestore.rules'un yayınlandığından emin ol."
        ),
      });
    }, LOAD_TIMEOUT_MS);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        settled = true;
        window.clearTimeout(timeoutId);
        setState({ league: snap.exists() ? { id: snap.id, ...snap.data() } : null, loading: false, error: null });
        // Linki açan kişiyi otomatik üye yap (idempotent -- setDoc aynı id'ye
        // her ziyarette sessizce üzerine yazar, hata vermez).
        if (snap.exists()) {
          const data = snap.data();
          setDoc(doc(db, "memberships", `${leagueId}_${user.uid}`), {
            leagueId,
            competitionKey: data.competitionKey,
            uid: user.uid,
            displayName: user.displayName || "Bilinmeyen",
            photoURL: user.photoURL || null,
            joinedAt: serverTimestamp(),
          }).catch(() => {});
        }
      },
      (error) => {
        settled = true;
        window.clearTimeout(timeoutId);
        // eslint-disable-next-line no-console
        console.error("Tahmin Ligi: lig dinlenemedi ->", error);
        setState({ league: null, loading: false, error });
      }
    );
    return () => {
      window.clearTimeout(timeoutId);
      unsub();
    };
  }, [leagueId, user, authLoading]);

  const comp = state.league ? COMPETITIONS[state.league.competitionKey] : null;
  const fixture = useMemo(() => {
    if (!state.league || !comp) return null;
    return comp.format === "swiss"
      ? deserializeFixture(state.league.fixture, comp.teams)
      : deserializeRoundRobinFixture(state.league.fixture, comp.teams);
  }, [state.league, comp]);

  // Ligi VE bu lige ait TÜM kullanıcıların tahminlerini/üyeliklerini kalıcı
  // olarak siler -- "kendi aramızda" güvene dayalı bir özellik olduğundan
  // herhangi bir giriş yapmış kullanıcı çağırabilir. Geri alınamaz, bu
  // yüzden çağıran taraf (PredictionLeaguePage) kullanıcıdan önce onay
  // almalı.
  const deleteLeague = useCallback(async () => {
    if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
    const [predSnap, memberSnap] = await Promise.all([
      getDocs(query(collection(db, "predictions"), where("leagueId", "==", leagueId))),
      getDocs(query(collection(db, "memberships"), where("leagueId", "==", leagueId))),
    ]);
    await Promise.all([
      ...predSnap.docs.map((d) => deleteDoc(d.ref)),
      ...memberSnap.docs.map((d) => deleteDoc(d.ref)),
    ]);
    await deleteDoc(doc(db, "leagues", leagueId));
  }, [leagueId, user]);

  return { ...state, fixture, deleteLeague };
}

// Kullanıcının (bir yarışma için) ÜYE OLDUĞU tüm Tahmin Ligi odalarını
// listeler -- "Yeni Tahmin Ligi Oluştur"un altındaki "Liglerim" listesi için.
export function useMyLeagues(competitionKey) {
  const { user } = usePredictionAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLeagues([]);
    if (!user || !competitionKey) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const q = query(
      collection(db, "memberships"),
      where("uid", "==", user.uid),
      where("competitionKey", "==", competitionKey)
    );
    const unsub = onSnapshot(
      q,
      async (snap) => {
        const memberships = snap.docs.map((d) => d.data());
        const leagueDocs = await Promise.all(
          memberships.map((m) => getDoc(doc(db, "leagues", m.leagueId)))
        );
        setLeagues(
          leagueDocs
            .filter((d) => d.exists())
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user, competitionKey]);

  return { leagues, loading };
}

// Bir lig odasının TÜM üyelerinin tahminlerini canlı dinler ("herkes
// birbirinin tahminini görür" + sıralama tablosu için) ve mevcut
// kullanıcının kendi tahminlerini/gönderme fonksiyonlarını döner.
export function usePredictions(leagueId) {
  const { user } = usePredictionAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPredictions([]);
    if (!leagueId) return undefined;
    const q = query(collection(db, "predictions"), where("leagueId", "==", leagueId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPredictions(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [leagueId]);

  const myPredictionsByMatch = useMemo(() => {
    if (!user) return {};
    const map = {};
    for (const p of predictions) {
      if (p.uid === user.uid) map[p.matchId] = p;
    }
    return map;
  }, [predictions, user]);

  // Bir maç için, KENDİ tahminini yapmış olan kullanıcının görebileceği
  // (kendisi hariç) DİĞER üyelerin tahminleri -- "herkes birbirinin
  // tahminini görür" isteği bunu karşılar; anti-spoiler mantığı (bkz.
  // dosya başındaki güvenlik notu) burada da korunur: bir maçın diğer
  // üyelerin tahminlerini SADECE sen de o maça kendi tahminini yaptıysan
  // görebilirsin (bkz. PredictionLeaguePage: myPredictionsByMatch[matchId]
  // varsa bu haritayı kullan).
  const othersPredictionsByMatch = useMemo(() => {
    if (!user) return {};
    const map = {};
    for (const p of predictions) {
      if (p.uid === user.uid) continue;
      if (!map[p.matchId]) map[p.matchId] = [];
      map[p.matchId].push(p);
    }
    return map;
  }, [predictions, user]);

  // extra: kind'a göre farklı alanlar taşır -- skor tahmini için
  // {homeGoals, awayGoals}, şampiyon/eleme turu/sıralama tahmini için
  // {pickedTeamId} ya da {order}.
  const submitPrediction = useCallback(
    async (matchId, kind, extra) => {
      if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
      const predictionId = `${leagueId}_${matchId}_${user.uid}`;
      const ref = doc(db, "predictions", predictionId);
      await setDoc(ref, {
        uid: user.uid,
        displayName: user.displayName || "Bilinmeyen",
        photoURL: user.photoURL || null,
        leagueId,
        matchId,
        kind,
        ...extra,
        createdAt: serverTimestamp(),
      });
    },
    [leagueId, user]
  );

  const submitScorePrediction = useCallback(
    (matchId, homeGoals, awayGoals) => submitPrediction(matchId, "score", { homeGoals, awayGoals }),
    [submitPrediction]
  );
  const submitChampionPick = useCallback(
    (pickedTeamId) => submitPrediction("champion", "champion", { pickedTeamId }),
    [submitPrediction]
  );
  const submitKnockoutPick = useCallback(
    (tieId, pickedTeamId) => submitPrediction(tieId, "knockout", { pickedTeamId }),
    [submitPrediction]
  );
  const submitStandingsPick = useCallback(
    (order) => submitPrediction("standings", "standings", { order }),
    [submitPrediction]
  );

  // Kullanıcının bu ligdeki KENDİ tahminlerinin tamamını siler -- ligin/diğer
  // üyelerin tahminlerinin geri kalanına dokunmaz, sadece "baştan tahmin
  // etmek istiyorum" senaryosu için.
  const resetMyPredictions = useCallback(async () => {
    if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
    const q = query(collection(db, "predictions"), where("leagueId", "==", leagueId), where("uid", "==", user.uid));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }, [leagueId, user]);

  return {
    predictions,
    myPredictionsByMatch,
    othersPredictionsByMatch,
    loading,
    submitScorePrediction,
    submitChampionPick,
    submitKnockoutPick,
    submitStandingsPick,
    resetMyPredictions,
  };
}

// Bir SKOR tahmininin (kind:"score") gerçek sonuca göre kaç puan
// getirdiğini hesaplar: 5 = tam skor, 3 = doğru kazanan taraf + doğru gol
// farkı, 1 = sadece doğru kazanan/beraberlik, 0 = tamamen yanlış.
export function scorePrediction(prediction, actual) {
  if (!prediction || !actual) return 0;
  const { homeGoals: ph, awayGoals: pa } = prediction;
  const { homeGoals: ah, awayGoals: aa } = actual;
  if (ph === ah && pa === aa) return 5;
  const predictedDiff = ph - pa;
  const actualDiff = ah - aa;
  const sameOutcome =
    (predictedDiff > 0 && actualDiff > 0) ||
    (predictedDiff < 0 && actualDiff < 0) ||
    (predictedDiff === 0 && actualDiff === 0);
  if (!sameOutcome) return 0;
  return predictedDiff === actualDiff ? 3 : 1;
}

// "Adım adım" akışın tahmin türlerine ayrı puan ağırlığı verir: şampiyon
// tahmini en cüretkar/en zor olduğu için en yüksek puanı taşır, eleme turu
// tur ilerledikçe (final'e yaklaştıkça) biraz daha değerli olur, lig aşaması
// skor tahmini scorePrediction'ın 5/3/1/0 kademesini kullanır.
export const CHAMPION_PICK_POINTS = 15;
export const KNOCKOUT_TIE_POINTS = { 0: 2, 1: 3, 2: 4, 3: 5, 4: 6 }; // round index -> puan
// Sıralama tahmininde bir takım için: tam sırasını bilmek 3 puan, 1 sıra
// yanılmak 2, 2 sıra yanılmak 1, daha fazlası 0 -- ne kadar YAKIN o kadar
// puan, sadece "birebir tuttu/tutmadı" değil.
const STANDINGS_MAX_POINTS_PER_TEAM = 3;

function standingsPoints(predictedOrder, actualOrder) {
  if (!Array.isArray(predictedOrder) || !Array.isArray(actualOrder) || actualOrder.length === 0) return 0;
  const actualRank = new Map(actualOrder.map((teamId, i) => [teamId, i]));
  let total = 0;
  predictedOrder.forEach((teamId, predictedIdx) => {
    const actualIdx = actualRank.get(teamId);
    if (actualIdx == null) return;
    total += Math.max(0, STANDINGS_MAX_POINTS_PER_TEAM - Math.abs(predictedIdx - actualIdx));
  });
  return total;
}

// Bir tahminin, hangi TÜRDEN olursa olsun (skor / şampiyon / eleme turu /
// sıralama), verilen ligin (henüz açığa çıkmamış olabilecek) gerçek
// sonucuna göre kaç puan getirdiğini hesaplar. Sonuç henüz bilinmiyorsa
// (ör. knockout hiç üretilmemişse) 0 döner.
export function pointsForPrediction(prediction, league) {
  if (!prediction || !league) return 0;
  if (prediction.kind === "champion") {
    return league.knockout?.champion && league.knockout.champion === prediction.pickedTeamId
      ? CHAMPION_PICK_POINTS
      : 0;
  }
  if (prediction.kind === "knockout") {
    const [roundIdxStr] = String(prediction.matchId).split("-");
    const roundIdx = Number(roundIdxStr) || 0;
    const tie = league.knockout?.rounds?.flatMap((r) => r.ties).find((t) => t.id === prediction.matchId);
    if (!tie) return 0;
    return tie.winnerId === prediction.pickedTeamId ? KNOCKOUT_TIE_POINTS[roundIdx] ?? 2 : 0;
  }
  if (prediction.kind === "standings") {
    return standingsPoints(prediction.order, league.standings);
  }
  return scorePrediction(prediction, league.results?.[prediction.matchId]);
}

// Bir lig odasının tam sıralama tablosunu (kullanıcı başına toplam puan +
// tahmin sayısı) üretir -- predictions ve league'den türetilir, Firestore'da
// AYRICA saklanmaz (her zaman kaynağından yeniden hesaplanır).
export function buildLeaderboard(predictions, league) {
  const byUser = {};
  for (const p of predictions) {
    if (!byUser[p.uid]) {
      byUser[p.uid] = { uid: p.uid, displayName: p.displayName, photoURL: p.photoURL, points: 0, predicted: 0, scored: 0 };
    }
    const entry = byUser[p.uid];
    entry.predicted++;
    entry.points += pointsForPrediction(p, league);
    entry.scored++;
  }
  return Object.values(byUser).sort((a, b) => b.points - a.points || b.scored - a.scored);
}

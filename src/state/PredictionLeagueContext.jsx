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
import { REAL_FIXTURE_2026 } from "../data/realFixture2026.js";
import { REAL_FIXTURE_SUPERLIG_2026 } from "../data/realFixtureSuperLig2026.js";
import { deserializeFixture } from "../utils/fixtureEngine.js";
import { deserializeRoundRobinFixture } from "../utils/roundRobinEngine.js";
import { computeStandingsFromUserScores } from "../utils/predictionEngine.js";
import { hasRealDataSupport, getRealMatchResult, getRealStandings } from "../utils/realStandingsSelectors.js";

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

// Bir ya da BİRDEN FAZLA yarışma (competitionKeys -- ör. ["ucl"],
// ["superlig"] ya da ["ucl","superlig"]) için gerçek, tarihli fikstürleri
// Firestore'un anlayacağı SIKIŞTIRILMIŞ bir biçime (fixtures: { [key]:
// serializedFixture }) çevirir -- takım nesnelerinin kendisi (logo
// import'ları dahil) hiçbir zaman Firestore'a yazılmaz, sadece id'ler.
//
// ARTIK BURADA SAHTE BİR SEZON SİMÜLASYONU HİÇ ÇALIŞTIRILMAZ/SAKLANMAZ --
// "results"/"standings" BOŞ kaydedilir çünkü gerçek sonuçlar OKUMA anında
// her zaman realStandingsSelectors'tan (bkz. getLeagueMatchResult aşağıda)
// taze çekilir -- gerçek bir maç oynandıkça (src/data/realResultsUcl2026.js
// güncellendikçe) TÜM mevcut Tahmin Ligi odaları otomatik günceli
// gösterir, hiçbir migration gerekmez. Bu fonksiyon SADECE gerçek veri
// desteği olan yarışmaları (ucl/superlig) kabul eder -- Tahmin Ligi artık
// başka bir yarışma sunmuyor.
//
// onProgress(stage): "fixture" | "save" aşamalarını bildirir.
export async function buildLeaguePayload(competitionKeys, onProgress) {
  const notify = onProgress || (() => {});
  const keys = (Array.isArray(competitionKeys) ? competitionKeys : [competitionKeys]).filter(Boolean);
  if (keys.length === 0) throw new Error("En az bir yarışma seçmelisin.");
  const fixtures = {};
  for (const key of keys) {
    const comp = COMPETITIONS[key];
    if (!comp) throw new Error(`Bilinmeyen yarışma: ${key}`);
    if (!hasRealDataSupport(key)) throw new Error(`${comp.shortName} için henüz gerçek veri desteği yok.`);
    notify("fixture");
    fixtures[key] = key === "ucl" ? REAL_FIXTURE_2026 : REAL_FIXTURE_SUPERLIG_2026;
  }
  notify("save");
  return { competitionKeys: keys, fixtures, results: {}, standings: [], knockout: null };
}

// Yeni bir Tahmin Ligi ODASI oluşturur (Firestore'da otomatik id'li bir
// `leagues` belgesi) ve leagueId'sini döner -- bu id, paylaşılabilir linkin
// (/tahmin-ligi/{leagueId}) parçası olur. Ayrıca oluşturan kişiyi otomatik
// olarak o liginin bir üyesi yapar (bkz. joinLeague).
export function useCreateLeague() {
  const { user } = usePredictionAuth();
  return useCallback(
    async (competitionKeys, name, onProgress) => {
      if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
      const payload = await buildLeaguePayload(competitionKeys, onProgress);
      const defaultName = payload.competitionKeys.map((k) => COMPETITIONS[k]?.shortName || k).join(" + ");
      const ref = await addDoc(collection(db, "leagues"), {
        ...payload,
        name: name || `${defaultName} Tahmin Ligi`,
        createdBy: user.uid,
        createdByName: user.displayName || "Bilinmeyen",
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "memberships", `${ref.id}_${user.uid}`), {
        leagueId: ref.id,
        competitionKeys: payload.competitionKeys,
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
            competitionKeys: data.competitionKeys || (data.competitionKey ? [data.competitionKey] : []),
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

  // Bir lig BİRDEN FAZLA yarışmayı (ör. UCL + Süper Lig) kapsayabildiğinden
  // (bkz. buildLeaguePayload) fikstür artık TEKİL değil, yarışma anahtarı
  // başına bir harita: { ucl: [...deserialize edilmiş hafta/maç...], superlig: [...] }.
  // Eski (tek yarışmalı) lig belgeleriyle GERİYE DÖNÜK UYUMLU: `fixtures`
  // yoksa `competitionKey`/`fixture` tekil alanlarından TEK elemanlı bir
  // harita türetilir.
  const competitionKeys = useMemo(
    () => state.league?.competitionKeys || (state.league?.competitionKey ? [state.league.competitionKey] : []),
    [state.league]
  );
  const fixturesByKey = useMemo(() => {
    if (!state.league) return {};
    const out = {};
    for (const key of competitionKeys) {
      const comp = COMPETITIONS[key];
      if (!comp) continue;
      const raw = state.league.fixtures ? state.league.fixtures[key] : state.league.fixture;
      if (!raw) continue;
      out[key] = comp.format === "swiss" ? deserializeFixture(raw, comp.teams) : deserializeRoundRobinFixture(raw, comp.teams);
    }
    return out;
  }, [state.league, competitionKeys]);

  // Ligi VE bu lige ait TÜM kullanıcıların tahminlerini/üyeliklerini kalıcı
  // olarak siler -- "kendi aramızda" güvene dayalı bir özellik olduğundan
  // ligin herhangi bir ÜYESİ çağırabilir (bkz. firestore.rules -- silme
  // izni artık üyelik kontrolüne dayanıyor). Geri alınamaz, bu yüzden
  // çağıran taraf (PredictionLeaguePage) kullanıcıdan önce onay almalı.
  const deleteLeague = useCallback(async () => {
    if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
    const [predSnap, memberSnap] = await Promise.all([
      getDocs(query(collection(db, "predictions"), where("leagueId", "==", leagueId))),
      getDocs(query(collection(db, "memberships"), where("leagueId", "==", leagueId))),
    ]);
    // ÖNEMLİ SIRALAMA: kendi üyelik kaydımızı EN SON siliyoruz. Kurallar
    // artık lig belgesini/başkasının tahminini/üyeliğini silme iznini "bu
    // ligin bir üyesi misin" kontrolüne (memberships'te kendi kaydının VAR
    // OLMASINA) bağlıyor -- bu yüzden kendi üyeliğimiz durmadan ÖNCE
    // silinmesi gereken HER ŞEYİ (lig belgesi DAHİL) siliyoruz; kendi
    // üyeliğimizi diğerleriyle AYNI adımda silseydik, henüz bitmemiş diğer
    // silme isteklerinin kural kontrolü "artık üye değilsin" diye
    // reddedilebilirdi.
    const otherMemberDocs = memberSnap.docs.filter((d) => d.data().uid !== user.uid);
    const ownMemberDoc = memberSnap.docs.find((d) => d.data().uid === user.uid);
    await Promise.all([
      deleteDoc(doc(db, "leagues", leagueId)),
      ...predSnap.docs.map((d) => deleteDoc(d.ref)),
      ...otherMemberDocs.map((d) => deleteDoc(d.ref)),
    ]);
    if (ownMemberDoc) await deleteDoc(ownMemberDoc.ref);
  }, [leagueId, user]);

  return { ...state, competitionKeys, fixturesByKey, deleteLeague };
}

// Kullanıcının ÜYE OLDUĞU TÜM Tahmin Ligi odalarını listeler -- yarışmaya
// göre ARTIK FİLTRELENMİYOR (bkz. PredictionLeaguePage: tek, yarışmadan
// bağımsız bir "Liglerim" listesi -- her ligin hangi yarışma(lar)ı
// kapsadığı satırında ayrıca gösterilir).
export function useMyLeagues() {
  const { user } = usePredictionAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLeagues([]);
    setError(null);
    if (!user) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const q = query(collection(db, "memberships"), where("uid", "==", user.uid));
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
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Tahmin Ligi: 'Liglerim' listesi okunamadı ->", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  return { leagues, loading, error };
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

  // Bir tahmini SİLER -- Firestore kuralları tahmin belgelerinin doğrudan
  // GÜNCELLENMESİNE izin vermiyor (bkz. firestore.rules: "allow update: if
  // false"), bu yüzden "seçimini değiştir" akışı önce eski belgeyi silip
  // ardından submit* fonksiyonlarından biriyle YENİDEN oluşturmak şeklinde
  // çalışır (silindikten sonra aynı deterministik id ile tekrar setDoc
  // çağrısı kurallar tarafında "create" olarak değerlendirilir, izinlidir).
  const deletePrediction = useCallback(
    async (matchId) => {
      if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
      await deleteDoc(doc(db, "predictions", `${leagueId}_${matchId}_${user.uid}`));
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
  // Kullanıcının "sadece bunların maçlarını ben tahmin edeceğim, gerisini
  // sistem belirlesin" dediği takımlar -- deletePrediction("teams") ile
  // silinip yeniden gönderilerek değiştirilebilir (bkz. PredictionLeaguePage:
  // "Takımları Değiştir").
  const submitTeamsPick = useCallback(
    (teamIds) => submitPrediction("teams", "teams", { teamIds }),
    [submitPrediction]
  );
  // UCL/Avrupa Ligi'nde artık tam skor DEĞİL, basit bir "bu maçtan tuttuğun
  // takım kaç puan alır" tahmini yapılıyor -- result: "win" | "draw" | "loss"
  // (futbolun kendi 3/1/0 puan mantığıyla), teamId de İKİ taraftan HANGİSİ
  // için tahmin edildiğini belirtir (bkz. pointsForPrediction'daki "outcome").
  const submitOutcomePrediction = useCallback(
    (matchId, teamId, result) => submitPrediction(matchId, "outcome", { teamId, result }),
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
    deletePrediction,
    submitScorePrediction,
    submitChampionPick,
    submitKnockoutPick,
    submitStandingsPick,
    submitTeamsPick,
    submitOutcomePrediction,
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
// UCL/Avrupa Ligi'nde artık tam skor değil, basit bir "tuttuğun takım bu
// maçtan kaç puan alır" (Galibiyet=3/Beraberlik=1/Mağlubiyet=0, futbolun
// kendi puanlama mantığı) tahmini yapılıyor -- doğru bilmek sabit bu kadar
// puan kazandırır (yanlışsa 0).
export const OUTCOME_CORRECT_POINTS = 3;

// Bir lig belgesinin fikstürünü, {competitionKey, matchdays} çiftlerinden
// oluşan bir listeye çevirir -- bir lig BİRDEN FAZLA yarışmayı (ör. UCL +
// Süper Lig) kapsayabildiğinden (bkz. buildLeaguePayload'daki `fixtures`
// haritası) aşağıdaki arama fonksiyonları TEK bir dizi yerine bu listeyi
// tarar. Eski (tek yarışmalı, `fixture` + `competitionKey` tekil alanlı --
// hem eski lig belgeleri hem de bu dosyanın birim testlerindeki mock'lar)
// belgelerle GERİYE DÖNÜK UYUMLUDUR.
function fixtureGroups(league) {
  if (!league) return [];
  if (league.fixtures) {
    return Object.entries(league.fixtures).map(([competitionKey, matchdays]) => ({ competitionKey, matchdays }));
  }
  if (league.fixture) {
    return [{ competitionKey: league.competitionKey, matchdays: league.fixture }];
  }
  return [];
}

// Bir maçın gerçek (serileştirilmiş) fikstürdeki ev sahibi/deplasman
// takım id'lerini bulur -- "outcome" tahmininin (bkz. submitOutcomePrediction)
// hangi takımın GERÇEKTE ev sahibi/deplasman olduğunu bilmesi gerekiyor.
function matchTeamsOf(league, matchId) {
  for (const { matchdays } of fixtureGroups(league)) {
    const md = (matchdays || []).find((x) => x.matches.some((m) => m.id === matchId));
    const m = md?.matches.find((x) => x.id === matchId);
    if (m) return { homeId: m.homeId, awayId: m.awayId };
  }
  return null;
}

// Bir maçın GERÇEK (serileştirilmiş) fikstürdeki tarihini bulur.
function matchDateOf(league, matchId) {
  for (const { matchdays } of fixtureGroups(league)) {
    for (const md of matchdays || []) {
      const m = md.matches.find((x) => x.id === matchId);
      if (m) return m.date || null;
    }
  }
  return null;
}

// Bir matchId'nin HANGİ yarışmaya ait olduğunu bulup, gerçek veri
// seçicilerinin (bkz. realStandingsSelectors.getRealMatchResult) beklediği
// TAKIM NESNELERİNE (Süper Lig eşleştirmesi isim üzerinden yapıldığından
// `name` alanı şart) çevirir.
function resolveLeagueMatch(league, matchId) {
  for (const { competitionKey, matchdays } of fixtureGroups(league)) {
    const comp = COMPETITIONS[competitionKey];
    if (!comp) continue;
    for (const md of matchdays || []) {
      const m = md.matches.find((x) => x.id === matchId);
      if (!m) continue;
      const teamById = Object.fromEntries(comp.teams.map((t) => [t.id, t]));
      const homeTeam = teamById[m.homeId];
      const awayTeam = teamById[m.awayId];
      if (!homeTeam || !awayTeam) return null;
      return { competitionKey, id: matchId, date: m.date, homeTeam, awayTeam };
    }
  }
  return null;
}

// Bir maçın "gerçek" sonucunu döner. GERÇEK VERİ DESTEĞİ OLAN yarışmalarda
// (ucl/superlig) bu ASLA ligin Firestore'da saklı (lig kurulurken üretilmiş
// olabilecek, artık BOŞ bırakılan) `results` alanından DEĞİL, doğrudan
// realStandingsSelectors'taki AYNI statik gerçek veri kaynağından gelir --
// Fikstür/Maç Merkezi sayfalarıyla BİREBİR TUTARLI, ve gerçek veri
// güncellendikçe (bir maç oynandıkça src/data/realResultsUcl2026.js'e
// eklendiğinde) TÜM Tahmin Ligi odaları otomatik günceli gösterir. Destek
// olmayan yarışmalarda (ör. birim testlerindeki mock'lar) eski davranış --
// ligin kendi saklı `results` alanı -- aynen korunur.
export function getLeagueMatchResult(league, matchId) {
  if (!league) return null;
  const match = resolveLeagueMatch(league, matchId);
  if (match && hasRealDataSupport(match.competitionKey)) {
    const real = getRealMatchResult(match.competitionKey, match);
    return real ? { homeGoals: real.homeGoals, awayGoals: real.awayGoals } : null;
  }
  return league.results?.[matchId] || null;
}

// "Lig Sıralaması" tahmininin karşılaştırıldığı "gerçek" sıra -- SADECE TEK
// yarışmalı, gerçek veri destekli liglerde anlamlıdır (iki farklı
// yarışmanın puan durumu birleştirilemez). Diğer durumlarda ligin saklı
// (varsa) simülasyon sıralamasına düşer.
export function getLeagueStandingsOrder(league) {
  if (!league) return [];
  const keys = league.competitionKeys || (league.competitionKey ? [league.competitionKey] : []);
  if (keys.length === 1 && hasRealDataSupport(keys[0])) {
    return getRealStandings(keys[0]).standings.map((s) => s.teamId);
  }
  return league.standings || [];
}

// Bir maçın sonucu kullanıcıya GÖSTERİLEBİLİR mi -- yani maçın gerçek tarihi
// geçti mi? Tahmin Ligi'nin bütün amacı "sonucu görmeden tahmin et" olduğundan,
// simüle edilmiş sonuç Firestore'da baştan hazır olsa bile arayüz bunu maçın
// GERÇEK tarihine kadar saklar. Gerçek bir tarihi olmayan maçlar (henüz
// tarihlendirilmemiş Avrupa Ligi/Süper Lig fikstürleri) her zaman açık kabul
// edilir -- onlar için zaten bekleyecek gerçek bir takvim yok.
export function isMatchRevealed(league, matchId) {
  const date = matchDateOf(league, matchId);
  if (!date) return true;
  return new Date(date) <= new Date();
}

// Sezonun TAMAMI (fikstürdeki her maç) açığa çıktı mı -- "Lig Sıralaması"
// tahmininin puan bonusu (bkz. buildLeaderboard) sadece sezon gerçekten
// bittiğinde anlamlı olduğundan (aksi halde `league.standings` -- baştan
// hazır simülasyon sonucu -- anında sızdırılmış olurdu) bu kontrolle
// korunur.
export function isSeasonFullyRevealed(league) {
  for (const md of league?.fixture || []) {
    for (const m of md.matches) {
      if (!isMatchRevealed(league, m.id)) return false;
    }
  }
  return true;
}

export function standingsPoints(predictedOrder, actualOrder) {
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
    const round = league.knockout?.rounds?.[roundIdx];
    const tie = round?.ties?.find((t) => t.id === prediction.matchId);
    if (!tie || tie.winnerId !== prediction.pickedTeamId) return 0;
    const base = KNOCKOUT_TIE_POINTS[roundIdx] ?? 2;
    // Final turunun eşleşmesini doğru bilmek, aynı zamanda şampiyonu doğru
    // bilmek demektir -- ayrı bir "şampiyon tahmini" adımına gerek kalmadan
    // (bkz. BracketTree/PredictionLeaguePage'in eleme turu sekmesi) bunun
    // için ekstra bir bonus verilir.
    return round?.name === "Final" ? base + CHAMPION_PICK_POINTS : base;
  }
  if (prediction.kind === "outcome") {
    if (!isMatchRevealed(league, prediction.matchId)) return 0;
    const actual = getLeagueMatchResult(league, prediction.matchId);
    const teams = matchTeamsOf(league, prediction.matchId);
    if (!actual || !teams) return 0;
    const isHome = teams.homeId === prediction.teamId;
    const isAway = teams.awayId === prediction.teamId;
    if (!isHome && !isAway) return 0;
    const diff = isHome ? actual.homeGoals - actual.awayGoals : actual.awayGoals - actual.homeGoals;
    const actualResult = diff > 0 ? "win" : diff < 0 ? "loss" : "draw";
    return actualResult === prediction.result ? OUTCOME_CORRECT_POINTS : 0;
  }
  if (prediction.kind === "standings") {
    return standingsPoints(prediction.order, getLeagueStandingsOrder(league));
  }
  if (prediction.kind === "score" && !isMatchRevealed(league, prediction.matchId)) return 0;
  return scorePrediction(prediction, getLeagueMatchResult(league, prediction.matchId));
}

// "Lig Sıralaması" artık elle sürüklenerek tahmin edilmiyor -- kullanıcının
// SEÇTİĞİ takımlar için girdiği skor tahminleri + geri kalan TÜM maçlar için
// sistemin kendi (simüle edilmiş) sonucu birleştirilip GERÇEK fikstür
// üzerinden tam bir puan durumu hesaplanır. computeStandingsFromUserScores
// (predictionEngine.js) bu hesabı zaten yapıyor -- burada sadece hibrit
// "userScores" haritasını kuruyoruz.
// fixture: useLeague()'in DESERIALIZE ettiği (homeTeam/awayTeam nesneli) hali.
export function computeDerivedStandings(fixture, myScorePredictionsByMatch, league, teams, zones) {
  if (!fixture || !league?.results) return [];
  const userScores = {};
  for (const md of fixture) {
    for (const m of md.matches) {
      const mine = myScorePredictionsByMatch[m.id];
      if (mine?.kind === "score") {
        userScores[m.id] = { home: mine.homeGoals, away: mine.awayGoals };
        continue;
      }
      if (mine?.kind === "outcome") {
        // W/D/L tahminini basit bir skor karşılığına çevirir (1-0 / 0-0 /
        // 0-1) -- gerçek gol farkını değil, sadece puan durumu hesabı için
        // yeterli bir temsili sonucu yansıtır.
        const isHome = mine.teamId === m.homeTeam.id;
        let home = 0;
        let away = 0;
        if (mine.result === "win") {
          if (isHome) home = 1;
          else away = 1;
        } else if (mine.result === "loss") {
          if (isHome) away = 1;
          else home = 1;
        }
        userScores[m.id] = { home, away };
        continue;
      }
      const real = getLeagueMatchResult(league, m.id);
      if (real) userScores[m.id] = { home: real.homeGoals, away: real.awayGoals };
    }
  }
  return computeStandingsFromUserScores(fixture, userScores, { teams, zones });
}

// Bir lig odasının tam sıralama tablosunu (kullanıcı başına toplam puan +
// tahmin sayısı) üretir -- predictions ve league'den türetilir, Firestore'da
// AYRICA saklanmaz (her zaman kaynağından yeniden hesaplanır).
//
// standingsCtx (opsiyonel): { fixture, teams, zones } verilirse, her
// kullanıcının KENDİ skor tahminlerinden türetilen "Lig Sıralaması" puanı da
// (bkz. computeDerivedStandings) toplam puana eklenir -- bu artık ayrı bir
// "standings" tahmin belgesi OLARAK saklanmıyor, her zaman skor
// tahminlerinden anlık hesaplanıyor.
export function buildLeaderboard(predictions, league, standingsCtx) {
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

  if (standingsCtx?.fixture && league && isSeasonFullyRevealed(league)) {
    const byUserScorePredictions = {};
    for (const p of predictions) {
      if (p.kind !== "score" && p.kind !== "outcome") continue;
      if (!byUserScorePredictions[p.uid]) byUserScorePredictions[p.uid] = {};
      byUserScorePredictions[p.uid][p.matchId] = p;
    }
    for (const uid of Object.keys(byUser)) {
      const mine = byUserScorePredictions[uid] || {};
      const derived = computeDerivedStandings(standingsCtx.fixture, mine, league, standingsCtx.teams, standingsCtx.zones);
      byUser[uid].points += standingsPoints(derived.map((s) => s.teamId), getLeagueStandingsOrder(league));
    }
  }

  return Object.values(byUser).sort((a, b) => b.points - a.points || b.scored - a.scored);
}

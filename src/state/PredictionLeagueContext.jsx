import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase.js";
import { COMPETITIONS } from "../data/competitions.js";
import { generateFullDraw } from "../utils/drawEngine.js";
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

// ============================================================================
// Tahmin Ligi -- Firebase (Auth + Firestore) destekli, kullanıcılar arası
// ORTAK bir sezon üzerinden çalışan tahmin oyunu.
// ============================================================================
// NEDEN "ORTAK BİR SEZON" GEREKİYOR: Uygulamanın geri kalanı (CompetitionContext)
// BİLİNÇLİ OLARAK kalıcı değildir -- her kullanıcı kendi tarayıcısında kendi
// rastgele kurasını/simülasyonunu üretir, bu yüzden iki kullanıcının "aynı
// maçı" karşılaştırıp puanlaması mümkün DEĞİLDİR (Ali'nin Real Madrid-Barça
// simülasyonu ile Ayşe'ninki farklı sonuç verir). Tahmin Ligi bunun için AYRI
// bir mekanizma kullanır: bir yarışma için İLK kez "Tahmin Ligi Sezonunu
// Başlat"a basan kullanıcı, o an üretilen kura+fikstür+simülasyonu Firestore'a
// `seasons/{competitionKey}` olarak YAZAR; bundan sonra herkes AYNI bu
// belgeyi okur ve AYNI maçları tahmin eder. Season belgesi oluşturulduktan
// sonra (bkz. firestore.rules) client'tan bir daha değiştirilemez/silinemez.
//
// GÜVENLİK NOTU (kullanıcıya da açıkça söylenmeli): Gerçek skorlar
// `seasons/{competitionKey}` belgesinin İÇİNDE, herkesin okuyabildiği
// `results` alanında saklanır -- arayüz kullanıcı tahmin etmeden bu skoru
// GÖRSEL olarak gizler/bulanıklaştırır, ama bu bir sunucu tarafı erişim
// kısıtlaması DEĞİLDİR (Cloud Functions olmadan mümkün değil). Yani niyet
// dürüst "kendi aramızda" oyuncular için tasarlanmıştır, kötü niyetli/teknik
// bir kullanıcı tarayıcı araçlarıyla sonucu erkenden görebilir.
const PredictionLeagueContext = createContext(null);

function buildEmptySeasonState() {
  return { season: null, loading: true, error: null };
}

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

// Bir yarışma (competitionKey) için taze bir kura/fikstür/simülasyon üretip
// Firestore'un anlayacağı (sadece takım id'leri + düz sonuç haritası içeren)
// SIKIŞTIRILMIŞ bir biçime çevirir -- takım nesnelerinin kendisi (logo
// import'ları dahil) hiçbir zaman Firestore'a yazılmaz, sadece id'ler.
async function buildFreshSeasonPayload(competitionKey) {
  const comp = COMPETITIONS[competitionKey];
  if (!comp) throw new Error("Bilinmeyen yarışma.");
  const allPlayers = comp.getAllPlayers();
  const enrichedTeams = enrichTeamsWithAttackDefense(comp.teams, allPlayers);

  let fixture;
  let serializedFixture;
  if (comp.format === "swiss") {
    const drawResults = generateFullDraw(enrichedTeams);
    fixture = generateFixture(drawResults, enrichedTeams);
    serializedFixture = serializeFixture(fixture);
  } else {
    fixture = generateRoundRobinFixture(enrichedTeams);
    serializedFixture = serializeRoundRobinFixture(fixture);
  }

  const sim = await simulateSeasonAsync(fixture, {
    teams: enrichedTeams,
    allPlayers,
    zones: comp.zones,
  });

  const results = {};
  for (const m of sim.matchResults) {
    results[m.id] = { homeGoals: m.homeGoals, awayGoals: m.awayGoals };
  }

  return { format: comp.format, fixture: serializedFixture, results };
}

// Bir yarışmanın Tahmin Ligi sezonunu (varsa) canlı dinler, yoksa "henüz
// yok" durumunu döner. startSeason() -- sadece sezon YOKKEN çağrılmalı --
// taze bir sezon üretip Firestore'a yazar (bkz. firestore.rules: bir sezon
// belgesi sadece YOKSA oluşturulabilir, üzerine yazılamaz).
// Firestore'a hiç ulaşılamazsa (ör. Firestore Database projede hiç
// oluşturulmadıysa, ya da kurallar yayınlanmadan önceki garip bir ara
// durumdaysa) onSnapshot'ın ne başarı ne de hata callback'ini hiç
// çağırmadığı görülebiliyor -- bu da arayüzde SONSUZA KADAR "Sezon kontrol
// ediliyor…" yazısında takılı kalmaya yol açar. Bu süre sınırı, kullanıcıya
// en azından eyleme geçirilebilir bir hata mesajı göstermek için bir
// güvenlik ağı.
const SEASON_LOAD_TIMEOUT_MS = 8000;

export function useSharedSeason(competitionKey) {
  const { user, authLoading } = usePredictionAuth();
  const [state, setState] = useState(buildEmptySeasonState);

  useEffect(() => {
    setState(buildEmptySeasonState());
    // Firestore güvenlik kuralları okumayı `request.auth != null` şartına
    // bağlıyor (bkz. firestore.rules) -- auth durumu netleşmeden (authLoading)
    // ya da kullanıcı yoksa abone OLMUYORUZ; aksi halde ilk denemede
    // "izin reddedildi" hatası alıp o dinleyici tamamen ölür, kullanıcı
    // giriş yaptıktan SONRA bile (competitionKey değişmediği için efekt
    // yeniden çalışmaz) asla yeniden denenmezdi.
    if (!competitionKey || authLoading || !user) return undefined;

    const ref = doc(db, "seasons", competitionKey);
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setState({
        season: null,
        loading: false,
        error: new Error(
          "Firestore'dan yanıt alınamadı (zaman aşımı). Firebase Console'da Firestore Database'in oluşturulduğundan ve firestore.rules'un yayınlandığından emin ol."
        ),
      });
    }, SEASON_LOAD_TIMEOUT_MS);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        settled = true;
        window.clearTimeout(timeoutId);
        setState({ season: snap.exists() ? snap.data() : null, loading: false, error: null });
      },
      (error) => {
        settled = true;
        window.clearTimeout(timeoutId);
        // eslint-disable-next-line no-console
        console.error("Tahmin Ligi: sezon dinlenemedi ->", error);
        setState({ season: null, loading: false, error });
      }
    );
    return () => {
      window.clearTimeout(timeoutId);
      unsub();
    };
  }, [competitionKey, user, authLoading]);

  const comp = COMPETITIONS[competitionKey];
  const fixture = useMemo(() => {
    if (!state.season || !comp) return null;
    return comp.format === "swiss"
      ? deserializeFixture(state.season.fixture, comp.teams)
      : deserializeRoundRobinFixture(state.season.fixture, comp.teams);
  }, [state.season, comp]);

  const startSeason = useCallback(async () => {
    if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
    const ref = doc(db, "seasons", competitionKey);
    const existing = await getDoc(ref);
    if (existing.exists()) return; // başka biri az önce oluşturmuş olabilir
    const payload = await buildFreshSeasonPayload(competitionKey);
    await setDoc(ref, {
      ...payload,
      createdBy: user.uid,
      createdByName: user.displayName || "Bilinmeyen",
      createdAt: serverTimestamp(),
    });
  }, [competitionKey, user]);

  return { ...state, fixture, startSeason };
}

// Bir yarışmanın TÜM kullanıcılarının tahminlerini canlı dinler (sıralama
// tablosu için) ve mevcut kullanıcının kendi tahminlerini/gönderme
// fonksiyonunu döner.
export function usePredictions(competitionKey) {
  const { user } = usePredictionAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPredictions([]);
    if (!competitionKey) return undefined;
    const q = query(collection(db, "predictions"), where("competitionKey", "==", competitionKey));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPredictions(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [competitionKey]);

  const myPredictionsByMatch = useMemo(() => {
    if (!user) return {};
    const map = {};
    for (const p of predictions) {
      if (p.uid === user.uid) map[p.matchId] = p;
    }
    return map;
  }, [predictions, user]);

  const submitPrediction = useCallback(
    async (matchId, homeGoals, awayGoals) => {
      if (!user) throw new Error("Önce Google ile giriş yapmalısın.");
      const predictionId = `${competitionKey}_${matchId}_${user.uid}`;
      const ref = doc(db, "predictions", predictionId);
      await setDoc(ref, {
        uid: user.uid,
        displayName: user.displayName || "Bilinmeyen",
        photoURL: user.photoURL || null,
        competitionKey,
        matchId,
        homeGoals,
        awayGoals,
        createdAt: serverTimestamp(),
      });
    },
    [competitionKey, user]
  );

  return { predictions, myPredictionsByMatch, loading, submitPrediction };
}

// Bir tahminin gerçek sonuca göre kaç puan getirdiğini hesaplar:
// 5 = tam skor, 3 = doğru kazanan taraf + doğru gol farkı, 1 = sadece doğru
// kazanan/beraberlik, 0 = tamamen yanlış.
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

// Bir yarışmanın tam sıralama tablosunu (kullanıcı başına toplam puan +
// tahmin sayısı) üretir -- predictions ve season.results'tan türetilir,
// Firestore'da AYRICA saklanmaz (her zaman kaynağından yeniden hesaplanır).
export function buildLeaderboard(predictions, results) {
  const byUser = {};
  for (const p of predictions) {
    if (!byUser[p.uid]) {
      byUser[p.uid] = { uid: p.uid, displayName: p.displayName, photoURL: p.photoURL, points: 0, predicted: 0, scored: 0 };
    }
    const entry = byUser[p.uid];
    entry.predicted++;
    const actual = results[p.matchId];
    if (actual) {
      entry.points += scorePrediction(p, actual);
      entry.scored++;
    }
  }
  return Object.values(byUser).sort((a, b) => b.points - a.points || b.scored - a.scored);
}

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { COMPETITIONS } from "../data/competitions.js";
import { generateFixture } from "../utils/fixtureEngine.js";
import { generateRoundRobinFixture } from "../utils/roundRobinEngine.js";
import { simulateSeason } from "../utils/predictionEngine.js";
import { generateKnockoutBracket } from "../utils/knockoutEngine.js";
import { useTeamInjection, applyInjection } from "./TeamInjectionContext.jsx";
import { useTacticsContext } from "./TacticsContext.jsx";
import { useAchievements } from "./AchievementsContext.jsx";
import { useSettings } from "./SettingsContext.jsx";
import { useCareer, applyCareerCoeffs } from "./CareerContext.jsx";

// NOT: Bu context BİLİNÇLİ OLARAK localStorage kullanmaz -- her sayfa
// yenilemesinde (F5) TÜM yarışma verileri (çekiliş, fikstür, tahminler)
// sıfırlanır. Kullanıcı yeni bir kura çekerse (ya da sezonu sıfırlarsa) eski
// veriler zaten anında temizlenir; sayfa yenilendiğinde de "temiz bir
// sayfa"yla karşılaşmak istendi.

function isCompleteResults(results, teams) {
  if (!results) return false;
  for (const t of teams) {
    const fixtures = results[t.id];
    if (!fixtures) return false;
    for (const pot of [1, 2, 3, 4]) {
      if (!fixtures[pot]?.home || !fixtures[pot]?.away) return false;
    }
  }
  return true;
}

function emptyCompetitionState() {
  return {
    started: false,
    results: null,
    fixture: null,
    simulation: null,
    userScores: {},
    standingsOrder: null,
    knockout: null,
    // "Karşılıklı Geçmiş" (Head-to-Head) için: her simülasyon çalıştırması
    // (ilk otomatik simülasyon + her "tahminleri yenile") BİRİKTİRİLEREK
    // tutulur -- böylece iki takım arasındaki önceki simülasyon
    // sonuçlarını karşılaştırabiliyoruz. Sadece bu oturuma özeldir (kalıcı
    // değil); kura/sezon sıfırlanınca (clearCompetition) bu da temizlenir.
    matchHistory: [],
  };
}

const CompetitionContext = createContext(null);

export function CompetitionProvider({ children }) {
  const [state, setState] = useState(() => {
    const init = {};
    for (const key of Object.keys(COMPETITIONS)) init[key] = emptyCompetitionState();
    return init;
  });

  // Rüya Takım bir yarışmaya "gönderilmişse" (bkz. TeamInjectionContext), o
  // yarışmanın takım/oyuncu listesi buradan itibaren HER YERDE (kura,
  // fikstür, simülasyon, eleme turu) enjeksiyon uygulanmış haliyle kullanılır.
  const { injections } = useTeamInjection();
  const { applyCoeffDelta, advanceSeason: advanceCareerSeason, getCareer } = useCareer();
  const getComp = useCallback(
    (key) => {
      const injected = applyInjection(COMPETITIONS[key], injections[key]);
      return applyCareerCoeffs(injected, key, applyCoeffDelta);
    },
    [injections, applyCoeffDelta]
  );
  const { tactics } = useTacticsContext();
  const { unlock } = useAchievements();
  const { settings } = useSettings();

  const patch = useCallback((key, partial) => {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...partial } }));
  }, []);

  // Üç yarışmanın da en az bir kez başlatıldığı an "Sezon Gezgini" başarısını
  // açar -- state değiştikçe kontrol edilir (aksiyonun kendisinde değil,
  // burada tek bir yerde tutmak daha güvenli).
  useEffect(() => {
    if (Object.values(state).every((s) => s.started)) unlock("sezon-gezgini");
  }, [state, unlock]);

  // ---- Swiss (UCL / Avrupa Ligi) ----
  const setDrawResults = useCallback(
    (key, newResults) => {
      const comp = getComp(key);
      if (!isCompleteResults(newResults, comp.teams)) return;
      patch(key, {
        started: true,
        results: newResults,
        fixture: null,
        simulation: null,
        userScores: {},
        standingsOrder: null,
        knockout: null,
      });
      unlock("ilk-kura");
    },
    [patch, getComp, unlock]
  );

  // ---- League (Trendyol Süper Lig) ----
  const startLeagueSeason = useCallback(
    (key) => {
      const comp = getComp(key);
      const generated = generateRoundRobinFixture(comp.teams);
      patch(key, {
        started: true,
        fixture: generated,
        simulation: null,
        userScores: {},
        standingsOrder: null,
        knockout: null,
      });
      unlock("ilk-kura");
      if (key === "superlig") unlock("super-lig-taraftari");
    },
    [patch, getComp, unlock]
  );

  // ---- Ortak: fikstür üret / yeniden dağıt ----
  const ensureFixture = useCallback(
    (key) => {
      const comp = getComp(key);
      const slot = state[key];
      if (!slot || slot.fixture) return slot?.fixture || null;
      if (comp.format === "swiss") {
        if (!slot.results) return null;
        const generated = generateFixture(slot.results, comp.teams);
        patch(key, { fixture: generated });
        return generated;
      }
      // league formatında fikstür zaten startLeagueSeason ile üretilir.
      return null;
    },
    [state, patch, getComp]
  );

  const regenerateFixture = useCallback(
    (key) => {
      const comp = getComp(key);
      const slot = state[key];
      if (!slot) return null;
      if (comp.format === "swiss") {
        if (!slot.results) return null;
        const generated = generateFixture(slot.results, comp.teams);
        patch(key, { fixture: generated, simulation: null, knockout: null });
        return generated;
      }
      const generated = generateRoundRobinFixture(comp.teams);
      patch(key, { fixture: generated, simulation: null });
      return generated;
    },
    [state, patch, getComp]
  );

  const runSimulation = useCallback(
    (key, fx, allPlayersOverride, tacticsOverride) => {
      const comp = getComp(key);
      const slot = state[key];
      const targetFixture = fx || slot?.fixture;
      if (!targetFixture) return null;
      const sim = simulateSeason(targetFixture, {
        teams: comp.teams,
        allPlayers: allPlayersOverride || comp.getAllPlayers(),
        zones: comp.zones,
        tacticsById: tacticsOverride || tactics[key],
        settings,
      });
      const prevHistory = state[key]?.matchHistory || [];
      const newHistory = [...prevHistory, { runId: Date.now(), matches: sim.matchResults }];
      patch(key, { simulation: sim, knockout: null, matchHistory: newHistory });
      unlock("sampiyon-belirleyici");
      if (key === "ucl") unlock("ucl-yolcusu");
      if (key === "europa") unlock("avrupa-fatihi");
      if (newHistory.length >= 5) unlock("yenileme-bagimlisi");
      return sim;
    },
    [state, patch, getComp, tactics, unlock, settings]
  );

  const generateKnockout = useCallback(
    (key) => {
      const comp = getComp(key);
      const slot = state[key];
      if (!comp.hasKnockout || !slot?.simulation) return null;
      const teamById = Object.fromEntries(comp.teams.map((t) => [t.id, t]));
      const bracket = generateKnockoutBracket(slot.simulation.standings, teamById, tactics[key]);
      patch(key, { knockout: bracket });
      if (bracket?.champion) {
        unlock("sampiyon-belirleyici");
        unlock("kupa-sahibi");
      }
      return bracket;
    },
    [state, patch, getComp, tactics, unlock]
  );

  const updateUserScore = useCallback((key, matchId, field, value) => {
    setState((prev) => {
      const slot = prev[key];
      const nextScores = {
        ...slot.userScores,
        [matchId]: { ...(slot.userScores[matchId] || { home: "", away: "" }), [field]: value },
      };
      return { ...prev, [key]: { ...slot, userScores: nextScores } };
    });
  }, []);

  const clearUserScores = useCallback(
    (key) => {
      patch(key, { userScores: {} });
    },
    [patch]
  );

  const setStandingsOrder = useCallback(
    (key, orderedTeamIds) => {
      patch(key, { standingsOrder: orderedTeamIds });
    },
    [patch]
  );

  const clearCompetition = useCallback(
    (key) => {
      patch(key, emptyCompetitionState());
    },
    [patch]
  );

  // "Kariyer Modu": mevcut sezonun puan durumuna göre takım katsayılarını
  // (bkz. CareerContext) günceller, sonra yarışmayı sıfırlayıp yeni bir
  // kura/sezona hazır hale getirir. bonusTeamId (opsiyonel) -- ör. eleme
  // turu şampiyonu -- ekstra bir katsayı bonusu alır.
  const advanceToNextSeason = useCallback(
    (key, bonusTeamId) => {
      const slot = state[key];
      if (!slot?.simulation?.standings) return;
      advanceCareerSeason(key, slot.simulation.standings, bonusTeamId);
      patch(key, emptyCompetitionState());
    },
    [state, advanceCareerSeason, patch]
  );

  const value = {
    state,
    setDrawResults,
    startLeagueSeason,
    ensureFixture,
    regenerateFixture,
    runSimulation,
    generateKnockout,
    updateUserScore,
    clearUserScores,
    setStandingsOrder,
    clearCompetition,
    advanceToNextSeason,
  };

  return <CompetitionContext.Provider value={value}>{children}</CompetitionContext.Provider>;
}

// Belirli bir yarışmanın (key: "ucl" | "europa" | "superlig") state'ini ve
// eylemlerini döner -- bileşenler competitionKey'i her seferinde tekrar
// geçirmek zorunda kalmaz.
export function useCompetition(key) {
  const ctx = useContext(CompetitionContext);
  if (!ctx) throw new Error("useCompetition, bir <CompetitionProvider> içinde kullanılmalıdır.");
  // Geçersiz/bilinmeyen bir yarışma anahtarıyla (ör. hatalı yazılmış bir URL)
  // çökmek yerine getCompetition() ile aynı şekilde UCL'e geri düşer.
  const resolvedKey = COMPETITIONS[key] ? key : "ucl";
  const { injections } = useTeamInjection();
  const { applyCoeffDelta, getCareer } = useCareer();
  const injected = applyInjection(COMPETITIONS[resolvedKey], injections[resolvedKey]);
  const comp = applyCareerCoeffs(injected, resolvedKey, applyCoeffDelta);
  const slot = ctx.state[resolvedKey] || emptyCompetitionState();
  const careerSeason = getCareer(resolvedKey).season;
  return {
    competition: comp,
    careerSeason,
    ...slot,
    hasDraw: comp.format === "swiss" ? isCompleteResults(slot.results, comp.teams) : slot.started,
    hasFixture: !!slot.fixture,
    hasSimulation: !!slot.simulation,
    hasKnockout: !!slot.knockout,
    setDrawResults: (results) => ctx.setDrawResults(resolvedKey, results),
    startLeagueSeason: () => ctx.startLeagueSeason(resolvedKey),
    ensureFixture: () => ctx.ensureFixture(resolvedKey),
    regenerateFixture: () => ctx.regenerateFixture(resolvedKey),
    runSimulation: (fx, allPlayersOverride, tacticsOverride) =>
      ctx.runSimulation(resolvedKey, fx, allPlayersOverride, tacticsOverride),
    generateKnockout: () => ctx.generateKnockout(resolvedKey),
    updateUserScore: (matchId, field, value) => ctx.updateUserScore(resolvedKey, matchId, field, value),
    clearUserScores: () => ctx.clearUserScores(resolvedKey),
    setStandingsOrder: (order) => ctx.setStandingsOrder(resolvedKey, order),
    clearCompetition: () => ctx.clearCompetition(resolvedKey),
    advanceToNextSeason: (bonusTeamId) => ctx.advanceToNextSeason(resolvedKey, bonusTeamId),
  };
}

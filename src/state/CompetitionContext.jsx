import React, { createContext, useCallback, useContext, useState } from "react";
import { COMPETITIONS } from "../data/competitions.js";
import { generateFixture } from "../utils/fixtureEngine.js";
import { generateRoundRobinFixture } from "../utils/roundRobinEngine.js";
import { simulateSeason } from "../utils/predictionEngine.js";
import { generateKnockoutBracket } from "../utils/knockoutEngine.js";

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
  };
}

const CompetitionContext = createContext(null);

export function CompetitionProvider({ children }) {
  const [state, setState] = useState(() => {
    const init = {};
    for (const key of Object.keys(COMPETITIONS)) init[key] = emptyCompetitionState();
    return init;
  });

  const patch = useCallback((key, partial) => {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...partial } }));
  }, []);

  // ---- Swiss (UCL / Avrupa Ligi) ----
  const setDrawResults = useCallback(
    (key, newResults) => {
      const comp = COMPETITIONS[key];
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
    },
    [patch]
  );

  // ---- League (Trendyol Süper Lig) ----
  const startLeagueSeason = useCallback(
    (key) => {
      const comp = COMPETITIONS[key];
      const generated = generateRoundRobinFixture(comp.teams);
      patch(key, {
        started: true,
        fixture: generated,
        simulation: null,
        userScores: {},
        standingsOrder: null,
        knockout: null,
      });
    },
    [patch]
  );

  // ---- Ortak: fikstür üret / yeniden dağıt ----
  const ensureFixture = useCallback(
    (key) => {
      const comp = COMPETITIONS[key];
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
    [state, patch]
  );

  const regenerateFixture = useCallback(
    (key) => {
      const comp = COMPETITIONS[key];
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
    [state, patch]
  );

  const runSimulation = useCallback(
    (key, fx, allPlayersOverride) => {
      const comp = COMPETITIONS[key];
      const slot = state[key];
      const targetFixture = fx || slot?.fixture;
      if (!targetFixture) return null;
      const sim = simulateSeason(targetFixture, {
        teams: comp.teams,
        allPlayers: allPlayersOverride || comp.getAllPlayers(),
        zones: comp.zones,
      });
      patch(key, { simulation: sim, knockout: null });
      return sim;
    },
    [state, patch]
  );

  const generateKnockout = useCallback(
    (key) => {
      const comp = COMPETITIONS[key];
      const slot = state[key];
      if (!comp.hasKnockout || !slot?.simulation) return null;
      const teamById = Object.fromEntries(comp.teams.map((t) => [t.id, t]));
      const bracket = generateKnockoutBracket(slot.simulation.standings, teamById);
      patch(key, { knockout: bracket });
      return bracket;
    },
    [state, patch]
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
  };

  return <CompetitionContext.Provider value={value}>{children}</CompetitionContext.Provider>;
}

// Belirli bir yarışmanın (key: "ucl" | "europa" | "superlig") state'ini ve
// eylemlerini döner -- bileşenler competitionKey'i her seferinde tekrar
// geçirmek zorunda kalmaz.
export function useCompetition(key) {
  const ctx = useContext(CompetitionContext);
  if (!ctx) throw new Error("useCompetition, bir <CompetitionProvider> içinde kullanılmalıdır.");
  const comp = COMPETITIONS[key];
  const slot = ctx.state[key] || emptyCompetitionState();
  return {
    competition: comp,
    ...slot,
    hasDraw: comp.format === "swiss" ? isCompleteResults(slot.results, comp.teams) : slot.started,
    hasFixture: !!slot.fixture,
    hasSimulation: !!slot.simulation,
    hasKnockout: !!slot.knockout,
    setDrawResults: (results) => ctx.setDrawResults(key, results),
    startLeagueSeason: () => ctx.startLeagueSeason(key),
    ensureFixture: () => ctx.ensureFixture(key),
    regenerateFixture: () => ctx.regenerateFixture(key),
    runSimulation: (fx, allPlayersOverride) => ctx.runSimulation(key, fx, allPlayersOverride),
    generateKnockout: () => ctx.generateKnockout(key),
    updateUserScore: (matchId, field, value) => ctx.updateUserScore(key, matchId, field, value),
    clearUserScores: () => ctx.clearUserScores(key),
    setStandingsOrder: (order) => ctx.setStandingsOrder(key, order),
    clearCompetition: () => ctx.clearCompetition(key),
  };
}

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// "Kariyer Modu" -- gerçek terfi/küme düşme (bu simülatörde alt lig verisi
// yok) yerine HAFİF bir çok-sezonluk süreklilik sağlar: bir sezon
// tamamlanıp şampiyon belirlendiğinde, takımların o sezonki performansına
// göre katsayıları (coeff) küçük bir miktar değişir (üstte bitirenler
// güçlenir, altta bitirenler zayıflar) ve bu değişim BİRİKİMLİ olarak
// tarayıcıda kalıcı tutulur. Böylece "Yeni Sezona Geç" dendiğinde aynı
// takımlarla ama az farklı bir güç dengesiyle yeni bir kura/sezon başlar.
const STORAGE_KEY = "futbolSimulatorKariyer";
const MAX_CUMULATIVE_DELTA = 25;
const MAX_SEASON_DELTA = 4;
const MIN_EFFECTIVE_COEFF = 6;

function emptyCareer() {
  return { season: 1, coeffDeltas: {} };
}

function loadCareer() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function persistCareer(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // yok say
  }
}

const CareerContext = createContext(null);

export function CareerProvider({ children }) {
  const [career, setCareer] = useState(loadCareer);

  useEffect(() => persistCareer(career), [career]);

  const getCareer = useCallback((compKey) => career[compKey] || emptyCareer(), [career]);

  const getCoeffDelta = useCallback(
    (compKey, teamId) => career[compKey]?.coeffDeltas?.[teamId] || 0,
    [career]
  );

  // Verilen standings (finalizeStandings çıktısı) + zones'a göre her
  // takımın sezon sonu performans deltasını hesaplar ve BİRİKİMLİ olarak
  // uygular. bonusTeamId verilirse (ör. eleme turu şampiyonu) o takıma ekstra
  // bir bonus uygulanır -- lig fazı sıralaması tek başına kupa galibiyetini
  // yansıtmadığı için.
  const advanceSeason = useCallback((compKey, standings, bonusTeamId) => {
    if (!standings || standings.length === 0) return;
    const n = standings.length;
    setCareer((prev) => {
      const prevEntry = prev[compKey] || emptyCareer();
      const nextDeltas = { ...prevEntry.coeffDeltas };
      for (const s of standings) {
        const raw = (((n + 1) / 2 - s.rank) / n) * (MAX_SEASON_DELTA * 2);
        let seasonDelta = Math.round(raw);
        if (s.teamId === bonusTeamId) seasonDelta += 3;
        seasonDelta = Math.max(-MAX_SEASON_DELTA - 3, Math.min(MAX_SEASON_DELTA + 3, seasonDelta));
        const cur = nextDeltas[s.teamId] || 0;
        nextDeltas[s.teamId] = Math.max(
          -MAX_CUMULATIVE_DELTA,
          Math.min(MAX_CUMULATIVE_DELTA, cur + seasonDelta)
        );
      }
      return {
        ...prev,
        [compKey]: { season: prevEntry.season + 1, coeffDeltas: nextDeltas },
      };
    });
  }, []);

  const resetCareer = useCallback((compKey) => {
    setCareer((prev) => {
      const next = { ...prev };
      delete next[compKey];
      return next;
    });
  }, []);

  const applyCoeffDelta = useCallback(
    (compKey, teamId, baseCoeff) => {
      const delta = getCoeffDelta(compKey, teamId);
      if (!delta) return baseCoeff;
      return Math.max(MIN_EFFECTIVE_COEFF, Math.round((baseCoeff + delta) * 10) / 10);
    },
    [getCoeffDelta]
  );

  const value = { career, getCareer, getCoeffDelta, advanceSeason, resetCareer, applyCoeffDelta };
  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer bir <CareerProvider> içinde kullanılmalıdır.");
  return ctx;
}

// Bir yarışma nesnesindeki (applyInjection sonrası) takımların coeff'ini,
// o yarışmanın kariyer deltalarına göre ayarlar. applyInjection ile aynı
// kompozisyon deseni: sadece coeff değişir, takım kimliği/oyuncuları aynen
// kalır.
export function applyCareerCoeffs(comp, compKey, applyCoeffDelta) {
  if (!comp) return comp;
  const teams = comp.teams.map((t) => ({ ...t, coeff: applyCoeffDelta(compKey, t.id, t.coeff) }));
  const getTeamsByPot = comp.getTeamsByPot ? (pot) => teams.filter((t) => t.pot === pot) : null;
  return { ...comp, teams, getTeamsByPot };
}

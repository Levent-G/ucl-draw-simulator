import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// "Kariyer Modu" -- gerçek terfi/küme düşme (bu simülatörde alt lig verisi
// yok) yerine HAFİF bir çok-sezonluk süreklilik sağlar: bir sezon
// tamamlanıp şampiyon belirlendiğinde, takımların o sezonki performansına
// göre katsayıları (coeff) küçük bir miktar değişir (üstte bitirenler
// güçlenir, altta bitirenler zayıflar) ve bu değişim BİRİKİMLİ olarak
// tarayıcıda kalıcı tutulur. Böylece "Yeni Sezona Geç" dendiğinde aynı
// takımlarla ama az farklı bir güç dengesiyle yeni bir kura/sezon başlar.
const STORAGE_KEY = "futbolSimulatorKariyer";
const MAX_CUMULATIVE_DELTA = 35; // uç bir güvenlik sınırı -- normal koşulda ekseriyetle denge (aşağıya bakın) buna hiç ulaşmaz
const MAX_SEASON_DELTA = 4;
const MIN_EFFECTIVE_COEFF = 6;
// Her sezon, bir önceki BİRİKİMLİ delta bu oranla "hafifçe küçülür" (mean
// reversion) YENİ sezonun deltası eklenmeden önce. Sabit bir tavana çarpıp
// SONSUZA DEK orada donmak yerine (bkz. 15 sezonluk stres testinde
// gözlemlenen gerçek sorun: min/max 9. sezondan itibaren tamamen sabitlendi),
// bir takımın güçlü/zayıf kalması ancak PERFORMANSINI SÜRDÜRMESİYLE mümkün
// olur -- tıpkı gerçek hayattaki katsayı/sıralama sistemleri gibi.
const DECAY_FACTOR = 0.9;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Saf (yan etkisiz) hesaplama -- ayrı test edilebilsin diye component'ten
// çıkarıldı. prevDeltas: { [teamId]: number }. standings: finalizeStandings
// çıktısı ({ teamId, rank, ... }[]). bonusTeamId (opsiyonel): ekstra bonus
// alacak takım (ör. eleme turu şampiyonu).
export function computeNextCoeffDeltas(prevDeltas, standings, bonusTeamId) {
  if (!standings || standings.length === 0) return { ...prevDeltas };
  const n = standings.length;
  const nextDeltas = { ...prevDeltas };
  for (const s of standings) {
    const raw = (((n + 1) / 2 - s.rank) / n) * (MAX_SEASON_DELTA * 2);
    let seasonDelta = Math.round(raw);
    if (s.teamId === bonusTeamId) seasonDelta += 3;
    seasonDelta = clamp(seasonDelta, -MAX_SEASON_DELTA - 3, MAX_SEASON_DELTA + 3);
    const decayed = (nextDeltas[s.teamId] || 0) * DECAY_FACTOR;
    nextDeltas[s.teamId] = clamp(Math.round((decayed + seasonDelta) * 10) / 10, -MAX_CUMULATIVE_DELTA, MAX_CUMULATIVE_DELTA);
  }
  return nextDeltas;
}

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
    setCareer((prev) => {
      const prevEntry = prev[compKey] || emptyCareer();
      const nextDeltas = computeNextCoeffDeltas(prevEntry.coeffDeltas, standings, bonusTeamId);
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

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// Kullanıcının takımlara atadığı "oyun tarzı" (Antrenör Modu). Sadece bu
// oturuma özel (kalıcı değil), tıpkı diğer state'ler gibi. Gerçek çarpan
// mantığı utils/predictionEngine.js'teki TACTICS tablosundadır -- burada
// sadece hangi takıma hangi taktiğin atandığı tutulur.
const TacticsContext = createContext(null);

export function TacticsProvider({ children }) {
  // { [compKey]: { [teamId]: "attack" | "defensive" } } -- "balanced" hiç
  // kaydedilmez (varsayılan zaten odur), böylece boş obje = hiç taktik yok.
  const [tactics, setTactics] = useState({});

  const setTeamTactic = useCallback((compKey, teamId, tacticKey) => {
    setTactics((prev) => {
      const compTactics = { ...(prev[compKey] || {}) };
      if (!tacticKey || tacticKey === "balanced") {
        delete compTactics[teamId];
      } else {
        compTactics[teamId] = tacticKey;
      }
      return { ...prev, [compKey]: compTactics };
    });
  }, []);

  const clearCompTactics = useCallback((compKey) => {
    setTactics((prev) => {
      if (!prev[compKey]) return prev;
      const next = { ...prev };
      delete next[compKey];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ tactics, setTeamTactic, clearCompTactics }),
    [tactics, setTeamTactic, clearCompTactics]
  );

  return <TacticsContext.Provider value={value}>{children}</TacticsContext.Provider>;
}

// Ham context -- tüm yarışmaların taktik haritasına erişir. CompetitionContext
// gibi, "key" parametresini kendisi tekrar tekrar alan yerlerde kullanılır.
export function useTacticsContext() {
  const ctx = useContext(TacticsContext);
  if (!ctx) throw new Error("useTacticsContext bir <TacticsProvider> içinde kullanılmalıdır.");
  return ctx;
}

// Tek bir yarışmaya scoped, sayfa/bileşenlerin kullanacağı pratik hook.
export function useTeamTactics(compKey) {
  const { tactics, setTeamTactic, clearCompTactics } = useTacticsContext();
  return {
    teamTactics: tactics[compKey] || {},
    setTeamTactic: (teamId, tacticKey) => setTeamTactic(compKey, teamId, tacticKey),
    clearCompTactics: () => clearCompTactics(compKey),
  };
}

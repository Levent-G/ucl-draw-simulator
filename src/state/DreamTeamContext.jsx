import React, { createContext, useCallback, useContext, useState } from "react";

// Rüya Takım kadrosu (4-3-3 formasyonu) + oyuncu karşılaştırma seçimleri.
// Sadece bu oturuma özel (kalıcı değil), tıpkı transfer merkezi gibi.
// 4-3-3 formasyonu; satır sırası kaleden forvete doğru (pitch'te alttan
// üste render edilir).
export const FORMATION_SLOTS = [
  { id: "gk1", position: "GK", row: 1 },
  { id: "df1", position: "DF", row: 2 },
  { id: "df2", position: "DF", row: 2 },
  { id: "df3", position: "DF", row: 2 },
  { id: "df4", position: "DF", row: 2 },
  { id: "mf1", position: "MF", row: 3 },
  { id: "mf2", position: "MF", row: 3 },
  { id: "mf3", position: "MF", row: 3 },
  { id: "fw1", position: "FW", row: 4 },
  { id: "fw2", position: "FW", row: 4 },
  { id: "fw3", position: "FW", row: 4 },
];

const DreamTeamContext = createContext(null);

export function DreamTeamProvider({ children }) {
  const [squad, setSquad] = useState({});
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);

  const setSlotPlayer = useCallback((slotId, globalId) => {
    setSquad((prev) => ({ ...prev, [slotId]: globalId }));
  }, []);

  const clearSlot = useCallback((slotId) => {
    setSquad((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  const clearSquad = useCallback(() => setSquad({}), []);

  const value = {
    squad,
    setSlotPlayer,
    clearSlot,
    clearSquad,
    compareA,
    compareB,
    setCompareA,
    setCompareB,
  };

  return <DreamTeamContext.Provider value={value}>{children}</DreamTeamContext.Provider>;
}

export function useDreamTeam() {
  const ctx = useContext(DreamTeamContext);
  if (!ctx) throw new Error("useDreamTeam bir <DreamTeamProvider> içinde kullanılmalıdır.");
  return ctx;
}

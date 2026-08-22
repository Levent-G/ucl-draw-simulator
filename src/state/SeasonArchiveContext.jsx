import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAchievements } from "./AchievementsContext.jsx";

// Tamamlanan sezonların (şampiyon belli olduğunda) kısa bir özetini
// localStorage'a yazan, KASITLI olarak CompetitionContext'ten AYRI bir
// context. CompetitionContext bilinçli olarak kalıcı değildir (bkz. o
// dosyadaki not) -- burada ise tam tersine, kullanıcının "geçmiş
// sezonlar" arşivini sayfa yenilemeleri/oturumlar arasında görebilmesi
// isteniyor. Sadece küçük bir ÖZET saklanır (şampiyon, puan durumu ilk 5,
// gol kralı) -- tüm fikstür/maç olayları gibi büyük veriler DEĞİL.
const STORAGE_KEY = "futbolSimulatorArsiv";
const MAX_ENTRIES = 60;

function loadArchive() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function persistArchive(entries) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    // Kota dolu / gizli sekme gibi durumlarda sessizce yok say.
  }
}

const SeasonArchiveContext = createContext(null);

export function SeasonArchiveProvider({ children }) {
  const [entries, setEntries] = useState(loadArchive);
  const { unlock } = useAchievements();

  useEffect(() => {
    persistArchive(entries);
    if (entries.length >= 3) unlock("arsivci");
    if (entries.length >= 10) unlock("arsiv-koleksiyoncu");
  }, [entries, unlock]);

  const addEntry = useCallback((entry) => {
    setEntries((prev) => {
      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        savedAt: Date.now(),
        ...entry,
      };
      return [record, ...prev].slice(0, MAX_ENTRIES);
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearArchive = useCallback(() => setEntries([]), []);

  const value = { entries, addEntry, removeEntry, clearArchive };
  return <SeasonArchiveContext.Provider value={value}>{children}</SeasonArchiveContext.Provider>;
}

export function useSeasonArchive() {
  const ctx = useContext(SeasonArchiveContext);
  if (!ctx) throw new Error("useSeasonArchive bir <SeasonArchiveProvider> içinde kullanılmalıdır.");
  return ctx;
}

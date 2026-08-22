import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { COMPETITIONS } from "../data/competitions.js";
import { useAchievements } from "./AchievementsContext.jsx";

// Rüya Takım'ı bir yarışmaya "gönderince" ne olur: o yarışmadaki takımlardan
// rastgele biri çıkarılır, yerine Rüya Takım (kadrosuyla birlikte) eklenir.
// Bu, o yarışmanın normal kura çekimi/fikstür/simülasyon akışına AYNEN dahil
// olur -- ayrı bir mod değildir. Sadece bu oturuma özel (kalıcı değil).
const TeamInjectionContext = createContext(null);

export function TeamInjectionProvider({ children }) {
  // { [compKey]: { removedTeam, team, players } }
  const [injections, setInjections] = useState({});
  const { unlock } = useAchievements();

  const sendDreamTeam = useCallback(
    (compKey, teamTemplate, players) => {
      const comp = COMPETITIONS[compKey];
      if (!comp) return null;
      const removedTeam = comp.teams[Math.floor(Math.random() * comp.teams.length)];
      // Torba/pot yerine geçtiği takımdan devralınır -- böylece kura torba
      // dengesi (UCL/Avrupa Ligi'nde 4 torba x 9 takım) bozulmaz.
      const team = { ...teamTemplate, pot: removedTeam.pot };
      const finalPlayers = players.map((p) => ({ ...p, teamId: team.id }));
      setInjections((prev) => ({
        ...prev,
        [compKey]: { removedTeam, team, players: finalPlayers },
      }));
      unlock("taktisyen");
      return removedTeam;
    },
    [unlock]
  );

  const clearInjection = useCallback((compKey) => {
    setInjections((prev) => {
      if (!prev[compKey]) return prev;
      const next = { ...prev };
      delete next[compKey];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ injections, sendDreamTeam, clearInjection }),
    [injections, sendDreamTeam, clearInjection]
  );

  return <TeamInjectionContext.Provider value={value}>{children}</TeamInjectionContext.Provider>;
}

export function useTeamInjection() {
  const ctx = useContext(TeamInjectionContext);
  if (!ctx) throw new Error("useTeamInjection bir <TeamInjectionProvider> içinde kullanılmalıdır.");
  return ctx;
}

// Bir yarışma nesnesine (COMPETITIONS[key]) enjeksiyonu uygular: değiştirilen
// takımı Rüya Takım ile değiştirir, oyuncu listesinden çıkarılan takımın
// oyuncularını çıkarıp Rüya Takım kadrosunu ekler. Enjeksiyon yoksa nesneyi
// olduğu gibi döner.
export function applyInjection(comp, injection) {
  if (!comp || !injection) return comp;
  const teams = comp.teams.map((t) => (t.id === injection.removedTeam.id ? injection.team : t));
  const getAllPlayers = () => {
    const base = comp.getAllPlayers().filter((p) => p.teamId !== injection.removedTeam.id);
    return [...base, ...injection.players];
  };
  const getPlayersByTeam = (teamId) =>
    teamId === injection.team.id ? injection.players : comp.getPlayersByTeam(teamId);
  const getTeamsByPot = comp.getTeamsByPot ? (pot) => teams.filter((t) => t.pot === pot) : null;
  return { ...comp, teams, getAllPlayers, getPlayersByTeam, getTeamsByPot, injection };
}

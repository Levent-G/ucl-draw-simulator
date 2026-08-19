// Rüya Takım / Oyuncu Karşılaştırma gibi TÜM yarışmaları tek bir havuzda
// arayan özellikler için, üç yarışmanın (UCL, Avrupa Ligi, Süper Lig)
// oyuncularını TEK bir listede, hangi yarışma+takımdan geldiği etiketiyle
// birleştirir.
import { COMPETITIONS, COMPETITION_LIST } from "../data/competitions.js";
import { derivePhysicalAttributes } from "./playerAttributes.js";

let cache = null;

export function getAllPlayersEverywhere() {
  if (cache) return cache;
  const merged = [];
  for (const comp of COMPETITION_LIST) {
    const teamById = Object.fromEntries(comp.teams.map((t) => [t.id, t]));
    for (const p of comp.getAllPlayers()) {
      const team = teamById[p.teamId];
      const globalId = `${comp.key}:${p.id}`;
      const enriched = {
        ...p,
        globalId,
        competitionKey: comp.key,
        competitionName: comp.shortName,
        team,
        teamName: team?.name || "",
      };
      merged.push({ ...enriched, ...derivePhysicalAttributes(enriched) });
    }
  }
  cache = merged;
  return merged;
}

export function findPlayerByGlobalId(globalId) {
  return getAllPlayersEverywhere().find((p) => p.globalId === globalId) || null;
}

export function getCompetitionOf(key) {
  return COMPETITIONS[key];
}

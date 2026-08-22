// İstatistik sayfası için takım/oyuncu verisini grafiklerin ve tabloların
// ihtiyaç duyduğu şekle dönüştüren saf (side-effect'siz) yardımcılar.
// YARIŞMADAN BAĞIMSIZDIR: takım/oyuncu listesi parametre olarak verilir.
export function teamsByCoeffDesc(teams) {
  return [...teams].sort((a, b) => b.coeff - a.coeff);
}

export function positionCounts(allPlayers) {
  const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  for (const p of allPlayers) {
    counts[p.position] = (counts[p.position] || 0) + 1;
  }
  return counts;
}

export function countryAggregates(teams, countryNames) {
  const map = {};
  for (const t of teams) {
    if (!map[t.country]) {
      map[t.country] = {
        country: t.country,
        name: countryNames[t.country] || t.country,
        teamCount: 0,
        totalCoeff: 0,
        potCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
        teams: [],
      };
    }
    const entry = map[t.country];
    entry.teamCount++;
    entry.totalCoeff += t.coeff;
    if (t.pot) entry.potCounts[t.pot] = (entry.potCounts[t.pot] || 0) + 1;
    entry.teams.push(t);
  }
  return Object.values(map)
    .map((e) => ({
      ...e,
      avgCoeff: e.totalCoeff / e.teamCount,
      strongestTeam: [...e.teams].sort((a, b) => b.coeff - a.coeff)[0],
    }))
    .sort((a, b) => b.totalCoeff - a.totalCoeff);
}

// Bir formasyonun (bkz. DreamTeamContext FORMATIONS) slotlarına, o
// simülasyondaki gol/asist/reyting performansına göre en iyi 11'i otomatik
// yerleştirir -- "Sezonun 11'i" için kullanılır. Kart cezası (reds/yellows)
// hafif bir düşüş uygular; kaleci gibi gol/asist üretmeyen mevkilerde asıl
// belirleyici reyting olur.
export function computeTeamOfSeason(allPlayers, playerStats, formationSlots) {
  if (!playerStats || !allPlayers.length) return null;
  const scored = allPlayers.map((p) => {
    const s = playerStats[p.id] || { goals: 0, assists: 0, yellows: 0, reds: 0 };
    const composite = (s.goals || 0) * 4 + (s.assists || 0) * 2 - (s.reds || 0) * 3 - (s.yellows || 0) * 0.4 + p.rating * 0.5;
    return { ...p, ...s, composite };
  });

  const byPosition = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of scored) byPosition[p.position]?.push(p);
  for (const pos of Object.keys(byPosition)) byPosition[pos].sort((a, b) => b.composite - a.composite);

  const cursor = { GK: 0, DF: 0, MF: 0, FW: 0 };
  return formationSlots.map((slot) => {
    const pool = byPosition[slot.position] || [];
    const player = pool[cursor[slot.position]] || null;
    cursor[slot.position]++;
    return { slot, player };
  });
}

export function topScorers(allPlayers, playerStats, limit = 12) {
  if (!playerStats) return [];
  return allPlayers
    .map((p) => ({ ...p, ...(playerStats[p.id] || { goals: 0, assists: 0, yellows: 0, reds: 0 }) }))
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, limit);
}

export function topCarded(allPlayers, playerStats, limit = 12) {
  if (!playerStats) return [];
  return allPlayers
    .map((p) => ({ ...p, ...(playerStats[p.id] || { goals: 0, assists: 0, yellows: 0, reds: 0 }) }))
    .filter((p) => p.yellows > 0 || p.reds > 0)
    .sort((a, b) => b.reds - a.reds || b.yellows - a.yellows)
    .slice(0, limit);
}

export function allPlayersWithStats(teams, allPlayers, playerStats) {
  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
  return allPlayers.map((p) => {
    const team = teamById[p.teamId];
    const stats = playerStats?.[p.id] || { goals: 0, assists: 0, yellows: 0, reds: 0 };
    return {
      ...p,
      teamName: team?.name || "",
      teamShort: team?.short || "",
      ...stats,
    };
  });
}

export function teamsWithSimPoints(teams, standings) {
  if (!standings) {
    return teams.map((t) => ({
      ...t,
      simPoints: null,
      simRank: null,
      status: null,
      statusLabel: null,
      statusTone: null,
    }));
  }
  const byId = Object.fromEntries(standings.map((s) => [s.teamId, s]));
  return teams.map((t) => ({
    ...t,
    simPoints: byId[t.id]?.pts ?? null,
    simRank: byId[t.id]?.rank ?? null,
    status: byId[t.id]?.status ?? null,
    statusLabel: byId[t.id]?.statusLabel ?? null,
    statusTone: byId[t.id]?.statusTone ?? null,
  }));
}

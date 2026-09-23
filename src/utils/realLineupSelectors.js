// "Muhtemel Kadro" (ProbableLineup.jsx) ve Takım Profili'ndeki saha
// görselleştirmesinin (TeamProfilePage.jsx'teki buildPitchSquad), pür
// reytinge-göre-sırala algoritması yerine, takımın GERÇEK son maçındaki
// GERÇEK ilk 11'i ve GERÇEK diziliş şeklini (bkz. src/data/latestLineups.js
// [Süper Lig] ve src/data/latestLineupsUcl.js + src/data/actualLineups.js
// [UCL, Lig Fazı 1. Hafta]) temel almasını sağlayan paylaşılan seçiciler.
//
// Kullanıcı isteği: "muhtemel kadrolar doğru değil, son maçlarındaki
// çıktıkları kadrolara bak dizilişlere falan bak ona göre çek düzelt" +
// (önceki istek) "kadrolarda eksik varsa ... o maçtan sonra eksikler
// oluşmuş ise eksikleri tamamlayabilecekleri oyuncuları koy". Bu yüzden:
// 1) Önce gerçek ilk 11 + gerçek diziliş denenir.
// 2) Gerçek ilk 11'deki bir oyuncu ARTIK sakat/cezalıysa (bkz.
//    src/data/injuries.js), kadronun aynı mevkideki en yüksek reytingli
//    MÜSAİT oyuncusuyla değiştirilir (uydurma değil, GERÇEK bir alternatif).
// 3) O takım için gerçek veri hiç yoksa (araştırmada doğrulanamadı), bu
//    modül null döner ve çağıran taraf ESKİ salt-reyting algoritmasına
//    düşer (fabrikasyon riski yok, sadece daha az isabetli bir tahmin).
import { FORMATIONS } from "../state/DreamTeamContext.jsx";
import { LATEST_LINEUP_SUPERLIG } from "../data/latestLineups.js";
import { LATEST_LINEUP_UCL } from "../data/latestLineupsUcl.js";
import { ACTUAL_LINEUPS } from "../data/actualLineups.js";
import { REAL_FIXTURE_2026 } from "../data/realFixture2026.js";
import { CURRENT_INJURIES } from "../data/injuries.js";

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

const INJURY_NAMES_BY_TEAM = CURRENT_INJURIES.reduce((acc, entry) => {
  if (!acc[entry.teamId]) acc[entry.teamId] = new Set();
  acc[entry.teamId].add(normalizeName(entry.playerName));
  return acc;
}, {});

function isCurrentlyInjured(teamId, playerName) {
  return INJURY_NAMES_BY_TEAM[teamId]?.has(normalizeName(playerName)) || false;
}

// Bir UCL takımının, verilen matchId'deki maçta ev mi deplasman mı
// oynadığını REAL_FIXTURE_2026'nın ham (homeId/awayId) verisinden bulur.
function findUclMatchSide(teamId, matchId) {
  for (const week of REAL_FIXTURE_2026) {
    const match = week.matches.find((m) => m.id === matchId);
    if (match) {
      if (match.homeId === teamId) return "home";
      if (match.awayId === teamId) return "away";
      return null;
    }
  }
  return null;
}

// Takımın en son (araştırılmış) gerçek maçındaki ilk 11 isim listesini
// (GK -> DF -> MF -> FW sırasında, bkz. FORMATIONS'ın slot sırası) ve gerçek
// diziliş şeklini döner. Bu takım için doğrulanmış veri yoksa null.
export function getLatestRealXi({ teamId, teamName, competitionKey }) {
  if (competitionKey === "superlig") {
    const entry = LATEST_LINEUP_SUPERLIG[teamId];
    if (!entry) return null;
    return { names: entry.xi, formation: entry.formation, source: entry.source };
  }
  if (competitionKey === "ucl") {
    const meta = LATEST_LINEUP_UCL[teamName];
    if (!meta) return null;
    const side = findUclMatchSide(teamId, meta.matchId);
    if (!side) return null;
    const actualEntry = ACTUAL_LINEUPS.find((a) => a.matchId === meta.matchId);
    const names = side === "home" ? actualEntry?.homeXI : actualEntry?.awayXI;
    if (!names || names.length === 0) return null;
    return { names, formation: meta.formation, source: meta.source };
  }
  return null;
}

// Araştırılmış gerçek bir ismi kadrodaki (players) bir oyuncu nesnesine
// eşler -- önce birebir normalize eşleşme, olmazsa soyadı (son kelime)
// eşleşmesi denenir. Eşleşme bulunamazsa null döner (isim yine de METİN
// olarak gösterilmelidir, UYDURULMAMALIDIR -- bkz. ActualLineup.jsx).
function matchRosterPlayer(rawName, players, usedIds) {
  const norm = normalizeName(rawName);
  let found = players.find((p) => !usedIds.has(p.id) && normalizeName(p.name) === norm);
  if (found) return found;
  const lastWord = norm.split(" ").pop();
  if (!lastWord) return null;
  found = players.find((p) => !usedIds.has(p.id) && normalizeName(p.name).split(" ").pop() === lastWord);
  return found || null;
}

// Gerçek son maç ilk 11'ini + gerçek diziliş şeklini saha slotlarına atar;
// gerekirse (sakat/cezalı olmuş ya da o slotun ismi hiç doğrulanamamışsa)
// kadronun aynı mevkideki en iyi müsait oyuncusuyla doldurur. Bu takım için
// hiç gerçek veri yoksa null döner.
export function buildRealBasedLineup({ teamId, teamName, competitionKey, players }) {
  const real = getLatestRealXi({ teamId, teamName, competitionKey });
  if (!real || !FORMATIONS[real.formation]) return null;

  const slots = FORMATIONS[real.formation].slots;
  const usedIds = new Set();

  const prelim = slots.map((slot, i) => {
    const rawName = real.names[i] || null;
    const player = rawName ? matchRosterPlayer(rawName, players, usedIds) : null;
    if (player) usedIds.add(player.id);
    return { slot, rawName, player };
  });

  const pools = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) {
    if (pools[p.position] && !isCurrentlyInjured(teamId, p.name)) pools[p.position].push(p);
  }
  for (const pos in pools) pools[pos].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const assigned = prelim.map(({ slot, rawName, player }) => {
    const realPlayerInjured = player && isCurrentlyInjured(teamId, player.name);
    if (!rawName || realPlayerInjured) {
      const pool = pools[slot.position] || [];
      const replacement = pool.find((p) => !usedIds.has(p.id));
      if (replacement) usedIds.add(replacement.id);
      return {
        slot,
        player: replacement || null,
        rawName: null,
        isReplacement: true,
        replacedInjuredName: realPlayerInjured ? player.name : null,
      };
    }
    return { slot, player, rawName, isReplacement: false, replacedInjuredName: null };
  });

  return { assigned, formation: real.formation, source: real.source };
}

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
// (SIRASI ÖNEMSİZ -- buildRealBasedLineup her ismi kadronun kendi mevki
// etiketine göre yerleştirir) ve gerçek diziliş şeklini döner. Bu takım
// için doğrulanmış veri yoksa null.
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
//
// Kullanıcı geri bildirimi: "muhtemel kadrolar doğru mevkilerde olmuyor" --
// kök neden: ESKİ sürüm, araştırılmış xi listesinin GK->DF->MF->FW SIRASINDA
// olduğunu VARSAYIP slotlara indeks bazlı (i'inci isim -> i'inci slot)
// atıyordu. Ama araştırma kaynakları (maç raporları) bu sırayı GARANTİ
// ETMİYOR -- ör. bir kanat oyuncusu listede "savunma" bölgesinde görünüp
// yanlışlıkla bir bek slotuna, bir santrfor da bir orta saha slotuna
// düşebiliyordu. Artık her gerçek ismi ÖNCE kadrodaki (players) GERÇEK
// mevki etiketine (player.position) göre eşleştiriyoruz -- sıraya değil,
// GERÇEK mevkiye güveniyoruz.
export function buildRealBasedLineup({ teamId, teamName, competitionKey, players }) {
  const real = getLatestRealXi({ teamId, teamName, competitionKey });
  if (!real || !FORMATIONS[real.formation]) return null;

  const slots = FORMATIONS[real.formation].slots;
  const usedIds = new Set();

  // 1. Her gerçek ismi kadrodaki bir oyuncuya eşle ve kadronun KENDİ
  //    kayıtlı mevki etiketini (GK/DF/MF/FW) al -- xi listesindeki SIRAYA
  //    değil, bu gerçek etikete göre slotlara dağıtılacak.
  const matchedByPosition = { GK: [], DF: [], MF: [], FW: [] };
  const unmatchedNames = [];
  for (const rawName of real.names) {
    const player = matchRosterPlayer(rawName, players, usedIds);
    if (player) {
      usedIds.add(player.id);
      (matchedByPosition[player.position] || (matchedByPosition[player.position] = [])).push({ rawName, player });
    } else {
      unmatchedNames.push(rawName);
    }
  }

  // 2. Sakat/cezalı OLMAYAN, henüz kullanılmamış oyunculardan mevkiine göre
  //    reytinge göre sıralı bir "tamamlama/yedek" havuzu -- hem sakat gerçek
  //    starterların yerine hem de gerçek veri hiç yetmeyen slotlar için.
  const fallbackPools = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) {
    if (fallbackPools[p.position] && !isCurrentlyInjured(teamId, p.name)) fallbackPools[p.position].push(p);
  }
  for (const pos in fallbackPools) fallbackPools[pos].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const takeFallback = (position) => {
    const pool = fallbackPools[position] || [];
    const replacement = pool.find((p) => !usedIds.has(p.id));
    if (replacement) usedIds.add(replacement.id);
    return replacement || null;
  };

  // 3. Slotları ÖNCE kendi mevkisiyle eşleşen gerçek adayla doldurmayı dene.
  const prelim = slots.map((slot) => ({ slot, known: matchedByPosition[slot.position]?.shift() || null }));

  // Bir mevki kategorisinde slot sayısından FAZLA gerçek aday çıkabilir (ör.
  // 3 MF slotuna karşı 5 "MF" etiketli gerçek starter -- roster'da kanat
  // oyuncusu MF/FW gibi tek bir sabit mevkiyle etiketlenmiş olsa da, o maçta
  // formasyonun başka bir hattında oynamış olabilir). Bu TAŞAN ama hâlâ
  // GERÇEK starterlar tamamen atılmasın diye ayrı bir havuzda tutulup, kendi
  // mevkisinde gerçek aday bulunamayan bir slotu doldurmak için kullanılır --
  // ama SADECE aynı "bölge" içinde (savunma: GK/DF, hücum: MF/FW) -- yoksa
  // ör. taşan bir kanat oyuncusu (MF etiketli) boş kalan bir BEK slotuna
  // düşüp görsel olarak "defans oynuyormuş" gibi YANLIŞ bir izlenim
  // verebilir. Aynı bölgede taşan gerçek aday yoksa, o slot dürüstçe
  // algoritmik en iyi müsait oyuncuya düşer (uydurma bir mevki eşleşmesi
  // yapılmaz).
  const ZONE_OF_POSITION = { GK: "back", DF: "back", MF: "front", FW: "front" };
  const overflowByZone = { back: [], front: [] };
  for (const pos in matchedByPosition) overflowByZone[ZONE_OF_POSITION[pos]].push(...matchedByPosition[pos]);

  const assigned = prelim.map(({ slot, known }) => {
    if (known) {
      const realPlayerInjured = isCurrentlyInjured(teamId, known.player.name);
      if (!realPlayerInjured) {
        return { slot, player: known.player, rawName: known.rawName, isReplacement: false, replacedInjuredName: null };
      }
      const replacement = takeFallback(slot.position);
      return { slot, player: replacement, rawName: null, isReplacement: true, replacedInjuredName: known.player.name };
    }
    const overflow = overflowByZone[ZONE_OF_POSITION[slot.position]].shift();
    if (overflow) {
      return { slot, player: overflow.player, rawName: overflow.rawName, isReplacement: false, replacedInjuredName: null };
    }
    const unmatchedName = unmatchedNames.shift();
    if (unmatchedName) {
      return { slot, player: null, rawName: unmatchedName, isReplacement: false, replacedInjuredName: null };
    }
    const replacement = takeFallback(slot.position);
    return { slot, player: replacement, rawName: null, isReplacement: true, replacedInjuredName: null };
  });

  return { assigned, formation: real.formation, source: real.source };
}

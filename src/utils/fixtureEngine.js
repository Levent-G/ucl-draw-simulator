// ============================================================================
// Fikstür (maç günü / hafta) motoru
// ============================================================================
// Kura çekimi sonucu (results) her takımın 8 rakibini (torba başına 1 iç
// saha + 1 deplasman) belirler ama HANGİ HAFTA oynanacaklarını belirlemez.
// Gerçek UEFA lig fazı 8 hafta sürer (Eylül-Ocak). Burada 144 maçı (36 takım
// x 8 maç / 2) 8 haftaya öyle dağıtıyoruz ki her takım her haftada tam
// olarak bir kez oynasın.
//
// Bu klasik bir "1-factorization" problemidir: 8-regular bir grafın (36
// düğüm, 144 kenar) kenarlarını, her biri 36 düğümü tam kaplayan (perfect
// matching) 8 ayrık gruba ayırmak. TÜM 144 kenarı TEK SEFERDE (derin
// backtracking ile) atamaya çalışmak üstel patlayabilir (144 kenar x 8
// seçenek) -- bunun yerine HAFTA HAFTA ilerliyoruz: her turda, kalan
// kenarlardan sadece bir "mükemmel eşleşme" (36 takımın hepsini kapsayan 18
// maç) çıkarıyoruz. Bu, arama uzayını turda ~36 düğümle sınırlı tutar ve çok
// daha hızlı/güvenli çalışır. Bir tur veya tüm süreç tıkanırsa (nadiren),
// baştan rastgele bir sırayla yeniden dener.
export const MATCHDAY_LABELS = [
  "1. Hafta — Eylül 2026",
  "2. Hafta — Ekim 2026",
  "3. Hafta — Ekim 2026",
  "4. Hafta — Kasım 2026",
  "5. Hafta — Kasım 2026",
  "6. Hafta — Aralık 2026",
  "7. Hafta — Ocak 2027",
  "8. Hafta — Ocak 2027",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// results[teamId][pot].home -> o takımın, o torbadan İÇ SAHADA ağırladığı rakip.
// Her takımın "home" girdilerini (torba başına en fazla 1) toplarsak, 144
// maçın tamamını TEK TEK ve YİNELENMEDEN elde ederiz (her maçın sadece bir
// ev sahibi vardır).
function buildMatchList(results, teams) {
  const teamById = {};
  for (const t of teams) teamById[t.id] = t;

  const matches = [];
  let idx = 0;
  for (const team of teams) {
    const fixtures = results[team.id];
    if (!fixtures) continue;
    for (const pot of [1, 2, 3, 4]) {
      const opponent = fixtures[pot]?.home;
      if (opponent) {
        matches.push({
          id: `m${idx++}`,
          homeTeam: team,
          awayTeam: teamById[opponent.id] || opponent,
          viaPot: pot,
        });
      }
    }
  }
  return matches;
}

// Verilen maç kümesinden, 36 takımın HEPSİNİ tam bir kez kapsayan bir
// "mükemmel eşleşme" (perfect matching, 18 maç) bulmaya çalışır. Adım
// sayısı sınırlıdır (maxSteps) -- kötü bir rastgele sırada tıkanırsa hemen
// pes edip çağırana (dışarıdaki retry döngüsüne) bırakır; asla sonsuz/çok
// uzun sürmez.
function findPerfectMatching(edges, maxSteps = 6000) {
  const byTeam = new Map();
  for (const e of edges) {
    if (!byTeam.has(e.homeTeam.id)) byTeam.set(e.homeTeam.id, []);
    if (!byTeam.has(e.awayTeam.id)) byTeam.set(e.awayTeam.id, []);
    byTeam.get(e.homeTeam.id).push(e);
    byTeam.get(e.awayTeam.id).push(e);
  }

  const teamOrder = shuffle([...byTeam.keys()]);
  const matchedTeam = new Set();
  const usedEdge = new Set();
  const chosen = [];
  let steps = 0;
  const LIMIT = Symbol("limit");

  function otherSide(edge, teamId) {
    return edge.homeTeam.id === teamId ? edge.awayTeam.id : edge.homeTeam.id;
  }

  function backtrack(idx) {
    steps++;
    if (steps > maxSteps) return LIMIT;
    if (idx >= teamOrder.length) return true;
    const teamId = teamOrder[idx];
    if (matchedTeam.has(teamId)) return backtrack(idx + 1);

    const candidates = shuffle(
      (byTeam.get(teamId) || []).filter((e) => {
        if (usedEdge.has(e.id)) return false;
        const other = otherSide(e, teamId);
        return !matchedTeam.has(other);
      })
    );

    for (const edge of candidates) {
      const other = otherSide(edge, teamId);
      usedEdge.add(edge.id);
      matchedTeam.add(teamId);
      matchedTeam.add(other);
      chosen.push(edge);

      const res = backtrack(idx + 1);
      if (res === true) return true;
      if (res === LIMIT) return LIMIT;

      usedEdge.delete(edge.id);
      matchedTeam.delete(teamId);
      matchedTeam.delete(other);
      chosen.pop();
    }
    return false;
  }

  const result = backtrack(0);
  return result === true ? chosen : null;
}

function scheduleAllRounds(allMatches, matchdayCount, maxAttemptsPerRound) {
  let remaining = [...allMatches];
  const matchdays = [];

  for (let round = 0; round < matchdayCount; round++) {
    let matching = null;
    for (let attempt = 0; attempt < maxAttemptsPerRound && !matching; attempt++) {
      matching = findPerfectMatching(remaining);
    }
    if (!matching) return null;

    matchdays.push({ number: round + 1, label: MATCHDAY_LABELS[round], matches: matching });
    const usedIds = new Set(matching.map((m) => m.id));
    remaining = remaining.filter((m) => !usedIds.has(m.id));
  }

  return matchdays;
}

// Tamamlanmış bir kura sonucunu (results) ve o yarışmanın takım listesini
// alıp 8 haftalık fikstürü döner:
// [{ number, label, matches: [{ id, homeTeam, awayTeam, viaPot }, ...18] }, ...8]
export function generateFixture(results, teams, maxTopLevelAttempts = 80, maxAttemptsPerRound = 200) {
  const allMatches = buildMatchList(results, teams);
  if (allMatches.length === 0) return [];

  const matchdayCount = MATCHDAY_LABELS.length;
  for (let top = 0; top < maxTopLevelAttempts; top++) {
    const matchdays = scheduleAllRounds(allMatches, matchdayCount, maxAttemptsPerRound);
    if (matchdays) {
      for (const md of matchdays) {
        md.matches.sort((a, b) => a.homeTeam.name.localeCompare(b.homeTeam.name, "tr"));
      }
      return matchdays;
    }
  }
  throw new Error("Fikstür haftalara bölünemedi, lütfen tekrar deneyin.");
}

export function serializeFixture(matchdays) {
  return matchdays.map((md) => ({
    number: md.number,
    label: md.label,
    matches: md.matches.map((m) => ({
      id: m.id,
      homeId: m.homeTeam.id,
      awayId: m.awayTeam.id,
      viaPot: m.viaPot,
    })),
  }));
}

export function deserializeFixture(raw, teams) {
  const teamById = {};
  for (const t of teams) teamById[t.id] = t;
  return raw.map((md) => ({
    number: md.number,
    label: md.label,
    matches: md.matches
      .map((m) => ({
        id: m.id,
        homeTeam: teamById[m.homeId],
        awayTeam: teamById[m.awayId],
        viaPot: m.viaPot,
      }))
      .filter((m) => m.homeTeam && m.awayTeam),
  }));
}

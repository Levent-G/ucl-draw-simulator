// ============================================================================
// Maç sonucu / puan durumu tahmin motoru
// ============================================================================
// Takımların `coeff` (güç/katsayı) değerinden, Poisson dağılımına dayalı
// gerçekçi bir gol beklentisi (λ) türetiyoruz. Ev sahibi avantajı ayrıca
// ekleniyor. Maç olasılıkları (1/X/2) da AYNI λ değerlerinden hesaplanıyor,
// böylece gösterilen skor ile gösterilen yüzdeler tutarlı kalıyor. Bu,
// gerçek sonuçların bilimsel bir tahmini değil, eğlence amaçlı makul bir
// simülasyondur.
//
// Bu motor YARIŞMADAN BAĞIMSIZDIR: takım listesi, oyuncu listesi ve
// kalifikasyon bölgeleri (zones) parametre olarak verilir -- böylece aynı
// motor UCL, Avrupa Ligi ve Trendyol Süper Lig için (farklı takım
// sayıları/formatları için) çalışır. Kullanıcı ileride gerçek bir veri seti
// verdiğinde de (farklı takım sayısı/coeff'ler) aynen doğru çalışmaya devam
// eder çünkü hiçbir yerde "36" ya da "18" sabit kodlanmamıştır.

const BASE_GOALS_TOTAL = 2.7; // ort. maç başına toplam gol
const HOME_ADVANTAGE_GOALS = 0.32;
const MIN_LAMBDA = 0.2;
const MAX_LAMBDA = 4.4;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function attackStrength(coeff) {
  return Math.max(6, coeff || 6);
}

// coeff farkından ev/deplasman beklenen gol sayısını (λ) türetir.
export function expectedGoals(homeTeam, awayTeam) {
  const hs = attackStrength(homeTeam.coeff);
  const as = attackStrength(awayTeam.coeff);
  const total = hs + as;
  const hShare = hs / total;
  const aShare = as / total;
  const lambdaHome = clamp(
    BASE_GOALS_TOTAL * hShare + HOME_ADVANTAGE_GOALS,
    MIN_LAMBDA,
    MAX_LAMBDA
  );
  const lambdaAway = clamp(
    BASE_GOALS_TOTAL * aShare - HOME_ADVANTAGE_GOALS * 0.5,
    MIN_LAMBDA,
    MAX_LAMBDA
  );
  return { lambdaHome, lambdaAway };
}

function samplePoisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

const factorialCache = [1];
function factorial(n) {
  for (let i = factorialCache.length; i <= n; i++) {
    factorialCache[i] = factorialCache[i - 1] * i;
  }
  return factorialCache[n];
}

function poissonPmf(k, lambda) {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

// λ_home / λ_away çiftinden 1/X/2 olasılıklarını (Poisson toplamıyla) hesaplar.
export function matchProbabilities(lambdaHome, lambdaAway, maxGoals = 8) {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poissonPmf(h, lambdaHome) * poissonPmf(a, lambdaAway);
      if (h > a) home += p;
      else if (h === a) draw += p;
      else away += p;
    }
  }
  const total = home + draw + away || 1;
  return {
    homeWinProb: home / total,
    drawProb: draw / total,
    awayWinProb: away / total,
  };
}

// Tek bir maçın tahmini skorunu ve olasılıklarını üretir.
export function simulateMatch(homeTeam, awayTeam) {
  const { lambdaHome, lambdaAway } = expectedGoals(homeTeam, awayTeam);
  const homeGoals = samplePoisson(lambdaHome);
  const awayGoals = samplePoisson(lambdaAway);
  const probs = matchProbabilities(lambdaHome, lambdaAway);
  return { homeGoals, awayGoals, lambdaHome, lambdaAway, ...probs };
}

const GOAL_WEIGHT = { FW: 5, MF: 2.2, DF: 0.5, GK: 0.05 };
const ASSIST_WEIGHT = { FW: 2, MF: 4, DF: 1, GK: 0.05 };
const CARD_WEIGHT = { DF: 1.4, MF: 1.2, FW: 0.7, GK: 0.3 };

function weightedPick(players, weightFn, excludeId) {
  const pool = excludeId ? players.filter((p) => p.id !== excludeId) : players;
  if (pool.length === 0) return null;
  const weights = pool.map((p) => weightFn(p) * (p.rating / 80));
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return pool[Math.floor(Math.random() * pool.length)];
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function distributeGoals(players, goals, playerStats) {
  if (!players.length || goals <= 0) return;
  for (let i = 0; i < goals; i++) {
    const scorer = weightedPick(players, (p) => GOAL_WEIGHT[p.position] ?? 1);
    if (!scorer) continue;
    playerStats[scorer.id].goals++;
    if (players.length > 1 && Math.random() < 0.72) {
      const assister = weightedPick(
        players,
        (p) => ASSIST_WEIGHT[p.position] ?? 1,
        scorer.id
      );
      if (assister) playerStats[assister.id].assists++;
    }
  }
}

// Takım başına ort. ~1.6 sarı kart + nadiren kırmızı kart üretir, mevkiye
// göre ağırlıklandırır (defans/orta saha > forvet > kaleci).
function distributeCards(players, playerStats) {
  if (!players.length) return;
  const yellowCount = Math.min(3, samplePoisson(1.6));
  for (let i = 0; i < yellowCount; i++) {
    const p = weightedPick(players, (pl) => CARD_WEIGHT[pl.position] ?? 1);
    if (p) playerStats[p.id].yellows++;
  }
  if (Math.random() < 0.05) {
    const p = weightedPick(players, (pl) => CARD_WEIGHT[pl.position] ?? 1);
    if (p) playerStats[p.id].reds++;
  }
}

// --- Kalifikasyon bölgeleri (zones) ---------------------------------------
// Her yarışma formatı kendi bölge şemasını tanımlar; hepsi takım SAYISINA
// göre ORANTILI kurulur (sabit "36" ya da "18" yok) -- böylece kullanıcı
// farklı boyutta bir veri seti verse bile doğru çalışır.
export function buildSwissZones(teamCount) {
  const direct = Math.max(1, Math.round((teamCount * 8) / 36));
  const playoff = Math.max(direct + 1, Math.round((teamCount * 24) / 36));
  return [
    { key: "direct", label: "Doğrudan Son 16", max: direct, tone: "good" },
    { key: "playoff", label: "Play-off Turu", max: Math.min(playoff, teamCount - 1), tone: "neutral" },
    { key: "out", label: "Elenme Bölgesi", max: teamCount, tone: "bad" },
  ];
}

export function buildLeagueZones(teamCount) {
  const relegationCount = teamCount >= 16 ? 3 : Math.max(1, Math.round(teamCount * 0.15));
  const relegationStart = Math.max(1, teamCount - relegationCount + 1);
  const europaMax = Math.min(6, Math.max(2, relegationStart - 2));
  const uclMax = Math.min(4, Math.max(1, europaMax - 1));
  return [
    { key: "champion", label: "Şampiyon", max: 1, tone: "good" },
    { key: "ucl", label: "Şampiyonlar Ligi", max: uclMax, tone: "good" },
    { key: "europa", label: "Avrupa Ligi", max: europaMax, tone: "neutral" },
    { key: "mid", label: "Orta Sıra", max: relegationStart - 1, tone: "neutral" },
    { key: "relegation", label: "Küme Düşme Hattı", max: teamCount, tone: "bad" },
  ];
}

export function resolveZone(zones, rank) {
  for (const z of zones) {
    if (rank <= z.max) return z;
  }
  return zones[zones.length - 1];
}

function emptyStandingsRow(teamId) {
  return { teamId, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
}

function finalizeStandings(standingsMap, zones) {
  const arr = Object.values(standingsMap).map((s) => ({ ...s, gd: s.gf - s.ga }));
  arr.sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.teamId.localeCompare(b.teamId)
  );
  arr.forEach((s, i) => {
    const zone = resolveZone(zones, i + 1);
    s.rank = i + 1;
    s.status = zone.key;
    s.statusLabel = zone.label;
    s.statusTone = zone.tone;
  });
  return arr;
}

// 36 (ya da N) haftalık/maçlık fikstürün TAMAMINI simüle eder: puan durumu,
// maç sonuçları ve oyuncu bazlı gol/asist/kart istatistiği üretir. Her
// çağrıda Poisson örneklemesi yeniden yapıldığı için sonuç her seferinde
// biraz farklı olur ("tahminleri yenile" ile yeni bir simülasyon alınır).
//
// options: { teams, allPlayers, zones }
export function simulateSeason(matchdays, options) {
  const { teams, allPlayers = [], zones } = options;
  const resolvedZones = zones || buildSwissZones(teams.length);

  const standings = {};
  for (const t of teams) standings[t.id] = emptyStandingsRow(t.id);

  const playersByTeam = {};
  for (const p of allPlayers) {
    if (!playersByTeam[p.teamId]) playersByTeam[p.teamId] = [];
    playersByTeam[p.teamId].push(p);
  }

  const playerStats = {};
  for (const p of allPlayers) {
    playerStats[p.id] = { playerId: p.id, goals: 0, assists: 0, yellows: 0, reds: 0 };
  }

  const matchResults = [];

  for (const md of matchdays) {
    for (const m of md.matches) {
      const sim = simulateMatch(m.homeTeam, m.awayTeam);
      const hs = standings[m.homeTeam.id];
      const as_ = standings[m.awayTeam.id];
      if (!hs || !as_) continue;
      hs.played++;
      as_.played++;
      hs.gf += sim.homeGoals;
      hs.ga += sim.awayGoals;
      as_.gf += sim.awayGoals;
      as_.ga += sim.homeGoals;
      if (sim.homeGoals > sim.awayGoals) {
        hs.w++;
        hs.pts += 3;
        as_.l++;
      } else if (sim.homeGoals < sim.awayGoals) {
        as_.w++;
        as_.pts += 3;
        hs.l++;
      } else {
        hs.d++;
        as_.d++;
        hs.pts++;
        as_.pts++;
      }

      const homePlayers = playersByTeam[m.homeTeam.id] || [];
      const awayPlayers = playersByTeam[m.awayTeam.id] || [];
      distributeGoals(homePlayers, sim.homeGoals, playerStats);
      distributeGoals(awayPlayers, sim.awayGoals, playerStats);
      distributeCards(homePlayers, playerStats);
      distributeCards(awayPlayers, playerStats);

      matchResults.push({
        matchdayNumber: md.number,
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        viaPot: m.viaPot,
        homeGoals: sim.homeGoals,
        awayGoals: sim.awayGoals,
        homeWinProb: sim.homeWinProb,
        drawProb: sim.drawProb,
        awayWinProb: sim.awayWinProb,
      });
    }
  }

  return {
    standings: finalizeStandings(standings, resolvedZones),
    playerStats,
    matchResults,
    zones: resolvedZones,
  };
}

// Kullanıcının kendi girdiği skorlardan (matchId -> {home, away}) puan
// durumu hesaplar. Girilmemiş maçlar hesaba katılmaz (henüz oynanmamış sayılır).
export function computeStandingsFromUserScores(matchdays, userScores, options) {
  const { teams, zones } = options;
  const resolvedZones = zones || buildSwissZones(teams.length);

  const standings = {};
  for (const t of teams) standings[t.id] = emptyStandingsRow(t.id);

  for (const md of matchdays) {
    for (const m of md.matches) {
      const entry = userScores[m.id];
      if (!entry || entry.home === "" || entry.away === "") continue;
      const home = Number(entry.home);
      const away = Number(entry.away);
      if (!Number.isFinite(home) || !Number.isFinite(away)) continue;

      const hs = standings[m.homeTeam.id];
      const as_ = standings[m.awayTeam.id];
      if (!hs || !as_) continue;
      hs.played++;
      as_.played++;
      hs.gf += home;
      hs.ga += away;
      as_.gf += away;
      as_.ga += home;
      if (home > away) {
        hs.w++;
        hs.pts += 3;
        as_.l++;
      } else if (home < away) {
        as_.w++;
        as_.pts += 3;
        hs.l++;
      } else {
        hs.d++;
        as_.d++;
        hs.pts++;
        as_.pts++;
      }
    }
  }

  return finalizeStandings(standings, resolvedZones);
}

// Kullanıcının sürükle-bırak ile belirlediği bir sıralama (teamId dizisi)
// için görüntüleme amaçlı bir "standings" satırı üretir (istatistik
// hesaplamadan, sadece sıra/bölge bilgisi için).
export function standingsFromOrder(orderedTeamIds, teams, zones) {
  const resolvedZones = zones || buildSwissZones(teams.length);
  const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
  return orderedTeamIds
    .map((teamId, i) => {
      const team = teamById[teamId];
      if (!team) return null;
      const zone = resolveZone(resolvedZones, i + 1);
      return { teamId, rank: i + 1, status: zone.key, statusLabel: zone.label, statusTone: zone.tone };
    })
    .filter(Boolean);
}

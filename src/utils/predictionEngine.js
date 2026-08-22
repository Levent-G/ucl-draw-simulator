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
//
// GERÇEKÇİLİK KATMANLARI: temel coeff/λ modelinin üstüne, tek bir maçı
// bağımsız bir olaydan çıkarıp "sezon" hissi veren iki katman eklenmiştir:
//   1) FORM MOMENTUMU -- bir takım art arda kazandıkça hafifçe güçlenir
//      (daha çok gol atar/daha az yer), kaybettikçe zayıflar. Beraberlik
//      formu nötre doğru çeker. bkz. applyForm/updateForm.
//   2) DERBİ YOĞUNLUĞU -- klasik rekabetlerde (bkz. derbies.js) maçlar hem
//      biraz daha az gollü (daha gergin/temkinli) hem de kart oranı daha
//      yüksek olur. bkz. DERBY_GOAL_DAMPEN / DERBY_CARD_MULT.
import { findDerby } from "./derbies.js";

const BASE_GOALS_TOTAL = 2.7; // ort. maç başına toplam gol
const HOME_ADVANTAGE_GOALS = 0.32;
const MIN_LAMBDA = 0.2;
const MAX_LAMBDA = 4.4;

// "Gelişmiş Ayarlar" panelinden (bkz. SettingsContext) kullanıcının ince
// ayar yapabildiği model parametreleri. simulateSeason'a options.settings
// olarak verilmezse hepsi bu varsayılanlara düşer -- mevcut tüm çağıranlar
// (settings vermeyenler) davranışını AYNEN korur.
export const DEFAULT_MODEL_SETTINGS = {
  baseGoalsTotal: BASE_GOALS_TOTAL,
  homeAdvantage: HOME_ADVANTAGE_GOALS,
  injuryChance: 0.1,
  cardIntensity: 1,
};

export const MODEL_SETTING_RANGES = {
  baseGoalsTotal: { min: 1.5, max: 4.5, step: 0.1, label: "Gol Ortalaması", unit: "gol/maç" },
  homeAdvantage: { min: 0, max: 0.8, step: 0.02, label: "Ev Sahibi Avantajı", unit: "" },
  injuryChance: { min: 0, max: 0.4, step: 0.01, label: "Sakatlık Sıklığı", unit: "" },
  cardIntensity: { min: 0.3, max: 2.5, step: 0.1, label: "Kart Yoğunluğu", unit: "x" },
};

export const MODEL_PRESETS = {
  gercekci: { key: "gercekci", label: "Gerçekçi", icon: "⚖️", settings: { ...DEFAULT_MODEL_SETTINGS } },
  gol_soleni: {
    key: "gol_soleni",
    label: "Gol Şöleni",
    icon: "🎉",
    settings: { ...DEFAULT_MODEL_SETTINGS, baseGoalsTotal: 3.6 },
  },
  defansif_kilit: {
    key: "defansif_kilit",
    label: "Defansif Kilit",
    icon: "🔒",
    settings: { ...DEFAULT_MODEL_SETTINGS, baseGoalsTotal: 1.9 },
  },
  kaotik: {
    key: "kaotik",
    label: "Kaotik Sezon",
    icon: "🌪️",
    settings: { ...DEFAULT_MODEL_SETTINGS, injuryChance: 0.25, cardIntensity: 1.8 },
  },
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function attackStrength(coeff) {
  return Math.max(6, coeff || 6);
}

// "Antrenör Modu": kullanıcının bir takıma atadığı oyun tarzı, o takımın
// hücum/defans λ (beklenen gol) çarpanlarını değiştirir. Hücumcu tarz kendi
// golünü artırır ama rakibe karşı savunmasını zayıflatır (ve tam tersi) --
// gerçekçi bir risk/ödül dengesi. Atanmamış takımlar "dengeli" (nötr) kabul
// edilir.
export const TACTICS = {
  balanced: { key: "balanced", label: "Dengeli", icon: "⚖️", attackMult: 1, defenseMult: 1 },
  attack: { key: "attack", label: "Hücum Ağırlıklı", icon: "⚔️", attackMult: 1.18, defenseMult: 1.12 },
  defensive: { key: "defensive", label: "Defansif", icon: "🛡️", attackMult: 0.85, defenseMult: 0.78 },
};

function resolveTactic(teamId, tacticsById) {
  const key = tacticsById?.[teamId];
  return TACTICS[key] || TACTICS.balanced;
}

// coeff farkından ev/deplasman beklenen gol sayısını (λ) türetir. tacticsById
// verilirse (ör. { teamId: "attack" }) ilgili takımların λ'sı buna göre
// ayarlanır. settings verilmezse DEFAULT_MODEL_SETTINGS kullanılır.
export function expectedGoals(homeTeam, awayTeam, tacticsById, settings) {
  const baseGoalsTotal = settings?.baseGoalsTotal ?? BASE_GOALS_TOTAL;
  const homeAdvantage = settings?.homeAdvantage ?? HOME_ADVANTAGE_GOALS;
  const hs = attackStrength(homeTeam.coeff);
  const as = attackStrength(awayTeam.coeff);
  const total = hs + as;
  const hShare = hs / total;
  const aShare = as / total;
  let lambdaHome = clamp(
    baseGoalsTotal * hShare + homeAdvantage,
    MIN_LAMBDA,
    MAX_LAMBDA
  );
  let lambdaAway = clamp(
    baseGoalsTotal * aShare - homeAdvantage * 0.5,
    MIN_LAMBDA,
    MAX_LAMBDA
  );

  const homeTactic = resolveTactic(homeTeam.id, tacticsById);
  const awayTactic = resolveTactic(awayTeam.id, tacticsById);
  lambdaHome = clamp(lambdaHome * homeTactic.attackMult * awayTactic.defenseMult, MIN_LAMBDA, MAX_LAMBDA);
  lambdaAway = clamp(lambdaAway * awayTactic.attackMult * homeTactic.defenseMult, MIN_LAMBDA, MAX_LAMBDA);

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

const DERBY_GOAL_DAMPEN = 0.9; // derbiler biraz daha temkinli/az gollü oynanır
export const DERBY_CARD_MULT = 1.55; // derbilerde kart oranı belirgin şekilde artar

// Tek bir maçın tahmini skorunu ve olasılıklarını üretir. isDerby verilirse
// (bkz. derbies.js) skor beklentisi hafifçe aşağı çekilir (gerilim/temkin).
export function simulateMatch(homeTeam, awayTeam, tacticsById, isDerby, settings) {
  let { lambdaHome, lambdaAway } = expectedGoals(homeTeam, awayTeam, tacticsById, settings);
  if (isDerby) {
    lambdaHome *= DERBY_GOAL_DAMPEN;
    lambdaAway *= DERBY_GOAL_DAMPEN;
  }
  const homeGoals = samplePoisson(lambdaHome);
  const awayGoals = samplePoisson(lambdaAway);
  const probs = matchProbabilities(lambdaHome, lambdaAway);
  return { homeGoals, awayGoals, lambdaHome, lambdaAway, ...probs };
}

// --- Form momentumu --------------------------------------------------------
const FORM_STEP = 0.05; // form birimi başına ~%5 etkili coeff değişimi
const FORM_MAX = 3; // en fazla ±3 birim (yani ±%15 coeff)

function updateForm(formById, teamId, result) {
  const cur = formById[teamId] || 0;
  if (result === "win") formById[teamId] = Math.min(FORM_MAX, cur + 1);
  else if (result === "loss") formById[teamId] = Math.max(-FORM_MAX, cur - 1);
  else formById[teamId] = cur > 0 ? cur - 0.5 : cur < 0 ? cur + 0.5 : 0;
}

// Takımın güncel formunu coeff'e geçici bir çarpan olarak uygular -- gerçek
// `coeff` verisini DEĞİŞTİRMEZ, sadece o maç için türetilmiş bir kopya döner.
function applyForm(team, formById) {
  const form = formById[team.id] || 0;
  if (!form) return team;
  return { ...team, coeff: Math.max(1, (team.coeff || 6) * (1 + form * FORM_STEP)) };
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

// Gol dağıtımını yapar VE hangi oyuncunun attığı/asist yaptığı bilgisini
// (matchResults'taki dakika dakika olay akışı -- "Maç Merkezi" -- için)
// döner, böylece sezon toplamları (playerStats) ile tek maçlık olay akışı
// HER ZAMAN tutarlı kalır (aynı seçim, iki yerde de kullanılır).
function distributeGoals(players, goals, playerStats) {
  const events = [];
  if (!players.length || goals <= 0) return events;
  for (let i = 0; i < goals; i++) {
    const scorer = weightedPick(players, (p) => GOAL_WEIGHT[p.position] ?? 1);
    if (!scorer) continue;
    playerStats[scorer.id].goals++;
    let assisterId = null;
    if (players.length > 1 && Math.random() < 0.72) {
      const assister = weightedPick(
        players,
        (p) => ASSIST_WEIGHT[p.position] ?? 1,
        scorer.id
      );
      if (assister) {
        playerStats[assister.id].assists++;
        assisterId = assister.id;
      }
    }
    events.push({ scorerId: scorer.id, assisterId });
  }
  return events;
}

// Takım başına ort. ~1.6 sarı kart + nadiren kırmızı kart üretir, mevkiye
// göre ağırlıklandırır (defans/orta saha > forvet > kaleci). intensityMult
// derbi maçlarında (bkz. DERBY_CARD_MULT) kart oranını artırmak için kullanılır.
function distributeCards(players, playerStats, intensityMult = 1) {
  const events = [];
  if (!players.length) return events;
  const yellowCount = Math.min(4, samplePoisson(1.6 * intensityMult));
  for (let i = 0; i < yellowCount; i++) {
    const p = weightedPick(players, (pl) => CARD_WEIGHT[pl.position] ?? 1);
    if (p) {
      playerStats[p.id].yellows++;
      events.push({ playerId: p.id, type: "yellow" });
    }
  }
  if (Math.random() < 0.05 * intensityMult) {
    const p = weightedPick(players, (pl) => CARD_WEIGHT[pl.position] ?? 1);
    if (p) {
      playerStats[p.id].reds++;
      events.push({ playerId: p.id, type: "red" });
    }
  }
  return events;
}

function randomMinute() {
  return Math.min(90, Math.floor(Math.random() * 90) + 1);
}

// --- Sakatlık / cezalı oyuncular ---------------------------------------
// Kırmızı kart gören bir oyuncu bir sonraki haftayı otomatik olarak
// cezalı geçirir; ayrıca her maçta küçük bir olasılıkla oynayan
// oyunculardan biri rastgele 1-3 hafta sürecek bir sakatlık yaşar. Bu
// oyuncular kadro dışı kaldıkları haftalarda gol/asist/kart dağıtımına
// (ve dolayısıyla "Maç Merkezi" olay akışına) hiç girmez -- tamamen
// kurgusal bir gerçekçilik katmanıdır, gerçek sakatlık verisi değildir.
const INJURY_CHANCE_PER_MATCH = 0.1;
const INJURY_MIN_MATCHDAYS = 1;
const INJURY_MAX_MATCHDAYS = 3;

function markUnavailable(untilMap, reasonMap, playerId, untilMatchday, reason) {
  const cur = untilMap[playerId] || 0;
  if (untilMatchday > cur) {
    untilMap[playerId] = untilMatchday;
    reasonMap[playerId] = reason;
  }
}

// Bir takımın tam kadrosunu, o haftada kadro dışı kalanları çıkararak
// döner. Havuz tamamen boşalırsa (aşırı uç durum) güvenlik amacıyla tam
// kadroya geri düşer -- maç motorunun oyuncu bulamayıp çökmesini önler.
function splitAvailability(players, unavailableUntil, matchdayNumber) {
  const sidelined = players.filter((p) => (unavailableUntil[p.id] || 0) >= matchdayNumber);
  const available = sidelined.length < players.length ? players.filter((p) => !sidelined.includes(p)) : players;
  return { available, sidelined };
}

// Süs amaçlı bir oyuncu değişikliği (istatistiklere etki etmez -- sadece
// "Maç Merkezi" akışını daha gerçekçi hissettirir).
function pickSubPair(players, excludeIds) {
  const pool = players.filter((p) => !excludeIds.has(p.id));
  if (pool.length < 2) return null;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return { outPlayer: shuffled[0], inPlayer: shuffled[1] };
}

// Tek bir maçın gol/kart/değişiklik olaylarını dakikalara yayıp kronolojik
// sıraya dizer -- "Maç Merkezi" sayfasındaki dakika dakika akış budur.
function buildMatchTimeline({
  homeTeam,
  awayTeam,
  homeGoalEvents,
  awayGoalEvents,
  homeCardEvents,
  awayCardEvents,
  homePlayers,
  awayPlayers,
}) {
  const events = [];
  const findPlayer = (players, id) => players.find((p) => p.id === id) || null;

  for (const g of homeGoalEvents) {
    events.push({
      minute: randomMinute(),
      type: "goal",
      teamId: homeTeam.id,
      player: findPlayer(homePlayers, g.scorerId),
      assist: g.assisterId ? findPlayer(homePlayers, g.assisterId) : null,
    });
  }
  for (const g of awayGoalEvents) {
    events.push({
      minute: randomMinute(),
      type: "goal",
      teamId: awayTeam.id,
      player: findPlayer(awayPlayers, g.scorerId),
      assist: g.assisterId ? findPlayer(awayPlayers, g.assisterId) : null,
    });
  }

  const redPlayerIds = new Set();
  for (const c of homeCardEvents) {
    events.push({ minute: randomMinute(), type: c.type, teamId: homeTeam.id, player: findPlayer(homePlayers, c.playerId) });
    if (c.type === "red") redPlayerIds.add(c.playerId);
  }
  for (const c of awayCardEvents) {
    events.push({ minute: randomMinute(), type: c.type, teamId: awayTeam.id, player: findPlayer(awayPlayers, c.playerId) });
    if (c.type === "red") redPlayerIds.add(c.playerId);
  }

  const homeSub = pickSubPair(homePlayers, redPlayerIds);
  if (homeSub) {
    events.push({
      minute: 55 + Math.floor(Math.random() * 30),
      type: "sub",
      teamId: homeTeam.id,
      outPlayer: homeSub.outPlayer,
      inPlayer: homeSub.inPlayer,
    });
  }
  const awaySub = pickSubPair(awayPlayers, redPlayerIds);
  if (awaySub) {
    events.push({
      minute: 55 + Math.floor(Math.random() * 30),
      type: "sub",
      teamId: awayTeam.id,
      outPlayer: awaySub.outPlayer,
      inPlayer: awaySub.inPlayer,
    });
  }

  events.sort((a, b) => a.minute - b.minute);
  return events;
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
// options: { teams, allPlayers, zones, tacticsById, initialStandings, settings }
// initialStandings (opsiyonel): { [teamId]: {played,w,d,l,gf,ga,pts} } -- ör.
// Süper Lig'de gerçek dünyada zaten oynanmış haftaların puan durumundan
// devam ederek SADECE kalan maçları simüle etmek için kullanılır (bkz.
// buildSuperLigContinuation). Verilmezse her takım 0'dan başlar.
// settings (opsiyonel): DEFAULT_MODEL_SETTINGS şeklinde, "Gelişmiş Ayarlar"
// panelinden (bkz. SettingsContext) gelen model ince ayarları. Verilmezse
// varsayılan (gerçekçi) değerler kullanılır.
export function simulateSeason(matchdays, options) {
  const { teams, allPlayers = [], zones, tacticsById, initialStandings, settings } = options;
  const resolvedZones = zones || buildSwissZones(teams.length);
  const injuryChance = settings?.injuryChance ?? INJURY_CHANCE_PER_MATCH;
  const cardIntensityBase = settings?.cardIntensity ?? 1;

  const standings = {};
  for (const t of teams) {
    standings[t.id] = { ...emptyStandingsRow(t.id), ...(initialStandings?.[t.id] || {}) };
  }

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
  const formById = {}; // sezon boyunca birikimli form momentumu (bkz. dosya başı notu)
  const unavailableUntil = {}; // sezon boyunca birikimli sakatlık/ceza takibi
  const unavailableReason = {};

  for (const md of matchdays) {
    for (const m of md.matches) {
      const homeWithForm = applyForm(m.homeTeam, formById);
      const awayWithForm = applyForm(m.awayTeam, formById);
      const isDerby = Boolean(findDerby(m.homeTeam.short, m.awayTeam.short));
      const sim = simulateMatch(homeWithForm, awayWithForm, tacticsById, isDerby, settings);
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
        updateForm(formById, m.homeTeam.id, "win");
        updateForm(formById, m.awayTeam.id, "loss");
      } else if (sim.homeGoals < sim.awayGoals) {
        as_.w++;
        as_.pts += 3;
        hs.l++;
        updateForm(formById, m.homeTeam.id, "loss");
        updateForm(formById, m.awayTeam.id, "win");
      } else {
        hs.d++;
        as_.d++;
        hs.pts++;
        as_.pts++;
        updateForm(formById, m.homeTeam.id, "draw");
        updateForm(formById, m.awayTeam.id, "draw");
      }

      const homePlayersFull = playersByTeam[m.homeTeam.id] || [];
      const awayPlayersFull = playersByTeam[m.awayTeam.id] || [];
      const { available: homePlayers, sidelined: homeSidelined } = splitAvailability(
        homePlayersFull,
        unavailableUntil,
        md.number
      );
      const { available: awayPlayers, sidelined: awaySidelined } = splitAvailability(
        awayPlayersFull,
        unavailableUntil,
        md.number
      );

      const cardIntensity = (isDerby ? DERBY_CARD_MULT : 1) * cardIntensityBase;
      const homeGoalEvents = distributeGoals(homePlayers, sim.homeGoals, playerStats);
      const awayGoalEvents = distributeGoals(awayPlayers, sim.awayGoals, playerStats);
      const homeCardEvents = distributeCards(homePlayers, playerStats, cardIntensity);
      const awayCardEvents = distributeCards(awayPlayers, playerStats, cardIntensity);
      const events = buildMatchTimeline({
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoalEvents,
        awayGoalEvents,
        homeCardEvents,
        awayCardEvents,
        homePlayers,
        awayPlayers,
      });

      // Kırmızı kart -> bir sonraki hafta cezalı.
      for (const c of [...homeCardEvents, ...awayCardEvents]) {
        if (c.type === "red") {
          markUnavailable(unavailableUntil, unavailableReason, c.playerId, md.number + 1, "kırmızı kart cezası");
        }
      }
      // Küçük bir olasılıkla, bu maçta oynayan bir oyuncu sakatlanır (bir
      // sonraki 1-3 hafta kadro dışı kalır) -- bu maçın kendisini etkilemez.
      if (Math.random() < injuryChance) {
        const candidates = [...homePlayers, ...awayPlayers];
        if (candidates.length > 0) {
          const injured = candidates[Math.floor(Math.random() * candidates.length)];
          const duration =
            INJURY_MIN_MATCHDAYS + Math.floor(Math.random() * (INJURY_MAX_MATCHDAYS - INJURY_MIN_MATCHDAYS + 1));
          markUnavailable(unavailableUntil, unavailableReason, injured.id, md.number + duration, "sakatlık");
        }
      }

      const sidelined = [...homeSidelined, ...awaySidelined].map((p) => ({
        playerId: p.id,
        name: p.name,
        teamId: p.teamId,
        reason: unavailableReason[p.id] || "sakatlık",
      }));

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
        isDerby,
        events,
        sidelined,
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
// initialStandings (opsiyonel): simulateSeason'daki gibi, gerçek dünyada
// zaten oynanmış haftalardan devam etmek için kullanılır (bkz. Süper Lig
// Canlı Skorlar entegrasyonu).
export function computeStandingsFromUserScores(matchdays, userScores, options) {
  const { teams, zones, initialStandings } = options;
  const resolvedZones = zones || buildSwissZones(teams.length);

  const standings = {};
  for (const t of teams) {
    standings[t.id] = { ...emptyStandingsRow(t.id), ...(initialStandings?.[t.id] || {}) };
  }

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

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
// bağımsız bir olaydan çıkarıp "sezon" hissi veren katmanlar eklenmiştir:
//   1) FORM MOMENTUMU (Elo tarzı sürpriz güncellemesi) -- her maç sonrası,
//      takımın coeff'inden beklenen sonuç (eloExpectedScore) ile gerçek
//      sonuç (galibiyet=1, beraberlik=0.5, mağlubiyet=0) karşılaştırılır;
//      fark ne kadar büyükse (yani sonuç ne kadar "sürpriz"se) coeff'e o
//      kadar büyük bir sezon-içi kayma (formById) eklenir. Zayıf bir takımın
//      güçlü bir rakibi yenmesi, güçlü bir takımın zayıf bir rakibi yenmesinden
//      çok daha fazla etki yaratır -- klasik Elo derecelendirme mantığı.
//      bkz. applyForm/updateForm/eloExpectedScore.
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
  redCardChance: 0.035,
};

export const MODEL_SETTING_RANGES = {
  baseGoalsTotal: { min: 1.5, max: 4.5, step: 0.1, label: "Gol Ortalaması", unit: "gol/maç" },
  homeAdvantage: { min: 0, max: 0.8, step: 0.02, label: "Ev Sahibi Avantajı", unit: "" },
  injuryChance: { min: 0, max: 0.4, step: 0.01, label: "Sakatlık Sıklığı", unit: "" },
  cardIntensity: { min: 0.3, max: 2.5, step: 0.1, label: "Kart Yoğunluğu", unit: "x" },
  redCardChance: { min: 0, max: 0.15, step: 0.005, label: "Kırmızı Kart Sıklığı", unit: "(takım/maç)" },
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
    settings: { ...DEFAULT_MODEL_SETTINGS, injuryChance: 0.25, cardIntensity: 1.8, redCardChance: 0.08 },
  },
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Takım gücü farkının gol paylaşımına yansıması İSTATİSTİKSEL OLARAK
// KESKİN (lojistik/Elo tarzı) olmalı -- iki takımın ham coeff'lerinin
// DOĞRUSAL payını almak (eski yöntem: hs/(hs+as)) büyük katsayı farklarını
// yeterince ayırt edemiyordu: ör. bir elit kulüp (coeff ~125) bir play-off
// ekibine (coeff ~46) deplasmanda giderken doğrusal pay ona sadece ~%73'lük
// bir gol payı veriyordu -- gerçek hayatta bu neredeyse kesin bir favorilik
// ilişkisidir, yaklaşık bir yarı yarıya maç değil. Bunun yerine
// eloExpectedScore ile AYNI lojistik eğriyi (ama kendi bağımsız bölenini)
// kullanıyoruz: fark ne kadar büyükse pay o kadar keskin kayar, fark küçükse
// (aynı torbadaki iki takım gibi) ev sahibi avantajı dışında neredeyse
// yarı yarıya kalır.
const STRENGTH_SHARE_DIVISOR = 150;

function strengthShare(ownCoeff, oppCoeff) {
  const own = Math.max(1, ownCoeff || 6);
  const opp = Math.max(1, oppCoeff || 6);
  return 1 / (1 + Math.pow(10, (opp - own) / STRENGTH_SHARE_DIVISOR));
}

// --- Hücum / Defans profili -------------------------------------------
// Eskiden bir takımın TEK bir `coeff` sayısı hem hücumunu hem defansını
// belirliyordu -- aynı coeff'e sahip iki takım, kadroları çok farklı
// olsa bile (ör. biri golcü bombardımanlı, diğeri kilit savunmalı) AYNI
// şekilde davranıyordu. Bu, kadrodaki gerçek FW/MF/DF/GK reytinglerinden
// (zaten elimizde olan veri, yeni bir kaynak gerekmez) takıma özgü bir
// hücum/defans "profili" türetir -- coeff'i DEĞİŞTİRMEZ, sadece expectedGoals
// içinde ince bir çarpan olarak uygulanır. 1.0 = takımın kendi ortalamasına
// göre normal; >1 o yönde nispeten güçlü, <1 nispeten zayıf. Örnekleme
// gürültüsünün (ör. tek bir kaleci reytingi) modeli çok fazla sarsmaması
// için dar bir aralıkta (±%18) sınırlanır.
const ATTACK_DEFENSE_CLAMP = 0.18;

export function deriveAttackDefenseRatio(players) {
  if (!players || players.length === 0) return { attackRatio: 1, defenseRatio: 1 };
  const byPos = { FW: [], MF: [], DF: [], GK: [] };
  for (const p of players) {
    if (byPos[p.position]) byPos[p.position].push(p.rating || 70);
  }
  const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);
  const attackAvg = avg(byPos.FW);
  const midAvg = avg(byPos.MF);
  const defAvg = avg(byPos.DF);
  const gkAvg = avg(byPos.GK);
  const overallAvg = avg([...byPos.FW, ...byPos.MF, ...byPos.DF, ...byPos.GK]);
  if (!overallAvg) return { attackRatio: 1, defenseRatio: 1 };

  const attackScore = (attackAvg ?? overallAvg) * 0.7 + (midAvg ?? overallAvg) * 0.3;
  const defenseScore = (defAvg ?? overallAvg) * 0.75 + (gkAvg ?? overallAvg) * 0.25;

  return {
    attackRatio: clamp(attackScore / overallAvg, 1 - ATTACK_DEFENSE_CLAMP, 1 + ATTACK_DEFENSE_CLAMP),
    defenseRatio: clamp(defenseScore / overallAvg, 1 - ATTACK_DEFENSE_CLAMP, 1 + ATTACK_DEFENSE_CLAMP),
  };
}

// teams: o yarışmanın takım listesi. allPlayers: aynı yarışmanın TÜM
// oyuncuları (teamId ile eşleşir). Her takım için bir kez hesaplanıp
// simulateSeason/generateKnockoutBracket çağrılarına { ...team, attackRatio,
// defenseRatio } şeklinde ENRİCH edilmiş takım nesneleri üretmek için
// kullanılır -- motorun kendisi (expectedGoals) bu alanlar yoksa (ör. eski
// bir çağıran) sessizce 1'e (etkisiz) düşer, yani GERİYE DÖNÜK UYUMLUDUR.
export function buildAttackDefenseMap(teams, allPlayers) {
  const playersByTeam = {};
  for (const p of allPlayers || []) {
    if (!playersByTeam[p.teamId]) playersByTeam[p.teamId] = [];
    playersByTeam[p.teamId].push(p);
  }
  const map = {};
  for (const t of teams) {
    map[t.id] = deriveAttackDefenseRatio(playersByTeam[t.id] || []);
  }
  return map;
}

export function enrichTeamsWithAttackDefense(teams, allPlayers) {
  const map = buildAttackDefenseMap(teams, allPlayers);
  return teams.map((t) => ({ ...t, ...map[t.id] }));
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
  const hShare = strengthShare(homeTeam.coeff, awayTeam.coeff);
  const aShare = 1 - hShare;
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

  // Kadro bazlı hücum/defans profili (bkz. deriveAttackDefenseRatio) --
  // takımlar enrichTeamsWithAttackDefense ile işaretlenmediyse (attackRatio/
  // defenseRatio alanları yoksa) ?? 1 ile devre dışı kalır, davranış AYNEN
  // eskisi gibi korunur.
  const homeAttackRatio = homeTeam.attackRatio ?? 1;
  const awayDefenseRatio = awayTeam.defenseRatio ?? 1;
  const awayAttackRatio = awayTeam.attackRatio ?? 1;
  const homeDefenseRatio = homeTeam.defenseRatio ?? 1;
  lambdaHome = clamp((lambdaHome * homeAttackRatio) / awayDefenseRatio, MIN_LAMBDA, MAX_LAMBDA);
  lambdaAway = clamp((lambdaAway * awayAttackRatio) / homeDefenseRatio, MIN_LAMBDA, MAX_LAMBDA);

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
const RED_CARD_CHANCE_PER_TEAM = 0.035; // takım başına maç başına varsayılan kırmızı kart ihtimali
const RED_CARD_ATTACK_PENALTY = 0.72; // 10 kişi kalan takımın kalan süredeki hücum gücü çarpanı
const RED_CARD_LEAK_MULT = 1.22; // rakibin sayısal üstünlük sonrası hücum gücü artışı
const RED_CARD_MIN_MINUTE = 5;
const RED_CARD_MAX_MINUTE = 85;

// Tek bir maçın tahmini skorunu ve olasılıklarını üretir. isDerby verilirse
// (bkz. derbies.js) skor beklentisi hafifçe aşağı çekilir (gerilim/temkin).
//
// KIRMIZI KART SKORU ETKİLER: eskiden kırmızı kart, skor zaten Poisson ile
// belirlendikten SONRA bağımsız olarak atanıyordu -- 10 kişi kalmanın golle
// hiçbir ilgisi yoktu. Şimdi maç başında küçük bir olasılıkla bir tarafın
// kırmızı kart göreceği ÖNCEDEN belirlenir; kart varsa maç, kartın geldiği
// dakikaya kadar normal λ ile, ondan SONRASI ise (kartlı taraf zayıflamış,
// rakip güçlenmiş) ayarlanmış λ ile İKİ AYRI Poisson örneklemesiyle simüle
// edilip toplanır.
export function simulateMatch(homeTeam, awayTeam, tacticsById, isDerby, settings) {
  let { lambdaHome, lambdaAway } = expectedGoals(homeTeam, awayTeam, tacticsById, settings);
  if (isDerby) {
    lambdaHome *= DERBY_GOAL_DAMPEN;
    lambdaAway *= DERBY_GOAL_DAMPEN;
  }

  const cardIntensity = (isDerby ? DERBY_CARD_MULT : 1) * (settings?.cardIntensity ?? 1);
  const redCardChance = (settings?.redCardChance ?? RED_CARD_CHANCE_PER_TEAM) * cardIntensity;
  let redCardSide = null;
  if (Math.random() < redCardChance) redCardSide = "home";
  else if (Math.random() < redCardChance) redCardSide = "away";

  let homeGoals;
  let awayGoals;
  let homeGoalsBeforeRed = null;
  let homeGoalsAfterRed = null;
  let awayGoalsBeforeRed = null;
  let awayGoalsAfterRed = null;
  let redCard = null;

  if (!redCardSide) {
    homeGoals = samplePoisson(lambdaHome);
    awayGoals = samplePoisson(lambdaAway);
  } else {
    const minute = RED_CARD_MIN_MINUTE + Math.floor(Math.random() * (RED_CARD_MAX_MINUTE - RED_CARD_MIN_MINUTE));
    const beforeFraction = minute / 90;
    const afterFraction = 1 - beforeFraction;

    let lambdaHomeAfter = lambdaHome;
    let lambdaAwayAfter = lambdaAway;
    if (redCardSide === "home") {
      lambdaHomeAfter = clamp(lambdaHome * RED_CARD_ATTACK_PENALTY, MIN_LAMBDA, MAX_LAMBDA);
      lambdaAwayAfter = clamp(lambdaAway * RED_CARD_LEAK_MULT, MIN_LAMBDA, MAX_LAMBDA);
    } else {
      lambdaAwayAfter = clamp(lambdaAway * RED_CARD_ATTACK_PENALTY, MIN_LAMBDA, MAX_LAMBDA);
      lambdaHomeAfter = clamp(lambdaHome * RED_CARD_LEAK_MULT, MIN_LAMBDA, MAX_LAMBDA);
    }

    homeGoalsBeforeRed = samplePoisson(lambdaHome * beforeFraction);
    awayGoalsBeforeRed = samplePoisson(lambdaAway * beforeFraction);
    homeGoalsAfterRed = samplePoisson(lambdaHomeAfter * afterFraction);
    awayGoalsAfterRed = samplePoisson(lambdaAwayAfter * afterFraction);
    homeGoals = homeGoalsBeforeRed + homeGoalsAfterRed;
    awayGoals = awayGoalsBeforeRed + awayGoalsAfterRed;
    redCard = { side: redCardSide, minute };
  }

  // Maç öncesi (kartsız) beklentiye göre gösterilir -- 1/X/2 tahmini
  // kickoff öncesi bir olasılıktır, maç içi bir olayla (kırmızı kart)
  // GERİYE DÖNÜK güncellenmez.
  const probs = matchProbabilities(lambdaHome, lambdaAway);
  return {
    homeGoals,
    awayGoals,
    lambdaHome,
    lambdaAway,
    ...probs,
    redCard,
    homeGoalsBeforeRed: homeGoalsBeforeRed ?? homeGoals,
    homeGoalsAfterRed: homeGoalsAfterRed ?? 0,
    awayGoalsBeforeRed: awayGoalsBeforeRed ?? awayGoals,
    awayGoalsAfterRed: awayGoalsAfterRed ?? 0,
  };
}

// --- Form momentumu (Elo tarzı sürpriz güncellemesi) -----------------------
// Standart Elo "beklenen skor" formülü: iki takımın coeff farkı ne kadar
// büyükse, favorinin kazanma "beklentisi" o kadar 1'e yakın olur.
// ELO_DIVISOR, coeff ölçeğini (bu projede kabaca 1-140 aralığı) olasılığa
// çevirirken kullanılan bölen -- ör. 100 coeff'lik bir fark ~%91 beklenen
// skora denk gelir.
const ELO_DIVISOR = 100;
// Bir maçın "sürpriz" büyüklüğü (gerçek - beklenen skor) başına coeff
// puanı cinsinden ne kadar kayma uygulanacağını belirler.
const ELO_K = 5;
// Bir sezon içinde formById'de birikebilecek maksimum kayma (±coeff puanı) --
// güvenlik sınırı; pratikte Elo'nun kendi kendini dengeleyen doğası (takım
// güçlendikçe beklenen skoru da yükselir, dolayısıyla ileri sürprizler
// küçülür) sayesinde bu sınıra nadiren dayanılır.
const ELO_MAX_DRIFT = 20;

export function eloExpectedScore(ownCoeff, oppCoeff) {
  return 1 / (1 + Math.pow(10, (Math.max(1, oppCoeff) - Math.max(1, ownCoeff)) / ELO_DIVISOR));
}

// actualScore: galibiyet=1, beraberlik=0.5, mağlubiyet=0. ownCoeff/oppCoeff
// takımların SEZON BAŞI (form uygulanmamış) coeff'leridir -- "beklenti" her
// zaman takımın gerçek gücüne göre ölçülür, o ana kadar birikmiş kaymaya göre
// değil, böylece kayma saf biçimde "coeff'in öngördüğünden ne kadar
// iyi/kötü performans gösterildiği"ni yansıtır.
export function updateForm(formById, teamId, ownCoeff, oppCoeff, actualScore) {
  const expected = eloExpectedScore(ownCoeff, oppCoeff);
  const cur = formById[teamId] || 0;
  formById[teamId] = clamp(cur + ELO_K * (actualScore - expected), -ELO_MAX_DRIFT, ELO_MAX_DRIFT);
}

// Takımın güncel (Elo tarzı) formunu coeff'e geçici bir ek olarak uygular --
// gerçek `coeff` verisini DEĞİŞTİRMEZ, sadece o maç için türetilmiş bir kopya
// döner.
function applyForm(team, formById) {
  const form = formById[team.id] || 0;
  if (!form) return team;
  return { ...team, coeff: Math.max(1, (team.coeff || 6) + form) };
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

// Takım başına ort. ~1.6 sarı kart üretir, mevkiye göre ağırlıklandırır
// (defans/orta saha > forvet > kaleci). intensityMult derbi maçlarında
// (bkz. DERBY_CARD_MULT) kart oranını artırmak için kullanılır. Kırmızı
// kart burada ÜRETİLMEZ -- artık skoru da etkileyebildiği için maç başında
// simulateMatch içinde nedensel olarak belirlenir (bkz. redCard alanı).
function distributeYellowCards(players, playerStats, intensityMult = 1) {
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
  return events;
}

// simulateMatch'in ÖNCEDEN belirlediği (skoru etkileyen) kırmızı kartı
// hangi oyuncunun gördüğünü seçer -- CARD_WEIGHT ile aynı mevki ağırlığını
// kullanır, böylece "kim kart görür" dağılımı sarı kartlarla tutarlı kalır.
function pickRedCardPlayer(players, playerStats) {
  const p = weightedPick(players, (pl) => CARD_WEIGHT[pl.position] ?? 1);
  if (p) playerStats[p.id].reds++;
  return p;
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

function randomMinuteInRange(min, max) {
  const lo = Math.max(1, Math.floor(min));
  const hi = Math.max(lo, Math.floor(max));
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

// Tek bir maçın gol/kart/değişiklik olaylarını dakikalara yayıp kronolojik
// sıraya dizer -- "Maç Merkezi" sayfasındaki dakika dakika akış budur.
// redCardEvent verilirse (nedensel kırmızı kart, bkz. simulateMatch), "before"
// fazındaki goller kartın ÖNCESİNE, "after" fazındakiler SONRASINA denk
// gelecek şekilde dakikalandırılır -- akış, skorun neden öyle çıktığıyla
// tutarlı kalır (ör. 2-0 önde giden bir takım kırmızı görüp 2-2 olduysa,
// beraberlik golleri gerçekten kart SONRASINDA gösterilir).
function buildMatchTimeline({
  homeTeam,
  awayTeam,
  homeGoalEvents,
  awayGoalEvents,
  homeCardEvents,
  awayCardEvents,
  homePlayers,
  awayPlayers,
  redCardEvent,
}) {
  const events = [];
  const findPlayer = (players, id) => players.find((p) => p.id === id) || null;

  const minuteForGoal = (phase) => {
    if (!redCardEvent) return randomMinute();
    return phase === "after"
      ? randomMinuteInRange(redCardEvent.minute, 90)
      : randomMinuteInRange(1, redCardEvent.minute - 1);
  };

  for (const g of homeGoalEvents) {
    events.push({
      minute: minuteForGoal(g.phase),
      type: "goal",
      teamId: homeTeam.id,
      player: findPlayer(homePlayers, g.scorerId),
      assist: g.assisterId ? findPlayer(homePlayers, g.assisterId) : null,
    });
  }
  for (const g of awayGoalEvents) {
    events.push({
      minute: minuteForGoal(g.phase),
      type: "goal",
      teamId: awayTeam.id,
      player: findPlayer(awayPlayers, g.scorerId),
      assist: g.assisterId ? findPlayer(awayPlayers, g.assisterId) : null,
    });
  }

  const redPlayerIds = new Set();
  for (const c of homeCardEvents) {
    events.push({ minute: randomMinute(), type: c.type, teamId: homeTeam.id, player: findPlayer(homePlayers, c.playerId) });
  }
  for (const c of awayCardEvents) {
    events.push({ minute: randomMinute(), type: c.type, teamId: awayTeam.id, player: findPlayer(awayPlayers, c.playerId) });
  }
  if (redCardEvent) {
    const isHome = redCardEvent.teamId === homeTeam.id;
    events.push({
      minute: redCardEvent.minute,
      type: "red",
      teamId: redCardEvent.teamId,
      player: findPlayer(isHome ? homePlayers : awayPlayers, redCardEvent.playerId),
    });
    redPlayerIds.add(redCardEvent.playerId);
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

  // Kadro (FW/MF/DF/GK ortalama rating) bazlı hücum/savunma oranları --
  // fikstürdeki takım objeleri (m.homeTeam/m.awayTeam) tek başına
  // enrichTeamsWithAttackDefense ile işaretlenmemiş olabileceğinden burada
  // maç bazında birleştiriliyor (bkz. expectedGoals'taki attackRatio/
  // defenseRatio kullanımı).
  const attackDefenseMap = buildAttackDefenseMap(teams, allPlayers);

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
      const homeWithForm = applyForm(
        { ...m.homeTeam, ...attackDefenseMap[m.homeTeam.id] },
        formById
      );
      const awayWithForm = applyForm(
        { ...m.awayTeam, ...attackDefenseMap[m.awayTeam.id] },
        formById
      );
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
        updateForm(formById, m.homeTeam.id, m.homeTeam.coeff, m.awayTeam.coeff, 1);
        updateForm(formById, m.awayTeam.id, m.awayTeam.coeff, m.homeTeam.coeff, 0);
      } else if (sim.homeGoals < sim.awayGoals) {
        as_.w++;
        as_.pts += 3;
        hs.l++;
        updateForm(formById, m.homeTeam.id, m.homeTeam.coeff, m.awayTeam.coeff, 0);
        updateForm(formById, m.awayTeam.id, m.awayTeam.coeff, m.homeTeam.coeff, 1);
      } else {
        hs.d++;
        as_.d++;
        hs.pts++;
        as_.pts++;
        updateForm(formById, m.homeTeam.id, m.homeTeam.coeff, m.awayTeam.coeff, 0.5);
        updateForm(formById, m.awayTeam.id, m.awayTeam.coeff, m.homeTeam.coeff, 0.5);
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

      // Kırmızı kart varsa (simulateMatch tarafından nedensel olarak
      // belirlendi), goller "kart öncesi" / "kart sonrası" iki ayrı havuzdan
      // dağıtılır -- kart gören oyuncu, kartı gördüğü andan sonra artık gol/
      // asist üretemez.
      let homeGoalEvents;
      let awayGoalEvents;
      let redCardEvent = null;
      if (sim.redCard) {
        const sentOffSide = sim.redCard.side;
        const sentOffPool = sentOffSide === "home" ? homePlayers : awayPlayers;
        const sentOffPlayer = pickRedCardPlayer(sentOffPool, playerStats);
        const homeAfterPool =
          sentOffSide === "home" && sentOffPlayer ? homePlayers.filter((p) => p.id !== sentOffPlayer.id) : homePlayers;
        const awayAfterPool =
          sentOffSide === "away" && sentOffPlayer ? awayPlayers.filter((p) => p.id !== sentOffPlayer.id) : awayPlayers;

        homeGoalEvents = [
          ...distributeGoals(homePlayers, sim.homeGoalsBeforeRed, playerStats).map((e) => ({ ...e, phase: "before" })),
          ...distributeGoals(homeAfterPool, sim.homeGoalsAfterRed, playerStats).map((e) => ({ ...e, phase: "after" })),
        ];
        awayGoalEvents = [
          ...distributeGoals(awayPlayers, sim.awayGoalsBeforeRed, playerStats).map((e) => ({ ...e, phase: "before" })),
          ...distributeGoals(awayAfterPool, sim.awayGoalsAfterRed, playerStats).map((e) => ({ ...e, phase: "after" })),
        ];
        if (sentOffPlayer) {
          redCardEvent = {
            playerId: sentOffPlayer.id,
            minute: sim.redCard.minute,
            teamId: sentOffSide === "home" ? m.homeTeam.id : m.awayTeam.id,
          };
        }
      } else {
        homeGoalEvents = distributeGoals(homePlayers, sim.homeGoals, playerStats).map((e) => ({ ...e, phase: "before" }));
        awayGoalEvents = distributeGoals(awayPlayers, sim.awayGoals, playerStats).map((e) => ({ ...e, phase: "before" }));
      }

      const homeCardEvents = distributeYellowCards(homePlayers, playerStats, cardIntensity);
      const awayCardEvents = distributeYellowCards(awayPlayers, playerStats, cardIntensity);
      const events = buildMatchTimeline({
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoalEvents,
        awayGoalEvents,
        homeCardEvents,
        awayCardEvents,
        homePlayers,
        awayPlayers,
        redCardEvent,
      });

      // Kırmızı kart -> bir sonraki hafta cezalı.
      if (redCardEvent) {
        markUnavailable(unavailableUntil, unavailableReason, redCardEvent.playerId, md.number + 1, "kırmızı kart cezası");
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

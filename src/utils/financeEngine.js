// ============================================================================
// Kulüp finansmanı: mali güç, kadro piyasa değeri, turnuva/lig kazancı
// ============================================================================
// TAMAMEN KURGUSAL bir katmandır -- gerçek kulüp bilançolarını/piyasa
// değerlerini YANSITMAZ, sadece rating/coeff'ten türetilen basit, eğlence
// amaçlı formüllerdir. Diğer motorlar (predictionEngine, knockoutEngine) gibi
// YARIŞMADAN BAĞIMSIZDIR: hiçbir yerde "ucl"/"europa"/"36 takım" gibi sabit
// bir varsayım kodlanmaz -- para birimi her yerde € MİLYON'dur.

// --- Kadro piyasa değeri (oyuncu bazlı) ------------------------------------
// Gerçek transfer piyasasındaki gibi değer reytingle ÜSTEL artar (yıldız
// oyuncular orantısızca daha pahalıdır): rating 40 -> ~0.15M, 60 -> ~1.7M,
// 80 -> ~20M, 99 -> ~200M.
const VALUE_BASE = 0.15;
const VALUE_GROWTH = 1.13;
const VALUE_RATING_FLOOR = 40;

export function estimatePlayerValue(player) {
  const rating = Math.max(VALUE_RATING_FLOOR, Math.min(99, player?.rating || 60));
  return Math.round(VALUE_BASE * Math.pow(VALUE_GROWTH, rating - VALUE_RATING_FLOOR) * 10) / 10;
}

export function estimateSquadValue(players) {
  return Math.round((players || []).reduce((sum, p) => sum + estimatePlayerValue(p), 0) * 10) / 10;
}

export function buildSquadValueMap(allPlayers) {
  const byTeam = {};
  for (const p of allPlayers || []) {
    if (!byTeam[p.teamId]) byTeam[p.teamId] = [];
    byTeam[p.teamId].push(p);
  }
  const map = {};
  for (const teamId of Object.keys(byTeam)) {
    map[teamId] = estimateSquadValue(byTeam[teamId]);
  }
  return map;
}

// --- Mali güç (takımın yıllık bütçe/gelir kapasitesi) ----------------------
// coeff'ten üstel olarak türetilir -- gerçek hayatta olduğu gibi prestij
// farkı gelir farkına ORANTISIZ yansır (coeff 6 -> ~14M, coeff 60 -> ~64M,
// coeff 92 -> ~163M, coeff 140 -> ~575M). Takım id'sinden deterministik
// (Math.random DEĞİL -- her render'da aynı sonucu vermeli) küçük bir
// varyasyon eklenir, aynı coeff'e sahip iki takım birebir aynı görünmesin diye.
function seededUnit(id) {
  let hash = 0;
  const str = String(id || "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000; // deterministik, [0, 1)
}

function seededVariance(id, spread = 0.15) {
  return 1 - spread + seededUnit(id) * spread * 2; // [1-spread, 1+spread]
}

const POWER_BASE = 12;
const POWER_GROWTH = 1.028;

export function estimateFinancialPower(team) {
  const coeff = Math.max(1, team?.coeff || 6);
  const raw = POWER_BASE * Math.pow(POWER_GROWTH, coeff) * seededVariance(team?.id);
  return Math.round(raw * 10) / 10;
}

export function buildFinancialPowerMap(teams) {
  const map = {};
  for (const t of teams || []) map[t.id] = estimateFinancialPower(t);
  return map;
}

// --- Turnuva/lig kazancı ----------------------------------------------------
// Bir yarışmadaki takımların ORTALAMA coeff'i, o yarışmanın genel "prestij/
// yayın geliri" ölçeğini belirler (ör. UCL'in ortalama coeff'i Süper Lig'inkinden
// çok yüksek olduğu için UCL'de kazanılan miktarlar da doğal olarak büyür) --
// böylece formül hangi yarışma olduğunu bilmeye ihtiyaç duymaz.
function competitionScale(teams) {
  if (!teams || teams.length === 0) return 0;
  return teams.reduce((s, t) => s + (t.coeff || 0), 0) / teams.length;
}

// Bir takımın eleme turlarında ulaştığı EN İLERİ turu bulur (bkz.
// knockoutEngine.generateKnockoutBracket çıktısı: { rounds, champion }).
function farthestKnockoutRound(knockout, teamId) {
  if (!knockout) return null;
  if (knockout.champion?.id === teamId) return { name: "Şampiyon", isChampion: true };
  let reached = null;
  for (const round of knockout.rounds) {
    for (const tie of round.ties) {
      if (tie.teamA?.id === teamId || tie.teamB?.id === teamId) {
        reached = { name: round.name, isChampion: false };
      }
    }
  }
  return reached;
}

// Eleme turlarına göre kümülatif bonus çarpanı -- o tura ULAŞMIŞ olmak
// yeterli (gerçek UEFA'da olduğu gibi her tur kendinden önceki bonusları da
// kapsar, bu yüzden Şampiyon'un çarpanı ayrıca Final bonusunu TEKRAR eklemez).
const KNOCKOUT_ROUND_MULT = {
  "Play-off Turu": 0.09,
  "Son 16": 0.24,
  "Çeyrek Final": 0.42,
  "Yarı Final": 0.65,
  Final: 0.95,
  Şampiyon: 1.4,
};

// Çift devreli lig (ör. Süper Lig) bölgelerine göre bonus/ceza çarpanı --
// buildLeagueZones'un ürettiği zone.key değerleriyle birebir eşleşir.
const LEAGUE_ZONE_MULT = {
  champion: 0.55,
  ucl: 0.32,
  europa: 0.16,
  mid: 0,
  relegation: -0.12,
};

// İsviçre modeli (ör. UCL/Avrupa Ligi) lig fazı bölgelerine göre bonus --
// buildSwissZones'un ürettiği zone.key değerleriyle birebir eşleşir.
const SWISS_ZONE_MULT = {
  direct: 0.09,
  playoff: 0.035,
  out: 0,
};

// simulation ve (varsa) knockout'a göre her takımın bu sezon kazandığı
// tahmini toplam parayı (€ milyon) döner: { [teamId]: amount }. simulation
// henüz üretilmediyse boş obje döner (henüz "kazanılmış" bir şey yok).
export function estimateCompetitionEarnings(competition, simulation, knockout) {
  if (!simulation?.standings?.length) return {};
  const teams = competition.teams;
  const scale = competitionScale(teams);
  const n = simulation.standings.length;
  const earnings = {};

  if (competition.format === "league") {
    const base = scale * 0.28;
    for (const row of simulation.standings) {
      const rankShare = n > 1 ? (n - row.rank) / (n - 1) : 1; // 1 (şampiyon) .. 0 (son sıra)
      const zoneMult = LEAGUE_ZONE_MULT[row.status] ?? 0;
      const total = base + scale * 0.35 * rankShare + scale * zoneMult;
      earnings[row.teamId] = Math.max(0, Math.round(total * 10) / 10);
    }
  } else {
    const participation = scale * 0.17;
    const perWin = scale * 0.021;
    const perDraw = perWin / 3;
    for (const row of simulation.standings) {
      let total = participation + row.w * perWin + row.d * perDraw;
      total += scale * (SWISS_ZONE_MULT[row.status] ?? 0);

      const round = farthestKnockoutRound(knockout, row.teamId);
      const bonusKey = round?.isChampion ? "Şampiyon" : round?.name;
      total += scale * (KNOCKOUT_ROUND_MULT[bonusKey] || 0);

      earnings[row.teamId] = Math.max(0, Math.round(total * 10) / 10);
    }
  }
  return earnings;
}

// UI'da gösterim için: bir takımın eleme turlarındaki en ileri turunu
// okunabilir bir Türkçe etikete çevirir (ör. "Yarı Final", "Şampiyon"). Takım
// hiç eleme turuna kalmadıysa (lig fazında elendiyse) ya da yarışmanın hiç
// eleme turu yoksa (ör. Süper Lig) null döner.
export function describeKnockoutRun(knockout, teamId) {
  if (!knockout) return null;
  const reached = farthestKnockoutRound(knockout, teamId);
  return reached ? (reached.isChampion ? "Şampiyon" : reached.name) : "Lig Fazı (Elendi)";
}

// € milyon cinsinden bir tutarı okunabilir bir Türkçe metne çevirir --
// 1'in altı "B €" (bin), 1000'in altı "M €" (milyon), üstü "Mlyr €" (milyar).
export function formatMoney(millions) {
  if (millions == null || !Number.isFinite(millions)) return "–";
  if (millions >= 1000) return `${(millions / 1000).toFixed(2)} Mlyr €`;
  if (millions >= 1) return `${millions.toFixed(1)} M €`;
  return `${Math.max(0, Math.round(millions * 1000))} B €`;
}

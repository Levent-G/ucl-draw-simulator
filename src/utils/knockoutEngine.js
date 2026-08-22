// ============================================================================
// Eleme turları motoru (UCL / Avrupa Ligi lig fazı sonrası)
// ============================================================================
// Gerçek 2024/25+ formatı: lig fazında 1-8. sıradakiler doğrudan Son 16'ya
// gider; 9-24. sıradakiler (16 takım) kendi aralarında tek maçlık bir
// play-off oynar (8 çift, 9v24, 10v23, ... şeklinde kademeli eşleştirme) ve
// kazananlar da Son 16'ya katılır. Oradan itibaren Son 16 -> Çeyrek Final ->
// Yarı Final -> Final, final hariç hepsi gidiş-dönüş (iki maçlık) oynanır.
// Toplam skor eşitse (bu basitleştirilmiş simülasyonda uzatma yok) doğrudan
// penaltılara gidilir; kazanan takım gücüne hafif ağırlıklı rastgele seçilir.
//
// Bu motor da (fixtureEngine/predictionEngine gibi) YARIŞMADAN BAĞIMSIZDIR --
// sadece bir `standings` (sıralı puan durumu) ve `teamById` lookup'ı alır,
// takım sayısına göre orantılı çalışır.
import { simulateMatch } from "./predictionEngine.js";
import { findDerby } from "./derbies.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// twoLegged: true ise ikinci takım (b) ilk maçı evinde oynar (dezavantajlı
// taraf), ilk takım (a) ikinci (rövanş) maçı evinde oynar -- gerçek UEFA
// kuralına benzer şekilde "daha güçlü taraf" son maçı evinde oynar.
function simulateTie(a, b, twoLegged, tacticsById) {
  const isDerby = Boolean(findDerby(a.short, b.short));
  const leg1 = simulateMatch(b, a, tacticsById, isDerby); // b evinde
  let leg2 = null;
  let aggA = leg1.awayGoals;
  let aggB = leg1.homeGoals;

  if (twoLegged) {
    leg2 = simulateMatch(a, b, tacticsById, isDerby); // a evinde (rövanş)
    aggA += leg2.homeGoals;
    aggB += leg2.awayGoals;
  }

  let winner;
  let penalty = null;
  if (aggA > aggB) winner = a;
  else if (aggB > aggA) winner = b;
  else {
    const strengthA = Math.max(6, a.coeff || 6);
    const strengthB = Math.max(6, b.coeff || 6);
    const pA = strengthA / (strengthA + strengthB);
    winner = Math.random() < pA ? a : b;
    penalty = { winnerId: winner.id };
  }

  return { teamA: a, teamB: b, twoLegged, leg1, leg2, aggA, aggB, winner, penalty, isDerby };
}

// standings: predictionEngine.simulateSeason()'dan gelen sıralı dizi.
// teamById: { [teamId]: teamObject }. tacticsById: Antrenör Modu'nda
// atanmış taktikler -- lig fazındaki gibi eleme turlarında da geçerli olur.
export function generateKnockoutBracket(standings, teamById, tacticsById) {
  const ranked = standings
    .map((s) => teamById[s.teamId])
    .filter(Boolean);
  const teamCount = ranked.length;
  if (teamCount < 8) return null;

  const directCount = Math.max(1, Math.round((teamCount * 8) / 36));
  const playoffPoolSize = Math.min(teamCount - directCount, Math.round((teamCount * 16) / 36));

  const top = ranked.slice(0, directCount);
  const pool = ranked.slice(directCount, directCount + playoffPoolSize);

  const rounds = [];
  let field = [...top];

  if (pool.length >= 2) {
    const half = Math.floor(pool.length / 2);
    const higherSeeds = pool.slice(0, half); // daha iyi sıradakiler
    const lowerSeeds = pool.slice(half).reverse(); // 24, 23, ... eşleşsin diye ters
    const ties = [];
    for (let i = 0; i < half; i++) {
      const higher = higherSeeds[i];
      const lower = lowerSeeds[i] || pool[pool.length - 1 - i];
      if (!higher || !lower || higher.id === lower.id) continue;
      ties.push(simulateTie(higher, lower, true, tacticsById));
    }
    rounds.push({ name: "Play-off Turu", ties });
    field = [...field, ...ties.map((t) => t.winner)];
  }

  field = shuffle(field);

  const roundNames = ["Son 16", "Çeyrek Final", "Yarı Final", "Final"];
  for (const name of roundNames) {
    if (field.length < 2) break;
    const ties = [];
    for (let i = 0; i < field.length - 1; i += 2) {
      const twoLegged = name !== "Final";
      ties.push(simulateTie(field[i], field[i + 1], twoLegged, tacticsById));
    }
    rounds.push({ name, ties });
    field = ties.map((t) => t.winner);
  }

  return { rounds, champion: field[0] || null };
}

// Highlightly API'sinden (highlightly.net) UCL takımlarının GÜNCEL kadrolarını
// çeker. Ücretsiz katman günde 100 istek ile sınırlı olduğu için bu script
// ÇOK GÜNLÜ/DEVAM EDİLEBİLİR (resumable) olacak şekilde tasarlandı:
//
//   - Her takım için ilerleme .highlightly-cache/{teamId}.json dosyasına
//     yazılır -- dosya zaten varsa o takım ATLANIR (yeniden fetch edilmez).
//   - Her çalıştırma en fazla --max-requests (varsayılan 50) istek harcar,
//     sonra durur -- günlük 100 kotasını aşmamak için güvenli bir pay bırakır.
//   - Script birden çok kez (farklı günlerde) çalıştırılıp kaldığı yerden
//     devam edebilir.
//
// KULLANIM:
//   HIGHLIGHTLY_API_KEY=xxxx node scripts/fetch-highlightly-squads.mjs [--max-requests=50] [--league=ucl|europa|superlig]
//
// API key ASLA bu dosyaya veya .highlightly-cache/ içine YAZILMAZ -- sadece
// ortam değişkeninden okunur.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, "..", ".highlightly-cache");
const BASE_URL = "https://soccer.highlightly.net";

const apiKey = process.env.HIGHLIGHTLY_API_KEY;
if (!apiKey) {
  console.error("HATA: HIGHLIGHTLY_API_KEY ortam değişkeni gerekli.");
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const MAX_REQUESTS = Number(args["max-requests"] || 50);

// teams.js'teki RAW_TEAMS ile AYNI sıradaki 36 gerçek UCL takımı (27 Ağustos
// 2026 çekilişi sonrası kesinleşen liste) -- Highlightly'nin kendi arama
// endpoint'i tam bu isimlerle eşleşmeyebileceğinden (ör. "Inter" ->
// "Inter Milan") aranacak isim ayrıca belirtildi.
const UCL_TEAMS = [
  { id: "t1", name: "Real Madrid", searchName: "Real Madrid" },
  { id: "t2", name: "Manchester City", searchName: "Manchester City" },
  { id: "t3", name: "Bayern Münih", searchName: "Bayern Munich" },
  { id: "t4", name: "Paris Saint-Germain", searchName: "Paris Saint-Germain" },
  { id: "t5", name: "Liverpool", searchName: "Liverpool" },
  { id: "t6", name: "Inter", searchName: "Inter Milan" },
  { id: "t7", name: "Barcelona", searchName: "Barcelona" },
  { id: "t8", name: "Manchester United", searchName: "Manchester United" },
  { id: "t9", name: "Napoli", searchName: "Napoli" },
  { id: "t10", name: "Atletico Madrid", searchName: "Atletico Madrid" },
  { id: "t11", name: "Arsenal", searchName: "Arsenal" },
  { id: "t12", name: "Borussia Dortmund", searchName: "Borussia Dortmund" },
  { id: "t13", name: "Roma", searchName: "AS Roma" },
  { id: "t14", name: "Villarreal", searchName: "Villarreal" },
  { id: "t15", name: "RB Leipzig", searchName: "RB Leipzig" },
  { id: "t16", name: "Feyenoord", searchName: "Feyenoord" },
  { id: "t17", name: "Club Brugge", searchName: "Club Brugge" },
  { id: "t18", name: "Shakhtar Donetsk", searchName: "Shakhtar Donetsk" },
  { id: "t19", name: "Real Betis", searchName: "Real Betis" },
  { id: "t20", name: "Aston Villa", searchName: "Aston Villa" },
  { id: "t21", name: "VfB Stuttgart", searchName: "Stuttgart" },
  { id: "t22", name: "RC Lens", searchName: "Lens" },
  { id: "t23", name: "Sporting CP", searchName: "Sporting CP" },
  { id: "t24", name: "PSV Eindhoven", searchName: "PSV Eindhoven" },
  { id: "t25", name: "Fenerbahçe", searchName: "Fenerbahce" },
  { id: "t26", name: "Lille", searchName: "Lille" },
  { id: "t27", name: "AEK Athens", searchName: "AEK Athens" },
  { id: "t28", name: "FC Porto", searchName: "Porto" },
  { id: "t29", name: "SK Slavia Prague", searchName: "Slavia Prague" },
  { id: "t30", name: "Viking", searchName: "Viking" },
  { id: "t31", name: "Sabah", searchName: "Sabah" },
  { id: "t32", name: "Slovan Bratislava", searchName: "Slovan Bratislava" },
  { id: "t33", name: "LASK", searchName: "LASK" },
  { id: "t34", name: "Como", searchName: "Como" },
  { id: "t35", name: "Galatasaray", searchName: "Galatasaray" },
  { id: "t36", name: "Bodø/Glimt", searchName: "Bodo/Glimt" },
];

let requestsUsed = 0;
async function apiGet(pathAndQuery) {
  if (requestsUsed >= MAX_REQUESTS) throw new Error("BUDGET_EXHAUSTED");
  requestsUsed++;
  const res = await fetch(`${BASE_URL}${pathAndQuery}`, {
    headers: { "x-rapidapi-key": apiKey },
  });
  const remaining = res.headers.get("x-ratelimit-requests-remaining");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${pathAndQuery} :: ${body.slice(0, 200)}`);
  }
  if (remaining != null) console.log(`  (kalan günlük kota: ${remaining})`);
  return res.json();
}

async function findTeamId(searchName) {
  const json = await apiGet(`/teams?name=${encodeURIComponent(searchName)}`);
  const first = json.data?.[0];
  return first ? { id: first.id, name: first.name } : null;
}

// ÖNEMLİ: /matches, `season` verilmeden ya da CARİ (2026, henüz bitmemiş)
// sezonla sorgulanınca sonuçları TARİHE GÖRE SIRALI döndürmüyor (gelecekteki
// maçlar da karışık sırada geliyor) -- bu yüzden az önce TAMAMLANMIŞ
// (2025-26) sezonu (season=2025) hedefliyoruz; bu sezon TAMAMEN bittiği için
// (Mayıs 2026) döndürülen tüm maçlar "Finished" ve API bunları gerçekten
// tarihe göre (en yeniden en eskiye) sıralı veriyor -- deneyerek doğrulandı.
// Kadro Mayıs 2026'daki haliyle olur (yaz transferlerini yansıtmaz) ama
// hiç veri olmamasından çok daha iyi bir başlangıç noktası.
const LAST_COMPLETED_SEASON = 2025;
async function findMostRecentMatch(highlightlyTeamId) {
  const [homeJson, awayJson] = await Promise.all([
    apiGet(`/matches?homeTeamId=${highlightlyTeamId}&season=${LAST_COMPLETED_SEASON}&limit=3`),
    apiGet(`/matches?awayTeamId=${highlightlyTeamId}&season=${LAST_COMPLETED_SEASON}&limit=3`),
  ]);
  const all = [...(homeJson.data || []), ...(awayJson.data || [])]
    .filter((m) => m.state?.description === "Finished")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return all[0] || null;
}

async function fetchLineupForTeam(matchId, highlightlyTeamId) {
  const json = await apiGet(`/lineups/${matchId}`);
  const side = json.homeTeam?.id === highlightlyTeamId ? json.homeTeam : json.awayTeam;
  if (!side) return [];
  const starters = (side.initialLineup || []).flat();
  const subs = side.substitutes || [];
  return [...starters, ...subs].map((p) => ({ name: p.name, number: p.number, position: p.position, highlightlyPlayerId: p.id }));
}

function loadCache(teamId) {
  const file = path.join(CACHE_DIR, `${teamId}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf-8"));
  return null;
}
function saveCache(teamId, data) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, `${teamId}.json`), JSON.stringify(data, null, 2), "utf-8");
}

async function main() {
  let done = 0;
  let skipped = 0;
  for (const team of UCL_TEAMS) {
    if (loadCache(team.id)) {
      skipped++;
      continue;
    }
    if (requestsUsed >= MAX_REQUESTS) {
      console.log(`\nBütçe doldu (${requestsUsed}/${MAX_REQUESTS} istek) -- burada duruyorum. Script'i tekrar çalıştırınca kaldığı yerden devam eder.`);
      break;
    }
    try {
      console.log(`\n[${team.name}] Highlightly'de aranıyor...`);
      const hlTeam = await findTeamId(team.searchName);
      if (!hlTeam) {
        // Cache'e YAZMIYORUZ -- bir sonraki çalıştırmada (belki arama ismi
        // düzeltilir ya da API tarafında geçici bir sorundu) tekrar denensin.
        console.log(`  BULUNAMADI, atlanıyor (tekrar denenecek).`);
        continue;
      }
      console.log(`  -> Highlightly id: ${hlTeam.id} (${hlTeam.name})`);
      const match = await findMostRecentMatch(hlTeam.id);
      if (!match) {
        console.log(`  Son maç bulunamadı, atlanıyor (tekrar denenecek).`);
        continue;
      }
      console.log(`  -> Son maç: ${match.date} (id ${match.id})`);
      const players = await fetchLineupForTeam(match.id, hlTeam.id);
      console.log(`  -> ${players.length} oyuncu bulundu.`);
      saveCache(team.id, {
        name: team.name,
        highlightlyTeamId: hlTeam.id,
        sourceMatchId: match.id,
        sourceMatchDate: match.date,
        players,
      });
      done++;
    } catch (e) {
      if (e.message === "BUDGET_EXHAUSTED") {
        console.log(`\nBütçe doldu -- burada duruyorum.`);
        break;
      }
      console.log(`  HATA: ${e.message}`);
      // Hata durumunda cache'e yazmıyoruz ki bir sonraki çalıştırmada tekrar denensin.
    }
  }
  console.log(`\n--- ÖZET --- İşlenen: ${done}, atlanan (zaten cache'de): ${skipped}, kalan: ${UCL_TEAMS.length - done - skipped}, bu çalıştırmada harcanan istek: ${requestsUsed}`);
}

main();

// ============================================================================
// Gerçek veri seçicileri (UCL + Süper Lig)
// ============================================================================
// Bu dosya, sitenin "gerçek futbol verisi" tarafının (Ana Sayfa, Fikstür,
// Maç Merkezi, Takım Profili, Karşılıklı Geçmiş, Haberler) TEK giriş noktası.
// BİLİNÇLİ OLARAK CompetitionContext'ten (kura töreni / sahte sezon
// simülasyonu state machine'i) TAMAMEN BAĞIMSIZDIR -- gerçek veri
// sayfalarının, "eğlence modu" simülasyon akışını (DrawPage/LeagueHomePage/
// runSimulation) hiçbir şekilde etkilememesi/etkilenmemesi için. Tüm
// fonksiyonlar saf (pure) -- doğrudan src/data/*.js'teki statik anlık
// görüntülerden okur. Veri kaynağı ileride bir API olursa, sadece BU
// dosyadaki fonksiyonların içi değişir; tüketen sayfalar (import eden kod)
// aynı kalır.
import { getCompetition } from "../data/competitions.js";
import { deserializeFixture } from "./fixtureEngine.js";
import { deserializeRoundRobinFixture } from "./roundRobinEngine.js";
import {
  computeStandingsFromUserScores,
  resolveZone,
  enrichTeamsWithAttackDefense,
  expectedGoals,
  matchProbabilities,
} from "./predictionEngine.js";
import { isMatchPlayed } from "./matchDate.js";
import { REAL_FIXTURE_2026 } from "../data/realFixture2026.js";
import { REAL_FIXTURE_SUPERLIG_2026 } from "../data/realFixtureSuperLig2026.js";
import { REAL_RESULTS_UCL_2026 } from "../data/realResultsUcl2026.js";
import {
  SUPER_LIG_LIVE_STANDINGS,
  SUPER_LIG_LIVE_RESULTS,
  SUPER_LIG_LIVE_ASOF,
} from "../data/liveStatus.js";
import { TEAM_DOMESTIC_FORM } from "../data/teamDomesticForm.js";
import { HEAD_TO_HEAD } from "../data/headToHead.js";
import { NEWS_ITEMS } from "../data/news.js";

// "ucl"/"superlig" için gerçek veri desteği var mı? (europa henüz yok --
// gerçek kaynağı olmadığından eski simülasyon-öncelikli akışında kalıyor.)
export function hasRealDataSupport(competitionKey) {
  return competitionKey === "ucl" || competitionKey === "superlig";
}

// Gerçek, tarihli fikstürü (deserializeFixture/deserializeRoundRobinFixture
// ile takım nesneleri bağlanmış hâlde) döner. europa (ya da desteklenmeyen
// bir anahtar) için null döner.
export function getRealFixture(competitionKey) {
  const competition = getCompetition(competitionKey);
  if (competitionKey === "ucl") return deserializeFixture(REAL_FIXTURE_2026, competition.teams);
  if (competitionKey === "superlig") return deserializeRoundRobinFixture(REAL_FIXTURE_SUPERLIG_2026, competition.teams);
  return null;
}

// Fikstürdeki, "şu an" en yakın haftayı bulur -- en az bir maçı henüz
// oynanmamış İLK hafta. Tüm haftalar oynandıysa son haftayı döner.
export function findCurrentMatchdayIndex(fixture) {
  if (!fixture || fixture.length === 0) return -1;
  const idx = fixture.findIndex((md) => md.matches.some((m) => !isMatchPlayed(m)));
  return idx === -1 ? fixture.length - 1 : idx;
}

// UCL lig fazı puan durumu: gerçek fikstür + şimdiye kadar elle eklenmiş
// gerçek sonuçlardan (REAL_RESULTS_UCL_2026) computeStandingsFromUserScores
// (predictionEngine.js -- "Canlı Skorlar"ın kullanıcı-skoru puan durumu
// hesaplayıcısıyla AYNI, kanıtlanmış fonksiyon) ile hesaplanır. Henüz hiç
// maç oynanmadıysa (started:false) tüm takımlar 0 puanla döner -- arayüz bu
// durumda anlamsız bir puan durumu tablosu yerine "sezon henüz başlamadı,
// işte fikstür" görünümü göstermelidir (bkz. CompetitionHomePage.jsx).
export function getUclLeaguePhaseStandings() {
  const competition = getCompetition("ucl");
  const fixture = getRealFixture("ucl");
  const userScores = {};
  for (const r of REAL_RESULTS_UCL_2026) {
    userScores[r.matchId] = { home: String(r.homeGoals), away: String(r.awayGoals) };
  }
  const standings = computeStandingsFromUserScores(fixture, userScores, {
    teams: competition.teams,
    zones: competition.zones,
  });
  return { standings, started: REAL_RESULTS_UCL_2026.length > 0, fixture };
}

// Süper Lig puan durumu: liveStatus.js'teki ZATEN doğru hesaplanmış gerçek
// puan durumunu (SUPER_LIG_LIVE_STANDINGS) StandingsTable.jsx'in beklediği
// satır şekline ({teamId,rank,played,w,d,l,gf,ga,gd,pts,statusTone,
// statusLabel}) çevirir -- yeniden hesaplamaz (tek doğruluk kaynağı
// liveStatus.js'te kalır).
export function getSuperLigStandings() {
  const competition = getCompetition("superlig");
  const teamByName = Object.fromEntries(competition.teams.map((t) => [t.name, t]));
  const zones = competition.zones;
  const standings = [...SUPER_LIG_LIVE_STANDINGS]
    .sort((a, b) => a.rank - b.rank)
    .map((row) => {
      const team = teamByName[row.teamName];
      if (!team) return null;
      const zone = resolveZone(zones, row.rank);
      return {
        teamId: team.id,
        rank: row.rank,
        played: row.played,
        w: row.w,
        d: row.d,
        l: row.l,
        gf: row.gf,
        ga: row.ga,
        gd: row.gf - row.ga,
        pts: row.pts,
        status: zone.key,
        statusTone: zone.tone,
        statusLabel: zone.label,
      };
    })
    .filter(Boolean);
  return { standings, asOf: SUPER_LIG_LIVE_ASOF, fixture: getRealFixture("superlig") };
}

export function getRealStandings(competitionKey) {
  if (competitionKey === "ucl") return getUclLeaguePhaseStandings();
  if (competitionKey === "superlig") return getSuperLigStandings();
  return { standings: null, fixture: null };
}

// Bir maçın gerçek sonucunu (varsa) döner. `match`: fikstürden gelen
// {id, homeTeam, awayTeam, date} nesnesi. Süper Lig'de eşleştirme takım
// adı üzerinden yapılır (SUPER_LIG_LIVE_RESULTS bu şekilde tutuluyor, bkz.
// liveStatus.js'teki buildSuperLigContinuation'la aynı eşleştirme mantığı).
// Sonuç yoksa null döner -- ARAYÜZ BUNU ASLA SAHTE BİR SKORLA DOLDURMAMALI.
export function getRealMatchResult(competitionKey, match) {
  if (!match) return null;
  if (competitionKey === "ucl") {
    const r = REAL_RESULTS_UCL_2026.find((x) => x.matchId === match.id);
    return r ? { homeGoals: r.homeGoals, awayGoals: r.awayGoals, date: r.date || match.date } : null;
  }
  if (competitionKey === "superlig") {
    const r = SUPER_LIG_LIVE_RESULTS.find(
      (x) => x.home === match.homeTeam?.name && x.away === match.awayTeam?.name
    );
    return r ? { homeGoals: r.homeGoals, awayGoals: r.awayGoals, date: match.date, label: r.label } : null;
  }
  return null;
}

// Süper Lig'de bir takımın SON `limit` maçtaki (bu ligin kendi içindeki)
// gerçek formu -- en eskiden en yeniye sıralı "W"/"D"/"L" dizisi.
export function getSuperLigTeamForm(teamName, limit = 5) {
  const matches = SUPER_LIG_LIVE_RESULTS.filter((r) => r.home === teamName || r.away === teamName);
  return matches.slice(-limit).map((r) => {
    const isHome = r.home === teamName;
    const gf = isHome ? r.homeGoals : r.awayGoals;
    const ga = isHome ? r.awayGoals : r.homeGoals;
    return gf > ga ? "W" : gf < ga ? "L" : "D";
  });
}

// Bir UCL kulübünün KENDİ (yerli) ligindeki güncel durumu/formu. Süper
// Lig'in kendi takımları için de dolu olabilir (o zaman Süper Lig'deki
// formuyla aynı anlama gelir) ama birincil kullanım alanı UCL kulüpleridir.
export function getDomesticForm(teamId) {
  return TEAM_DOMESTIC_FORM[teamId] || null;
}

function h2hKey(teamIdA, teamIdB) {
  return [teamIdA, teamIdB].sort().join("|");
}

// İki takım arasındaki gerçek geçmiş karşılaşma kaydı (varsa). Kayıt yoksa
// null döner -- arayüz bunu "muhtemelen daha önce hiç karşılaşmadılar / bu
// çift için henüz araştırılmış bir geçmiş yok" gibi dürüst bir notla
// göstermeli, ASLA uydurma bir geçmiş üretmemeli.
export function getHeadToHead(teamIdA, teamIdB) {
  return HEAD_TO_HEAD[h2hKey(teamIdA, teamIdB)] || null;
}

// competitionKey ve/veya belirli bir takım/maça göre filtrelenmiş, tarihe
// göre (en yeni önce) sıralanmış haber listesi.
export function getNews({ competitionKey, teamId, matchId, limit } = {}) {
  let items = NEWS_ITEMS;
  if (competitionKey) items = items.filter((n) => n.competitionKey === competitionKey);
  if (teamId) items = items.filter((n) => n.relatedTeamIds?.includes(teamId));
  if (matchId) items = items.filter((n) => n.relatedMatchId === matchId);
  items = [...items].sort((a, b) => b.date.localeCompare(a.date));
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

// Tek bir maçın (henüz oynanmamış olsa da) hafif, tek-maçlık model kazanma
// olasılığı -- tam sezon Poisson simülasyonu GEREKMEDEN (bkz.
// predictionEngine.js: expectedGoals + matchProbabilities). MatchCenterPage
// içindeki MatchPreview'daki mantıkla birebir aynı, buraya taşınarak
// FixturePage/CompetitionHomePage ile de paylaşılıyor.
export function getMatchWinProbability(homeTeam, awayTeam, competition) {
  const enriched = enrichTeamsWithAttackDefense(competition.teams, competition.getAllPlayers());
  const home = enriched.find((t) => t.id === homeTeam.id) || homeTeam;
  const away = enriched.find((t) => t.id === awayTeam.id) || awayTeam;
  const { lambdaHome, lambdaAway } = expectedGoals(home, away);
  return matchProbabilities(lambdaHome, lambdaAway);
}

// Bir maç listesini (tek haftalık ya da tüm fikstür), MatchRow/
// HighlightMatchCard/StandingsTable'ın beklediği alanlarla ("homeGoals"/
// "awayGoals" -- varsa gerçek sonuçtan, "homeWinProb"/"drawProb"/
// "awayWinProb" -- hafif model tahmininden) zenginleştirir. Gerçek sonucu
// olmayan (henüz oynanmamış ya da sonucu henüz elle girilmemiş) maçlarda
// skor alanları dokunulmadan (undefined) kalır -- bileşenler bunu zaten
// "– : –" / "⏳ Bekleniyor" olarak dürüstçe gösteriyor.
export function buildDisplayMatches(competitionKey, matches) {
  const competition = getCompetition(competitionKey);
  const enrichedTeams = enrichTeamsWithAttackDefense(competition.teams, competition.getAllPlayers());
  const enrichedById = Object.fromEntries(enrichedTeams.map((t) => [t.id, t]));
  return matches.map((m) => {
    const real = getRealMatchResult(competitionKey, m);
    const home = enrichedById[m.homeTeam.id] || m.homeTeam;
    const away = enrichedById[m.awayTeam.id] || m.awayTeam;
    const { lambdaHome, lambdaAway } = expectedGoals(home, away);
    const probs = matchProbabilities(lambdaHome, lambdaAway);
    return {
      ...m,
      ...(real ? { homeGoals: real.homeGoals, awayGoals: real.awayGoals } : {}),
      homeWinProb: probs.homeWinProb,
      drawProb: probs.drawProb,
      awayWinProb: probs.awayWinProb,
    };
  });
}

// Her hafta sonunda takımların BİRİKİMLİ puanını döner -- [{matchday, [teamId]:
// puan, ...}, ...] -- "Puan Durumu Gelişimi" çizgi grafiği için (bkz.
// RealAnalysisTab.jsx). Sadece GERÇEK sonucu olan haftalar sayılır; henüz
// hiç maç oynanmadıysa boş dizi döner (uydurma bir eğri çizilmez).
export function getStandingsProgression(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const competition = getCompetition(competitionKey);
  const cumulative = {};
  for (const t of competition.teams) cumulative[t.id] = 0;
  const rows = [];
  for (const md of fixture) {
    let anyPlayed = false;
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      anyPlayed = true;
      if (real.homeGoals > real.awayGoals) cumulative[m.homeTeam.id] += 3;
      else if (real.homeGoals < real.awayGoals) cumulative[m.awayTeam.id] += 3;
      else {
        cumulative[m.homeTeam.id] += 1;
        cumulative[m.awayTeam.id] += 1;
      }
    }
    if (anyPlayed) rows.push({ matchday: md.number, ...cumulative });
  }
  return rows;
}

// Bir takımın GERÇEK sonuçlardan iç saha/deplasman ayrımını döner --
// {home:{played,w,d,l,pts}, away:{played,w,d,l,pts}}. "Analiz" sekmesindeki
// iç saha/deplasman performans karşılaştırması için.
export function getHomeAwaySplit(competitionKey, teamId) {
  const fixture = getRealFixture(competitionKey);
  const empty = () => ({ played: 0, w: 0, d: 0, l: 0, pts: 0 });
  const split = { home: empty(), away: empty() };
  if (!fixture) return split;
  for (const md of fixture) {
    for (const m of md.matches) {
      const isHome = m.homeTeam.id === teamId;
      const isAway = m.awayTeam.id === teamId;
      if (!isHome && !isAway) continue;
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      const side = isHome ? split.home : split.away;
      const own = isHome ? real.homeGoals : real.awayGoals;
      const opp = isHome ? real.awayGoals : real.homeGoals;
      side.played++;
      if (own > opp) {
        side.w++;
        side.pts += 3;
      } else if (own < opp) {
        side.l++;
      } else {
        side.d++;
        side.pts += 1;
      }
    }
  }
  return split;
}

// Her takımın SIRADAKİ (henüz oynanmamış) maçının hafif model olasılığını
// döner -- {[teamId]: displayMatch}. Puan Durumu tablosunda "küçük, güzel"
// bir ihtimal göstergesi (bkz. ProbabilityBar size="mini") için kullanılır.
// Tüm fikstür TEK seferde zenginleştirilir (buildDisplayMatches'i her
// haftada ayrı ayrı çağırmak yerine) -- gereksiz tekrar hesaplama olmasın.
export function getNextMatchProbabilitiesByTeam(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return {};
  const allMatches = fixture.flatMap((md) => md.matches);
  const displayMatches = buildDisplayMatches(competitionKey, allMatches);
  const result = {};
  for (const m of displayMatches) {
    if (isMatchPlayed(m)) continue;
    if (!result[m.homeTeam.id]) result[m.homeTeam.id] = m;
    if (!result[m.awayTeam.id]) result[m.awayTeam.id] = m;
  }
  return result;
}

function enrichedTeamMap(competition) {
  const enriched = enrichTeamsWithAttackDefense(competition.teams, competition.getAllPlayers());
  return Object.fromEntries(enriched.map((t) => [t.id, t]));
}

// Her haftanın (oynanmış maçları olan) ORTALAMA toplam gol sayısı -- sezon
// ilerledikçe maçların golcü mü yoksa daha az golcü mü geçtiğine dair bir
// trend çizgisi. Sadece gerçek, oynanmış maçlardan.
export function getGoalsPerMatchdayTrend(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const rows = [];
  for (const md of fixture) {
    let totalGoals = 0;
    let playedCount = 0;
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      totalGoals += real.homeGoals + real.awayGoals;
      playedCount++;
    }
    if (playedCount > 0) {
      rows.push({ matchday: md.number, label: md.label, avgGoals: Number((totalGoals / playedCount).toFixed(2)) });
    }
  }
  return rows;
}

// Her OYNANMIŞ gerçek maç için MAÇ ÖNCESİ (kickoff'tan önceki, gerçek sonuçtan
// bağımsız) model olasılığını hesaplar. "Beklenen Puan" (xPTS) -- gerçek
// futbol analitiğinde yaygın bir kavram (ör. 3*galibiyetOlasılığı +
// 1*beraberlikOlasılığı) -- bunun sezon boyunca toplamıdır. Gerçek puanla
// (actualPts) karşılaştırmak, hangi takımın modelin beklediğinden daha
// iyi/kötü performans gösterdiğini ortaya çıkarır. Bu bir gerçek sonuç
// DEĞİL, modelin kendi tutarlı tahmininin bir türevidir -- öyle etiketlenir.
export function getExpectedPointsTable(competitionKey) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const enrichedById = enrichedTeamMap(competition);
  const xpts = {};
  const actualPts = {};
  const played = {};
  for (const t of competition.teams) {
    xpts[t.id] = 0;
    actualPts[t.id] = 0;
    played[t.id] = 0;
  }
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      const home = enrichedById[m.homeTeam.id] || m.homeTeam;
      const away = enrichedById[m.awayTeam.id] || m.awayTeam;
      const { lambdaHome, lambdaAway } = expectedGoals(home, away);
      const probs = matchProbabilities(lambdaHome, lambdaAway);
      xpts[m.homeTeam.id] += probs.homeWinProb * 3 + probs.drawProb;
      xpts[m.awayTeam.id] += probs.awayWinProb * 3 + probs.drawProb;
      played[m.homeTeam.id]++;
      played[m.awayTeam.id]++;
      if (real.homeGoals > real.awayGoals) actualPts[m.homeTeam.id] += 3;
      else if (real.homeGoals < real.awayGoals) actualPts[m.awayTeam.id] += 3;
      else {
        actualPts[m.homeTeam.id] += 1;
        actualPts[m.awayTeam.id] += 1;
      }
    }
  }
  return competition.teams
    .filter((t) => played[t.id] > 0)
    .map((t) => ({
      teamId: t.id,
      team: t,
      played: played[t.id],
      xpts: Math.round(xpts[t.id] * 10) / 10,
      actualPts: actualPts[t.id],
      diff: Math.round((actualPts[t.id] - xpts[t.id]) * 10) / 10,
    }))
    .sort((a, b) => b.diff - a.diff);
}

// Gerçek sonucu, maç ÖNCESİ model tahmininden en çok sapan (yani en
// "sürpriz") oynanmış maçları döner -- büyük favorinin kaybettiği/berabere
// kaldığı maçlar üste çıkar. surprise = 1 - (gerçekleşen sonucun maç öncesi
// olasılığı).
export function getUpsetMatches(competitionKey, limit = 8) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const enrichedById = enrichedTeamMap(competition);
  const rows = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      const home = enrichedById[m.homeTeam.id] || m.homeTeam;
      const away = enrichedById[m.awayTeam.id] || m.awayTeam;
      const { lambdaHome, lambdaAway } = expectedGoals(home, away);
      const probs = matchProbabilities(lambdaHome, lambdaAway);
      const actualProb =
        real.homeGoals > real.awayGoals ? probs.homeWinProb : real.homeGoals < real.awayGoals ? probs.awayWinProb : probs.drawProb;
      rows.push({
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoals: real.homeGoals,
        awayGoals: real.awayGoals,
        date: m.date,
        matchdayLabel: md.label,
        preMatchProbs: probs,
        surprise: 1 - actualProb,
      });
    }
  }
  return rows.sort((a, b) => b.surprise - a.surprise).slice(0, limit);
}

// Her takımın GÜNCEL serisini döner (ör. "3 maçtır galip", "2 maçtır
// berabere") -- son sonuçtan geriye doğru aynı tip (W/D/L) tekrar ettiği
// sürece sayılır. Sadece gerçek, oynanmış maçlardan.
export function getStreaks(competitionKey) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const resultsByTeam = {};
  for (const t of competition.teams) resultsByTeam[t.id] = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      const homeResult = real.homeGoals > real.awayGoals ? "W" : real.homeGoals < real.awayGoals ? "L" : "D";
      const awayResult = homeResult === "W" ? "L" : homeResult === "L" ? "W" : "D";
      resultsByTeam[m.homeTeam.id].push(homeResult);
      resultsByTeam[m.awayTeam.id].push(awayResult);
    }
  }
  return competition.teams
    .map((t) => {
      const arr = resultsByTeam[t.id];
      if (arr.length === 0) return null;
      const last = arr[arr.length - 1];
      let length = 0;
      for (let i = arr.length - 1; i >= 0 && arr[i] === last; i--) length++;
      return { teamId: t.id, team: t, type: last, length, recent: arr.slice(-5) };
    })
    .filter(Boolean)
    .sort((a, b) => (a.type === b.type ? b.length - a.length : a.type === "W" ? -1 : b.type === "W" ? 1 : 0));
}

// Her takım için temiz sayfa (clean sheet), karşılıklı gol (BTTS) ve 2.5 üstü
// gol maç yüzdesi -- klasik "maç istatistikleri" -- gerçek sonuçlardan.
export function getMatchStatsSummary(competitionKey) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const stats = {};
  for (const t of competition.teams) stats[t.id] = { played: 0, cleanSheets: 0, btts: 0, over25: 0 };
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      const total = real.homeGoals + real.awayGoals;
      const bothScored = real.homeGoals > 0 && real.awayGoals > 0;
      for (const [teamId, concededGoals] of [
        [m.homeTeam.id, real.awayGoals],
        [m.awayTeam.id, real.homeGoals],
      ]) {
        const s = stats[teamId];
        if (!s) continue;
        s.played++;
        if (concededGoals === 0) s.cleanSheets++;
        if (bothScored) s.btts++;
        if (total > 2.5) s.over25++;
      }
    }
  }
  return competition.teams
    .filter((t) => stats[t.id].played > 0)
    .map((t) => ({ teamId: t.id, team: t, ...stats[t.id] }));
}

function clamp01to100(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Bir takımın çok-eksenli "profil" görünümü (Radar grafiği için) -- Hücum/
// Savunma (kadro reytinglerinden türetilen attackRatio/defenseRatio,
// ±%18 aralığı 0-100'e ölçeklenir), Katsayı (yarışmadaki diğer takımlara
// göre 0-100 normalize), Form (son gerçek maçlardaki W/D/L ağırlıklı puanı)
// ve -- varsa -- Lig Konumu (kendi ligindeki sırasının normalize hâli).
// Hepsi GERÇEK girdilerden türetilmiş görece skorlardır, uydurma değildir --
// ama "0-100" ölçeği kendi başına resmi bir istatistik değil, bu sitenin
// karşılaştırma amaçlı normalize ettiği bir görünümdür (etiketle belirtilir).
export function getTeamRadarProfile(competitionKey, teamId) {
  const competition = getCompetition(competitionKey);
  const team = competition.teams.find((t) => t.id === teamId);
  if (!team) return [];
  const enriched = enrichedTeamMap(competition)[teamId];
  const attackScore = clamp01to100((((enriched?.attackRatio ?? 1) - 0.82) / 0.36) * 100);
  const defenseScore = clamp01to100((((enriched?.defenseRatio ?? 1) - 0.82) / 0.36) * 100);
  const coeffs = competition.teams.map((t) => t.coeff);
  const maxCoeff = Math.max(...coeffs);
  const minCoeff = Math.min(...coeffs);
  const coeffScore = clamp01to100(((team.coeff - minCoeff) / (maxCoeff - minCoeff || 1)) * 100);

  const formArr = competitionKey === "superlig" ? getSuperLigTeamForm(team.name) : getDomesticForm(teamId)?.form;
  const formScore =
    formArr && formArr.length > 0
      ? clamp01to100(
          (formArr.reduce((sum, r) => sum + (r === "W" ? 3 : r === "D" ? 1 : 0), 0) / (formArr.length * 3)) * 100
        )
      : null;

  const axes = [
    { axis: "Hücum", value: attackScore },
    { axis: "Savunma", value: defenseScore },
    { axis: "Katsayı", value: coeffScore },
  ];
  if (formScore != null) axes.push({ axis: "Form", value: formScore });

  const domestic = getDomesticForm(teamId);
  if (domestic?.position) {
    const leagueSize = 20; // çoğu Avrupa ligi ~18-20 takımlı, kaba bir normalize
    axes.push({ axis: "Lig Konumu", value: clamp01to100(100 - ((domestic.position - 1) / leagueSize) * 100) });
  }
  return axes;
}

// Oynanmış tüm gerçek maçları tek bir toplam-gol sayısı histogramına döker
// (0, 1, 2, 3, 4, 5+ gol) -- "bu yarışmada maçlar genelde golcü mü geçiyor"
// sorusuna cevap. Sadece gerçek, oynanmış maçlardan.
export function getGoalDistribution(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const buckets = [0, 1, 2, 3, 4, 5].map((n) => ({ goals: n === 5 ? "5+" : String(n), count: 0 }));
  let playedCount = 0;
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      playedCount++;
      const total = real.homeGoals + real.awayGoals;
      buckets[Math.min(total, 5)].count++;
    }
  }
  return playedCount > 0 ? buckets : [];
}

// Her takımın KALAN (henüz oynanmamış) gerçek maçlarında, sitenin maç
// modelinin (expectedGoals/matchProbabilities -- kadro gücünden türetilen
// hücum/savunma oranları VE ev sahibi avantajı dahil, SADECE katsayıya değil)
// hesapladığı ORTALAMA kazanma olasılığı. Yüksek değer daha kolay (favori
// olunan maçların ağırlıkta olduğu), düşük değer daha zor bir kalan program
// anlamına gelir. Ortalama rakip katsayısı da (basit bir referans olarak)
// yanında döner. Sadece gerçek fikstürden.
export function getFixtureDifficulty(competitionKey) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const enrichedById = enrichedTeamMap(competition);
  const totals = {};
  for (const t of competition.teams) totals[t.id] = { winProbSum: 0, coeffSum: 0, count: 0 };
  for (const md of fixture) {
    for (const m of md.matches) {
      if (isMatchPlayed(m)) continue;
      const home = m.homeTeam;
      const away = m.awayTeam;
      if (!home || !away || !totals[home.id] || !totals[away.id]) continue;
      const homeEnriched = enrichedById[home.id] || home;
      const awayEnriched = enrichedById[away.id] || away;
      const { lambdaHome, lambdaAway } = expectedGoals(homeEnriched, awayEnriched);
      const probs = matchProbabilities(lambdaHome, lambdaAway);
      totals[home.id].winProbSum += probs.homeWinProb;
      totals[home.id].coeffSum += away.coeff;
      totals[home.id].count++;
      totals[away.id].winProbSum += probs.awayWinProb;
      totals[away.id].coeffSum += home.coeff;
      totals[away.id].count++;
    }
  }
  return competition.teams
    .map((t) => {
      const stat = totals[t.id];
      if (!stat || stat.count === 0) return null;
      return {
        teamId: t.id,
        team: t,
        remaining: stat.count,
        avgWinProbability: Math.round((stat.winProbSum / stat.count) * 100),
        avgOpponentCoeff: Math.round((stat.coeffSum / stat.count) * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.avgWinProbability - a.avgWinProbability);
}

// Sezon sonu puan projeksiyonu -- ESKİDEN "şu ana kadarki maç başı puan
// ortalaması × kalan hafta sayısı" gibi saf bir DOĞRUSAL ekstrapolasyondu;
// bu, sezonun başında (az maç oynanmışken) çok agresif/gerçekçi olmayan
// sonuçlar üretiyordu (ör. 3 maçta 9 puanlık bir takım, kalan TÜM maçları da
// aynı tempoda kazanacakmış gibi hesaplanıyordu) VE kalan fikstürün kolay mı
// zor mu olduğunu hiç dikkate almıyordu. Bunun yerine: takımın ŞU ANA KADAR
// GERÇEKTEN topladığı puan + kalan HER maç için modelin (katsayı + kadro
// gücünden türetilen hücum/savunma oranları + ev sahibi avantajı --
// getFixtureDifficulty'de kullanılanla AYNI model) hesapladığı beklenen puanın
// (3×galibiyet + 1×beraberlik olasılığı) toplamı kullanılır -- yani hem
// gerçek mevcut performansı korur, hem de kalan programın gerçek zorluğunu
// yansıtır (zor bir kalan fikstürü olan lider, kolay bir fikstürü olan
// liderden daha düşük projekte edilir).
export function getSeasonEndProjection(competitionKey) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const { standings } = getRealStandings(competitionKey);
  if (!standings) return [];
  const pointsById = Object.fromEntries(standings.map((s) => [s.teamId, s]));
  const enrichedById = enrichedTeamMap(competition);
  const remainingXpts = {};
  for (const t of competition.teams) remainingXpts[t.id] = 0;
  for (const md of fixture) {
    for (const m of md.matches) {
      if (isMatchPlayed(m)) continue;
      const home = m.homeTeam;
      const away = m.awayTeam;
      if (!home || !away || !(home.id in remainingXpts) || !(away.id in remainingXpts)) continue;
      const homeEnriched = enrichedById[home.id] || home;
      const awayEnriched = enrichedById[away.id] || away;
      const { lambdaHome, lambdaAway } = expectedGoals(homeEnriched, awayEnriched);
      const probs = matchProbabilities(lambdaHome, lambdaAway);
      remainingXpts[home.id] += probs.homeWinProb * 3 + probs.drawProb;
      remainingXpts[away.id] += probs.awayWinProb * 3 + probs.drawProb;
    }
  }
  return competition.teams
    .map((t) => {
      const s = pointsById[t.id];
      if (!s || s.played === 0) return null;
      return {
        teamId: t.id,
        team: t,
        short: t.short,
        pts: s.pts,
        played: s.played,
        remainingXpts: Math.round(remainingXpts[t.id] * 10) / 10,
        projected: Math.round(s.pts + remainingXpts[t.id]),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.projected - a.projected);
}

// Tüm OYNANMIŞ gerçek maçlarda ev sahibi galibiyeti / beraberlik / deplasman
// galibiyeti sayısı ve yüzdesi -- "ev sahibi avantajı gerçekten var mı"
// sorusuna gerçek sonuçlardan cevap.
export function getResultDistribution(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  let home = 0;
  let draw = 0;
  let away = 0;
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      if (real.homeGoals > real.awayGoals) home++;
      else if (real.homeGoals < real.awayGoals) away++;
      else draw++;
    }
  }
  const total = home + draw + away;
  if (total === 0) return [];
  return [
    { key: "home", label: "İç Saha Galibiyeti", count: home, pct: Math.round((home / total) * 100) },
    { key: "draw", label: "Beraberlik", count: draw, pct: Math.round((draw / total) * 100) },
    { key: "away", label: "Deplasman Galibiyeti", count: away, pct: Math.round((away / total) * 100) },
  ];
}

// Her takımın maç başına attığı/yediği gol ortalamasını döner (bir hücum-
// savunma "matris"i / scatter grafiği için) -- sağ-alt kadran (çok atan, az
// yiyen) güçlü takımları, sol-üst kadran (az atan, çok yiyen) zayıf takımları
// işaret eder. Sadece gerçek, oynanmış maçlardan.
export function getAttackDefenseMatrix(competitionKey) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const stats = {};
  for (const t of competition.teams) stats[t.id] = { played: 0, gf: 0, ga: 0 };
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      stats[m.homeTeam.id].played++;
      stats[m.homeTeam.id].gf += real.homeGoals;
      stats[m.homeTeam.id].ga += real.awayGoals;
      stats[m.awayTeam.id].played++;
      stats[m.awayTeam.id].gf += real.awayGoals;
      stats[m.awayTeam.id].ga += real.homeGoals;
    }
  }
  return competition.teams
    .map((t) => {
      const s = stats[t.id];
      if (!s || s.played === 0) return null;
      return {
        teamId: t.id,
        team: t,
        short: t.short,
        played: s.played,
        gfPerGame: Number((s.gf / s.played).toFixed(2)),
        gaPerGame: Number((s.ga / s.played).toFixed(2)),
      };
    })
    .filter(Boolean);
}

// En çok gol atılan gerçek maçlar (toplam gol sırasına göre) -- "🎉 En Golcü
// Maçlar" listesi için. Sadece gerçek, oynanmış maçlardan.
export function getHighestScoringMatches(competitionKey, limit = 5) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const rows = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      rows.push({
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeGoals: real.homeGoals,
        awayGoals: real.awayGoals,
        totalGoals: real.homeGoals + real.awayGoals,
        date: m.date,
        matchdayLabel: md.label,
      });
    }
  }
  return rows.sort((a, b) => b.totalGoals - a.totalGoals).slice(0, limit);
}

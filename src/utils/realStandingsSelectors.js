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
  samplePoisson,
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
import { CURRENT_INJURIES } from "../data/injuries.js";
import { TOP_SCORERS } from "../data/topScorers.js";
import { SUPER_LIG_MATCH_STATS } from "../data/matchStatsSuperLig.js";
import { UCL_MATCH_STATS } from "../data/matchStatsUcl.js";

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
  // NOT: getUclLeaguePhaseStandings() bir `started` alanı döner ama bu
  // fonksiyon eskiden dönmüyordu -- bu yüzden HomePage.jsx'teki
  // RealCompetitionCard (ve CompetitionAnalyticsPreview) `started` her zaman
  // undefined/falsy olduğu için Süper Lig'de GERÇEKTE haftalarca maç
  // oynanmış olsa bile SÜREKLİ "sezona hazır, ilk maçlar yakında" yazan
  // placeholder'ı gösteriyordu. Düzeltildi.
  const started = standings.some((s) => s.played > 0);
  return { standings, started, asOf: SUPER_LIG_LIVE_ASOF, fixture: getRealFixture("superlig") };
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

// Bir maçın possession/şut/korner/kart/gol-atıcı istatistiklerini (varsa)
// döner -- şu an sadece Süper Lig 6. Hafta (sr6m0..sr6m8) ve UCL 1. Hafta
// (r1m0..r1m17) için doldurulmuş (bkz. src/data/matchStatsSuperLig.js /
// matchStatsUcl.js -- her ikisi de gerçek, çapraz doğrulanmış veri;
// doğrulanamayan alanlar tamamen atlanmıştır, ASLA UYDURULMAMIŞTIR). Diğer
// tüm maçlar için null döner -- arayüz bu durumda bölümü hiç göstermemeli.
export function getMatchStats(matchId) {
  return SUPER_LIG_MATCH_STATS[matchId] || UCL_MATCH_STATS[matchId] || null;
}

// Aşağıdaki 5 seçici (getGoalTimingDistribution, getComebackAndBlownLeads,
// getXgPerformance, getDisciplineRanking, getPenaltyStats) HEPSİ SADECE
// matchStatsSuperLig.js/matchStatsUcl.js'te detaylı istatistiği (gol
// dakikaları, xG, faul/kart) OLAN maçlardan hesaplanır -- şu an bu SADECE
// Süper Lig 6. Hafta ve UCL 1. Hafta demek (bkz. getMatchStats'in başındaki
// not). Yani örneklem KÜÇÜK ve BÜYÜYECEK (yeni haftalar eklendikçe bu
// fonksiyonlar otomatik daha fazla maçı kapsayacak, kod değişmeyecek) --
// arayüz bunu her zaman "şu ana kadar detaylı verisi olan N maçtan" gibi
// dürüst bir örneklem notuyla göstermeli, sanki tüm sezonun istatistiğiymiş
// gibi SUNMAMALI.
function matchStatsForCompetition(competitionKey) {
  if (competitionKey === "superlig") return SUPER_LIG_MATCH_STATS;
  if (competitionKey === "ucl") return UCL_MATCH_STATS;
  return {};
}

const GOAL_TIME_BANDS = [
  { key: "0-15", label: "0-15’", test: (m) => m <= 15 },
  { key: "16-30", label: "16-30’", test: (m) => m > 15 && m <= 30 },
  { key: "31-45", label: "31-45’(+)", test: (m) => m > 30 && m <= 45 },
  { key: "46-60", label: "46-60’", test: (m) => m > 45 && m <= 60 },
  { key: "61-75", label: "61-75’", test: (m) => m > 60 && m <= 75 },
  { key: "76-90", label: "76-90’(+)", test: (m) => m > 75 },
];

// Gollerin maç içinde HANGİ dakika aralığında yoğunlaştığını gösterir --
// detaylı gol-dakikası verisi olan TÜM maçlardaki (bkz. yukarıdaki genel
// not) her gol, dakikasına göre 6 dakika aralığından birine sayılır.
export function getGoalTimingDistribution(competitionKey) {
  const matchStats = matchStatsForCompetition(competitionKey);
  const bands = GOAL_TIME_BANDS.map((b) => ({ key: b.key, label: b.label, count: 0 }));
  let total = 0;
  let matchCount = 0;
  for (const stats of Object.values(matchStats)) {
    if (!stats.scorers || stats.scorers.length === 0) continue;
    matchCount++;
    for (const s of stats.scorers) {
      const bandIdx = GOAL_TIME_BANDS.findIndex((b) => b.test(s.minute));
      if (bandIdx === -1) continue;
      bands[bandIdx].count++;
      total++;
    }
  }
  return { bands: bands.map((b) => ({ ...b, pct: total > 0 ? Math.round((b.count / total) * 1000) / 10 : 0 })), total, matchCount };
}

// Detaylı gol-dakikası verisi olan maçlarda "geriden gelip KAZANMA" (maçın
// bir anında geride olup sonunda kazanan) ve "elden kaçırma" (maçın bir
// anında önde olup sonunda kazanamayan -- beraberlik ya da mağlubiyet)
// olaylarını listeler. Kendi kale golleri de skor sayımına dahildir (hangi
// takımın LEHİNE olduğuna göre) çünkü asıl önemli olan skor tablosu, golü
// kimin attığı değil.
export function getComebackAndBlownLeads(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const matchStats = matchStatsForCompetition(competitionKey);
  const events = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      const stats = matchStats[m.id];
      if (!stats?.scorers || stats.scorers.length === 0) continue;
      const real = getRealMatchResult(competitionKey, m);
      if (!real) continue;
      const timeline = [...stats.scorers].sort((a, b) => a.minute - b.minute);
      let home = 0;
      let away = 0;
      let homeEverLed = false;
      let awayEverLed = false;
      let homeEverTrailed = false;
      let awayEverTrailed = false;
      for (const g of timeline) {
        if (g.teamId === m.homeTeam.id) home++;
        else if (g.teamId === m.awayTeam.id) away++;
        else continue;
        if (home > away) {
          homeEverLed = true;
          awayEverTrailed = true;
        } else if (away > home) {
          awayEverLed = true;
          homeEverTrailed = true;
        }
      }
      const finalHomeWin = real.homeGoals > real.awayGoals;
      const finalAwayWin = real.awayGoals > real.homeGoals;
      const meta = { matchId: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, homeGoals: real.homeGoals, awayGoals: real.awayGoals, date: m.date };
      if (finalHomeWin && homeEverTrailed) events.push({ type: "comeback", teamId: m.homeTeam.id, team: m.homeTeam, ...meta });
      if (finalAwayWin && awayEverTrailed) events.push({ type: "comeback", teamId: m.awayTeam.id, team: m.awayTeam, ...meta });
      if (!finalHomeWin && homeEverLed) events.push({ type: "blown", teamId: m.homeTeam.id, team: m.homeTeam, ...meta });
      if (!finalAwayWin && awayEverLed) events.push({ type: "blown", teamId: m.awayTeam.id, team: m.awayTeam, ...meta });
    }
  }
  return events;
}

// "Şanslı mı şanssız mı?" -- takımın GERÇEK attığı/yediği gol sayısı, o
// maçlar için elimizdeki xG (beklenen gol) değerinden ne kadar sapıyor.
// luck > 0: takım şanslı/klinik (xG'sinden FAZLA gol atıyor ya da xG'sinden
// AZ gol yiyor gibi okunabilir -- burada sadece hücum tarafı, "attığı gol -
// kendi xG'si" hesaplanır). SADECE xG verisi olan maçlar sayılır.
export function getXgPerformance(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const competition = getCompetition(competitionKey);
  const matchStats = matchStatsForCompetition(competitionKey);
  const agg = {};
  for (const md of fixture) {
    for (const m of md.matches) {
      const stats = matchStats[m.id];
      const real = getRealMatchResult(competitionKey, m);
      if (!stats?.xg || !real) continue;
      const hId = m.homeTeam.id;
      const aId = m.awayTeam.id;
      if (!agg[hId]) agg[hId] = { gf: 0, xgFor: 0, ga: 0, xgAgainst: 0, matches: 0 };
      if (!agg[aId]) agg[aId] = { gf: 0, xgFor: 0, ga: 0, xgAgainst: 0, matches: 0 };
      agg[hId].gf += real.homeGoals;
      agg[hId].xgFor += stats.xg.home;
      agg[hId].ga += real.awayGoals;
      agg[hId].xgAgainst += stats.xg.away;
      agg[hId].matches++;
      agg[aId].gf += real.awayGoals;
      agg[aId].xgFor += stats.xg.away;
      agg[aId].ga += real.homeGoals;
      agg[aId].xgAgainst += stats.xg.home;
      agg[aId].matches++;
    }
  }
  return Object.entries(agg)
    .map(([teamId, a]) => {
      const team = competition.teams.find((t) => t.id === teamId);
      if (!team) return null;
      return {
        teamId,
        team,
        matches: a.matches,
        gf: a.gf,
        xgFor: Math.round(a.xgFor * 10) / 10,
        ga: a.ga,
        xgAgainst: Math.round(a.xgAgainst * 10) / 10,
        luck: Math.round((a.gf - a.xgFor) * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.luck - a.luck);
}

// Faul + sarı/kırmızı kart verisi olan maçlardan bir "disiplin skoru"
// (düşük = daha disiplinli): sarı=1, kırmızı=3, faul=0.1 ağırlıklı toplam.
export function getDisciplineRanking(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const competition = getCompetition(competitionKey);
  const matchStats = matchStatsForCompetition(competitionKey);
  const agg = {};
  for (const md of fixture) {
    for (const m of md.matches) {
      const stats = matchStats[m.id];
      if (!stats || (!stats.fouls && !stats.cards)) continue;
      const hId = m.homeTeam.id;
      const aId = m.awayTeam.id;
      if (!agg[hId]) agg[hId] = { fouls: 0, yellow: 0, red: 0, matches: 0 };
      if (!agg[aId]) agg[aId] = { fouls: 0, yellow: 0, red: 0, matches: 0 };
      if (stats.fouls) {
        agg[hId].fouls += stats.fouls.home;
        agg[aId].fouls += stats.fouls.away;
      }
      if (stats.cards) {
        agg[hId].yellow += stats.cards.home.yellow;
        agg[hId].red += stats.cards.home.red;
        agg[aId].yellow += stats.cards.away.yellow;
        agg[aId].red += stats.cards.away.red;
      }
      agg[hId].matches++;
      agg[aId].matches++;
    }
  }
  return Object.entries(agg)
    .map(([teamId, a]) => {
      const team = competition.teams.find((t) => t.id === teamId);
      if (!team) return null;
      return {
        teamId,
        team,
        matches: a.matches,
        fouls: a.fouls,
        yellow: a.yellow,
        red: a.red,
        disciplineScore: Math.round((a.yellow * 1 + a.red * 3 + a.fouls * 0.1) * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.disciplineScore - b.disciplineScore);
}

// Detaylı gol verisi olan maçlarda penaltıdan atılan/yenen gol sayısı --
// scorer.penalty===true olan girişlerden (bkz. matchStatsSuperLig.js/
// matchStatsUcl.js).
export function getPenaltyStats(competitionKey) {
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return [];
  const competition = getCompetition(competitionKey);
  const matchStats = matchStatsForCompetition(competitionKey);
  const agg = {};
  for (const md of fixture) {
    for (const m of md.matches) {
      const stats = matchStats[m.id];
      if (!stats?.scorers) continue;
      for (const s of stats.scorers) {
        if (!s.penalty) continue;
        const scoringTeamId = s.teamId;
        const concedingTeamId = scoringTeamId === m.homeTeam.id ? m.awayTeam.id : m.homeTeam.id;
        if (!agg[scoringTeamId]) agg[scoringTeamId] = { scored: 0, conceded: 0 };
        if (!agg[concedingTeamId]) agg[concedingTeamId] = { scored: 0, conceded: 0 };
        agg[scoringTeamId].scored++;
        agg[concedingTeamId].conceded++;
      }
    }
  }
  return Object.entries(agg)
    .map(([teamId, a]) => {
      const team = competition.teams.find((t) => t.id === teamId);
      if (!team) return null;
      return { teamId, team, scored: a.scored, conceded: a.conceded, net: a.scored - a.conceded };
    })
    .filter(Boolean)
    .sort((a, b) => b.net - a.net);
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

// İki takımın gerçek ikili geçmişinden (varsa) MEVCUT maçın ev/deplasman
// yönüne göre yeniden yönlendirilmiş zengin istatistikler çıkarır --
// HEAD_TO_HEAD'teki "summary" alanı sadece alfabetik id sırasına göre
// kazanma sayısı tutar (yöne bağlı değil); bu fonksiyon ise "homeTeam"
// (bu spesifik maçtaki ev sahibi) açısından galibiyet/gol/BTTS/2.5 üstü
// istatistiklerini `meetings` dizisindeki her karşılaşmayı takım ADINA göre
// yeniden eşleyerek hesaplar. h2h verisi yoksa null döner -- ARAYÜZ BUNU
// ASLA UYDURMA BİR İSTATİSTİKLE DOLDURMAMALI.
export function getHeadToHeadStats(homeTeam, awayTeam) {
  const h2h = getHeadToHead(homeTeam.id, awayTeam.id);
  if (!h2h || !h2h.meetings?.length) return null;
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let homeGoals = 0;
  let awayGoals = 0;
  let btts = 0;
  let over25 = 0;
  for (const m of h2h.meetings) {
    const homeTeamWasFirst = m.homeTeam === homeTeam.name;
    const homeSideGoals = homeTeamWasFirst ? m.homeGoals : m.awayGoals;
    const awaySideGoals = homeTeamWasFirst ? m.awayGoals : m.homeGoals;
    homeGoals += homeSideGoals;
    awayGoals += awaySideGoals;
    if (homeSideGoals > awaySideGoals) homeWins++;
    else if (homeSideGoals < awaySideGoals) awayWins++;
    else draws++;
    if (homeSideGoals > 0 && awaySideGoals > 0) btts++;
    if (homeSideGoals + awaySideGoals > 2.5) over25++;
  }
  const played = h2h.meetings.length;
  return {
    played,
    homeWins,
    draws,
    awayWins,
    homeGoals,
    awayGoals,
    avgGoals: Math.round(((homeGoals + awayGoals) / played) * 100) / 100,
    bttsPct: Math.round((btts / played) * 100),
    over25Pct: Math.round((over25 / played) * 100),
    homeWinPct: Math.round((homeWins / played) * 100),
    drawPct: Math.round((draws / played) * 100),
    awayWinPct: Math.round((awayWins / played) * 100),
  };
}

// Model tahminini (kadro/katsayı gücüne dayalı, bkz. getMatchWinProbability)
// VE ikili geçmiş istatistiğini (varsa, bkz. getHeadToHeadStats) ORTALAYARAK
// tek bir "birleşik" maç olasılığı üretir. Çok az sayıda (1) karşılaşmalık
// bir geçmiş, %100/%0 gibi aşırı/gürültülü bir orana sahip olabileceğinden
// (tek bir maçın sonucu), en az 2 karşılaşma şartı aranır -- aksi halde
// (ya da hiç geçmiş yoksa) sadece model tahminine dönülür, uydurma bir
// ortalama YAPILMAZ.
export function getCombinedMatchPrediction(homeTeam, awayTeam, competition) {
  const model = getMatchWinProbability(homeTeam, awayTeam, competition);
  const h2hStats = getHeadToHeadStats(homeTeam, awayTeam);
  if (!h2hStats || h2hStats.played < 2) {
    return { home: model.homeWinProb, draw: model.drawProb, away: model.awayWinProb, usedH2H: false, h2hStats, model };
  }
  return {
    home: (model.homeWinProb + h2hStats.homeWinPct / 100) / 2,
    draw: (model.drawProb + h2hStats.drawPct / 100) / 2,
    away: (model.awayWinProb + h2hStats.awayWinPct / 100) / 2,
    usedH2H: true,
    h2hStats,
    model,
  };
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

// "Bu takım şampiyon olur mu?" sorusuna GERÇEK bir olasılık yüzdesiyle cevap
// -- getSeasonEndProjection'ın aksine (tek bir "beklenen puan" sayısı) burada
// kalan fikstürün TAMAMI defalarca (varsayılan 300 kez) Poisson tabanlı
// Monte Carlo ile simüle edilir (ŞU ANA KADAR GERÇEKTEN toplanan puan/averaj
// + kalan her maç için modelin lambdaHome/lambdaAway'inden örneklenen bir
// skor), her simülasyonun sonunda puan (sonra averaj) sıralamasıyla 1. olan
// takım belirlenir, ve bir takımın kaç simülasyonda 1. bitirdiğinin yüzdesi
// döner. UCL'de "lig fazını 1. bitirmek" ASLA turnuvanın kendisini kazanmak
// anlamına gelmez (eleme turları var) -- bu yüzden çağıran taraf (bkz.
// RealAnalysisTab.jsx) competitionKey'e göre etiketi/açıklamayı değiştirmeli,
// bu fonksiyon sadece "lig fazı 1.liği" olasılığını hesaplar.
//
// ÖNEMLİ dürüstlük notu: az sayıdaki deneme yüzünden küçük bir ihtimali
// (ör. gerçekte %0.3 olan bir şeyi) 300 denemede hiç YAKALAMAMIŞ olabiliriz
// -- bu yüzden "%0" asla "imkansız" diye sunulmamalı, sadece "bu kadar
// denemede hiç gözlenmedi" demektir (bkz. UI'daki footnote).
// Ortak Monte Carlo çekirdeği -- getTitleOdds VE getRootingGuide (bkz. altta)
// TARAFINDAN paylaşılır. `overrides`: { [matchId]: {homeGoals,awayGoals} }
// verilirse, o maç RASTGELE simüle edilmez, doğrudan verilen skorla
// baseline'a işlenir -- "ya şu maç şöyle biterse?" senaryolarını (bkz.
// getRootingGuide) ucuza hesaplamak için (aynı motor, tek bir maç sabitlenmiş).
function simulateTitleOddsInternal(competitionKey, trials, overrides) {
  const competition = getCompetition(competitionKey);
  const fixture = getRealFixture(competitionKey);
  const { standings } = getRealStandings(competitionKey);
  if (!fixture || !standings || standings.length === 0) return null;

  const enrichedById = enrichedTeamMap(competition);
  const baseline = {};
  for (const row of standings) baseline[row.teamId] = { pts: row.pts, gf: row.gf, ga: row.ga };

  const remainingMatches = [];
  for (const md of fixture) {
    for (const m of md.matches) {
      if (getRealMatchResult(competitionKey, m)) continue;
      const forced = overrides?.[m.id];
      if (forced) {
        const hs = baseline[m.homeTeam.id];
        const as_ = baseline[m.awayTeam.id];
        if (hs && as_) {
          hs.gf += forced.homeGoals;
          hs.ga += forced.awayGoals;
          as_.gf += forced.awayGoals;
          as_.ga += forced.homeGoals;
          if (forced.homeGoals > forced.awayGoals) hs.pts += 3;
          else if (forced.homeGoals < forced.awayGoals) as_.pts += 3;
          else {
            hs.pts += 1;
            as_.pts += 1;
          }
        }
        continue;
      }
      remainingMatches.push(m);
    }
  }

  const titleCounts = {};
  const relegationCounts = {};
  const europeCounts = {};
  for (const row of standings) {
    titleCounts[row.teamId] = 0;
    relegationCounts[row.teamId] = 0;
    europeCounts[row.teamId] = 0;
  }
  const zones = competition.zones;

  for (let t = 0; t < trials; t++) {
    const state = {};
    for (const teamId in baseline) state[teamId] = { ...baseline[teamId] };
    for (const m of remainingMatches) {
      const home = enrichedById[m.homeTeam.id];
      const away = enrichedById[m.awayTeam.id];
      if (!home || !away || !state[home.id] || !state[away.id]) continue;
      const { lambdaHome, lambdaAway } = expectedGoals(home, away);
      const hg = samplePoisson(lambdaHome);
      const ag = samplePoisson(lambdaAway);
      state[home.id].gf += hg;
      state[home.id].ga += ag;
      state[away.id].gf += ag;
      state[away.id].ga += hg;
      if (hg > ag) state[home.id].pts += 3;
      else if (hg < ag) state[away.id].pts += 3;
      else {
        state[home.id].pts += 1;
        state[away.id].pts += 1;
      }
    }
    // Bu denemenin TAM sıralaması -- sadece 1.yi değil, her takımın bölgesini
    // (şampiyon/Avrupa/orta sıra/küme düşme) belirlemek için gerekli (bkz.
    // getRootingGuide -- şampiyonluk şansı olmayan bir takım için "kimi
    // tutmalısın" sorusu küme düşme kurtuluşu ya da Avrupa hattı üzerinden
    // sorulur).
    const ranked = Object.entries(state)
      .map(([teamId, s]) => ({ teamId, pts: s.pts, gd: s.gf - s.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd);
    ranked.forEach((r, i) => {
      const rank = i + 1;
      if (rank === 1) titleCounts[r.teamId]++;
      if (zones) {
        const zone = resolveZone(zones, rank);
        if (zone.key === "relegation") relegationCounts[r.teamId]++;
        else if (zone.key === "ucl" || zone.key === "europa") europeCounts[r.teamId]++;
      }
    });
  }

  return standings
    .map((row) => ({
      teamId: row.teamId,
      team: competition.teams.find((t) => t.id === row.teamId),
      pts: row.pts,
      titlePct: Math.round((titleCounts[row.teamId] / trials) * 1000) / 10,
      survivalPct: Math.round((1 - relegationCounts[row.teamId] / trials) * 1000) / 10,
      europePct: Math.round((europeCounts[row.teamId] / trials) * 1000) / 10,
    }))
    .filter((row) => row.team)
    .sort((a, b) => b.titlePct - a.titlePct);
}

export function getTitleOdds(competitionKey, trials = 300) {
  return simulateTitleOddsInternal(competitionKey, trials, null) || [];
}

// "Bu Hafta Kimi Tutmalısın?" -- HİÇBİR sitede olmayan, tuttuğun takıma özel
// bir bölüm: bu haftaki DİĞER maçların (tuttuğun takımın kendi maçı hariç)
// her biri için "ev sahibi kazanırsa" ve "deplasman kazanırsa" senaryolarını
// AYNI Monte Carlo motoruyla (o TEK maç sabitlenmiş, geri kalanı yine
// rastgele) yeniden simüle edip, hangi sonucun tuttuğun takımın şampiyonluk
// ihtimalini NE KADAR değiştirdiğini hesaplar -- en çok etkileyen maç en
// üstte. Varsayımsal skorlar (1-0/0-1) sadece "kim kazandı" farkını temsil
// eder, gerçek bir tahmin değildir. favoriteTeamId yoksa ya da bu hafta
// başka maç yoksa null döner.
export function getRootingGuide(competitionKey, favoriteTeamId, trials = 200) {
  if (!favoriteTeamId) return null;
  const fixture = getRealFixture(competitionKey);
  if (!fixture) return null;
  const { standings } = getRealStandings(competitionKey);
  const favRow = standings?.find((r) => r.teamId === favoriteTeamId);
  if (!favRow) return null;

  const md = fixture.find((md) => md.matches.some((m) => !getRealMatchResult(competitionKey, m)));
  if (!md) return null;
  const favMatch = md.matches.find((m) => m.homeTeam.id === favoriteTeamId || m.awayTeam.id === favoriteTeamId);
  const otherMatches = md.matches.filter((m) => m.id !== favMatch?.id && !getRealMatchResult(competitionKey, m));
  if (otherMatches.length === 0) return null;

  // Hangi metrik bu takım için GERÇEKTEN anlamlı: küme düşme hattındaysa
  // "kurtulma" ihtimali, şampiyonluk/UCL bölgesindeyse şampiyonluk ihtimali,
  // aksi halde (orta sıra/Avrupa Ligi hattı) Avrupa kupalarına kalma
  // ihtimali. Böylece HER takım için (sadece zirvedekiler için değil)
  // anlamlı bir "kimi tutmalısın" sorusu üretilir.
  const zoneKey = favRow.status;
  const metric = zoneKey === "relegation" ? "survivalPct" : zoneKey === "champion" || zoneKey === "ucl" ? "titlePct" : "europePct";
  const metricLabel =
    metric === "survivalPct" ? "küme düşmeme ihtimali" : metric === "titlePct" ? "şampiyonluk ihtimali" : "Avrupa kupalarına kalma ihtimali";

  const baseline = simulateTitleOddsInternal(competitionKey, trials, null);
  if (!baseline) return null;
  const baselinePct = baseline.find((r) => r.teamId === favoriteTeamId)?.[metric] ?? 0;
  // Bu metrik zaten pratikte kesinleşmişse (neredeyse %0 ya da %100) senaryo
  // analizinin bir kıymeti yok -- göstermeye değer bir şey yok.
  if (baselinePct < 0.1 || baselinePct > 99.9) return null;

  const rows = otherMatches
    .map((m) => {
      const homeWinSim = simulateTitleOddsInternal(competitionKey, trials, { [m.id]: { homeGoals: 1, awayGoals: 0 } });
      const awayWinSim = simulateTitleOddsInternal(competitionKey, trials, { [m.id]: { homeGoals: 0, awayGoals: 1 } });
      const homeWinPct = homeWinSim?.find((r) => r.teamId === favoriteTeamId)?.[metric] ?? 0;
      const awayWinPct = awayWinSim?.find((r) => r.teamId === favoriteTeamId)?.[metric] ?? 0;
      return {
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        date: m.date,
        homeWinPct,
        awayWinPct,
        rootFor: homeWinPct >= awayWinPct ? "home" : "away",
        impact: Math.round(Math.abs(homeWinPct - awayWinPct) * 10) / 10,
      };
    })
    .filter((r) => r.impact > 0)
    .sort((a, b) => b.impact - a.impact);

  if (rows.length === 0) return null;
  return { matchdayLabel: md.label, favMatch, baselinePct, metric, metricLabel, rows };
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
  const rows = competition.teams
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

  // Sezon başında az maç oynanmışken birden fazla takım TAM AYNI (gf, ga)
  // çiftine düşebiliyor (ör. hepsi "1.00 / 1.00") -- bu durumda scatter
  // grafikte amblemleri tam üst üste binerdi. Veriyi UYDURMADAN, sadece
  // görsel çakışmayı önlemek için aynı noktaya düşen takımları küçük bir
  // daire üzerinde hafifçe ayırıyoruz (gerçek gf/ga'dan sapma en fazla
  // ±0.06 -- ihmal edilebilir, sadece okunurluk için).
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.gfPerGame}|${r.gaPerGame}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const JITTER_RADIUS = 0.06;
  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    group.forEach((r, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      r.gfPerGame = Math.round((r.gfPerGame + Math.cos(angle) * JITTER_RADIUS) * 100) / 100;
      r.gaPerGame = Math.round((r.gaPerGame + Math.sin(angle) * JITTER_RADIUS) * 100) / 100;
    });
  }

  return rows;
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

// Her takımın kadrosundaki oyuncuların ORTALAMA reytingi (players.js/
// superLigPlayers.js'teki gerçek, araştırılmış kadro reytinglerinden) --
// enrichTeamsWithAttackDefense'teki attackRatio/defenseRatio'nun aksine
// (o ikisi bir takımın KENDİ ortalamasına göre RÖLATİF hücum/savunma
// eğilimini ölçer, mutlak güç DEĞİL) bu, takımlar ARASI mutlak bir kadro
// gücü karşılaştırması sağlar -- "İstatistikler" sayfasında henüz kendi
// başına bir analiz olarak gösterilmeyen bir veri kesiti.
export function getSquadRatingRanking(competitionKey) {
  const competition = getCompetition(competitionKey);
  return competition.teams
    .map((t) => {
      const players = competition.getPlayersByTeam(t.id) || [];
      if (players.length === 0) return null;
      const avgRating = players.reduce((sum, p) => sum + (p.rating || 0), 0) / players.length;
      return { teamId: t.id, team: t, avgRating: Math.round(avgRating * 10) / 10, playerCount: players.length };
    })
    .filter(Boolean)
    .sort((a, b) => b.avgRating - a.avgRating);
}

// Her takımın GÜNCEL (bkz. src/data/injuries.js -- statik ama tarihli bir
// anlık görüntü) sakat/cezalı oyuncu SAYISI -- "İstatistikler" sayfasında
// daha önce hiç kullanılmayan bir veri seti (injuries.js şimdiye kadar
// sadece ProbableLineup.jsx'te TEK bir takımın olası kadrosunu filtrelemek
// için kullanılıyordu). Sadece bu yarışmanın takımlarına ait kayıtlar
// sayılır; hiç sakatı olmayan takımlar listede yer almaz.
export function getInjuryCountsByTeam(competitionKey) {
  const competition = getCompetition(competitionKey);
  const teamIds = new Set(competition.teams.map((t) => t.id));
  const counts = {};
  for (const inj of CURRENT_INJURIES) {
    if (!teamIds.has(inj.teamId)) continue;
    counts[inj.teamId] = (counts[inj.teamId] || 0) + 1;
  }
  return competition.teams
    .filter((t) => counts[t.id] > 0)
    .map((t) => ({ teamId: t.id, team: t, count: counts[t.id] }))
    .sort((a, b) => b.count - a.count);
}

// "Güç Endeksi" -- kullanıcı isteği: "başka sitelerde bulamayacakları" bir
// analiz. Diğer sitelerin ayrı ayrı gösterdiği üç gerçek veri kesitini
// (kadro reytingi + o AN sakat/cezalı olduğu için oynayamayacak oyuncular +
// son 5 maçlık form) TEK bir 0-100 endekste birleştirir -- "kağıt üzerinde
// güçlü ama şu an yıldız oyuncuları sahada olmayan" bir takımın gerçek
// GÜNCEL gücünü, ham kadro reytinginden daha doğru yansıtır. RESMİ bir
// istatistik DEĞİLDİR -- sitenin kendi normalize modelidir, öyle etiketlenir
// (bkz. RealAnalysisTab.jsx'teki footnote).
//
// Formül (kasıtlı olarak basit ve AÇIKLANABİLİR tutuldu -- "kara kutu" bir
// puan olmasın diye):
//   baseRating   = kadronun ortalama reytingi (0-100)
//   missingImpact = o an sakat/cezalı (bkz. injuries.js) olan, takım
//                   ortalamasının ÜSTÜNDE reytingli oyuncuların (ortalamanın
//                   üstündeki kısmının kadro büyüklüğüne bölünmüş toplamı) --
//                   yıldız bir oyuncuyu kaybetmek, yedek bir oyuncuyu
//                   kaybetmekten daha çok puan kırar (ortalama altındakiler
//                   hiç puan kırmaz, negatif "bonus" olmasın diye).
//   formAdjustment = son 5 maçlık form puanının (bkz. getTeamRadarProfile'daki
//                    aynı hesap) %50'den sapması × 0.1 -- iyi form küçük bir
//                    artı, kötü form küçük bir eksi (±5 puana kadar).
//   powerIndex = baseRating - missingImpact + formAdjustment (0-100'e sıkıştırılır)
export function getPowerIndex(competitionKey) {
  const competition = getCompetition(competitionKey);
  return competition.teams
    .map((t) => {
      const players = competition.getPlayersByTeam(t.id) || [];
      if (players.length === 0) return null;
      const baseRating = players.reduce((sum, p) => sum + (p.rating || 0), 0) / players.length;

      const unavailable = CURRENT_INJURIES.filter((inj) => inj.teamId === t.id);
      const unavailablePlayers = unavailable
        .map((inj) => players.find((p) => p.name === inj.playerName))
        .filter(Boolean);
      const missingImpact =
        unavailablePlayers.reduce((sum, p) => sum + Math.max(0, (p.rating || 0) - baseRating), 0) /
        Math.max(players.length, 1);

      const formArr = competitionKey === "superlig" ? getSuperLigTeamForm(t.name) : getDomesticForm(t.id)?.form;
      const formPct =
        formArr && formArr.length > 0
          ? (formArr.reduce((sum, r) => sum + (r === "W" ? 3 : r === "D" ? 1 : 0), 0) / (formArr.length * 3)) * 100
          : null;
      const formAdjustment = formPct == null ? 0 : (formPct - 50) * 0.1;

      const powerIndex = Math.max(0, Math.min(100, baseRating - missingImpact + formAdjustment));
      return {
        teamId: t.id,
        team: t,
        baseRating: Math.round(baseRating * 10) / 10,
        missingImpact: Math.round(missingImpact * 10) / 10,
        formAdjustment: Math.round(formAdjustment * 10) / 10,
        unavailableCount: unavailable.length,
        powerIndex: Math.round(powerIndex * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.powerIndex - a.powerIndex);
}

// "Kilit Oyuncu Bağımlılığı" -- kullanıcı isteği: "başka sitelerde
// bulamayacakları" bir analiz daha. Takımın topScorers.js'teki (gerçek,
// doğrulanmış) EN GOLCÜ oyuncusunun, takımın puan durumundaki TOPLAM gol
// sayısına oranı -- "bu oyuncu sakatlanırsa/cezalı olursa takım ne kadar
// zora girer" sorusuna doğrudan cevap. Sadece o takımın topScorers.js'te
// GERÇEKTEN kayıtlı bir golcüsü VARSA hesaplanır (uydurma yok); takımın
// puan durumundaki GF'i 0 ya da hiç golcü kaydı yoksa listeye girmez.
export function getGoalDependency(competitionKey) {
  const competition = getCompetition(competitionKey);
  const { standings } = getRealStandings(competitionKey);
  if (!standings) return [];
  const gfByTeam = Object.fromEntries(standings.map((s) => [s.teamId, s.gf]));
  const scorersByTeam = {};
  for (const s of TOP_SCORERS) {
    if (s.competitionKey !== competitionKey) continue;
    if (!scorersByTeam[s.teamId]) scorersByTeam[s.teamId] = [];
    scorersByTeam[s.teamId].push(s);
  }
  return competition.teams
    .map((t) => {
      const teamGf = gfByTeam[t.id];
      const scorers = scorersByTeam[t.id];
      if (!teamGf || !scorers || scorers.length === 0) return null;
      const topScorer = [...scorers].sort((a, b) => b.goals - a.goals)[0];
      const dependencyPct = Math.min(100, Math.round((topScorer.goals / teamGf) * 100));
      return {
        teamId: t.id,
        team: t,
        playerName: topScorer.playerName,
        playerGoals: topScorer.goals,
        teamGoals: teamGf,
        dependencyPct,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.dependencyPct - a.dependencyPct);
}

// "Zirveye/Düşme Hattına Mesafe" -- kullanıcı isteği: puan durumundaki
// bölge rozetleri (ör. "Avrupa Ligi", "Küme Düşme Hattı") sadece HANGİ
// bölgede olunduğunu söylüyor, NE KADAR yakın/güvende olunduğunu
// söylemiyordu. Bu, her takımın (a) bir ÜST bölgeye çıkmak için o bölgedeki
// EN SON sıradaki takıma kaç puan geride olduğunu, (b) bir ALT bölgeye
// düşmemek için o bölgenin İLK takımına kaç puan önde olduğunu hesaplar --
// ikisi de SADECE gerçek puan durumundan, uydurma yok. Takımın kendisi zaten
// en üst/en alt bölgedeyse ilgili mesafe null döner (çıkacak/düşecek bölge
// yok).
export function getZoneBoundaryDistance(competitionKey) {
  const competition = getCompetition(competitionKey);
  const { standings, started } = getRealStandings(competitionKey);
  if (!standings || !started) return [];
  const zones = competition.zones || [];
  const sorted = [...standings].sort((a, b) => a.rank - b.rank);
  const teamById = Object.fromEntries(competition.teams.map((t) => [t.id, t]));

  return sorted
    .map((row) => {
      const team = teamById[row.teamId];
      if (!team) return null;
      const zoneIndex = zones.findIndex((z) => row.rank <= z.max);
      const zone = zones[zoneIndex] || zones[zones.length - 1];
      const zoneAbove = zoneIndex > 0 ? zones[zoneIndex - 1] : null;
      const zoneBelow = zoneIndex < zones.length - 1 ? zones[zoneIndex + 1] : null;

      const climbTargetTeam = zoneAbove ? sorted[zoneAbove.max - 1] : null;
      const pointsToClimb = climbTargetTeam ? Math.max(0, climbTargetTeam.pts - row.pts) : null;

      const cushionTeam = zoneBelow ? sorted[zone.max] : null;
      const pointsCushion = cushionTeam ? Math.max(0, row.pts - cushionTeam.pts) : null;

      return {
        teamId: row.teamId,
        team,
        rank: row.rank,
        pts: row.pts,
        played: row.played,
        zoneLabel: zone.label,
        zoneTone: zone.tone,
        pointsToClimb,
        climbTargetZoneLabel: zoneAbove?.label ?? null,
        pointsCushion,
        cushionZoneLabel: zoneBelow?.label ?? null,
      };
    })
    .filter(Boolean);
}

// "Averaj Kırılganlığı" -- kullanıcı isteği: bir takımın sıradaki
// konumunun, TEK bir maçın sonucuyla ne kadar kolay değişebileceğini
// gösteren bir uyarı. Uydurma bir "hipotetik maç" simüle etmek yerine
// GERÇEK bir mekanizmaya dayanır: puan durumunda AYNI puana sahip iki
// komşu takımın averaj farkı küçükse (≤2 gol), o averaj sıralaması
// KIRILGANDIR -- büyük skorlu tek bir maç bu iki takımın sırasını
// değiştirebilir. Sadece gerçekten "kırılgan" (puanı eşit VE averaj farkı
// küçük komşusu olan) takımlar döner -- çoğu takım (özellikle sezon
// başında puanlar seyrekken) bu listede hiç görünmeyebilir, bu normaldir.
export function getGoalDifferenceFragility(competitionKey) {
  const { standings, started } = getRealStandings(competitionKey);
  if (!standings || !started) return [];
  const competition = getCompetition(competitionKey);
  const teamById = Object.fromEntries(competition.teams.map((t) => [t.id, t]));
  const sorted = [...standings].sort((a, b) => a.rank - b.rank);

  return sorted
    .map((row, i) => {
      const team = teamById[row.teamId];
      if (!team) return null;
      const above = i > 0 ? sorted[i - 1] : null;
      const below = i < sorted.length - 1 ? sorted[i + 1] : null;
      let gdGap = null;
      let rivalRow = null;
      let direction = null;
      if (above && above.pts === row.pts) {
        const gap = above.gd - row.gd;
        if (gdGap === null || gap < gdGap) {
          gdGap = gap;
          rivalRow = above;
          direction = "above";
        }
      }
      if (below && below.pts === row.pts) {
        const gap = row.gd - below.gd;
        if (gdGap === null || gap < gdGap) {
          gdGap = gap;
          rivalRow = below;
          direction = "below";
        }
      }
      if (gdGap == null || gdGap > 2) return null;
      return {
        teamId: row.teamId,
        team,
        rank: row.rank,
        pts: row.pts,
        gd: row.gd,
        gdGap,
        direction,
        rivalTeam: teamById[rivalRow.teamId],
        rivalGd: rivalRow.gd,
      };
    })
    .filter(Boolean)
    // Aynı çift (A-B) her iki taraftan da kırılgan çıkabilir (A'nın "aşağı"
    // komşusu B, B'nin "yukarı" komşusu A) -- listede aynı ilişkiyi İKİ KEZ
    // göstermemek için sadece rank'i daha düşük (üstteki) takımın satırı
    // tutulur.
    .filter((row) => row.rank < (row.rivalTeam ? sorted.find((s) => s.teamId === row.rivalTeam.id)?.rank ?? Infinity : Infinity));
}

// "Şampiyonluk Gerilimi Endeksi" -- ligin zirvesinin ne kadar SIKI olduğunu
// tek bir sayıya indirger: lider ile 2. sıradaki takımın puan farkı. Küçük
// fark = gergin bir zirve yarışı, büyük fark = rahat bir liderlik. SADECE
// gerçek puan durumundan; geçmiş sezonlarla kıyaslama YAPILMAZ (o veri
// yok) -- sadece BU sezonun şu anki durumu.
export function getTitleRaceTension(competitionKey) {
  const { standings, started } = getRealStandings(competitionKey);
  if (!standings || !started || standings.length < 2) return null;
  const sorted = [...standings].sort((a, b) => a.rank - b.rank);
  const leader = sorted[0];
  const second = sorted[1];
  const competition = getCompetition(competitionKey);
  const teamById = Object.fromEntries(competition.teams.map((t) => [t.id, t]));
  const gap = leader.pts - second.pts;
  return {
    leaderTeam: teamById[leader.teamId],
    leaderPts: leader.pts,
    secondTeam: teamById[second.teamId],
    secondPts: second.pts,
    gap,
    // 0-2 puan: çok gergin, 3-5: normal, 6+: rahat -- kaba, açıklanabilir bir eşik.
    tension: gap <= 2 ? "high" : gap <= 5 ? "medium" : "low",
  };
}

// "Zayıf Halka" -- her takımın kadrosunu mevkiye göre (GK/DF/MF/FW) gruplayıp
// ORTALAMA reytingini ligin o mevki için genel ortalamasıyla kıyaslar; en
// büyük NEGATİF sapmaya sahip mevki, o takımın "zayıf halkası" olarak
// döner. En az 2 oyunculu mevki grupları sayılır (tek oyunculu bir grup
// örneklem olarak çok küçük/güvenilmez olurdu).
export function getWeakestPositionGroup(competitionKey) {
  const competition = getCompetition(competitionKey);
  const POSITIONS = ["GK", "DF", "MF", "FW"];
  const leagueAvgByPos = {};
  for (const pos of POSITIONS) {
    const all = competition.teams.flatMap((t) => (competition.getPlayersByTeam(t.id) || []).filter((p) => p.position === pos));
    leagueAvgByPos[pos] = all.length > 0 ? all.reduce((s, p) => s + (p.rating || 0), 0) / all.length : null;
  }
  return competition.teams
    .map((t) => {
      const players = competition.getPlayersByTeam(t.id) || [];
      let weakest = null;
      for (const pos of POSITIONS) {
        const group = players.filter((p) => p.position === pos);
        if (group.length < 2 || leagueAvgByPos[pos] == null) continue;
        const avg = group.reduce((s, p) => s + (p.rating || 0), 0) / group.length;
        const deviation = avg - leagueAvgByPos[pos];
        if (!weakest || deviation < weakest.deviation) {
          weakest = { position: pos, avg: Math.round(avg * 10) / 10, leagueAvg: Math.round(leagueAvgByPos[pos] * 10) / 10, deviation: Math.round(deviation * 10) / 10 };
        }
      }
      if (!weakest || weakest.deviation >= 0) return null;
      return { teamId: t.id, team: t, ...weakest };
    })
    .filter(Boolean)
    .sort((a, b) => a.deviation - b.deviation);
}

// "Beklenen vs Gerçek Sıra" -- bir takımın SADECE kadro kalitesine göre
// (bkz. getSquadRatingRanking) olması "beklenen" sırası ile, gerçek puan
// durumundaki sırası arasındaki fark. Pozitif fark = kadrosunun ÜSTÜNDE
// performans (sürpriz iyi gidiş), negatif fark = kadrosunun ALTINDA
// performans. xPTS'ten (maç-maç model tahminine göre) FARKLI bir bakış --
// bu, sezon başındaki HAM kadro kalitesiyle kıyaslar, maç sonuçlarıyla
// değil.
export function getExpectedVsActualRank(competitionKey) {
  const { standings, started } = getRealStandings(competitionKey);
  if (!standings || !started) return [];
  const squadRanking = getSquadRatingRanking(competitionKey);
  const expectedRankByTeam = Object.fromEntries(squadRanking.map((r, i) => [r.teamId, i + 1]));
  const sorted = [...standings].sort((a, b) => a.rank - b.rank);
  const competition = getCompetition(competitionKey);
  const teamById = Object.fromEntries(competition.teams.map((t) => [t.id, t]));
  return sorted
    .map((row) => {
      const team = teamById[row.teamId];
      const expectedRank = expectedRankByTeam[row.teamId];
      if (!team || !expectedRank) return null;
      return {
        teamId: row.teamId,
        team,
        actualRank: row.rank,
        expectedRank,
        diff: expectedRank - row.rank,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.diff - a.diff);
}

// "Gol Çeşitliliği" -- bir takımın kaç FARKLI oyuncusunun gol attığını
// sayar (bkz. topScorers.js). getGoalDependency'nin tam tersi bakış açısı:
// yüksek çeşitlilik = gol yükü paylaşılmış (tek oyuncuya bağımlı değil,
// daha "sürdürülebilir" bir hücum).
export function getGoalScoringDepth(competitionKey) {
  const competition = getCompetition(competitionKey);
  const { standings } = getRealStandings(competitionKey);
  const gfByTeam = Object.fromEntries((standings || []).map((s) => [s.teamId, s.gf]));
  const scorerCounts = {};
  for (const s of TOP_SCORERS) {
    if (s.competitionKey !== competitionKey) continue;
    scorerCounts[s.teamId] = (scorerCounts[s.teamId] || 0) + 1;
  }
  return competition.teams
    .filter((t) => scorerCounts[t.id] > 0)
    .map((t) => ({ teamId: t.id, team: t, scorerCount: scorerCounts[t.id], teamGoals: gfByTeam[t.id] ?? null }))
    .sort((a, b) => b.scorerCount - a.scorerCount);
}

// "Ev Sahibi/Deplasman Karakteri" -- iç saha ve deplasmandaki maç başı puan
// ortalaması arasındaki FARK. Büyük fark = "evinde aslan, deplasmanda
// kuzu" (ya da tam tersi) bir takım -- home-fortress ya da road-warrior
// profilleri. En az 2'şer iç saha/deplasman maçı oynamış takımlar sayılır.
export function getHomeAwayGap(competitionKey) {
  const competition = getCompetition(competitionKey);
  return competition.teams
    .map((t) => {
      const split = getHomeAwaySplit(competitionKey, t.id);
      if (split.home.played < 2 || split.away.played < 2) return null;
      const homePpg = split.home.pts / split.home.played;
      const awayPpg = split.away.pts / split.away.played;
      return {
        teamId: t.id,
        team: t,
        homePpg: Math.round(homePpg * 100) / 100,
        awayPpg: Math.round(awayPpg * 100) / 100,
        gap: Math.round(Math.abs(homePpg - awayPpg) * 100) / 100,
        strongerAt: homePpg >= awayPpg ? "home" : "away",
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.gap - a.gap);
}

// İki takımın çok-eksenli profilini (bkz. getTeamRadarProfile) TEK bir
// radar grafiğinde üst üste karşılaştırabilmek için birleştirir -- iki
// takımın ekseni tam örtüşmeyebilir (ör. biri "Lig Konumu" verisine sahip
// diğeri değil), bu yüzden eksenlerin BİRLEŞİMİ alınır, eksik değerler
// null bırakılır (Recharts bunu "veri yok" olarak, çizgiyi kırmadan atlar).
// Maç Merkezi'ndeki "Takım Karşılaştırması" bölümü için.
export function getMatchRadarComparison(competitionKey, teamAId, teamBId) {
  const a = getTeamRadarProfile(competitionKey, teamAId);
  const b = getTeamRadarProfile(competitionKey, teamBId);
  const aByAxis = Object.fromEntries(a.map((r) => [r.axis, r.value]));
  const bByAxis = Object.fromEntries(b.map((r) => [r.axis, r.value]));
  const axisOrder = ["Hücum", "Savunma", "Katsayı", "Form", "Lig Konumu"];
  const axes = [...new Set([...a.map((r) => r.axis), ...b.map((r) => r.axis)])].sort(
    (x, y) => axisOrder.indexOf(x) - axisOrder.indexOf(y)
  );
  return axes.map((axis) => ({
    axis,
    teamA: aByAxis[axis] ?? null,
    teamB: bByAxis[axis] ?? null,
  }));
}

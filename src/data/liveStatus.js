// Gerçek dünyadaki (kurgusal olmayan) güncel durum -- Ağustos 2026'da web
// araştırmasıyla toplanmıştır. Bu dosya SİMÜLASYON motorlarının kullandığı
// veriden tamamen ayrıdır; sadece "Canlı Skorlar" sayfasında gösterilir.
//
// NOT: Bu bir canlı/otomatik güncellenen veri kaynağı DEĞİLDİR (statik site,
// arka uç yok) -- araştırıldığı ana ait bir "anlık görüntü"dür. Tarihler ve
// skorlar ileride manuel olarak tazelenmelidir.

export const SUPER_LIG_LIVE_ASOF = "24 Ağustos 2026 (2. Hafta sonrası)";

// Wikipedia'nın "2026-27 Süper Lig puan durumu" şablonu + Sabah'ın 2. hafta
// özeti ile çapraz doğrulanmıştır (haftanın 9 maçının toplamı, her takımın
// bu dosyadaki 1+2. hafta sonuçlarıyla birebir tutuyor). teamName burada
// superLigTeams.js'teki `name` alanıyla eşleşecek şekilde yazılmıştır.
export const SUPER_LIG_LIVE_STANDINGS = [
  { rank: 1, teamName: "Gençlerbirliği", played: 2, w: 2, d: 0, l: 0, gf: 3, ga: 1, pts: 6 },
  { rank: 2, teamName: "Galatasaray", played: 2, w: 1, d: 1, l: 0, gf: 6, ga: 2, pts: 4 },
  { rank: 3, teamName: "Samsunspor", played: 2, w: 1, d: 1, l: 0, gf: 5, ga: 3, pts: 4 },
  { rank: 4, teamName: "Trabzonspor", played: 2, w: 1, d: 1, l: 0, gf: 3, ga: 2, pts: 4 },
  { rank: 5, teamName: "Alanyaspor", played: 2, w: 1, d: 1, l: 0, gf: 2, ga: 1, pts: 4 },
  { rank: 6, teamName: "Gaziantep FK", played: 2, w: 1, d: 1, l: 0, gf: 2, ga: 1, pts: 4 },
  { rank: 7, teamName: "Kasımpaşa", played: 2, w: 1, d: 1, l: 0, gf: 2, ga: 1, pts: 4 },
  { rank: 8, teamName: "Fenerbahçe", played: 2, w: 1, d: 0, l: 1, gf: 5, ga: 4, pts: 3 },
  { rank: 9, teamName: "Amed SFK", played: 2, w: 1, d: 0, l: 1, gf: 3, ga: 2, pts: 3 },
  { rank: 10, teamName: "İstanbul Başakşehir", played: 2, w: 1, d: 0, l: 1, gf: 3, ga: 2, pts: 3 },
  { rank: 11, teamName: "Kocaelispor", played: 2, w: 1, d: 0, l: 1, gf: 2, ga: 2, pts: 3 },
  { rank: 12, teamName: "Beşiktaş", played: 2, w: 1, d: 0, l: 1, gf: 1, ga: 1, pts: 3 },
  { rank: 13, teamName: "Çaykur Rizespor", played: 2, w: 1, d: 0, l: 1, gf: 1, ga: 2, pts: 3 },
  { rank: 14, teamName: "Göztepe", played: 2, w: 0, d: 1, l: 1, gf: 3, ga: 4, pts: 1 },
  { rank: 15, teamName: "Çorum FK", played: 2, w: 0, d: 1, l: 1, gf: 2, ga: 3, pts: 1 },
  { rank: 16, teamName: "Eyüpspor", played: 2, w: 0, d: 0, l: 2, gf: 0, ga: 2, pts: 0 },
  { rank: 17, teamName: "Konyaspor", played: 2, w: 0, d: 0, l: 2, gf: 2, ga: 5, pts: 0 },
  { rank: 18, teamName: "Erzurumspor FK", played: 2, w: 0, d: 0, l: 2, gf: 0, ga: 7, pts: 0 },
];

// 1. ve 2. Hafta'nın TAMAMI (18 maç) — Türkçe Vikipedi + Sabah'ın 2. hafta
// özetinden.
export const SUPER_LIG_LIVE_RESULTS = [
  { label: "1. Hafta", date: "14 Ağu", home: "Galatasaray", homeGoals: 2, away: "Çorum FK", awayGoals: 2 },
  { label: "1. Hafta", date: "15 Ağu", home: "Gençlerbirliği", homeGoals: 2, away: "Fenerbahçe", awayGoals: 1 },
  { label: "1. Hafta", date: "15 Ağu", home: "Kasımpaşa", homeGoals: 1, away: "Trabzonspor", awayGoals: 1 },
  { label: "1. Hafta", date: "15 Ağu", home: "Konyaspor", homeGoals: 0, away: "Çaykur Rizespor", awayGoals: 1 },
  { label: "1. Hafta", date: "15 Ağu", home: "Gaziantep FK", homeGoals: 1, away: "Alanyaspor", awayGoals: 1 },
  { label: "1. Hafta", date: "16 Ağu", home: "Beşiktaş", homeGoals: 1, away: "Eyüpspor", awayGoals: 0 },
  { label: "1. Hafta", date: "16 Ağu", home: "Amed SFK", homeGoals: 3, away: "Erzurumspor FK", awayGoals: 0 },
  { label: "1. Hafta", date: "16 Ağu", home: "İstanbul Başakşehir", homeGoals: 2, away: "Kocaelispor", awayGoals: 0 },
  { label: "1. Hafta", date: "17 Ağu", home: "Samsunspor", homeGoals: 3, away: "Göztepe", awayGoals: 3 },
  { label: "2. Hafta", date: "21 Ağu", home: "Erzurumspor FK", homeGoals: 0, away: "Galatasaray", awayGoals: 4 },
  { label: "2. Hafta", date: "22 Ağu", home: "Fenerbahçe", homeGoals: 4, away: "Konyaspor", awayGoals: 2 },
  { label: "2. Hafta", date: "22 Ağu", home: "Çaykur Rizespor", homeGoals: 0, away: "Samsunspor", awayGoals: 2 },
  { label: "2. Hafta", date: "22 Ağu", home: "Çorum FK", homeGoals: 0, away: "Kasımpaşa", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Eyüpspor", homeGoals: 0, away: "Gaziantep FK", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Trabzonspor", homeGoals: 2, away: "İstanbul Başakşehir", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Göztepe", homeGoals: 0, away: "Gençlerbirliği", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Alanyaspor", homeGoals: 1, away: "Beşiktaş", awayGoals: 0 },
  { label: "2. Hafta", date: "24 Ağu", home: "Kocaelispor", homeGoals: 2, away: "Amed SFK", awayGoals: 0 },
];

// Simüle edilmiş TAM fikstürü (roundRobinEngine'den gelen, gerçek dünyayla
// hiçbir ilgisi olmayan bağımsız bir dizilim) gerçek 1. Hafta sonuçlarıyla
// UZLAŞTIRIR: zaten gerçekte oynanmış eşleşmeleri fikstürden çıkarır, geri
// kalan maçları "sıradaki tahminler" olarak bırakır; puan durumu tahmini de
// sıfırdan değil GERÇEK 1. Hafta puan durumundan devam eder. Böylece
// "tahmin" hiçbir zaman zaten bilinen gerçek bir sonucu tekrar üretmeye
// çalışmaz -- sadece henüz oynanmamış maçları tahmin eder.
export function buildSuperLigContinuation(teams, fullFixture) {
  const teamByName = Object.fromEntries(teams.map((t) => [t.name, t]));
  const playedPairs = new Set(
    SUPER_LIG_LIVE_RESULTS.map((r) => `${r.home}|${r.away}`)
  );

  const remainingFixture = fullFixture
    .map((md) => ({
      ...md,
      matches: md.matches.filter(
        (m) => !playedPairs.has(`${m.homeTeam.name}|${m.awayTeam.name}`)
      ),
    }))
    .filter((md) => md.matches.length > 0);

  const initialStandings = {};
  for (const row of SUPER_LIG_LIVE_STANDINGS) {
    const team = teamByName[row.teamName];
    if (!team) continue;
    initialStandings[team.id] = {
      teamId: team.id,
      played: row.played,
      w: row.w,
      d: row.d,
      l: row.l,
      gf: row.gf,
      ga: row.ga,
      pts: row.pts,
    };
  }

  return { remainingFixture, initialStandings };
}

// UCL lig fazı çekilişi yapıldı (27 Ağustos 2026, Grimaldi Forum, Monako) --
// ancak 36 takımın tam eşleşme listesi (144 maç) UEFA tarafından henüz
// (29 Ağustos 2026'ya kadar) resmi olarak yayınlanmadı, ve web'den taranan
// kaynaklar (ör. Wikipedia) bu aşamada birbiriyle çelişen/hatalı satırlar
// içerebiliyor (spot-check'te en az bir yanlış satır -- PSV Eindhoven --
// tespit edildi). Bu yüzden burada SADECE doğrulanmış, düşük riskli tarih
// bilgisi tutuluyor; 144 maçlık tam fikstür kasıtlı olarak eklenmedi.
export const UCL_SEASON_STATUS = {
  phaseStart: "8 Eylül 2026",
  drawDate: "27 Ağustos 2026",
  playoffEnds: "26 Ağustos 2026",
  note:
    "Lig fazı çekilişi 27 Ağustos 2026'da Monako'da (Grimaldi Forum) yapıldı. Maç günleri 8 Eylül 2026 - 27 Ocak 2027 arasına yayılıyor; UEFA'nın kesin saat/tarih içeren tam fikstürü en geç 29 Ağustos 2026'da açıklanması bekleniyor.",
};

export const EUROPA_SEASON_STATUS = {
  phaseStart: "Eylül 2026",
  note:
    "UEFA Avrupa Ligi 2026-27 lig fazı çekilişi de UCL ile aynı hafta (Ağustos 2026 sonu) yapıldı; kesin fikstür UEFA'nın resmi açıklamasıyla netleşecek.",
};

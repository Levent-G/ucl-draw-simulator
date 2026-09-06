// Gerçek dünyadaki (kurgusal olmayan) güncel durum -- Ağustos/Eylül 2026'da
// web araştırmasıyla toplanmış ve 6 Eylül 2026'da tazelenmiştir. Bu dosya
// SİMÜLASYON motorlarının kullandığı
// veriden tamamen ayrıdır; sadece "Canlı Skorlar" sayfasında gösterilir.
//
// NOT: Bu bir canlı/otomatik güncellenen veri kaynağı DEĞİLDİR (statik site,
// arka uç yok) -- araştırıldığı ana ait bir "anlık görüntü"dür. Tarihler ve
// skorlar ileride manuel olarak tazelenmelidir.

export const SUPER_LIG_LIVE_ASOF = "5 Eylül 2026 (4. Haftanın ilk 3 maçı sonrası)";

// Türkçe Vikipedi'nin "2026-27 Süper Lig" maddesinin ham wikitext'i (maç
// sonuçları) + "Şablon:2026-27 Süper Lig puan durumu" (güncel puan durumu
// tablosu) ile çapraz doğrulanmıştır (1+2+3. Hafta'nın TAMAMI, 27 maç).
// 4. Hafta (4-7 Eylül 2026'ya yayılan) için SADECE bağımsız haber
// kaynaklarıyla (galatasaray.org, beIN Sports, Habertürk, Hürriyet, Milliyet,
// Fanatik, Sporx, Takvim -- her biri aynı skor/dakika detaylarını teyit
// ediyor) doğrulanabilen 3 maç (4-5 Eylül) eklendi: Başakşehir 2-3
// Galatasaray, Fenerbahçe 1-2 Beşiktaş, Erzurumspor FK 1-0 Konyaspor. Bu 3
// maçtan hesaplanan puan durumu değişimi, Vikipedi'nin 5 Eylül 2026 anlık
// görüntüsündeki puan durumu tablosuyla BİREBİR örtüşüyor (bu 6 takımın
// played/gf/ga/puan farkları o tabloyla eşleşiyor). 4. Haftanın KALAN 6 maçı
// (6-7 Eylül, ör. Kasımpaşa-Amed, Çorum FK-Eyüpspor, Kocaelispor-Samsunspor,
// Trabzonspor-Gençlerbirliği, Göztepe-Gaziantep FK, Çaykur Rizespor-
// Alanyaspor) taranan kaynaklarda ya "henüz oynanmadı" ya da birbiriyle
// ÇELİŞEN/güvenilmeyen (bir kaynak taslağı sezon SONU bağlamıyla
// karıştırıyordu) sonuçlar döndürdüğünden BİLEREK eklenmedi -- uydurma bir
// skorla doldurulmadı. teamName burada superLigTeams.js'teki `name` alanıyla
// eşleşecek şekilde yazılmıştır.
export const SUPER_LIG_LIVE_STANDINGS = [
  { rank: 1, teamName: "Galatasaray", played: 4, w: 3, d: 1, l: 0, gf: 12, ga: 6, pts: 10 },
  { rank: 2, teamName: "Beşiktaş", played: 4, w: 3, d: 0, l: 1, gf: 9, ga: 4, pts: 9 },
  { rank: 3, teamName: "Gençlerbirliği", played: 3, w: 2, d: 1, l: 0, gf: 4, ga: 2, pts: 7 },
  { rank: 4, teamName: "Fenerbahçe", played: 4, w: 2, d: 0, l: 2, gf: 8, ga: 6, pts: 6 },
  { rank: 5, teamName: "Amed SFK", played: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, pts: 6 },
  { rank: 6, teamName: "Kocaelispor", played: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, pts: 6 },
  { rank: 7, teamName: "Çaykur Rizespor", played: 3, w: 2, d: 0, l: 1, gf: 3, ga: 3, pts: 6 },
  { rank: 8, teamName: "Kasımpaşa", played: 3, w: 1, d: 2, l: 0, gf: 3, ga: 2, pts: 5 },
  { rank: 9, teamName: "İstanbul Başakşehir", played: 4, w: 1, d: 1, l: 2, gf: 6, ga: 6, pts: 4 },
  { rank: 10, teamName: "Samsunspor", played: 3, w: 1, d: 1, l: 1, gf: 5, ga: 5, pts: 4 },
  { rank: 11, teamName: "Trabzonspor", played: 3, w: 1, d: 1, l: 1, gf: 4, ga: 4, pts: 4 },
  { rank: 12, teamName: "Alanyaspor", played: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, pts: 4 },
  { rank: 13, teamName: "Gaziantep FK", played: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, pts: 4 },
  { rank: 14, teamName: "Erzurumspor FK", played: 4, w: 1, d: 1, l: 2, gf: 2, ga: 8, pts: 4 },
  { rank: 15, teamName: "Eyüpspor", played: 3, w: 1, d: 0, l: 2, gf: 2, ga: 3, pts: 3 },
  { rank: 16, teamName: "Göztepe", played: 3, w: 0, d: 1, l: 2, gf: 5, ga: 7, pts: 1 },
  { rank: 17, teamName: "Çorum FK", played: 3, w: 0, d: 1, l: 2, gf: 4, ga: 9, pts: 1 },
  { rank: 18, teamName: "Konyaspor", played: 4, w: 0, d: 0, l: 4, gf: 3, ga: 8, pts: 0 },
];

// 1., 2. ve 3. Hafta'nın TAMAMI (27 maç) — Türkçe Vikipedi'nin ham
// wikitext'i esas alınmıştır; 3. Hafta'nın maç günleri sabah.com.tr'nin
// 3. hafta program haberiyle (28-31 Ağustos 2026) doğrulanmıştır. Bunlara ek
// olarak 4. Hafta'nın (4-7 Eylül 2026) şimdiye dek OYNANMIŞ VE bağımsız
// kaynaklarla (galatasaray.org, beIN Sports, Habertürk, Hürriyet, Milliyet,
// Fanatik, Sporx, Takvim) çapraz doğrulanmış 3 maçı eklendi: Başakşehir 2-3
// Galatasaray (4 Eylül), Erzurumspor FK 1-0 Konyaspor ve Fenerbahçe 1-2
// Beşiktaş (ikisi de 5 Eylül).
//
// NOT: 4. Haftanın KALAN 6 maçı (6-7 Eylül 2026 -- Kasımpaşa-Amed, Çorum
// FK-Eyüpspor, Kocaelispor-Samsunspor, Trabzonspor-Gençlerbirliği, Göztepe-
// Gaziantep FK, Çaykur Rizespor-Alanyaspor) bu dosyanın "bugünü" olan 6 Eylül
// 2026 itibarıyla ya henüz oynanmadı ya da taranan kaynaklarda güvenilir
// şekilde doğrulanamadı (bir kaynak taslağı, açıkça sezon SONU bağlamıyla
// karışmış çelişkili bir skor döndürdü). Bu yüzden burada UYDURULMADI --
// doğrulanabildiğinde eklenecek.
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
  { label: "3. Hafta", date: "28 Ağu", home: "Gençlerbirliği", homeGoals: 1, away: "Erzurumspor FK", awayGoals: 1 },
  { label: "3. Hafta", date: "29 Ağu", home: "Konyaspor", homeGoals: 1, away: "Kocaelispor", awayGoals: 2 },
  { label: "3. Hafta", date: "29 Ağu", home: "Gaziantep FK", homeGoals: 1, away: "Çaykur Rizespor", awayGoals: 2 },
  { label: "3. Hafta", date: "29 Ağu", home: "Galatasaray", homeGoals: 3, away: "Göztepe", awayGoals: 2 },
  { label: "3. Hafta", date: "30 Ağu", home: "Eyüpspor", homeGoals: 2, away: "Alanyaspor", awayGoals: 1 },
  { label: "3. Hafta", date: "30 Ağu", home: "İstanbul Başakşehir", homeGoals: 1, away: "Kasımpaşa", awayGoals: 1 },
  { label: "3. Hafta", date: "30 Ağu", home: "Samsunspor", homeGoals: 0, away: "Fenerbahçe", awayGoals: 2 },
  { label: "3. Hafta", date: "31 Ağu", home: "Amed SFK", homeGoals: 2, away: "Trabzonspor", awayGoals: 1 },
  { label: "3. Hafta", date: "31 Ağu", home: "Beşiktaş", homeGoals: 6, away: "Çorum FK", awayGoals: 2 },
  { label: "4. Hafta", date: "4 Eyl", home: "İstanbul Başakşehir", homeGoals: 2, away: "Galatasaray", awayGoals: 3 },
  { label: "4. Hafta", date: "5 Eyl", home: "Erzurumspor FK", homeGoals: 1, away: "Konyaspor", awayGoals: 0 },
  { label: "4. Hafta", date: "5 Eyl", home: "Fenerbahçe", homeGoals: 1, away: "Beşiktaş", awayGoals: 2 },
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

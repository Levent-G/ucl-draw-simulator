// Gerçek dünyadaki (kurgusal olmayan) güncel durum -- Ağustos 2026'da web
// araştırmasıyla toplanmıştır. Bu dosya SİMÜLASYON motorlarının kullandığı
// veriden tamamen ayrıdır; sadece "Canlı Skorlar" sayfasında gösterilir.
//
// NOT: Bu bir canlı/otomatik güncellenen veri kaynağı DEĞİLDİR (statik site,
// arka uç yok) -- araştırıldığı ana ait bir "anlık görüntü"dür. Tarihler ve
// skorlar ileride manuel olarak tazelenmelidir.

export const SUPER_LIG_LIVE_ASOF = "17 Ağustos 2026 (1. Hafta sonrası)";

// Wikipedia'nın "2026-27 Süper Lig puan durumu" şablonundan alınmıştır.
// teamName burada superLigTeams.js'teki `name` alanıyla eşleşecek şekilde
// yazılmıştır.
export const SUPER_LIG_LIVE_STANDINGS = [
  { rank: 1, teamName: "Amed SFK", played: 1, w: 1, d: 0, l: 0, gf: 3, ga: 0, pts: 3 },
  { rank: 2, teamName: "İstanbul Başakşehir", played: 1, w: 1, d: 0, l: 0, gf: 2, ga: 0, pts: 3 },
  { rank: 3, teamName: "Gençlerbirliği", played: 1, w: 1, d: 0, l: 0, gf: 2, ga: 1, pts: 3 },
  { rank: 4, teamName: "Beşiktaş", played: 1, w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3 },
  { rank: 5, teamName: "Çaykur Rizespor", played: 1, w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3 },
  { rank: 6, teamName: "Göztepe", played: 1, w: 0, d: 1, l: 0, gf: 3, ga: 3, pts: 1 },
  { rank: 7, teamName: "Samsunspor", played: 1, w: 0, d: 1, l: 0, gf: 3, ga: 3, pts: 1 },
  { rank: 8, teamName: "Çorum FK", played: 1, w: 0, d: 1, l: 0, gf: 2, ga: 2, pts: 1 },
  { rank: 9, teamName: "Galatasaray", played: 1, w: 0, d: 1, l: 0, gf: 2, ga: 2, pts: 1 },
  { rank: 10, teamName: "Alanyaspor", played: 1, w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
  { rank: 11, teamName: "Gaziantep FK", played: 1, w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
  { rank: 12, teamName: "Kasımpaşa", played: 1, w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
  { rank: 13, teamName: "Trabzonspor", played: 1, w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
  { rank: 14, teamName: "Fenerbahçe", played: 1, w: 0, d: 0, l: 1, gf: 1, ga: 2, pts: 0 },
  { rank: 15, teamName: "Eyüpspor", played: 1, w: 0, d: 0, l: 1, gf: 0, ga: 1, pts: 0 },
  { rank: 16, teamName: "Konyaspor", played: 1, w: 0, d: 0, l: 1, gf: 0, ga: 1, pts: 0 },
  { rank: 17, teamName: "Kocaelispor", played: 1, w: 0, d: 0, l: 1, gf: 0, ga: 2, pts: 0 },
  { rank: 18, teamName: "Erzurumspor FK", played: 1, w: 0, d: 0, l: 1, gf: 0, ga: 3, pts: 0 },
];

// 1. Hafta'nın TAMAMI (9 maç) — Türkçe Vikipedi'den.
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
];

// UCL / Avrupa Ligi lig fazı henüz başlamadı -- gerçek başlangıç tarihleri.
export const UCL_SEASON_STATUS = {
  phaseStart: "8 Eylül 2026",
  drawDate: "27 Ağustos 2026",
  playoffEnds: "26 Ağustos 2026",
  note:
    "29 takım kesinleşti, kalan 7 yer play-off turuna bağlı (ilk maçlar 18-19 Ağustos, rövanşlar 25-26 Ağustos 2026). Lig fazı çekilişi 27 Ağustos 2026'da yapılacak.",
};

export const EUROPA_SEASON_STATUS = {
  phaseStart: "Eylül 2026",
  note:
    "UEFA Avrupa Ligi 2026-27 lig fazı da UCL ile eş zamanlı takvimde; kesin katılımcı listesi play-off turları bitene kadar netleşmiyor.",
};

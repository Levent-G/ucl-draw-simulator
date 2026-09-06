// 2026-27 UEFA Şampiyonlar Ligi lig fazının GERÇEK sonuçları -- src/data/
// realFixture2026.js'teki maç `id`'leriyle eşleşir (ör. "r1m0"). Bu dosya
// BİLİNÇLİ OLARAK boş başlar: lig fazının ilk maçı 8 Eylül 2026'da
// oynanıyor, bugünün tarihi (bu dosyanın yazıldığı an) 2 Eylül 2026 --
// yani henüz gerçekleşmiş hiçbir maç yok. `matchDate.isMatchPlayed`'e göre
// tarihi geçmiş ama burada karşılığı olmayan bir maç varsa, arayüz sahte
// bir skor UYDURMAZ -- "sonuç henüz eklenmedi" gibi dürüst bir durum
// gösterir (bkz. src/utils/realStandingsSelectors.js).
//
// GÜNCELLEME TALİMATI: bir UCL lig fazı maçı oynandıkça, o maçın gerçek
// skorunu (ve varsa gol atan/asist yapan oyuncuları -- opsiyonel) buraya
// elle eklemek gerekir. Format: { matchId, homeGoals, awayGoals, scorers? }.
// scorers alanı opsiyoneldir; sadece güvenilir kaynaktan doğrulanabiliyorsa
// eklenmelidir (uydurma isim YOK).
export const REAL_RESULTS_UCL_2026 = [
  // { matchId: "r1m0", homeGoals: 2, awayGoals: 1, date: "2026-09-08" },
];

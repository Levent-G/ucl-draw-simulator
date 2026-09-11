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
  // 1. Hafta -- 8 Eylül 2026'da oynanan 6 maç (UEFA.com, ESPN, Sky Sports,
  // Al Jazeera, beIN Sports, Wikipedia gibi en az iki bağımsız kaynaktan
  // çapraz doğrulanmıştır).
  { matchId: "r1m0", homeGoals: 1, awayGoals: 0, date: "2026-09-08" }, // AEK Athens 1-0 LASK
  { matchId: "r1m1", homeGoals: 2, awayGoals: 3, date: "2026-09-08" }, // Club Brugge 2-3 Aston Villa
  { matchId: "r1m2", homeGoals: 3, awayGoals: 2, date: "2026-09-08" }, // Borussia Dortmund 3-2 Villarreal
  { matchId: "r1m3", homeGoals: 0, awayGoals: 2, date: "2026-09-08" }, // FC Porto 0-2 Manchester City
  { matchId: "r1m4", homeGoals: 2, awayGoals: 3, date: "2026-09-08" }, // Lille 2-3 Real Betis
  { matchId: "r1m5", homeGoals: 2, awayGoals: 1, date: "2026-09-08" }, // Real Madrid 2-1 Inter

  // 9 Eylül 2026'da oynanan 6 maç (ESPN gameId sayfaları + VAVEL/NBC Sports/
  // FOX Sports canlı özetleriyle çapraz doğrulanmıştır). 10 Eylül maçları
  // (r1m12-r1m17) bu dosyanın güncellendiği anda (10 Eylül) henüz
  // oynanmadığı için EKLENMEDİ.
  { matchId: "r1m6", homeGoals: 5, awayGoals: 1, date: "2026-09-09" }, // Barcelona 5-1 Feyenoord
  { matchId: "r1m7", homeGoals: 3, awayGoals: 1, date: "2026-09-09" }, // VfB Stuttgart 3-1 Viking
  { matchId: "r1m8", homeGoals: 2, awayGoals: 1, date: "2026-09-09" }, // Liverpool 2-1 Atletico Madrid
  { matchId: "r1m9", homeGoals: 6, awayGoals: 1, date: "2026-09-09" }, // Paris Saint-Germain 6-1 Slovan Bratislava
  { matchId: "r1m10", homeGoals: 3, awayGoals: 1, date: "2026-09-09" }, // Sporting CP 3-1 Galatasaray
  { matchId: "r1m11", homeGoals: 0, awayGoals: 1, date: "2026-09-09" }, // Napoli 0-1 Arsenal
];

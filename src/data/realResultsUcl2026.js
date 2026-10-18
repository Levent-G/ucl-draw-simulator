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
  // 1. Hafta -- 8-10 Eylül 2026'da oynanan 18 maçın TAMAMI (bkz. aşağıdaki
  // 8/9/10 Eylül blokları) UEFA.com, ESPN, Sky Sports, Al Jazeera, beIN
  // Sports, FOX Sports, VAVEL, Shakhtar.com, GiveMeSport, Wikipedia gibi en
  // az iki bağımsız kaynaktan çapraz doğrulanmıştır. 1. Hafta artık TAM
  // olarak kapsanıyor (18/18 maç).
  //
  // 8 Eylül 2026'da oynanan 6 maç:
  { matchId: "r1m0", homeGoals: 1, awayGoals: 0, date: "2026-09-08" }, // AEK Athens 1-0 LASK
  { matchId: "r1m1", homeGoals: 2, awayGoals: 3, date: "2026-09-08" }, // Club Brugge 2-3 Aston Villa
  { matchId: "r1m2", homeGoals: 3, awayGoals: 2, date: "2026-09-08" }, // Borussia Dortmund 3-2 Villarreal
  { matchId: "r1m3", homeGoals: 0, awayGoals: 2, date: "2026-09-08" }, // FC Porto 0-2 Manchester City
  { matchId: "r1m4", homeGoals: 2, awayGoals: 3, date: "2026-09-08" }, // Lille 2-3 Real Betis
  { matchId: "r1m5", homeGoals: 2, awayGoals: 1, date: "2026-09-08" }, // Real Madrid 2-1 Inter

  // 9 Eylül 2026'da oynanan 6 maç (ESPN gameId sayfaları + VAVEL/NBC Sports/
  // FOX Sports canlı özetleriyle çapraz doğrulanmıştır).
  { matchId: "r1m6", homeGoals: 5, awayGoals: 1, date: "2026-09-09" }, // Barcelona 5-1 Feyenoord
  { matchId: "r1m7", homeGoals: 3, awayGoals: 1, date: "2026-09-09" }, // VfB Stuttgart 3-1 Viking
  { matchId: "r1m8", homeGoals: 2, awayGoals: 1, date: "2026-09-09" }, // Liverpool 2-1 Atletico Madrid
  { matchId: "r1m9", homeGoals: 6, awayGoals: 1, date: "2026-09-09" }, // Paris Saint-Germain 6-1 Slovan Bratislava
  { matchId: "r1m10", homeGoals: 3, awayGoals: 1, date: "2026-09-09" }, // Sporting CP 3-1 Galatasaray
  { matchId: "r1m11", homeGoals: 0, awayGoals: 1, date: "2026-09-09" }, // Napoli 0-1 Arsenal

  // 10 Eylül 2026'da oynanan son 6 maç (ESPN gameId sayfaları + VAVEL/FOX
  // Sports/Shakhtar.com resmi haberi/GiveMeSport canlı özetleriyle çapraz
  // doğrulanmıştır) -- 1. Hafta artık TAMAMEN kapsanıyor (18/18 maç).
  { matchId: "r1m12", homeGoals: 1, awayGoals: 1, date: "2026-09-10" }, // Fenerbahçe 1-1 Roma
  { matchId: "r1m13", homeGoals: 1, awayGoals: 1, date: "2026-09-10" }, // PSV Eindhoven 1-1 Shakhtar Donetsk
  { matchId: "r1m14", homeGoals: 4, awayGoals: 1, date: "2026-09-10" }, // Como 4-1 RB Leipzig
  { matchId: "r1m15", homeGoals: 5, awayGoals: 0, date: "2026-09-10" }, // Bayern Münih 5-0 Bodø/Glimt
  { matchId: "r1m16", homeGoals: 4, awayGoals: 0, date: "2026-09-10" }, // Manchester United 4-0 Sabah
  { matchId: "r1m17", homeGoals: 2, awayGoals: 3, date: "2026-09-10" }, // SK Slavia Prague 2-3 RC Lens

  // 2. Hafta -- 13 Ekim 2026'da oynanan 9 maç (ESPN skor tablosu + UEFA.com
  // fikstür/sonuç listesi + thesportsencounter.com maç özetleri ile çapraz
  // doğrulandı). 14 Ekim maçları (r2m9..r2m17) henüz oynanmadı.
  { matchId: "r2m0", homeGoals: 0, awayGoals: 2, date: "2026-10-13" }, // RC Lens 0-2 Sporting CP
  { matchId: "r2m1", homeGoals: 2, awayGoals: 0, date: "2026-10-13" }, // Sabah 2-0 SK Slavia Prague
  { matchId: "r2m2", homeGoals: 3, awayGoals: 0, date: "2026-10-13" }, // Arsenal 3-0 Lille
  { matchId: "r2m3", homeGoals: 2, awayGoals: 0, date: "2026-10-13" }, // Atletico Madrid 2-0 Manchester United
  { matchId: "r2m4", homeGoals: 3, awayGoals: 4, date: "2026-10-13" }, // Inter 3-4 Club Brugge
  { matchId: "r2m5", homeGoals: 1, awayGoals: 4, date: "2026-10-13" }, // Galatasaray 1-4 Barcelona
  { matchId: "r2m6", homeGoals: 1, awayGoals: 0, date: "2026-10-13" }, // RB Leipzig 1-0 PSV Eindhoven
  { matchId: "r2m7", homeGoals: 3, awayGoals: 3, date: "2026-10-13" }, // Viking 3-3 Bayern Münih
  { matchId: "r2m8", homeGoals: 3, awayGoals: 1, date: "2026-10-13" }, // Villarreal 3-1 Napoli

  // 2. Hafta -- 14 Ekim 2026'da oynanan 9 maç (ESPN skor tablosu + UEFA.com +
  // thesportsencounter.com; Aston Villa-Fenerbahçe ayrıca GZT/Fanatik/CNN Türk).
  // 2. Hafta TAMAMLANDI (18/18).
  { matchId: "r2m9", homeGoals: 3, awayGoals: 2, date: "2026-10-14" }, // Feyenoord 3-2 Como
  { matchId: "r2m10", homeGoals: 3, awayGoals: 6, date: "2026-10-14" }, // LASK 3-6 Liverpool
  { matchId: "r2m11", homeGoals: 3, awayGoals: 4, date: "2026-10-14" }, // Roma 3-4 Real Madrid
  { matchId: "r2m12", homeGoals: 6, awayGoals: 0, date: "2026-10-14" }, // Aston Villa 6-0 Fenerbahçe
  { matchId: "r2m13", homeGoals: 3, awayGoals: 1, date: "2026-10-14" }, // Shakhtar Donetsk 3-1 AEK Athens
  { matchId: "r2m14", homeGoals: 1, awayGoals: 0, date: "2026-10-14" }, // Bodø/Glimt 1-0 Borussia Dortmund
  { matchId: "r2m15", homeGoals: 2, awayGoals: 4, date: "2026-10-14" }, // Manchester City 2-4 Paris Saint-Germain
  { matchId: "r2m16", homeGoals: 3, awayGoals: 2, date: "2026-10-14" }, // Real Betis 3-2 FC Porto
  { matchId: "r2m17", homeGoals: 0, awayGoals: 3, date: "2026-10-14" }, // Slovan Bratislava 0-3 VfB Stuttgart
];

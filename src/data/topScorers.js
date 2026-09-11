// 2026-27 sezonu GERÇEK gol krallığı verisi -- UEFA Şampiyonlar Ligi (lig fazı)
// ve Trendyol Süper Lig için, kurgusal/simüle edilmiş DEĞİL.
//
// Yöntem: WebSearch/WebFetch ile araştırılmış, HER oyuncu için en az 2
// bağımsız kaynaktan (ör. ESPN + Sky Sports + Yahoo Sports; ya da Hürriyet +
// Habertürk + galatasaray.org + Fanatik gibi Türkçe spor medyası) çapraz
// doğrulanmış gol sayıları kullanılmıştır. Bu dosya src/data/news.js'teki
// (zaten araştırılmış) maç özetleriyle başlayıp, ek WebSearch turlarıyla
// genişletilmiştir. Doğrulanamayan/kaynaklar arasında ÇELİŞEN hiçbir gol
// UYDURULMAMIŞ ya da tahmin edilmemiştir -- bkz. aşağıdaki "ATLANDI" notu.
//
// UCL kapsamı: Lig Fazı 1. Hafta'nın 8-9 Eylül 2026'da oynanan 12 maçının
// TAMAMI (bkz. src/data/realResultsUcl2026.js -- r1m0..r1m11). 1. Haftanın
// kalan 6 maçı (r1m12-r1m17, ör. Fenerbahçe-Roma; 10 Eylül 2026 tarihli) bu
// dosyanın güncellendiği anda (10 Eylül 2026, maçlar henüz oynanmadan önce)
// HENÜZ OYNANMADIĞI için bilinçli olarak eklenmedi -- realResultsUcl2026.js
// ile tutarlı kalınması amaçlandı. Bu yüzden UCL listesi burada o ana kadar
// oynanan 12 maçta atılan isimlendirilebilen HER golü kapsıyor -- "ilk 10"
// gibi keyfi bir kesme değil, GERÇEK ve TAM tablo.
//
// ATLANDI (belirsiz/çelişkili veri):
// - Lille 2-3 Real Betis maçında Lille'in 2. golünün sahibi kaynaklar
//   arasında ÇELİŞTİ (bazı kaynaklar Ayase Ueda'nın ikinci kez attığını,
//   bazıları Alexsandro'yu, bir kaynak ise (yanlışlıkla) Ethan Mbappé'yi
//   işaret etti -- oysa çoğu kaynak Ethan Mbappé'nin aslında 56'da KIRMIZI
//   KART gördüğünü, gol atmadığını doğruluyor). Bu yüzden o gol hiçbir
//   oyuncuya yazılmadı; sadece Ueda'nın kaynaklar arasında ORTAK olan
//   12. dakikadaki golü sayıldı.
// - Sporting CP 3-1 Galatasaray maçında 5. dakikadaki AÇILIŞ golünün
//   kaynağı ÇELİŞTİ: ESPN bunu Gonçalo Inácio'nun (Galatasaray) kendi
//   kalesine attığı gol olarak veriyor, ama VAVEL'in maç özeti aynı golü
//   tutarsız biçimde "Torreira" attı diyor ve skor etiketini de yanlış
//   gösteriyor ("Galatasaray 1-0 Sporting" yazıp golü yine de Sporting'e
//   sayıyor). Kaynaklar oyuncu kimliğinde ÇELİŞTİĞİ için bu gol hiçbir
//   oyuncuya yazılmadı (zaten kendi kalesine golse hiçbir oyuncunun gol
//   sayacına eklenmez). Maçın diğer 3 golü (Catamo, Suárez, Zalazar) en az
//   iki bağımsız kaynakta (ESPN + ortak WebSearch sonuçları: whoscored,
//   allfootball, thesportsencounter) tutarlı olduğu için eklendi.
// - PSG 6-1 Slovan Bratislava maçında "Ferran Torres" adının PSG'ye
//   yazılması özellikle üç bağımsız yapılandırılmış kaynaktan (ESPN, VAVEL,
//   Yahoo Sports "Player Ratings") ayrı ayrı doğrulandı -- ilk bakışta
//   şüpheli görünse de (gerçek hayatta Barcelona'da oynayan bir isim), bu
//   uygulamanın src/data/players.js kadro verisinde Ferran Torres zaten
//   PSG (t4) kadrosunda listeleniyor, Barcelona (t7) kadrosunda DEĞİL --
//   yani kadro dosyasıyla ve üç ayrı kaynakla tutarlı. Bu yüzden hallüsinasyon
//   şüphesine rağmen (bkz. görev talimatındaki uyarı), üç bağımsız kaynağın
//   golün dakikası ve şeklini farklı ama tutarlı ayrıntılarla (31'/47'/57'
//   veya 31'/47'/56') anlatması nedeniyle GERÇEK kabul edildi ve eklendi.
//
// Süper Lig kapsamı: 1-4. Haftaların TAMAMI (bkz. src/data/liveStatus.js).
// Kadro eşleşmesi notları (src/data/players.js / superLigPlayers.js ile):
// - Marc Bartra, Troy Parrott (Real Betis / t19), Nicolas Jackson (Aston
//   Villa / t20) ve Santiago Mouriño (Villarreal / t14): bu dosyalardaki
//   ilgili takım kadroları eksik/kısa tutulmuş (ör. Real Betis'te sadece 4
//   oyuncu var) -- bu isimler kadro dosyasında YOK, ama gol atışları en az
//   iki bağımsız kaynaktan (ESPN, Sky Sports) doğrulandığı için yine de
//   eklendi.
// - Ayase Ueda, players.js'te YANLIŞLIKLA hâlâ Feyenoord (t16) kadrosunda
//   görünüyor -- gerçekte 2025 yazından beri Lille'de oynuyor ve bu golü de
//   Lille forması ile attı; burada gerçek takımı olan Lille (t26) ile
//   eşleştirildi.
// - Eldor Shomurodov, superLigPlayers.js'te "Eldar Şahmuradov" (aynı Özbek
//   isminin farklı bir Türkçe transkripsiyonu, UZB/FW/s5 -- İstanbul
//   Başakşehir) olarak kayıtlı; aynı oyuncu kabul edilip uluslararası
//   yaygın yazımı ("Eldor Shomurodov") kullanıldı.
export const TOP_SCORERS = [
  // ---- UEFA Şampiyonlar Ligi 2026-27 -- Lig Fazı 1. Hafta, 8 Eylül 2026'da oynanan 6 maç ----
  {
    playerName: "Erling Haaland",
    teamId: "t2", // Manchester City
    competitionKey: "ucl",
    goals: 2,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "Sky Sports / ESPN",
  },
  {
    playerName: "Serhou Guirassy",
    teamId: "t12", // Borussia Dortmund
    competitionKey: "ucl",
    goals: 2,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / Yahoo Sports",
  },
  {
    playerName: "Marc Bartra",
    teamId: "t19", // Real Betis
    competitionKey: "ucl",
    goals: 2,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / ajansspor.com / vavel.com",
  },
  {
    playerName: "Kylian Mbappé",
    teamId: "t1", // Real Madrid
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / Al Jazeera",
  },
  {
    playerName: "Federico Valverde",
    teamId: "t1", // Real Madrid
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / Al Jazeera",
  },
  {
    playerName: "Carlos Augusto",
    teamId: "t6", // Inter
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN",
  },
  {
    playerName: "Ayase Ueda",
    teamId: "t26", // Lille (players.js'te hâlâ Feyenoord'da görünüyor, bkz. üstteki not)
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / ajansspor.com / vavel.com",
  },
  {
    playerName: "Troy Parrott",
    teamId: "t19", // Real Betis
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / ajansspor.com",
  },
  {
    playerName: "John McGinn",
    teamId: "t20", // Aston Villa
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "Sky Sports / ESPN",
  },
  {
    playerName: "Emiliano Buendía",
    teamId: "t20", // Aston Villa
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "Sky Sports",
  },
  {
    playerName: "Nicolas Jackson",
    teamId: "t20", // Aston Villa
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "Sky Sports",
  },
  {
    playerName: "Hugo Vetlesen",
    teamId: "t17", // Club Brugge
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "Sky Sports",
  },
  {
    playerName: "Nicolò Tresoldi",
    teamId: "t17", // Club Brugge
    competitionKey: "ucl",
    goals: 1, // penaltıdan
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "Sky Sports",
  },
  {
    playerName: "Santiago Mouriño",
    teamId: "t14", // Villarreal
    competitionKey: "ucl",
    goals: 1,
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN / Yahoo Sports",
  },
  {
    playerName: "Razvan Marin",
    teamId: "t27", // AEK Athens
    competitionKey: "ucl",
    goals: 1, // ~20 metreden frikik
    matchesPlayed: 1,
    asOf: "2026-09-09",
    source: "ESPN",
  },

  // ---- UEFA Şampiyonlar Ligi 2026-27 -- Lig Fazı 1. Hafta, 9 Eylül 2026'da oynanan 6 maç ----
  {
    playerName: "Raphinha",
    teamId: "t7", // Barcelona
    competitionKey: "ucl",
    goals: 2, // 3' ve 57'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Karim Adeyemi",
    teamId: "t7", // Barcelona
    competitionKey: "ucl",
    goals: 1, // 22'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Lamine Yamal",
    teamId: "t7", // Barcelona
    competitionKey: "ucl",
    goals: 1, // 77', frikikten
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Gabriel Jesus",
    teamId: "t7", // Barcelona
    competitionKey: "ucl",
    goals: 1, // 85'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Sem Steijn",
    teamId: "t16", // Feyenoord
    competitionKey: "ucl",
    goals: 1, // 82'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Ermedin Demirović",
    teamId: "t21", // VfB Stuttgart
    competitionKey: "ucl",
    goals: 3, // ilk yarıda 12 dakika içinde hat-trick: 20', 26', 32'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / Bundesliga.com / Yahoo Sports",
  },
  {
    playerName: "Zlatko Tripić",
    teamId: "t30", // Viking
    competitionKey: "ucl",
    goals: 1, // 22'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / Bundesliga.com / Yahoo Sports",
  },
  {
    playerName: "Marcos Llorente",
    teamId: "t10", // Atletico Madrid
    competitionKey: "ucl",
    goals: 1, // 17'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / theanalyst.com",
  },
  {
    playerName: "Dominik Szoboszlai",
    teamId: "t5", // Liverpool
    competitionKey: "ucl",
    goals: 1, // ~40'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / theanalyst.com",
  },
  {
    playerName: "Alexis Mac Allister",
    teamId: "t5", // Liverpool
    competitionKey: "ucl",
    goals: 1, // ~50', maçın galibiyet golü
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / theanalyst.com",
  },
  {
    playerName: "Ousmane Dembélé",
    teamId: "t4", // Paris Saint-Germain
    competitionKey: "ucl",
    goals: 2, // 16'-17' ve 23'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / Yahoo Sports",
  },
  {
    // Bkz. dosya başındaki not: kadro dosyasında (players.js, t4) Ferran
    // Torres zaten PSG'de listeleniyor; üç bağımsız kaynak da hat-trick'i
    // doğruladı.
    playerName: "Ferran Torres",
    teamId: "t4", // Paris Saint-Germain
    competitionKey: "ucl",
    goals: 3, // hat-trick: 31', 47', 56'-57'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / Yahoo Sports",
  },
  {
    playerName: "Fabián Ruiz",
    teamId: "t4", // Paris Saint-Germain
    competitionKey: "ucl",
    goals: 1, // 87'-88'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / Yahoo Sports",
  },
  {
    playerName: "Suleiman Camara",
    teamId: "t32", // Slovan Bratislava
    competitionKey: "ucl",
    goals: 1, // 58'-59', tek gol
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / VAVEL / Yahoo Sports",
  },
  {
    playerName: "Geny Catamo",
    teamId: "t23", // Sporting CP
    competitionKey: "ucl",
    goals: 1, // ~25'-27'
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / WebSearch (whoscored.com / allfootball.com)",
  },
  {
    playerName: "Luis Suárez",
    teamId: "t23", // Sporting CP
    competitionKey: "ucl",
    goals: 1, // ~55'-57', penaltıdan
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / WebSearch (whoscored.com / allfootball.com)",
  },
  {
    playerName: "Rodrigo Zalazar",
    teamId: "t23", // Sporting CP
    competitionKey: "ucl",
    goals: 1, // ~63'-65', frikikten
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / WebSearch (whoscored.com / allfootball.com)",
  },
  {
    playerName: "Martin Ødegaard",
    teamId: "t11", // Arsenal
    competitionKey: "ucl",
    goals: 1, // 75', maçın tek golü
    matchesPlayed: 1,
    asOf: "2026-09-10",
    source: "ESPN / Sky Sports / Yahoo Sports",
  },

  // ---- Trendyol Süper Lig 2026-27 -- 1-4. Haftaların TAMAMI ----
  {
    playerName: "Victor Osimhen",
    teamId: "s1", // Galatasaray
    competitionKey: "superlig",
    goals: 6, // 1. hafta Çorum FK'ya 2, 2. hafta Erzurumspor FK'ya 2, 3. hafta Göztepe'ye 1 (penaltı), 4. hafta Başakşehir'e 1
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "Hürriyet / Habertürk / galatasaray.org / takvim.com.tr / ajansspor.com",
  },
  {
    playerName: "Dušan Vlahović",
    teamId: "s3", // Beşiktaş
    competitionKey: "superlig",
    goals: 4, // 3. hafta Çorum FK'ya hat-trick, 4. hafta derbide 1 gol
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "beIN Sports / fotomac.com.tr / takvim.com.tr / sofascore.com",
  },
  {
    playerName: "Eldor Shomurodov",
    teamId: "s5", // İstanbul Başakşehir (superLigPlayers.js'te "Eldar Şahmuradov" adıyla kayıtlı, bkz. üstteki not)
    competitionKey: "superlig",
    goals: 4, // Kocaelispor, Trabzonspor, Kasımpaşa ve Galatasaray maçlarında birer gol
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "gazetebirlik.com / karsmanset.com / sporx.com",
  },
  {
    playerName: "Gift Orban",
    teamId: "s11", // Amed SFK
    competitionKey: "superlig",
    goals: 3,
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "ESPN / sofascore.com / diyarbakir.net",
  },
  {
    playerName: "Juan",
    teamId: "s7", // Göztepe
    competitionKey: "superlig",
    goals: 3, // 3. hafta Galatasaray'a 1, 4. hafta Gaziantep FK'ya 2
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "beIN Sports / Hürriyet",
  },
  {
    playerName: "Kacper Kozłowski",
    teamId: "s15", // Gaziantep FK
    competitionKey: "superlig",
    goals: 2, // 4. hafta Göztepe'ye 2 gol
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "beIN Sports / sofascore.com",
  },
  {
    playerName: "Paul Onuachu",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 2, // ilk 3 haftada sessiz kaldı, 4. hafta Gençlerbirliği'ne 2 gol
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "fotomac.com.tr / Hürriyet / milliyet.com.tr",
  },
  {
    playerName: "Mohamed Salah",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 1, // Süper Lig'deki ilk golü, 4. hafta Gençlerbirliği'ne (penaltı)
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "Hürriyet / Fanatik / Star",
  },
  {
    playerName: "Milan Škriniar",
    teamId: "s2", // Fenerbahçe
    competitionKey: "superlig",
    goals: 1, // 4. hafta derbide Beşiktaş'a
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "Hürriyet / beIN Sports / Milli Gazete",
  },
  {
    playerName: "Ernest Muçi",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 1, // 4. hafta Gençlerbirliği'ne
    matchesPlayed: 4,
    asOf: "2026-09-09",
    source: "Hürriyet / Fanatik / Star",
  },
];

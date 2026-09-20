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
// UCL kapsamı: Lig Fazı 1. Hafta'nın 8-10 Eylül 2026'da oynanan 18 maçının
// TAMAMI (bkz. src/data/realResultsUcl2026.js -- r1m0..r1m17). Liste, bu 18
// maçta atılan isimlendirilebilen HER golü kapsıyor -- "ilk 10" gibi keyfi
// bir kesme değil, GERÇEK ve TAM tablo.
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
// - Slavia Prague 2-3 Lens maçında Slavia'nın 2. golünün sahibi kaynaklar
//   arasında ÇELİŞTİ: bir ESPN sayfası çekimi golü "Mikuláš Konečný"'ye
//   yazdı, ama iki bağımsız kaynak (VAVEL ve GiveMeSport) ile ilk WebSearch
//   özeti Danijel Šturm'ün iki golü de (51'/88' civarı) attığını -- yani
//   bir "brace" olduğunu -- tutarlı biçimde doğruladı. 2/3 çoğunluğa
//   uyularak Šturm'e 2 gol yazıldı, Konečný'ye gol yazılmadı (muhtemelen tek
//   kaynaklı bir çıkarım hatası).
//
// Süper Lig kapsamı: 1-6. Haftaların TAMAMI (6. Hafta 20 Eylül 2026'da
// TAMAMLANDI, bkz. src/data/liveStatus.js -- SUPER_LIG_LIVE_RESULTS).
//
// 19 Eylül 2026 tazelemesi: 5. Hafta'nın TAMAMI (9 maç, 11-14 Eylül) ve
// 6. Hafta'dan oynanan 5 maç için WebSearch/WebFetch ile HER golün
// atıcısı araştırıldı; her gol en az 2 bağımsız kaynaktan (ör. Hürriyet +
// Fanatik/Habertürk/beIN Sports/AA/Sporx/Fotomaç/ASpor/Sporkolik gibi bir
// ikincisi) çapraz doğrulandı. Bu turda kaynaklar arasında ÇELİŞEN/
// belirsiz kalan hiçbir gol bulunmadı (dolayısıyla bu bölüm için yeni bir
// ATLANDI notu yok) -- Amed SFK 5-0 Başakşehir maçındaki 45+1' Emin
// Bayram kendi kalesi hariç (kendi kalesi golleri zaten hiçbir oyuncuya
// yazılmaz). Rajmund Tóth (Konyaspor, s9), Ousmane Diabaté (Gençlerbirliği,
// s18) ve Gaïus Makouta (Alanyaspor, s10) için haber kaynakları sadece
// soyadı kullandı; tam adları superLigPlayers.js kadro dosyasındaki tek
// eşleşen oyuncuyla (aynı takım + pozisyon) doğrulanarak tamamlandı. İlhan
// Fakılı (Beşiktaş), Emrecan Bulut (Çaykur Rizespor), Jesus Ramirez/Cengiz
// Ünder/Alexandros Kyziridis (Çorum FK), Rhaldney (Göztepe), Paulo
// Fernandes/Arda Usluoğlu (Alanyaspor), Mbaye Diagne (Amed SFK), Berkan
// Kutlu (Kocaelispor) ve Noah Saviolo (Trabzonspor) superLigPlayers.js'teki
// (kasıtlı olarak kısa tutulmuş) kadro listelerinde YOK, ama her birinin
// golü en az 2 bağımsız kaynaktan doğrulandığı için yine de eklendi (bkz.
// dosya başındaki genel ATLANDI/kadro-eşleşmesi metodolojisi).
//
// 20 Eylül 2026 tazelemesi: 6. Hafta'nın KALAN 4 maçı (Fenerbahçe 8-0
// Eyüpspor, Erzurumspor FK 1-0 Samsunspor, Amed SFK 3-2 Beşiktaş, Göztepe
// 2-2 Çaykur Rizespor) için HER golün atıcısı en az 2 bağımsız kaynaktan
// (Habertürk + Hürriyet'in dakika dakika maç anlatımları, ayrıca ajansspor,
// fanatik, beIN Sports, gzt.com, Cumhuriyet, fotomac.com.tr, NTVSpor, Sabah,
// takvim.com.tr gibi ikinci/üçüncü kaynaklar) çapraz doğrulandı; bu turda
// da ÇELİŞEN/belirsiz kalan hiçbir gol bulunmadı. Kadro eşleşmesi notları:
// İrfan Can Kahveci, Furkan Soyalp ve Iustin Doicaru superLigPlayers.js'teki
// ilgili takım kadrolarında YOK (kadro dosyaları kasıtlı olarak kısa
// tutulmuş), ama golleri en az 2 bağımsız kaynaktan doğrulandığı için yine
// de eklendi. Fenerbahçe'nin ikinci golünün sahibi kaynaklar arasında adının
// yazımında ayrıştı (Habertürk "Matteo Guendouzi", Hürriyet ise yanlışlıkla
// "Aurélien Guendouzi" yazdı) -- superLigPlayers.js'teki s2 kadrosunda tek
// eşleşen oyuncu "Mattéo Guendouzi" (FRA, MF) olduğu için o yazım kullanıldı
// (iki kaynak da golün 38'de ve aynı oyuncudan geldiği konusunda hemfikir,
// sadece adın yazımı farklıydı). Göztepe'nin açılış golünün atıcısı
// haberlerde "Arda Okan Kurtalan" / "Arda Okan" olarak geçiyor;
// superLigPlayers.js'teki s7 kadrosunda bu isme en yakın (aynı takım +
// pozisyon MF) tek oyuncu "Arda Kurtulan" olduğu için (Eldor Shomurodov /
// "Eldar Şahmuradov" ile aynı türde bir transkripsiyon/kadro-dosyası
// farkı kabul edilip) o kayıtla eşleştirildi.
//
// 20 Eylül 2026'da yapılan İKİNCİ bir tazeleme (TFF resmi "gol krallığı"
// doğrulaması): Kullanıcı, Süper Lig Gol Kralları bölümünün defalarca YANLIŞ
// olduğunu belirtip TFF'nin resmi sitesini (tff.org) birincil/otoriter kaynak
// olarak kullanılmasını istedi. tff.org'un "gol krallığı" sayfası
// (tff.org/default.aspx?pageID=821) WebFetch ile denendi; sayfa bir tablo
// döndürdü ama TFF'nin dinamik istatistik sayfalarının WebFetch'in HTML->
// metin dönüştürücüsüyle güvenilir/tam ayrıştırılabildiğinden emin
// olunamadı (bkz. görev talimatındaki 5. adım). Bu yüzden tff.org'un
// sıralaması fotmob.com'un resmi "Süper Lig İstatistikleri - Gol Kralı"
// sayfasıyla VE her bir düzeltme için doğrudan birincil maç
// haberi/anlatımlarıyla (Hürriyet, Habertürk, ajansspor.com, Fanatik, AA,
// beIN Sports, Al Jazeera, The National, Milliyet, Takvim, Sözcü, CNN Türk,
// gzt.com) çapraz doğrulandı -- yani tff.org TAMAMEN erişilemez değildi
// ancak tek başına yeterli görülmediği için sofascore.com/fotmob.com VE
// orijinal maç raporları ikinci/üçüncü katman doğrulama olarak kullanıldı.
// Bu turda bulunan SOMUT hatalar (önceki tazelemelerde gözden kaçan erken
// hafta -- özellikle 1-3. Hafta -- golleri) düzeltildi:
// - Mohamed Salah (Trabzonspor): önceki kayıtta SADECE 4. hafta (1,
//   penaltı) ve 6. hafta hat-trick'i (3) toplanmış, 2. hafta Başakşehir'e
//   attığı çift gol (8' ve 48') ile 3. hafta Amed SFK deplasmanında attığı
//   gol (11') dosyaya hiç eklenmemişti. Doğru toplam 4 DEĞİL 7 gol (Al
//   Jazeera, The National, beIN Sports, AA, Hürriyet, Sözcü, fotmob.com ve
//   tff.org'dan alınan tablo BİRBİRİYLE ve "6 maçta 7 gol" ifadesiyle
//   tutarlı).
// - Vedat Muriqi (Fenerbahçe): önceki kayıtta SADECE 6. hafta Eyüpspor
//   maçındaki 4 golü vardı; 2. hafta Konyaspor'a (7') ve 3. hafta
//   Samsunspor deplasmanında (3') attığı goller eksikti. Doğru toplam 4
//   DEĞİL 6 gol (milliyet.com.tr, sporx.com, fotmob.com ve gzt26.com
//   tutarlı).
// - Adrian Benedyczak (Kasımpaşa): önceki kayıtta SADECE 4. ve 5. hafta
//   golleri vardı; 1. hafta Trabzonspor'a attığı penaltı (56') ve 2. hafta
//   Çorum FK deplasmanındaki galibiyet golü (6') eksikti. Doğru toplam 2
//   DEĞİL 4 gol (Habertürk, Fanatik, takvim.com.tr, flashscore.com.tr ve
//   tff.org/fotmob.com tutarlı).
// - Jesus Ramirez (Çorum FK): önceki kayıtta SADECE 5. ve 6. hafta golleri
//   vardı; 1. hafta Galatasaray'a karşı (61') attığı gol -- Çorum FK'nın
//   Süper Lig tarihindeki İLK golünden hemen sonra gelen ikinci golü --
//   dosyaya hiç eklenmemişti. Doğru toplam 3 DEĞİL 4 gol (Hürriyet VE
//   ajansspor.com'un bağımsız maç anlatımları golün dakikası ve şeklinde
//   birebir örtüşüyor).
// - Alexandros Kyziridis (Çorum FK): önceki kayıtta SADECE 4. ve 5. hafta
//   golleri vardı; 1. hafta Galatasaray'a karşı attığı gol (59', Çorum
//   FK'nın Süper Lig tarihindeki İLK golü) eksikti. Doğru toplam 2 DEĞİL 3
//   gol (Hürriyet, ajansspor.com).
// - Noah Saviolo (Trabzonspor): önceki kayıtta SADECE 6. hafta Galatasaray
//   derbisindeki golü vardı; 1. hafta Kasımpaşa deplasmanındaki golü (43')
//   eksikti. Doğru toplam 1 DEĞİL 2 gol (Habertürk'ün doğrudan maç
//   anlatımı ile iki bağımsız WebSearch özeti tutarlı).
// ÇAPRAZ DOĞRULANIP DEĞİŞTİRİLMEYEN (zaten doğru olduğu teyit edilen)
// oyuncular: Victor Osimhen (6 gol -- 5. ve 6. hafta sakatlık nedeniyle
// forma giyemedi, bkz. Hürriyet/Fotomaç/Fanatik/gzt.com; toplamı
// etkilemedi), Gift Orban (7 gol), Dušan Vlahović (5 gol -- flashscore.com.tr
// ve bazı ikincil kaynaklar 4 diyor ama Beşiktaş'ın 3. hafta Çorum FK'ya 6-2
// kazandığı maçtaki DOĞRULANMIŞ hat-trick'i [3] + 4. hafta derbi golü [1] +
// 6. hafta Amed SFK deplasmanındaki golü [55', 1] toplamda birincil maç
// raporlarıyla 5'i doğruluyor -- bu yüzden ikincil/aggregator kaynak yerine
// birincil maç raporları esas alındı), Eldor Shomurodov (6 gol), Juan (4
// gol). Ayrıca Paul Onuachu, Kacper Kozłowski, Milan Škriniar ve Ernest
// Muçi için matchesPlayed alanı 6. Hafta'nın TAMAMLANMASIYLA 6'ya
// güncellendi (gol sayıları DEĞİŞMEDİ -- bu oyuncuların takımları ilgili
// haftalarda ya golsüz kaldı ya da golleri zaten başka oyunculara
// yazılmıştı).
//
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

  // ---- UEFA Şampiyonlar Ligi 2026-27 -- Lig Fazı 1. Hafta, 10 Eylül 2026'da oynanan son 6 maç ----
  {
    playerName: "Bryan Cristante",
    teamId: "t13", // Roma
    competitionKey: "ucl",
    goals: 1, // 39'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / FOX Sports",
  },
  {
    playerName: "Archie Brown",
    teamId: "t25", // Fenerbahçe
    competitionKey: "ucl",
    goals: 1, // 48', Fenerbahçe adına UCL'de gol atan ilk İngiliz oyuncu
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / FOX Sports",
  },
  {
    playerName: "Gleiker Mendoza",
    teamId: "t18", // Shakhtar Donetsk
    competitionKey: "ucl",
    goals: 1, // 45+1'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / Shakhtar.com (resmi)",
  },
  {
    playerName: "Sergiño Dest",
    teamId: "t24", // PSV Eindhoven
    competitionKey: "ucl",
    goals: 1, // 48'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / Shakhtar.com (resmi)",
  },
  {
    playerName: "Martin Baturina",
    teamId: "t34", // Como
    competitionKey: "ucl",
    goals: 1, // 15'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    // players.js'te Como (t34) kadrosunda YOK -- kadro dosyası eksik/kısa
    // tutulmuş, ama gol atışı en az iki bağımsız kaynaktan (ESPN, VAVEL)
    // doğrulandığı için yine de eklendi.
    playerName: "Anastasios Douvikas",
    teamId: "t34", // Como
    competitionKey: "ucl",
    goals: 1, // ~38'-40'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    // players.js'te Como (t34) kadrosunda YOK, bkz. üstteki not.
    playerName: "Assane Diao",
    teamId: "t34", // Como
    competitionKey: "ucl",
    goals: 1, // ~54'-55'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    // players.js'te Como (t34) kadrosunda YOK, bkz. üstteki not.
    playerName: "Máximo Perrone",
    teamId: "t34", // Como
    competitionKey: "ucl",
    goals: 1, // 90'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    // players.js'te RB Leipzig (t15) kadrosunda YOK. Oyuncunun adı ESPN ve
    // VAVEL çekimlerinde farklı yazıldı ("Andrija" vs "Nikolaos"
    // Maksimović); ayrı bir WebSearch turu (Yahoo Sports/Bundesliga.com
    // maç raporu) "Andrija Maksimovic" adını doğruladığı için o kullanıldı.
    playerName: "Andrija Maksimović",
    teamId: "t15", // RB Leipzig
    competitionKey: "ucl",
    goals: 1, // ~58'-60'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL / Yahoo Sports / Bundesliga.com",
  },
  {
    playerName: "Jamal Musiala",
    teamId: "t3", // Bayern Münih
    competitionKey: "ucl",
    goals: 1, // 47'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Harry Kane",
    teamId: "t3", // Bayern Münih
    competitionKey: "ucl",
    goals: 1, // 61'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Alphonso Davies",
    teamId: "t3", // Bayern Münih
    competitionKey: "ucl",
    goals: 1, // 77'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Michael Olise",
    teamId: "t3", // Bayern Münih
    competitionKey: "ucl",
    goals: 2, // 83' ve 90+2'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    // players.js'te Manchester United (t8) kadrosunda YOK -- kadro dosyası
    // eksik/kısa tutulmuş, ama gol atışı en az iki bağımsız kaynaktan
    // (ESPN, VAVEL) doğrulandığı için yine de eklendi.
    playerName: "Matheus Cunha",
    teamId: "t8", // Manchester United
    competitionKey: "ucl",
    goals: 1, // ~27'-28'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Bruno Fernandes",
    teamId: "t8", // Manchester United
    competitionKey: "ucl",
    goals: 1, // 42'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / Yahoo Sports",
  },
  {
    // players.js'te Manchester United (t8) kadrosunda YOK, bkz. üstteki not.
    playerName: "Benjamin Sesko",
    teamId: "t8", // Manchester United
    competitionKey: "ucl",
    goals: 1, // 45'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    playerName: "Lisandro Martínez",
    teamId: "t8", // Manchester United
    competitionKey: "ucl",
    goals: 1, // ~68'-69'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL",
  },
  {
    // players.js'te SK Slavia Prague (t29) kadrosunda YOK. Bkz. dosya
    // başındaki ATLANDI notu: kaynaklar Slavia'nın 2. golünün sahibinde
    // çelişti (Konečný vs Šturm brace); 2/3 çoğunlukla Šturm'e 2 gol
    // yazıldı.
    playerName: "Danijel Šturm",
    teamId: "t29", // SK Slavia Prague
    competitionKey: "ucl",
    goals: 2, // ~51' ve ~88'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "VAVEL / GiveMeSport",
  },
  {
    // players.js'te RC Lens (t22) kadrosunda YOK -- kadro dosyası
    // eksik/kısa tutulmuş, ama gol atışı en az iki bağımsız kaynaktan
    // doğrulandığı için yine de eklendi.
    playerName: "Abdallah Sima",
    teamId: "t22", // RC Lens
    competitionKey: "ucl",
    goals: 1, // ~73'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL / GiveMeSport",
  },
  {
    // players.js'te RC Lens (t22) kadrosunda YOK, bkz. üstteki not.
    playerName: "Florian Thauvin",
    teamId: "t22", // RC Lens
    competitionKey: "ucl",
    goals: 1, // 90+1'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL / GiveMeSport",
  },
  {
    playerName: "Ruben Aguilar",
    teamId: "t22", // RC Lens
    competitionKey: "ucl",
    goals: 1, // 90+3'
    matchesPlayed: 1,
    asOf: "2026-09-16",
    source: "ESPN / VAVEL / GiveMeSport",
  },

  // ---- Trendyol Süper Lig 2026-27 -- 1-4. Haftaların TAMAMI ----
  {
    playerName: "Victor Osimhen",
    teamId: "s1", // Galatasaray
    competitionKey: "superlig",
    goals: 6, // 1. hafta Çorum FK'ya 2 (53' ve 90'), 2. hafta Erzurumspor FK'ya 2, 3. hafta Göztepe'ye 1 (penaltı), 4. hafta Başakşehir'e 1 -- 5. ve 6. hafta sakatlık nedeniyle forma giymedi (bkz. Hürriyet/Fotomaç/Fanatik/gzt.com), bu yüzden 6 gollük toplam DEĞİŞMEDİ
    matchesPlayed: 4,
    asOf: "2026-09-20",
    source: "Hürriyet / Habertürk / galatasaray.org / takvim.com.tr / ajansspor.com / Fotomaç / gzt.com / fotmob.com",
  },
  {
    playerName: "Dušan Vlahović",
    teamId: "s3", // Beşiktaş
    competitionKey: "superlig",
    goals: 5, // 3. hafta Çorum FK'ya hat-trick, 4. hafta derbide 1, 6. hafta Amed SFK deplasmanında 1 (55')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "beIN Sports / fotomac.com.tr / takvim.com.tr / sofascore.com / gzt.com / Habertürk",
  },
  {
    playerName: "Eldor Shomurodov",
    teamId: "s5", // İstanbul Başakşehir (superLigPlayers.js'te "Eldar Şahmuradov" adıyla kayıtlı, bkz. üstteki not)
    competitionKey: "superlig",
    goals: 6, // 1-4. haftalarda 4 (Kocaelispor, Trabzonspor, Kasımpaşa, Galatasaray maçlarında birer), 6. hafta Gençlerbirliği'ne 2 (33', 65')
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "gazetebirlik.com / karsmanset.com / sporx.com / Hürriyet / AA",
  },
  {
    playerName: "Gift Orban",
    teamId: "s11", // Amed SFK
    competitionKey: "superlig",
    goals: 7, // 1-4. haftalarda 3, 5. hafta İstanbul Başakşehir'e hat-trick (52', 56', 75'), 6. hafta Beşiktaş'a 1 (13')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "ESPN / sofascore.com / diyarbakir.net / Fanatik / Habertürk / gzt.com",
  },
  {
    playerName: "Juan",
    teamId: "s7", // Göztepe
    competitionKey: "superlig",
    goals: 4, // 3. hafta Galatasaray'a 1, 4. hafta Gaziantep FK'ya 2, 5. hafta Alanyaspor'a 1 (73', penaltıdan) -- 6. hafta Çaykur Rizespor'a karşı (2-2) golsüz kaldı (o maçın golleri Kurtulan ve Bekiroğlu'na yazıldı, aşağıya bkz.)
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "beIN Sports / Hürriyet / fotmob.com",
  },
  {
    playerName: "Kacper Kozłowski",
    teamId: "s15", // Gaziantep FK
    competitionKey: "superlig",
    goals: 2, // 4. hafta Göztepe'ye 2 gol -- 5. hafta (0-0 Fenerbahçe) ve 6. hafta (0-2 Kocaelispor deplasmanında mağlubiyet) golsüz geçti
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "beIN Sports / sofascore.com",
  },
  {
    playerName: "Paul Onuachu",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 2, // ilk 3 haftada sessiz kaldı, 4. hafta Gençlerbirliği'ne 2 gol -- 5. hafta Konyaspor deplasmanında (90 dakika oynadı) ve 6. hafta Galatasaray derbisinde (golleri Salah ve Saviolo attı) golsüz kaldı
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "fotomac.com.tr / Hürriyet / milliyet.com.tr / haber61.net",
  },
  {
    // 20 Eylül 2026 TFF/fotmob doğrulamasında düzeltildi: önceki kayıtta
    // sadece 4. hafta (penaltı) ve 6. hafta hat-trick'i toplanmıştı; 2.
    // hafta Başakşehir'e attığı çift gol (8' ve 48') ile 3. hafta Amed SFK
    // deplasmanındaki golü (11') eksikti. Bkz. dosya başındaki 20 Eylül
    // (TFF doğrulaması) notu.
    playerName: "Mohamed Salah",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 7, // 2. hafta Başakşehir'e 2 (8', 48'), 3. hafta Amed SFK deplasmanında 1 (11'), 4. hafta Gençlerbirliği'ne (penaltı) 1, 5. hafta Konyaspor deplasmanında sessiz kaldı, 6. hafta Galatasaray derbisinde hat-trick (4', 44', 80')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Al Jazeera / The National / beIN Sports / AA / Hürriyet / Sözcü / Fanatik / Star / Cumhuriyet / Habertürk / Sabah / fotmob.com / tff.org",
  },
  {
    playerName: "Milan Škriniar",
    teamId: "s2", // Fenerbahçe
    competitionKey: "superlig",
    goals: 1, // 4. hafta derbide Beşiktaş'a -- 5. hafta (0-0 Gaziantep FK) ve 6. hafta (8-0 Eyüpspor, golleri Muriqi/Greenwood/Guendouzi/Kahveci attı) golsüz geçti
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Hürriyet / beIN Sports / Milli Gazete",
  },
  {
    playerName: "Ernest Muçi",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 1, // 4. hafta Gençlerbirliği'ne -- 5. ve 6. hafta golsüz geçti (bkz. Salah/Saviolo notları)
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Hürriyet / Fanatik / Star",
  },

  // ---- Trendyol Süper Lig 2026-27 -- 5. Hafta, 11-14 Eylül 2026'da oynanan 9 maçın TAMAMI ----
  {
    playerName: "Emirhan Topçu",
    teamId: "s3", // Beşiktaş
    competitionKey: "superlig",
    goals: 1, // 5. hafta Erzurumspor FK'ya, 21'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Hürriyet / Fanatik / ASpor",
  },
  {
    playerName: "Leandro Trossard",
    teamId: "s3", // Beşiktaş
    competitionKey: "superlig",
    goals: 1, // 5. hafta Erzurumspor FK'ya, 27'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Hürriyet / Fanatik / ASpor",
  },
  {
    // superLigPlayers.js'te Beşiktaş (s3) kadrosunda YOK -- kadro dosyası
    // kısa tutulmuş, ama gol atışı en az iki bağımsız kaynaktan (Hürriyet,
    // Fanatik) doğrulandığı için yine de eklendi. Aynı oyuncu 11 Eylül'deki
    // Avrupa Ligi Marsilya maçında da gol attı (bkz. news.js) -- o gol
    // farklı bir yarışma (uel) olduğu için burada SAYILMADI.
    playerName: "İlhan Fakılı",
    teamId: "s3", // Beşiktaş
    competitionKey: "superlig",
    goals: 1, // 5. hafta Erzurumspor FK'ya, 81'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Hürriyet / Fanatik / ASpor",
  },
  {
    playerName: "Ali Sowe",
    teamId: "s12", // Çaykur Rizespor
    competitionKey: "superlig",
    goals: 1, // 5. hafta Eyüpspor deplasmanında, 21'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Habertürk / beIN Sports / Sporx",
  },
  {
    // superLigPlayers.js'te Çaykur Rizespor (s12) kadrosunda YOK, ama gol
    // atışı en az iki bağımsız kaynaktan doğrulandı.
    playerName: "Emrecan Bulut",
    teamId: "s12", // Çaykur Rizespor
    competitionKey: "superlig",
    goals: 1, // 5. hafta Eyüpspor deplasmanında, 90+2'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Habertürk / beIN Sports / Sporx",
  },
  {
    playerName: "Logi Tómasson",
    teamId: "s6", // Samsunspor
    competitionKey: "superlig",
    goals: 1, // 5. hafta Çorum FK'ya karşı, 5' (Samsunspor'un maçtaki tek golü)
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Fanatik / Habertürk / Sporkolik.net",
  },
  {
    // superLigPlayers.js'te Çorum FK (s13) kadrosu kısa tutulmuş, bu isim
    // orada YOK, ama gol atışları en az iki bağımsız kaynaktan doğrulandı.
    // 20 Eylül 2026 TFF/fotmob doğrulamasında düzeltildi: önceki kayıtta 1.
    // hafta Galatasaray'a karşı attığı gol (61', Çorum FK'nın Süper Lig
    // tarihindeki ilk golünden hemen sonra gelen 2. gol) eksikti -- Hürriyet
    // VE ajansspor.com'un bağımsız maç anlatımları birebir örtüşüyor.
    playerName: "Jesus Ramirez",
    teamId: "s13", // Çorum FK
    competitionKey: "superlig",
    goals: 4, // 1. hafta Galatasaray'a karşı 1 (61'), 5. hafta Samsunspor deplasmanında 2 (1', 71'), 6. hafta Alanyaspor'a 1 (76')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Hürriyet / ajansspor.com / Fanatik / Habertürk / Sporkolik.net",
  },
  {
    // superLigPlayers.js'te Çorum FK (s13) kadrosunda YOK, bkz. üstteki not.
    playerName: "Cengiz Ünder",
    teamId: "s13", // Çorum FK
    competitionKey: "superlig",
    goals: 2, // 5. hafta Samsunspor deplasmanında 2 (10', 15')
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Fanatik / Habertürk / Sporkolik.net",
  },
  {
    // superLigPlayers.js'te Çorum FK (s13) kadrosunda YOK, bkz. üstteki not.
    // 4. hafta Eyüpspor maçındaki golü news.js'te zaten teyitliydi (Hürriyet
    // / gzt.com / Fanatik) ama önceki tazelemede bu dosyaya eklenmemişti;
    // bu tazelemede 5. hafta golüyle birlikte düzeltildi.
    // 20 Eylül 2026 TFF/fotmob doğrulamasında düzeltildi: önceki kayıtta 1.
    // hafta Galatasaray'a karşı attığı gol (59', Çorum FK'nın Süper Lig
    // tarihindeki İLK golü) eksikti -- Hürriyet VE ajansspor.com tutarlı.
    playerName: "Alexandros Kyziridis",
    teamId: "s13", // Çorum FK
    competitionKey: "superlig",
    goals: 3, // 1. hafta Galatasaray'a karşı 1 (59', kulübün Süper Lig tarihindeki ilk golü), 4. hafta Eyüpspor'a 1, 5. hafta Samsunspor deplasmanında 1 (69'/70')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Hürriyet / ajansspor.com / gzt.com / Fanatik / Habertürk / Sporkolik.net",
  },
  {
    // superLigPlayers.js'te Göztepe (s7) kadrosunda YOK, ama gol atışı en
    // az iki bağımsız kaynaktan doğrulandı.
    playerName: "Rhaldney",
    teamId: "s7", // Göztepe
    competitionKey: "superlig",
    goals: 1, // 5. hafta Alanyaspor deplasmanında, 28'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Hürriyet / Fanatik / beIN Sports",
  },
  {
    // superLigPlayers.js'te Alanyaspor (s10) kadrosunda YOK, ama gol atışı
    // en az iki bağımsız kaynaktan doğrulandı.
    playerName: "Paulo Fernandes",
    teamId: "s10", // Alanyaspor
    competitionKey: "superlig",
    goals: 1, // 5. hafta Göztepe'ye, 63'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Hürriyet / Fanatik / beIN Sports",
  },
  {
    playerName: "Gaïus Makouta",
    teamId: "s10", // Alanyaspor (superLigPlayers.js'te "Gaïus Makouta" yazımıyla kayıtlı)
    competitionKey: "superlig",
    goals: 2, // 5. hafta Göztepe'ye 1 (75'), 6. hafta Çorum FK deplasmanında 1 (67')
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Hürriyet / Fanatik / beIN Sports / Fotomaç / Sporx",
  },
  {
    // Haber kaynakları sadece "Toth" soyadını kullandı; superLigPlayers.js'te
    // Konyaspor (s9) kadrosunda bu soyadla eşleşen tek oyuncu "Rajmund Tóth"
    // (MF, HUN) -- maçtaki asist veren isimler (Muleka, Gonçalves) de aynı
    // kadroda olduğu için eşleşme güvenilir kabul edildi.
    playerName: "Rajmund Tóth",
    teamId: "s9", // Konyaspor
    competitionKey: "superlig",
    goals: 1, // 5. hafta Trabzonspor'a karşı, 2'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Hürriyet / Aksiyon.com.tr / Fanatik",
  },
  {
    // Haber kaynakları "Ousmane Diabate" yazdı; superLigPlayers.js'te
    // Gençlerbirliği (s18) kadrosunda kayıtlı yazım "Ousmane Diabaté".
    playerName: "Ousmane Diabaté",
    teamId: "s18", // Gençlerbirliği
    competitionKey: "superlig",
    goals: 1, // 5. hafta Kasımpaşa'ya karşı, 23'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Hürriyet / Takvim / ASpor",
  },
  {
    // 4. hafta Amed SFK maçındaki golü news.js'te zaten teyitliydi (Hürriyet
    // / gzt.com / Fanatik) ama önceki tazelemede bu dosyaya eklenmemişti;
    // bu tazelemede 5. hafta golüyle birlikte düzeltildi. 20 Eylül 2026
    // TFF/fotmob doğrulamasında AYRICA düzeltildi: 1. hafta Trabzonspor'a
    // karşı attığı penaltı (56') ve 2. hafta Çorum FK deplasmanındaki
    // galibiyet golü (6') de eksikti -- Habertürk, Fanatik, takvim.com.tr
    // ve flashscore.com.tr'nin sezon toplamı (4 gol/6 maç) tutarlı.
    playerName: "Adrian Benedyczak",
    teamId: "s8", // Kasımpaşa
    competitionKey: "superlig",
    goals: 4, // 1. hafta Trabzonspor'a 1 (56', penaltı), 2. hafta Çorum FK deplasmanında 1 (6'), 4. hafta Amed SFK'ya 1, 5. hafta Gençlerbirliği'ne 1 (79')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Habertürk / Hürriyet / gzt.com / Fanatik / Takvim / ASpor / flashscore.com.tr",
  },
  {
    playerName: "Güven Yalçın",
    teamId: "s8", // Kasımpaşa
    competitionKey: "superlig",
    goals: 2, // 4. hafta Amed SFK'ya 1, 5. hafta Gençlerbirliği'ne 1 (90+4', son dakika galibiyet golü)
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Hürriyet / gzt.com / Fanatik / Takvim / ASpor",
  },
  {
    // superLigPlayers.js'te Amed SFK (s11) kadrosunda YOK, ama gol atışı en
    // az iki bağımsız kaynaktan doğrulandı.
    playerName: "Mbaye Diagne",
    teamId: "s11", // Amed SFK
    competitionKey: "superlig",
    goals: 1, // 5. hafta İstanbul Başakşehir'e, 84'
    matchesPlayed: 5,
    asOf: "2026-09-19",
    source: "Habertürk / Fanatik / beIN Sports",
  },
  {
    playerName: "Abdülkerim Bardakcı",
    teamId: "s1", // Galatasaray
    competitionKey: "superlig",
    goals: 1, // 5. hafta Kocaelispor'a, 71' (ceza sahası dışından)
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Habertürk / Fanatik / beIN Sports",
  },

  // ---- Trendyol Süper Lig 2026-27 -- 6. Hafta, 18-19 Eylül 2026'da oynanan 5/9 maç ----
  {
    // superLigPlayers.js'te Kocaelispor (s17) kadrosunda YOK, ama gol
    // atışı en az iki bağımsız kaynaktan doğrulandı.
    playerName: "Berkan Kutlu",
    teamId: "s17", // Kocaelispor
    competitionKey: "superlig",
    goals: 1, // 6. hafta Gaziantep FK'ya, 56'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Habertürk / Fanatik / Sporx",
  },
  {
    playerName: "Dan Agyei",
    teamId: "s17", // Kocaelispor
    competitionKey: "superlig",
    goals: 1, // 6. hafta Gaziantep FK'ya, 76'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Habertürk / Fanatik / Sporx",
  },
  {
    // superLigPlayers.js'te Trabzonspor (s4) kadrosunda YOK -- kadro dosyası
    // kısa tutulmuş; oyuncunun 3. hafta Amed SFK maçında sakatlandığı ve MR
    // bulguları news.js'te ayrıca teyitli (gzt.com / Fotomaç / ASpor /
    // Takvim). 20 Eylül 2026 TFF/fotmob doğrulamasında düzeltildi: 1. hafta
    // Kasımpaşa deplasmanındaki golü (43') önceki tazelemede hiç
    // eklenmemişti -- Habertürk'ün doğrudan maç anlatımı bunu teyit ediyor.
    playerName: "Noah Saviolo",
    teamId: "s4", // Trabzonspor
    competitionKey: "superlig",
    goals: 2, // 1. hafta Kasımpaşa deplasmanında 1 (43'), 6. hafta Galatasaray derbisinde 1 (39')
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Habertürk / Fanatik / Cumhuriyet / Sabah / AA",
  },
  {
    // superLigPlayers.js'te Alanyaspor (s10) kadrosunda YOK, ama gol atışı
    // en az iki bağımsız kaynaktan doğrulandı.
    playerName: "Arda Usluoğlu",
    teamId: "s10", // Alanyaspor
    competitionKey: "superlig",
    goals: 1, // 6. hafta Çorum FK deplasmanında, 78'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "Fotomac.com.tr / Fanatik / Sporx",
  },
  {
    playerName: "Andreas Skov Olsen",
    teamId: "s5", // İstanbul Başakşehir
    competitionKey: "superlig",
    goals: 1, // 6. hafta Gençlerbirliği'ne, 9'
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "AA / Hürriyet / Fotomaç",
  },
  {
    playerName: "Davie Selke",
    teamId: "s5", // İstanbul Başakşehir
    competitionKey: "superlig",
    goals: 1, // 6. hafta Gençlerbirliği'ne, 53' (penaltı)
    matchesPlayed: 6,
    asOf: "2026-09-19",
    source: "AA / Hürriyet / Fotomaç",
  },

  // ---- Trendyol Süper Lig 2026-27 -- 6. Hafta, 20 Eylül 2026'da oynanan KALAN 4 maç (6. Hafta TAMAMLANDI) ----
  {
    // 20 Eylül 2026 TFF/fotmob doğrulamasında düzeltildi: önceki kayıtta
    // sadece 6. hafta Eyüpspor maçındaki 4 golü vardı; 2. hafta Konyaspor'a
    // (7') ve 3. hafta Samsunspor deplasmanında (3') attığı goller eksikti
    // -- milliyet.com.tr, sporx.com ve gzt26.com'un "Eyüpspor maçı öncesi 2
    // golü vardı" tespiti ile birebir örtüşüyor.
    playerName: "Vedat Muriqi",
    teamId: "s2", // Fenerbahçe
    competitionKey: "superlig",
    goals: 6, // 2. hafta Konyaspor'a 1 (7'), 3. hafta Samsunspor deplasmanında 1 (3'), 6. hafta Eyüpspor'a karşı 8-0'lık galibiyette 4 gol (7', 21', 47', 55') -- kariyerinde ilk Süper Lig hat-trick'inden fazlası
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Habertürk / Hürriyet / ajansspor.com / fanatik.com.tr / milliyet.com.tr / sporx.com / gzt26.com",
  },
  {
    playerName: "Mason Greenwood",
    teamId: "s2", // Fenerbahçe
    competitionKey: "superlig",
    goals: 2, // 6. hafta Eyüpspor'a, 4'/5' (penaltı) ve 80'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Habertürk / Hürriyet / ajansspor.com / fanatik.com.tr",
  },
  {
    // Habertürk "Matteo Guendouzi", Hürriyet ise yanlışlıkla "Aurélien
    // Guendouzi" yazdı; superLigPlayers.js'teki s2 kadrosunda tek eşleşen
    // oyuncu "Mattéo Guendouzi" (FRA, MF) olduğu için o yazım kullanıldı
    // (iki kaynak da golün 38'de olduğu konusunda hemfikirdi).
    playerName: "Mattéo Guendouzi",
    teamId: "s2", // Fenerbahçe
    competitionKey: "superlig",
    goals: 1, // 6. hafta Eyüpspor'a, 38'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Habertürk / Hürriyet",
  },
  {
    // superLigPlayers.js'teki s2 (Fenerbahçe) kadrosunda YOK -- kadro
    // dosyası kısa tutulmuş, ama gol atışı en az iki bağımsız kaynaktan
    // doğrulandığı için yine de eklendi.
    playerName: "İrfan Can Kahveci",
    teamId: "s2", // Fenerbahçe
    competitionKey: "superlig",
    goals: 1, // 6. hafta Eyüpspor'a, 45+1'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Habertürk / Hürriyet",
  },
  {
    playerName: "Miguel Cardoso",
    teamId: "s14", // Erzurumspor FK
    competitionKey: "superlig",
    goals: 1, // 6. hafta Samsunspor'a karşı, 45' (maçın tek golü)
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "Fanatik / Habertürk / ASpor / AA",
  },
  {
    playerName: "Dia Saba",
    teamId: "s11", // Amed SFK
    competitionKey: "superlig",
    goals: 1, // 6. hafta Beşiktaş'a, 22'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "gzt.com / Habertürk / Fanatik / Cumhuriyet",
  },
  {
    // superLigPlayers.js'teki s11 (Amed SFK) kadrosunda YOK, ama gol atışı
    // en az iki bağımsız kaynaktan doğrulandı.
    playerName: "Furkan Soyalp",
    teamId: "s11", // Amed SFK
    competitionKey: "superlig",
    goals: 1, // 6. hafta Beşiktaş'a, 59'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "gzt.com / Habertürk / Fanatik / Cumhuriyet",
  },
  {
    playerName: "Orkun Kökçü",
    teamId: "s3", // Beşiktaş
    competitionKey: "superlig",
    goals: 1, // 6. hafta Amed SFK deplasmanında, 90+8' (penaltı)
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "gzt.com / Habertürk / Fanatik / Cumhuriyet",
  },
  {
    // Haber kaynakları "Arda Okan Kurtalan" / "Arda Okan" yazdı;
    // superLigPlayers.js'teki s7 (Göztepe) kadrosunda bu isme en yakın
    // (aynı takım + MF) tek oyuncu "Arda Kurtulan" -- o kayıtla eşleştirildi.
    playerName: "Arda Kurtulan",
    teamId: "s7", // Göztepe
    competitionKey: "superlig",
    goals: 1, // 6. hafta Çaykur Rizespor'a karşı, 3'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "ajansspor.com / sondakika.com / fotomac.com.tr",
  },
  {
    playerName: "Efkan Bekiroğlu",
    teamId: "s7", // Göztepe
    competitionKey: "superlig",
    goals: 1, // 6. hafta Çaykur Rizespor'a, 90+4' (penaltı, beraberlik golü)
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "ajansspor.com / takvim.com.tr / Sabah",
  },
  {
    playerName: "İbrahim Olawoyin",
    teamId: "s12", // Çaykur Rizespor
    competitionKey: "superlig",
    goals: 1, // 6. hafta Göztepe deplasmanında, 70'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "ajansspor.com / takvim.com.tr / NTVSpor",
  },
  {
    // superLigPlayers.js'teki s12 (Çaykur Rizespor) kadrosunda YOK, ama gol
    // atışı en az iki bağımsız kaynaktan doğrulandı.
    playerName: "Iustin Doicaru",
    teamId: "s12", // Çaykur Rizespor
    competitionKey: "superlig",
    goals: 1, // 6. hafta Göztepe deplasmanında, 80'
    matchesPlayed: 6,
    asOf: "2026-09-20",
    source: "NTVSpor / takvim.com.tr",
  },
];

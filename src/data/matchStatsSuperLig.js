// Trendyol Süper Lig 2026-27 sezonu, 6. Hafta (18-20 Eylül 2026) maç
// istatistikleri -- kurgusal/tahmini DEĞİL. Kapsam: 6. Hafta'nın TAMAMI, 9
// maç (sr6m0..sr6m8, bkz. src/data/realFixtureSuperLig2026.js). Kesin
// sonuçlar zaten src/data/liveStatus.js -- SUPER_LIG_LIVE_RESULTS ("6.
// Hafta" etiketi) içinde kayıtlı; gol atıcıları ve dakikaları ise zaten
// src/data/topScorers.js ve src/data/news.js'te araştırılmış/doğrulanmıştır
// -- burada YENİDEN araştırılmadı, doğrudan o dosyalardan alındı.
//
// Bu dosyanın YENİ araştırdığı alanlar: top hakimiyeti, şut/isabetli şut,
// korner ve sarı/kırmızı kart sayıları. Yöntem: WebSearch ile her maç için
// birden fazla arama turu (fotmob.com, sofascore.com, sahadan.com,
// Hürriyet, Habertürk, Fanatik, ajansspor.com, beIN Sports, AA, Sabah,
// Cumhuriyet, Milliyet, Fotomaç, Takvim, NTVSpor, gzt.com gibi kaynaklar)
// yapılmış; MÜMKÜN OLAN her alan en az 2 bağımsız aramanın aynı sayıyı
// döndürmesiyle çapraz doğrulanmıştır. İki arama turu birbiriyle ÇELİŞEN
// bir sayı döndürdüğünde (ör. aynı maç için farklı isabetli şut sayıları),
// o alan UYDURULMADAN/ORTALAMASI ALINMADAN tamamen atlanmış ve aşağıda
// maç bazında "ATLANDI" notuyla belirtilmiştir. Tek kaynaktan gelen ama
// başka hiçbir kaynakla ÇELİŞMEYEN, isimlendirilmiş/somut sayılar (ör. adı
// verilen oyunculara ait sarı kart listesi) -- topScorers.js'teki mevcut
// metodolojiyle tutarlı olarak -- kabul edilmiştir.
//
// zonePressure (bölge baskısı) alanı: hiçbir maç raporunda "yüksek pres
// uyguladı", "kendi sahasında beklemeyi tercih etti" gibi bölgesel baskıyı
// somut biçimde destekleyen bir tasvir bulunamadığı için (yalnızca top
// hakimiyeti/şut sayıları gibi genel istatistikler mevcuttu), bu alan HİÇBİR
// maç için eklenmedi -- uydurma sayı üretmek yerine tamamen atlandı.
//
// Kartlarda teknik direktör/personel kartları SAYILMADI (bkz.
// src/data/injuries.js'teki aynı ilke: Okan Buruk'un Trabzonspor derbisinde
// gördüğü kırmızı kart bir OYUNCU kartı değil, bu yüzden sr6m3'ün "cards"
// alanına dahil edilmedi -- sadece Lesley Ugochukwu'nun oyuncu kırmızı kartı
// sayıldı).
//
// asOf: 2026-09-21 (bu dosyanın araştırıldığı gün).
//
// ==== İKİNCİ TAZELEME: EK İSTATİSTİK ALANLARI (2026-09-21) ====
// Aynı gün yapılan ikinci bir araştırma turunda her maça şu YENİ alanlar
// eklenmeye çalışıldı: fouls (faul), offsides (ofsayt), saves (kaleci
// kurtarışı), passAccuracy (pas isabet yüzdesi), freeKicks (serbest vuruş),
// bigChances (büyük fırsat), duelsWon (kazanılan ikili mücadele) ve xg
// (beklenen gol -- expected goals). Yöntem öncekiyle aynı prensiplere
// dayanıyor (UYDURMA/ORTALAMA YOK, çelişkide ATLA) ama farklı bir kaynak
// karmasıyla çalıştı:
//
// - fouls, offsides, passAccuracy: mackolik.com'un her maça özel "Maç
//   Detayı" sayfasındaki yapılandırılmış "İstatistikler" tablosundan
//   alındı (Opta kökenli, tek ama sağlam kaynak -- fotmob/sofascore
//   ayarındaki bir veri sağlayıcısı olarak kabul edildi). Bulunan hiçbir
//   sayı başka bir kaynakla ÇELİŞMEDİ; aksine sr6m2, sr6m3, sr6m7 ve
//   sr6m8'de bağımsız haber kaynakları (Sabah/61saat, seskocaeli.com,
//   fotomaç türevi arama sonuçları) AYNI fouls/offsides sayılarını ayrıca
//   doğruladı.
// - xg (beklenen gol): fotmob.com'un maç sayfasından alındı (9 maçın
//   tamamı için tek ama isim belirtilmiş güvenilir kaynak). sofascore.com
//   karşılaştırma için denendi ancak JS tabanlı sayfa istatistik verisini
//   durağan biçimde döndürmedi; bu yüzden ne çelişki ne de ekstra teyit
//   bulunabildi -- fotmob değeri TEK BAŞINA güvenilir kaynak kabul edilerek
//   kullanıldı.
// - saves (kurtarış): SADECE sr6m4 (away: 7 -- iki bağımsız kaynak, ayrıca
//   zaten doğrulanmış shotsOnTarget'la [11-4=7] matematiksel olarak birebir
//   tutarlı; home: 0 -- Gençlerbirliği'nin zaten doğrulanmış shotsOnTarget
//   değeri 0 olduğundan kalecinin kurtaracağı isabetli şut hiç yoktu, bu bir
//   tahmin değil zaten kanıtlanmış bir sayının kesin matematiksel sonucudur)
//   ve sr6m6'da (isimlendirilmiş kaleciler: Ertuğrul Taşkıran 2, Okan Koçuk
//   1 -- tek kaynak ama çelişkisiz, isimlendirilmiş somut sayı) eklendi.
//   DİĞER TÜM MAÇLARDA saves ATLANDI: bulunan kurtarış sayıları ya
//   birbiriyle çelişti (sr6m7'de Lafont için bir kaynakta "5", başka bir
//   kaynakta -- fotomac.com.tr'nin "Lafont'tan 6 kurtarış" başlıklı haberi
//   -- "6") ya da zaten doğrulanmış shotsOnTarget/gol sayılarıyla
//   matematiksel olarak ÇELİŞTİ (sr6m1, sr6m2, sr6m5, sr6m8 -- bulunan
//   kurtarış sayısı, ilgili kalecinin karşılaştığı isabetli şut eksi yediği
//   gol sayısından belirgin biçimde düşük çıktı), bu yüzden UYDURULMADAN
//   atlandı.
// - bigChances (büyük fırsat): SADECE sr6m8'de eklendi (Göztepe 5 / Rizespor
//   1 -- tek kaynak, ama aynı arama sonucundaki korner ve faul sayıları
//   zaten doğrulanmış/mackolik değerleriyle birebir örtüştüğü için kaynağın
//   güvenilirliği teyit edildi; ayrıca dönüştürülen büyük fırsat sayıları
//   [2 ve 1] gerçek gol sayılarıyla tutarlı). sr6m1 ve sr6m4'te bulunan
//   "büyük fırsat" sayıları YALNIZCA ilk yarıya veya tek tarafa aitti (maçın
//   tamamı için eksik/karşılaştırılamaz) ve bu yüzden ATLANDI. Diğer
//   maçlarda hiç bulunamadı.
// - duelsWon (kazanılan ikili mücadele, RAKAM -- yüzde değil): SADECE
//   sr6m3'te eklendi (Trabzonspor 53 - Galatasaray 62; Sabah/61saat kökenli
//   bir haberden, aynı haberin verdiği korner [1-5] ve ofsayt [3-0]
//   sayılarının mackolik'le birebir örtüşmesiyle kaynağın güvenilirliği
//   teyit edildi). Diğer maçlarda bulunan "ikili mücadele" sayıları oyuncu
//   bazlıydı (takım toplamı değil) veya yalnızca ilk yarıya aitti, bu yüzden
//   ATLANDI.
// - freeKicks (serbest vuruş): HİÇBİR maç için eklenmedi -- hiçbir kaynakta
//   takım bazlı ayrı bir "serbest vuruş sayısı" istatistiği bulunamadı
//   (taranan Türkçe kaynaklar bunu ayrı bir istatistik olarak yayımlamıyor).
//
// Bu ikinci turun asOf'u da aynı gün: 2026-09-21.
export const SUPER_LIG_MATCH_STATS = {
  // Kasımpaşa 0-0 Konyaspor (18 Eylül 2026)
  sr6m0: {
    possession: { home: 47, away: 53 }, // Hürriyet/Fanatik'in "Kasımpaşa topa daha az sahip oldu" tespitiyle yönü tutarlı; kesin yüzde tek kaynaktan (canligaste.com türevi arama)
    shots: { home: 13, away: 11 }, // iki bağımsız arama turunda da aynı sayılar çıktı
    // shotsOnTarget ATLANDI: iki arama turu birbiriyle çelişti (2/4 isabet vs 0/1 isabet)
    corners: { home: 6, away: 4 }, // tek kaynak, çelişki yok
    cards: {
      home: { yellow: 2, red: 0 }, // Matei Ilie (24'), Cláudio Winck (30')
      away: { yellow: 4, red: 0 }, // Adil Demirbağ (40'), Marko Jevtović (53'), Rayyan Baniya (58'), Melih İbrahimoğlu (68')
    },
    fouls: { home: 17, away: 16 }, // mackolik.com maç detay sayfası, tek kaynak, çelişki yok
    offsides: { home: 2, away: 3 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 77, away: 80 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 0.6, away: 1.22 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    // saves ATLANDI: Kasımpaşa kalecisi Gianniotis'in 4 kurtarış yaptığı iki ayrı aramada doğrulandı, ancak Konyaspor kalecisi Bahadır Han Güngördü'nün TOPLAM kurtarış sayısı hiçbir kaynakta net biçimde verilmedi (sadece isimsiz iki kurtarış anı tasvir edildi) -- eksik çift UYDURULMADAN atlandı
    scorers: [],
    asOf: "2026-09-21",
    source: "Hürriyet / Fanatik / beIN Sports / sporkolik.net / canligaste.com / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg, 2. tazeleme)",
  },

  // Çorum FK 1-2 Alanyaspor (19 Eylül 2026)
  sr6m1: {
    possession: { home: 66, away: 34 }, // tek kaynak (aksiyon.com.tr türevi arama), çelişki yok
    shots: { home: 12, away: 9 }, // iki bağımsız arama turunda da aynı sayılar çıktı
    shotsOnTarget: { home: 6, away: 8 }, // iki bağımsız arama turunda da aynı sayılar çıktı
    corners: { home: 3, away: 3 }, // tek kaynak, çelişki yok
    cards: {
      home: { yellow: 4, red: 0 }, // Cengiz Ünder, Serdar Saatçı, Andrei Borza, Ahmed Ildız
      away: { yellow: 0, red: 0 }, // ikinci bir arama, Alanyaspor'un bu maçta hiç sarı kart görmediğini AÇIKÇA doğruladı
    },
    fouls: { home: 22, away: 8 }, // mackolik.com maç detay sayfası, tek kaynak, çelişki yok
    offsides: { home: 1, away: 0 }, // mackolik.com; bağımsız bir arama sonucu da "Ofsayt: Çorum FK 1, Alanyaspor 0" biçiminde AYNI sayıyı doğruladı
    passAccuracy: { home: 89, away: 79 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 1.11, away: 1.18 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    // saves ATLANDI: bulunan tek sayı çifti (Çorum FK 3, Alanyaspor 4), zaten doğrulanmış shotsOnTarget (6-8) ve gol sayılarıyla (1-2) matematiksel olarak ÇELİŞTİ (Çorum FK kalecisinin 8 isabetli şuttan 2 gol yedikten sonra ~6 kurtarış yapmış olması beklenirdi, bulunan sayı sadece 3'tü) -- uydurulmadan atlandı
    // bigChances / duelsWon ATLANDI: bulunan tek veri YALNIZCA ilk yarıya aitti ("ilk yarıda... 2 büyük fırsat", "ilk yarı ikili mücadele %42-%58"), maçın tamamı için karşılaştırılabilir değildi
    scorers: [
      { teamId: "s10", playerName: "Gaïus Makouta", minute: 67 },
      { teamId: "s13", playerName: "Jesus Ramirez", minute: 76 },
      { teamId: "s10", playerName: "Arda Usluoğlu", minute: 78 },
    ],
    asOf: "2026-09-21",
    source: "Hürriyet / ajansspor.com / Fanatik / Habertürk / Sporkolik.net / Fotomaç / aksiyon.com.tr (gol dakikaları topScorers.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg, 2. tazeleme)",
  },

  // Kocaelispor 2-0 Gaziantep FK (19 Eylül 2026)
  sr6m2: {
    // possession ATLANDI: bulunan tek veri sadece ilk yarı için verildi (Kocaelispor %52 / Gaziantep FK %48) ve maç sonu net bir yüzdeye dönüşmedi
    shots: { home: 19, away: 16 }, // tek kaynak, çelişki yok
    shotsOnTarget: { home: 10, away: 12 }, // tek kaynak, çelişki yok
    corners: { home: 1, away: 2 }, // tek kaynak, çelişki yok
    cards: {
      home: { yellow: 1, red: 0 }, // Gonçalo Sousa
      away: { yellow: 2, red: 0 }, // Halil İbrahim Dervişoğlu, Kacper Kozłowski
    },
    fouls: { home: 16, away: 12 }, // mackolik.com maç detay sayfası; ikinci bir arama da AYNI 16-12 sayısını doğruladı
    offsides: { home: 1, away: 2 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 79, away: 81 }, // mackolik.com; ikinci bir arama da AYNI 79-81 sayısını doğruladı
    xg: { home: 1.3, away: 1.03 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    // saves ATLANDI: bulunan tek sayı çifti (Kocaelispor 3, Gaziantep FK 3), zaten doğrulanmış shotsOnTarget (10-12) ve gol sayılarıyla (2-0) matematiksel olarak ÇELİŞTİ (Kocaelispor kalecisinin 12 isabetli şutu 0 gol yiyerek geçirmiş olması ~12 kurtarış gerektirirdi, bulunan sayı sadece 3'tü) -- uydurulmadan atlandı
    scorers: [
      { teamId: "s17", playerName: "Berkan Kutlu", minute: 56 },
      { teamId: "s17", playerName: "Dan Agyei", minute: 76 },
    ],
    asOf: "2026-09-21",
    source: "Habertürk / Fanatik / Sporx / beIN Sports / sporkolik.net (gol dakikaları topScorers.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg, 2. tazeleme)",
  },

  // Trabzonspor 4-0 Galatasaray (19 Eylül 2026) -- 6. hafta derbisi
  sr6m3: {
    possession: { home: 46, away: 54 }, // iki bağımsız arama turunda da aynı sayılar çıktı
    shots: { home: 7, away: 13 }, // iki bağımsız arama turunda da aynı sayılar çıktı
    // shotsOnTarget ATLANDI: iki arama turu birbiriyle çelişti (4/3 isabet vs 6/6 isabet)
    corners: { home: 1, away: 5 }, // iki bağımsız arama turunda da aynı sayılar çıktı
    cards: {
      home: { yellow: 4, red: 0 }, // Muçi, Savic, Mohamed Salah, Onana -- iki bağımsız arama turunda da aynı isim listesi çıktı
      away: { yellow: 1, red: 1 }, // sarı: Leroy Sane; kırmızı: Lesley Ugochukwu (87', VAR sonrası doğrudan kırmızı -- Habertürk/Fanatik/Cumhuriyet/Sabah/Fotomaç/Milliyet/Mynet ve src/data/injuries.js ile üç+ kaynaktan teyitli). Teknik direktör Okan Buruk'un 71'/72' aldığı kırmızı kart bir OYUNCU kartı olmadığı için (bkz. dosya başındaki not) buraya DAHİL EDİLMEDİ.
    },
    fouls: { home: 15, away: 18 }, // mackolik.com maç detay sayfası, tek kaynak, çelişki yok
    offsides: { home: 3, away: 0 }, // mackolik.com; Sabah/61saat kökenli bağımsız bir haber de "Trabzonspor 3 kez ofsayt oldu" diyerek AYNI sayıyı doğruladı
    passAccuracy: { home: 81, away: 82 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 2.2, away: 0.96 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    duelsWon: { home: 53, away: 62 }, // adet (yüzde değil); Sabah/61saat kökenli haber -- aynı haberin verdiği korner (1-5) ve ofsayt (3-0) sayıları mackolik'le birebir örtüştüğü için kaynak güvenilir kabul edildi
    // saves ATLANDI: Onana'nın (Trabzonspor) ve Uğurcan'ın (Galatasaray) "kritik kurtarışlar yaptığı" tasviri bulundu ama hiçbir kaynakta TOPLAM kurtarış sayısı net biçimde verilmedi
    scorers: [
      { teamId: "s4", playerName: "Mohamed Salah", minute: 4 },
      { teamId: "s4", playerName: "Noah Saviolo", minute: 39 },
      { teamId: "s4", playerName: "Mohamed Salah", minute: 44 },
      { teamId: "s4", playerName: "Mohamed Salah", minute: 80 },
    ],
    asOf: "2026-09-21",
    source: "Fanatik / Cumhuriyet / Habertürk / Sabah / Fotomaç / Milliyet / Mynet / sahadan.com (gol dakikaları topScorers.js/news.js'ten) / mackolik.com / fotmob.com / 61saat.com (fouls/offsides/passAccuracy/xg/duelsWon, 2. tazeleme)",
  },

  // İstanbul Başakşehir 4-0 Gençlerbirliği (19 Eylül 2026)
  sr6m4: {
    possession: { home: 53, away: 47 }, // tek kaynak, çelişki yok
    shots: { home: 18, away: 7 }, // tek kaynak, çelişki yok
    shotsOnTarget: { home: 11, away: 0 }, // tek kaynak, çelişki yok
    corners: { home: 3, away: 7 }, // tek kaynak, çelişki yok
    cards: {
      home: { yellow: 2, red: 0 }, // Umut Güneş, Olivier Kemen
      away: { yellow: 1, red: 0 }, // Abdurrahim Dursun
    },
    fouls: { home: 11, away: 9 }, // mackolik.com maç detay sayfası, tek kaynak, çelişki yok
    offsides: { home: 2, away: 3 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 88, away: 84 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 2.74, away: 0.52 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    saves: { home: 0, away: 7 }, // away: Gençlerbirliği kalecisi İrfan Can Eğribayat'ın 7 kurtarışı iki bağımsız kaynakta bulundu VE zaten doğrulanmış shotsOnTarget'la (11 isabetli şut - 4 gol = 7) matematiksel olarak birebir tutarlı; home: Başakşehir kalecisi Şengezer'in kurtaracağı isabetli şut hiç yoktu çünkü Gençlerbirliği'nin zaten doğrulanmış shotsOnTarget değeri 0'dı -- bu bir tahmin değil, zaten kanıtlanmış bir sayının kesin matematiksel sonucu
    // bigChances ATLANDI: "Başakşehir 4 büyük fırsat yarattı, hepsini gole çevirdi" bulundu ama Gençlerbirliği'nin karşılık gelen sayısı hiçbir kaynakta verilmedi -- eksik çift UYDURULMADAN atlandı
    scorers: [
      { teamId: "s5", playerName: "Andreas Skov Olsen", minute: 9 },
      { teamId: "s5", playerName: "Eldor Shomurodov", minute: 33 },
      { teamId: "s5", playerName: "Davie Selke", minute: 53, penalty: true },
      { teamId: "s5", playerName: "Eldor Shomurodov", minute: 65 },
    ],
    asOf: "2026-09-21",
    source: "Hürriyet / Fotomaç / Fanatik / Takvim / sporkolik.net / AA (gol dakikaları topScorers.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg/saves, 2. tazeleme)",
  },

  // Fenerbahçe 8-0 Eyüpspor (20 Eylül 2026)
  sr6m5: {
    // possession ATLANDI: hiçbir aramada net bir yüzde bulunamadı
    shots: { home: 24, away: 17 }, // tek kaynak, çelişki yok
    shotsOnTarget: { home: 20, away: 12 }, // tek kaynak, çelişki yok
    corners: { home: 8, away: 6 }, // tek kaynak, çelişki yok
    // cards ATLANDI: sadece 2 münferit sarı kart olayı (Anıl Yaşar / Eyüpspor, Romelu Lukaku / Fenerbahçe) bir canlı anlatım parçasında bulundu; bunun maçın TAM kart tablosu olduğu doğrulanamadı, bu yüzden toplam sayı UYDURULMADI
    fouls: { home: 12, away: 9 }, // mackolik.com maç detay sayfası, tek kaynak, çelişki yok
    offsides: { home: 5, away: 0 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 91, away: 86 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 5.14, away: 0.72 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    // saves ATLANDI: Fenerbahçe kalecisi Ederson'un "6 kurtarış" yaptığı bulundu, ancak zaten doğrulanmış shotsOnTarget (20-12) ve gol sayılarıyla (8-0) matematiksel olarak ÇELİŞTİ (Ederson'un 12 isabetli şuttan 0 gol yiyerek geçirmiş olması ~12 kurtarış gerektirirdi, bulunan sayı sadece 6'ydı) -- uydurulmadan atlandı
    scorers: [
      { teamId: "s2", playerName: "Mason Greenwood", minute: 5, penalty: true },
      { teamId: "s2", playerName: "Vedat Muriqi", minute: 7 },
      { teamId: "s2", playerName: "Vedat Muriqi", minute: 21 },
      { teamId: "s2", playerName: "Mattéo Guendouzi", minute: 38 },
      { teamId: "s2", playerName: "İrfan Can Kahveci", minute: 45 }, // 45+1'
      { teamId: "s2", playerName: "Vedat Muriqi", minute: 47 },
      { teamId: "s2", playerName: "Vedat Muriqi", minute: 55 },
      { teamId: "s2", playerName: "Mason Greenwood", minute: 80 },
    ],
    asOf: "2026-09-21",
    source: "ajansspor.com / Habertürk / Fanatik / Hürriyet (gol dakikaları topScorers.js/news.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg, 2. tazeleme)",
  },

  // Erzurumspor FK 1-0 Samsunspor (20 Eylül 2026)
  sr6m6: {
    // possession ATLANDI: net bir yüzde bulunamadı (sadece "Erzurumspor daha defansif oynadı" gibi tasviri ifadeler vardı)
    // shots ATLANDI: bulunan tek veri Erzurumspor için "rakip ceza sahasına 50 kez girdi" gibi şut sayısıyla eşleşmeyen belirsiz bir metrikti; Samsunspor'un toplam şut sayısı (8) tek başına anlamlı bir karşılaştırma sunmuyor
    corners: { home: 3, away: 5 }, // tek kaynak, çelişki yok
    // cards ATLANDI: Erzurumspor FK için 2 sarı kart (Miguel Cardoso, Elisha Owusu) iki ayrı aramada AÇIKÇA doğrulandı, ancak Samsunspor'un kart sayısı hiçbir kaynakta net biçimde takıma atfedilmeden verilmedi (bir aramada geçen "Emre Kılınç", "Brandon Baiye", "Samed Onur" isimlerinden Baiye'nin aslında Erzurumspor kadrosunda olduğu görüldüğü için bu isimlerin takım dağılımı güvenilir şekilde çözülemedi)
    fouls: { home: 11, away: 14 }, // mackolik.com maç detay sayfası, tek kaynak, çelişki yok
    offsides: { home: 0, away: 2 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 82, away: 87 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 0.72, away: 0.36 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    saves: { home: 2, away: 1 }, // isimlendirilmiş kaleciler: Ertuğrul Taşkıran (Erzurumspor) 2, Okan Koçuk (Samsunspor) 1 -- tek kaynak ama çelişkisiz, isimlendirilmiş somut sayı (dosyanın kabul ettiği ilkeyle tutarlı)
    scorers: [{ teamId: "s14", playerName: "Miguel Cardoso", minute: 45 }],
    asOf: "2026-09-21",
    source: "Fanatik / AA / Hürriyet / Sabah / sporkolik.net (gol dakikası topScorers.js/news.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg/saves, 2. tazeleme)",
  },

  // Amed SFK 3-2 Beşiktaş (20 Eylül 2026)
  sr6m7: {
    possession: { home: 30.5, away: 69.5 }, // tek kaynak, çelişki yok
    shots: { home: 10, away: 21 }, // tek kaynak, çelişki yok
    shotsOnTarget: { home: 8, away: 8 }, // tek kaynak, çelişki yok
    corners: { home: 1, away: 10 }, // tek kaynak, çelişki yok
    cards: {
      home: { yellow: 2, red: 1 }, // sarı: Mehmet Yeşil, Amadou Cisse (ilk sarısı); kırmızı: Amadou Cisse, 84' ikinci sarıdan -- Amedspor'a ait olduğu iki bağımsız aramada AÇIKÇA doğrulandı
      away: { yellow: 2, red: 0 }, // Emirhan Topçu, Orkun Kökçü
    }, // NOT: ayrı bir arama "Sarı Kart: 9-5, Kırmızı Kart: 1-0" biçiminde bir özet istatistik widget'ı da döndürdü, ancak bu widget'ın takım sırası belirsizdi ve kırmızı kartı Amedspor yerine Beşiktaş'a atfediyormuş gibi okunabiliyordu -- bu, Cisse'nin kırmızı kartının Amedspor'a ait olduğunu AÇIKÇA doğrulayan iki bağımsız kaynakla ÇELİŞTİĞİ için o widget verisi güvenilmeyip yukarıdaki isimlendirilmiş dökümle sınırlı kalındı
    fouls: { home: 25, away: 7 }, // mackolik.com maç detay sayfası; iki bağımsız arama da AYNI 25-7 sayısını doğruladı
    offsides: { home: 0, away: 2 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 73, away: 89 }, // mackolik.com, tek kaynak, çelişki yok
    xg: { home: 1.54, away: 2.04 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    // saves ATLANDI: Amedspor kalecisi Lafont için kaynaklar ÇELİŞTİ -- bazı aramalar "5 kurtarış" derken fotomac.com.tr'nin özel başlıklı haberi ("Lafont'tan 6 kurtarış") "6" veriyor; Beşiktaş kalecisi Nübel için bulunan "5" sayısı zaten doğrulanmış shotsOnTarget'la (8-3=5) tutarlı olsa da, çiftin diğer yarısı çelişkili olduğu için TÜM alan UYDURULMADAN atlandı
    scorers: [
      { teamId: "s11", playerName: "Gift Orban", minute: 13 },
      { teamId: "s11", playerName: "Dia Saba", minute: 22 },
      { teamId: "s3", playerName: "Dušan Vlahović", minute: 55 },
      { teamId: "s11", playerName: "Furkan Soyalp", minute: 59 },
      { teamId: "s3", playerName: "Orkun Kökçü", minute: 90, penalty: true }, // 90+8'
    ],
    asOf: "2026-09-21",
    source: "Fanatik / Hürriyet / NTV / Cumhuriyet / habergo.com.tr / gzt.com (gol dakikaları topScorers.js/news.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg, 2. tazeleme)",
  },

  // Göztepe 2-2 Çaykur Rizespor (20 Eylül 2026)
  sr6m8: {
    // possession ATLANDI: bulunan tek "top hakimiyeti" etiketli sayı çifti (%75 / %79) toplamda %100'ü aştığı için aslında pas isabeti yüzdesiydi, gerçek top hakimiyeti değildi
    shots: { home: 25, away: 11 }, // tek kaynak, çelişki yok
    shotsOnTarget: { home: 17, away: 7 }, // tek kaynak, çelişki yok
    corners: { home: 4, away: 3 }, // tek kaynak, çelişki yok
    cards: {
      home: { yellow: 5, red: 0 }, // Arda Kurtulan (16'), Matos (18'), Rhaldney (70'), Bekir Turaç Böke (79'), Taha Altıkardeş (85') -- toplam 5, ayrı bir aramanın verdiği "6 sarı kart" toplamıyla (5+1) tutarlı
      away: { yellow: 1, red: 0 }, // Ariss (90')
    },
    fouls: { home: 15, away: 9 }, // mackolik.com maç detay sayfası; bağımsız bir arama da AYNI 15-9 sayısını doğruladı
    offsides: { home: 3, away: 2 }, // mackolik.com, tek kaynak, çelişki yok
    passAccuracy: { home: 74, away: 79 }, // mackolik.com; away (79) ikinci bir aramayla birebir doğrulandı, home'da (74 vs 75) 1 puanlık küçük bir sapma görüldü ama bu iki farklı özetleme kaynağı arasında yuvarlama farkı olarak değerlendirildi, gerçek bir çelişki sayılmadı
    xg: { home: 2.78, away: 0.78 }, // fotmob.com maç sayfası, tek kaynak, çelişki yok
    bigChances: { home: 5, away: 1 }, // aynı arama sonucundaki korner (4-3) ve faul (15-9) sayıları zaten doğrulanmış/mackolik değerleriyle birebir örtüştüğü için kaynak güvenilir kabul edildi; dönüştürülen büyük fırsat sayıları (2 ve 1) gerçek gol sayılarıyla tutarlı
    // saves ATLANDI: Rizespor kalecisi Fofana'nın "8 kurtarış" yaptığı iki ayrı aramada tutarlı biçimde bulundu, ancak bu sayı zaten doğrulanmış shotsOnTarget (17-7) ve gol sayılarıyla (2-2) matematiksel olarak ÇELİŞTİ (Fofana'nın 17 isabetli şuttan sadece 2 gol yiyerek geçirmiş olması ~15 kurtarış gerektirirdi, bulunan sayı sadece 8'di) -- uydurulmadan atlandı
    scorers: [
      { teamId: "s7", playerName: "Arda Kurtulan", minute: 3 },
      { teamId: "s12", playerName: "İbrahim Olawoyin", minute: 70 },
      { teamId: "s12", playerName: "Iustin Doicaru", minute: 80 },
      { teamId: "s7", playerName: "Efkan Bekiroğlu", minute: 90, penalty: true }, // 90+4', beraberlik golü
    ],
    asOf: "2026-09-21",
    source: "ajansspor.com / Fotospor / Yeni Asır / takvim.com.tr / Sabah (gol dakikaları topScorers.js/news.js'ten) / mackolik.com / fotmob.com (fouls/offsides/passAccuracy/xg/bigChances, 2. tazeleme)",
  },
};

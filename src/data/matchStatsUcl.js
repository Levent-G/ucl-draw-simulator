// 2026-27 UEFA Şampiyonlar Ligi Lig Fazı 1. Hafta (8-10 Eylül 2026, 18 maçın
// TAMAMI, r1m0..r1m17) için GERÇEK maç istatistikleri -- kurgusal/tahmini
// DEĞİL. Kapsam: possession (topa sahip olma %), shots (toplam şut),
// shotsOnTarget (isabetli şut), corners (korner), cards (sarı/kırmızı kart),
// scorers (gol atan oyuncu + dakika, penaltı/kendi kalesi işaretli) ve
// opsiyonel zonePressure (bkz. aşağıdaki not).
//
// Yöntem: Her maç için en az 2 bağımsız kaynaktan (öncelikle ESPN'in resmi
// "Team Stats" sayfaları -- espn.com/soccer/team-stats/_/gameId/... --
// fotmob.com, sofascore.com, theanalyst.com/Opta, whoscored.com, ayrıca
// birincil maç raporları: UEFA.com, Sky Sports, VAVEL, beIN Sports,
// Bundesliga.com, Al Jazeera, Yahoo Sports, kulüplerin resmi siteleri)
// çapraz doğrulama yapılmıştır. Kaynaklar arasında rakam ÇELİŞTİĞİNDE (bazı
// WebFetch/otomatik özetleyici okumaları ev/deplasman sütunlarını karıştırdı)
// birden fazla bağımsız arama turuyla TUTARLI çıkan değer esas alınmış,
// hâlâ çelişen/doğrulanamayan alanlar (aşağıda listelenmiştir) o maçın
// nesnesinden TAMAMEN ÇIKARILMIŞTIR -- 0 ya da tahmini bir rakam
// YAZILMAMIŞTIR.
//
// Gol atıcıları: src/data/topScorers.js'teki (zaten çok turlu WebSearch ile
// doğrulanmış) UCL 1. Hafta bölümüyle VE src/data/news.js'teki maç
// özetleriyle (özellikle Galatasaray/Fenerbahçe maçları) tutarlı tutulmuştur.
// Kendi kalesi (ownGoal) golleri, golü atan takımın SKORUNA fayda sağlayan
// takımın teamId'siyle kaydedilmiştir (ör. bir Villarreal oyuncusunun kendi
// kalesine attığı gol Borussia Dortmund'un teamId'siyle, ownGoal:true
// bayrağıyla listelenir) -- bu, gerçek maç merkezlerinin (ESPN/UEFA) ekran
// gösterim biçimiyle örtüşür ve zaten hiçbir oyuncunun bireysel gol
// sayacına eklenmez (topScorers.js kendi kalesi gollerini hiç saymaz).
//
// zonePressure (opsiyonel alan): Gerçek oyuncu takip (player-tracking) ısı
// haritası verisi ücretsiz kaynaklardan elde edilemediği için bu alan HİÇBİR
// zaman gerçek bir ısı haritasını temsil etmez. Sadece maç raporlarının
// açıkça "yüksek pres uyguladı", "kendi sahasında derinde kaldı", "orta
// sahaya hakim oldu" gibi TANIMLAYICI dille desteklediği maçlarda, kabaca
// bölge/baskı yüzdesi olarak eklenmiştir (def+mid+att = ~100). Metnin bunu
// desteklemediği maçlarda alan TAMAMEN atlanmıştır -- uydurma yüzde YOK.
//
// ATLANDI (belirsiz/çelişkili/eksik veri -- hiçbir rakam UYDURULMADI):
// - r1m4 (Lille 2-3 Real Betis): Lille'in 2. golünün atıcısı kaynaklar
//   arasında ÇELİŞTİ (bkz. topScorers.js başındaki aynı not -- bazı
//   kaynaklar Alexsandro, bazıları Ueda'nın ikinci kez attığını, bir kaynak
//   ise yanlışlıkla Ethan Mbappé'yi işaret etti). Bu yüzden o gol burada da
//   hiçbir oyuncuya yazılmadı; sadece Ueda'nın kaynaklar arasında ORTAK olan
//   12. dakikadaki golü ile Betis'in tartışmasız 3 golü listelendi (toplam
//   ev sahibi gol sayısı skorla [2] eşleşmez görünür -- bu KASITLIDIR,
//   eksik golün atıcısı belirsiz kaldığı için eklenmedi).
// - r1m5 (Real Madrid 2-1 Inter) "cards" alanı: kart sayıları için
//   kaynaklar birbiriyle çelişti (ör. bir kaynak Real Madrid 1 sarı/Inter 3
//   sarı derken, başka bir okuma farklı rakamlar verdi); sadece Inter'den
//   Yann Bisseck'in uzatmalarda sarı kart gördüğü bağımsız olarak
//   doğrulanabildi ama TAKIM TOPLAMLARI güvenilir biçimde doğrulanamadığı
//   için "cards" alanı tamamen atlandı.
// - r1m9 (PSG 6-1 Slovan Bratislava) "cards" alanı: sadece Slovan
//   Bratislava'dan César Blackman'ın sarı kart gördüğü doğrulanabildi;
//   TAKIM TOPLAMLARI (PSG ve Slovan için) hiçbir kaynakta net biçimde
//   verilmediğinden "cards" alanı atlandı.
// - r1m17 (SK Slavia Prague 2-3 RC Lens) "shots"/"shotsOnTarget" alanları:
//   ESPN (5-8 toplam şut) ile fotmob.com (17-26 toplam şut) birbiriyle
//   ÇELİŞTİ, bu yüzden ikisi de kullanılmadı. "cards" alanı da atlandı --
//   Slavia'nın 49. dakikada (sahaya girişinden sadece birkaç dakika sonra,
//   Sima'ya son adam faulünden VAR incelemesiyle) Mikuláš Konečný'nin
//   KIRMIZI kart gördüğü ESPN VE fotmob.com'dan bağımsız olarak net biçimde
//   doğrulandı, ANCAK iki takımın toplam SARI kart sayıları hiçbir kaynakta
//   güvenilir biçimde bulunamadı; eksik bir "cards" nesnesi (sadece kırmızı
//   kart bilgisiyle) uydurma sarı kart sayısına yol açmamak için hiç
//   eklenmedi. (Bu kırmızı kart, topScorers.js'teki eski ATLANDI notunda
//   "Konečný'ye yanlışlıkla yazılan bir gol" olarak bahsedilen çelişkiyi de
//   açıklığa kavuşturuyor: Konečný o golü atmadı, aksine golden önce kısa
//   süreliğine sahada kaldıktan sonra kırmızı kart gördü -- Slavia'nın iki
//   golü de kaynakların 2/3 çoğunluğuna göre zaten Šturm'e aitti.)
//
// EK NOT (r1m2, Borussia Dortmund 3-2 Villarreal): topScorers.js'te
// Guirassy'nin sadece 2, Mouriño'nun sadece 1 golü listelenmiş olması bir
// eksiklik DEĞİLDİR -- maçın diğer iki golü (Dortmund'un 1. golü ve
// Villarreal'in 2. golü) kendi kaleye atılan gollerdi (sırasıyla Renato
// Veiga ve -- ironik biçimde -- Serhou Guirassy'nin kendi kalesi), bu yüzden
// topScorers.js'in "hiçbir oyuncunun gol sayacına eklenmeyen kendi kale
// golleri" kuralına göre orada hiç yer almıyorlar; burada ownGoal:true
// bayrağıyla ayrıca belgelendiler (kaynak: news.js + beIN Sports/Bundesliga.com).
//
// İKİNCİ TAZELEME (2026-09-21) -- EK İSTATİSTİK ALANLARI: kullanıcı "bir
// sürü istatistik olsun" isteğiyle her maça fouls (faul), offsides (ofsayt),
// saves (kaleci kurtarışı), passAccuracy (pas isabeti %), bigChances (büyük
// fırsat), duelsWon (ikili mücadele kazanma -- ESPN'in tablosunda YÜZDE
// DEĞİL, ham sayı olarak verildiği için burada da ham sayı olarak
// kaydedildi) ve xg (beklenen gol) eklendi. Kaynak öncelikle ESPN'in "Team
// Stats" sayfaları (bazı maçlarda Fox Sports/theanalyst.com/Opta ile çapraz
// doğrulandı). Kaynaklar arasında ÇELİŞEN (özellikle xg -- farklı sağlayıcılar
// farklı model kullandığı için en sık çelişen alan oldu) her alan o maçın
// nesnesinden TAMAMEN ÇIKARILDI, ilgili maçın yanına neden atlandığı satır
// içi yorumla not edildi. "freeKicks" (serbest vuruş) alanı HİÇBİR maç için
// eklenmedi -- ne ESPN'in Team Stats tablosunda ne de fotmob/sofascore'un
// erişilebilir sayfalarında takım bazlı bir "serbest vuruş" istatistiği
// bulunabildi (Sofascore/WhoScored bu alanı JavaScript ile render ediyor,
// WebFetch statik HTML çekemediği için erişilemedi) -- uydurma sayı
// YAZILMADI, alan sessizce atlandı.
//
// EK NOT (r1m10, Sporting CP 3-1 Galatasaray): topScorers.js'teki eski
// ATLANDI notu, 5. dakikadaki açılış golünün Gonçalo Inácio'nun (Galatasaray
// lehine) kendi kalesi mi yoksa "Torreira"nın golü mü olduğu konusunda
// ESPN ile VAVEL'in çeliştiğini belirtiyordu. Bu dosya için yapılan EK bir
// WebSearch turu, üçüncü bağımsız bir kaynağın (thesportsencounter.com)
// da "Sporting recovered from an early Gonçalo Inácio own goal" ifadesiyle
// ESPN'i doğruladığını gösterdi -- yani artık 2 bağımsız kaynak (ESPN +
// thesportsencounter.com) Inácio'nun kendi kalesi olduğunu tutarlı biçimde
// doğruluyor (VAVEL'in kendi içinde tutarsız skor etiketi zaten
// topScorers.js'te güvenilmez bulunmuştu). Bu yüzden burada ownGoal:true
// olarak eklendi -- bu, topScorers.js'teki golcü toplamlarıyla ÇELİŞMEZ,
// çünkü kendi kalesi golleri zaten hiçbir oyuncunun gol sayacına
// eklenmiyor.
export const UCL_MATCH_STATS = {
  r1m0: {
    // AEK Athens 1-0 LASK
    possession: { home: 49, away: 51 },
    shots: { home: 18, away: 11 },
    shotsOnTarget: { home: 4, away: 3 },
    corners: { home: 7, away: 3 },
    cards: { home: { yellow: 1, red: 0 }, away: { yellow: 2, red: 0 } },
    xg: { home: 1.59, away: 0.81 }, // ESPN + Sofascore tutarlı; fotmob'un farklı modeli 1.71/0.72 veriyor (kullanılmadı)
    fouls: { home: 7, away: 15 }, // deplasman değeri Sofascore ile de doğrulandı
    offsides: { home: 2, away: 0 },
    saves: { home: 3, away: 2 },
    passAccuracy: { home: 84, away: 81 },
    bigChances: { home: 3, away: 1 },
    duelsWon: { home: 60, away: 39 }, // ham sayı, yüzde değil
    scorers: [{ teamId: "t27", playerName: "Razvan Marin", minute: 21 }], // ~20 metreden frikik
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / fotmob.com / whoscored.com",
  },
  r1m1: {
    // Club Brugge 2-3 Aston Villa
    possession: { home: 36, away: 64 },
    shots: { home: 14, away: 21 },
    shotsOnTarget: { home: 7, away: 9 },
    corners: { home: 4, away: 5 },
    cards: { home: { yellow: 3, red: 0 }, away: { yellow: 3, red: 0 } },
    xg: { home: 1.46, away: 3.00 }, // ESPN + theanalyst.com (Opta) birebir aynı
    fouls: { home: 17, away: 14 }, // footballcritic.com ile birebir doğrulandı
    offsides: { home: 1, away: 2 },
    saves: { home: 5, away: 5 },
    passAccuracy: { home: 88, away: 83 }, // footballcritic.com ile birebir doğrulandı
    bigChances: { home: 1, away: 4 },
    duelsWon: { home: 52, away: 51 },
    scorers: [
      { teamId: "t20", playerName: "John McGinn", minute: 11 },
      { teamId: "t17", playerName: "Hugo Vetlesen", minute: 19 },
      { teamId: "t20", playerName: "Emiliano Buendía", minute: 22 },
      { teamId: "t20", playerName: "Nicolas Jackson", minute: 43 },
      { teamId: "t17", playerName: "Nicolò Tresoldi", minute: 61, penalty: true },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / theanalyst.com (Opta) / Sky Sports",
  },
  r1m2: {
    // Borussia Dortmund 3-2 Villarreal
    possession: { home: 52, away: 48 },
    shots: { home: 18, away: 13 },
    shotsOnTarget: { home: 6, away: 6 },
    corners: { home: 9, away: 7 },
    cards: { home: { yellow: 1, red: 0 }, away: { yellow: 3, red: 0 } },
    // xg ATLANDI: Dortmund'un değeri (2.83) iki kaynakta da aynıydı ama
    // Villarreal'in değeri ESPN'de 1.33, fotmob'ta 1.46 olarak çelişti.
    fouls: { home: 15, away: 10 },
    offsides: { home: 1, away: 3 },
    saves: { home: 5, away: 4 },
    passAccuracy: { home: 90, away: 86 },
    bigChances: { home: 4, away: 4 },
    duelsWon: { home: 42, away: 61 },
    scorers: [
      // Renato Veiga (Villarreal), kendi kalesine -- Dortmund lehine 1-0
      { teamId: "t12", playerName: "Renato Veiga", minute: 53, ownGoal: true },
      { teamId: "t14", playerName: "Santiago Mouriño", minute: 66 },
      { teamId: "t12", playerName: "Serhou Guirassy", minute: 80 },
      { teamId: "t12", playerName: "Serhou Guirassy", minute: 85, penalty: true },
      // Guirassy (Dortmund), uzatmalarda (90+3') kendi kalesine -- Villarreal lehine 3-2
      { teamId: "t14", playerName: "Serhou Guirassy", minute: 93, ownGoal: true },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / beIN Sports / Bundesliga.com / VAVEL / news.js",
  },
  r1m3: {
    // FC Porto 0-2 Manchester City
    possession: { home: 36, away: 64 },
    shots: { home: 5, away: 20 },
    shotsOnTarget: { home: 0, away: 10 },
    corners: { home: 2, away: 5 },
    cards: { home: { yellow: 1, red: 0 }, away: { yellow: 3, red: 0 } },
    xg: { home: 0.22, away: 2.31 }, // ESPN + theanalyst.com (Opta) + fotmob üçü de aynı
    // fouls ATLANDI: iki farklı ESPN türevi okuma birbirine ters (10/17 vs 17/10) rakam verdi, hangi takıma ait olduğu netleşmedi.
    offsides: { home: 7, away: 1 }, // ev sahibi (Porto) değeri theanalyst.com/Opta ile de doğrulandı
    saves: { home: 8, away: 0 },
    passAccuracy: { home: 81, away: 92 },
    bigChances: { home: 0, away: 5 },
    duelsWon: { home: 49, away: 43 }, // iki ayrı ESPN okumasında da aynı
    zonePressure: {
      // Porto ilk yarı boyunca çok derin savundu (Diogo Costa ilk yarıda 5 kurtarış
      // yaptı, Porto tüm maçta hiç isabetli şut çekemedi) -- bkz. Sky Sports maç raporu.
      home: { def: 55, mid: 30, att: 15 },
      away: { def: 15, mid: 30, att: 55 },
    },
    scorers: [
      { teamId: "t2", playerName: "Erling Haaland", minute: 47 },
      { teamId: "t2", playerName: "Erling Haaland", minute: 91 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / Sky Sports",
  },
  r1m4: {
    // Lille 2-3 Real Betis -- ATLANDI notuna bkz.: Lille'in 2. golü hiçbir
    // oyuncuya yazılmadı (kaynaklar arasında atıcı çelişkisi).
    possession: { home: 45, away: 55 },
    shots: { home: 6, away: 20 },
    shotsOnTarget: { home: 2, away: 5 },
    corners: { home: 5, away: 5 },
    cards: { home: { yellow: 1, red: 1 }, away: { yellow: 3, red: 0 } }, // kırmızı: Ethan Mbappé, 56'
    // xg ATLANDI: üç kaynak (ESPN/fotmob/Fox Sports) üçü de farklı değer verdi, konsensüs yok.
    fouls: { home: 11, away: 13 }, // Fox Sports ile birebir doğrulandı
    offsides: { home: 4, away: 0 }, // Fox Sports ile birebir doğrulandı
    saves: { home: 2, away: 0 }, // Fox Sports ile birebir doğrulandı
    // passAccuracy ATLANDI: ESPN 88/88, Fox Sports 86/90 -- çelişkili.
    bigChances: { home: 1, away: 3 },
    duelsWon: { home: 47, away: 34 },
    scorers: [
      { teamId: "t26", playerName: "Ayase Ueda", minute: 12 },
      { teamId: "t19", playerName: "Marc Bartra", minute: 33 },
      { teamId: "t19", playerName: "Marc Bartra", minute: 49 },
      { teamId: "t19", playerName: "Troy Parrott", minute: 53 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / VAVEL",
  },
  r1m5: {
    // Real Madrid 2-1 Inter -- "cards" ATLANDI notuna bkz. (takım toplamları çelişkili).
    possession: { home: 64, away: 36 },
    shots: { home: 16, away: 21 },
    shotsOnTarget: { home: 8, away: 7 },
    corners: { home: 11, away: 4 },
    xg: { home: 2.91, away: 1.78 }, // ESPN + theanalyst.com (Opta) aynı; Fox Sports'un farklı değeri (1.94/1.59) dışlandı
    fouls: { home: 12, away: 10 }, // Fox Sports ile birebir doğrulandı
    offsides: { home: 2, away: 4 }, // Fox Sports (ESPN bu maçta ofsayt vermedi)
    // saves ATLANDI: ev sahibi (7) iki kaynakta da aynı ama deplasman ESPN 6/Fox Sports 7 çelişti.
    // passAccuracy ATLANDI: ev sahibi (87) aynı ama deplasman ESPN %94/Fox Sports %95 çelişti.
    bigChances: { home: 4, away: 4 },
    duelsWon: { home: 37, away: 39 },
    scorers: [
      { teamId: "t1", playerName: "Kylian Mbappé", minute: 14 },
      { teamId: "t1", playerName: "Federico Valverde", minute: 23 },
      { teamId: "t6", playerName: "Carlos Augusto", minute: 77 },
    ],
    asOf: "2026-09-21",
    source: "ESPN / Yahoo Sports / Managing Madrid / Al Jazeera",
  },
  r1m6: {
    // Barcelona 5-1 Feyenoord
    possession: { home: 72, away: 28 },
    shots: { home: 24, away: 4 },
    shotsOnTarget: { home: 9, away: 2 },
    corners: { home: 4, away: 1 },
    cards: { home: { yellow: 1, red: 0 }, away: { yellow: 1, red: 0 } },
    // xg ATLANDI: üç kaynak (ESPN/fotmob/Fox Sports) üçü de farklı değer verdi.
    fouls: { home: 10, away: 12 }, // Fox Sports ile birebir doğrulandı
    offsides: { home: 2, away: 8 }, // Fox Sports ile birebir doğrulandı
    // saves ATLANDI: deplasman (4) iki kaynakta aynı ama ev sahibi ESPN 1/Fox Sports 2 çelişti.
    passAccuracy: { home: 94, away: 83 }, // Fox Sports ile birebir doğrulandı
    bigChances: { home: 3, away: 2 },
    duelsWon: { home: 54, away: 53 },
    scorers: [
      { teamId: "t7", playerName: "Raphinha", minute: 3 },
      { teamId: "t7", playerName: "Karim Adeyemi", minute: 22 },
      { teamId: "t7", playerName: "Raphinha", minute: 57 },
      { teamId: "t7", playerName: "Lamine Yamal", minute: 77 },
      { teamId: "t16", playerName: "Sem Steijn", minute: 82 },
      { teamId: "t7", playerName: "Gabriel Jesus", minute: 85 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / VAVEL",
  },
  r1m7: {
    // VfB Stuttgart 3-1 Viking
    possession: { home: 62, away: 38 },
    shots: { home: 17, away: 9 },
    shotsOnTarget: { home: 3, away: 3 },
    corners: { home: 4, away: 5 },
    cards: { home: { yellow: 0, red: 0 }, away: { yellow: 3, red: 0 } },
    // xg ATLANDI: üç kaynak (ESPN/fotmob/Fox Sports) üçü de farklı değer verdi.
    fouls: { home: 13, away: 13 }, // Fox Sports ile birebir doğrulandı
    offsides: { home: 4, away: 0 }, // Fox Sports ile birebir doğrulandı
    saves: { home: 2, away: 0 }, // Fox Sports ile birebir doğrulandı
    // passAccuracy ATLANDI: ESPN 86/71, Fox Sports 89/73 -- çelişkili.
    bigChances: { home: 5, away: 1 },
    duelsWon: { home: 45, away: 50 },
    scorers: [
      { teamId: "t21", playerName: "Ermedin Demirović", minute: 20 },
      { teamId: "t30", playerName: "Zlatko Tripić", minute: 22 },
      { teamId: "t21", playerName: "Ermedin Demirović", minute: 26 },
      { teamId: "t21", playerName: "Ermedin Demirović", minute: 32 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / Bundesliga.com / Yahoo Sports",
  },
  r1m8: {
    // Liverpool 2-1 Atletico Madrid
    possession: { home: 45, away: 55 },
    shots: { home: 14, away: 9 },
    shotsOnTarget: { home: 5, away: 4 },
    corners: { home: 7, away: 5 },
    cards: { home: { yellow: 1, red: 0 }, away: { yellow: 1, red: 0 } },
    xg: { home: 1.69, away: 0.81 }, // ESPN + bir Sofascore makalesinde birebir aynı değer
    fouls: { home: 11, away: 10 },
    offsides: { home: 3, away: 5 },
    saves: { home: 3, away: 3 },
    passAccuracy: { home: 84, away: 85 },
    bigChances: { home: 4, away: 1 },
    duelsWon: { home: 41, away: 46 },
    scorers: [
      { teamId: "t10", playerName: "Marcos Llorente", minute: 17 },
      { teamId: "t5", playerName: "Dominik Szoboszlai", minute: 40 },
      { teamId: "t5", playerName: "Alexis Mac Allister", minute: 50 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / VAVEL / theanalyst.com",
  },
  r1m9: {
    // Paris Saint-Germain 6-1 Slovan Bratislava -- "cards" ATLANDI notuna bkz.
    possession: { home: 72, away: 28 },
    shots: { home: 21, away: 5 },
    shotsOnTarget: { home: 10, away: 2 },
    corners: { home: 7, away: 2 },
    xg: { home: 4.71, away: 0.64 }, // ESPN; fotmob'un benzer modeli 4.57/0.76 veriyor, aynı sonucu doğruluyor
    fouls: { home: 8, away: 6 },
    // offsides ATLANDI: ESPN'in bu maça özel Team Stats sayfası bu alanı hiç vermiyor (cards gibi eksik).
    saves: { home: 3, away: 8 }, // isabetli şut sayılarıyla iç tutarlılığı kontrol edildi
    passAccuracy: { home: 92, away: 74 },
    bigChances: { home: 5, away: 1 },
    duelsWon: { home: 35, away: 44 },
    zonePressure: {
      // "PSG dominated territory and possession with their full-backs pushing
      // high and the midfield constantly looking to break lines" -- birincil
      // maç anlatımı yüksek pres/alan hakimiyetini açıkça tarif ediyor.
      home: { def: 15, mid: 35, att: 50 },
      away: { def: 55, mid: 30, att: 15 },
    },
    scorers: [
      { teamId: "t4", playerName: "Ousmane Dembélé", minute: 17 },
      { teamId: "t4", playerName: "Ousmane Dembélé", minute: 23 },
      { teamId: "t4", playerName: "Ferran Torres", minute: 31 },
      { teamId: "t4", playerName: "Ferran Torres", minute: 47 },
      { teamId: "t4", playerName: "Ferran Torres", minute: 57 },
      { teamId: "t32", playerName: "Suleiman Camara", minute: 58 },
      { teamId: "t4", playerName: "Fabián Ruiz", minute: 87 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / VAVEL / Yahoo Sports",
  },
  r1m10: {
    // Sporting CP 3-1 Galatasaray
    possession: { home: 62, away: 38 },
    shots: { home: 8, away: 10 },
    shotsOnTarget: { home: 5, away: 3 },
    corners: { home: 1, away: 4 },
    cards: { home: { yellow: 2, red: 0 }, away: { yellow: 3, red: 0 } },
    // xg ATLANDI: ESPN (1.55/1.02) ile fotmob (1.75/1.23) arasındaki fark diğer maçlara göre daha büyük, konsensüs yok.
    fouls: { home: 13, away: 11 },
    offsides: { home: 3, away: 0 },
    saves: { home: 3, away: 2 },
    passAccuracy: { home: 81, away: 90 },
    bigChances: { home: 1, away: 2 },
    duelsWon: { home: 41, away: 36 },
    scorers: [
      // Gonçalo Inácio (Sporting), kendi kalesine -- Galatasaray lehine 1-0
      // (bkz. dosya başındaki EK NOT: ESPN + thesportsencounter.com ile
      // doğrulandı).
      { teamId: "t35", playerName: "Gonçalo Inácio", minute: 5, ownGoal: true },
      { teamId: "t23", playerName: "Geny Catamo", minute: 26 },
      { teamId: "t23", playerName: "Luis Suárez", minute: 56, penalty: true },
      { teamId: "t23", playerName: "Rodrigo Zalazar", minute: 64 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / thesportsencounter.com / whoscored.com / allfootball.com",
  },
  r1m11: {
    // Napoli 0-1 Arsenal
    possession: { home: 42, away: 58 },
    shots: { home: 5, away: 26 },
    shotsOnTarget: { home: 3, away: 8 },
    corners: { home: 0, away: 6 },
    cards: { home: { yellow: 2, red: 0 }, away: { yellow: 1, red: 0 } },
    xg: { home: 0.22, away: 4.05 }, // ESPN + fotmob birebir aynı
    fouls: { home: 12, away: 11 },
    offsides: { home: 1, away: 1 },
    saves: { home: 6, away: 3 },
    passAccuracy: { home: 86, away: 92 },
    bigChances: { home: 0, away: 6 },
    duelsWon: { home: 36, away: 36 },
    zonePressure: {
      // "Napoli looked threatening on the break" (kontra atak) -- Arsenal
      // sahaya ve topa hakim oldu (%58 pas, 26 şut), Napoli derin savundu.
      home: { def: 55, mid: 30, att: 15 },
      away: { def: 15, mid: 30, att: 55 },
    },
    scorers: [{ teamId: "t11", playerName: "Martin Ødegaard", minute: 75 }],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / VAVEL / Sky Sports / Yahoo Sports",
  },
  r1m12: {
    // Fenerbahçe 1-1 Roma
    possession: { home: 42, away: 58 },
    shots: { home: 11, away: 8 },
    shotsOnTarget: { home: 5, away: 3 },
    corners: { home: 1, away: 3 },
    cards: { home: { yellow: 4, red: 0 }, away: { yellow: 2, red: 0 } },
    xg: { home: 1.64, away: 0.53 }, // ESPN; fotmob'un benzer modeli 1.57/0.48 veriyor, aynı sonucu doğruluyor
    fouls: { home: 12, away: 19 },
    offsides: { home: 1, away: 0 },
    saves: { home: 2, away: 4 },
    passAccuracy: { home: 84, away: 90 },
    bigChances: { home: 3, away: 1 },
    duelsWon: { home: 51, away: 37 },
    scorers: [
      { teamId: "t13", playerName: "Bryan Cristante", minute: 39 },
      { teamId: "t25", playerName: "Archie Brown", minute: 48 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / FOX Sports / news.js",
  },
  r1m13: {
    // PSV Eindhoven 1-1 Shakhtar Donetsk
    possession: { home: 54, away: 46 },
    shots: { home: 10, away: 8 },
    shotsOnTarget: { home: 2, away: 2 },
    corners: { home: 3, away: 3 },
    cards: { home: { yellow: 3, red: 0 }, away: { yellow: 6, red: 0 } },
    // xg ATLANDI: ESPN (0.49/0.51) ile fotmob (0.44/0.62) yön olarak aynı ama değer olarak çelişti.
    fouls: { home: 14, away: 15 },
    offsides: { home: 1, away: 0 },
    saves: { home: 1, away: 1 },
    passAccuracy: { home: 87, away: 81 },
    bigChances: { home: 0, away: 0 },
    duelsWon: { home: 50, away: 44 },
    scorers: [
      { teamId: "t18", playerName: "Gleiker Mendoza", minute: 46 }, // 45+1'
      { teamId: "t24", playerName: "Sergiño Dest", minute: 48 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / Shakhtar.com (resmi)",
  },
  r1m14: {
    // Como 4-1 RB Leipzig
    possession: { home: 50, away: 50 },
    shots: { home: 14, away: 14 },
    shotsOnTarget: { home: 6, away: 4 },
    corners: { home: 1, away: 5 },
    cards: { home: { yellow: 2, red: 0 }, away: { yellow: 3, red: 0 } },
    // xg ATLANDI: ESPN (2.30/1.42) ile fotmob (2.98/1.36) ev sahibi değerinde geniş farkla çelişti.
    fouls: { home: 9, away: 10 },
    offsides: { home: 5, away: 1 },
    saves: { home: 3, away: 2 },
    passAccuracy: { home: 90, away: 89 },
    bigChances: { home: 5, away: 3 },
    duelsWon: { home: 53, away: 38 },
    scorers: [
      { teamId: "t34", playerName: "Martin Baturina", minute: 15 },
      { teamId: "t34", playerName: "Anastasios Douvikas", minute: 38 },
      { teamId: "t34", playerName: "Assane Diao", minute: 54 },
      { teamId: "t15", playerName: "Andrija Maksimović", minute: 58 },
      { teamId: "t34", playerName: "Máximo Perrone", minute: 90 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / VAVEL / Yahoo Sports / Bundesliga.com",
  },
  r1m15: {
    // Bayern Münih 5-0 Bodø/Glimt
    possession: { home: 66, away: 34 },
    shots: { home: 25, away: 3 },
    shotsOnTarget: { home: 12, away: 0 },
    corners: { home: 6, away: 3 },
    // Kırmızı kart: Bodø/Glimt'ten Odin Bjørtuft (Olise'ye müdahale, hakem
    // Rade Obrenović) -- dakikası kaynaklarda net verilmedi ama olayın
    // kendisi ve takımı iki bağımsız kaynaktan (beIN Sports, Outlook India)
    // doğrulandı.
    cards: { home: { yellow: 0, red: 0 }, away: { yellow: 1, red: 1 } },
    xg: { home: 2.49, away: 0.20 }, // ESPN; fotmob'un benzer modeli 2.61/0.30 veriyor, aynı sonucu doğruluyor
    fouls: { home: 5, away: 8 },
    offsides: { home: 3, away: 1 },
    saves: { home: 0, away: 6 },
    passAccuracy: { home: 93, away: 80 },
    bigChances: { home: 3, away: 0 },
    duelsWon: { home: 44, away: 36 },
    zonePressure: {
      // İlk yarı 0-0 bitti, Bayern ikinci yarıda 5 gol birden buldu --
      // maçın geneli Bayern'in ezici saha/şut hakimiyetini yansıtıyor
      // (25 şut - 3 şut, %66 top hakimiyeti).
      home: { def: 15, mid: 30, att: 55 },
      away: { def: 55, mid: 30, att: 15 },
    },
    scorers: [
      { teamId: "t3", playerName: "Jamal Musiala", minute: 47 },
      { teamId: "t3", playerName: "Harry Kane", minute: 61 },
      { teamId: "t3", playerName: "Alphonso Davies", minute: 77 },
      { teamId: "t3", playerName: "Michael Olise", minute: 83 },
      { teamId: "t3", playerName: "Michael Olise", minute: 92 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / beIN Sports / Outlook India / VAVEL",
  },
  r1m16: {
    // Manchester United 4-0 Sabah
    possession: { home: 58, away: 42 },
    shots: { home: 21, away: 11 },
    shotsOnTarget: { home: 10, away: 0 },
    corners: { home: 7, away: 2 },
    cards: { home: { yellow: 1, red: 0 }, away: { yellow: 1, red: 0 } },
    xg: { home: 3.67, away: 0.92 }, // ESPN + theanalyst.com (Opta) tutarlı
    fouls: { home: 12, away: 13 },
    offsides: { home: 0, away: 0 },
    saves: { home: 0, away: 5 }, // ESPN "maç liderleri" modülüyle de doğrulandı (Pokatilov 5 kurtarış)
    passAccuracy: { home: 91, away: 86 },
    bigChances: { home: 4, away: 2 },
    duelsWon: { home: 50, away: 42 },
    scorers: [
      { teamId: "t8", playerName: "Matheus Cunha", minute: 27 },
      { teamId: "t8", playerName: "Bruno Fernandes", minute: 42 },
      { teamId: "t8", playerName: "Benjamin Sesko", minute: 45 },
      { teamId: "t8", playerName: "Lisandro Martínez", minute: 68 },
    ],
    asOf: "2026-09-21",
    source: "ESPN (Team Stats) / Sky Sports / Al Jazeera / VAVEL",
  },
  r1m17: {
    // SK Slavia Prague 2-3 RC Lens -- "shots"/"shotsOnTarget" ve "cards"
    // ATLANDI notlarına bkz. (yukarı bakınız).
    possession: { home: 37, away: 63 },
    corners: { home: 6, away: 9 },
    // xg ATLANDI: ev sahibi değeri ESPN'de 2.12, fotmob'ta 1.58 -- geniş fark, konsensüs yok.
    fouls: { home: 8, away: 8 },
    // offsides ATLANDI: ESPN'in bu maça özel sayfası bu alanı hiç vermiyor.
    // saves ATLANDI: deplasman (Lens, 3) iki ayrı ESPN modülünde de aynı ama ev sahibi (Slavia) bir modülde 4, diğerinde 7 çelişti.
    passAccuracy: { home: 72, away: 82 },
    bigChances: { home: 3, away: 3 },
    duelsWon: { home: 39, away: 47 },
    scorers: [
      // Mikuláš Konečný 49'da (sahaya girdikten dakikalar sonra, Sima'ya son
      // adam faulünden VAR ile) KIRMIZI KART gördü, gol ATMADI -- bkz.
      // dosya başındaki ATLANDI notu. Slavia'nın iki golü de Šturm'e ait
      // (kaynakların 2/3 çoğunluğu: VAVEL, GiveMeSport + bu turda fotmob.com).
      { teamId: "t29", playerName: "Danijel Šturm", minute: 51 },
      { teamId: "t22", playerName: "Abdallah Sima", minute: 73 },
      { teamId: "t29", playerName: "Danijel Šturm", minute: 88 },
      { teamId: "t22", playerName: "Florian Thauvin", minute: 91 },
      { teamId: "t22", playerName: "Ruben Aguilar", minute: 93 },
    ],
    asOf: "2026-09-21",
    source: "ESPN / fotmob.com / VAVEL / GiveMeSport",
  },
};

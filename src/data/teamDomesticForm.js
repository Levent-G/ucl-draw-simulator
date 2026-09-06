// 2026-27 UEFA Şampiyonlar Ligi lig fazına katılan 36 kulübün KENDİ İÇ LİG
// (domestik) durumları -- UCL performansları DEĞİL. Web araştırmasıyla
// (ESPN puan durumu tabloları, ilgili ülkelerin "2026-27 [Lig]" Wikipedia
// sayfaları, resmi lig siteleri -- LALIGA, Premier League, Bundesliga,
// nikeliga.sk, sportnet.sme.sk -- ve güncel maç sonucu haberleri: lagrada.org,
// ceskenoviny.cz, nltimes.nl, vavel.com, flashscore) 2026-09-01 - 2026-09-06
// aralığında toplanmış GERÇEK, tarihli bir "anlık görüntü"dür. (İlk sürüm
// 2026-09-01/03 tarihliydi; 2026-09-06'da 34 kulübün büyük kısmı bir sonraki
// oynanmış maç haftasına göre yeniden doğrulanıp güncellendi -- Süper Lig
// [t25/t35] hariç, o veri liveStatus.js'ten canlı geliyor ve burada
// DOKUNULMADI. LASK [t33] ve Sabah [t31] için doğrulanabilir YENİ bir maç
// bulunamadığı için o iki satır da olduğu gibi bırakıldı.)
//
// NOT: liveStatus.js'teki gibi bu da CANLI/otomatik güncellenen bir veri
// kaynağı DEĞİLDİR (statik site, arka uç yok) -- araştırıldığı ana ait
// donmuş bir görüntüdür. Sezon ilerledikçe manuel olarak tazelenmelidir.
// Hiçbir pozisyon/puan/form kurgusal DEĞİLDİR -- doğrulanamayan hiçbir
// değer uydurulmamıştır (bkz. aşağıdaki "form doğrulanamadı" notları).
//
// Alanlar:
//   league   : kulübün oynadığı iç lig adı
//   country  : ülke (Türkçe, teams.js -> COUNTRY_NAMES ile aynı sözlük)
//   position : lig sıralamasındaki güncel yeri (null = sezon başlamadı)
//   played   : oynanan maç sayısı
//   w/d/l    : galibiyet/beraberlik/mağlubiyet
//   pts      : puan
//   form     : son maçlar, ESKİDEN YENİYE sırayla ("W"/"D"/"L"), en fazla 5
//              eleman. Sıra tam olarak doğrulanamayan birkaç takımda
//              (aşağıda "form sırası kesin doğrulanamadı" notu olanlar)
//              W/D/L SAYILARI gerçek puan durumuyla birebir tutarlıdır,
//              yalnızca hangi maçın hangi sırada oynandığı %100 net
//              değildir. Hiçbir sonuç icat edilmemiştir.
//   asOf     : bu satırın ait olduğu gerçek tarih (kaynağın tarihine göre)
//
// Kaynaklar (kulüp bazında yorum satırlarında da belirtilmiştir):
//  - ESPN Soccer Standings (espn.com/soccer/standings, ülke bazlı ligler)
//  - Wikipedia "2026-27 La Liga / Premier League / Bundesliga / Serie A /
//    Ligue 1 / Eredivisie / Belgian Pro League / Azerbaijan Premier
//    League / 2026 Eliteserien" sayfaları
//  - nikeliga.sk (Slovakya), footystats.org, statmuse.com (PL tablosu),
//    resmi kulüp/lig haberleri (ESPN maç raporları, Al Jazeera canlı
//    anlatım, çeşitli ulusal spor siteleri)
//  - Süper Lig satırları bu depodaki src/data/liveStatus.js dosyasındaki
//    SUPER_LIG_LIVE_STANDINGS / SUPER_LIG_LIVE_RESULTS ile birebir aynı
//    kaynaktan (24 Ağustos 2026, 2. Hafta sonrası) alınmıştır.

export const TEAM_DOMESTIC_FORM = {
  // ---- La Liga (İspanya) -- ESPN + Wikipedia, 4. hafta sonrası, 5 Eylül 2026 ----
  // Barcelona 4. haftayı (Valencia deplasmanı) henüz oynamadığı için değiştirilmedi.
  t1: { league: "La Liga", country: "İspanya", position: 2, played: 4, w: 3, d: 0, l: 1, pts: 9, form: ["W", "W", "W", "L"], asOf: "2026-09-05" }, // Real Madrid (4. hafta Real Betis'e deplasmanda 0-1 kaybetti -- lagrada.org)
  t7: { league: "La Liga", country: "İspanya", position: 1, played: 3, w: 3, d: 0, l: 0, pts: 9, form: ["W", "W", "W"], asOf: "2026-08-31" }, // Barcelona
  t10: { league: "La Liga", country: "İspanya", position: 7, played: 4, w: 2, d: 1, l: 1, pts: 7, form: ["W", "W", "D", "L"], asOf: "2026-09-05" }, // Atletico Madrid (4. hafta Athletic Bilbao'ya deplasmanda 0-3 kaybetti -- ESPN)
  // Pozisyon MD4 sonrası bağımsız kaynakla teyit edilemedi (çelişkili arama sonuçları); MD3 pozisyonu (15.) korunmuştur, sadece maç/form verisi güncellendi.
  t14: { league: "La Liga", country: "İspanya", position: 15, played: 4, w: 0, d: 2, l: 2, pts: 2, form: ["D", "D", "L", "L"], asOf: "2026-09-05" }, // Villarreal (4. hafta evinde RC Deportivo'ya 2-3 kaybetti -- lagrada.org)
  t19: { league: "La Liga", country: "İspanya", position: 3, played: 4, w: 3, d: 0, l: 1, pts: 9, form: ["W", "W", "L", "W"], asOf: "2026-09-05" }, // Real Betis (4. hafta Real Madrid'i evinde 1-0 yendi -- lagrada.org)

  // ---- Premier Lig (İngiltere) -- ESPN puan durumu tablosu, 3. hafta sonrası, 5 Eylül 2026 ----
  t2: { league: "Premier Lig", country: "İngiltere", position: 1, played: 3, w: 3, d: 0, l: 0, pts: 9, form: ["W", "W", "W"], asOf: "2026-09-05" }, // Manchester City (3. haftada da kazanarak 3/3 yaptı)
  t5: { league: "Premier Lig", country: "İngiltere", position: 6, played: 3, w: 1, d: 2, l: 0, pts: 5, form: ["D", "D", "W"], asOf: "2026-09-05" }, // Liverpool (3. hafta galibiyetle puanını 5'e çıkardı -- ESPN)
  // Manchester United 3. haftayı henüz oynamadı; sadece pozisyon (rakiplerin sonuçlarıyla) güncellendi.
  t8: { league: "Premier Lig", country: "İngiltere", position: 12, played: 2, w: 1, d: 0, l: 1, pts: 3, form: ["L", "W"], asOf: "2026-09-05" }, // Manchester United
  // Arsenal 3. haftayı henüz oynamadı; sadece pozisyon güncellendi.
  t11: { league: "Premier Lig", country: "İngiltere", position: 3, played: 2, w: 2, d: 0, l: 0, pts: 6, form: ["W", "W"], asOf: "2026-09-05" }, // Arsenal
  t20: { league: "Premier Lig", country: "İngiltere", position: 17, played: 3, w: 0, d: 1, l: 2, pts: 1, form: ["L", "L", "D"], asOf: "2026-09-05" }, // Aston Villa (3. hafta Hull City ile deplasmanda 0-0 berabere kaldı)

  // ---- Bundesliga (Almanya) -- ESPN, 2. hafta sonrası (4-5 Eylül'de oynandı), 5 Eylül 2026 ----
  t3: { league: "Bundesliga", country: "Almanya", position: 4, played: 2, w: 1, d: 1, l: 0, pts: 4, form: ["W", "D"], asOf: "2026-09-05" }, // Bayern Münih (Stuttgart'ı 5-1 yendi, 2. hafta Schalke ile deplasmanda 0-0 berabere kaldı)
  t12: { league: "Bundesliga", country: "Almanya", position: 2, played: 2, w: 2, d: 0, l: 0, pts: 6, form: ["W", "W"], asOf: "2026-09-05" }, // Borussia Dortmund (2. hafta Hoffenheim'ı deplasmanda 3-2 yendi)
  t15: { league: "Bundesliga", country: "Almanya", position: 7, played: 2, w: 1, d: 0, l: 1, pts: 3, form: ["W", "L"], asOf: "2026-09-05" }, // RB Leipzig (2. hafta Werder Bremen'e deplasmanda 1-2 kaybetti)
  t21: { league: "Bundesliga", country: "Almanya", position: 8, played: 2, w: 1, d: 0, l: 1, pts: 3, form: ["L", "W"], asOf: "2026-09-05" }, // VfB Stuttgart (Bayern'e 1-5 kaybetti, 2. hafta Köln'ü 4-1 yendi)

  // ---- Serie A (İtalya) -- ESPN + Wikipedia, 3. hafta sonrası, 5 Eylül 2026 ----
  t6: { league: "Serie A", country: "İtalya", position: 2, played: 3, w: 3, d: 0, l: 0, pts: 9, form: ["W", "W", "W"], asOf: "2026-09-05" }, // Inter (Monza 4-1, + galibiyet, 3. hafta Napoli'yi 3-2 yendi)
  t9: { league: "Serie A", country: "İtalya", position: 10, played: 3, w: 1, d: 0, l: 2, pts: 3, form: ["L", "W", "L"], asOf: "2026-09-05" }, // Napoli (Atalanta'ya 1-2 kaybetti, sonra 3-2 kazandı, 3. hafta Inter'e 2-3 kaybetti)
  t13: { league: "Serie A", country: "İtalya", position: 1, played: 3, w: 3, d: 0, l: 0, pts: 9, form: ["W", "W", "W"], asOf: "2026-09-05" }, // Roma (Fiorentina'yı 4-0, Lecce deplasmanında 4-0, 3. hafta Atalanta'yı 2-1 yendi)
  t34: { league: "Serie A", country: "İtalya", position: 3, played: 3, w: 2, d: 1, l: 0, pts: 7, form: ["W", "D", "W"], asOf: "2026-09-05" }, // Como (Cagliari'yi 2-1, Udinese ile 1-1, 3. hafta Genoa'yı deplasmanda 2-0 yendi)

  // ---- Ligue 1 (Fransa) -- ESPN + Wikipedia, 3. hafta sonrası, 5 Eylül 2026 ----
  t4: { league: "Ligue 1", country: "Fransa", position: 13, played: 3, w: 0, d: 2, l: 1, pts: 2, form: ["D", "D", "L"], asOf: "2026-09-05" }, // Paris Saint-Germain (Nice 0-0, Brest 4-4, 3. hafta AS Monaco'ya evinde 1-2 kaybetti -- vavel.com)
  t22: { league: "Ligue 1", country: "Fransa", position: 10, played: 3, w: 1, d: 0, l: 2, pts: 3, form: ["W", "L", "L"], asOf: "2026-09-05" }, // RC Lens (Auxerre'i 5-2 yendi, sonra bir mağlubiyet, 3. hafta Lorient'e evinde 0-1 kaybetti)
  t26: { league: "Ligue 1", country: "Fransa", position: 3, played: 3, w: 2, d: 1, l: 0, pts: 7, form: ["D", "W", "W"], asOf: "2026-09-05" }, // Lille (Brest ile 2-2, Lyon'u 4-2, 3. hafta Toulouse'u deplasmanda 1-0 yendi)

  // ---- Süper Lig (Türkiye) -- src/data/liveStatus.js SUPER_LIG_LIVE_STANDINGS/RESULTS ile birebir aynı kaynak, 2. hafta sonrası, 24 Ağustos 2026 ----
  t25: { league: "Süper Lig", country: "Türkiye", position: 8, played: 2, w: 1, d: 0, l: 1, pts: 3, form: ["L", "W"], asOf: "2026-08-24" }, // Fenerbahçe (Gençlerbirliği'ne 1-2, Konyaspor'u 4-2)
  t35: { league: "Süper Lig", country: "Türkiye", position: 2, played: 2, w: 1, d: 1, l: 0, pts: 4, form: ["D", "W"], asOf: "2026-08-24" }, // Galatasaray (Çorum FK ile 2-2, Erzurumspor deplasmanında 4-0)

  // ---- Liga Portugal (Portekiz) -- ESPN, 5. hafta sonrası, 5 Eylül 2026 ----
  // Sporting: 1.hf Estrela Amadora ile 2-2, 2.hf Vitória SC'yi 3-2 yendi (doğrulandı);
  // kalan 2 galibiyetin sırası kaynaklarda net değil ama toplam sayılar puan
  // durumuyla birebir tutarlı. 5. hafta Rio Ave'yi deplasmanda 4-0 yendiği (5 Eylül)
  // ayrıca doğrulandı.
  t23: { league: "Liga Portugal", country: "Portekiz", position: 2, played: 5, w: 4, d: 1, l: 0, pts: 13, form: ["D", "W", "W", "W", "W"], asOf: "2026-09-05" }, // Sporting CP
  t28: { league: "Liga Portugal", country: "Portekiz", position: 1, played: 5, w: 5, d: 0, l: 0, pts: 15, form: ["W", "W", "W", "W", "W"], asOf: "2026-09-05" }, // FC Porto (5. hafta Moreirense'yi evinde 2-1 yendi, 5/5 galibiyet)

  // ---- Eredivisie (Hollanda) -- ESPN, 5. hafta sonrası, 5 Eylül 2026 ----
  // Feyenoord: 4.hf (30 Ağu) ADO Den Haag ile 2-2 berabere kaldığı doğrulandı; kalan
  // 3 maçın 2G-1B olduğu toplam puan durumuyla tutarlı, tam sıra kesin değil.
  // 5. hafta (5 Eylül) NEC Nijmegen'i deplasmanda 3-1 yendiği ayrıca doğrulandı (nltimes.nl).
  t16: { league: "Eredivisie", country: "Hollanda", position: 3, played: 5, w: 3, d: 2, l: 0, pts: 11, form: ["W", "W", "D", "D", "W"], asOf: "2026-09-05" }, // Feyenoord
  // PSV: 1.hf (8 Ağu) Fortuna Sittard ile 2-2, 4.hf (30 Ağu) FC Utrecht'i 6-1 yendiği
  // doğrulandı; kalan 2 maçın galibiyet olduğu toplam puan durumuyla tutarlı.
  // 5. hafta (5 Eylül) Ajax'ı deplasmanda 3-1 yendiği ayrıca doğrulandı (ESPN/FOX Sports).
  t24: { league: "Eredivisie", country: "Hollanda", position: 1, played: 5, w: 4, d: 1, l: 0, pts: 13, form: ["D", "W", "W", "W", "W"], asOf: "2026-09-05" }, // PSV Eindhoven

  // ---- Jupiler Pro League (Belçika) -- ESPN, 5. hafta sonrası, 5 Eylül 2026 ----
  // Club Brugge: sezon açılışı (7 Ağu) Kortrijk'i 3-0, sonra OH Leuven'i 3-0, KAA
  // Gent'e 1-2 kaybettiği, 23 Ağustos'ta Cercle Brugge'ü 1-0 yendiği doğrulandı --
  // 5. hafta (4 Eylül) Lommel'i deplasmanda 0-1 yendiği ayrıca doğrulandı (ESPN/Sports Mole).
  t17: { league: "Jupiler Pro League", country: "Belçika", position: 2, played: 5, w: 4, d: 0, l: 1, pts: 12, form: ["W", "W", "L", "W", "W"], asOf: "2026-09-05" }, // Club Brugge

  // ---- Ukrayna Premier Ligi -- Wikipedia "2026-27 Ukrainian Premier League", 5. hafta sonrası, 5 Eylül 2026 ----
  // Sonuç dizisi (5-1 Kudrivka, 2-1 Karpaty, 3-0 Epitsentr, 2-0 Obolon, 0-1 deplasmanda
  // Polissya) toplam 4G-0B-1M/12 puan tablosuyla birebir tutarlıdır.
  t18: { league: "Ukrayna Premier Ligi", country: "Ukrayna", position: 2, played: 5, w: 4, d: 0, l: 1, pts: 12, form: ["W", "W", "W", "W", "L"], asOf: "2026-09-05" }, // Shakhtar Donetsk (5. hafta lider Polissya'ya deplasmanda 0-1 kaybetti)

  // ---- Chance Liga (Çekya) -- Slavia'nın resmi/haber kaynaklarından, 7. tur sonrası, 5 Eylül 2026 ----
  // Toplam 5G-2B-0M / 17 puan / 1. sıra doğrulandı; 7. turda (5 Eylül) Zbrojovka Brno'yu
  // evinde 4-0 yendiği kesin (ceskenoviny.cz). Ancak önceki turların tam kronolojik
  // sırası (hangi maçların beraberlik olduğu) hâlâ güvenilir şekilde doğrulanamadığından
  // form burada icat EDİLMEMİŞ; yalnızca kesin doğrulanan EN SON maç (galibiyet) tek
  // eleman olarak eklenmiştir (Bodø/Glimt/Viking satırlarındaki yöntemle aynı).
  t29: { league: "Chance Liga", country: "Çekya", position: 1, played: 7, w: 5, d: 2, l: 0, pts: 17, form: ["W"], note: "Önceki turların kesin sırası doğrulanamadı; toplam 5G-2B-0M/17 puan ve en son maçın (Zbrojovka Brno'yu 4-0 yenmesi, 5 Eylül) galibiyet olduğu doğrulanmıştır.", asOf: "2026-09-05" }, // Slavia Prague

  // ---- Eliteserien (Norveç) -- ESPN puan durumu tablosu, 19. hafta sonrası, 5 Eylül 2026 (Nisan-Kasım sezonu, diğer liglerden çok daha ileride) ----
  // Form: yalnızca doğrulanabilen en güncel maç sonuçları kullanıldı (daha eski
  // maçların sırası uydurulmadı). 19. haftadaki galibiyet/beraberlik ESPN tablosundaki
  // toplam istatistik değişiminden (w/d/l farkı) çıkarılmıştır, rakip doğrulanamadı.
  t36: { league: "Eliteserien", country: "Norveç", position: 1, played: 19, w: 15, d: 2, l: 2, pts: 47, form: ["W"], note: "Son 5 maçın tamamı doğrulanamadı; yalnızca en son maç (19. hafta galibiyeti, ESPN tablosundaki puan/averaj artışından teyitli) kesin.", asOf: "2026-09-05" }, // Bodø/Glimt
  t30: { league: "Eliteserien", country: "Norveç", position: 2, played: 19, w: 14, d: 2, l: 3, pts: 44, form: ["W", "W", "D"], note: "Son 5 maçın tamamı doğrulanamadı; yalnızca son 2 galibiyet (Sandnes Ulf, Start) ve 19. haftadaki beraberlik (ESPN tablosundaki d artışından teyitli) kesin.", asOf: "2026-09-05" }, // Viking FK

  // ---- Azerbaycan Premyer Ligi -- Wikipedia "2026-27 Azerbaijan Premier League", 2. hafta sonrası, 31 Ağustos 2026 ----
  // NOT: 5-6 Eylül 2026 için (3. hafta, Zirə FK karşısında) güvenilir/doğrulanabilir yeni
  // bir sonuç bulunamadığı için bu satır GÜNCELLENMEDİ, olduğu gibi bırakıldı.
  t31: { league: "Azerbaycan Premyer Ligi", country: "Azerbaycan", position: 4, played: 2, w: 2, d: 0, l: 0, pts: 6, form: ["W", "W"], asOf: "2026-08-31" }, // Sabah

  // ---- Niké Liga (Slovakya) -- sportnet.sme.sk resmi maç raporları, 7. tur sonrası, 5 Eylül 2026 ----
  // Son maçın (30 Ağustos, Michalovce'a 1-2 kaybı) en güncel sonuç olduğu doğrulandı;
  // kalan 4 maçın galibiyet olduğu toplam puan durumuyla (4G-0B-1M/12 puan) tutarlı.
  // 7. turda (5 Eylül) DAC Dunajská Streda'ya evinde 0-2 kaybettiği ("ikinci art arda
  // mağlubiyet", 4. sırada 12 puan) sportnet.sme.sk'de ayrıca doğrulandı.
  t32: { league: "Niké Liga", country: "Slovakya", position: 4, played: 6, w: 4, d: 0, l: 2, pts: 12, form: ["W", "W", "W", "L", "L"], asOf: "2026-09-05" }, // Slovan Bratislava

  // ---- Avusturya Bundesligası -- ESPN, 5. hafta sonrası, 31 Ağustos 2026 ----
  // NOT: 5-6 Eylül 2026 için doğrulanabilir yeni bir maç/tablo değişikliği bulunamadığı
  // (ESPN'in en güncel tablosu da hâlâ aynı 5/5 galibiyet durumunu gösteriyor) için bu
  // satır GÜNCELLENMEDİ, olduğu gibi bırakıldı.
  t33: { league: "Avusturya Bundesligası", country: "Avusturya", position: 1, played: 5, w: 5, d: 0, l: 0, pts: 15, form: ["W", "W", "W", "W", "W"], asOf: "2026-08-31" }, // LASK

  // ---- Yunanistan Süper Ligi -- ESPN, 3. hafta sonrası, 5 Eylül 2026 ----
  t27: { league: "Yunanistan Süper Ligi", country: "Yunanistan", position: 1, played: 3, w: 2, d: 1, l: 0, pts: 7, form: ["W", "D", "W"], asOf: "2026-09-05" }, // AEK Athens (3. hafta Aris Selanik'i evinde 5-0 yendi)
};

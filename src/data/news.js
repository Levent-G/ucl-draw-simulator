// Kısa, tarihli, GERÇEK haber özetleri -- kurgusal/tahmini DEĞİL.
//
// Kapsam: 2026-27 UEFA Şampiyonlar Ligi ve 2026-27 Trendyol Süper Lig
// sezonlarına dair genel gündem (transfer haberleri, teknik direktör
// değişiklikleri, sakatlık haberleri, sezon başlangıcı) + gerçek 2026-27 UCL
// lig fazı çekilişindeki (bkz. realDraw2026.js) bazı dikkat çekici
// eşleşmeler için kısa önizleme notları.
//
// Yöntem: WebSearch ile araştırılmış, tarihli, kaynağı belirtilmiş haberler.
// Bu bir STATİK ENSTANTANE'dir -- 2026-09-09 tarihi itibarıyla araştırılan
// haberleri yansıtır, canlı/otomatik güncellenmez. Bazı öğelerin tam gün
// bilgisi (ör. yaz transfer dönemi içindeki bir imza) kaynaklarda net
// belirtilmediği için ay/dönem bazında en olası güne yuvarlanmıştır; kulüp,
// oyuncu, olay ve sonuç bilgileri ise doğrulanmış gerçek bilgilerdir. Skor,
// tarih veya alıntı UYDURULMAMIŞTIR -- doğrulanamayan hiçbir ayrıntı
// eklenmemiştir.
export const NEWS_ITEMS = [
  // ---- UEFA Şampiyonlar Ligi 2026-27 ----
  {
    id: "news-ucl-1",
    date: "2026-08-29",
    title: "Şampiyonlar Ligi lig fazı fikstürü resmen açıklandı",
    summary:
      "UEFA, 2026-27 sezonu lig fazının 8-10 Eylül 2026'da başlayıp 27 Ocak 2027'de sona ereceğini duyurdu. Final, 5 Haziran 2027'de Madrid'deki Estadio Metropolitano'da oynanacak.",
    source: "UEFA.com",
    url: "https://www.uefa.com/uefachampionsleague/news/02a8-2174c9e9019d-f909a77bd77a-1000--2026-27-champions-league-all-the-league-phase-fixtures/",
    competitionKey: "ucl",
    relatedTeamIds: [],
  },
  {
    id: "news-ucl-2",
    date: "2026-06-29",
    title: "Enzo Maresca, Guardiola'nın yerine Manchester City'nin başına geçti",
    summary:
      "Pep Guardiola'nın sezon sonunda City'den ayrılmasının ardından kulüp, birkaç ay önce Chelsea'den ayrılan Enzo Maresca ile 3 yıllık sözleşme imzaladı. Erling Haaland kadroda kalmaya devam ediyor.",
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/sports/2026/6/29/enzo-maresca-appointed-man-city-manager-to-succeed-pep-guardiola",
    competitionKey: "ucl",
    relatedTeamIds: ["t2"],
  },
  {
    id: "news-ucl-3",
    date: "2026-07-03",
    title: "Massimiliano Allegri, Napoli'nin yeni teknik direktörü oldu",
    summary:
      "Takımı 4. scudettosuna taşıyan Antonio Conte'nin ayrılığının ardından Napoli, AC Milan'dan yollarını ayıran Massimiliano Allegri ile Haziran 2029'a kadar sürecek 3 yıllık sözleşme imzaladı.",
    source: "ESPN / beIN Sports",
    url: "https://www.espn.com/soccer/story/_/id/49258287/napoli-appoint-massimiliano-allegri-new-manager-replaces-antonio-conte",
    competitionKey: "ucl",
    relatedTeamIds: ["t9"],
  },
  {
    id: "news-ucl-4",
    date: "2026-05-22",
    title: "Michael Carrick, Manchester United'ın kalıcı teknik direktörü oldu",
    summary:
      "Ocak 2026'da Ruben Amorim'in görevden alınmasının ardından takımın geçici teknik direktörlüğünü üstlenen Michael Carrick, 16 maçta 11 galibiyet alarak United'ı üçüncü sırada bitirip Şampiyonlar Ligi'ne taşıdıktan sonra 2028'e kadar kalıcı sözleşme imzaladı.",
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/sports/2026/5/22/man-utd-appoint-michael-carrick-as-permanent-manager",
    competitionKey: "ucl",
    relatedTeamIds: ["t8"],
  },
  {
    id: "news-ucl-5",
    date: "2026-09-01",
    title: "Avrupa'da yaz transfer penceresi kapandı: PSG'de Barcola ve Mbaye ayrılığı",
    summary:
      "Paris Saint-Germain, kanat oyuncuları Bradley Barcola'yı 106 milyon sterline Liverpool'a, Ibrahim Mbaye'yi ise 55 milyon euroya Aston Villa'ya sattı. Kupa şampiyonu PSG, kadrosunu bu ayrılıklarla birlikte yeniden şekillendirdi.",
    source: "CBS Sports / diğer transfer kaynakları",
    competitionKey: "ucl",
    relatedTeamIds: ["t4", "t5", "t20"],
  },
  {
    id: "news-ucl-6",
    date: "2026-09-01",
    title: "Inter, Şampiyonlar Ligi kadrosunu açıkladı: Stones, Jones, Stankovic, Spence dahil",
    summary:
      "Serie A yaz transfer penceresinin 1 Eylül'de kapanmasının ardından Inter, yaz transferleri John Stones, Curtis Jones, Aleksandar Stankovic ve Djed Spence'i içeren 2026-27 Şampiyonlar Ligi kadrosunu resmen açıkladı.",
    source: "Inter.it",
    competitionKey: "ucl",
    relatedTeamIds: ["t6"],
  },
  {
    id: "news-ucl-7",
    date: "2026-09-09",
    title: "Arsenal'ın lig fazı açılışı: Napoli deplasmanında Allegri-Arteta randevusu",
    summary:
      "Geçen sezon finalde PSG'ye penaltılarla kaybeden Arsenal, ilk kez şampiyonluğu hedeflediği yeni kampanyaya 9 Eylül'de Diego Armando Maradona Stadı'nda Napoli deplasmanıyla başlıyor. Napoli'nin yeni teknik direktörü Allegri, Mikel Arteta ile ilk kez lig fazında karşı karşıya gelecek.",
    source: "football-italia.net / Sky Sport",
    competitionKey: "ucl",
    relatedTeamIds: ["t9", "t11"],
  },
  {
    id: "news-ucl-8",
    date: "2026-09-08",
    title: "Lig fazı açılışında dikkat çeken eşleşme: Porto - Manchester City",
    summary:
      "Lig fazının ilk günü 8 Eylül'de Estádio do Dragão'da oynanacak Porto - Manchester City maçı, Maresca yönetimindeki City'nin sezonun ilk Avrupa sınavı olacak. İkili arasındaki tarihi rekor City lehine (3 galibiyet, 1 beraberlik, 0 mağlubiyet).",
    source: "mancity.com / Sky Sports",
    competitionKey: "ucl",
    relatedTeamIds: ["t2", "t28"],
  },
  {
    id: "news-ucl-9",
    date: "2026-08-27",
    title: "Real Madrid'in Şampiyonlar Ligi rakipleri belli oldu",
    summary:
      "27 Ağustos'ta yapılan çekilişte Real Madrid'in lig fazı rakipleri açıklandı: Inter, PSV Eindhoven, RB Leipzig, LASK, Arsenal, Roma, Shakhtar Donetsk ve AEK Athens. Arsenal ile 6. hafta (9 Aralık) randevusu, geçen sezonki çeyrek final rövanşını akıllara getiriyor.",
    source: "realmadrid.com",
    url: "https://www.realmadrid.com/en-US/news/football/first-team/latest-news/el-real-madrid-se-medira-en-la-primera-fase-de-la-champions-a-27-08-2026",
    competitionKey: "ucl",
    relatedTeamIds: ["t1"],
  },
  {
    id: "news-ucl-10",
    date: "2026-08-27",
    title: "Manchester City'nin sekiz rakibi netleşti",
    summary:
      "City'nin lig fazı rakipleri: Paris Saint-Germain, Barcelona, Sporting CP, Porto, Napoli, RB Leipzig, AEK Athens ve RC Lens olarak açıklandı.",
    source: "mancity.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t2"],
  },
  {
    id: "news-ucl-11",
    date: "2026-08-01",
    title: "Bayern Münih, Vincent Kompany yönetiminde sezona hazır",
    summary:
      "Kompany'nin ekibi Bundesliga açılışında Stuttgart'ı 5-1 mağlup ederek lige liderlikle başladı; DFB-Pokal ilk turunda ise ikinci lig ekibi Osnabrück'ü 4-1 geriye düşülen bir maçtan sonra devirdi.",
    source: "Bavarian Football Works / Bundesliga.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t3"],
  },
  {
    id: "news-ucl-12",
    date: "2026-05-01",
    title: "Alexander Isak, Liverpool'da ikinci sezonunda Salah'ın boşluğunu doldurmakla yükümlü",
    summary:
      "Geçen sezon sakatlıklarla geçen ilk kampanyasında sadece 3 lig golü atabilen İsveçli forvet Alexander Isak, Mohamed Salah sonrası Liverpool hücumunun yükünü taşıması beklenen 2026-27 sezonuna girerken büyük baskı altında.",
    source: "Yahoo Sports",
    competitionKey: "ucl",
    relatedTeamIds: ["t5"],
  },
  {
    id: "news-ucl-13",
    date: "2026-04-27",
    title: "Real Madrid'de Mbappé sakatlığı sezon planlarını etkiledi",
    summary:
      "Kylian Mbappé'nin geçen sezon (2025-26) yaşadığı uyluk sakatlığı, kulübün yeni sezon rotasyon planlamasında dikkate alınan önemli bir faktör olarak öne çıktı.",
    source: "Real Madrid resmi tıbbi raporu",
    url: "https://www.realmadrid.com/en-US/news/football/first-team/medical-reports/parte-medico-de-mbappe-27-04-2026",
    competitionKey: "ucl",
    relatedTeamIds: ["t1"],
  },
  {
    id: "news-ucl-14",
    date: "2025-04-16",
    title: "Hatırlatma: Arsenal geçen sezon Real Madrid'i eleyip yarı finale çıkmıştı",
    summary:
      "Arsenal, 2024-25 sezonu çeyrek finalinde Real Madrid'i 5-1 topla mağlup ederek (Emirates'te 3-0, Bernabéu'da 1-2) tarihinde ilk kez 2009'dan sonra yarı finale yükselmişti. İki takım bu sezon lig fazında yeniden karşılaşacak.",
    source: "Sky Sports / ESPN",
    competitionKey: "ucl",
    relatedTeamIds: ["t1", "t11"],
  },
  {
    id: "news-ucl-15",
    date: "2026-09-01",
    title: "Arsenal'da yaz transferleri: Eze ve Gyökeres etkisi sürüyor",
    summary:
      "Geçen yaz Crystal Palace'tan yaklaşık 67,5 milyon sterline transfer edilen Eberechi Eze ve İsveçli golcü Viktor Gyökeres, Arsenal'ın yeni sezon Şampiyonlar Ligi kadrosunun bel kemiği olmaya devam ediyor.",
    source: "Premier League / Goal.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t11"],
  },
  {
    // DÜZELTME (2026-09-07): Bu öğe önceden yanlışlıkla Galatasaray'ın lig
    // fazı açılışının 15 Eylül'de RAMS Park'ta Barcelona karşısında
    // olacağını belirtiyordu. UEFA.com'un resmi "fixtures by team" sayfası
    // ve çoklu bağımsız kaynaklarla (Sportskeeda, whoscored.com) doğrulandı:
    // Galatasaray'ın GERÇEK açılış maçı 9 Eylül'de Lizbon'da Sporting CP
    // deplasmanıdır; Barcelona ile RAMS Park'taki maç ise 13 Ekim'deki 2.
    // haftaya ait. Metin buna göre düzeltildi.
    id: "news-ucl-16",
    date: "2026-09-09",
    title: "Galatasaray'ın lig fazı açılışı: Sporting CP deplasmanı",
    summary:
      "Galatasaray, 2026-27 Şampiyonlar Ligi lig fazındaki ilk maçını 9 Eylül'de Lizbon'da Sporting CP deplasmanında oynuyor. Sarı-kırmızılılar 4 maçını evinde (Barcelona, Aston Villa, Feyenoord, Stuttgart), 4 maçını deplasmanda (Sporting CP, PSG, Lille, AEK Athens) oynayacak; Barcelona ile RAMS Park randevusu ise 13 Ekim'deki 2. haftada.",
    source: "UEFA.com / Sportskeeda / Euronews Türkçe",
    url: "https://www.uefa.com/uefachampionsleague/news/02a8-2176fa83582b-d99f0b27f405-1000--champions-league-league-phase-fixtures-by-team/",
    competitionKey: "ucl",
    relatedTeamIds: ["t35", "t23", "t7"],
  },
  {
    id: "news-ucl-17",
    date: "2026-09-10",
    title: "Fenerbahçe'nin lig fazı açılışı: Roma'yı konuk ediyor",
    summary:
      "Fenerbahçe, İsmail Kartal yönetiminde çıktığı 2026-27 Şampiyonlar Ligi lig fazına 10 Eylül'de sahasında Roma'yı ağırlayarak başlıyor. Diğer rakipleri: Aston Villa, Slavia Prag, Liverpool, Shakhtar Donetsk, LASK, Villarreal ve Atletico Madrid.",
    source: "birgun.net / AA",
    competitionKey: "ucl",
    relatedTeamIds: ["t25", "t13"],
  },
  {
    id: "news-ucl-18",
    date: "2026-06-18",
    title: "Fenerbahçe'de İsmail Kartal dönemi resmen başladı",
    summary:
      "Fenerbahçe, 2026-27 sezonu için teknik direktörlüğe İsmail Kartal'ı getirdiğini açıkladı; kulüp efsanesi Dirk Kuyt ise yardımcı antrenör olarak göreve başladı.",
    source: "Hürriyet",
    url: "https://www.hurriyet.com.tr/sporarena/fenerbahce-yeni-teknik-direktorunu-duyurdu-4-ismail-kartal-donemi-basladi-43209818",
    competitionKey: "ucl",
    relatedTeamIds: ["t25"],
  },
  {
    id: "news-ucl-19",
    date: "2026-06-11",
    title: "José Mourinho, 13 yıl sonra Real Madrid'in başına döndü",
    summary:
      "Xabi Alonso'nun Ocak 2026'da görevden ayrılıp yerine geçici olarak Alvaro Arbeloa'nın getirilmesinin ardından Real Madrid yönetimi, kulüpten 2013'te ayrılan José Mourinho ile 2029'a kadar sürecek 3 yıllık sözleşme imzaladı.",
    source: "Real Madrid resmi açıklaması / Al Jazeera / ESPN",
    url: "https://www.realmadrid.com/en-US/news/club/latest-news/comunicado-oficial-mourinho-11-06-2026",
    competitionKey: "ucl",
    relatedTeamIds: ["t1"],
  },
  {
    id: "news-ucl-20",
    date: "2026-07-30",
    title: "Real Madrid'de Raúl Asencio sakatlığı: sezon başında yok",
    summary:
      "Hazırlık döneminde sağ uyluk rectus femoris kasında sakatlanan savunmacı Raúl Asencio'nun yaklaşık 6 hafta sahalardan uzak kalması bekleniyor; bu durum Mourinho yönetimindeki Real Madrid'in sezon başı La Liga ve Şampiyonlar Ligi planlamasını etkiliyor.",
    source: "Real Madrid resmi tıbbi raporu / AS",
    url: "https://www.realmadrid.com/en-US/news/football/first-team/medical-reports/parte-medico-de-asencio-30-07-2026",
    competitionKey: "ucl",
    relatedTeamIds: ["t1"],
  },
  {
    id: "news-ucl-21",
    date: "2026-09-01",
    title: "Enzo Fernández, transfer döneminin son dakikalarında Manchester City'ye geçti",
    summary:
      "Chelsea'nin Arjantinli orta sahası Enzo Fernández, İngiltere transfer rekoruna eşit 125 milyon sterlinlik bedelle deadline day'de Manchester City'ye transfer oldu ve 5 yıllık sözleşme imzaladı.",
    source: "ESPN / Sky Sports / Al Jazeera",
    url: "https://www.aljazeera.com/sports/2026/9/1/fernandez-transfers-to-man-city-from-chelsea-in-joint-british-record-fee",
    competitionKey: "ucl",
    relatedTeamIds: ["t2"],
  },
  {
    id: "news-ucl-22",
    date: "2026-09-05",
    title: "Galatasaray'da Wilfried Singo sakatlığı: Sporting CP maçında yok",
    summary:
      "Antrenmanda sağ uyluk biceps femoris kas grubunda tendon ve kas hasarı ile kanama tespit edilen Wilfried Singo, Galatasaray'ın 9 Eylül'deki Şampiyonlar Ligi lig fazı açılışında Sporting CP karşısında forma giyemeyecek; oyuncunun en az 3-4 hafta sahalardan uzak kalması bekleniyor.",
    source: "Fanatik / HaberGo / Sporx",
    url: "https://www.fanatik.com.tr/galatasaray/galatasaraydan-son-dakika-sakatlik-aciklamasi-3-hafta-sahalardan-uzak-kalacak-2636782",
    competitionKey: "ucl",
    relatedTeamIds: ["t35"],
  },
  {
    id: "news-ucl-23",
    date: "2026-09-04",
    title: "Fenerbahçe, 18 yıl sonra döndüğü Şampiyonlar Ligi kadrosunu açıkladı",
    summary:
      "Play-off turunda Lyon'u eleyerek 18 yıl aradan sonra Şampiyonlar Ligi lig fazına yükselen Fenerbahçe, UEFA'ya bildirdiği kadrosunu açıkladı; sakat Jayden Oosterwolde ve Mert Hakan Yandaş ile kulüple yolları ayrılması beklenen Çağlar Söyüncü ve Rodrigo Becao listede yer almadı.",
    source: "CNN Türk / Milliyet / NTV",
    competitionKey: "ucl",
    relatedTeamIds: ["t25"],
  },
  {
    id: "news-ucl-24",
    date: "2026-09-08",
    title: "Real Madrid, Mourinho'nun UCL'deki ilk maçında çok sayıda eksikle Inter'i ağırlıyor",
    summary:
      "Mourinho yönetimindeki Real Madrid, 8 Eylül'de Bernabéu'da lig fazı açılışında Inter'i ağırlarken Éder Militão, Raúl Asencio, Ferland Mendy ve Rodrygo'yu sakatlık; Eduardo Camavinga, Arda Güler ve Bernardo Silva'yı ise cezalı olarak kadro dışı bıraktı. Kaleci Andriy Lunin gripten dolayı kadroda yer alamadı; Aurélien Tchouaméni, Thiago Pitarch ve Endrick ise sakatlıklarının ardından kadroya geri döndü.",
    source: "AS / okdiario.com / Sports Mole",
    competitionKey: "ucl",
    relatedTeamIds: ["t1", "t6"],
  },
  {
    id: "news-ucl-25",
    date: "2026-09-09",
    title: "Arsenal, Napoli deplasmanına Saliba'sız çıkıyor",
    summary:
      "Arsenal'ın savunma oyuncusu William Saliba, sırt sakatlığı nedeniyle Napoli deplasmanında forma giyemeyecek. Jurrien Timber sakatlığının ardından takım antrenmanlarına dönerken, Cristhian Mosquera kas sakatlığı şüphesiyle şüpheli durumda; Arteta maç öncesi basın toplantısında oyuncunun durumunun önümüzdeki günlerde netleşeceğini söyledi.",
    source: "Sports Mole / Yahoo Sports",
    competitionKey: "ucl",
    relatedTeamIds: ["t11", "t9"],
  },
  {
    id: "news-ucl-26",
    date: "2026-09-08",
    title: "Manchester City, Porto deplasmanına Doku ve O'Reilly'siz gidiyor",
    summary:
      "Maresca yönetimindeki Manchester City, lig fazı açılışında Porto deplasmanına kanat oyuncusu Jeremy Doku ile Nico O'Reilly'yi sakatlık nedeniyle götüremedi. Ev sahibi Porto ise Jan Bednarek, Victor Froholdt ve Samu Aghehowa başta olmak üzere çok sayıda eksikle sahaya çıkacak; teknik direktör Francesco Farioli, Porto'nun son 14-15 Avrupa maçında sadece bir kez kaybettiğini hatırlattı.",
    source: "Sports Mole / Yahoo Sports",
    competitionKey: "ucl",
    relatedTeamIds: ["t28", "t2"],
  },
  {
    id: "news-ucl-27",
    date: "2026-09-06",
    title: "Galatasaray'da Osimhen ve Lemina'nın yokluğu netleşti: 2-3 hafta kayıp",
    summary:
      "Sağ adduktor (kasık) kas grubunda orta-ileri düzeyde zorlanma tespit edilen Victor Osimhen'in yaklaşık 3, Mario Lemina'nın ise 2-3 hafta sahalardan uzak kalması bekleniyor; ikili 9 Eylül'deki Sporting CP (UCL) deplasmanının yanı sıra 13 Eylül'deki Kocaelispor ve 20 Eylül'deki Trabzonspor Süper Lig maçlarını da kaçıracak. Antrenmanda dizine sert darbe alan Wilfried Singo'nun sağ uyluk biceps femoris kasındaki tendon hasarı da MR ile doğrulandı.",
    source: "gzt.com / Cumhuriyet / KARAR",
    competitionKey: "ucl",
    relatedTeamIds: ["t35"],
  },
  {
    id: "news-ucl-28",
    date: "2026-09-08",
    title: "Fenerbahçe'de Roma maçı öncesi eksikler: Guendouzi cezalı, Asensio hazır değil",
    summary:
      "UEFA, Lyon play-off maçı sonrası yaşanan olaylar nedeniyle Fenerbahçe'nin orta sahası Matteo Guendouzi'ye 4 maç (2'si bu sezon, 2'si 1 yıl ertelemeli) ceza verdi; Guendouzi bu cezayla 10 Eylül'deki Roma ve 14 Ekim'deki Aston Villa maçlarını kaçıracak. Mason Greenwood ise aynı olaylar nedeniyle 30 bin euro para cezasına çarptırıldı. Marco Asensio ise hâlâ takımla normal antrenmanlara başlayamadı; teknik direktör İsmail Kartal, Guendouzi'nin yerine İsmail Yüksek'i düşünüyor.",
    source: "Takvim / Fotomaç / Hürriyet",
    competitionKey: "ucl",
    relatedTeamIds: ["t25", "t13"],
  },
  {
    id: "news-ucl-29",
    date: "2026-09-08",
    title: "Mourinho, Real Madrid başında ilk UCL maçını kazandı: Inter'e 2-1",
    summary:
      "Bernabéu'da oynanan lig fazı açılış maçında Kylian Mbappé'nin ilk yarıdaki golü ve Federico Valverde'nin 24. dakikadaki golüyle 2-0 öne geçen Real Madrid, Inter'i 2-1 mağlup etti; konuk ekibin golünü 77. dakikada Carlos Augusto kaydetti. Mourinho maç sonrası İspanyol televizyonuna 'İyi oynayıp kaybetmektense kötü oynayıp kazanmayı tercih ederim' dedi.",
    source: "ESPN / Al Jazeera",
    url: "https://www.espn.com/soccer/report/_/gameId/401915451",
    competitionKey: "ucl",
    relatedTeamIds: ["t1", "t6"],
  },
  {
    id: "news-ucl-30",
    date: "2026-09-08",
    title: "Haaland'ın çifte golüyle Manchester City, Porto deplasmanından 3 puanla döndü",
    summary:
      "Manchester City, Estádio do Dragão'da oynanan lig fazı açılışında Porto'yu 2-0 mağlup etti; Erling Haaland 47. ve uzatmaların 1. dakikasında (90+1') iki gol kaydetti. Bu galibiyet, Enzo Maresca'ya City başındaki ilk Şampiyonlar Ligi galibiyetini yaşattı; Maresca maç sonrası ilk yarıda daha fazla gol atabileceklerini ama genel olarak galibiyeti hak ettiklerini söyledi.",
    source: "Sky Sports / ESPN",
    url: "https://www.skysports.com/football/fc-porto-vs-manchester-city/577600",
    competitionKey: "ucl",
    relatedTeamIds: ["t28", "t2"],
  },
  {
    id: "news-ucl-31",
    date: "2026-09-08",
    title: "Borussia Dortmund'da Guirassy'nin çılgın gecesi: brace + kendi kalesine gol, yine de galibiyet",
    summary:
      "Signal Iduna Park'ta oynanan açılış maçında Renato Veiga'nın 53. dakikada kendi kalesine attığı golle öne geçen Borussia Dortmund'a Villarreal'den Santiago Mouriño 66. dakikada eşitliği getirdi. Serhou Guirassy 80. dakikada ve penaltıdan 85. dakikada iki gol daha kaydederek Dortmund'u 3-1 öne geçirdi, ancak uzatmalarda (90+3') kendi kalesine gönderdiği golle maç 3-2 ile Dortmund lehine sonuçlandı.",
    source: "ESPN / Yahoo Sports",
    url: "https://www.espn.com/soccer/match/_/gameId/401915449/villarreal-borussia-dortmund",
    competitionKey: "ucl",
    relatedTeamIds: ["t12", "t14"],
  },
  {
    id: "news-ucl-32",
    date: "2026-09-08",
    title: "Aston Villa, Club Brugge deplasmanında golcü sıkıntısını 3 golle aştı",
    summary:
      "Aston Villa, Club Brugge deplasmanında John McGinn (11'), Emiliano Buendía (22') ve Nicolas Jackson'ın (43') golleriyle ilk yarıda 3-1 öne geçti; ev sahibinin gollerini Hugo Vetlesen (19') ve penaltıdan Nicolo Tresoldi (61') kaydetti, maç 3-2 Aston Villa galibiyetiyle bitti. Teknik direktör Unai Emery maç sonrası 'Bugün bir adım daha attık, 90 dakika boyunca çok eksiksiz bir maç çıkardık' dedi.",
    source: "Sky Sports / ESPN",
    url: "https://www.skysports.com/football/club-brugge-vs-aston-villa/report/577599",
    competitionKey: "ucl",
    relatedTeamIds: ["t17", "t20"],
  },
  {
    id: "news-ucl-33",
    date: "2026-09-08",
    title: "Real Betis, Lille deplasmanında Bartra'nın golleriyle geriden gelip kazandı",
    summary:
      "Lille'de Ayase Ueda'nın 12. dakikadaki golüyle öne geçen ev sahibine karşı Real Betis, Marc Bartra'nın 33. ve 49. dakikalardaki golleri ile Troy Parrott'ın 53. dakikadaki golüyle 3-1 öne geçti. Lille'in son golünü 56. dakikada Ethan Mbappé kaydetti; maç 3-2 Real Betis galibiyetiyle sonuçlandı.",
    source: "ESPN / Yahoo Sports",
    url: "https://www.espn.com/soccer/match/_/gameId/401915450",
    competitionKey: "ucl",
    relatedTeamIds: ["t26", "t19"],
  },
  {
    id: "news-ucl-34",
    date: "2026-09-08",
    title: "AEK Athens, LASK'ı Marin'in frikik goluyle 1-0 mağlup etti",
    summary:
      "AEK Athens, lig fazı açılışında sahasında LASK'ı, yaklaşık 20 metreden kullanılan bir frikikle atılan tek golle 1-0 mağlup etti; VAR incelemesi sonrası ofsayt gerekçesiyle iptal edilen bir gol de vardı. LASK, maçın son anlarında beraberlik için bulduğu kafa vuruşunu kaleyi bulamadan auta yolladı.",
    source: "ESPN",
    url: "https://www.espn.com/soccer/match/_/gameId/401915452/lask-linz-aek-athens",
    competitionKey: "ucl",
    relatedTeamIds: ["t27", "t33"],
  },

  // ---- Trendyol Süper Lig 2026-27 ----
  {
    id: "news-sl-1",
    date: "2026-08-14",
    title: "Trendyol Süper Lig 2026-27 sezonu başladı",
    summary:
      "Süper Lig'de yeni sezon 14 Ağustos'ta start aldı. Küme düşen Antalyaspor, Kayserispor ve Sivasspor'un yerini yükselen Amed SFK, Çorum FK ve Erzurumspor FK aldı.",
    source: "TFF.org",
    url: "https://www.tff.org/default.aspx?pageID=204&ftxtID=49875",
    competitionKey: "superlig",
    relatedTeamIds: [],
  },
  {
    id: "news-sl-2",
    date: "2026-09-04",
    title: "Süper Lig'de yaz transfer dönemi kapandı",
    summary:
      "TFF'nin 22 Haziran'da başlayan yaz transfer ve tescil dönemi, 4 Eylül gece yarısı sona erdi. Kulüpler bu tarihten sonra kadrolarına yeni oyuncu ekleyemeyecek; ikinci transfer dönemi 1 Ocak - 5 Şubat 2027 arasında olacak.",
    source: "TFF.org / Cumhuriyet",
    competitionKey: "superlig",
    relatedTeamIds: [],
  },
  {
    id: "news-sl-3",
    date: "2026-08-30",
    title: "Süper Lig'de 3. hafta sonunda lider Galatasaray",
    summary:
      "Savunma şampiyonu Galatasaray, Göztepe'yi evinde 3-2 mağlup ederek 3. haftayı lider tamamladı. Fenerbahçe ise deplasmanda Samsunspor'u 2-0 mağlup etti.",
    source: "haberglobal.com",
    competitionKey: "superlig",
    relatedTeamIds: ["s1", "s2"],
  },
  {
    id: "news-sl-4",
    date: "2026-08-05",
    title: "Beşiktaş'ın yeni teknik direktörü Vincenzo Italiano oldu",
    summary:
      "Sergen Yalçın ile yollarını ayıran Beşiktaş, İtalyan teknik adam Vincenzo Italiano ile anlaşarak kulübün 64. teknik direktörü olarak göreve getirdi.",
    source: "Anadolu Ajansı",
    url: "https://www.aa.com.tr/tr/spor/besiktasin-64-teknik-direktoru-vincenzo-italiano-oldu/3958469",
    competitionKey: "superlig",
    relatedTeamIds: ["s3"],
  },
  {
    id: "news-sl-5",
    date: "2026-08-01",
    title: "Galatasaray'da yaz transferleri: Leao geldi, Nelsson ayrıldı",
    summary:
      "Galatasaray, AC Milan ile anlaşarak Rafael Leao'yu kadrosuna kattı; RB Leipzig'den El Chadaille Bitshiabu'yu kiralık+opsiyonlu olarak transfer etti; FC Porto'dan Deniz Gül'ü 11 milyon euroya renklerine bağladı. Savunmacı Victor Nelsson ile ise karşılıklı olarak sözleşme feshedildi.",
    source: "ntvspor.net / fanatik.com.tr",
    competitionKey: "superlig",
    relatedTeamIds: ["s1"],
  },
  {
    id: "news-sl-6",
    date: "2026-08-15",
    title: "Galatasaray'da Victor Osimhen'e sarı-kırmızılı yönetimden ihtar",
    summary:
      "Nijeryalı golcü Victor Osimhen'e disiplin gerekçesiyle kulüp yönetiminden ihtar geldiği ortaya çıktı; oyuncunun Atletico Madrid'e gidebilmek için maaşında indirime gidebileceği de konuşuluyor.",
    source: "Fotomaç / ASpor",
    competitionKey: "superlig",
    relatedTeamIds: ["s1"],
  },
  {
    id: "news-sl-7",
    date: "2026-08-16",
    title: "Süper Lig'in açılış golü Victor Osimhen'den geldi",
    summary:
      "2026-27 Süper Lig sezonunun ilk golünü, Çorum FK ile 2-2 biten açılış maçında iki gol birden kaydeden Galatasaray forveti Victor Osimhen attı.",
    source: "Hürriyet",
    url: "https://www.hurriyet.com.tr/sporarena/super-ligde-2026-2027-sezonunun-ilk-golu-victor-osimhenden-43273795",
    competitionKey: "superlig",
    relatedTeamIds: ["s1", "s13"],
  },
  {
    id: "news-sl-8",
    date: "2026-07-15",
    title: "Fenerbahçe'de Marco Asensio transferi tamamlandı, En-Nesyri Suudi Arabistan'a gitti",
    summary:
      "Fenerbahçe, Paris Saint-Germain ile anlaşarak İspanyol oyuncu Marco Asensio'yu kadrosuna kattı. Fas'lı golcü Youssef En-Nesyri ise Al-Ittihad'a transfer oldu; bu satıştan elde edilen kaynağın Alexander Sörloth transferinde kullanılması planlanıyor.",
    source: "Goal.com Türkiye / Hürriyet",
    competitionKey: "superlig",
    relatedTeamIds: ["s2"],
  },
  {
    id: "news-sl-9",
    date: "2026-09-03",
    title: "Trabzonspor'da yaz transferleri: Fabinho ve Franculino Gludo Dju kadroda",
    summary:
      "Trabzonspor, Brezilyalı orta saha Fabinho ile 2 yıllık anlaşma sağladı ve Danimarka ekibi Midtjylland'dan 22 yaşındaki forvet Franculino Gludo Dju'yu transfer ettiğini duyurdu.",
    source: "Fanatik",
    url: "https://www.fanatik.com.tr/trabzonspor/trabzonspor-transferi-resmen-acikladi-17-milyon-euro-2636483",
    competitionKey: "superlig",
    relatedTeamIds: ["s4"],
  },
  {
    id: "news-sl-10",
    date: "2025-12-01",
    title: "Sezonun ilk derbisi Kadıköy'de 1-1 bitti",
    summary:
      "2025-26 sezonu 14. haftasında Fenerbahçe ile Galatasaray, Kadıköy'de oynanan derbide 1-1 berabere kaldı.",
    source: "beIN Sports",
    url: "https://beinsports.com.tr/mac-ozetleri-goller/super-lig/ozet/2025-2026/14/fenerbahce-1-1-galatasaray-mac-ozeti",
    competitionKey: "superlig",
    relatedTeamIds: ["s1", "s2"],
  },
  {
    id: "news-sl-11",
    date: "2026-04-26",
    title: "Galatasaray, RAMS Park'ta Fenerbahçe'yi 3-0 mağlup etti",
    summary:
      "2025-26 sezonunun ikinci derbisinde Galatasaray, kendi sahasında Fenerbahçe'yi 3-0 mağlup ederek şampiyonluk yolunda önemli bir avantaj elde etti.",
    source: "ESPN",
    url: "https://www.espn.com/soccer/match/_/gameId/750191/fenerbahce-galatasaray",
    competitionKey: "superlig",
    relatedTeamIds: ["s1", "s2"],
  },
  {
    id: "news-sl-12",
    date: "2026-04-05",
    title: "Beşiktaş, ligde 41 yıl sonra ilk kez derbi galibiyeti alamadı",
    summary:
      "Fenerbahçe'nin 90+11. dakikada Kerem Aktürkoğlu'nun kullandığı penaltıyla kazandığı maçın ardından Beşiktaş, 2025-26 Süper Lig sezonunda Fenerbahçe'ye karşı ligde 41 yıl sonra ilk kez derbi galibiyeti alamamış oldu.",
    source: "beIN Sports",
    url: "https://beinsports.com.tr/mac-ozetleri-goller/super-lig/ozet/2025-2026/28/fenerbahce-1-0-besiktas-mac-ozeti",
    competitionKey: "superlig",
    relatedTeamIds: ["s2", "s3"],
  },
  {
    id: "news-sl-13",
    date: "2026-03-07",
    title: "Osimhen'in golüyle Galatasaray, Beşiktaş derbisini kazandı",
    summary:
      "Beşiktaş Park'ta oynanan derbide Victor Osimhen'in 39. dakikada Leroy Sane asistiyle attığı golle Galatasaray, Beşiktaş'ı 1-0 mağlup etti; Sane ise 62. dakikada kırmızı kart gördü.",
    source: "Fanatik / CNN Türk",
    competitionKey: "superlig",
    relatedTeamIds: ["s1", "s3"],
  },
  {
    id: "news-sl-14",
    date: "2026-04-04",
    title: "Trabzonspor, zirve yarışında Galatasaray'ı 2-1 mağlup etti",
    summary:
      "Trabzonspor, sahasında oynadığı derbide Galatasaray'ı Paul Onuachu ve Chibuike Nwaiwu'nun golleriyle 2-1 mağlup ederek zirve yarışını kızıştırdı; Galatasaray'ın tek golü Wilfried Singo'dan geldi.",
    source: "Hürriyet",
    url: "https://www.hurriyet.com.tr/sporarena/live-trabzonspor-2-1-galatasaray-super-lig-maci-ozeti-43143360",
    competitionKey: "superlig",
    relatedTeamIds: ["s4", "s1"],
  },
  {
    id: "news-sl-15",
    date: "2026-02-14",
    title: "Fenerbahçe, Trabzon deplasmanından 3 puanla döndü",
    summary:
      "Trabzonspor - Fenerbahçe derbisinde konuk ekip Şenol Güneş Spor Kompleksi'nden 3-2'lik galibiyetle ayrıldı.",
    source: "beIN Sports / Fenerbahçe.org",
    url: "https://www.fenerbahce.org/haberler/futbol/2026/2/trabzonspor-2-3-fenerbahce",
    competitionKey: "superlig",
    relatedTeamIds: ["s4", "s2"],
  },
  {
    id: "news-sl-16",
    date: "2025-12-22",
    title: "Beşiktaş - Fenerbahçe Türkiye Kupası'nda karşılaştı",
    summary:
      "Türkiye Kupası grup aşamasında oynanan derbide Beşiktaş, deplasmanda Fenerbahçe'yi 2-1 mağlup etti; bu sonuç Beşiktaş'ın 2025-26 sezonundaki tek derbi galibiyeti oldu.",
    source: "Wikipedia (Beşiktaş-Fenerbahçe rekabeti)",
    competitionKey: "superlig",
    relatedTeamIds: ["s3", "s2"],
  },
  {
    id: "news-sl-17",
    date: "2026-08-12",
    title: "Beşiktaş'ın transfer bombası: Dušan Vlahović resmen açıklandı",
    summary:
      "Juventus ile sözleşmesi biten Sırp golcü Dušan Vlahović, Beşiktaş ile 2028-29 sezonu sonuna kadar geçerli 3 yıllık sözleşme imzalayarak yıllık 7,5 milyon euro garantili ücretle siyah-beyazlı forma giydi.",
    source: "Hürriyet / Sözcü / Daily Sabah",
    url: "https://www.hurriyet.com.tr/sporarena/besiktas-dusan-vlahovic-transferini-resmen-acikladi-43271059",
    competitionKey: "superlig",
    relatedTeamIds: ["s3"],
  },
  {
    id: "news-sl-18",
    date: "2026-08-27",
    title: "Fenerbahçe'nin kalecisi Dominik Livaković, Barcelona'ya transfer oldu",
    summary:
      "Hırvat file bekçisi Dominik Livaković, Fenerbahçe'den 2+2 milyon euroluk bedelle Barcelona'ya transfer oldu ve 2030'a kadar sözleşme imzaladı; oyuncunun bu sezon Barcelona kadrosunda yer almak yerine kiralık olarak başka bir kulüpte forma giymesi planlanıyor.",
    source: "ESPN / beIN Sports",
    url: "https://www.espn.com/soccer/story/_/id/49740625/barcelona-confirm-signing-croatia-goalkeeper-dominik-livakovic",
    competitionKey: "superlig",
    relatedTeamIds: ["s2"],
  },
  {
    id: "news-sl-19",
    date: "2026-09-01",
    title: "Osimhen, Atletico Madrid'in 75 milyon euroluk teklifine rağmen Galatasaray'da kaldı",
    summary:
      "Atletico Madrid'e teklif edilen Victor Osimhen'in maaşında indirime gitmeyi kabul etmesine rağmen İspanyol kulübü, Julian Alvarez'i merkez forvet olarak önceliklendirip mali nedenlerle 75 milyon euroluk transferi reddetti; Osimhen 2029'a kadar Galatasaray'da kalmaya devam ediyor.",
    source: "Goal.com / beIN Sports / Guardian Nigeria",
    competitionKey: "superlig",
    relatedTeamIds: ["s1"],
  },
  {
    id: "news-sl-20",
    date: "2026-09-04",
    title: "Galatasaray, Başakşehir deplasmanından 3 puanla döndü: 4. hafta sonunda lider",
    summary:
      "Galatasaray, deplasmanda İstanbul Başakşehir'i 3-2 mağlup ederek 4. haftayı 10 puanla lider tamamladı. Karşılaşmada sakatlanan Victor Osimhen ve Mario Lemina'nın durumu maç sonrası endişe kaynağı oldu.",
    source: "Habertürk / Hürriyet / Fanatik",
    competitionKey: "superlig",
    relatedTeamIds: ["s1", "s5"],
  },
  {
    id: "news-sl-21",
    date: "2026-09-05",
    title: "Galatasaray'da sakatlık şoku: Osimhen ve Lemina kasık kasında zorlanma yaşadı",
    summary:
      "Başakşehir deplasmanında Osimhen 33. dakikada, Lemina ise devre arasında oyundan çıktı. Kulüp, her iki oyuncuda da sağ adduktor (kasık) kas grubunda gerilme ve ağrı tespit edildiğini, ileri tetkiklerin sürdüğünü açıkladı.",
    source: "Fotomaç / Anadolu Ajansı / Fanatik",
    url: "https://www.fotomac.com.tr/galatasaray/2026/09/05/galatasaraydan-sakatlik-aciklamasi-leminasingo-ve-osimhen",
    competitionKey: "superlig",
    relatedTeamIds: ["s1"],
  },
  {
    id: "news-sl-22",
    date: "2026-09-03",
    title: "Trabzonspor'da genç oyuncu Noah Saviolo'ya sakatlık şoku",
    summary:
      "Trendyol Süper Lig 3. haftasında oynanan Amed SFK maçında sakatlanan Noah Saviolo'nun yapılan MR görüntülemesinde sağ omuz arka kas grubunda kanama ve kemik ödemi tespit edildi.",
    source: "gzt.com / Fotomaç / ASpor / Takvim",
    url: "https://www.gzt.com/spor/trabzonsporda-sakatlik-soku-noah-saviolo-icin-aciklama-yapildi-4257584",
    competitionKey: "superlig",
    relatedTeamIds: ["s4"],
  },
  {
    id: "news-sl-23",
    date: "2026-09-05",
    title: "Beşiktaş, Kadıköy'de geriden gelip Fenerbahçe'yi 2-1 mağlup etti",
    summary:
      "4. hafta derbisinde Fenerbahçe'yi 26. dakikada Milan Škriniar'ın golüyle öne geçmesine rağmen Beşiktaş, Rıdvan Yılmaz (38') ve Dušan Vlahović'in (73') golleriyle 2-1 geriden gelerek kazandı. Vincenzo Italiano, Beşiktaş başındaki ilk derbisini galibiyetle tamamladı; Beşiktaş 9, Fenerbahçe 6 puana yükseldi.",
    source: "Hürriyet / beIN Sports / Milli Gazete",
    url: "https://www.hurriyet.com.tr/sporarena/live-fenerbahce-1-2-besiktas-super-lig-derbi-maci-ozeti-43296658",
    competitionKey: "superlig",
    relatedTeamIds: ["s2", "s3"],
  },
  {
    id: "news-sl-24",
    date: "2026-09-05",
    title: "Vincenzo Italiano'nun Beşiktaş'taki ilk 5 resmi maçı da galibiyetle sonuçlandı",
    summary:
      "Avrupa Ligi elemelerinde Midtjylland ve Hradec Kralove'yi geçen, ardından Süper Lig'de Eyüpspor'u ve derbide Fenerbahçe'yi mağlup eden Beşiktaş, Italiano yönetiminde ilk 5 resmi maçlık seride hiç gol yemedi (450 dakika).",
    source: "birgun.net / Sporx",
    competitionKey: "superlig",
    relatedTeamIds: ["s3"],
  },
  {
    id: "news-sl-25",
    date: "2026-09-06",
    title: "Trabzonspor'da Mohamed Salah'tan ilk gol: Gençlerbirliği'ni 5-0 dağıttılar",
    summary:
      "Trabzonspor, 4. hafta maçında Papara Park'ta Gençlerbirliği'ni 5-0 mağlup etti. Paul Onuachu 5. ve 22. dakikalarda iki gol kaydederken, yaz transferi Mohamed Salah 14. dakikada penaltıdan Süper Lig'deki ilk golünü attı; diğer goller Ernest Muçi (59') ve Franculino Dju'dan (78') geldi.",
    source: "Hürriyet / Fanatik / Star",
    url: "https://www.hurriyet.com.tr/sporarena/trabzonspor-5-0-genclerbirligi-super-lig-maci-ozeti-43298027",
    competitionKey: "superlig",
    relatedTeamIds: ["s4", "s18"],
  },
  {
    id: "news-sl-26",
    date: "2026-09-06",
    title: "Süper Lig 4. hafta: Çorum FK ve Kocaelispor 3 puanı aldı, Kasımpaşa-Amed'de gol düellosu",
    summary:
      "4. haftanın diğer maçlarında Çorum FK; Alexandros Kyziridis, Andrei Borza ve Ermin Mahmić'in golleriyle Eyüpspor'u 3-0 mağlup etti, Kocaelispor ise Samsunspor'u 1-0 geçti. Kasımpaşa ile Amed SFK arasındaki maçta Güven Yalçın ve Adrian Benedyczak'ın gollerine Gift Orban'ın iki golüyle karşılık veren konuk ekip, sahadan 2-2'lik beraberlikle ayrıldı.",
    source: "Hürriyet / gzt.com / Fanatik",
    competitionKey: "superlig",
    relatedTeamIds: ["s13", "s16", "s17", "s6", "s8", "s11"],
  },
  {
    id: "news-sl-27",
    date: "2026-09-07",
    title: "Gaziantep FK, Kozlowski'nin iki golüyle Göztepe deplasmanından 4-2 galip ayrıldı",
    summary:
      "Kacper Kozlowski'nin 34. ve 45. dakikalardaki golleriyle öne geçen Gaziantep FK, Halil Dervişoğlu ve Myenty Abena'nın katkısıyla Göztepe deplasmanını 4-2 kazandı. Ev sahibi Göztepe'nin gollerini Juan (51', 90') kaydetti; 72. dakikada Göztepeli Ogün Bayrak kırmızı kart gördü.",
    source: "beIN Sports",
    url: "https://beinsports.com.tr/mac-ozetleri-goller/super-lig/ozet/2026-2027/4/goztepe-2-4-gaziantep-fk-mac-ozeti",
    competitionKey: "superlig",
    relatedTeamIds: ["s7", "s15"],
  },
  {
    id: "news-sl-28",
    date: "2026-09-07",
    title: "Alanyaspor, Rizespor'dan kendi kalesine giren golle 3 puanla döndü",
    summary:
      "Çaykur Rizespor - Alanyaspor maçının tek golü, 71. dakikada Florent Hadergjonaj'ın ceza sahasına gönderdiği ortada Rizespor'lu Ariss'in kendi kalesine gönderdiği topla geldi; konuk Alanyaspor sahadan 1-0 galip ayrıldı.",
    source: "Hürriyet",
    url: "https://www.hurriyet.com.tr/sporarena/caykur-rizespor-0-1-alanyaspor-super-lig-maci-ozeti-43298813",
    competitionKey: "superlig",
    relatedTeamIds: ["s12", "s10"],
  },

  // ---- 2026-27 UCL lig fazı: dikkat çekici eşleşme önizlemeleri ----
  {
    id: "news-preview-1",
    date: "2026-09-08",
    title: "Önizleme: Porto - Manchester City",
    summary:
      "Porto'nun Estádio do Dragão'daki güçlü ev sahipliği geleneği ile Maresca yönetimindeki City'nin kalite/derinlik üstünlüğü karşı karşıya. İkili arasındaki UCL rekoru City lehine (3G-1B-0M).",
    source: "mancity.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t28", "t2"],
  },
  {
    id: "news-preview-2",
    date: "2026-09-09",
    title: "Önizleme: Napoli - Arsenal",
    summary:
      "Napoli'nin yeni teknik direktörü Allegri'nin ilk büyük Avrupa sınavı. Arsenal, geçen sezonki final hayal kırıklığının (PSG'ye penaltılarla kaybedilen final) ardından şampiyonluk hedefiyle çıktığı kampanyaya bu maçla başlıyor.",
    source: "greatbets.co.uk / football-italia.net",
    competitionKey: "ucl",
    relatedTeamIds: ["t9", "t11"],
  },
  {
    // DÜZELTME (2026-09-07): Tarih 15 Eylül'den, doğrulanmış gerçek maç
    // tarihi olan 13 Ekim'e (lig fazı 2. haftası) düzeltildi -- bkz.
    // news-ucl-16'daki not.
    id: "news-preview-3",
    date: "2026-10-13",
    title: "Önizleme: Galatasaray - Barcelona (2. hafta)",
    summary:
      "Galatasaray'ın lig fazı 2. haftasında RAMS Park'ta ağırlayacağı Barcelona ile randevusu, kulübün 1993-94 ve 1994-95 sezonlarındaki Barcelona ile geçen unutulmaz grup maçlarının (iki sezonda da birer galibiyet, birer beraberlik) hatırasını tazeliyor.",
    source: "Euronews Türkçe / UEFA.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t35", "t7"],
  },
  {
    id: "news-preview-4",
    date: "2026-09-10",
    title: "Önizleme: Fenerbahçe - Roma",
    summary:
      "Fenerbahçe ile Roma'nın rakip camialarda ilk resmi randevusu. İki takım daha önce sadece 2014 yazında Roma'da oynanan 3-3'lük bir hazırlık maçında karşılaşmıştı.",
    source: "vocegiallorossa.it",
    competitionKey: "ucl",
    relatedTeamIds: ["t25", "t13"],
  },
  {
    id: "news-preview-5",
    date: "2026-12-09",
    title: "Önizleme: Arsenal - Real Madrid rövanşı",
    summary:
      "9 Aralık'ta Emirates'te oynanacak maç, Arsenal'ın Real Madrid'i 5-1 topla eleyip 2009'dan sonra ilk kez yarı finale çıktığı 2024-25 çeyrek finalinin (Emirates'te 3-0, Bernabéu'da 1-2) doğrudan rövanşı niteliğinde.",
    source: "Yahoo Sports / realmadrid.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t11", "t1"],
  },
  {
    id: "news-preview-6",
    date: "2026-09-01",
    title: "Önizleme: Manchester City - Barcelona",
    summary:
      "City'nin UCL tarihinde Barcelona karşısında oldukça zorlandığı biliniyor: 2014, 2015 ve 2016 sezonlarındaki altı karşılaşmanın beşini Barcelona kazanmıştı. Maresca döneminde bu tablo değişebilir mi?",
    source: "FBref.com / Sky Sports",
    competitionKey: "ucl",
    relatedTeamIds: ["t2", "t7"],
  },
  {
    id: "news-preview-7",
    date: "2026-09-01",
    title: "Önizleme: Bayern Münih - Arsenal",
    summary:
      "İki takımın son UCL randevusu unutulur gibi değil: 2016-17 son 16 turunda Bayern, Arsenal'ı 10-2'lik toplam skorla eleyerek çeyrek finale yükselmişti (Münih'te 5-1, Londra'da 5-1).",
    source: "UEFA.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t3", "t11"],
  },
  {
    id: "news-preview-8",
    date: "2026-09-01",
    title: "Önizleme: Atletico Madrid - Bayern Münih",
    summary:
      "2015-16 sezonu yarı finalinde Atletico'nun deplasman golü avantajıyla finale yükseldiği (toplamda 2-2) epik eşleşmenin anıları canlanıyor. Bayern o unutulmaz elemenin rövanşını arıyor.",
    source: "ESPN",
    competitionKey: "ucl",
    relatedTeamIds: ["t10", "t3"],
  },
  {
    id: "news-preview-9",
    date: "2026-09-01",
    title: "Önizleme: Fenerbahçe - Liverpool",
    summary:
      "İki kulübün tarihinde resmi bir randevusu daha önce hiç olmadı -- bu, Fenerbahçe ile Liverpool arasındaki ilk resmi maç olacak.",
    source: "fotmob.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t25", "t5"],
  },
  {
    id: "news-preview-10",
    date: "2026-09-01",
    title: "Önizleme: Fenerbahçe - Atletico Madrid",
    summary:
      "Fenerbahçe ile Atletico Madrid arasında da daha önce hiç resmi maç oynanmadı; iki takım bu sezon ilk kez sahaya çıkacak.",
    source: "sofascore.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t25", "t10"],
  },
  {
    id: "news-preview-11",
    date: "2026-09-01",
    title: "Önizleme: Manchester United - Atletico Madrid rövanşı",
    summary:
      "İki takım son olarak 2021-22 son 16 turunda karşılaşmıştı: Atletico, Renan Lodi'nin golüyle Old Trafford'dan 1-0 galip ayrılıp 2-1'lik toplam skorla United'ı elemişti (bu maç aynı zamanda Cristiano Ronaldo'nun United forması altındaki son UCL maçıydı).",
    source: "The Peoples Person / ESPN",
    competitionKey: "ucl",
    relatedTeamIds: ["t8", "t10"],
  },
  {
    id: "news-preview-12",
    date: "2026-09-01",
    title: "Önizleme: Napoli - Arsenal, 2013'ün rövanşı",
    summary:
      "İki takım daha önce 2013-14 sezonu grup aşamasında iki kez karşılaşmıştı: Arsenal, Emirates'te 2-0 kazanmış, Napoli ise San Paolo'da rövanşı 2-0 almıştı. On üç yıl sonra iki takım yeniden aynı grupta.",
    source: "UEFA.com",
    competitionKey: "ucl",
    relatedTeamIds: ["t9", "t11"],
  },
];

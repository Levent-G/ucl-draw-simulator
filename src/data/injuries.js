// Güncel sakatlık/cezalı oyuncu listesi -- kurgusal/tahmini DEĞİL.
//
// Amaç: src/components/ProbableLineup.jsx bileşenindeki "🔮 Olası Kadro"
// önerisinin, hâlihazırda SAKAT veya CEZALI olduğu bilinen bir oyuncuyu ilk
// 11'e dahil etmesini engellemek. Bu yüzden yalnızca players.js (UCL,
// t1-t36) veya superLigPlayers.js (Süper Lig, s1-s18) kadrolarında GERÇEKTEN
// yer alan isimler buraya eklenmiştir -- kadroda olmayan (ör. o dosyada
// atlanmış küçük kulüp oyuncuları) gerçek sakatlıklar bilerek dışarıda
// bırakılmıştır (filtrelenecek bir kaydımız yok çünkü).
//
// Yöntem: WebSearch/WebFetch ile araştırılmış, tarihli, kaynağı belirtilmiş
// haberler + resmi kulüp tıbbi raporları + physioroom tarzı bir sakat/cezalı
// takip sitesi (sakat-ve-cezali.com). Bu bir STATİK ENSTANTANEdir --
// 2026-09-16 tarihi itibarıyla araştırılmıştır, canlı/otomatik güncellenmez.
// Dönüş tarihleri çoğu kaynakta kesin gün olarak değil ay/dönem bazında
// verildiği için ("Eylül sonu", "Ekim başı" gibi) olduğu gibi
// yansıtılmıştır; netleşmeyen durumlarda expectedReturn: null bırakılmıştır.
// Bazı ikincil/doğrulanamayan ya da tek kaynaklı söylentiler kasıtlı olarak
// DIŞARIDA bırakılmıştır -- örn. Atlético Madrid'li Álex Baena (14 Eylül
// hedef dönüş tarihi geçmiş, güncel kaynaklarda sakatlığının sürdüğüne dair
// hiçbir haber yok -- muhtemelen döndü) ve Kasımpaşalı Kerem Demirbay
// (önceki listede "detay netleşmedi" notuyla vardı, güncel kadro
// haberlerinde sakatlığına dair hiçbir iz kalmamış).
//
// --- 2026-09-16 REFRESH NOTU (bir önceki 2026-09-09 enstantanesine göre) ---
// Bu, ilk 2026-09-09 araştırmasından tam 1 hafta sonraki TAM YENİDEN
// araştırmadır (yalnızca ekleme değil): 58 kayıtlık eski listenin HER
// maddesi tek tek yeniden doğrulanmış, iyileşen/cezası biten oyuncular
// çıkarılmış, yeni sakatlanan/cezalı oyuncular eklenmiştir. Sonuç: 54 kayıt.
//   - İYİLEŞEREK ÇIKARILANLAR (9): Eduardo Camavinga, Arda Güler, Bernardo
//     Silva (üçü de Real Madrid -- 8 Eylül'deki Inter maçı için 1 maçlık UCL
//     cezaları o maçta bitti, şu an oynayabiliyorlar); Nico O'Reilly
//     (Manchester derbisi için sağlıklı ilan edildi); Gavi (diz kontüzyonu
//     sadece morluk çıktı, kadroya döndü); Álex Baena (bkz. yukarı); Günay
//     Güvenç (Galatasaray/Süper Lig -- diz sakatlığını tamamen atlattı,
//     Trabzonspor kadrosuna hazır); Elliot Watt (Samsunspor -- 1 maçlık
//     cezası 12 Eylül'de bitti); Kerem Demirbay (bkz. yukarı).
//   - YENİ EKLENENLER (6): Ousmane Dembélé ve Désiré Doué (PSG, t4 --
//     kadroda daha önce hiç UCL sakatlık kaydı yoktu); Hakan Çalhanoğlu ve
//     John Stones (Inter, t6 -- aynı şekilde ilk kez); Ian Maatsen (Aston
//     Villa, t20 -- ilk kez); Mario Lemina (Galatasaray Süper Lig, s1 --
//     t35'teki UCL kaydıyla TUTARLI HALE GETİRİLDİ; s1 kadrosunda oynamasına
//     rağmen önceki listede sehven eksikti).
//   - GÜNCELLENENLER (~30): Aynı oyuncu kaydı kalan ama sebep/dönüş tarihi
//     yeni haberlere göre revize edilenler arasında Éder Militão, Ferland
//     Mendy, Jérémy Doku, Amad Diallo (artık ayak bileği), Alexander Sørloth
//     (10 Ekim/Alaves hedefi netleşti), Frenkie de Jong (MCL yırtığı olarak
//     kesinleşti), William Saliba, Jurriën Timber, Mattéo Guendouzi (dönüş
//     tarihi 20 Ekim/Slavia Prag olarak netleşti), Zaidu Sanusi (adduktor
//     yırtığı ~2 ay), Wilfried Singo/Victor Osimhen/Mario Lemina
//     (Galatasaray -- kulüp resmi açıklamasıyla teyit), Mert Hakan Yandaş
//     (Fenerbahçe -- ayak bileği enfeksiyonu + ameliyat + bahis
//     soruşturması cezası netleşti), Okay Yokuşlu (Trabzonspor -- ameliyat
//     olacağı ve sezonun kalanında oynayamayacağı ortaya çıktı, önceki
//     "Eylül ortası" tahmininden çok daha ciddi), Elayis Tavşan (Samsunspor
//     -- kas sakatlığı değil ayak kırığı çıktı), Fatih Kaya (2. derece
//     adale yırtığı), Khusniddin Alikulov (Çaykur Rizespor -- 6-9 aylık
//     dönüş penceresi netleşti) sayılabilir.
//   - AYNEN KORUNANLAR: Rodrygo, Hugo Ekitike, Federico Chiesa, Joe Gomez,
//     Giovanni Leoni, Alessandro Buongiorno, Roony Bardghji, Samu, Jayden
//     Oosterwolde, Allan Godói, Furkan Bayır, Thiemoko Diarra, Dilhan Demir
//     gibi uzun süreli/net olmayan dönüşlü vakalarda yeni bir gelişme
//     bulunamadığı için önceki kayıt (sadece asOf tarihi güncellenerek)
//     korunmuştur.
//
// --- 2026-09-20 REFRESH NOTU (kart cezaları eklendi) ---
// Bu tazeleme öncekinden farklı olarak bir YENİDEN araştırma değil, salt bir
// EKLEMEDİR: mevcut 54 sakatlık kaydına dokunulmadı (asOf tarihleri hâlâ
// 2026-09-16), sadece yeni eklenen "type" alanı (bkz. aşağıdaki not)
// kullanılarak GERÇEK, hâlihazırda kart cezası çeken 4 oyuncu eklendi --
// Süper Lig 6. hafta (18-20 Eylül) ve UCL lig fazı 1. hafta (8-10 Eylül)
// sonrası WebSearch ile araştırılıp en az 2 bağımsız kaynakla
// doğrulanmıştır:
//   - Lesley Ugochukwu (Galatasaray, s1): Trabzonspor derbisinde (19 Eylül,
//     4-0 mağlubiyet) 85. dakikada VAR incelemesi sonrası doğrudan kırmızı
//     kart gördü; TFF disiplin talimatına göre otomatik olarak bir sonraki
//     Süper Lig maçını kaçıracak (Habertürk / NTVSpor / Sporx). NOT: Aynı
//     maçta teknik direktör Okan Buruk da kırmızı kart gördü ama o bir
//     OYUNCU değil (teknik direktör), bu yüzden listeye eklenmedi.
//   - Valentin Mihăilă (Çaykur Rizespor, s12): 12 Eylül'deki Eyüpspor
//     deplasmanında VAR incelemesiyle doğrudan kırmızı kart gördü, PFDK 2
//     maç ceza verdi (caytvhaber.com / olay53.com); cezasının son maçı 20
//     Eylül'deki Göztepe deplasmanı.
//   - Ethan Mbappé (Lille, t26): 8 Eylül'deki Real Betis maçında (UCL lig
//     fazı 1. hafta) 56. dakikada VAR ile doğrudan kırmızı kart gördü (rakip
//     oyuncunun yüzüne kol savurma); UEFA disiplin süreci sürüyor, en az 3
//     maç ceza bekleniyor -- 2. hafta (13-14 Ekim) maçını kesin kaçıracağı
//     netleşti (Yahoo Sports / Goal.com / L'Équipe).
//   - Jan Bednarek (FC Porto, t28): 2025-26 sezonu UEFA Avrupa Ligi çeyrek
//     finalindeki (Nottingham Forest) kırmızı kartından kalan 2 maçlık ceza,
//     kulübün bu sezon terfi ettiği Şampiyonlar Ligi'ne taşındı; lig fazının
//     ilk 2 maçını (Manchester City, Real Betis) kaçırdı, 20 Ekim'deki PSV
//     Eindhoven maçında dönecek (Sports Mole / A Bola / O Jogo).
//   - ATLANDI: Göztepeli Ogün Bayrak da GERÇEKTEN cezalı (7 Eylül'deki
//     kırmızı kartından kalan PFDK 2 maç cezasının son maçı 20 Eylül'deki
//     Rizespor maçı), ancak superLigPlayers.js'teki Göztepe (s7) kadrosunda
//     bu isim yer almadığı için (kadro dosyası bazı oyuncuları atlıyor, bkz.
//     dosya başındaki not) bilerek dışarıda bırakıldı -- kadroda olmayan bir
//     ismi ProbableLineup.jsx/getPowerIndex zaten eşleştiremeyeceği için
//     eklemenin bir anlamı da yok.
//
// --- 2026-10-12 REFRESH NOTU (Süper Lig 7. hafta sonrası, kısmi) ---
// 9-11 Ekim maç raporları ve ilk 11/yedek listeleriyle doğrulanarak:
//   - ÇIKARILANLAR: Osimhen ve Lemina (s1+t35 -- Kasımpaşa maçında
//     oynadılar, Lemina gol attı), Ugochukwu (cezasını Kasımpaşa maçında
//     çekti), Asensio (s2+t25 -- Rize'de ilk 11'de başlayıp gol attı),
//     Guendouzi (t25 -- Rize'de ilk 11'de), Mert Hakan Yandaş (Rize'de yedek
//     kulübesinde), Onuachu (Samsun'da 77'de oyuna girdi), Mihăilă (2 maçlık
//     cezası 20 Eylül'de bitti).
//   - GÜNCELLENENLER: Singo (dönüş hedefi 17 Ekim Gençlerbirliği maçı --
//     kulüp doktoru Yener İnce/AA), Malinovskyi (10 Ekim'de hâlâ kadroda
//     yoktu).
//   - EKLENENLER: Torreira (kırmızı kart cezası), Černý (11 Ekim'de
//     sakatlanıp çıktı), Dijksteel (Kocaelispor açıklaması).
//   - DOKUNULMAYANLAR: UCL kulüplerinin kayıtları ile bu haftanın maç
//     kadrolarından durumu doğrulanamayan Süper Lig kayıtları (ör. Rıdvan
//     Yılmaz, Samsunspor'un Mouandilmadji/Fatih Kaya'sı) -- asOf tarihleri
//     eski kaldı; UCL 2. hafta (13-14 Ekim) öncesinde yeniden kontrol
//     edilmeli.
//
// teamId: players.js (UCL, "tN") veya superLigPlayers.js (Süper Lig, "sN")
// içindeki takım id'si. Galatasaray/Fenerbahçe gibi hem UCL hem Süper
// Lig'de oynayan kulüplerde, oyuncu ilgili kadro dosyasında GERÇEKTEN yer
// alıyorsa iki ayrı kayıt (biri "tN", biri "sN") eklenmiştir.
//
// type (opsiyonel): "injury" (sakatlık) ya da "suspension" (kart cezası --
// sarı kart birikimi ya da kırmızı kart sonrası, SADECE bir sonraki maç
// için geçerli). Alan YOKSA "injury" varsayılır -- bu yüzden önceki
// kayıtların hiçbiri güncellenmek ZORUNDA değildi (geriye dönük uyumlu).
// Kullanıcı isteği: "Güç Endeksi"nin (bkz. realStandingsSelectors.js
// getPowerIndex) kadro gücü hesabına sadece sakatları değil, o hafta kart
// cezalısı olduğu için oynayamayacak oyuncuları da katması.
export const CURRENT_INJURIES = [
  // ---- UEFA Şampiyonlar Ligi ----
  {
    teamId: "t1",
    playerName: "Éder Militão",
    reason: "Hamstring (arka adale) sakatlığı",
    expectedReturn: "Eylül sonu (milli ara sonrası, çim sahada bireysel çalışmalara başladı)",
    asOf: "2026-09-16",
    source: "Sports Mole / AS",
  },
  {
    teamId: "t1",
    playerName: "Raúl Asencio",
    reason: "Sağ uyluk rectus femoris kas sakatlığı",
    expectedReturn: "20 Eylül (Atlético Madrid derbisi, ihtimal dahilinde)",
    asOf: "2026-09-16",
    source: "Sports Mole",
  },
  {
    teamId: "t1",
    playerName: "Ferland Mendy",
    reason: "Uyluk sakatlığı",
    expectedReturn: "2026 sonu (yılın son dönemine kadar sahalardan uzak kalabilir)",
    asOf: "2026-09-16",
    source: "Sports Mole / AS",
  },
  {
    teamId: "t1",
    playerName: "Rodrygo",
    reason: "Diz sakatlığı (ön çapraz bağ + menisküs yırtığı)",
    expectedReturn: "2027 başı (güçlü ilerleme olursa Aralık'ta erken dönüş ihtimali de var)",
    asOf: "2026-09-16",
    source: "Sports Mole / ESPN",
  },
  {
    teamId: "t2",
    playerName: "Jérémy Doku",
    reason: "Baldır (calf) sakatlığı (Community Shield'de başladı)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Sports Mole / Manchester City resmi açıklaması",
  },
  {
    teamId: "t4",
    playerName: "Ousmane Dembélé",
    reason: "Hamstring (arka adale) sakatlığı",
    expectedReturn: "Yaklaşık 6 hafta (Ekim sonu)",
    asOf: "2026-09-16",
    source: "PSG resmi açıklaması / Sports Mole",
  },
  {
    teamId: "t4",
    playerName: "Désiré Doué",
    reason: "Baldır (calf) sakatlığı",
    expectedReturn: "Yaklaşık 4 hafta (Ekim ortası)",
    asOf: "2026-09-16",
    source: "PSG resmi açıklaması / Sports Mole",
  },
  {
    teamId: "t5",
    playerName: "Conor Bradley",
    reason: "Diz sakatlığı (ameliyat oldu)",
    expectedReturn: "Kasım 2026",
    asOf: "2026-09-16",
    source: "This Is Anfield / Liverpool.com",
  },
  {
    teamId: "t5",
    playerName: "Hugo Ekitike",
    reason: "Aşil tendonu kopması",
    expectedReturn: "Aralık 2026",
    asOf: "2026-09-16",
    source: "This Is Anfield / Liverpool.com",
  },
  {
    teamId: "t5",
    playerName: "Federico Chiesa",
    reason: "Sırt sakatlığı (sezon öncesi, bu sezon henüz hiç oynamadı)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Liverpool.com / This Is Anfield",
  },
  {
    teamId: "t5",
    playerName: "Joe Gomez",
    reason: "Sakatlık sonrası kondisyon çalışması",
    expectedReturn: "Önümüzdeki hafta takım antrenmanlarına başlaması bekleniyor",
    asOf: "2026-09-16",
    source: "This Is Anfield / Liverpool.com",
  },
  {
    teamId: "t5",
    playerName: "Giovanni Leoni",
    reason: "Ön çapraz bağ sakatlığı (Eylül 2025'ten beri oynamadı)",
    expectedReturn: "Ekim başı (Eylül/Ekim milli ara döneminde takım antrenmanına dönüş hedefi)",
    asOf: "2026-09-16",
    source: "This Is Anfield / Yahoo Sports",
  },
  {
    teamId: "t6",
    playerName: "Hakan Çalhanoğlu",
    reason: "Sağ uyluk adduktor kas grubunda zorlanma",
    expectedReturn: "Milli ara sonrası (AS Roma maçını kaçıracak)",
    asOf: "2026-09-16",
    source: "Inter resmi açıklaması / football-italia.net",
  },
  {
    teamId: "t6",
    playerName: "John Stones",
    reason: "Uyluk sakatlığı (adduktor/hamstring bölgesi, kesin tanı için tetkik sürüyor)",
    expectedReturn: "Milli ara sonrası",
    asOf: "2026-09-16",
    source: "football-italia.net / Yahoo Sports",
  },
  {
    teamId: "t7",
    playerName: "Frenkie de Jong",
    reason: "Sağ diz MCL (iç yan bağ) yırtığı",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Sports Mole / Yahoo Sports",
  },
  {
    teamId: "t7",
    playerName: "Roony Bardghji",
    reason: "Ön çapraz bağ yırtığı",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Sports Mole / Yahoo Sports",
  },
  {
    teamId: "t8",
    playerName: "Amad Diallo",
    reason: "Ayak bileği sakatlığı (antrenmanda)",
    expectedReturn: "Yaklaşık 6 hafta (Ekim sonu / Kasım başı)",
    asOf: "2026-09-16",
    source: "Yahoo Sports / Goal.com / utdreport.co.uk",
  },
  {
    teamId: "t8",
    playerName: "Matthijs de Ligt",
    reason: "Bel ameliyatı sonrası (Kasım 2025'ten beri oynamadı, Mayıs 2026'da ameliyat oldu)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Yahoo Sports",
  },
  {
    teamId: "t9",
    playerName: "Alessandro Buongiorno",
    reason: "Diz sakatlığı (UCL lig fazı kadrosuna dahil edilmedi)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "paininthearsenal.com / sportsdunia.com",
  },
  {
    teamId: "t9",
    playerName: "Scott McTominay",
    reason: "Kalp ritim bozukluğu (hafif aritmi) nedeniyle pulsed field ablasyon işlemi geçirdi",
    expectedReturn: "İlk milli ara sonrası (Eylül sonu)",
    asOf: "2026-09-16",
    source: "Yahoo Sports / cultofcalcio.com",
  },
  {
    teamId: "t10",
    playerName: "Alexander Sørloth",
    reason: "Kas kasılması/kontraktür (sezon başından beri oynamadı)",
    expectedReturn: "10 Ekim (Alavés maçı hedefi)",
    asOf: "2026-09-16",
    source: "beIN Sports / Yahoo Sports / Goal.com",
  },
  {
    teamId: "t11",
    playerName: "William Saliba",
    reason: "Kronik sırt sakatlığı (Fransa Milli Takımı'nda nüksetti, ameliyat gerekmedi)",
    expectedReturn: "Uzun süre (yönetilen rehabilitasyon programı ~4 aya kadar sürebilir)",
    asOf: "2026-09-16",
    source: "Yahoo Sports / goonernews.com",
  },
  {
    teamId: "t11",
    playerName: "Jurriën Timber",
    reason: "Kasık ameliyatı sonrası (yazın küçük bir ameliyat geçirdi, henüz grup antrenmanına dönmedi)",
    expectedReturn: "Eylül sonu / Ekim başı (Ipswich Ligi Kupası maçı hedefleniyor)",
    asOf: "2026-09-16",
    source: "Yahoo Sports / aftv.co.uk",
  },
  {
    teamId: "t20",
    playerName: "Ian Maatsen",
    reason: "Ayak bileği tendon hasarı (Nottingham Forest maçında, kırık yok)",
    expectedReturn: "6-8 hafta (Ekim sonu / Kasım başı)",
    asOf: "2026-09-16",
    source: "Yahoo Sports / Yardbarker",
  },
  {
    teamId: "t25",
    playerName: "Jayden Oosterwolde",
    reason: "Aşil tendonu sakatlığı",
    expectedReturn: "Aralık başı",
    asOf: "2026-09-16",
    source: "CNN Türk / Milliyet / NTV / sakat-ve-cezali.com",
  },
  {
    teamId: "t26",
    playerName: "Ethan Mbappé",
    reason: "Kırmızı kart cezası (8 Eylül, Real Betis deplasmanı, 56. dk VAR incelemesiyle doğrudan kırmızı -- rakip oyuncunun yüzüne kol savurma) -- UEFA disiplin süreci sürüyor, en az 3 maç ceza bekleniyor",
    expectedReturn: "13-14 Ekim (UCL lig fazı 2. haftası maçını kesin kaçıracak; UEFA'nın kesin ceza kararına göre daha da uzayabilir)",
    asOf: "2026-09-20",
    source: "Yahoo Sports / Goal.com / L'Équipe (via shango.media) / Get French Football News",
    type: "suspension",
  },
  {
    teamId: "t28",
    playerName: "Samu",
    reason: "Ön çapraz bağ yırtığı (Şubat'tan beri sahalardan uzak)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "flashscore.com / heavy.com",
  },
  {
    teamId: "t28",
    playerName: "Zaidu Sanusi",
    reason: "Adduktor (kasık) kas grubunda yırtık",
    expectedReturn: "Yaklaşık 2 ay (Kasım ortası)",
    asOf: "2026-09-16",
    source: "Complete Sports / allAfrica.com",
  },
  {
    teamId: "t28",
    playerName: "Jan Bednarek",
    reason: "Kırmızı kart cezası (2025-26 sezonu UEFA Avrupa Ligi çeyrek finali Nottingham Forest maçından kalan 2 maçlık ceza, kulübün bu sezon terfi ettiği Şampiyonlar Ligi'ne taşındı) -- lig fazının ilk 2 maçını (Manchester City, Real Betis) kaçırdı",
    expectedReturn: "20 Ekim (PSV Eindhoven maçında dönecek)",
    asOf: "2026-09-20",
    source: "Sports Mole / A Bola / O Jogo / RotoWire",
    type: "suspension",
  },
  {
    teamId: "t35",
    playerName: "Wilfried Singo",
    reason: "Sağ uyluk biceps femoris kas grubunda tendon hasarı ve kanama -- tedavisi iyi gidiyor ama Kasımpaşa (9 Ekim) ve Barcelona (13 Ekim) maçlarında forma giymesi beklenmiyor",
    expectedReturn: "17 Ekim (Gençlerbirliği maçı hedefleniyor)",
    asOf: "2026-10-11",
    source: "Galatasaray resmi açıklaması / AA (kulüp doktoru Yener İnce) / A Haber / Milli Gazete",
  },

  // ---- Trendyol Süper Lig ----
  {
    teamId: "s1",
    playerName: "Wilfried Singo",
    reason: "Sağ uyluk biceps femoris kas grubunda tendon hasarı ve kanama -- tedavisi iyi gidiyor ama Kasımpaşa (9 Ekim) ve Barcelona (13 Ekim) maçlarında forma giymesi beklenmiyor",
    expectedReturn: "17 Ekim (Gençlerbirliği maçı hedefleniyor)",
    asOf: "2026-10-11",
    source: "Galatasaray resmi açıklaması / AA (kulüp doktoru Yener İnce) / A Haber / Milli Gazete",
  },
  {
    teamId: "s3",
    playerName: "Rıdvan Yılmaz",
    reason: "Sol uyluk iç adalesinde gerilme ve ödem (Fenerbahçe derbisinde çıktı)",
    expectedReturn: "Eylül sonu (UEFA Avrupa Ligi Marsilya maçına yetiştirilmesi hedefleniyor)",
    asOf: "2026-09-16",
    source: "ASpor / Habertürk / CNN Türk / sporx.com",
  },
  {
    teamId: "s4",
    playerName: "Okay Yokuşlu",
    reason: "Ciddi sakatlık -- ameliyat olacak, sezonun kalanında forma giyemeyecek",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Hürriyet / gzt.com / ASpor",
  },
  {
    teamId: "s4",
    playerName: "Ruslan Malinovskyi",
    reason: "Sol dizin iç kısmında yaygın yumuşak doku ve kemik ödemi -- 10 Ekim Samsunspor maçında da sakatlığı nedeniyle kadroda yoktu",
    expectedReturn: null,
    asOf: "2026-10-11",
    source: "gzt.com / haber61.net / 61saat.com",
  },
  {
    teamId: "s6",
    playerName: "Tanguy Coulibaly",
    reason: "Darbeye bağlı sakatlık, sezon başında ameliyat oldu",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "samsunhaber.com / samsungazetesi.com",
  },
  {
    teamId: "s6",
    playerName: "Elayis Tavşan",
    reason: "Ayak kırığı",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "samsunhaber.com / dengegazetesi.com.tr",
  },
  {
    teamId: "s6",
    playerName: "Marius Mouandilmadji",
    reason: "Uyluk sakatlığı (takım antrenmanlarına dönüyor)",
    expectedReturn: "Eylül sonu",
    asOf: "2026-09-16",
    source: "samsunhaber.com / gazetearena.com",
  },
  {
    teamId: "s6",
    playerName: "Fatih Kaya",
    reason: "Sol kasıkta 2. derece adale yırtığı (Fenerbahçe maçında, 16. dakikada çıktı)",
    expectedReturn: "Ekim ortası",
    asOf: "2026-09-16",
    source: "kocaeligundem.com / samsunhaber.com",
  },
  {
    teamId: "s6",
    playerName: "Afonso Sousa",
    reason: "Kas sakatlığı, tedavisi sürüyor",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "samsungazetesi.com / sakat-ve-cezali.com",
  },
  {
    teamId: "s7",
    playerName: "Allan Godói",
    reason: "Diz iç bağında kısmi yırtık (ağır sakatlık olarak doğrulandı)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Sabah / haberekspres.com.tr / gazeteyenigun.com.tr",
  },
  {
    teamId: "s7",
    playerName: "Furkan Bayır",
    reason: "Önceki sezondan kalma çapraz bağ ameliyatı sonrası uzun süreli sakatlık",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "haberekspres.com.tr / gazeteyenigun.com.tr",
  },
  {
    teamId: "s8",
    playerName: "Haris Hajradinovic",
    reason: "Baldır/bacak sakatlığı (320 gün sonra Ağustos'ta sahalara dönmüştü, yeni bir sakatlıkla yeniden sahalardan uzak kaldı)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "Sabah / Cumhuriyet / sporx.com",
  },
  {
    teamId: "s8",
    playerName: "Thiemoko Diarra",
    reason: "Darbeye bağlı sakatlık",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "amidahaber.com / mucadelegazetesi.com.tr",
  },
  {
    teamId: "s12",
    playerName: "Khusniddin Alikulov",
    reason: "Ön çapraz bağ yırtığı, diz kapağı yarı çıkması ve menisküs hasarı (Ocak 2026'da sezonu kapattı)",
    expectedReturn: "Ekim 2026 (6-9 aylık öngörülen dönüş penceresinin sonu)",
    asOf: "2026-09-16",
    source: "Sabah / haber7.com / cayhaber.net",
  },
  {
    teamId: "s17",
    playerName: "Bruno Petković",
    reason: "Uzun süredir devam eden, netliğe kavuşmamış sakatlık (kulüp/doktorlar dahi kesin teşhis koyamadı, ameliyat ihtimali var)",
    expectedReturn: null,
    asOf: "2026-09-16",
    source: "kocaeligazetesi.com.tr / kocaelihalkgazetesi.com",
  },
  // ---- 2026-10-12 tazelemesi (7. hafta sonrası) ----
  {
    teamId: "s17",
    playerName: "Anfernee Dijksteel",
    reason: "Biceps femoris kasında yırtık -- bireysel saha çalışmalarına başladı",
    expectedReturn: null,
    asOf: "2026-10-06",
    source: "beIN Sports Türkiye (Kocaelispor sağlık açıklaması)",
  },
  {
    teamId: "s3",
    playerName: "Václav Černý",
    reason: "11 Ekim Kocaelispor maçında 38. dakika civarında sakatlanarak yerini İlhan Fakılı'ya bıraktı; sakatlığın türü henüz açıklanmadı",
    expectedReturn: null,
    asOf: "2026-10-11",
    source: "Takvim / Habertürk",
  },
  {
    teamId: "s1",
    playerName: "Lucas Torreira",
    reason: "Kırmızı kart cezası -- 9 Ekim Kasımpaşa maçında VAR incelemesi sonrası son adam pozisyonundan direkt kırmızı kart gördü; bir sonraki Süper Lig maçında oynayamayacak (Şampiyonlar Ligi'ndeki Barcelona maçına engel değil)",
    expectedReturn: "Bir sonraki Süper Lig maçından sonra (PFDK'nın ek ceza verip vermeyeceği henüz netleşmedi)",
    asOf: "2026-10-11",
    source: "Hürriyet / Takvim / ESPN",
    type: "suspension",
  },
  {
    teamId: "t10",
    playerName: "Morten Hjulmand",
    reason: "Kırmızı kart cezası -- 20 Ekim'de Stuttgart deplasmanında (1-1) 64. dakikada kırmızı kart gördü; UEFA kuralı gereği bir sonraki Şampiyonlar Ligi maçında oynayamaz",
    expectedReturn: "UCL 4. hafta maçından sonra (UEFA'nın ek ceza verip vermeyeceği henüz netleşmedi)",
    asOf: "2026-10-21",
    source: "Sporkolik / Bundesliga.com / Sporx",
    type: "suspension",
  },
  {
    teamId: "t8",
    playerName: "Leny Yoro",
    reason: "Kırmızı kart cezası -- 13 Ekim'de Atlético Madrid deplasmanında (2-0 yenilgi) ikinci yarıda VAR incelemesi sonrası kırmızı kart gördü; UEFA kuralı gereği bir sonraki Şampiyonlar Ligi maçında oynayamaz",
    expectedReturn: "UCL 3. hafta maçından sonra (UEFA'nın ek ceza verip vermeyeceği henüz netleşmedi)",
    asOf: "2026-10-14",
    source: "ESPN / thesportsencounter.com",
    type: "suspension",
  },
  {
    teamId: "s18",
    playerName: "Dilhan Demir",
    reason: "Ön çapraz bağ yırtığı",
    expectedReturn: "Kasım başı",
    asOf: "2026-09-16",
    source: "sakat-ve-cezali.com",
  },
  {
    teamId: "s18",
    playerName: "Kévin Rodrigues",
    reason: "Sakatlık sonrası tedavi sürecini tamamladı, takımdan ayrı bireysel çalışıyor",
    expectedReturn: "Eylül sonu (takıma yakında dönmesi bekleniyor)",
    asOf: "2026-09-16",
    source: "sporanki.com",
  },
];

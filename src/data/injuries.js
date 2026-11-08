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
    reason: "Kırmızı kart cezası (8 Eylül, Real Betis maçı, 56. dk VAR incelemesiyle doğrudan kırmızı -- rakip oyuncunun yüzüne dirsek) -- UEFA 3 maç ceza verdi: Arsenal, Galatasaray ve Bodø/Glimt maçlarını kaçırıyor (son maçı 3 Kasım Bodø/Glimt deplasmanı)",
    expectedReturn: "25 Kasım (Bayern Münih maçı)",
    asOf: "2026-11-02",
    source: "Fanatik (UEFA açıklaması) / Ghanaian Times / maxifoot.fr / Goal.com",
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

  // ---- Trendyol Süper Lig ----
  {
    teamId: "s4",
    playerName: "Okay Yokuşlu",
    reason: "Ciddi sakatlık -- ameliyat olacak, sezonun kalanında forma giyemeyecek",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "Hürriyet / gzt.com / ASpor / Ajansspor (10. hafta listesi)",
  },
  {
    teamId: "s4",
    playerName: "Ruslan Malinovskyi",
    reason: "Sol dizin iç kısmında yaygın yumuşak doku ve kemik ödemi -- 10. hafta öncesinde de sakatlar listesinde",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "gzt.com / haber61.net / 61saat.com / Ajansspor (10. hafta listesi)",
  },
  {
    teamId: "s6",
    playerName: "Fatih Kaya",
    reason: "Sol kasıkta 2. derece adale yırtığı (Fenerbahçe maçında, 16. dakikada çıktı) -- Başakşehir maçı öncesinde hâlâ kadro dışı",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "kocaeligundem.com / samsunhaber.com / Ajansspor (10. hafta listesi) / Aksiyon",
  },
  {
    teamId: "s7",
    playerName: "Allan Godói",
    reason: "Diz iç bağında kısmi yırtık (ağır sakatlık olarak doğrulandı)",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "Sabah / haberekspres.com.tr / gazeteyenigun.com.tr / Ajansspor (10. hafta listesi)",
  },
  {
    teamId: "s7",
    playerName: "Furkan Bayır",
    reason: "Önceki sezondan kalma çapraz bağ ameliyatı sonrası uzun süreli sakatlık",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "haberekspres.com.tr / gazeteyenigun.com.tr / Ajansspor (10. hafta listesi)",
  },
  {
    teamId: "s12",
    playerName: "Khusniddin Alikulov",
    reason: "Ön çapraz bağ yırtığı, diz kapağı yarı çıkması ve menisküs hasarı (Ocak 2026'da sezonu kapattı) -- 10. hafta öncesinde hâlâ sakatlar listesinde",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "Sabah / haber7.com / cayhaber.net / Ajansspor (10. hafta listesi)",
  },
  {
    teamId: "s17",
    playerName: "Bruno Petković",
    reason: "Uzun süredir devam eden, netliğe kavuşmamış sakatlık (kulüp/doktorlar dahi kesin teşhis koyamadı, ameliyat ihtimali var)",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "kocaeligazetesi.com.tr / kocaelihalkgazetesi.com / Ajansspor (10. hafta listesi)",
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
    reason: "11 Ekim Kocaelispor maçında 38. dakika civarında sakatlanarak yerini İlhan Fakılı'ya bıraktı -- 10. hafta öncesinde hâlâ sakatlar listesinde",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "Takvim / Habertürk / Ajansspor (10. hafta listesi)",
  },
  {
    teamId: "t6",
    playerName: "Alessandro Bastoni",
    reason: "Kırmızı kart cezası -- 21 Ekim'de Shakhtar maçında (1-0) ikinci yarıda kırmızı kart gördü; UEFA kuralı gereği bir sonraki Şampiyonlar Ligi maçında oynayamaz",
    expectedReturn: "UCL 4. hafta maçından sonra (UEFA'nın ek ceza verip vermeyeceği henüz netleşmedi)",
    asOf: "2026-10-27",
    source: "ESPN / SoccerMag",
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
    reason: "Sakatlık -- 10. hafta öncesinde hâlâ sakatlar listesinde",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "sporanki.com / Ajansspor (10. hafta listesi)",
  },
  // ---- 2026-10-31 tazelemesi (Süper Lig 10. hafta) ----
  // Kaynak: Ajansspor "Süper Lig 10. hafta sakatlar, cezalılar ve eksikler listesi" (30 Ekim
  // 12:35). Liste sakatlığın türünü vermediği için reason genel bırakıldı. Derbi cezaları
  // (Brown / Abdülkerim) PFDK'nın 29 Ekim kararıyla AA, İHA, Hürriyet, Sözcü'den doğrulandı.
  // ÇIKARILANLAR: Singo (s1+t35) ve Torreira (Konyaspor maçında ilk 11'de başladılar --
  // beIN), Afonso Sousa'nın eski sakatlık kaydı (24 Ekim'de oynayıp kırmızı kart gördü),
  // Thiemoko Diarra (9 Ekim'de asist yaptı), Mouandilmadji ve Rıdvan Yılmaz (güncel listelerde
  // yoklar), Leny Yoro (UCL 3. hafta cezasını çekti).
  {
    teamId: "s2",
    playerName: "Archie Brown",
    reason: "PFDK'dan 3 maç men cezası -- 26 Ekim derbisinin bitiş düdüğünde Abdülkerim Bardakcı ile kavga ettiği için direkt kırmızı kart gördü (UEFA maçlarına engel değil)",
    expectedReturn: "3 Süper Lig maçı sonrası: Göztepe (31 Eki) ve Çorum FK (8 Kas) dahil (Tahkim Kurulu indirim yapmazsa)",
    asOf: "2026-10-31",
    source: "AA / İHA / Hürriyet / Sözcü / Milli Gazete / Ajansspor",
    type: "suspension",
  },
  { teamId: "t25", playerName: "Marco Asensio", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "t25", playerName: "Nathan Aké", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s2", playerName: "Marco Asensio", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s2", playerName: "Nathan Aké", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s3", playerName: "Orkun Kökçü", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s3", playerName: "Milot Rashica", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s3", playerName: "Fabio Miretti", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  {
    teamId: "s4",
    playerName: "Franculino Djú",
    reason: "Kas sakatlığı -- 26 Ekim Rizespor maçının sonunda kas ağrısı yaşadı (Thomas Reis ciddi olmamasını umduğunu söyledi)",
    expectedReturn: null,
    asOf: "2026-10-30",
    source: "Ajansspor (10. hafta listesi) / iscihaber",
  },
  { teamId: "s4", playerName: "Mustafa Eskihellaç", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s5", playerName: "Jerome Opoku", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s6", playerName: "Emre Kılınç", reason: "Sakatlık -- Başakşehir maçı kadrosunda yer almayacak", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi) / Aksiyon" },
  { teamId: "s6", playerName: "Celil Yüksel", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s8", playerName: "Godfried Frimpong", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s8", playerName: "Fousseni Diabaté", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s9", playerName: "Adil Demirbağ", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  { teamId: "s12", playerName: "Ahmed Kutucu", reason: "Sakatlık -- Kocaelispor maçında forma giyemeyecek", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi) / analiz53" },
  { teamId: "s18", playerName: "Dimitrios Goutas", reason: "Sakatlık (türü açıklanmadı)", expectedReturn: null, asOf: "2026-10-30", source: "Ajansspor (10. hafta listesi)" },
  // ---- 2026-11-02 tazelemesi (Süper Lig 10. hafta sonrası) ----
  // ÇIKARILANLAR: Tanguy Coulibaly ve Elayis Tavşan (s6 -- 1 Kasım Başakşehir maçında ikisi de
  // gol attı, Fanatik), Haris Hajradinovic (s8 -- 1 Kasım Beşiktaş maçında Winck'in golüne asist
  // yaptı, Hürriyet), 10. hafta cezalarını çeken Afonso Sousa (ikinci sarıdan kırmızı), Mbaye
  // Diagne, Lumbardh Dellova, Myenty Abena; Jan Bednarek (t28 -- cezası 20 Ekim'de bitti).
  // GÜNCELLENEN: Ethan Mbappé (t26 -- UEFA'nın 3 maçlık cezası netleşti).
  {
    teamId: "s11",
    playerName: "Samuel Ballet",
    reason: "Kırmızı kart cezası -- 1 Kasım Eyüpspor maçında (5-1) hat-trick yaptıktan sonra maçın son dakikalarında VAR incelemesiyle El Yamiq'e yaptığı faul nedeniyle direkt kırmızı kart gördü",
    expectedReturn: "PFDK kararına göre (en az 1 maç) -- 11. hafta Galatasaray maçında cezalı",
    asOf: "2026-11-02",
    source: "sondakika.com / Ajansspor / Van Ekspres",
    type: "suspension",
  },
  // ---- 2026-11-07 tazelemesi (UCL 4. hafta + Süper Lig 11. hafta) ----
  // ÇIKARILANLAR: Abdülkerim Bardakcı (s1 -- 2 maçlık PFDK cezasını Konyaspor ve 7 Kasım Amed
  // SFK maçlarında çekti; Ajansspor 11. hafta listesi Amed maçı için hâlâ cezalı gösteriyordu).
  // Rafael Leão'nun 7 Kasım Amed maçındaki sakatlığı kulüpçe henüz açıklanmadığı ve oyuncu
  // kadro dosyalarında bulunmadığı için EKLENMEDİ.
  {
    teamId: "s1",
    playerName: "Victor Osimhen",
    reason: "Sol diz sakatlığı -- 3 Kasım Stuttgart maçında sakatlandı; MR'da sol dizde serbest fragman tespit edildi, Maslak Acıbadem'de artroskopik ameliyat geçirdi (kulüp açıklaması)",
    expectedReturn: "Kesin süre açıklanmadı -- basında 2-3 ile 3-4 hafta arası tahminler var",
    asOf: "2026-11-07",
    source: "Hürriyet / Sözcü / Sporx / GZT / Dünya",
  },
  {
    teamId: "t35",
    playerName: "Victor Osimhen",
    reason: "Sol diz sakatlığı -- 3 Kasım Stuttgart maçında sakatlandı; artroskopik diz ameliyatı geçirdi (kulüp açıklaması)",
    expectedReturn: "Kesin süre açıklanmadı -- basında 2-3 ile 3-4 hafta arası tahminler var (GZT: Aston Villa ve AEK maçlarını kaçırabilir)",
    asOf: "2026-11-07",
    source: "Hürriyet / Sözcü / Sporx / GZT / Dünya",
  },
  // ---- 2026-11-08 tazelemesi (Süper Lig 11. hafta tamamlandı) ----
  // ÇIKARILANLAR: Ousmane Diabaté (s18 -- 10. hafta cezasını 2 Kasım Alanyaspor maçında çekti).
  // Archie Brown'ın 3 maçlık cezasının son maçı 12. haftada; kayıt korundu.
  {
    teamId: "s1",
    playerName: "Rafael Leão",
    reason: "Sağ arka adale sakatlığı -- 7 Kasım Amed SFK maçında gol attıktan sonra sakatlanıp oyundan çıktı; MR'da sağ üst arka adale grubunda ileri derecede zorlanma ve kanama tespit edildi (kulüp açıklaması)",
    expectedReturn: "Kulüp kesin süre açıklamadı -- basında yaklaşık 4 hafta tahmini var",
    asOf: "2026-11-08",
    source: "Hürriyet / Fotomaç / Milliyet / Sporx / t24",
  },
  {
    teamId: "t35",
    playerName: "Rafael Leão",
    reason: "Sağ arka adale sakatlığı -- 7 Kasım Amed SFK lig maçında sakatlandı; MR'da ileri derecede zorlanma ve kanama tespit edildi (kulüp açıklaması)",
    expectedReturn: "Kulüp kesin süre açıklamadı -- basında yaklaşık 4 hafta tahmini var (Aston Villa maçını kaçırması bekleniyor)",
    asOf: "2026-11-08",
    source: "Hürriyet / Fotomaç / Milliyet / Sporx / t24",
  },
  {
    teamId: "s18",
    playerName: "Metehan Baltacı",
    reason: "Kırmızı kart cezası -- 8 Kasım Beşiktaş maçında (0-3) 22. dakikada Vlahović'i formasından çektiği için ikinci sarı karttan kırmızı kart gördü",
    expectedReturn: "12. hafta maçında cezalı (ikinci sarıdan kırmızı kartta otomatik 1 maç men)",
    asOf: "2026-11-08",
    source: "Habertürk / Star / Milliyet / CNN Türk",
    type: "suspension",
  },
];

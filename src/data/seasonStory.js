// "Sezon Hikayesi" -- 2026-27 Trendyol Süper Lig sezonunun GERÇEK, kaynaklı
// öne çıkan anlarının kronolojik arşivi. Kurgusal/tahmini DEĞİL.
//
// AMAÇ: news.js'teki kısa/genel gündem haberlerinden FARKLI olarak, burası
// sadece sezonun GERÇEKTEN hikaye değeri taşıyan anlarını (tarihi ilkler,
// rekorlar, sürpriz sonuçlar, skandallar/tartışmalar, önemli sakatlıklar,
// teknik direktör değişiklikleri, dikkat çekici başarılar/başarısızlıklar)
// biriktirir -- sezon boyunca hafta hafta büyür, sezon sonunda bu arşiv
// doğrudan "sezonun hikayesi" özetinin iskeletini oluşturur.
//
// YÖNTEM: her girdi en az bir kaynakla (mümkünse 2+) doğrulanmış gerçek bir
// olaya dayanır. Uydurma/abartılı "dramatik" anlatım YOK -- özet cümleleri
// gerçek olguları sade biçimde anlatır, spekülasyon eklenmez. Doğrulanamayan
// bir ayrıntı (ör. net olmayan bir hakem kararının arka planı) eklenmez.
//
// category alanı (UI'da filtre/ikon için kullanılır):
//   "tarihi-an"      -- bir kulüp/oyuncu için ilk kez yaşanan bir şey
//   "rekor"          -- sayısal bir rekor/istatistiksel aşırılık
//   "surpriz"        -- beklenmedik bir sonuç (güçlü favori kaybetti vb.)
//   "skandal"        -- tartışma/hakem krizi/disiplin olayı
//   "sakatlik"        -- hikaye değeri olan bir sakatlık (rutin liste için
//                        bkz. injuries.js -- burası sadece ÖNEMLİ olanlar)
//   "teknik-direktor" -- teknik direktör değişikliği/kriz
//   "basari"          -- dikkat çekici bir başarı (seri, hat-trick, vb.)
//   "basarisizlik"    -- dikkat çekici bir başarısızlık (ağır mağlubiyet vb.)
//
// asOf: bu dosyanın en son güncellendiği gün.
//
// 2026-09-22 DOLDURMA TURU: dosya ilk kez dolduruldu (1-6. Hafta, 14 Ağustos
// - 20 Eylül 2026 aralığı, 21 girdi). Kaynak karması: (1) bu projenin zaten
// araştırılmış kendi veri dosyalarından madencilik -- src/data/news.js
// (managerial kriz, hakem tartışması, sakatlık haberleri), src/data/
// liveStatus.js (SUPER_LIG_LIVE_RESULTS/STANDINGS -- yeni yükselen Amed
// SFK'nın 6. haftayı lider tamamlaması, Eyüpspor/Samsunspor'un kötü
// gidişatı, Kocaelispor'un en az gol yiyen takım olması gibi tablo
// gerçekleri buradan çıkarıldı), src/data/topScorers.js (başlık
// metodoloji notlarındaki düzeltmeler -- Çorum FK'nın tarihi ilk golü,
// Mohamed Salah'ın gerçek 7 gollük toplamı, Çorum FK'nın Samsunspor
// deplasmanındaki 5-1 galibiyetinin gol dakikaları), src/data/
// matchStatsSuperLig.js (Trabzonspor-Galatasaray derbisindeki kartlar/xG,
// Fenerbahçe-Eyüpspor'daki xG) ve src/data/injuries.js (Valentin
// Mihăilă'nın kırmızı kart cezası, Lesley Ugochukwu'nun cezası). (2) Bu
// turda ayrıca hedefli YENİ WebSearch/WebFetch araştırması yapıldı:
// Gaziantep FK'nın teknik direktör Mirel Radoi ile ayrılığı ve yerine
// Orhan Ak'ın gelişi (sporx.com, gazianteppusula.com, politikam.com,
// egelobisi.com, haber342.com), Amed SFK'nın yeni yükselen bir takım
// olarak Süper Lig tarihinde ilk kez 6. haftayı lider tamamlaması
// (sporx.com), Fenerbahçe'nin Eyüpspor'u 8-0 mağlup ettiği maçtaki kulüp
// rekorları (NTVSpor, Hürriyet, ajansspor.com). Doğrulanamayan/çelişkili
// hiçbir ayrıntı eklenmedi -- ör. Gaziantep FK'nın yeni teknik direktörü
// ilk başta Çağdaş Atan olarak konuşulduysa da bu bir anlaşma söylentisiydi;
// resmi imza politikam.com'un 4 Eylül tarihli haberiyle Orhan Ak için
// doğrulandığından metin buna göre yazıldı.
//
// 2026-09-23 DOLDURMA TURU (alıntı + oyuncu hikayesi turu): kullanıcı mevcut
// girdilerin "buzdağının görünen kısmı" olduğunu belirtip iki spesifik açıdan
// DAHA DERİN araştırma istedi: (1) basın toplantısı açıklamaları -- maç
// sonrası teknik direktör/oyuncu alıntıları, (2) oyuncu bazlı kariyer
// hikayeleri -- bir anın belirli bir oyuncu için KİŞİSEL olarak neden önemli
// olduğu (sakatlık sonrası dönüş, kariyer dönüm noktası, büyük bir transferin
// sahada kanıtlanması vb.). Bu turda Süper Lig dizisine 8 yeni girdi
// (sl-story-22..29), UCL dizisine 11 yeni girdi (ucl-story-18..28) eklendi --
// hiçbir mevcut girdi silinmedi/değiştirilmedi. Kaynak karması: doğrudan
// alıntı içeren girdiler için resmi kulüp/UEFA basın toplantısı
// transkriptleri veya en az 2 bağımsız Türk/uluslararası spor medyası kaynağı
// (NTVSpor, Fanatik, Hürriyet, ASpor, Cumhuriyet, Sporx, fotomac.com.tr,
// Arsenal.com'un "every word" basın toplantısı transkripti, ESPN, Al
// Jazeera, Sky Sports, Goal.com, football-italia.net, Bundesliga.com,
// UEFA.com, fotmob.com) WebSearch ile taranıp doğrulandı. İngilizce orijinal
// alıntılar (ör. Arteta, Mourinho, Allegri, Emery) sadık biçimde Türkçeye
// çevrilip tırnak içinde verildi -- bu, dosyanın geri kalanındaki (ör.
// mevcut news-ucl-42'deki Arteta alıntısı) yerleşik yöntemle tutarlıdır.
// Doğrudan alıntı BULUNAMAYAN ama gerçek/doğrulanmış bir kariyer olgusuna
// dayanan girdilerde (ör. Cengiz Ünder'in kulüpler arası yolculuğu, Michael
// Carrick'in basın toplantısı özeti) tırnak KULLANILMADI, dolaylı anlatım
// tercih edildi. Bu turda YENİ eklenen dikkat çekici ayrıntılar arasında:
// Gift Orban'ın Gent -> Lyon (14M€, Ocak 2024) -> Hoffenheim -> Verona
// hattındaki düşüşünün ardından Amed SFK'de "yeniden doğuşu" (sözcü.com.tr,
// milliyet.com.tr, cumhuriyet.com.tr, nefes.com.tr, gzt.com), Dušan
// Vlahović'in Juventus'ta sözleşmesinin son yılına girdiği için kadro dışı
// bırakıldığını savunan açıklamaları (Goal.com, Yardbarker), Mohamed Salah'ın
// Trabzonspor imza törenindeki sözleri ve Liverpool'dan (257 gol/442 maç,
// teknik direktör Arne Slot ile yaşanan kamuya yansıyan anlaşmazlık) ayrılış
// bağlamı (fanatik.com.tr, ASpor, ESPN, Bleacher Report), İsmail Kartal'ın
// tek günlük istifasının TAM konuşma metni (NTVSpor, ASpor, HaberGo) ve
// Serhou Guirassy'nin "çılgın" Villarreal gecesinin aynı zamanda Borussia
// Dortmund'daki 100. resmi maçı olduğu bilgisi (fotmob.com, beIN Sports)
// sayılabilir. Doğrulanamayan/çelişkili hiçbir alıntı veya ayrıntı
// eklenmedi -- ör. Guirassy'nin 100. maç bilgisi iki bağımsız kaynakla
// (fotmob.com VE beIN Sports) çapraz doğrulanarak eklendi; Okan Buruk'un
// Sporting CP maçındaki VAR hakemine yönelik "ben olsam hakemlik hayatını
// bitiririm" sözü NTVSpor/Cumhuriyet/TGRT Haber arasında tutarlı olduğu için
// eklendi, ama VAR hakeminin (Alman, Christian Dingert) ana hakem Espen
// Eskås'tan FARKLI bir görevli olduğu netliğiyle -- mevcut ucl-story-10'daki
// ana hakem bilgisiyle ÇELİŞMEDİĞİ teyit edilerek -- yazıldı.
// 2026-09-23 DERİNLEŞTİRME TURU 3-4 (BİRLEŞTİRİLDİ): kullanıcının "daha
// derin" isteği üzerine paralel çalışan iki ayrı araştırma turu (dosya
// çakışmasını önlemek için geçici olarak seasonStoryDeepDive1.js/
// seasonStoryDeepDive2.js'e yazılmıştı) buraya elle birleştirildi:
// (3) taraftar tepkileri + PFDK/UEFA disiplin kararlarının somut madde/ceza
// detayı (sl-extra1-*, ucl-extra1-*) ve (4) transfer sonrası hikayeler +
// hakem geçmişi/VAR protokol detayı (sl-extra2-*, ucl-extra2-*). Toplam 13
// yeni Süper Lig, 6 yeni UCL girdisi eklendi. Özet kaynaklar: PFDK'nın 3
// Eylül 2026 tarihli 5 sayılı toplantı kararı (fotomac.com.tr tam metin + 6
// bağımsız yerel haber kaynağıyla çapraz doğrulandı), Vlahović/Salah/Icardi/
// Lukaku transfer sagaları (football-italia.net, fanatik.com.tr, mynet.com,
// Yahoo Sports, ESPN), Batuhan Kolak ve Espen Eskås'ın hakemlik geçmişi
// (milliyet.com.tr, hurriyet.com.tr), Konečný'nin kırmızı kartının tam VAR
// protokolü (Newsy Today). Doğrulanamayan tekil ayrıntılar (ör. VAR
// görevlisinin adının kaynaklar arasında "Bastian" mı "Christian" mı olduğu
// net değildi) KASITLI OLARAK metne yazılmadı.
export const SEASON_STORY_SUPERLIG = [
  {
    id: "sl-story-1",
    date: "2026-08-14",
    week: 1,
    category: "tarihi-an",
    title: "Çorum FK'nın Süper Lig tarihindeki ilk golü",
    summary:
      "Süper Lig'e ilk kez yükselen Çorum FK, açılış maçında deplasmanda Galatasaray ile 2-2 berabere kaldı. Ev sahibi adına iki golü de Victor Osimhen attı (biri sezonun ilk golüydü); Çorum FK'nın kulüp tarihindeki ilk Süper Lig golünü ise 59. dakikada Alexandros Kyziridis kaydetti.",
    relatedTeamIds: ["s13", "s1"],
    relatedPlayerNames: ["Alexandros Kyziridis", "Victor Osimhen"],
    source: "Hürriyet / ajansspor.com",
  },
  {
    id: "sl-story-2",
    date: "2026-08-16",
    week: 1,
    category: "tarihi-an",
    title: "Amed SFK'nın Süper Lig'deki ilk galibiyeti",
    summary:
      "Kulüp tarihinde ilk kez Süper Lig'e yükselen Amed Sportif Faaliyetler, açılış haftasında sahasında ağırladığı -- kendisi gibi yeni yükselen -- Erzurumspor FK'yı 3-0 mağlup ederek ligdeki ilk galibiyetini aldı.",
    relatedTeamIds: ["s11", "s14"],
    source: "Türkçe Vikipedi (2026-27 Süper Lig) / sporx.com",
  },
  {
    id: "sl-story-3",
    date: "2026-08-31",
    week: 3,
    category: "teknik-direktor",
    title: "Sezonun ilk teknik direktör ayrılığı: Gaziantep FK - Mirel Radoi",
    summary:
      "3. hafta maçında sahasında Çaykur Rizespor'a 1-2 mağlup olan Gaziantep FK, Nisan 2026'dan beri görevde olan teknik direktör Mirel Radoi ile karşılıklı anlaşarak yollarını ayırdı -- sezonun ilk teknik direktör değişikliği. Kısa süren bir Çağdaş Atan görüşmesinin ardından kulüp, 4 Eylül'de Orhan Ak ile sezon sonuna kadar geçerli bir sözleşme imzaladı.",
    relatedTeamIds: ["s15"],
    source: "sporx.com / gazianteppusula.com / politikam.com / egelobisi.com",
  },
  {
    id: "sl-story-4",
    date: "2026-09-01",
    week: 4,
    category: "surpriz",
    title: "Atletico Madrid'in Osimhen teklifi geri çevrildi",
    summary:
      "Victor Osimhen, Atletico Madrid'e gidebilmek için maaşında indirime gitmeyi kabul etmesine rağmen İspanyol kulübü, Julian Alvarez'i öncelikli forvet olarak belirleyip mali nedenlerle 75 milyon euroluk transferi reddetti; Osimhen 2029'a kadar geçerli sözleşmesiyle Galatasaray'da kaldı.",
    relatedTeamIds: ["s1"],
    relatedPlayerNames: ["Victor Osimhen"],
    source: "Goal.com / beIN Sports / Guardian Nigeria",
  },
  {
    id: "sl-story-5",
    date: "2026-09-03",
    week: 3,
    category: "sakatlik",
    title: "Trabzonspor'un genç yeteneği Noah Saviolo'da sakatlık şoku",
    summary:
      "3. hafta maçında Amed SFK karşısında sakatlanan genç oyuncu Noah Saviolo'nun MR görüntülemesinde sağ omuz arka kas grubunda kanama ve kemik ödemi tespit edildi. Saviolo birkaç hafta sonra sahalara döndü ve 6. hafta Galatasaray derbisinde gol attı.",
    relatedTeamIds: ["s4"],
    relatedPlayerNames: ["Noah Saviolo"],
    source: "gzt.com / Fotomaç / ASpor / Takvim",
  },
  {
    id: "sl-story-6",
    date: "2026-09-05",
    week: 4,
    category: "sakatlik",
    title: "Galatasaray'da çifte sakatlık şoku: Osimhen ve Lemina",
    summary:
      "İstanbul Başakşehir deplasmanında (4. hafta) ikisi de sağ adduktor kas grubunda zorlanma yaşayan Victor Osimhen ve Mario Lemina, MR ile doğrulanan sakatlıkları nedeniyle Süper Lig'de Kocaelispor (5. hafta) ve Trabzonspor derbisi (6. hafta) dahil yaklaşık 3 hafta sahalardan uzak kaldı.",
    relatedTeamIds: ["s1"],
    relatedPlayerNames: ["Victor Osimhen", "Mario Lemina"],
    source: "Fotomaç / Anadolu Ajansı / Fanatik / gzt.com / Cumhuriyet / KARAR",
  },
  {
    id: "sl-story-7",
    date: "2026-09-05",
    week: 4,
    category: "surpriz",
    title: "Beşiktaş, Kadıköy'de geriden gelip derbiyi kazandı",
    summary:
      "4. hafta derbisinde Fenerbahçe'nin Milan Škriniar'ın golüyle öne geçtiği maçta Beşiktaş, Rıdvan Yılmaz ve Dušan Vlahović'in golleriyle 2-1 geriden gelerek kazandı. Bu sonuç, Vincenzo Italiano'nun Beşiktaş başındaki ilk derbi galibiyeti oldu.",
    relatedTeamIds: ["s2", "s3"],
    relatedPlayerNames: ["Rıdvan Yılmaz", "Dušan Vlahović"],
    source: "Hürriyet / beIN Sports / Milli Gazete",
  },
  {
    id: "sl-story-8",
    date: "2026-09-06",
    week: 4,
    category: "tarihi-an",
    title: "Mohamed Salah'tan Süper Lig'deki ilk gol",
    summary:
      "Trabzonspor'un yaz transferi Mohamed Salah, 4. hafta maçında Gençlerbirliği'ni 5-0 mağlup ettikleri karşılaşmada 14. dakikada penaltıdan attığı golle Süper Lig'deki ilk golünü kaydetti; Paul Onuachu da bu maçta iki gol attı.",
    relatedTeamIds: ["s4", "s18"],
    relatedPlayerNames: ["Mohamed Salah"],
    source: "Hürriyet / Fanatik / Star",
  },
  {
    id: "sl-story-9",
    date: "2026-09-11",
    week: 5,
    category: "basari",
    title: "Vincenzo Italiano'nun Beşiktaş'taki kusursuz başlangıcı",
    summary:
      "Beşiktaş, Erzurumspor FK'yı 3-0 mağlup ederek Vincenzo Italiano yönetimindeki resmi maçlardaki 11. karşılaşmasında 9. galibiyetini aldı (2 mağlubiyet, hiç beraberlik yok); takım bu seride 450 dakika boyunca hiç gol yemedi.",
    relatedTeamIds: ["s3", "s14"],
    source: "Takvim / Sporx / Sabah",
  },
  {
    id: "sl-story-10",
    date: "2026-09-11",
    week: 5,
    category: "teknik-direktor",
    title: "Fenerbahçe'de İsmail Kartal'ın bir günlük istifa krizi",
    summary:
      "Şampiyonlar Ligi'nde Roma ile 1-1 berabere kalınan maçın ardından basın toplantısında istifa ettiğini açıklayan teknik direktör İsmail Kartal, kulüp yönetiminin ikna çabalarının ardından aynı gün görevine geri döndü; kulüp 'İsmail Kartal görevinin başındadır' açıklamasıyla durumu netleştirdi ve Kartal, Süper Lig'deki görevine devam etti.",
    relatedTeamIds: ["s2"],
    source: "Fotomaç / Cumhuriyet / Hürriyet",
  },
  {
    id: "sl-story-11",
    date: "2026-09-12",
    week: 5,
    category: "surpriz",
    title: "Konyaspor, Trabzonspor'u mağlup ederek sezonun ilk galibiyetini aldı",
    summary:
      "5. hafta maçında Konyaspor, kendi sahasında Trabzonspor'u Rajmund Tóth'un erken golüyle 1-0 mağlup etti. Bu sonuçla Konyaspor sezonun ilk galibiyetini alırken, yaz transferi Mohamed Salah ikinci yarıda bulduğu pozisyonları değerlendiremedi.",
    relatedTeamIds: ["s9", "s4"],
    relatedPlayerNames: ["Rajmund Tóth"],
    source: "Hürriyet / Habertürk / beIN Sports",
  },
  {
    id: "sl-story-12",
    date: "2026-09-12",
    week: 5,
    category: "surpriz",
    title: "Yeni yükselen Çorum FK, Samsunspor deplasmanından 5 golle döndü",
    summary:
      "5. hafta maçında Çorum FK, Jesus Ramirez'in erken golüyle (1') öne geçti; Samsunspor 5. dakikada Logi Tómasson'un golüyle karşılık verse de, Cengiz Ünder'in 10. ve 15. dakikalardaki golleri farkı açtı. Alexandros Kyziridis (69') ve tekrar Ramirez'in (71') golleriyle maç, yeni yükselen Çorum FK'nın 5-1 deplasman galibiyetiyle sonuçlandı.",
    relatedTeamIds: ["s13", "s6"],
    relatedPlayerNames: ["Jesus Ramirez", "Cengiz Ünder", "Alexandros Kyziridis"],
    source: "Fanatik / Habertürk / Sporkolik.net",
  },
  {
    id: "sl-story-13",
    date: "2026-09-12",
    week: 5,
    category: "skandal",
    title: "Çaykur Rizespor'da Mihăilă'ya VAR'dan kırmızı kart, PFDK'dan 2 maç ceza",
    summary:
      "Eyüpspor deplasmanında oynanan 5. hafta maçında VAR incelemesi sonrası doğrudan kırmızı kart gören Çaykur Rizespor oyuncusu Valentin Mihăilă'ya PFDK 2 maç ceza verdi; oyuncu cezasının son maçını 20 Eylül'deki Göztepe deplasmanında oynamayarak tamamladı.",
    relatedTeamIds: ["s12", "s16"],
    relatedPlayerNames: ["Valentin Mihăilă"],
    source: "caytvhaber.com / olay53.com / 2mart.com.tr",
  },
  {
    id: "sl-story-14",
    date: "2026-09-13",
    week: 5,
    category: "basari",
    title: "Galatasaray, Osimhen ve Lemina'sız yeniden lider oldu",
    summary:
      "Sakatlıklar nedeniyle Osimhen ve Lemina'dan yoksun sahaya çıkan Galatasaray, Kocaelispor'u Abdülkerim Bardakcı'nın golüyle 1-0 mağlup ederek 13 puana yükseldi ve liderlik koltuğunu Beşiktaş'tan devraldı.",
    relatedTeamIds: ["s1", "s17"],
    relatedPlayerNames: ["Abdülkerim Bardakcı"],
    source: "Habertürk / Fanatik / beIN Sports",
  },
  {
    id: "sl-story-15",
    date: "2026-09-19",
    week: 6,
    category: "skandal",
    title: "Trabzonspor derbisinde kart krizi: Okan Buruk ve Ugochukwu kırmızı gördü",
    summary:
      "Trabzonspor'un Galatasaray'ı 4-0 mağlup ettiği 6. hafta derbisinde teknik direktör Okan Buruk 71. dakikada, Lesley Ugochukwu ise 87. dakikada VAR incelemesi sonrası kırmızı kart gördü. Kartları gösteren hakemin Batuhan Kolak olduğu netleşti; Buruk maç sonrası hakarette bulunmadığını savundu, Ugochukwu ise TFF disiplin talimatı gereği bir sonraki lig maçında forma giyemedi.",
    relatedTeamIds: ["s4", "s1"],
    relatedPlayerNames: ["Okan Buruk", "Lesley Ugochukwu"],
    source: "Fotomaç / Milliyet / Mynet / Habertürk",
  },
  {
    id: "sl-story-16",
    date: "2026-09-19",
    week: 6,
    category: "basari",
    title: "Mohamed Salah, Galatasaray derbisinde hat-trick yaptı",
    summary:
      "Papara Park'taki 6. hafta derbisinde Mohamed Salah 4., 44. ve 80. dakikalarda attığı gollerle hat-trick yaptı; Noah Saviolo'nun golüyle birlikte Trabzonspor, Galatasaray'ı 4-0 mağlup etti. Salah bu golle Süper Lig'deki ilk 6 haftasında toplam 7 gole ulaştı.",
    relatedTeamIds: ["s4", "s1"],
    relatedPlayerNames: ["Mohamed Salah", "Noah Saviolo"],
    source: "Fanatik / Cumhuriyet / Habertürk / Sabah / fotmob.com",
  },
  {
    id: "sl-story-17",
    date: "2026-09-20",
    week: 6,
    category: "rekor",
    title: "Fenerbahçe, Eyüpspor'u 8-0 mağlup ederek kulüp rekoru kırdı",
    summary:
      "6. hafta maçında Eyüpspor'u 8-0 mağlup eden Fenerbahçe, bu skorla kulüp tarihindeki en farklı Süper Lig galibiyetine imza attı (önceki en farklı sonuçlar 1994'teki iki 8-1 ve 1992'deki 8-4 idi). Takım ayrıca Avrupa'nın 10 büyük liginde bu sezon bir maçın ilk yarısında 5 gol atan ilk takım oldu; Vedat Muriqi'nin attığı 4 gol, 2024'te Cengiz Ünder'den bu yana bir Fenerbahçe oyuncusunun tek maçta attığı en fazla gol oldu.",
    relatedTeamIds: ["s2", "s16"],
    relatedPlayerNames: ["Vedat Muriqi"],
    source: "Hürriyet / NTVSpor / ajansspor.com / Fanatik",
  },
  {
    id: "sl-story-18",
    date: "2026-09-20",
    week: 6,
    category: "basarisizlik",
    title: "Eyüpspor'un kötü gidişatı: 6 haftada sadece 1 galibiyet",
    summary:
      "Fenerbahçe'ye 8-0 mağlup olan Eyüpspor, sezonun ilk 6 haftasında 1 galibiyet ve 5 mağlubiyet aldı; 2 gol atıp 16 gol yiyerek ligin en kötü averajına sahip takımı oldu.",
    relatedTeamIds: ["s16"],
    source: "TFF.org / Türkçe Vikipedi (2026-27 Süper Lig puan durumu) / Hürriyet",
  },
  {
    id: "sl-story-19",
    date: "2026-09-20",
    week: 6,
    category: "basarisizlik",
    title: "Samsunspor'da art arda 4. maçta da galibiyet yok",
    summary:
      "Erzurumspor FK'ye Miguel Cardoso'nun golüyle 1-0 mağlup olan Samsunspor, Thorsten Fink yönetiminde üst üste 4. maçında da kazanamayarak 4 puanda kaldı.",
    relatedTeamIds: ["s6", "s14"],
    relatedPlayerNames: ["Miguel Cardoso"],
    source: "Fanatik / AA / Hürriyet",
  },
  {
    id: "sl-story-20",
    date: "2026-09-20",
    week: 6,
    category: "tarihi-an",
    title: "Amed SFK, tarihinde ilk kez Süper Lig'de 6. haftayı lider tamamladı",
    summary:
      "Sahasında Beşiktaş'ı Gift Orban, Dia Saba ve Furkan Soyalp'in golleriyle 3-2 mağlup eden Amed Sportif Faaliyetler, 13 puana yükselerek milli maç arasına lider girdi. Kulüp, Süper Lig tarihinde ilk kez yükseldiği sezonda 6. haftayı lider tamamlayan ilk yeni takım oldu -- daha önce hiçbir yeni yükselen takım 6. haftaya kadar liderliğini korumamıştı.",
    relatedTeamIds: ["s11", "s3"],
    relatedPlayerNames: ["Gift Orban"],
    source: "Fanatik / Hürriyet / NTV / sporx.com",
  },
  {
    id: "sl-story-21",
    date: "2026-09-20",
    week: 6,
    category: "rekor",
    title: "Kocaelispor, 6 haftanın sonunda ligin en az gol yiyen takımı oldu",
    summary:
      "Gaziantep FK'yı Berkan Kutlu ve Dan Agyei'nin golleriyle 2-0 mağlup eden Kocaelispor, 6 haftada sadece 4 gol yiyerek Süper Lig'in en sağlam savunmasına sahip takımı oldu ve 12 puanla 4. sıraya yükseldi.",
    relatedTeamIds: ["s17", "s15"],
    relatedPlayerNames: ["Berkan Kutlu", "Dan Agyei"],
    source: "Habertürk / Fanatik / Sporx / TFF.org puan durumu",
  },
  {
    id: "sl-story-22",
    date: "2026-09-19",
    week: 6,
    category: "basari",
    title: "Mohamed Salah'ın imza töreninde söyledikleri, hat-trick'iyle sahada karşılığını buldu",
    summary:
      "6 Ağustos'ta Papara Park'ta yaklaşık 30 bin taraftarın meşalelerle karşıladığı imza töreninde Mohamed Salah, \"Burada olmaktan dolayı çok mutluyum\" demiş, kazanmak için geldiğini vurgulamıştı. Liverpool'da 9 sezon (257 gol, 442 maç) sonra performansının düşmesi ve teknik direktör Arne Slot ile yaşanan kamuya yansıyan anlaşmazlığın ardından ayrılan 34 yaşındaki yıldız, Süper Lig'deki ilk 6 haftasında attığı 7 golle -- 6. hafta Galatasaray derbisindeki hat-trick dahil -- bu sözlerinin karşılığını sahada verdi.",
    relatedTeamIds: ["s4"],
    relatedPlayerNames: ["Mohamed Salah"],
    source: "fanatik.com.tr / ASpor / Milliyet / Hürriyet / ESPN / Bleacher Report",
  },
  {
    id: "sl-story-23",
    date: "2026-08-31",
    week: 3,
    category: "basari",
    title: "Vlahović, Juventus'ta kadro dışı kaldığı sezonun ardından Beşiktaş'ta hat-trick'le geri döndü",
    summary:
      "Juventus'la 4,5 yıllık sürenin ardından bonservissiz ayrılan Dušan Vlahović, son sezonunda sözleşmesinin bitmesine yakın olduğu için kadro dışı bırakıldığını savunmuş, aşırı ücret talebiyle ilgili iddiaları reddetmişti. Beşiktaş imza töreninde \"Beşiktaş'ta olmaktan çok mutlu ve gururluyum\" diyen Sırp golcü, 31 Ağustos'ta ilk kez ilk 11'de başladığı Çorum FK maçında hat-trick yaparak (42', 59', 66') takımının 6-2 kazandığı maçta iddiasını sahada kanıtladı.",
    relatedTeamIds: ["s3", "s13"],
    relatedPlayerNames: ["Dušan Vlahović"],
    source: "Goal.com / Yardbarker / fanatik.com.tr / Hürriyet / sporx.com",
  },
  {
    id: "sl-story-24",
    date: "2026-09-13",
    week: 5,
    category: "basari",
    title: "Gift Orban, Lyon'daki düşüşün ardından Amed SFK'de \"yeniden doğdu\"",
    summary:
      "Gent'ten Ocak 2024'te 14 milyon euroya Lyon'a transfer olan, ardından Hoffenheim ve Verona'da etkisini kaybeden Nijeryalı forvet Gift Orban, Amed Sportif Faaliyetler'e 500 bin euroluk bedelle kiralandı (10 gole ulaşırsa 3 milyon euroluk zorunlu satın alma opsiyonu devreye giriyor). 13 Eylül'de İstanbul Başakşehir'i 5-0 mağlup ettikleri maçta hat-trick yapan (51', 55', 74') Orban, 6 gole ulaşarak Victor Osimhen'le birlikte Süper Lig gol krallığı zirvesine ortak oldu; Türk basınında \"Gift Orban Amed'le yeniden doğdu\" başlıklarıyla yer aldı.",
    relatedTeamIds: ["s11", "s5"],
    relatedPlayerNames: ["Gift Orban"],
    source: "sözcü.com.tr / milliyet.com.tr / cumhuriyet.com.tr / nefes.com.tr / gzt.com / sporx.com",
  },
  {
    id: "sl-story-25",
    date: "2026-09-19",
    week: 6,
    category: "basari",
    title: "Saviolo'nun sakatlık sonrası derbi golü: \"Bu stattaki ilk golüm\"",
    summary:
      "3. hafta Amed SFK maçında omuz sakatlığı geçiren Trabzonsporlu genç oyuncu Noah Saviolo, birkaç haftalık aradan sonra döndüğü 6. hafta Galatasaray derbisinde Mohamed Salah'ın asistiyle 39. dakikada gol attı. Maç sonrası \"Bu stattaki ilk golüm. İlk goller her zaman mutluluk vericidir\" diyen Saviolo, taraftarlara \"Trabzonspor için daha fazla gol atacağımın sözünü veriyorum\" mesajını verdi.",
    relatedTeamIds: ["s4", "s1"],
    relatedPlayerNames: ["Noah Saviolo", "Mohamed Salah"],
    source: "sporx.com / haberts.com / fotomac.com.tr",
  },
  {
    id: "sl-story-26",
    date: "2026-09-19",
    week: 6,
    category: "skandal",
    title: "Okan Buruk kırmızı kart sonrası hakemle diyaloğunu anlattı: \"Beni isteyerek attı\"",
    summary:
      "Trabzonspor derbisinde 71. dakikada kırmızı kart gören Okan Buruk, kart nedeniyle katılamadığı basın toplantısı yerine yayıncı kuruluşa özel açıklama yaptı: \"Benim hakeme hiçbir hakaretim yok. Hiçbir kötü söz söylemedim. Pozisyonu sordum. Sonra sarı kart verdi, neden sarı kart verdiğini sorarken yine kötü bir şey söylemedim, asla hakaret etmedim, kötü söz söylemedim. Beni isteyerek attı.\"",
    relatedTeamIds: ["s1", "s4"],
    relatedPlayerNames: ["Okan Buruk"],
    source: "fotomac.com.tr / ntvspor.net / mynet.com / yenisafak.com",
  },
  {
    id: "sl-story-27",
    date: "2026-09-20",
    week: 6,
    category: "basarisizlik",
    title: "Italiano'nun kusursuz savunma serisi Amed SFK deplasmanında sona erdi",
    summary:
      "9 resmi maçta 450 dakika gol yemeyen Beşiktaş, 6. haftada Amed SFK deplasmanında 3-2 mağlup oldu. Teknik direktör Vincenzo Italiano maç sonrası \"Bence maçı ilk yarıda kaybettik. Kötü başladık, ritimsiz başladık... İkinci yarı iyi oynadık ama iş işten geçmişti\" dedi; rakibi için ise \"Lige yeni çıkmış bir takım. Böyle bir başlangıç yapmaları muazzam\" yorumunu yaptı.",
    relatedTeamIds: ["s3", "s11"],
    relatedPlayerNames: ["Vincenzo Italiano"],
    source: "cnnturk.com / fanatik.com.tr / nethaber.com.tr / egelobisi.com / diyarbakir.net",
  },
  {
    id: "sl-story-28",
    date: "2026-09-20",
    week: 6,
    category: "basarisizlik",
    title: "Fink'ten Samsunspor'un 4. mağlubiyeti sonrası dürüst itiraf",
    summary:
      "Erzurumspor FK'ye 1-0 mağlup olup üst üste 4. maçında da kazanamayan Samsunspor'un teknik direktörü Thorsten Fink, basın toplantısında \"Ne yazık ki almış olduğumuz mağlubiyet sebebiyle bizim adımıza zor bir gün oldu. Peş peşe almış olduğumuz 4. mağlubiyet oldu\" dedi. Taraftarlara seslenen Fink, \"Birlikte kaybediyoruz, birlikte kazanıyoruz\" mesajıyla özür diledi.",
    relatedTeamIds: ["s6", "s14"],
    relatedPlayerNames: ["Thorsten Fink"],
    source: "fanatik.com.tr / gazetearena.com / gazetebirlik.com / gazetevatan.com / sporx.com",
  },
  {
    // NOT: "basari" kategorisi burada tam oturmuyor -- bu girdi tek bir maç
    // başarısından çok, oyuncunun çok kulüplü kariyer yolculuğunu anlatıyor;
    // mevcut 8 kategori arasında en yakın seçenek olduğu için kullanıldı.
    id: "sl-story-29",
    date: "2026-09-12",
    week: 5,
    category: "basari",
    title: "Bir zamanlar Roma formasıyla Şampiyonlar Ligi oynayan Cengiz Ünder, şimdi yeni yükselen Çorum FK'de",
    summary:
      "Altınordu ve İstanbul Başakşehir'in ardından Roma, Leicester City, Olympique Marseille ve Los Angeles FC formaları giyen, arada Fenerbahçe'ye dönüp bir sezon da Beşiktaş'a kiralık giden milli oyuncu Cengiz Ünder, bu sezon Süper Lig'e yeni yükselen Çorum FK'ye transfer oldu. 5. hafta Samsunspor deplasmanındaki 5-1'lik galibiyette iki gol katkısı veren Ünder, kariyerinin dolambaçlı yolculuğunun ardından kulübün lig tarihindeki ilk sezonuna önemli bir katkı sağladı.",
    relatedTeamIds: ["s13", "s6"],
    relatedPlayerNames: ["Cengiz Ünder"],
    source: "ensonhaber.com / mackolik.com / haberler.com / corumhaber.net / Fanatik / Habertürk",
  },
  {
    id: "sl-extra1-1",
    date: "2026-08-30",
    week: 3,
    category: "skandal",
    title: "Samsunspor-Fenerbahçe maçı sonrası PFDK'dan çapraz cezalar",
    summary:
      "Samsunspor Kulübü Başkanı Yüksel Yıldırım, Fenerbahçe taraftarlarına yönelik sportmenliğe aykırı hareketi nedeniyle PFDK'dan 100 bin TL para cezası aldı; Samsun'daki Güney Üst Tribün'ün 202, 203, 204 ve 205 numaralı blokları, o bloklardaki taraftarların çirkin/kötü tezahüratı gerekçesiyle bir sonraki iç saha lig maçı için e-bilet girişine bloke edildi. Aynı PFDK toplantısında Fenerbahçe'ye de kulüp olarak toplam 480 bin TL ceza kesildi: 200 bin TL deplasmanda sezon içinde ikinci kez tekrarlanan çirkin tezahürat, 280 bin TL ise kulüp temsilcisinin zorunlu stadyum incelemesine katılmaması nedeniyle.",
    relatedTeamIds: ["s6", "s2"],
    relatedPlayerNames: ["Yüksel Yıldırım"],
    source: "sabah.com.tr / gazetegercek.com.tr / samsunhaber.com / fotomac.com.tr",
  },
  {
    id: "sl-extra1-2",
    date: "2026-08-31",
    week: 3,
    category: "skandal",
    title: "Trabzonspor'a Amed SFK deplasmanındaki tezahürat ve saha olayları nedeniyle 480 bin TL ceza",
    summary:
      "Amed Sportif Faaliyetler deplasmanında oynanan 3. hafta maçının ardından PFDK, Trabzonspor'a taraftarların çirkin/kötü tezahüratını sezon içinde deplasmanda ikinci kez tekrarlaması nedeniyle 200 bin TL, sahaya yönelik olaylar nedeniyle de ayrıca 280 bin TL olmak üzere toplam 480 bin TL para cezası verdi; olayların yaşandığı deplasman tribün bölümündeki taraftarların e-biletleri, Trabzonspor'un bir sonraki deplasman maçı için bloke edildi.",
    relatedTeamIds: ["s4", "s11"],
    source: "fotomac.com.tr / haber61.net / haberanlik.com.tr / haber3.com",
  },
  {
    id: "sl-extra1-3",
    date: "2026-08-30",
    week: 3,
    category: "skandal",
    title: "Eyüpspor-Alanyaspor maçında hakeme tepkiden çifte PFDK cezası",
    summary:
      "PFDK'nın 3 Eylül 2026 tarihli, 5 sayılı toplantısında, 30 Ağustos'ta oynanan Eyüpspor-Corendon Alanyaspor maçında müsabaka hakemine yönelik sportmenliğe aykırı hareketleri nedeniyle Eyüpspor Teknik Direktörü Özhan Pulat ile Alanyaspor görevlisi Mevlüthan Çavuşoğlu'na, Futbol Disiplin Talimatı'nın 36 ve 35. maddeleri kapsamında birer resmi maçta soyunma odası ve yedek kulübesine girme yasağı ile 100'er bin TL para cezası verildi.",
    relatedTeamIds: ["s16", "s10"],
    relatedPlayerNames: ["Özhan Pulat", "Mevlüthan Çavuşoğlu"],
    source: "yenialanya.com / antalyakorfez.com / karsmanset.com",
  },
  {
    id: "sl-extra1-4",
    date: "2026-08-29",
    week: 3,
    category: "skandal",
    title: "Konyaspor'un Enis Bardhi itirazı Tahkim Kurulu'ndan döndü",
    summary:
      "Kocaelispor'a evinde 1-2 kaybedilen maçta rakip oyuncuya ciddi faul nedeniyle direkt kırmızı kart gören Konyasporlu Enis Bardhi'ye PFDK 2 maç men cezası verdi. Kulübün bu karara yaptığı itiraz Tahkim Kurulu tarafından reddedildi; Makedon oyuncu cezası nedeniyle Erzurumspor FK deplasmanı ile Trabzonspor'un konuk olduğu iç saha maçında forma giyemedi.",
    relatedTeamIds: ["s9", "s17"],
    relatedPlayerNames: ["Enis Bardhi"],
    source: "konyaninsesi.com.tr / haberdairesi.com / sabah.com.tr",
  },
  {
    id: "sl-extra1-5",
    date: "2026-09-05",
    week: 4,
    category: "skandal",
    title: "Kadıköy derbisi sonrası Fenerbahçe taraftarından teknik heyete tepki",
    summary:
      "Beşiktaş'a 1-2 kaybedilen 4. hafta derbisinde Fenerbahçe taraftarları, ilk yarıda sakatlanıp oyunda kalan İrfan Can Kahveci'yi topla buluştuğunda ıslıklayarak protesto etti. Maç sonrasında da stat çevresinde teknik direktör İsmail Kartal'ın görevden alınmasını isteyen öfkeli taraftar tepkileri ve sert eleştiriler yaşandı.",
    relatedTeamIds: ["s2", "s3"],
    relatedPlayerNames: ["İrfan Can Kahveci"],
    source: "aspor.com.tr / fanatik.com.tr / ensonhaber.com",
  },
  {
    id: "sl-extra1-6",
    date: "2026-09-19",
    week: 6,
    category: "skandal",
    title: "Trabzonspor-Galatasaray derbisinde Gazze mesajlı pankartlar ve Uğurcan Çakır göndermesi",
    summary:
      "6. hafta derbisinde Trabzonspor taraftarları tribünlerde \"Gazze'ye selam, boykota devam\" ve \"Teslim olmuyoruz, susmuyoruz, Filistin'i unutmuyoruz\" yazılı pankartlar açtı. Maçın 4-0 bitmesinin ardından kulübün resmi sosyal medya hesapları, eski kaptan ve rekor bedelle Galatasaray'a transfer olan Uğurcan Çakır'ın sahada yere düştüğü bir fotoğrafını paylaşarak taraftarların derbi galibiyetindeki hıncını yansıttı.",
    relatedTeamIds: ["s4", "s1"],
    relatedPlayerNames: ["Uğurcan Çakır"],
    source: "ahaber.com.tr / fanatik.com.tr / karadenizgazete.com.tr / mynet.com",
  },
  {
    id: "sl-extra1-7",
    date: "2026-09-20",
    week: 6,
    category: "basari",
    title: "Amed SFK'nın liderlik sevinci Diyarbakır sokaklarına taştı",
    summary:
      "Beşiktaş'ı 3-2 mağlup ederek milli maç arasına lider giren Amed Sportif Faaliyetler'in taraftarları, maç sonrası Diyarbakır sokaklarına dökülerek araç konvoyları oluşturdu, bayraklarla yürüyüş yaptı ve halaylar çekti; kutlamalar kentte düzenlenen havai fişek gösterileriyle sürdü.",
    relatedTeamIds: ["s11", "s3"],
    source: "dha.com.tr / gazeteipekyol.com / turkiyegazetesi.com.tr",
  },
  {
    id: "sl-extra2-1",
    date: "2026-08-14",
    week: 1,
    category: "surpriz",
    title: "Vlahović'in bonservissiz kalıp Beşiktaş'ı seçmesi ve hızlı patlaması",
    summary:
      "Juventus ile sözleşmesi 30 Haziran 2026'da sona eren Dušan Vlahović, İtalyan kulübünün yıllık 8 milyon euroluk yeni sözleşme teklifini reddetti; Barcelona, Atletico Madrid ve Arsenal'dan beklediği somut teklifler gelmeyince, ciddi tek teklif olan Beşiktaş'la yıllık 7,5 milyon euro garantili maaşla 3 yıllık sözleşmeye imza attı. Daha önce birlikte çalıştığı Vincenzo Italiano ile yeniden buluşan Vlahović, ilk 4 lig maçında (Çorum FK'ye 3, Fenerbahçe derbisinde 1, Amed SFK deplasmanında 1 gol) attığı 5 golle Süper Lig'de 2000-01'den bu yana ilk 3 maçında 4 gole ulaşan ilk yabancı oyuncu oldu.",
    relatedTeamIds: ["s3"],
    relatedPlayerNames: ["Dušan Vlahović", "Vincenzo Italiano"],
    source: "football-italia.net / Yahoo Sports / beIN Sports / sporx.com / fotomac.com.tr",
  },
  {
    id: "sl-extra2-2",
    date: "2026-08-06",
    week: 1,
    category: "surpriz",
    title: "Mohamed Salah'ın Süper Lig'e transferinde üç kulüplü yarış: Galatasaray'ın geç kalan hamlesi",
    summary:
      "Liverpool ile sözleşmesi karşılıklı feshedilen Mohamed Salah için önce Beşiktaş'ın anlaşmaya yakın olduğu konuşulurken, Galatasaray da menajeri Rami Abbas üzerinden son dakika bir hamle yaptı. Teknik direktör Okan Buruk ise Salah'ın adının kulüp içinde hiç konuşulmadığını ve oyuncunun Türkiye'yi tercih etmeyeceğini düşündüğünü açıkladı; süreç, Salah'ın her iki İstanbul kulübünü de değil Trabzonspor'u tercih edip imza atmasıyla sonuçlandı.",
    relatedTeamIds: ["s1", "s3", "s4"],
    relatedPlayerNames: ["Mohamed Salah", "Okan Buruk"],
    source: "fanatik.com.tr / kingfut.com / Al Jazeera / ESPN / Sky Sports",
  },
  {
    id: "sl-extra2-3",
    date: "2026-08-26",
    week: 2,
    category: "skandal",
    title: "Icardi-Galatasaray ayrılığının perde arkası: soyunma odası tepkisi ve boşta kalış",
    summary:
      "Galatasaray'ın maaşında indirim öngören 1+1 yıllık yeni sözleşme teklifini reddeden Mauro Icardi ile kulüp, sözleşmesinin bittiği 30 Haziran'ın ardından 15 Temmuz'da resmen yollarını ayırdı; gazeteci Mehmet Özcan bazı oyuncuların Trabzonspor mağlubiyeti sonrası 'Icardi'yle oynayınca kaybediyoruz' dediğini iddia etti ve taraftar arasında '#IcardiDefteriKapansın' etiketi gündem oldu. Ayrılıktan yaklaşık bir ay sonra dahi 33 yaşındaki golcüye Avrupa'nın büyük liglerinden somut bir teklif gelmemişti.",
    relatedTeamIds: ["s1"],
    relatedPlayerNames: ["Mauro Icardi"],
    source: "mynet.com / yeniasir.com.tr / sporx.com / milliyet.com.tr",
  },
  {
    id: "sl-extra2-4",
    date: "2026-09-20",
    week: 6,
    category: "surpriz",
    title: "Napoli'nin gözden çıkardığı Lukaku'nun Fenerbahçe'deki zorlu başlangıcı",
    summary:
      "2025-26 sezonunda sakatlıklar yüzünden sadece 7 maça çıkabilen Romelu Lukaku, yeni bir santrfor transfer eden Napoli tarafından Ağustos 2026'da 6 milyon euro (Süper Lig şampiyonluğu halinde 1 milyon euro ek bonusla) karşılığında Fenerbahçe'ye satıldı. Vedat Muriqi'nin gerisinde yedek kalan Lukaku, Eyüpspor'u 8-0 mağlup ettikleri maçta 69. dakikada oyuna girip kaleciyle karşı karşıya kaldığı bir pozisyonu değerlendiremeyince, 6 haftanın sonunda hâlâ gol bulamamış durumdaydı.",
    relatedTeamIds: ["s2", "t9"],
    relatedPlayerNames: ["Romelu Lukaku", "Vedat Muriqi"],
    source: "Yahoo Sports / ESPN / Goal.com / turkiyetoday.com / ajansspor.com",
  },
  {
    id: "sl-extra2-5",
    date: "2026-09-20",
    week: 6,
    category: "skandal",
    title: "Derbinin hakemi Batuhan Kolak'ın geçmişi ve eski hakemlerin derbi kararları eleştirisi",
    summary:
      "Trabzonspor-Galatasaray derbisinde Okan Buruk ve Ugochukwu'ya kırmızı kart gösteren Antalyalı hakem Batuhan Kolak, birkaç ay önce Gençlerbirliği-Galatasaray Türkiye Kupası çeyrek final maçında Galatasaray'ın golünü 'coğrafi ofsayt' gerekçesiyle iptal ettirerek de kamuoyunda geniş tartışma yaratmıştı. Derbi sonrası Trio programında görüş bildiren eski hakemler Aleks Taşçıoğlu, Bülent Yıldırım ve Seçim Demirel, Stefan Savić'in Leroy Sané'ye yaptığı müdahalede de ciddi faul kriterlerinin oluştuğunu ve bu pozisyonun sarı kartla geçiştirildiğini, buna karşın Ugochukwu'ya gösterilen kırmızı kartın doğru olduğunu belirtti.",
    relatedTeamIds: ["s4", "s1"],
    relatedPlayerNames: ["Batuhan Kolak", "Bülent Yıldırım", "Stefan Savić", "Leroy Sané"],
    source: "milliyet.com.tr / cumhuriyet.com.tr / ajansspor.com / mynet.com",
  },
  {
    id: "sl-extra2-6",
    date: "2026-09-12",
    week: 5,
    category: "skandal",
    title: "Mihăilă kırmızısının VAR detayı ve PFDK'nın üçlü cezası netleşti",
    summary:
      "Çaykur Rizespor'un Eyüpspor deplasmanından 1-0 galip ayrıldığı maçta hakem Oğuzhan Aksu, 42. dakikada Mihăilă'nın rakibi Raux Yao ile girdiği ikilide önce sarı kart göstermiş, VAR incelemesi sonrasında rakibinin ayağına bastığı gerekçesiyle kararını doğrudan kırmızı karta çevirmişti. PFDK, FDT'nin 43. maddesi uyarınca Mihăilă'ya 2 maç ceza verirken, hakeme yönelik spor ahlakına aykırı hareketi nedeniyle Rizespor'un yardımcı antrenörü Fevzi Korkmaz'a 1 maç men ve 100 bin TL, taraftarların 'çirkin ve kötü tezahüratı' nedeniyle de kulübe bir deplasman maçı için elektronik bilet engeli cezası verdi.",
    relatedTeamIds: ["s12", "s16"],
    relatedPlayerNames: ["Valentin Mihăilă", "Oğuzhan Aksu", "Fevzi Korkmaz"],
    source: "olay53.com / mynet.com / karsmanset.com / takvim.com.tr",
  },
];

// 2026-09-23 DOLDURMA TURU (UCL): dosya UEFA Şampiyonlar Ligi için ilk kez
// dolduruldu -- Lig Fazı 1. Hafta (8-10 Eylül 2026, oynanan TEK hafta, 18
// maçın tamamı), 17 girdi. Kaynak karması: (1) bu projenin zaten
// araştırılmış kendi veri dosyalarından madencilik -- src/data/news.js
// (news-ucl-1..43: İsmail Kartal'ın Roma maçı sonrası bir günlük istifa
// krizi, Mourinho'nun Real Madrid'deki ilk UCL maçına çıkardığı rekor
// eksik kadro, Arsenal'ın Saliba'sız Napoli deplasmanı, Galatasaray'ın
// Sporting CP maçındaki hakem tartışması), src/data/realResultsUcl2026.js
// (18 maçın TAMAMININ skorları), src/data/matchStatsUcl.js'nin başlığındaki
// çok turlu araştırmayla netleştirilmiş "ATLANDI" notları (Slavia Prag'da
// Konečný'nin kırmızı kartı -- önceki bir turda yanlışlıkla ona yazılan gol
// notunun da açıklığa kavuşturulduğu olay -- ve Dortmund-Villarreal
// maçındaki çifte kendi kale golü), src/data/topScorers.js'in başlığındaki
// doğrulama notları (Ferran Torres'in PSG'de gerçekten oynadığının 3
// bağımsız kaynaktan teyidi, Archie Brown'ın Fenerbahçe adına UCL'de gol
// atan ilk İngiliz oyuncu olması) ve src/data/teamDomesticForm.js (Bodø/
// Glimt'in Bayern'e 5-0 yenildiği sırada kendi liginde lider olduğu
// gerçeği). (2) Bu turda ayrıca hedefli YENİ WebSearch araştırması yapıldı:
// Sabah FK'nın (2017'de kurulmuş) ve Como 1907'nin (119 yıllık kulüp
// tarihinde ilk kez) lig fazı debütanı olduğunun doğrulanması (ESPN, Goal.
// com, Tempo.co, Sports Illustrated -- Como'nun RB Leipzig'i 4-1 mağlup
// etmesi ayrıca haftanın en dikkat çekici sürprizlerinden biri olarak
// tanımlandı), Viking FK'nın Şampiyonlar Ligi'ne 1992-93'ten (Barcelona
// karşısında) bu yana ilk kez katıldığının ve 34 yıl sonra ilk kez Norveç
// şampiyonu olduğunun doğrulanması (UEFA.com, Wikipedia), AEK Athens'ın lig
// fazına 2018-19'dan bu yana ilk kez döndüğünün doğrulanması (UEFA.com kulüp
// tarihi sayfası), Ermedin Demirović'in Viking karşısında attığı ilk yarı
// hat-trick'i ve Ferran Torres'in PSG'deki ilk maçında yaptığı hat-trick'in
// doğrulanması (UEFA.com, ESPN, Sofascore), Bayern Münih'in (Vincent Kompany
// yönetiminde) art arda 23. sezonda lig fazı/grup aşaması açılışını
// galibiyetle tamamladığının doğrulanması (Bundesliga.com) ve Galatasaray'ın
// Sporting CP maçı sonrası hakem Espen Eskås hakkında UEFA'ya RESMİ şikayet
// dilekçesi sunduğunun doğrulanması -- news.js'teki mevcut haber sadece
// Okan Buruk'un sözlü eleştirisini içeriyordu, bu tur somut şikayet
// dilekçesi detayını ekledi (fanatik.com.tr, sporx.com, OneFootball,
// turkish-football.com). Doğrulanamayan/çelişkili hiçbir ayrıntı
// eklenmedi -- ör. PSG 6-1 Slovan Bratislava ile Bayern 5-0 Bodø/Glimt
// maçlarının ikisi de +5 farkla bittiği için "1. haftanın en farklı skoru"
// gibi tekil bir rekor iddiası KASITLI olarak yazılmadı; bunun yerine
// Bayern'in daha kesin ve tekil biçimde doğrulanabilen "23. sezon" serisi
// rekor olarak kullanıldı.
export const SEASON_STORY_UCL = [
  {
    id: "ucl-story-1",
    date: "2026-09-10",
    week: 1,
    category: "tarihi-an",
    title: "Sabah FK'nın Şampiyonlar Ligi'ndeki tarihi ilk maçı",
    summary:
      "2017'de kurulan ve play-off turunu geçerek lig fazına ilk kez yükselen Azerbaycan temsilcisi Sabah FK, lig fazı açılışında Old Trafford'da Manchester United'a 4-0 mağlup olarak kulüp tarihinin ilk Şampiyonlar Ligi maçını oynadı. Golleri Matheus Cunha, Bruno Fernandes ve Benjamin Sesko kaydetti.",
    relatedTeamIds: ["t31", "t8"],
    source: "ESPN / Goal.com / Wikipedia (Sabah FK)",
  },
  {
    id: "ucl-story-2",
    date: "2026-09-10",
    week: 1,
    category: "tarihi-an",
    title: "Como 1907'nin 119 yıllık tarihindeki ilk Avrupa maçı",
    summary:
      "Bir önceki sezon Serie A'da 4. olarak kulüp tarihinde ilk kez bir Avrupa kupasına katılma hakkı kazanan Como 1907, lig fazı açılışında RB Leipzig'i 4-1 mağlup etti. Martin Baturina, 15. dakikada attığı golle Como'nun Şampiyonlar Ligi tarihindeki ilk golünü kaydetti.",
    relatedTeamIds: ["t34", "t15"],
    relatedPlayerNames: ["Martin Baturina"],
    source: "Tempo.co / VAVEL / Como 1907 resmi sitesi",
  },
  {
    id: "ucl-story-3",
    date: "2026-09-10",
    week: 1,
    category: "surpriz",
    title: "Yeni yükselen Como, RB Leipzig'i mağlup ederek 1. haftanın sürprizi oldu",
    summary:
      "Şampiyonlar Ligi'ne ilk kez katılan Como 1907, kurulu bir Bundesliga takımı olan RB Leipzig'i sahasında 4-1 mağlup ederek 1. haftanın en dikkat çekici sonuçlarından birine imza attı.",
    relatedTeamIds: ["t34", "t15"],
    source: "Sports Illustrated / Tempo.co",
  },
  {
    id: "ucl-story-4",
    date: "2026-09-09",
    week: 1,
    category: "tarihi-an",
    title: "Viking FK, 34 yıllık aradan sonra döndüğü Şampiyonlar Ligi'nde ilk kez sahne aldı",
    summary:
      "2025-26 sezonunda Bodø/Glimt'i 1 puan farkla geride bırakarak 34 yıl sonra ilk kez Norveç şampiyonu olan Viking FK, play-off turunu geçerek Şampiyonlar Ligi lig fazına ilk kez katıldı; kulübün bu kulvardaki son maçı 1992-93 sezonunda Barcelona karşısında oynanmıştı. Lig fazı açılışında VfB Stuttgart deplasmanına çıkan Viking, 3-1 mağlup oldu.",
    relatedTeamIds: ["t30", "t21"],
    source: "UEFA.com / Wikipedia (Viking FK in European football)",
  },
  {
    id: "ucl-story-5",
    date: "2026-09-09",
    week: 1,
    category: "basari",
    title: "Ermedin Demirović'ten Viking karşısında ilk yarı hat-trick'i",
    summary:
      "VfB Stuttgart'ın Şampiyonlar Ligi lig fazı debütanı Viking'i 3-1 mağlup ettiği maçta Ermedin Demirović, ilk yarı içinde attığı üç golle hat-trick yaptı.",
    relatedTeamIds: ["t21", "t30"],
    relatedPlayerNames: ["Ermedin Demirović"],
    source: "UEFA.com maç özeti",
  },
  {
    id: "ucl-story-6",
    date: "2026-09-09",
    week: 1,
    category: "basari",
    title: "Ferran Torres'ten PSG formasıyla ilk maçında hat-trick",
    summary:
      "Paris Saint-Germain'in Slovan Bratislava'yı 6-1 mağlup ettiği lig fazı açılışında Ferran Torres, 31., 47. ve 57. dakikalardaki gollerle kulüpteki ilk Şampiyonlar Ligi maçında hat-trick yaptı; Ousmane Dembélé de iki gol attı.",
    relatedTeamIds: ["t4", "t32"],
    relatedPlayerNames: ["Ferran Torres", "Ousmane Dembélé"],
    source: "ESPN / Sofascore / VAVEL",
  },
  {
    id: "ucl-story-7",
    date: "2026-09-10",
    week: 1,
    category: "rekor",
    title: "Vincent Kompany yönetimindeki Bayern, 23. kez lig fazı/grup aşaması açılışını galibiyetle tamamladı",
    summary:
      "Bayern Münih, Bodø/Glimt'i evinde 5-0 mağlup ederek kulübün art arda 23. sezonda Şampiyonlar Ligi'ndeki ilk maçını galibiyetle kapatma serisini sürdürdü. Golleri Jamal Musiala, Harry Kane, Alphonso Davies ve iki kez Michael Olise kaydetti.",
    relatedTeamIds: ["t3", "t36"],
    relatedPlayerNames: ["Jamal Musiala", "Harry Kane", "Michael Olise"],
    source: "Bundesliga.com / ESPN",
  },
  {
    id: "ucl-story-8",
    date: "2026-09-10",
    week: 1,
    category: "basarisizlik",
    title: "Kendi liginde lider olan Bodø/Glimt, Bayern deplasmanında 5-0 mağlup oldu",
    summary:
      "Şampiyonlar Ligi lig fazına ilk kez katılan Bodø/Glimt, Norveç Eliteserien'de 19 haftada 47 puanla lider durumdayken Bayern Münih deplasmanında 5-0 mağlup oldu; kaleci de devre arasında sakatlanarak oyunu bırakmak zorunda kaldı.",
    relatedTeamIds: ["t36", "t3"],
    source: "Bundesliga.com / Archysport / ESPN",
  },
  {
    id: "ucl-story-9",
    date: "2026-09-08",
    week: 1,
    category: "rekor",
    title: "Guirassy'nin çılgın gecesi: kendi takımına 2 gol + penaltı, sonra kendi kalesine gol",
    summary:
      "Borussia Dortmund'un Villarreal'i 3-2 mağlup ettiği açılış maçında Serhou Guirassy, 80. dakikada ve 85. dakikada penaltıdan olmak üzere iki gol attı; uzatmalarda (90+3') ise kendi kalesine gol göndererek aynı maçta hem kendi takımı hem rakibi adına gol kaydeden oyuncu oldu. Maçın ilk golü de Villarreal'den Renato Veiga'nın kendi kalesiyle gelmişti.",
    relatedTeamIds: ["t12", "t14"],
    relatedPlayerNames: ["Serhou Guirassy", "Renato Veiga"],
    source: "ESPN / Yahoo Sports / Bundesliga.com",
  },
  {
    id: "ucl-story-10",
    date: "2026-09-09",
    week: 1,
    category: "skandal",
    title: "Galatasaray, Sporting CP maçındaki hakem kararları için UEFA'ya resmi şikayette bulundu",
    summary:
      "Lizbon'da Sporting CP'ye 3-1 mağlup olan Galatasaray, Norveçli hakem Espen Eskås'ın yönetimine ilişkin resmi bir dosyayı UEFA'ya sundu; kulüp özellikle 22. dakikada Sergi Altimira'ya sarı kartla geçiştirilen ancak VAR incelemesinde hakemin sahaya çağrılmadığı pozisyonu ve 54. dakikada verilen penaltı kararını sorguladı. Teknik direktör Okan Buruk, hakemin sonucu doğrudan etkilediğini söyledi.",
    relatedTeamIds: ["t35", "t23"],
    relatedPlayerNames: ["Okan Buruk"],
    source: "fanatik.com.tr / sporx.com / OneFootball / turkish-football.com",
  },
  {
    id: "ucl-story-11",
    date: "2026-09-10",
    week: 1,
    category: "skandal",
    title: "Slavia Prag'da Konečný, sahaya girişinin birkaç dakika sonrasında kırmızı kart gördü",
    summary:
      "RC Lens'e 2-3 mağlup olunan maçta, 49. dakikada oyuna dahil olan Slavia Prag oyuncusu Mikuláš Konečný, kısa süre sonra Sima'ya yaptığı son adam müdahalesi nedeniyle VAR incelemesiyle doğrudan kırmızı kart gördü.",
    relatedTeamIds: ["t29", "t22"],
    relatedPlayerNames: ["Mikuláš Konečný"],
    source: "ESPN / fotmob.com",
  },
  {
    id: "ucl-story-12",
    date: "2026-09-10",
    week: 1,
    category: "tarihi-an",
    title: "Fenerbahçe, 18 yıl sonra döndüğü Şampiyonlar Ligi'nde ilk golünü buldu",
    summary:
      "18 yıl aradan sonra lig fazına yükselen Fenerbahçe'yi Roma karşısında 1-1'e taşıyan golü 48. dakikada Archie Brown kaydetti; Brown bu golle kulüp adına Şampiyonlar Ligi'nde gol atan ilk İngiliz oyuncu oldu.",
    relatedTeamIds: ["t25", "t13"],
    relatedPlayerNames: ["Archie Brown"],
    source: "ESPN / FOX Sports",
  },
  {
    id: "ucl-story-13",
    date: "2026-09-11",
    week: 1,
    category: "teknik-direktor",
    title: "Fenerbahçe'de İsmail Kartal'ın Roma maçı sonrası bir günlük istifa krizi",
    summary:
      "Roma ile Şampiyonlar Ligi'nde 1-1 berabere kalınan maçın ardından basın toplantısında istifa ettiğini açıklayan teknik direktör İsmail Kartal, kulüp yönetiminin ikna çabalarının ardından aynı gün görevine geri döndü.",
    relatedTeamIds: ["t25"],
    source: "Fotomaç / Cumhuriyet / Hürriyet",
  },
  {
    id: "ucl-story-14",
    date: "2026-09-08",
    week: 1,
    category: "tarihi-an",
    title: "AEK Athens, 8 yıl sonra döndüğü Şampiyonlar Ligi lig fazında galibiyetle başladı",
    summary:
      "Şampiyonlar Ligi'nin grup/lig fazına 2018-19 sezonundan bu yana ilk kez katılan AEK Athens, açılış maçında sahasında LASK'ı Razvan Marin'in yaklaşık 20 metreden kullandığı frikikle attığı tek golle 1-0 mağlup etti.",
    relatedTeamIds: ["t27", "t33"],
    relatedPlayerNames: ["Razvan Marin"],
    source: "UEFA.com (kulüp tarihi) / ESPN",
  },
  {
    id: "ucl-story-15",
    date: "2026-09-08",
    week: 1,
    category: "basari",
    title: "Enzo Maresca, Manchester City başındaki ilk Şampiyonlar Ligi galibiyetini aldı",
    summary:
      "Pep Guardiola'nın ayrılığının ardından City'nin başına geçen Enzo Maresca, Porto deplasmanında Erling Haaland'ın 47. ve 90+1. dakikalardaki golleriyle 2-0 kazanarak kulüpteki ilk Şampiyonlar Ligi galibiyetini aldı.",
    relatedTeamIds: ["t2", "t28"],
    relatedPlayerNames: ["Erling Haaland", "Enzo Maresca"],
    source: "Sky Sports / ESPN",
  },
  {
    id: "ucl-story-16",
    date: "2026-09-09",
    week: 1,
    category: "basari",
    title: "Arsenal, Saliba'sız çıktığı Napoli deplasmanından 3 puanla döndü",
    summary:
      "Savunmanın kilit ismi William Saliba'yı sırt sakatlığı nedeniyle kadroya alamayan Arsenal, Allegri yönetimindeki Napoli deplasmanında Martin Odegaard'ın 75. dakikadaki golüyle 1-0 kazandı.",
    relatedTeamIds: ["t11", "t9"],
    relatedPlayerNames: ["Martin Odegaard"],
    source: "ESPN / Al Jazeera",
  },
  {
    id: "ucl-story-17",
    date: "2026-09-08",
    week: 1,
    category: "sakatlik",
    title: "Mourinho'nun Real Madrid'deki ilk UCL maçına rekor sayıda eksikle çıkması",
    summary:
      "Real Madrid, Mourinho yönetimindeki Şampiyonlar Ligi açılış maçına Éder Militão, Raúl Asencio, Ferland Mendy ve Rodrygo'yu sakatlık; Eduardo Camavinga, Arda Güler ve Bernardo Silva'yı ise cezalı olarak kadro dışı bıraktı, kaleci Andriy Lunin de gripten dolayı forma giyemedi. Bu denli çok sayıda eksiğe rağmen Real Madrid, Inter'i Mbappé ve Valverde'nin golleriyle 2-1 mağlup etti.",
    relatedTeamIds: ["t1", "t6"],
    relatedPlayerNames: ["Kylian Mbappé", "Federico Valverde"],
    source: "AS / okdiario.com / Sports Mole / ESPN",
  },
  {
    id: "ucl-story-18",
    date: "2026-09-08",
    week: 1,
    category: "tarihi-an",
    title: "Mourinho'nun 13 yıl sonra Real Madrid'e dönüşünde \"daha olgun\" bir ton",
    summary:
      "2013'te ayrıldığı Real Madrid'e 13 yıl sonra dönen José Mourinho, kulübe dönüşünün ardından verdiği ilk röportajlarda \"Sadece şimdi değil, yıllardır kendimi daha sakin ve duygularıma daha hakim hissediyorum\" demiş, \"Daha olgun, daha az duygusal ve kendimi daha iyi kontrol edebilen biri haline geldim\" diye eklemişti. Bu söylemini rekor sayıda eksikle çıktığı 8 Eylül'deki Inter maçında sahaya da yansıtan Mourinho, takımını 2-1 galip getirdi.",
    relatedTeamIds: ["t1"],
    relatedPlayerNames: ["José Mourinho"],
    source: "zamin.uz / goal.com (Türkçe) / hurriyet.com.tr",
  },
  {
    id: "ucl-story-19",
    date: "2026-09-10",
    week: 1,
    category: "teknik-direktor",
    title: "İsmail Kartal'ın istifa konuşmasının tam metni: \"Bir daha asla dönmemek kaydıyla\"",
    summary:
      "Roma ile 1-1 berabere kalınan maçın ardından soru almadan basın toplantısını istifa açıklamasına ayıran İsmail Kartal şöyle demişti: \"3 aydır buradayım. Sezon başından bugüne kadar oyuncularımla yaptığım antrenmanlar, kamplar... Başkanımız, yöneticilerimiz bize her konuda yardımcı olmaya çalıştılar. Çok güzel günlerdi. Bu akşam itibarıyla ben oyuncularımı tebrik ediyorum, görevimden istifa ediyorum... Bir daha asla dönmemek kaydıyla görevimden istifa ediyorum.\" Kulüp yönetiminin ikna çabalarının ardından Kartal aynı gün görevine geri döndü.",
    relatedTeamIds: ["t25"],
    relatedPlayerNames: ["İsmail Kartal"],
    source: "NTVSpor / ASpor / Hürriyet / Fanatik / Sabah / Sporx / HaberGo",
  },
  {
    id: "ucl-story-20",
    date: "2026-09-10",
    week: 1,
    category: "tarihi-an",
    title: "Archie Brown, hem tarihi golünü hem hocasının istifa haberini aynı akşam yaşadı",
    summary:
      "Fenerbahçe'nin 18 yıl sonra döndüğü Şampiyonlar Ligi'ndeki ilk golünü atan Archie Brown, maçın ardından UEFA tarafından \"Maçın Adamı\" seçildi ve \"Bugün kazanmak istedik. Kazanabilirdik de. Bunun için biraz hayal kırıklığı yaşıyorum\" dedi. İlginç bir tesadüfle, İngiliz oyuncu maç sonu röportajı sırasında teknik direktör İsmail Kartal'ın istifa ettiğini öğrenerek şaşkınlığını gizleyemedi.",
    relatedTeamIds: ["t25", "t13"],
    relatedPlayerNames: ["Archie Brown"],
    source: "ajansspor.com / gzt.com / ASpor / Cumhuriyet / Sporx",
  },
  {
    id: "ucl-story-21",
    date: "2026-09-09",
    week: 1,
    category: "skandal",
    title: "Okan Buruk'tan VAR hakemine sert sözler: \"Ben olsam hakemlik hayatını bitiririm\"",
    summary:
      "Sporting CP'ye 3-1 mağlup olunan maçın ardından basın toplantısında konuşan Okan Buruk, pozisyonu VAR'a çağırmayan Alman VAR hakemi Christian Dingert'i hedef alarak \"Pozisyonu VAR'a çağırmayan Alman hakemin, ben olsam hakemlik hayatını bitiririm\" dedi ve \"Bugün futbolun dışından birçok şey oldu\" diyerek tepkisini sürdürdü. (VAR hakemi Dingert, mevcut ucl-story-10'da adı geçen ana hakem Espen Eskås'tan farklı bir görevlidir.)",
    relatedTeamIds: ["t35", "t23"],
    relatedPlayerNames: ["Okan Buruk"],
    source: "NTVSpor / Cumhuriyet / TGRT Haber / sondakika.com",
  },
  {
    id: "ucl-story-22",
    date: "2026-09-08",
    week: 1,
    category: "basari",
    title: "Mourinho'nun ilk UCL maçı sonrası felsefesi: \"Kötü oynayıp kazanmayı tercih ederim\"",
    summary:
      "Rekor sayıda eksikle çıktığı Inter maçını 2-1 kazanan Mourinho, maç sonrası İspanyol televizyonuna \"İyi oynayıp kaybetmektense kötü oynayıp kazanmayı tercih ederim\" dedi -- kariyeri boyunca sonuç odaklı futbol anlayışıyla özdeşleşen teknik direktörün Real Madrid'deki ikinci döneminin de aynı çizgide süreceğinin ilk işaretiydi.",
    relatedTeamIds: ["t1", "t6"],
    relatedPlayerNames: ["José Mourinho"],
    source: "ESPN / Al Jazeera",
  },
  {
    id: "ucl-story-23",
    date: "2026-09-08",
    week: 1,
    category: "basari",
    title: "Emery: Aston Villa'nın Club Brugge deplasmanındaki golcü sıkıntısını aştığı \"eksiksiz\" maç",
    summary:
      "Golcü sıkıntısıyla anılan Aston Villa, Club Brugge deplasmanında John McGinn, Emiliano Buendía ve Nicolas Jackson'ın golleriyle 3-2 kazandı. Teknik direktör Unai Emery maç sonrası \"Bugün bir adım daha attık, 90 dakika boyunca çok eksiksiz bir maç çıkardık\" dedi.",
    relatedTeamIds: ["t20", "t17"],
    relatedPlayerNames: ["Unai Emery"],
    source: "Sky Sports / ESPN",
  },
  {
    id: "ucl-story-24",
    date: "2026-09-09",
    week: 1,
    category: "basari",
    title: "Arteta, Saliba'sız Napoli deplasmanı sonrası: \"Bu takımdan gelen olağanüstü bir şey\"",
    summary:
      "William Saliba'sız çıktığı Napoli deplasmanında rakip kalede deplasmanda kulüp rekoru olan 26 şut çeken Arsenal, Martin Odegaard'ın 75. dakikadaki golüyle 1-0 kazandı. Maç sonrası basın toplantısının tam transkriptini yayımlayan Arsenal.com'a göre Mikel Arteta \"Bugün burada, bu rakibe karşı yaptığımız şey takımdan gelen olağanüstü bir şey\" dedi ve Odegaard'ın artık farklı bir seviyeye ulaştığını söyledi.",
    relatedTeamIds: ["t11", "t9"],
    relatedPlayerNames: ["Mikel Arteta", "Martin Odegaard"],
    source: "Arsenal.com (basın toplantısı transkripti) / Sky Sports / Malay Mail",
  },
  {
    id: "ucl-story-25",
    date: "2026-09-09",
    week: 1,
    category: "basarisizlik",
    title: "Allegri, Arsenal mağlubiyetinin ardından rakibinin kalitesini kabul etti",
    summary:
      "Napoli'nin evinde Arsenal'e 1-0 mağlup olduğu maçın ardından teknik direktör Massimiliano Allegri, Arsenal'ın kendilerini yenmek için \"olağanüstü bir kalite\" göstermek zorunda kaldığını söyledi ve Napoli'nin Avrupa'nın en güçlü takımlarından birine karşı iyi bir performans sergilediğini savundu.",
    relatedTeamIds: ["t9", "t11"],
    relatedPlayerNames: ["Massimiliano Allegri"],
    source: "Goal.com / Yahoo Sports / football-italia.net",
  },
  {
    // NOT: "tarihi-an" burada gevşek bir eşleşme -- bu bir kulüp/oyuncu için
    // GERÇEK bir "ilk" değil, kişisel bir kariyer kilometre taşı (100.
    // resmi maç); mevcut kategoriler arasında en yakın seçenek olarak
    // kullanıldı.
    id: "ucl-story-26",
    date: "2026-09-08",
    week: 1,
    category: "tarihi-an",
    title: "Guirassy'nin \"çılgın\" gecesi aslında Dortmund'daki 100. resmi maçıymış",
    summary:
      "Villarreal karşısında iki gol ve kendi kalesine bir gol birden kaydeden Serhou Guirassy'nin bu olayları yaşadığı maç, aynı zamanda oyuncunun Borussia Dortmund forması altındaki 100. resmi maçıydı. UEFA.com'a konuşan Guirassy, geceyi tek kelimeyle \"çılgın\" (crazy) olarak özetledi.",
    relatedTeamIds: ["t12", "t14"],
    relatedPlayerNames: ["Serhou Guirassy"],
    source: "fotmob.com / beIN Sports / UEFA.com",
  },
  {
    id: "ucl-story-27",
    date: "2026-09-10",
    week: 1,
    category: "tarihi-an",
    title: "Carrick'in yönettiği ilk Şampiyonlar Ligi maçı, United'ın Aralık 2023'ten beri ilk UCL maçıydı",
    summary:
      "Manchester United'ı Sabah FK karşısında 4-0'lık galibiyete taşıyan Michael Carrick için bu maç, Aralık 2023'ten bu yana kulübün ilk Şampiyonlar Ligi maçıydı. Maç sonrası Sabah'ın karşılarına çıkması çok zor bir rakip olduğunu ve kendilerini galibiyet için zorladığını belirten Carrick, performansın başından sonuna bireysel ve kolektif olarak iyi olduğunu söyledi.",
    relatedTeamIds: ["t8", "t31"],
    relatedPlayerNames: ["Michael Carrick"],
    source: "ESPN",
  },
  {
    id: "ucl-story-28",
    date: "2026-09-08",
    week: 1,
    category: "teknik-direktor",
    title: "Maresca'nın Guardiola'nın yerini alma baskısı: \"17 yılda sadece 3 teknik direktör\"",
    summary:
      "20 kupa kazanan Pep Guardiola'nın 10 yıllık döneminin ardından Manchester City'nin başına geçen Enzo Maresca, göreve geldiğinde düzenlediği ilk basın toplantısında kulübün 17 yılda sadece 3 teknik direktör değiştirdiğini hatırlatarak Roberto Mancini ve Guardiola'dan sonra yapılan işi sürdürebileceklerine güvendiğini söyledi. Porto deplasmanındaki lig fazı açılışını Erling Haaland'ın iki golüyle 2-0 kazanan Maresca, böylece City'deki ilk Şampiyonlar Ligi galibiyetini de aldı.",
    relatedTeamIds: ["t2", "t28"],
    relatedPlayerNames: ["Enzo Maresca"],
    source: "football360.com.au / mancity.com / Sky Sports",
  },
  {
    id: "ucl-extra1-1",
    date: "2026-09-08",
    week: 1,
    category: "skandal",
    title: "Bernabéu'da kendi taraftarından Real Madrid'e ıslık",
    summary:
      "Lig fazı açılışında Inter'i 2-1 mağlup eden Real Madrid, kendi seyircisinin doksan dakika boyunca ıslık ve yuhalamalarıyla karşılaştı. Formundan memnun olunmayan Vinicius Junior, 87. dakikada oyundan alınırken Bernabéu'dan yoğun ıslık sesi yükseldi; teknik direktör Mourinho maç sonrası oyuncunun formsuz olduğunu ancak defansif olarak mücadele ettiğini söyleyerek onu savundu.",
    relatedTeamIds: ["t1"],
    relatedPlayerNames: ["Vinicius Junior"],
    source: "Yahoo Sports / Goal.com",
  },
  {
    id: "ucl-extra1-2",
    date: "2026-09-10",
    week: 1,
    category: "basari",
    title: "Fenerbahçe'nin Roma maçındaki koreografisi İtalyan basınında geniş yankı buldu",
    summary:
      "Fenerbahçe'nin Roma ile 1-1 berabere kaldığı lig fazı açılış maçında Chobani Stadı'nı dolduran taraftarların maç öncesi sergilediği koreografi İtalyan basınının dikkatini çekti; Corriere dello Sport ve La Gazzetta dello Sport gibi yayın organları haberi \"Fenerbahçe, Roma'yı korkutmaya çalışıyor\" başlığıyla geçti. Deplasmana gelen yaklaşık 400 Roma taraftarı ayrı bir tribün bölümünde yer aldı.",
    relatedTeamIds: ["t25", "t13"],
    source: "star.com.tr / hurriyet.com.tr",
  },
  {
    id: "ucl-extra1-3",
    date: "2026-09-10",
    week: 1,
    category: "basari",
    title: "Como başkanından tarihi maç için taraftarlara VIP koltuk jesti",
    summary:
      "Kulüp tarihindeki ilk Şampiyonlar Ligi maçı öncesinde Como 1907 Başkanı Mirwan Suwarso, kendisine ve yönetim kurulu üyelerine ayrılan VIP koltukları kulübün en eski/uzun süredir taraftarı olan seyircilere bıraktığını açıkladı. Como bu maçta RB Leipzig'i 4-1 mağlup ederek tarihi debütünü galibiyetle taçlandırdı.",
    relatedTeamIds: ["t34", "t15"],
    source: "Goal.com",
  },
  {
    id: "ucl-extra2-1",
    date: "2026-08-15",
    week: 1,
    category: "surpriz",
    title: "Ferran Torres'in serbest kalma maddesiyle Barcelona'dan PSG'ye gitmesi",
    summary:
      "Sözleşmesindeki bir maddeden yararlanarak Barcelona ile yeni sözleşme imzalamayı reddeden Ferran Torres, kulübün yerine Karim Adeyemi'yi transfer etmeyi planlamasının ardından 2031'e kadar geçerli bir sözleşmeyle yaklaşık 50 milyon euro karşılığında Paris Saint-Germain'e transfer oldu. Barcelona formasıyla 207 maçta 65 gol atmış olan İspanyol oyuncu, eski İspanya milli takımı teknik direktörü Luis Enrique ile yeniden bir araya geldiği PSG'deki ilk Şampiyonlar Ligi maçında hat-trick yaparak transferin daha ilk haftadan karşılığını verdiğini gösterdi.",
    relatedTeamIds: ["t7", "t4"],
    relatedPlayerNames: ["Ferran Torres"],
    source: "Al Jazeera / psg.fr / barcablaugranes.com / Yahoo Sports",
  },
  {
    id: "ucl-extra2-2",
    date: "2026-09-10",
    week: 1,
    category: "skandal",
    title: "Galatasaray'ın UEFA şikayetinin ayrıntıları: Eskås'ın iki kritik kararı",
    summary:
      "Galatasaray'ın UEFA Disiplin ve Etik Kurulu'na sunduğu resmi şikayet dilekçesinde iki pozisyon öne çıktı: 22. dakikada Sporting oyuncusu Sergi Altimira'nın Galatasaray'dan Batrakov'a yaptığı sert müdahalede VAR, hakem Espen Eskås'ı sahaya çağırmadan sarı kart kararını onayladı; 54. dakikada ise Galatasaray'ın sol beki İsmail Jakobs'un ceza sahası içinde Luis Suarez'i düşürmesiyle verilen penaltıyı VAR incelemesi de bozmadı ve Suarez golünü kaydetti. 2023 U17 Dünya Kupası finalini yöneten ve 2024 Avrupa Şampiyonası'nda dördüncü hakemlik yapan UEFA elit kategorisindeki Norveçli Eskås hakkında Galatasaray'ın dilekçesi, hakemin bu seviyedeki atamalara uygunluğunun sorgulanmasını da talep etti.",
    relatedTeamIds: ["t35", "t23"],
    relatedPlayerNames: ["Espen Eskås", "Okan Buruk", "İsmail Jakobs"],
    source: "hurriyet.com.tr / takvim.com.tr / sporx.com / mynet.com / habergo.com.tr",
  },
  {
    id: "ucl-extra2-3",
    date: "2026-09-10",
    week: 1,
    category: "rekor",
    title: "Konečný, Şampiyonlar Ligi'nde bir debütantın gördüğü en hızlı kırmızı kart rekorunu kırdı",
    summary:
      "Slavia Prag'ın RC Lens'e 2-3 kaybettiği maçta 49. dakikada oyuna giren Mikuláš Konečný, sadece 4 dakika sonra Abdallah Sima'yı net gol pozisyonunda düşürdüğü için hakem Vasilios Fotias tarafından VAR incelemesiyle kırmızı kart gördü ve Şampiyonlar Ligi tarihinde ilk maçında en hızlı kırmızı kart gören oyuncu oldu. Eski Slavia oyuncusu Rudolf Skácel yayında kararın sarı kart olması gerektiğini savunurken, Fransız basınından Guillaume Narguet ise hakemin VAR'a gittikten sonra baskı altında kırmızı karta yöneldiğini söyledi.",
    relatedTeamIds: ["t29", "t22"],
    relatedPlayerNames: ["Mikuláš Konečný", "Vasilios Fotias", "Rudolf Skácel"],
    source: "Newsy Today / Memesita / Nova Sport (Skácel yorumu) / footballwood.com",
  },
];

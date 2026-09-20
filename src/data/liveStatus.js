// Gerçek dünyadaki (kurgusal olmayan) güncel durum -- Ağustos/Eylül 2026'da
// web araştırmasıyla toplanmış ve 8 Eylül 2026'da tazelenmiştir. Bu dosya
// SİMÜLASYON motorlarının kullandığı
// veriden tamamen ayrıdır; sadece "Canlı Skorlar" sayfasında gösterilir.
//
// NOT: Bu bir canlı/otomatik güncellenen veri kaynağı DEĞİLDİR (statik site,
// arka uç yok) -- araştırıldığı ana ait bir "anlık görüntü"dür. Tarihler ve
// skorlar ileride manuel olarak tazelenmelidir.

export const SUPER_LIG_LIVE_ASOF = "20 Eylül 2026 (6. Hafta TAMAMLANDI: 9/9 maç oynandı)";

// Türkçe Vikipedi'nin "2026-27 Süper Lig" maddesinin ham wikitext'i (maç
// sonuçları) + "Şablon:2026-27 Süper Lig puan durumu" (güncel puan durumu
// tablosu) ile çapraz doğrulanmıştır (1+2+3. Hafta'nın TAMAMI, 27 maç).
// 4. Hafta'nın TAMAMI (9 maç, 4-7 Eylül 2026'ya yayılan) artık doğrulandı:
// ilk 3 maç (Başakşehir 2-3 Galatasaray, Fenerbahçe 1-2 Beşiktaş,
// Erzurumspor FK 1-0 Konyaspor, 4-5 Eylül) önceki tazelemede eklenmişti.
// 8 Eylül 2026'da yapılan bu tazelemede KALAN 6 maç bağımsız haber
// kaynaklarıyla (Hürriyet, Habertürk, Fanatik, beIN Sports, AA, Star, GZT,
// Sporx, CNN Türk, Mersin Haber, Türkiye Ajansı -- her maç için en az 2
// bağımsız kaynak aynı skoru teyit ediyor) doğrulanarak eklendi: Kasımpaşa
// 2-2 Amed SFK, Çorum FK 3-0 Eyüpspor, Kocaelispor 1-0 Samsunspor (üçü de
// 6 Eylül), Trabzonspor 5-0 Gençlerbirliği (6 Eylül -- beIN Sports VE CNN
// Türk ikisi de "5-0" diye teyit etti; önceki taramada bir kaynağın bu maç
// için döndürdüğü tutarsız skor bu kez ELENDİ), Göztepe 2-4 Gaziantep FK ve
// Çaykur Rizespor 0-1 Alanyaspor (ikisi de 7 Eylül). Bu 6 maçtan HESAPLANAN
// puan durumu, fotomac.com.tr'nin 7 Eylül 2026 "4. hafta tamamlandı" puan
// durumu haberinde listelenen 18 takımın TAMAMININ puanlarıyla BİREBİR
// örtüşüyor (bağımsız bir çapraz doğrulama).
//
// 16 Eylül 2026'da yapılan bu tazelemede 5. Hafta'nın TAMAMI (9 maç, 11-14
// Eylül 2026'ya yayılan) eklendi: Beşiktaş 3-0 Erzurumspor FK (11 Eylül);
// Eyüpspor 0-2 Çaykur Rizespor, Samsunspor 1-5 Çorum FK, Alanyaspor 2-2
// Göztepe, Konyaspor 1-0 Trabzonspor (dördü de 12 Eylül); Gençlerbirliği
// 1-2 Kasımpaşa, Amed SFK 5-0 İstanbul Başakşehir, Galatasaray 1-0
// Kocaelispor (üçü de 13 Eylül); Gaziantep FK 0-0 Fenerbahçe (14 Eylül).
// Her maç için en az 2 bağımsız kaynak aynı skoru teyit etti: Hürriyet +
// Habertürk + DHA + fotomac.com.tr + takvim.com.tr (Samsunspor 1-5 Çorum
// FK); Hürriyet + CNN Türk + Fanatik + beIN Sports (Konyaspor 1-0
// Trabzonspor); ayrıca star.com.tr'nin "5. hafta sona erdi" haberi ile
// sporx.com'un "5. hafta sonrası puan durumu" haberi 9 maçın TAMAMINI ve
// güncel puan durumunu bağımsız olarak birebir aynı şekilde listeliyor
// (ikisi arasında hiçbir tutarsızlık yok). Bu 9 maçtan HESAPLANAN puan
// durumu (aşağıdaki SUPER_LIG_LIVE_STANDINGS), sporx.com'un yayınladığı
// 18 takımın TAMAMININ O/G/B/M/averaj/puan değerleriyle BİREBİR örtüşüyor
// -- yani hem maç sonuçlarından hesaplama hem de üçüncü bir kaynaktaki
// hazır tablo aynı sonuca varıyor (çift yönlü çapraz doğrulama).
//
// 19 Eylül 2026'da yapılan İLK tazelemede 6. Hafta'nın (18-20 Eylül 2026)
// SADECE tamamlanan ilk maçı eklenmişti: Kasımpaşa 0-0 Konyaspor (18 Eylül,
// Recep Tayyip Erdoğan Stadı). Aynı gün yapılan İKİNCİ bir tazelemede 19
// Eylül'de oynanan KALAN 4 maç da doğrulanarak eklendi: Çorum FK 1-2
// Alanyaspor (Habertürk, Hürriyet, Fanatik, Star, Takvim, Fotospor,
// Sporkolik, TRT Haber, Herkesduysun -- hepsi 1-2 diye teyit etti),
// Kocaelispor 2-0 Gaziantep FK (Habertürk, Hürriyet, Fanatik, Star,
// Türkiye Ajansı, Sporx, Nokta Gazetesi, Medyagazete -- hepsi 2-0),
// Trabzonspor 4-0 Galatasaray (Hürriyet, Habertürk, Fanatik, Takvim,
// Mynet, Sözcü/Ekşi Sözlük canlı anlatımları, Flashscore -- Salah'ın
// hat-trick + asistiyle 4-0; bir galeri makalesinin tablo özetindeki
// çelişkili "3-0" ifadesi, aynı kaynağın kendi maç haberi başlığındaki ve
// diğer TÜM bağımsız kaynaklardaki "4-0" ile karşılaştırılıp ELENDİ) ve
// İstanbul Başakşehir 4-0 Gençlerbirliği (Ajansspor, Habertürk, Hürriyet,
// Star, Karsmanset, Mersin Haber, Sporx, Türkiye Ajansı, Herkesduysun --
// hepsi 4-0). 6. Hafta'nın geri kalan 4 maçı (Fenerbahçe-Eyüpspor,
// Erzurumspor FK-Samsunspor, Amed SFK-Beşiktaş, Göztepe-Çaykur Rizespor)
// 20 Eylül 2026'ya programlı olup bu tazeleme anında (19 Eylül) HENÜZ
// OYNANMAMIŞTI, bu yüzden eklenmedi. Yeni eklenen 4 maçtan HESAPLANAN puan
// durumu, milliyet.com'un ve politikam.com'un 19 Eylül 2026 "güncel puan
// durumu" haberlerinde listelenen puan sıralamasıyla (averaj/gol farkına
// göre sıralama dahil) BİREBİR örtüşüyor -- iki kaynak arasındaki tek
// farklılık (Trabzonspor'un Amed SFK'ye göre sırası) doğru skorla (4-0)
// hesaplanan gol farkı (+8 vs +7) kullanılarak milliyet.com'un sırasıyla
// çözüldü. Ayrıca bir Instagram gönderisinde rastlanan "Kocaelispor 3-0
// Gaziantep FK" iddiası çapraz doğrulamada bu sezonun 6. Haftası'na değil,
// 15 Şubat 2026 tarihli 22. Hafta maçına ait olduğu tespit edilip ELENDİ
// (fabrikasyon/karışıklık önlendi). teamName burada superLigTeams.js'teki
// `name` alanıyla eşleşecek şekilde yazılmıştır.
//
// 20 Eylül 2026'da yapılan tazelemede 6. Hafta'nın KALAN 4 maçı (20 Eylül
// 2026'da oynanan) doğrulanarak eklendi ve 6. Hafta TAMAMLANDI (9/9):
// Fenerbahçe 8-0 Eyüpspor (Fenerbahçe'nin lig tarihindeki en farklı
// galibiyeti; Vedat Muriqi 4 gol [7',21',47',55'], Mason Greenwood 2 gol
// [4'/5' penaltı, 80'], Matteo/Mattéo Guendouzi 1 [38'], İrfan Can Kahveci 1
// [45+1'] -- Habertürk VE Hürriyet'in dakika dakika maç anlatımları birebir
// aynı skoru ve gol dakikalarını doğruladı, ayrıca ajansspor, fanatik, beIN
// Sports, fener.org ve ESPN de 8-0 skorunu teyit etti), Erzurumspor FK 1-0
// Samsunspor (tek gol 45' Miguel Cardoso -- Fanatik, Habertürk, ASpor, AA,
// Hürriyet, Takvim, Türkiye Ajansı, Sporkolik hepsi 1-0 diye teyit etti),
// Amed SFK 3-2 Beşiktaş (Amed'in golleri 13' Gift Orban, 22' Dia Saba, 59'
// Furkan Soyalp; Beşiktaş'ın golleri 55' Dušan Vlahović ve 90+8' penaltıdan
// Orkun Kökçü -- gzt.com, Habertürk, Fanatik, Cumhuriyet, Hürriyet hepsi
// aynı skoru ve gol sırasını doğruladı; bu galibiyetle Amed SFK puan
// averajıyla ligin milli araya lider girdi) ve Göztepe 2-2 Çaykur Rizespor
// (Göztepe'nin golleri 3' Arda Okan Kurtalan/Kurtulan ve 90+4' penaltıdan
// Efkan Bekiroğlu; Rizespor'un golleri 70' İbrahim Olawoyin ve 80' Iustin
// Doicaru -- ajansspor, fotomac.com.tr, fotospor.com.tr, karsmanset.com,
// takvim.com.tr, NTVSpor, Sabah hepsi 2-2 diye teyit etti). Bu 4 yeni maçtan
// HESAPLANAN tam 18 takımlık puan durumu iç tutarlılık için çapraz kontrol
// edildi (toplam galibiyet=toplam mağlubiyet=43, toplam averaj/gol
// sütunları birbirine eşit=161, toplam puan=151 -- 54 maçlık bir sezonun bu
// aşamasında matematiksel olarak beklenen değerler).
export const SUPER_LIG_LIVE_STANDINGS = [
  { rank: 1, teamName: "Amed SFK", played: 6, w: 4, d: 1, l: 1, gf: 15, ga: 7, pts: 13 },
  { rank: 2, teamName: "Galatasaray", played: 6, w: 4, d: 1, l: 1, gf: 13, ga: 10, pts: 13 },
  { rank: 3, teamName: "Beşiktaş", played: 6, w: 4, d: 0, l: 2, gf: 14, ga: 7, pts: 12 },
  { rank: 4, teamName: "Kocaelispor", played: 6, w: 4, d: 0, l: 2, gf: 7, ga: 4, pts: 12 },
  { rank: 5, teamName: "Alanyaspor", played: 6, w: 3, d: 2, l: 1, gf: 8, ga: 6, pts: 11 },
  { rank: 6, teamName: "Fenerbahçe", played: 6, w: 3, d: 1, l: 2, gf: 16, ga: 6, pts: 10 },
  { rank: 7, teamName: "Trabzonspor", played: 6, w: 3, d: 1, l: 2, gf: 13, ga: 5, pts: 10 },
  { rank: 8, teamName: "Kasımpaşa", played: 6, w: 2, d: 4, l: 0, gf: 7, ga: 5, pts: 10 },
  { rank: 9, teamName: "Çaykur Rizespor", played: 6, w: 3, d: 1, l: 2, gf: 7, ga: 6, pts: 10 },
  { rank: 10, teamName: "Gaziantep FK", played: 6, w: 2, d: 2, l: 2, gf: 7, ga: 7, pts: 8 },
  { rank: 11, teamName: "Çorum FK", played: 6, w: 2, d: 1, l: 3, gf: 13, ga: 12, pts: 7 },
  { rank: 12, teamName: "İstanbul Başakşehir", played: 6, w: 2, d: 1, l: 3, gf: 10, ga: 11, pts: 7 },
  { rank: 13, teamName: "Gençlerbirliği", played: 6, w: 2, d: 1, l: 3, gf: 5, ga: 13, pts: 7 },
  { rank: 14, teamName: "Erzurumspor FK", played: 6, w: 2, d: 1, l: 3, gf: 3, ga: 11, pts: 7 },
  { rank: 15, teamName: "Konyaspor", played: 6, w: 1, d: 1, l: 4, gf: 4, ga: 8, pts: 4 },
  { rank: 16, teamName: "Samsunspor", played: 6, w: 1, d: 1, l: 4, gf: 6, ga: 12, pts: 4 },
  { rank: 17, teamName: "Göztepe", played: 6, w: 0, d: 3, l: 3, gf: 11, ga: 15, pts: 3 },
  { rank: 18, teamName: "Eyüpspor", played: 6, w: 1, d: 0, l: 5, gf: 2, ga: 16, pts: 3 },
];

// 1., 2. ve 3. Hafta'nın TAMAMI (27 maç) — Türkçe Vikipedi'nin ham
// wikitext'i esas alınmıştır; 3. Hafta'nın maç günleri sabah.com.tr'nin
// 3. hafta program haberiyle (28-31 Ağustos 2026) doğrulanmıştır. 4.
// Hafta'nın TAMAMI (9 maç, 4-7 Eylül 2026) artık eklendi: ilk 3'ü
// (Başakşehir 2-3 Galatasaray 4 Eylül; Erzurumspor FK 1-0 Konyaspor ve
// Fenerbahçe 1-2 Beşiktaş, ikisi de 5 Eylül) önceki tazelemede bağımsız
// kaynaklarla doğrulanmıştı. 8 Eylül 2026 tazelemesinde KALAN 6 maç
// eklendi -- her biri en az 2 bağımsız haber kaynağıyla (Hürriyet,
// Habertürk, Fanatik, beIN Sports, AA, Star, GZT, Sporx, CNN Türk, Mersin
// Haber, Türkiye Ajansı) teyit edildi: Kasımpaşa 2-2 Amed SFK, Çorum FK 3-0
// Eyüpspor, Kocaelispor 1-0 Samsunspor (üçü de 6 Eylül); Trabzonspor 5-0
// Gençlerbirliği (6 Eylül -- beIN Sports ve CNN Türk ikisi de "5-0" olarak
// teyit etti); Göztepe 2-4 Gaziantep FK ve Çaykur Rizespor 0-1 Alanyaspor
// (ikisi de 7 Eylül). Bu 6 maçtan hesaplanan puan durumu değişimi,
// fotomac.com.tr'nin 7 Eylül 2026 "4. hafta tamamlandı" haberindeki 18
// takımın TAMAMININ puanlarıyla birebir örtüşüyor.
//
// 16 Eylül 2026 tazelemesinde 5. Hafta'nın TAMAMI (9 maç, 11-14 Eylül 2026)
// eklendi -- kaynaklar ve doğrulama yöntemi için dosyanın en üstündeki
// açıklamaya bakınız.
//
// 19 Eylül 2026 tazelemesinde 6. Hafta'dan 5 maç eklendi: Kasımpaşa 0-0
// Konyaspor (18 Eylül) ve 19 Eylül'de oynanan Çorum FK 1-2 Alanyaspor,
// Kocaelispor 2-0 Gaziantep FK, Trabzonspor 4-0 Galatasaray ve İstanbul
// Başakşehir 4-0 Gençlerbirliği. Kaynaklar ve elenen (henüz oynanmamış/
// doğrulanamamış) maçlar için SUPER_LIG_LIVE_STANDINGS üzerindeki
// açıklamaya bakınız.
//
// 20 Eylül 2026 tazelemesinde 6. Hafta'nın KALAN 4 maçı (20 Eylül'de
// oynanan) eklendi ve 6. Hafta TAMAMLANDI: Fenerbahçe 8-0 Eyüpspor,
// Erzurumspor FK 1-0 Samsunspor, Amed SFK 3-2 Beşiktaş, Göztepe 2-2 Çaykur
// Rizespor. Kaynaklar için SUPER_LIG_LIVE_STANDINGS üzerindeki açıklamaya
// bakınız. Süper Lig 7. Hafta ile UEFA Şampiyonlar Ligi Lig Fazı 2. Hafta
// (13-14 Ekim 2026'ya programlı) bu tazeleme anında (20 Eylül) HENÜZ
// BAŞLAMAMIŞTI.
export const SUPER_LIG_LIVE_RESULTS = [
  { label: "1. Hafta", date: "14 Ağu", home: "Galatasaray", homeGoals: 2, away: "Çorum FK", awayGoals: 2 },
  { label: "1. Hafta", date: "15 Ağu", home: "Gençlerbirliği", homeGoals: 2, away: "Fenerbahçe", awayGoals: 1 },
  { label: "1. Hafta", date: "15 Ağu", home: "Kasımpaşa", homeGoals: 1, away: "Trabzonspor", awayGoals: 1 },
  { label: "1. Hafta", date: "15 Ağu", home: "Konyaspor", homeGoals: 0, away: "Çaykur Rizespor", awayGoals: 1 },
  { label: "1. Hafta", date: "15 Ağu", home: "Gaziantep FK", homeGoals: 1, away: "Alanyaspor", awayGoals: 1 },
  { label: "1. Hafta", date: "16 Ağu", home: "Beşiktaş", homeGoals: 1, away: "Eyüpspor", awayGoals: 0 },
  { label: "1. Hafta", date: "16 Ağu", home: "Amed SFK", homeGoals: 3, away: "Erzurumspor FK", awayGoals: 0 },
  { label: "1. Hafta", date: "16 Ağu", home: "İstanbul Başakşehir", homeGoals: 2, away: "Kocaelispor", awayGoals: 0 },
  { label: "1. Hafta", date: "17 Ağu", home: "Samsunspor", homeGoals: 3, away: "Göztepe", awayGoals: 3 },
  { label: "2. Hafta", date: "21 Ağu", home: "Erzurumspor FK", homeGoals: 0, away: "Galatasaray", awayGoals: 4 },
  { label: "2. Hafta", date: "22 Ağu", home: "Fenerbahçe", homeGoals: 4, away: "Konyaspor", awayGoals: 2 },
  { label: "2. Hafta", date: "22 Ağu", home: "Çaykur Rizespor", homeGoals: 0, away: "Samsunspor", awayGoals: 2 },
  { label: "2. Hafta", date: "22 Ağu", home: "Çorum FK", homeGoals: 0, away: "Kasımpaşa", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Eyüpspor", homeGoals: 0, away: "Gaziantep FK", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Trabzonspor", homeGoals: 2, away: "İstanbul Başakşehir", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Göztepe", homeGoals: 0, away: "Gençlerbirliği", awayGoals: 1 },
  { label: "2. Hafta", date: "23 Ağu", home: "Alanyaspor", homeGoals: 1, away: "Beşiktaş", awayGoals: 0 },
  { label: "2. Hafta", date: "24 Ağu", home: "Kocaelispor", homeGoals: 2, away: "Amed SFK", awayGoals: 0 },
  { label: "3. Hafta", date: "28 Ağu", home: "Gençlerbirliği", homeGoals: 1, away: "Erzurumspor FK", awayGoals: 1 },
  { label: "3. Hafta", date: "29 Ağu", home: "Konyaspor", homeGoals: 1, away: "Kocaelispor", awayGoals: 2 },
  { label: "3. Hafta", date: "29 Ağu", home: "Gaziantep FK", homeGoals: 1, away: "Çaykur Rizespor", awayGoals: 2 },
  { label: "3. Hafta", date: "29 Ağu", home: "Galatasaray", homeGoals: 3, away: "Göztepe", awayGoals: 2 },
  { label: "3. Hafta", date: "30 Ağu", home: "Eyüpspor", homeGoals: 2, away: "Alanyaspor", awayGoals: 1 },
  { label: "3. Hafta", date: "30 Ağu", home: "İstanbul Başakşehir", homeGoals: 1, away: "Kasımpaşa", awayGoals: 1 },
  { label: "3. Hafta", date: "30 Ağu", home: "Samsunspor", homeGoals: 0, away: "Fenerbahçe", awayGoals: 2 },
  { label: "3. Hafta", date: "31 Ağu", home: "Amed SFK", homeGoals: 2, away: "Trabzonspor", awayGoals: 1 },
  { label: "3. Hafta", date: "31 Ağu", home: "Beşiktaş", homeGoals: 6, away: "Çorum FK", awayGoals: 2 },
  { label: "4. Hafta", date: "4 Eyl", home: "İstanbul Başakşehir", homeGoals: 2, away: "Galatasaray", awayGoals: 3 },
  { label: "4. Hafta", date: "5 Eyl", home: "Erzurumspor FK", homeGoals: 1, away: "Konyaspor", awayGoals: 0 },
  { label: "4. Hafta", date: "5 Eyl", home: "Fenerbahçe", homeGoals: 1, away: "Beşiktaş", awayGoals: 2 },
  { label: "4. Hafta", date: "6 Eyl", home: "Kasımpaşa", homeGoals: 2, away: "Amed SFK", awayGoals: 2 },
  { label: "4. Hafta", date: "6 Eyl", home: "Çorum FK", homeGoals: 3, away: "Eyüpspor", awayGoals: 0 },
  { label: "4. Hafta", date: "6 Eyl", home: "Kocaelispor", homeGoals: 1, away: "Samsunspor", awayGoals: 0 },
  { label: "4. Hafta", date: "6 Eyl", home: "Trabzonspor", homeGoals: 5, away: "Gençlerbirliği", awayGoals: 0 },
  { label: "4. Hafta", date: "7 Eyl", home: "Göztepe", homeGoals: 2, away: "Gaziantep FK", awayGoals: 4 },
  { label: "4. Hafta", date: "7 Eyl", home: "Çaykur Rizespor", homeGoals: 0, away: "Alanyaspor", awayGoals: 1 },
  { label: "5. Hafta", date: "11 Eyl", home: "Beşiktaş", homeGoals: 3, away: "Erzurumspor FK", awayGoals: 0 },
  { label: "5. Hafta", date: "12 Eyl", home: "Eyüpspor", homeGoals: 0, away: "Çaykur Rizespor", awayGoals: 2 },
  { label: "5. Hafta", date: "12 Eyl", home: "Samsunspor", homeGoals: 1, away: "Çorum FK", awayGoals: 5 },
  { label: "5. Hafta", date: "12 Eyl", home: "Alanyaspor", homeGoals: 2, away: "Göztepe", awayGoals: 2 },
  { label: "5. Hafta", date: "12 Eyl", home: "Konyaspor", homeGoals: 1, away: "Trabzonspor", awayGoals: 0 },
  { label: "5. Hafta", date: "13 Eyl", home: "Gençlerbirliği", homeGoals: 1, away: "Kasımpaşa", awayGoals: 2 },
  { label: "5. Hafta", date: "13 Eyl", home: "Amed SFK", homeGoals: 5, away: "İstanbul Başakşehir", awayGoals: 0 },
  { label: "5. Hafta", date: "13 Eyl", home: "Galatasaray", homeGoals: 1, away: "Kocaelispor", awayGoals: 0 },
  { label: "5. Hafta", date: "14 Eyl", home: "Gaziantep FK", homeGoals: 0, away: "Fenerbahçe", awayGoals: 0 },
  { label: "6. Hafta", date: "18 Eyl", home: "Kasımpaşa", homeGoals: 0, away: "Konyaspor", awayGoals: 0 },
  { label: "6. Hafta", date: "19 Eyl", home: "Çorum FK", homeGoals: 1, away: "Alanyaspor", awayGoals: 2 },
  { label: "6. Hafta", date: "19 Eyl", home: "Kocaelispor", homeGoals: 2, away: "Gaziantep FK", awayGoals: 0 },
  { label: "6. Hafta", date: "19 Eyl", home: "Trabzonspor", homeGoals: 4, away: "Galatasaray", awayGoals: 0 },
  { label: "6. Hafta", date: "19 Eyl", home: "İstanbul Başakşehir", homeGoals: 4, away: "Gençlerbirliği", awayGoals: 0 },
  { label: "6. Hafta", date: "20 Eyl", home: "Fenerbahçe", homeGoals: 8, away: "Eyüpspor", awayGoals: 0 },
  { label: "6. Hafta", date: "20 Eyl", home: "Erzurumspor FK", homeGoals: 1, away: "Samsunspor", awayGoals: 0 },
  { label: "6. Hafta", date: "20 Eyl", home: "Amed SFK", homeGoals: 3, away: "Beşiktaş", awayGoals: 2 },
  { label: "6. Hafta", date: "20 Eyl", home: "Göztepe", homeGoals: 2, away: "Çaykur Rizespor", awayGoals: 2 },
];

// Simüle edilmiş TAM fikstürü (roundRobinEngine'den gelen, gerçek dünyayla
// hiçbir ilgisi olmayan bağımsız bir dizilim) gerçek 1. Hafta sonuçlarıyla
// UZLAŞTIRIR: zaten gerçekte oynanmış eşleşmeleri fikstürden çıkarır, geri
// kalan maçları "sıradaki tahminler" olarak bırakır; puan durumu tahmini de
// sıfırdan değil GERÇEK 1. Hafta puan durumundan devam eder. Böylece
// "tahmin" hiçbir zaman zaten bilinen gerçek bir sonucu tekrar üretmeye
// çalışmaz -- sadece henüz oynanmamış maçları tahmin eder.
export function buildSuperLigContinuation(teams, fullFixture) {
  const teamByName = Object.fromEntries(teams.map((t) => [t.name, t]));
  const playedPairs = new Set(
    SUPER_LIG_LIVE_RESULTS.map((r) => `${r.home}|${r.away}`)
  );

  const remainingFixture = fullFixture
    .map((md) => ({
      ...md,
      matches: md.matches.filter(
        (m) => !playedPairs.has(`${m.homeTeam.name}|${m.awayTeam.name}`)
      ),
    }))
    .filter((md) => md.matches.length > 0);

  const initialStandings = {};
  for (const row of SUPER_LIG_LIVE_STANDINGS) {
    const team = teamByName[row.teamName];
    if (!team) continue;
    initialStandings[team.id] = {
      teamId: team.id,
      played: row.played,
      w: row.w,
      d: row.d,
      l: row.l,
      gf: row.gf,
      ga: row.ga,
      pts: row.pts,
    };
  }

  return { remainingFixture, initialStandings };
}

// UCL lig fazı çekilişi yapıldı (27 Ağustos 2026, Grimaldi Forum, Monako) --
// ancak 36 takımın tam eşleşme listesi (144 maç) UEFA tarafından henüz
// (29 Ağustos 2026'ya kadar) resmi olarak yayınlanmadı, ve web'den taranan
// kaynaklar (ör. Wikipedia) bu aşamada birbiriyle çelişen/hatalı satırlar
// içerebiliyor (spot-check'te en az bir yanlış satır -- PSV Eindhoven --
// tespit edildi). Bu yüzden burada SADECE doğrulanmış, düşük riskli tarih
// bilgisi tutuluyor; 144 maçlık tam fikstür kasıtlı olarak eklenmedi.
export const UCL_SEASON_STATUS = {
  phaseStart: "8 Eylül 2026",
  drawDate: "27 Ağustos 2026",
  playoffEnds: "26 Ağustos 2026",
  note:
    "Lig fazı çekilişi 27 Ağustos 2026'da Monako'da (Grimaldi Forum) yapıldı. Maç günleri 8 Eylül 2026 - 27 Ocak 2027 arasına yayılıyor; UEFA'nın kesin saat/tarih içeren tam fikstürü en geç 29 Ağustos 2026'da açıklanması bekleniyor.",
};

export const EUROPA_SEASON_STATUS = {
  phaseStart: "Eylül 2026",
  note:
    "UEFA Avrupa Ligi 2026-27 lig fazı çekilişi de UCL ile aynı hafta (Ağustos 2026 sonu) yapıldı; kesin fikstür UEFA'nın resmi açıklamasıyla netleşecek.",
};

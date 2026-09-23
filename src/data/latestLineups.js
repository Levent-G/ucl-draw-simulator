// 2026-27 Trendyol Süper Lig, 6. Hafta (18-20 Eylül 2026) -- takımların
// SAHAYA GERÇEKTEN ÇIKARDIĞI ilk 11'ler ve gerçek diziliş (ProbableLineup.jsx'in
// kadro gücüne göre ürettiği OTOMATİK/TAHMİNİ diziliş İLE KARIŞTIRILMAMALIDIR).
//
// ARAŞTIRMA TARİHİ: 2026-09-23. Kaynak yöntemi: her takımın 6. Hafta maçı için
// WebSearch ile mackolik.com, sahadan.com, fanatik.com.tr, fotomac.com.tr,
// resmi kulüp siteleri (ör. fenerbahce.org, kasimpasa.com.tr) ve maç özeti
// haberleri (gol dakikaları dahil) tarandı; her isim en az 2 BAĞIMSIZ arama/
// kaynakla (veya gol/asist kaydı gibi maç-içi bir olayla) çapraz doğrulanmaya
// çalışıldı. src/data/superLigPlayers.js'teki mevcut kadro araştırma notlarıyla
// (ör. Deniz Gül, Franculino Djú, Noah Saviolo, Emin Bayram, Ousseynou Ba,
// Mohamed Bayo, Nihad Mujakić, Ertuğrul Taşkıran gibi GERÇEK 19-20 Eylül
// ilk-11 oyuncuları için zaten yapılmış araştırma) çapraz kontrol edildi.
//
// KURAL (actualLineups.js ile aynı ilke): bir takımın ilk 11'i güvenilir
// şekilde doğrulanamadıysa (kaynaklar isim bazında çelişti, sadece tek ve
// düşük güvenilirlikte bir kaynak bulundu, ya da isimler mantıksız/şüpheli
// çıktı -- ör. Çorum FK-Alanyaspor ve Kocaelispor-Gaziantep FK maçları için
// bulunan isimler kaynaklar arasında ciddi şekilde çelişti ve en az bir isim
// (ör. "Cengiz Ünder"nin Çorum FK'de oynaması) başka bir kulüpten karışmış
// gibi göründü) o takım BU NESNEDEN TAMAMEN ÇIKARILMIŞTIR -- uydurma/tahmini
// bir isim EKLENMEMİŞTİR. Bu yüzden 18 takımın 6'sı (s7 Göztepe, s10
// Alanyaspor, s12 Çaykur Rizespor, s13 Çorum FK, s15 Gaziantep FK, s17
// Kocaelispor) bu dosyada YOKTUR.
//
// formation: sadece src/state/DreamTeamContext.jsx'in FORMATIONS'ında
// tanımlı 5 şekilden biri (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3) kullanılabilir.
// Kaynaklar gerçek diziliş için başka bir şekil bildirdiğinde (ör. 5-4-1),
// GK/DF/MF/FW slot SAYISI en yakın eşleşen şekil seçilmiş ve aşağıda ilgili
// takımın yorumunda belirtilmiştir. Bazı oyuncu adları (özellikle Eyüpspor,
// Samsunspor'un "Erakovic"i, Gençlerbirliği'nin "Mendes"i) kaynaklarda sadece
// soyadıyla geçtiği için tam ad tamamlanamadı -- bu, actualLineups.js'teki
// "eksik ama uydurulmamış isim" ilkesiyle tutarlıdır.
//
// matchId alanları src/data/realFixtureSuperLig2026.js'teki 6. Hafta
// ("sr6mN") kimlikleriyle birebir eşleşir.
export const LATEST_LINEUP_SUPERLIG = {
  // sr6m3: Trabzonspor 4-0 Galatasaray, 19 Eylül 2026
  s1: {
    matchId: "sr6m3",
    date: "2026-09-19",
    formation: "4-3-3",
    xi: [
      "Uğurcan Çakır",
      "Roland Sallai",
      "Davinson Sánchez",
      "Abdülkerim Bardakcı",
      "Ismail Jakobs",
      "Lucas Torreira",
      "Gabriel Sara",
      "Leroy Sané",
      "Yunus Akgün",
      "Rafael Leão",
      "Deniz Gül",
    ],
    source: "mackolik.com ilk 11 haberi + fanatik.com.tr canlı anlatım (çapraz doğrulandı); Deniz Gül ayrıca superLigPlayers.js'teki bağımsız araştırmayla teyitli",
  },
  s4: {
    matchId: "sr6m3",
    date: "2026-09-19",
    formation: "4-3-3",
    xi: [
      "André Onana",
      "Wagner Pina",
      "Chibuike Nwaiwu",
      "Stefan Savić",
      "Mustafa Eskihellaç",
      "Melih",
      "Fabinho",
      "Ernest Muçi",
      "Mohamed Salah",
      "Noah Saviolo",
      "Franculino Djú",
    ],
    source: "mackolik.com ilk 11 haberi + fanatik.com.tr canlı anlatım (çapraz doğrulandı); Franculino Djú ve Noah Saviolo superLigPlayers.js'teki bağımsız araştırmayla teyitli. \"Melih\" için kaynaklarda sadece ilk isim geçiyor, soyadı doğrulanamadı.",
  },
  // sr6m5: Fenerbahçe 8-0 Eyüpspor, 20 Eylül 2026
  s2: {
    matchId: "sr6m5",
    date: "2026-09-20",
    formation: "4-2-3-1",
    xi: [
      "Ederson",
      "Nélson Semedo",
      "Milan Škriniar",
      "Nathan Aké",
      "Archie Brown",
      "N'Golo Kanté",
      "Mattéo Guendouzi",
      "İrfan Can Kahveci",
      "Mason Greenwood",
      "Kerem Aktürkoğlu",
      "Vedat Muriqi",
    ],
    source: "mackolik.com + fenerbahce.org resmi ilk 11 haberi (çapraz doğrulandı); İrfan Can Kahveci ayrıca maçın 45. dakika gol kaydıyla teyitli",
  },
  s16: {
    matchId: "sr6m5",
    date: "2026-09-20",
    formation: "4-4-2", // Kaynak açık bir diziliş vermedi; 11 ismin rol dağılımından (4 DF + 4 MF + 2 FW) en yakın şekil olarak yaklaşık atanmıştır.
    xi: ["Moldovan", "Talha", "El Yamiq", "Jules", "Giordano", "Massanga", "Boutobba", "Costa", "Raux Yao", "Michalak", "Abdullahi"],
    source: "fanatik.com.tr canlı anlatım + aspor.com.tr muhtemel/ilk 11 haberi (iki bağımsız kaynakta aynı 11 isim). İsimler kaynaklarda sadece soyadıyla geçiyor.",
  },
  // sr6m7: Amed SFK 3-2 Beşiktaş, 20 Eylül 2026
  s3: {
    matchId: "sr6m7",
    date: "2026-09-20",
    formation: "4-2-3-1",
    xi: [
      "Alexander Nübel",
      "Michael Murillo",
      "Emmanuel Agbadou",
      "Tiago Djaló",
      "Rıdvan Yılmaz",
      "Salih Özcan",
      "Junior Olaitan",
      "Ernest Poku",
      "Orkun Kökçü",
      "İlhan Fakılı",
      "Dušan Vlahović",
    ],
    source: "fanatik.com.tr canlı anlatım + gzt.com ilk 11 haberi (çapraz doğrulandı); Murillo, Agbadou, Djaló, Rıdvan, Salih Özcan, Poku, Orkun Kökçü ve Vlahović superLigPlayers.js kadrosuyla da örtüşüyor. İlhan Fakılı 2026 yaz transferi olarak ayrıca Hürriyet/Fanatik/Wikipedia ile teyitli.",
  },
  s11: {
    matchId: "sr6m7",
    date: "2026-09-20",
    formation: "4-3-3",
    xi: [
      "Alban Lafont",
      "David Bates",
      "Lumbardh Dellova",
      "Ermal Krasniqi",
      "Umut Meraş",
      "Furkan Soyalp",
      "Rayan Raveloson",
      "Mohamed Khalil",
      "Samuel Ballet",
      "Dia Saba",
      "Gift Orban",
    ],
    source: "fanatik.com.tr canlı anlatım + gzt.com ilk 11 haberi (çapraz doğrulandı); Furkan Soyalp ayrıca maçın 59. dakika gol kaydıyla teyitli. Bates, Dellova, Krasniqi, Ballet, Khalil, Saba, Orban superLigPlayers.js kadrosuyla örtüşüyor.",
  },
  // sr6m0: Kasımpaşa 0-0 Konyaspor, 18 Eylül 2026
  s8: {
    matchId: "sr6m0",
    date: "2026-09-18",
    formation: "4-2-3-1",
    xi: [
      "Andreas Gianniotis",
      "Cláudio Winck",
      "Kevin Mouanga",
      "Matei Ilie",
      "Jakob Jessen",
      "Güven Yalçın",
      "Kerem Demirbay",
      "Ali Yavuz Kol",
      "Elson Mendes",
      "Adrian Benedyczak",
      "Marcus Rafferty",
    ],
    source: "kasimpasa.com.tr resmi kadro haberi (Takımımızın Konyaspor maçı kadrosu) + mackolik.com karşılaştırma sayfası; Gianniotis, Winck, Ilie, Jessen, Yalçın, Demirbay, Mendes, Benedyczak superLigPlayers.js kadrosuyla örtüşüyor.",
  },
  s9: {
    matchId: "sr6m0",
    date: "2026-09-18",
    formation: "4-2-3-1",
    xi: [
      "Bahadır Güngördü",
      "Adil Demirbağ",
      "Uğurcan Yazğılı",
      "Rayyan Baniya",
      "Arthur Masuaku",
      "Marko Jevtović",
      "Deniz Türüç",
      "Rajmund Tóth",
      "Melih İbrahimoğlu",
      "Diogo Gonçalves",
      "Jackson Muleka",
    ],
    source: "mackolik.com ilk 11 haberi (iki ayrı arama sonucunda BİREBİR aynı 11 isim) -- tamamı superLigPlayers.js kadrosuyla örtüşüyor",
  },
  // sr6m6: Erzurumspor FK - Samsunspor, 20 Eylül 2026
  s6: {
    matchId: "sr6m6",
    date: "2026-09-20",
    formation: "4-2-3-1",
    xi: [
      "Okan Kocuk",
      "Joe Mendes",
      "Erakovic",
      "Gabriele Guarino",
      "Logi Tómasson",
      "Elliot Watt",
      "Celil Yüksel",
      "Samed Onur",
      "Saikuba Jarju",
      "Emre Kılınç",
      "Mohamed Bayo",
    ],
    source: "samsunhaber.com + politikam.com ilk 11 haberi; Okan Kocuk, Mendes, Guarino, Tómasson, Watt, Celil, Samed, Jarju, Emre Kılınç, Bayo superLigPlayers.js kadrosuyla örtüşüyor. \"Erakovic\" kadroda kayıtlı değil (muhtemelen yeni/kayıtsız bir transfer), soyadı dışında bilgi doğrulanamadı.",
  },
  s14: {
    matchId: "sr6m6",
    date: "2026-09-20",
    // Kaynaklar bu maç için "5-4-1" ve "4-4-1-1" olmak üzere ÇELİŞEN iki gerçek
    // diziliş bildirdi; ikisi de bu sitenin desteklediği 5 şekilden hiçbirine
    // birebir uymuyor. Her ikisi de (bir bek/kanat oyuncusunun orta sahaya
    // kaydırılmasıyla) aynı GK1/DF4/MF5/FW1 slot dağılımına yaklaştığından,
    // en yakın eşleşen şekil olarak "4-2-3-1" seçildi.
    formation: "4-2-3-1",
    xi: [
      "Ertuğrul Taşkıran",
      "Orhan Ovacıklı",
      "Amar Gërxhaliu",
      "Mustafa Yumlu",
      "Nihad Mujakić",
      "Guram Giorbelidze",
      "Brandon Baiye",
      "Elisha Owusu",
      "Martín Rodríguez",
      "Miguel Cardoso",
      "Eren Tozlu",
    ],
    source: "politikam.com + samsunhaber.com ilk 11 haberi; Ertuğrul Taşkıran, Nihad Mujakić superLigPlayers.js'teki bağımsız araştırmayla (NTVSpor/Hürriyet/Sporx, Fanatik/Fotomaç/Habertürk) teyitli, kalan 9 isim de kadroyla birebir örtüşüyor.",
  },
  // sr6m4: Başakşehir 4-0 Gençlerbirliği, 19 Eylül 2026
  s5: {
    matchId: "sr6m4",
    date: "2026-09-19",
    // Kaynak açık bir diziliş adı vermedi; Kemen ve Güneş için bilinen gerçek
    // mevkileri (sırasıyla bek/kanat) esas alınarak GK1/DF4/MF3/FW3 dağılımına
    // en yakın şekil olan "4-3-3" seçildi.
    formation: "4-3-3",
    xi: [
      "Muhammed Şengezer",
      "Saba Kharebashvili",
      "Emin Bayram",
      "Ousseynou Ba",
      "Olivier Kemen",
      "Ivan Brnić",
      "Michal Karbownik",
      "Umut Güneş",
      "Davie Selke",
      "Andreas Skov Olsen",
      "Eldor Shomurodov",
    ],
    source: "zamin.uz + politikam.com ilk 11 haberi; Şengezer, Kharebashvili, Emin Bayram, Ousseynou Ba, Brnić, Karbownik, Selke, Skov Olsen superLigPlayers.js kadrosuyla örtüşüyor (Emin Bayram/Ousseynou Ba/Kharebashvili ayrıca Milliyet/Goal.com/TFF, Hürriyet/NTVSpor, Fotmob ile bağımsız teyitli). Shomurodov'un 2 gol (33' ve 65') kaydı ilk 11'de oynadığını doğruluyor.",
  },
  s18: {
    matchId: "sr6m4",
    date: "2026-09-19",
    formation: "4-3-3", // Kaynak açık diziliş vermedi; rol dağılımından yaklaşık atandı (bkz. s5 notu).
    xi: [
      "İrfan Can Eğribayat",
      "Pedro Pereira",
      "Dimitrios Goutas",
      "Thalisson",
      "Abdurrahim Dursun",
      "Ousmane Diabaté",
      "Oğulcan Ülgün",
      "Franco Tongya",
      "Tiago Gouveia",
      "Adama Traoré",
      "Mendes",
    ],
    source: "zamin.uz + politikam.com ilk 11 haberi (iki bağımsız aramada aynı 11 isim); Eğribayat, Pereira, Goutas, Thalisson, Dursun, Diabaté, Ülgün, Tongya, Traoré superLigPlayers.js kadrosuyla örtüşüyor. \"Mendes\" ve \"Tiago Gouveia\" kadroda kayıtlı değil (muhtemelen kayıtsız transferler); \"Mendes\" için soyadı dışında bilgi doğrulanamadı.",
  },
};

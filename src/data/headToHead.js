// Gerçek tarihi ikili (head-to-head) karşılaşma verileri -- kurgusal DEĞİL.
//
// Kapsam ve yöntem: 2026-27 UEFA Şampiyonlar Ligi lig fazının GERÇEK 144
// eşleşmesinin (bkz. realDraw2026.js -> REAL_DRAW_2026_MATCHES) TAMAMINI tek
// seferde araştırmak gerçekçi değil. Bu yüzden burada ÖNCELİKLENDİRİLMİŞ bir
// alt küme yer alıyor:
//   (a) tarihi açıdan büyük Avrupa kulüplerini birbirine bağlayan eşleşmeler
//       (Real Madrid, Man City, Bayern, PSG, Liverpool, Inter, Barcelona,
//       Man Utd, Napoli, Atletico, Arsenal, Dortmund, Roma...),
//   (b) daha önce UCL/Avrupa Kupası finalinde veya yarı finalinde karşılaşmış
//       çiftler,
//   (c) Galatasaray/Fenerbahçe'nin büyük Avrupa kulüpleriyle olan geçmişi
//       (Türkiye ilgisi önceliklendirildi),
//   (d) klasik Süper Lig derbileri (Galatasaray-Fenerbahçe, Fenerbahçe-
//       Beşiktaş, Galatasaray-Beşiktaş, Trabzonspor rekabetleri).
//
// Burada YER ALMAYAN çiftler için (144 eşleşmenin büyük çoğunluğu, özellikle
// Torba 3/4 takımlarını içeren maçlar) kasıtlı olarak veri EKLENMEDİ --
// güvenilir/doğrulanabilir bir geçmiş bulunamadığında ya hiç maç
// oynanmamıştır ya da araştırma bu çalışmanın kapsamı dışında kalmıştır.
// Tüketen arayüz (UI) bu durumda zaten dürüst bir "bu takımlar hakkında
// geçmiş veri bulunamadı" mesajı gösteriyor -- düşük güvenilirlikli ya da
// tahmini kayıtlarla doldurma YAPILMADI.
//
// "summary" alanı SADECE aşağıda listelenen "meetings" dizisindeki
// karşılaşmaları özetler -- bazı çiftlerin (ör. Man City-Barcelona) daha
// uzun bir tam tarihi olabilir, ancak burada yalnızca doğrulanmış/tarihli
// karşılaşmalar sayılmıştır ("played" bu yüzden bazı kaynaklardaki "tüm
// zamanlar" rakamından daha düşük olabilir -- bu kasıtlıdır, eksik/emin
// olunmayan maçlar uydurulmamıştır).
//
// key = iki takım id'sinin (teams.js / superLigTeams.js) alfabetik
// (string) sırayla "|" ile birleşimi, ör. ["t1","t9"].sort().join("|").
// summary.homeTeamWins / awayTeamWins isimlendirmesi, gerçek maçtaki ev
// sahipliğini DEĞİL, sadece bu sıralı anahtardaki BİRİNCİ / İKİNCİ takımı
// ifade eder (yöne bağlı olmayan kararlı bir özet için).
export const HEAD_TO_HEAD = {
  // ---- Real Madrid (t1) ----
  "t1|t6": {
    // Real Madrid - Inter
    meetings: [
      {
        date: "1964-05-27",
        competition: "Avrupa Şampiyon Kulüpler Kupası Finali",
        homeTeam: "Inter",
        awayTeam: "Real Madrid",
        homeGoals: 3,
        awayGoals: 1,
      },
      {
        date: "2020-11-03",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Real Madrid",
        awayTeam: "Inter",
        homeGoals: 3,
        awayGoals: 2,
      },
      {
        date: "2020-11-25",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Inter",
        awayTeam: "Real Madrid",
        homeGoals: 0,
        awayGoals: 2,
      },
    ],
    summary: { played: 3, homeTeamWins: 2, draws: 0, awayTeamWins: 1 },
  },
  "t1|t11": {
    // Real Madrid - Arsenal
    meetings: [
      {
        date: "2006-02-21",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Real Madrid",
        awayTeam: "Arsenal",
        homeGoals: 0,
        awayGoals: 1,
      },
      {
        date: "2006-03-08",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Arsenal",
        awayTeam: "Real Madrid",
        homeGoals: 0,
        awayGoals: 0,
      },
      {
        date: "2025-04-08",
        competition: "UEFA Şampiyonlar Ligi Çeyrek Finali (1. maç)",
        homeTeam: "Arsenal",
        awayTeam: "Real Madrid",
        homeGoals: 3,
        awayGoals: 0,
      },
      {
        date: "2025-04-16",
        competition: "UEFA Şampiyonlar Ligi Çeyrek Finali (2. maç)",
        homeTeam: "Real Madrid",
        awayTeam: "Arsenal",
        homeGoals: 1,
        awayGoals: 2,
      },
    ],
    summary: { played: 4, homeTeamWins: 0, draws: 1, awayTeamWins: 3 },
  },
  "t1|t13": {
    // Real Madrid - Roma
    meetings: [
      {
        date: "2016-02-17",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Roma",
        awayTeam: "Real Madrid",
        homeGoals: 0,
        awayGoals: 2,
      },
      {
        date: "2016-03-08",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Real Madrid",
        awayTeam: "Roma",
        homeGoals: 2,
        awayGoals: 0,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },

  // ---- Manchester City (t2) ----
  "t2|t4": {
    // Manchester City - PSG
    meetings: [
      {
        date: "2021-04-28",
        competition: "UEFA Şampiyonlar Ligi Yarı Finali (1. maç)",
        homeTeam: "Paris Saint-Germain",
        awayTeam: "Manchester City",
        homeGoals: 1,
        awayGoals: 2,
      },
      {
        date: "2021-05-04",
        competition: "UEFA Şampiyonlar Ligi Yarı Finali (2. maç)",
        homeTeam: "Manchester City",
        awayTeam: "Paris Saint-Germain",
        homeGoals: 2,
        awayGoals: 0,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },
  "t2|t7": {
    // Manchester City - Barcelona
    meetings: [
      {
        date: "2014-02-18",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Manchester City",
        awayTeam: "Barcelona",
        homeGoals: 0,
        awayGoals: 2,
      },
      {
        date: "2014-03-12",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Barcelona",
        awayTeam: "Manchester City",
        homeGoals: 2,
        awayGoals: 1,
      },
      {
        date: "2015-03-18",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Manchester City",
        awayTeam: "Barcelona",
        homeGoals: 1,
        awayGoals: 2,
      },
      {
        date: "2015-03-24",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Barcelona",
        awayTeam: "Manchester City",
        homeGoals: 1,
        awayGoals: 0,
      },
      {
        date: "2016-10-19",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Barcelona",
        awayTeam: "Manchester City",
        homeGoals: 4,
        awayGoals: 0,
      },
      {
        date: "2016-11-01",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Manchester City",
        awayTeam: "Barcelona",
        homeGoals: 3,
        awayGoals: 1,
      },
    ],
    summary: { played: 6, homeTeamWins: 1, draws: 0, awayTeamWins: 5 },
  },
  "t2|t9": {
    // Manchester City - Napoli
    meetings: [
      {
        date: "2017-10-17",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Manchester City",
        awayTeam: "Napoli",
        homeGoals: 2,
        awayGoals: 1,
      },
      {
        date: "2017-11-01",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Napoli",
        awayTeam: "Manchester City",
        homeGoals: 2,
        awayGoals: 4,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },

  // ---- Bayern Münih (t3) ----
  "t3|t8": {
    // Bayern Münih - Manchester United
    meetings: [
      {
        date: "1999-05-26",
        competition: "UEFA Şampiyonlar Ligi Finali",
        homeTeam: "Bayern Münih",
        awayTeam: "Manchester United",
        homeGoals: 1,
        awayGoals: 2,
      },
    ],
    summary: { played: 1, homeTeamWins: 0, draws: 0, awayTeamWins: 1 },
  },
  "t10|t3": {
    // Atletico Madrid - Bayern Münih
    meetings: [
      {
        date: "2016-04-27",
        competition: "UEFA Şampiyonlar Ligi Yarı Finali (1. maç)",
        homeTeam: "Atletico Madrid",
        awayTeam: "Bayern Münih",
        homeGoals: 1,
        awayGoals: 0,
      },
      {
        date: "2016-05-03",
        competition: "UEFA Şampiyonlar Ligi Yarı Finali (2. maç)",
        homeTeam: "Bayern Münih",
        awayTeam: "Atletico Madrid",
        homeGoals: 2,
        awayGoals: 1,
      },
    ],
    summary: { played: 2, homeTeamWins: 1, draws: 0, awayTeamWins: 1 },
  },
  "t11|t3": {
    // Arsenal - Bayern Münih
    meetings: [
      {
        date: "2017-02-15",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Bayern Münih",
        awayTeam: "Arsenal",
        homeGoals: 5,
        awayGoals: 1,
      },
      {
        date: "2017-03-07",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Arsenal",
        awayTeam: "Bayern Münih",
        homeGoals: 1,
        awayGoals: 5,
      },
    ],
    summary: { played: 2, homeTeamWins: 0, draws: 0, awayTeamWins: 2 },
  },
  "t11|t12": {
    // Arsenal - Borussia Dortmund
    meetings: [
      {
        date: "2013-10-22",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Arsenal",
        awayTeam: "Borussia Dortmund",
        homeGoals: 1,
        awayGoals: 2,
      },
      {
        date: "2013-11-06",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Borussia Dortmund",
        awayTeam: "Arsenal",
        homeGoals: 0,
        awayGoals: 1,
      },
      {
        date: "2014-11-26",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Arsenal",
        awayTeam: "Borussia Dortmund",
        homeGoals: 2,
        awayGoals: 0,
      },
    ],
    summary: { played: 3, homeTeamWins: 2, draws: 0, awayTeamWins: 1 },
  },
  "t11|t9": {
    // Arsenal - Napoli
    meetings: [
      {
        date: "2013-10-01",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Arsenal",
        awayTeam: "Napoli",
        homeGoals: 2,
        awayGoals: 0,
      },
      {
        date: "2013-12-11",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Napoli",
        awayTeam: "Arsenal",
        homeGoals: 2,
        awayGoals: 0,
      },
    ],
    summary: { played: 2, homeTeamWins: 1, draws: 0, awayTeamWins: 1 },
  },

  // ---- Paris Saint-Germain (t4) ----
  "t4|t7": {
    // PSG - Barcelona
    meetings: [
      {
        date: "2017-02-14",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Paris Saint-Germain",
        awayTeam: "Barcelona",
        homeGoals: 4,
        awayGoals: 0,
      },
      {
        date: "2017-03-08",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç) - ünlü 'Remontada'",
        homeTeam: "Barcelona",
        awayTeam: "Paris Saint-Germain",
        homeGoals: 6,
        awayGoals: 1,
      },
      {
        date: "2021-02-16",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Paris Saint-Germain",
        awayTeam: "Barcelona",
        homeGoals: 4,
        awayGoals: 1,
      },
      {
        date: "2021-03-10",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Barcelona",
        awayTeam: "Paris Saint-Germain",
        homeGoals: 1,
        awayGoals: 1,
      },
    ],
    summary: { played: 4, homeTeamWins: 2, draws: 1, awayTeamWins: 1 },
  },
  "t35|t4": {
    // Galatasaray - PSG
    meetings: [
      {
        date: "2019-10-01",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Galatasaray",
        awayTeam: "Paris Saint-Germain",
        homeGoals: 0,
        awayGoals: 1,
      },
      {
        date: "2019-12-11",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Paris Saint-Germain",
        awayTeam: "Galatasaray",
        homeGoals: 5,
        awayGoals: 0,
      },
    ],
    summary: { played: 2, homeTeamWins: 0, draws: 0, awayTeamWins: 2 },
  },

  // ---- Liverpool (t5) ----
  "t10|t5": {
    // Atletico Madrid - Liverpool
    meetings: [
      {
        date: "2020-02-18",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Atletico Madrid",
        awayTeam: "Liverpool",
        homeGoals: 1,
        awayGoals: 0,
      },
      {
        date: "2020-03-11",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç, uzatmalarda)",
        homeTeam: "Liverpool",
        awayTeam: "Atletico Madrid",
        homeGoals: 2,
        awayGoals: 3,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },
  "t5|t6": {
    // Liverpool - Inter
    meetings: [
      {
        date: "2008-02-19",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Liverpool",
        awayTeam: "Inter",
        homeGoals: 2,
        awayGoals: 0,
      },
      {
        date: "2008-03-11",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç)",
        homeTeam: "Inter",
        awayTeam: "Liverpool",
        homeGoals: 0,
        awayGoals: 1,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },

  // ---- Inter (t6) ----
  "t12|t6": {
    // Borussia Dortmund - Inter
    meetings: [
      {
        date: "2026-01-28",
        competition: "UEFA Şampiyonlar Ligi Lig Aşaması (2025-26 sezonu)",
        homeTeam: "Borussia Dortmund",
        awayTeam: "Inter",
        homeGoals: 0,
        awayGoals: 2,
      },
    ],
    summary: { played: 1, homeTeamWins: 0, draws: 0, awayTeamWins: 1 },
  },

  // ---- Barcelona (t7) ----
  "t35|t7": {
    // Galatasaray - Barcelona
    meetings: [
      {
        date: "1993-09-15",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Galatasaray",
        awayTeam: "Barcelona",
        homeGoals: 0,
        awayGoals: 0,
      },
      {
        date: "1993-11-24",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Barcelona",
        awayTeam: "Galatasaray",
        homeGoals: 3,
        awayGoals: 0,
      },
      {
        date: "1994-09-07",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Barcelona",
        awayTeam: "Galatasaray",
        homeGoals: 2,
        awayGoals: 1,
      },
      {
        date: "1994-10-19",
        competition: "UEFA Şampiyonlar Ligi Grup Aşaması",
        homeTeam: "Galatasaray",
        awayTeam: "Barcelona",
        homeGoals: 2,
        awayGoals: 1,
      },
    ],
    summary: { played: 4, homeTeamWins: 1, draws: 1, awayTeamWins: 2 },
  },

  // ---- Manchester United (t8) ----
  "t10|t8": {
    // Atletico Madrid - Manchester United
    meetings: [
      {
        date: "2022-02-23",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (1. maç)",
        homeTeam: "Atletico Madrid",
        awayTeam: "Manchester United",
        homeGoals: 1,
        awayGoals: 0,
      },
      {
        date: "2022-03-15",
        competition: "UEFA Şampiyonlar Ligi Son 16 Turu (2. maç) - Ronaldo'nun United forması altındaki son UCL maçı",
        homeTeam: "Manchester United",
        awayTeam: "Atletico Madrid",
        homeGoals: 0,
        awayGoals: 1,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },
  "t13|t8": {
    // Roma - Manchester United
    meetings: [
      {
        date: "2007-04-04",
        competition: "UEFA Şampiyonlar Ligi Çeyrek Finali (1. maç)",
        homeTeam: "Roma",
        awayTeam: "Manchester United",
        homeGoals: 2,
        awayGoals: 1,
      },
      {
        date: "2007-04-10",
        competition: "UEFA Şampiyonlar Ligi Çeyrek Finali (2. maç) - Old Trafford'da tarihi galibiyet",
        homeTeam: "Manchester United",
        awayTeam: "Roma",
        homeGoals: 7,
        awayGoals: 1,
      },
    ],
    summary: { played: 2, homeTeamWins: 1, draws: 0, awayTeamWins: 1 },
  },

  // ---- Roma (t13) / Fenerbahçe (t25) ----
  "t13|t25": {
    // Roma - Fenerbahçe (yalnızca bir hazırlık maçında karşılaştılar; resmi maçta hiç oynamadılar)
    meetings: [
      {
        date: "2014-08-19",
        competition: "Hazırlık Maçı (resmi değil)",
        homeTeam: "Roma",
        awayTeam: "Fenerbahçe",
        homeGoals: 3,
        awayGoals: 3,
      },
    ],
    summary: { played: 1, homeTeamWins: 0, draws: 1, awayTeamWins: 0 },
  },

  // =========================================================================
  // Trendyol Süper Lig -- klasik derbiler (id'ler superLigTeams.js'ten, "s" ön ekli)
  // =========================================================================
  "s1|s2": {
    // Galatasaray - Fenerbahçe
    meetings: [
      {
        date: "2025-12-01",
        competition: "Trendyol Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Galatasaray",
        homeGoals: 1,
        awayGoals: 1,
      },
      {
        date: "2026-04-26",
        competition: "Trendyol Süper Lig",
        homeTeam: "Galatasaray",
        awayTeam: "Fenerbahçe",
        homeGoals: 3,
        awayGoals: 0,
      },
    ],
    summary: { played: 2, homeTeamWins: 1, draws: 1, awayTeamWins: 0 },
  },
  "s2|s3": {
    // Fenerbahçe - Beşiktaş
    meetings: [
      {
        date: "2025-11-02",
        competition: "Trendyol Süper Lig",
        homeTeam: "Beşiktaş",
        awayTeam: "Fenerbahçe",
        homeGoals: 2,
        awayGoals: 3,
      },
      {
        date: "2025-12-23",
        competition: "Türkiye Kupası",
        homeTeam: "Fenerbahçe",
        awayTeam: "Beşiktaş",
        homeGoals: 1,
        awayGoals: 2,
      },
      {
        date: "2026-04-05",
        competition: "Trendyol Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Beşiktaş",
        homeGoals: 1,
        awayGoals: 0,
      },
    ],
    summary: { played: 3, homeTeamWins: 2, draws: 0, awayTeamWins: 1 },
  },
  "s1|s3": {
    // Galatasaray - Beşiktaş
    meetings: [
      {
        date: "2026-03-07",
        competition: "Trendyol Süper Lig",
        homeTeam: "Beşiktaş",
        awayTeam: "Galatasaray",
        homeGoals: 0,
        awayGoals: 1,
      },
    ],
    summary: { played: 1, homeTeamWins: 1, draws: 0, awayTeamWins: 0 },
  },
  "s1|s4": {
    // Galatasaray - Trabzonspor
    meetings: [
      {
        date: "2026-04-04",
        competition: "Trendyol Süper Lig",
        homeTeam: "Trabzonspor",
        awayTeam: "Galatasaray",
        homeGoals: 2,
        awayGoals: 1,
      },
    ],
    summary: { played: 1, homeTeamWins: 0, draws: 0, awayTeamWins: 1 },
  },
  "s2|s4": {
    // Fenerbahçe - Trabzonspor
    meetings: [
      {
        date: "2025-09-14",
        competition: "Trendyol Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Trabzonspor",
        homeGoals: 1,
        awayGoals: 0,
      },
      {
        date: "2026-02-14",
        competition: "Trendyol Süper Lig",
        homeTeam: "Trabzonspor",
        awayTeam: "Fenerbahçe",
        homeGoals: 2,
        awayGoals: 3,
      },
    ],
    summary: { played: 2, homeTeamWins: 2, draws: 0, awayTeamWins: 0 },
  },
};

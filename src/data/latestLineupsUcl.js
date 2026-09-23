// 2026-27 UEFA Şampiyonlar Ligi Lig Fazı 1. Hafta -- takımların o maçta
// GERÇEKTEN SAHAYA ÇIKTIĞI diziliş (formation), src/data/actualLineups.js
// içindeki oyuncu isimleriyle eşleşecek şekilde araştırıldı (2026-09-23
// itibarıyla MD1 hâlâ en güncel oynanmış UCL haftası -- MD2 henüz
// oynanmadı).
//
// Amaç: src/components/ProbableLineup.jsx'in kadro gücüne göre ürettiği
// OTOMATİK diziliş yerine, gerçek MD1 ilk 11'ini gerçek diziliş şekliyle
// sahaya yerleştirebilmek (bkz. src/state/DreamTeamContext.jsx'teki
// FORMATIONS -- sadece "4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3"
// desteklenir).
//
// Kaynak metodu: her maç için en az bir "confirmed lineups" maç raporu
// (khelnow.com, WhoScored, Oddschecker, Sunday Guardian Live, Managing
// Madrid/Yahoo Sports, Barca Universal, Bulinews) bulundu VE o kaynağın
// verdiği isim listesi src/data/actualLineups.js'teki homeXI/awayXI ile
// (sırası fark etse bile) BİREBİR karşılaştırılarak doğrulandı. İsimler
// örtüşmüyorsa (ör. maç önizleme/"predicted lineup" sayfaları, ya da farklı
// bir maçla karışan oyuncu isimleri) o kaynak reddedildi.
//
// Gerçek diziliş, desteklenen 5 şekilden biriyle birebir aynı GK/DF/MF/FW
// slot dağılımına sahip değilse, o takım BU LİSTEYE ALINMADI (uydurma
// eşleme yapılmadı) -- bkz. aşağıdaki Borussia Dortmund notu.
//
// Format: { matchId, formation, source }.
export const LATEST_LINEUP_UCL = {
  // r1m0: AEK Athens 1-0 LASK (8 Eylül 2026)
  "AEK Athens": {
    matchId: "r1m0",
    formation: "4-4-2",
    source: "khelnow.com confirmed lineups (Sofascore/WhoScored çapraz doğrulama)",
  },
  // LASK'ın gerçek 11.si (Bogarde) actualLineups.js'te doğrulanamadığı için
  // orada eksik bırakılmış; ama diziliş şekli (3-5-2) bağımsız kaynaktan
  // net biçimde teyit edildi.
  LASK: {
    matchId: "r1m0",
    formation: "3-5-2",
    source: "khelnow.com confirmed lineups",
  },

  // r1m1: Club Brugge 2-3 Aston Villa (8 Eylül 2026)
  "Club Brugge": {
    matchId: "r1m1",
    formation: "4-2-3-1",
    source: "khelnow.com confirmed lineups",
  },
  "Aston Villa": {
    matchId: "r1m1",
    formation: "4-2-3-1",
    source: "khelnow.com confirmed lineups",
  },

  // r1m2: Borussia Dortmund 3-2 Villarreal (8 Eylül 2026)
  // NOT: Borussia Dortmund KASITLI OLARAK bu listede YOK -- Kovac'ın 3
  // stoperli sistemi kaynaklara göre 3-4-2-1/3-4-1-2/3-5-2 arasında
  // değişkenlik gösteriyor ve hiçbiri desteklenen 5 dizilişten herhangi
  // birinin GK/DF/MF/FW slot sayısıyla birebir örtüşmüyor (3-4-2-1 ->
  // DF3/MF6/FW1 gibi okunursa hiçbir şablona uymuyor) -- uydurma bir
  // eşleme yapmak yerine boş bırakıldı.
  Villarreal: {
    matchId: "r1m2",
    formation: "4-4-2",
    source: "Oddschecker confirmed lineups",
  },

  // r1m3: FC Porto 0-2 Manchester City (8 Eylül 2026)
  "FC Porto": {
    matchId: "r1m3",
    formation: "4-3-3",
    source: "Sunday Guardian Live confirmed lineups",
  },
  "Manchester City": {
    matchId: "r1m3",
    formation: "4-2-3-1",
    source: "Sunday Guardian Live confirmed lineups",
  },

  // r1m4: Lille 2-3 Real Betis (8 Eylül 2026)
  Lille: {
    matchId: "r1m4",
    formation: "4-2-3-1",
    source: "WhoScored + Sky Sports confirmed lineups",
  },
  "Real Betis": {
    matchId: "r1m4",
    formation: "4-3-3",
    source: "WhoScored + Sky Sports confirmed lineups",
  },

  // r1m5: Real Madrid 2-1 Inter (8 Eylül 2026)
  "Real Madrid": {
    matchId: "r1m5",
    formation: "4-3-3",
    source: "Managing Madrid + Yahoo Sports confirmed lineups",
  },
  Inter: {
    matchId: "r1m5",
    formation: "3-5-2",
    source: "Managing Madrid + Yahoo Sports confirmed lineups",
  },

  // r1m6: Barcelona 5-1 Feyenoord (8 Eylül 2026)
  Barcelona: {
    matchId: "r1m6",
    formation: "4-3-3",
    source: "WhoScored + Barca Universal confirmed lineups",
  },
  Feyenoord: {
    matchId: "r1m6",
    formation: "4-2-3-1",
    source: "WhoScored + Barca Universal confirmed lineups",
  },

  // r1m7: VfB Stuttgart 3-1 Viking (9 Eylül 2026)
  "VfB Stuttgart": {
    matchId: "r1m7",
    formation: "4-2-3-1",
    source: "WhoScored + Bulinews confirmed lineups",
  },
  Viking: {
    matchId: "r1m7",
    formation: "4-3-3",
    source: "WhoScored + Bulinews confirmed lineups",
  },

  // r1m8: Liverpool 2-1 Atletico Madrid (9 Eylül 2026)
  Liverpool: {
    matchId: "r1m8",
    formation: "4-2-3-1",
    source: "khelnow.com confirmed lineups",
  },
  "Atletico Madrid": {
    matchId: "r1m8",
    formation: "4-4-2",
    source: "WhoScored confirmed lineups",
  },
};

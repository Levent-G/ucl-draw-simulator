// 2026-27 UEFA Şampiyonlar Ligi Lig Fazı 1. Hafta -- OYNANMIŞ maçlarda
// takımların SAHAYA GERÇEKTEN ÇIKARDIĞI ilk 11'ler (olasılık tahmini DEĞİL).
//
// Bu dosya, src/components/ProbableLineup.jsx'in ürettiği "kadro gücüne göre
// otomatik oluşturulmuş örnek diziliş" ile KARIŞTIRILMAMALIDIR -- buradaki
// her kayıt, maçın gerçekten oynandığı ilk 11'i temsil eder ve en az iki
// bağımsız kaynaktan (ör. ESPN Lineups sekmesi + Sofascore/UEFA.com/WhoScored
// veya yazılı bir maç raporu) çapraz doğrulanmıştır.
//
// Format: { matchId, homeXI: [11 isim], awayXI: [11 isim], source }.
// `homeXI`/`awayXI` alanları OPSİYONELDİR -- bir takımın ilk 11'i güvenilir
// şekilde doğrulanamadıysa (tek kaynak, kaynaklar arası çelişki, ya da
// yapılandırılmış bir kadro sayfası bulunamadı) o taraf BU DİZİDEN TAMAMEN
// ÇIKARILIR (uydurma/tahmini bir isim eklenmez) -- src/pages/
// RealMatchCenterView.jsx bu durumda o taraf için otomatik olarak
// <ProbableLineup>'a (olasılık tahminine) geri döner.
//
// İsimler, src/data/players.js'teki yerel kadro isimlendirme tarzına uygun,
// oyuncunun uluslararası spor medyasında yaygın kullanılan adıdır. Bazı
// isimler players.js'in (kasıtlı olarak kısaltılmış) kadrosunda YOKTUR --
// bu beklenen bir durumdur; src/components/ActualLineup.jsx bu isimleri
// avatar/rating/link OLMADAN düz metin olarak gösterir, asla sessizce atmaz.
//
// NOT: Bu dosya araştırma tamamlanırken kademeli olarak dolduruldu (2026-09-10).
export const ACTUAL_LINEUPS = [
  {
    matchId: "r1m0", // AEK Athens 1-0 LASK
    homeXI: ["Brignoli", "Rota", "Moukoudi", "Filipe Relvas", "Pilios", "Majer", "Vitális", "Marin", "Koïta", "Varga", "Jović"],
    // LASK için sadece 10 isim doğrulanabildi (kaynaklar 11. oyuncuda uyuşmadı)
    // -- 11. ismi UYDURMAK yerine eksik bırakıldı, ActualLineup.jsx bu slotu
    // boş gösterir.
    awayXI: ["Jungwirth", "Andrade", "Mbuyamba", "Alemão", "Bello", "Jørgensen", "Ljubičić", "Horvath", "Usor", "Lang"],
    source: "ESPN Lineups + khelnow.com",
  },
  {
    matchId: "r1m1", // Club Brugge 2-3 Aston Villa
    homeXI: ["Sommer", "Sabbe", "Han-Beom Lee", "Mechele", "Seys", "Potts", "Vanaken", "Carlos Forbs", "Vetlesen", "Virgili", "Tresoldi"],
    awayXI: ["Suzuki", "Wan-Bissaka", "Lindelöf", "Torres", "Maatsen", "Kamara", "Gomes", "McGinn", "Buendía", "Hemmings", "Jackson"],
    source: "Sky Sports Teams + khelnow.com",
  },
  {
    matchId: "r1m2", // Borussia Dortmund 3-2 Villarreal
    homeXI: ["Kobel", "Gadou", "Anton", "Svensson", "Ryerson", "Veerman", "Sabitzer", "Nmecha", "Karetsas", "Beier", "Guirassy"],
    awayXI: ["Gulácsi", "Mouriño", "Navarro", "Veiga", "Cardona", "Comesaña", "Gueye", "Buchanan", "Saliba", "Oluwaseyi", "Mikautadze"],
    source: "ESPN Lineups + khelnow.com",
  },
  {
    matchId: "r1m3", // FC Porto 0-2 Manchester City
    homeXI: ["Diogo Costa", "Alberto Costa", "Nehuén Pérez", "Jakub Kiwior", "Martim Fernandes", "Pablo Rosario", "Alan Varela", "Gabriel Veiga", "William Gomes", "André Silva", "Pepê"],
    awayXI: ["Gianluigi Donnarumma", "Matheus Nunes", "Marc Guéhi", "Rúben Dias", "Joško Gvardiol", "Bouaddi", "Enzo Fernández", "Phil Foden", "Rayan Cherki", "Antoine Semenyo", "Erling Haaland"],
    source: "Sky Sports Teams + ESPN Lineups",
  },
  {
    matchId: "r1m4", // Lille 2-3 Real Betis
    homeXI: ["Berke Özer", "Tiago Santos", "Nathan Ngoy", "Alexsandro", "Romain Perraud", "Benjamin André", "Nabil Bentaleb", "Ethan Mbappé", "Hákon Haraldsson", "Gaëtan Perrin", "Ayase Ueda"],
    awayXI: ["Álvaro Vallés", "Héctor Bellerín", "Marc Bartra", "Natan", "Júnior Firpo", "Pablo Fornals", "Facundo Bernal", "Antony", "Isco", "Rodrigo Riquelme", "Troy Parrott"],
    source: "Sky Sports Teams + WhoScored/ysscores",
  },
  {
    matchId: "r1m5", // Real Madrid 2-1 Inter
    homeXI: ["Thibaut Courtois", "Denzel Dumfries", "Ibrahima Konaté", "Dean Huijsen", "Marc Cucurella", "Trent Alexander-Arnold", "Federico Valverde", "Jude Bellingham", "Brahim Díaz", "Vinícius Júnior", "Kylian Mbappé"],
    awayXI: ["Josep Martínez", "Benjamin Pavard", "Yann Bisseck", "Alessandro Bastoni", "Andy Diouf", "Nicolò Barella", "Hakan Çalhanoğlu", "Curtis Jones", "Carlos Augusto", "Lautaro Martínez", "Marcus Thuram"],
    source: "Sky Sports Teams + Yahoo Sports",
  },
  {
    matchId: "r1m6", // Barcelona 5-1 Feyenoord
    homeXI: ["Joan García", "Jules Koundé", "Pau Cubarsí", "Andreas Christensen", "João Cancelo", "Pedri", "Rodri", "Dani Olmo", "Lamine Yamal", "Raphinha", "Karim Adeyemi"],
    awayXI: ["Tjark Ernst", "Givairo Read", "Jeremiah St. Juste", "Tsuyoshi Watanabe", "Mika Mármol", "Gjivai Zechiël", "Charles Vanhoutte", "Anis Hadj Moussa", "Luciano Valente", "Javi López", "Nacho Ferri"],
    source: "khelnow.com + Fotmob",
  },
  {
    matchId: "r1m7", // VfB Stuttgart 3-1 Viking
    homeXI: ["Fabian Bredlow", "Finn Jeltsch", "Jeff Chabot", "Maximilian Mittelstädt", "Jamie Leweling", "Grischa Prömel", "Angelo Stiller", "Chris Führich", "Deniz Undav", "Bilal El Khannouss", "Ermedin Demirović"],
    awayXI: ["Arild Østbø", "Henrik Heggheim", "Gianni Stensness", "Jesper Daland", "Kristoffer Haugen", "Tobias Moi", "Joe Bell", "Kristoffer Askildsen", "Henrik Rørvik Bjørdal", "Peter Christiansen", "Zlatko Tripić"],
    source: "ESPN Lineups + Fotmob",
  },
  {
    matchId: "r1m8", // Liverpool 2-1 Atletico Madrid
    homeXI: ["Alisson Becker", "Ronald Araújo", "Virgil van Dijk", "Jérémy Jacquet", "Miloš Kerkez", "Dominik Szoboszlai", "Alexis Mac Allister", "Bradley Barcola", "Florian Wirtz", "Rio Ngumoha", "Alexander Isak"],
    awayXI: ["Jan Oblak", "Marc Pubill", "Cristian Romero", "David Hancko", "Marcos Llorente", "Koke", "Pablo Barrios", "Álex Baena", "Kang-In Lee", "Giuliano Simeone", "Julián Álvarez"],
    source: "ESPN + heavy.com + Fotmob",
  },
];

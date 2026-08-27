// UEFA Avrupa Ligi Lig Fazı ("İsviçre modeli") - takım verisi
// 36 takım, 4 torba (Pot), her torbada 9 takım. Sıralama kulüp katsayısına göredir.
//
// NOT: 2026-27 sezonu 36 takımının TAMAMI Ağustos 2026 itibarıyla web'den
// (Wikipedia "2026-27 UEFA Europa League/qualifying" sayfaları, UEFA.com,
// ESPN, güncel haber kaynakları) araştırılan GERÇEK katılımcılara göre
// GÜNCELLENMİŞTİR -- önceki 36 takımın TAMAMI (Tottenham, Rangers, Lazio,
// Genk, FCSB, Malmö, Nice, Rijeka, Elfsborg, Viktoria Plzeň, vb.) araştırma
// yapılmadan yazılmış "kulağa gerçekçi gelen" bir yer tutucu listeydi ve
// gerçek 2026-27 katılımcılarıyla örtüşmüyordu.
//
// Doğrulanan 36 takım üç kaynaktan oluşuyor:
//  1) Ülke bazlı doğrudan katılımcılar (13): İngiltere 3 (Crystal Palace
//     -Konferans Ligi şampiyonu-, Bournemouth, Sunderland), İtalya 2 (Milan,
//     Juventus), İspanya 2 (Real Sociedad -Kral Kupası-, Celta Vigo),
//     Almanya 2 (Hoffenheim, Bayer Leverkusen), Fransa 2 (Marsilya, Rennes),
//     Hollanda 1 (AZ Alkmaar -Kupa-), Portekiz 1 (Torreense -Kupa-, 2.
//     ligden bir kulüp).
//  2) Şampiyonlar Ligi elemelerinden inen takımlar (11): play-off turunu
//     kaybedenler (Union Saint-Gilloise, Sparta Prag, Olympiacos, Sturm
//     Graz, AEK Athens, Celtic, Viking, Celje, Hapoel Beer Sheva, NEC
//     Nijmegen, Lyon -- ŞL play-off turunun 7 eşleşmesinin TAMAMININ
//     kaybedenleri + ŞL 3. eleme turundan inen birkaç takım).
//  3) Avrupa Ligi play-off turunu (20/27 Ağustos 2026) kazanan 12 takım:
//     Ferencváros (Trabzonspor'u eledi), Egnatia (Lillestrøm'ü 6-4 topladı
//     eledi), Jagiellonia Białystok, Lech Poznań, OFI Girit, Crvena Zvezda
//     (Viktoria Plzeň'i 3-0 eledi), Red Bull Salzburg, Anderlecht, Benfica,
//     Beşiktaş, Sint-Truiden -- BU 10'u YÜKSEK GÜVEN. Universitatea Craiova
//     ile FC Ararat-Armenia arasındaki eşleşme, bu araştırmanın yapıldığı an
//     itibarıyla ikinci maç henüz oynanmamıştı/sonuç kaynaklara yansımamıştı;
//     Craiova best-effort (düşük güven, kura günü doğrulanmalı) olarak
//     seçilmiştir.
//
// Torba (pot) dağılımı: UEFA'nın resmi Pot 1-4 tablosuna tam erişilemedi
// (uefa.com bu oturumda 403/503 döndürdü). Pot 1'in 7 üyesi (Bayer
// Leverkusen, Juventus, Milan, AZ Alkmaar, Olympiacos, Real Sociedad,
// Marsilya) haber kaynaklarınca teyit edildi; kalan tüm torba yerleşimi
// GERÇEKÇİ YAKLAŞIK kulüp katsayısı sırasına göre best-effort uygulanmıştır
// (ör. Benfica/Beşiktaş -> Pot 1; Crvena Zvezda/Lyon gibi tarihî büyük
// kulüpler orta torbalara; en küçük katsayılı yeni katılımcılar Pot 4'e).
// Gerçek çekiliş öncesi kesin torba sırası değişebilir.
//
// logo: projede zaten bulunan (kullanıcının sağladığı) amblem dosyalarından
// eşleşenler içe aktarılır. Bazı ülkeler/kulüpler için amblem paketi
// projede yok (Macaristan, Arnavutluk, Ermenistan/Romanya bazı kulüpler,
// Slovenya, Torreense -alt lig- gibi) -- o takımlarda `logo` alanı atlanır
// ve Crest.jsx otomatik olarak kendi oluşturduğu SVG rozete geri döner.

import ACMilanLogo from "../assets/logos/Italy - Serie A/AC Milan.png";
import JuventusLogo from "../assets/logos/Italy - Serie A/Juventus FC.png";
import BayerLeverkusenLogo from "../assets/logos/Germany - Bundesliga/Bayer 04 Leverkusen.png";
import BenficaLogo from "../assets/logos/Portugal - Liga Portugal/SL Benfica.png";
import RealSociedadLogo from "../assets/logos/Spain - LaLiga/Real Sociedad.png";
import OlympiqueMarseilleLogo from "../assets/logos/France - Ligue 1/Olympique Marseille.png";
import OlympiacosLogo from "../assets/logos/Greece - Super League 1/Olympiacos Piraeus.png";
import AZAlkmaarLogo from "../assets/logos/Netherlands - Eredivisie/AZ Alkmaar.png";
import BesiktasLogo from "../assets/logos/Türkiye - Süper Lig/Besiktas JK.png";

import OlympiqueLyonLogo from "../assets/logos/France - Ligue 1/Olympique Lyon.png";
import StadeRennaisLogo from "../assets/logos/France - Ligue 1/Stade Rennais FC.png";
import CelticLogo from "../assets/logos/Scotland - Scottish Premiership/Celtic FC.png";
import ACSpartaPragueLogo from "../assets/logos/Czech Republic - Chance Liga/AC Sparta Prague.png";
import SKSturmGrazLogo from "../assets/logos/Austria - Bundesliga/SK Sturm Graz.png";
import RSCAnderlechtLogo from "../assets/logos/Belgium - Jupiler Pro League/RSC Anderlecht.png";
import CrystalPalaceLogo from "../assets/logos/England - Premier League/Crystal Palace.png";
import AFCBournemouthLogo from "../assets/logos/England - Premier League/AFC Bournemouth.png";
import SunderlandLogo from "../assets/logos/England - Premier League/Sunderland AFC.png";

import CeltaVigoLogo from "../assets/logos/Spain - LaLiga/Celta de Vigo.png";
import TSGHoffenheimLogo from "../assets/logos/Germany - Bundesliga/TSG 1899 Hoffenheim.png";
import AEKAthensLogo from "../assets/logos/Greece - Super League 1/AEK Athens.png";
import UnionSaintGilloiseLogo from "../assets/logos/Belgium - Jupiler Pro League/Union Saint-Gilloise.png";
import RedBullSalzburgLogo from "../assets/logos/Austria - Bundesliga/Red Bull Salzburg.png";
import SintTruidenLogo from "../assets/logos/Belgium - Jupiler Pro League/Sint-Truidense VV.png";
import HapoelBeerShevaLogo from "../assets/logos/Israel - Ligat ha'Al/Hapoel Beer Sheva.png";
import NECNijmegenLogo from "../assets/logos/Netherlands - Eredivisie/NEC Nijmegen.png";
import UniversitateaCraiovaLogo from "../assets/logos/Romania - SuperLiga/CS Universitatea Craiova.png";

import CrvenaZvezdaLogo from "../assets/logos/Serbia - Super liga Srbije/Red Star Belgrade.png";
import JagiellonaLogo from "../assets/logos/Poland - PKO BP Ekstraklasa/Jagiellonia Bialystok.png";
import LechPoznanLogo from "../assets/logos/Poland - PKO BP Ekstraklasa/Lech Poznan.png";
import VikingFKLogo from "../assets/logos/Norway - Eliteserien/Viking FK.png";
import OFICreteLogo from "../assets/logos/Greece - Super League 1/OFI Crete FC.png";

export const EUROPA_COUNTRY_NAMES = {
  ENG: "İngiltere",
  ITA: "İtalya",
  NED: "Hollanda",
  ESP: "İspanya",
  FRA: "Fransa",
  SCO: "İskoçya",
  TUR: "Türkiye",
  GER: "Almanya",
  POR: "Portekiz",
  BEL: "Belçika",
  GRE: "Yunanistan",
  HUN: "Macaristan",
  ROU: "Romanya",
  SWE: "İsveç",
  CRO: "Hırvatistan",
  CZE: "Çekya",
  BUL: "Bulgaristan",
  FIN: "Finlandiya",
  POL: "Polonya",
  MDA: "Moldova",
  LAT: "Letonya",
  DEN: "Danimarka",
  AUT: "Avusturya",
  ISR: "İsrail",
  SRB: "Sırbistan",
  NOR: "Norveç",
  SVN: "Slovenya",
  ALB: "Arnavutluk",
  ARM: "Ermenistan",
};

// pot: 1-4, coeff: gösterim amaçlı UEFA kulüp katsayısı (yaklaşık, kurgusal)
const RAW_EUROPA_TEAMS = [
  // ---- Pot 1 ---- (ilk 7'si haber kaynaklarınca teyit edildi; Benfica ve
  // Beşiktaş -- ŞL 3. eleme turundan düşüp AL play-off turunu kazanan iki
  // büyük kulüp -- katsayı bakımından en mantıklı 2 ek Pot 1 adayı olarak
  // best-effort eklendi.)
  { name: "AC Milan", short: "MIL", country: "ITA", pot: 1, coeff: 68.0, logo: ACMilanLogo },
  { name: "Juventus", short: "JUV", country: "ITA", pot: 1, coeff: 65.0, logo: JuventusLogo },
  { name: "Bayer Leverkusen", short: "B04", country: "GER", pot: 1, coeff: 63.0, logo: BayerLeverkusenLogo },
  {
    // AL play-off Turu'nu (Benfica 3-1 Aarhus toplam) kazanarak lig fazına
    // katıldı -- Şampiyonlar Ligi 3. eleme turunda elenip Avrupa Ligi'ne
    // düştü.
    name: "Benfica",
    short: "BEN",
    country: "POR",
    pot: 1,
    coeff: 61.0,
    logo: BenficaLogo,
  },
  { name: "Real Sociedad", short: "RSO", country: "ESP", pot: 1, coeff: 57.0, logo: RealSociedadLogo },
  { name: "Olympique Marseille", short: "OM", country: "FRA", pot: 1, coeff: 55.0, logo: OlympiqueMarseilleLogo },
  {
    // Şampiyonlar Ligi play-off Turu'nu kaybederek lig fazına düştü.
    name: "Olympiacos",
    short: "OLY",
    country: "GRE",
    pot: 1,
    coeff: 52.0,
    logo: OlympiacosLogo,
  },
  { name: "AZ Alkmaar", short: "AZ", country: "NED", pot: 1, coeff: 49.0, logo: AZAlkmaarLogo },
  {
    // AL play-off Turu'nu (Beşiktaş 3-0 Kauno Žalgiris toplam) kazanarak lig
    // fazına katıldı -- Şampiyonlar Ligi 3. eleme turunda elenip Avrupa
    // Ligi'ne düştü.
    name: "Beşiktaş",
    short: "BJK",
    country: "TUR",
    pot: 1,
    coeff: 47.0,
    logo: BesiktasLogo,
  },

  // ---- Pot 2 ----
  {
    // Şampiyonlar Ligi play-off Turu'nu (Fenerbahçe 3-0 Lyon toplam)
    // kaybederek lig fazına düştü.
    name: "Olympique Lyonnais",
    short: "LYO",
    country: "FRA",
    pot: 2,
    coeff: 45.0,
    logo: OlympiqueLyonLogo,
  },
  { name: "Stade Rennais", short: "REN", country: "FRA", pot: 2, coeff: 43.0, logo: StadeRennaisLogo },
  {
    // Şampiyonlar Ligi play-off Turu'nu (LASK 5-4 Celtic toplam) kaybederek
    // lig fazına düştü.
    name: "Celtic",
    short: "CEL",
    country: "SCO",
    pot: 2,
    coeff: 41.0,
    logo: CelticLogo,
  },
  {
    // Şampiyonlar Ligi play-off Turu'nu kaybederek lig fazına düştü.
    name: "AC Sparta Prague",
    short: "ACS",
    country: "CZE",
    pot: 2,
    coeff: 39.0,
    logo: ACSpartaPragueLogo,
  },
  {
    // Şampiyonlar Ligi play-off Turu'nu kaybederek lig fazına düştü.
    name: "SK Sturm Graz",
    short: "STU",
    country: "AUT",
    pot: 2,
    coeff: 37.0,
    logo: SKSturmGrazLogo,
  },
  {
    // AL play-off Turu'nu (Anderlecht 3-0 Kairat toplam) kazanarak lig
    // fazına katıldı.
    name: "Anderlecht",
    short: "AND",
    country: "BEL",
    pot: 2,
    coeff: 35.0,
    logo: RSCAnderlechtLogo,
  },
  { name: "Crystal Palace", short: "CRY", country: "ENG", pot: 2, coeff: 34.0, logo: CrystalPalaceLogo },
  { name: "Bournemouth", short: "BOU", country: "ENG", pot: 2, coeff: 32.0, logo: AFCBournemouthLogo },
  { name: "Sunderland", short: "SUN", country: "ENG", pot: 2, coeff: 31.0, logo: SunderlandLogo },

  // ---- Pot 3 ----
  { name: "Celta Vigo", short: "CEL", country: "ESP", pot: 3, coeff: 29.0, logo: CeltaVigoLogo },
  { name: "TSG Hoffenheim", short: "TSG", country: "GER", pot: 3, coeff: 28.0, logo: TSGHoffenheimLogo },
  {
    // Şampiyonlar Ligi play-off Turu'nu (Levski Sofia 2-0 AEK Athens
    // toplam) kaybederek lig fazına düştü.
    name: "AEK Athens",
    short: "AEK",
    country: "GRE",
    pot: 3,
    coeff: 27.0,
    logo: AEKAthensLogo,
  },
  {
    // Şampiyonlar Ligi play-off Turu'nu kaybederek lig fazına düştü.
    name: "Union Saint-Gilloise",
    short: "USG",
    country: "BEL",
    pot: 3,
    coeff: 26.0,
    logo: UnionSaintGilloiseLogo,
  },
  {
    // AL play-off Turu'nu (Red Bull Salzburg 2-1 Mjällby AIF toplam)
    // kazanarak lig fazına katıldı.
    name: "Red Bull Salzburg",
    short: "RBS",
    country: "AUT",
    pot: 3,
    coeff: 25.0,
    logo: RedBullSalzburgLogo,
  },
  {
    // AL play-off Turu'nu (Sint-Truiden 1-0 Omonia toplam) kazanarak lig
    // fazına katıldı -- Belçika'nın Union Saint-Gilloise ve Anderlecht'ten
    // sonraki 3. temsilcisi.
    name: "Sint-Truiden",
    short: "STVV",
    country: "BEL",
    pot: 3,
    coeff: 23.0,
    logo: SintTruidenLogo,
  },
  {
    // Şampiyonlar Ligi play-off Turu'nu (Sabah 6-4 Hapoel Beer Sheva
    // toplam) kaybederek lig fazına düştü.
    name: "Hapoel Beer Sheva",
    short: "HBS",
    country: "ISR",
    pot: 3,
    coeff: 22.0,
    logo: HapoelBeerShevaLogo,
  },
  {
    // Şampiyonlar Ligi play-off Turu'nu (Bodø/Glimt 6-1 NEC Nijmegen
    // toplam) kaybederek lig fazına düştü.
    name: "NEC Nijmegen",
    short: "NEC",
    country: "NED",
    pot: 3,
    coeff: 21.0,
    logo: NECNijmegenLogo,
  },
  {
    // AL play-off Turu'nda FC Ararat-Armenia'ya karşı (ilk maç 1-1 berabere)
    // -- BEST-EFFORT/DÜŞÜK GÜVEN: ikinci maç sonucu bu araştırmanın
    // yapıldığı anda kaynaklara yansımamıştı, kura günü doğrulanmalı.
    name: "Universitatea Craiova",
    short: "UCR",
    country: "ROU",
    pot: 3,
    coeff: 20.0,
    logo: UniversitateaCraiovaLogo,
  },

  // ---- Pot 4 ----
  {
    // AL play-off Turu'nu (Crvena Zvezda 3-0 Viktoria Plzeň toplam)
    // kazanarak lig fazına katıldı -- eski Viktoria Plzeň placeholder'ının
    // yerini alıyor (Viktoria Plzeň bu sefer play-off'u geçemedi).
    name: "Crvena Zvezda",
    short: "CZV",
    country: "SRB",
    pot: 4,
    coeff: 19.0,
    logo: CrvenaZvezdaLogo,
  },
  {
    // AL play-off Turu'nu (Ferencváros 1-0 Trabzonspor toplam) kazanarak
    // lig fazına katıldı.
    name: "Ferencváros",
    short: "FTC",
    country: "HUN",
    pot: 4,
    coeff: 18.0,
  },
  {
    // AL play-off Turu'nu (Lech Poznań 7-0 Thun toplam) kazanarak lig
    // fazına katıldı.
    name: "Lech Poznań",
    short: "LEC",
    country: "POL",
    pot: 4,
    coeff: 17.0,
    logo: LechPoznanLogo,
  },
  {
    name: "Jagiellonia Białystok",
    short: "JAG",
    country: "POL",
    pot: 4,
    coeff: 16.0,
    logo: JagiellonaLogo,
  },
  {
    // Şampiyonlar Ligi Lig Yolu 3. eleme turunda elenip Avrupa Ligi'ne
    // düştü (Dinamo Zagreb - Viking eşleşmesinin kaybedeni).
    name: "Viking FK",
    short: "VIK",
    country: "NOR",
    pot: 4,
    coeff: 15.0,
    logo: VikingFKLogo,
  },
  {
    // AL play-off Turu'nu (OFI Girit 3-0 CSKA Sofia toplam) kazanarak lig
    // fazına katıldı.
    name: "OFI Crete",
    short: "OFI",
    country: "GRE",
    pot: 4,
    coeff: 14.0,
    logo: OFICreteLogo,
  },
  {
    name: "NK Celje",
    short: "CEJ",
    country: "SVN",
    pot: 4,
    coeff: 13.0,
  },
  {
    // Taça de Portugal (Portekiz Kupası) şampiyonu olarak lig fazına direkt
    // katıldı -- 2. ligde (Liga Portugal 2) oynayan bir kulüp.
    name: "Torreense",
    short: "TOR",
    country: "POR",
    pot: 4,
    coeff: 12.0,
  },
  {
    // AL play-off Turu'nu (Egnatia 6-4 Lillestrøm toplam) kazanarak lig
    // fazına katıldı -- Arnavutluk'un lig fazına ulaşan ilk temsilcisi.
    name: "Egnatia",
    short: "EGN",
    country: "ALB",
    pot: 4,
    coeff: 10.0,
  },
];

export const EUROPA_TEAMS = RAW_EUROPA_TEAMS.map((t, i) => ({
  id: `e${i + 1}`,
  ...t,
}));

export const EUROPA_POT_COLORS = {
  1: { main: "#5b9dff", dim: "#16264d", label: "Torba 1" },
  2: { main: "#38bdf8", dim: "#123045", label: "Torba 2" },
  3: { main: "#22d3ee", dim: "#0e3a42", label: "Torba 3" },
  4: { main: "#2dd4bf", dim: "#0e3a36", label: "Torba 4" },
};

export function getEuropaTeamsByPot(pot) {
  return EUROPA_TEAMS.filter((t) => t.pot === pot);
}

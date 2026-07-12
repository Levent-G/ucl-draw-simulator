// UEFA Şampiyonlar Ligi Lig Fazı (2024/25 formatı ile başlayan "İsviçre modeli")
// 36 takım, 4 torba (Pot), her torbada 9 takım. Sıralama kulüp katsayısına göredir.
//
// NOT: Bu liste gerçek bir sezonun birebir kopyası olmak zorunda değildir; format ve
// kurallar UEFA'nın gerçek lig fazı çekilişiyle birebir aynı çalışacak şekilde
// tasarlanmıştır. İstersen bu dosyayı güncel sezonun gerçek katılımcı/katsayı
// listesiyle değiştirebilirsin — algoritma ve arayüz otomatik olarak uyum sağlar.
//
// logo: /public/logos/ altında bulunması beklenen dosya yolu (kendi lisanslı
// logo dosyalarını bu isimlerle ekleyince Crest.jsx otomatik olarak kullanır;
// dosya yoksa özgün SVG rozete geri döner).
import RealMadridLogo from "../assets/logos/Spain - LaLiga/Real Madrid.png";
import ManchesterCityLogo from "../assets/logos/England - Premier League/Manchester City.png";
import BayernMunihLogo from "../assets/logos/Germany - Bundesliga/Bayern Munich.png";
import ParisSaintGermainLogo from "../assets/logos/France - Ligue 1/Paris Saint-Germain.png";
import LiverpoolLogo from "../assets/logos/England - Premier League/Liverpool FC.png";
import InterLogo from "../assets/logos/Italy - Serie A/Inter Milan.png";
import BarcelonaLogo from "../assets/logos/Spain - LaLiga/FC Barcelona.png";
import BayerLeverkusenLogo from "../assets/logos/Germany - Bundesliga/Bayer 04 Leverkusen.png";
import AtalantaLogo from "../assets/logos/Italy - Serie A/Atalanta BC.png";

import AtleticoMadridLogo from "../assets/logos/Spain - LaLiga/Atlético de Madrid.png";
import ArsenalLogo from "../assets/logos/England - Premier League/Arsenal FC.png";
import BorussiaDortmundLogo from "../assets/logos/Germany - Bundesliga/Borussia Dortmund.png";
import ACMilanLogo from "../assets/logos/Italy - Serie A/AC Milan.png";
import JuventusLogo from "../assets/logos/Italy - Serie A/Juventus FC.png";
import BenficaLogo from "../assets/logos/Portugal - Liga Portugal/SL Benfica.png";
import FeyenoordLogo from "../assets/logos/Netherlands - Eredivisie/Feyenoord Rotterdam.png";
import ClubBruggeLogo from "../assets/logos/Belgium - Jupiler Pro League/Club Brugge KV.png";
import ShakhtarLogo from "../assets/logos/Ukraine - Premier Liga/Shakhtar Donetsk.png";

import GironaLogo from "../assets/logos/Spain - LaLiga/Girona FC.png";
import AstonVillaLogo from "../assets/logos/England - Premier League/Aston Villa.png";
import StuttgartLogo from "../assets/logos/Germany - Bundesliga/VfB Stuttgart.png";
import MonacoLogo from "../assets/logos/France - Ligue 1/AS Monaco.png";
import SportingLogo from "../assets/logos/Portugal - Liga Portugal/Sporting CP.png";
import PSVLogo from "../assets/logos/Netherlands - Eredivisie/PSV Eindhoven.png";
import CelticLogo from "../assets/logos/Scotland - Scottish Premiership/Celtic FC.png";
import YoungBoysLogo from "../assets/logos/Switzerland - Super League/BSC Young Boys.png";
import SpartaPragueLogo from "../assets/logos/Czech Republic - Chance Liga/AC Sparta Prague.png";

import ChelseaLogo from "../assets/logos/England - Premier League/Chelsea FC.png";
import BrestLogo from "../assets/logos/France - Ligue 1/Stade Brestois 29.png";
import DinamoZagrebLogo from "../assets/logos/Croatia - SuperSport HNL/GNK Dinamo Zagreb.png";

import SturmGrazLogo from "../assets/logos/Austria - Bundesliga/SK Sturm Graz.png";
import BodoGlimtLogo from "../assets/logos/Norway - Eliteserien/FK BodøGlimt.png";
import GalatasarayLogo from "../assets/logos/Türkiye - Süper Lig/Galatasaray.png";
import QarabagLogo from "../assets/logos/Türkiye - Süper Lig/azerbaijan_qarabag.png";
import CrvenaZvezdaLogo from "../assets/logos/Serbia - Super liga Srbije/serbia_crvena-zvezda.png";
import SlovanBratislavaLogo from "../assets/logos/slovakia_s-bratislava.png";

export const COUNTRY_NAMES = {
  ESP: "İspanya",
  ENG: "İngiltere",
  GER: "Almanya",
  ITA: "İtalya",
  FRA: "Fransa",
  POR: "Portekiz",
  NED: "Hollanda",
  BEL: "Belçika",
  UKR: "Ukrayna",
  SCO: "İskoçya",
  SUI: "İsviçre",
  CZE: "Çekya",
  CRO: "Hırvatistan",
  SRB: "Sırbistan",
  SVK: "Slovakya",
  AUT: "Avusturya",
  NOR: "Norveç",
  TUR: "Türkiye",
  AZE: "Azerbaycan",
};

// pot: 1-4, coeff: gösterim amaçlı UEFA kulüp katsayısı (yaklaşık)
const RAW_TEAMS = [
  // ---- Pot 1 ----
  {
    name: "Real Madrid",
    short: "RMA",
    country: "ESP",
    pot: 1,
    coeff: 136.0,
    logo: RealMadridLogo,
  },
  {
    name: "Manchester City",
    short: "MCI",
    country: "ENG",
    pot: 1,
    coeff: 134.0,
    logo: ManchesterCityLogo,
  },
  {
    name: "Bayern Münih",
    short: "BAY",
    country: "GER",
    pot: 1,
    coeff: 128.0,
    logo: BayernMunihLogo,
  },
  {
    name: "Paris Saint-Germain",
    short: "PSG",
    country: "FRA",
    pot: 1,
    coeff: 119.0,
    logo: ParisSaintGermainLogo,
  },
  {
    name: "Liverpool",
    short: "LIV",
    country: "ENG",
    pot: 1,
    coeff: 112.0,
    logo: LiverpoolLogo,
  },
  {
    name: "Inter",
    short: "INT",
    country: "ITA",
    pot: 1,
    coeff: 108.0,
    logo: InterLogo,
  },
  {
    name: "Barcelona",
    short: "BAR",
    country: "ESP",
    pot: 1,
    coeff: 104.0,
    logo: BarcelonaLogo,
  },
  {
    name: "Bayer Leverkusen",
    short: "LEV",
    country: "GER",
    pot: 1,
    coeff: 98.0,
    logo: BayerLeverkusenLogo,
  },
  {
    name: "Atalanta",
    short: "ATA",
    country: "ITA",
    pot: 1,
    coeff: 91.0,
    logo: AtalantaLogo,
  },

  // ---- Pot 2 ----
  {
    name: "Atletico Madrid",
    short: "ATM",
    country: "ESP",
    pot: 2,
    coeff: 89.0,
    logo: AtleticoMadridLogo,
  },
  {
    name: "Arsenal",
    short: "ARS",
    country: "ENG",
    pot: 2,
    coeff: 87.0,
    logo: ArsenalLogo,
  },
  {
    name: "Borussia Dortmund",
    short: "BVB",
    country: "GER",
    pot: 2,
    coeff: 85.0,
    logo: BorussiaDortmundLogo,
  },
  {
    name: "AC Milan",
    short: "MIL",
    country: "ITA",
    pot: 2,
    coeff: 83.0,
    logo: ACMilanLogo,
  },
  {
    name: "Juventus",
    short: "JUV",
    country: "ITA",
    pot: 2,
    coeff: 81.0,
    logo: JuventusLogo,
  },
  {
    name: "Benfica",
    short: "BEN",
    country: "POR",
    pot: 2,
    coeff: 78.0,
    logo: BenficaLogo,
  },
  {
    name: "Feyenoord",
    short: "FEY",
    country: "NED",
    pot: 2,
    coeff: 71.0,
    logo: FeyenoordLogo,
  },
  {
    name: "Club Brugge",
    short: "CLB",
    country: "BEL",
    pot: 2,
    coeff: 65.0,
    logo: ClubBruggeLogo,
  },
  {
    name: "Shakhtar Donetsk",
    short: "SHK",
    country: "UKR",
    pot: 2,
    coeff: 63.0,
    logo: ShakhtarLogo,
  },

  // ---- Pot 3 ----
  {
    name: "Girona",
    short: "GIR",
    country: "ESP",
    pot: 3,
    coeff: 45.0,
    logo: GironaLogo,
  },
  {
    name: "Aston Villa",
    short: "AVL",
    country: "ENG",
    pot: 3,
    coeff: 43.0,
    logo: AstonVillaLogo,
  },
  {
    name: "VfB Stuttgart",
    short: "VFB",
    country: "GER",
    pot: 3,
    coeff: 41.0,
    logo: StuttgartLogo,
  },
  {
    name: "Monaco",
    short: "MON",
    country: "FRA",
    pot: 3,
    coeff: 39.0,
    logo: MonacoLogo,
  },
  {
    name: "Sporting CP",
    short: "SPO",
    country: "POR",
    pot: 3,
    coeff: 37.0,
    logo: SportingLogo,
  },
  {
    name: "PSV Eindhoven",
    short: "PSV",
    country: "NED",
    pot: 3,
    coeff: 35.0,
    logo: PSVLogo,
  },
  {
    name: "Celtic",
    short: "CEL",
    country: "SCO",
    pot: 3,
    coeff: 33.0,
    logo: CelticLogo,
  },
  {
    name: "Young Boys",
    short: "YB",
    country: "SUI",
    pot: 3,
    coeff: 29.0,
    logo: YoungBoysLogo,
  },
  {
    name: "Sparta Prag",
    short: "SPA",
    country: "CZE",
    pot: 3,
    coeff: 27.0,
    logo: SpartaPragueLogo,
  },

  // ---- Pot 4 ----
  {
    name: "Chelsea",
    short: "CHE",
    country: "ENG",
    pot: 4,
    coeff: 24.0,
    logo: ChelseaLogo,
  },
  {
    name: "Brest",
    short: "BRE",
    country: "FRA",
    pot: 4,
    coeff: 21.0,
    logo: BrestLogo,
  },
  {
    name: "Dinamo Zagreb",
    short: "DZG",
    country: "CRO",
    pot: 4,
    coeff: 19.0,
    logo: DinamoZagrebLogo,
  },
  {
    name: "Crvena Zvezda",
    short: "CZV",
    country: "SRB",
    pot: 4,
    coeff: 18.0,
    logo: CrvenaZvezdaLogo,
  },
  {
    name: "Slovan Bratislava",
    short: "SLO",
    country: "SVK",
    pot: 4,
    coeff: 16.0,
    logo: SlovanBratislavaLogo,
  },
  {
    name: "Sturm Graz",
    short: "STU",
    country: "AUT",
    pot: 4,
    coeff: 15.0,
    logo: SturmGrazLogo,
  },
  {
    name: "Bodø/Glimt",
    short: "BOD",
    country: "NOR",
    pot: 4,
    coeff: 14.0,
    logo: BodoGlimtLogo,
  },
  {
    name: "Galatasaray",
    short: "GAL",
    country: "TUR",
    pot: 4,
    coeff: 13.0,
    logo: GalatasarayLogo,
  },
  {
    name: "Qarabağ",
    short: "QAR",
    country: "AZE",
    pot: 4,
    coeff: 11.0,
    logo: QarabagLogo,
  },
];

export const TEAMS = RAW_TEAMS.map((t, i) => ({
  id: `t${i + 1}`,
  ...t,
}));

export const POT_COLORS = {
  1: { main: "#5b9dff", dim: "#16264d", label: "Torba 1" },
  2: { main: "#38bdf8", dim: "#123045", label: "Torba 2" },
  3: { main: "#22d3ee", dim: "#0e3a42", label: "Torba 3" },
  4: { main: "#2dd4bf", dim: "#0e3a36", label: "Torba 4" },
};

export function getTeamsByPot(pot) {
  return TEAMS.filter((t) => t.pot === pot);
}

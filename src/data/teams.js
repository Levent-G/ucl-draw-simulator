// UEFA Şampiyonlar Ligi Lig Fazı (2024/25 formatı ile başlayan "İsviçre modeli")
// 36 takım, 4 torba (Pot), her torbada 9 takım. Sıralama kulüp katsayısına göredir.
//
// NOT: 2026-27 sezonu 36 takımının TAMAMI, çekiliş (27 Ağustos 2026) ve
// play-off turu (25-26 Ağustos 2026) bitmeden kesinleşmiyor. Bu liste, Ağustos
// 2026 itibarıyla KESİNLEŞMİŞ 29 doğrudan katılımcıyı gerçek isimleriyle
// içeriyor; play-off'a bağlı kalan 7 yer için henüz sonuç belli olmadığından
// (kullanıcı tercihiyle) önceki best-effort placeholder takımlar korundu --
// bunlar da rastgele değil, gerçekten play-off turunda mücadele eden kulüpler
// (Celtic, Fenerbahçe/Sparta Prag hattı, Dinamo Zagreb, Crvena Zvezda, Slovan
// Bratislava, Sturm Graz, Qarabağ gibi). Play-off sonrası (26 Ağustos'tan
// sonra) bu 7 takım gerçek sonuçlarla güncellenmeli. Coeff/pot değerleri
// gösterim amaçlı yaklaşık değerlerdir.
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
import ManchesterUnitedLogo from "../assets/logos/England - Premier League/Manchester United.png";
import NapoliLogo from "../assets/logos/Italy - Serie A/SSC Napoli.png";

import AtleticoMadridLogo from "../assets/logos/Spain - LaLiga/Atlético de Madrid.png";
import ArsenalLogo from "../assets/logos/England - Premier League/Arsenal FC.png";
import BorussiaDortmundLogo from "../assets/logos/Germany - Bundesliga/Borussia Dortmund.png";
import RomaLogo from "../assets/logos/Italy - Serie A/AS Roma.png";
import VillarrealLogo from "../assets/logos/Spain - LaLiga/Villarreal CF.png";
import RBLeipzigLogo from "../assets/logos/Germany - Bundesliga/RB Leipzig.png";
import FeyenoordLogo from "../assets/logos/Netherlands - Eredivisie/Feyenoord Rotterdam.png";
import ClubBruggeLogo from "../assets/logos/Belgium - Jupiler Pro League/Club Brugge KV.png";
import ShakhtarLogo from "../assets/logos/Ukraine - Premier Liga/Shakhtar Donetsk.png";

import RealBetisLogo from "../assets/logos/Spain - LaLiga/Real Betis Balompié.png";
import AstonVillaLogo from "../assets/logos/England - Premier League/Aston Villa.png";
import StuttgartLogo from "../assets/logos/Germany - Bundesliga/VfB Stuttgart.png";
import RCLensLogo from "../assets/logos/France - Ligue 1/RC Lens.png";
import SportingLogo from "../assets/logos/Portugal - Liga Portugal/Sporting CP.png";
import PSVLogo from "../assets/logos/Netherlands - Eredivisie/PSV Eindhoven.png";
import CelticLogo from "../assets/logos/Scotland - Scottish Premiership/Celtic FC.png";
import LilleLogo from "../assets/logos/France - Ligue 1/LOSC Lille.png";
import SpartaPragueLogo from "../assets/logos/Czech Republic - Chance Liga/AC Sparta Prague.png";

import FCPortoLogo from "../assets/logos/Portugal - Liga Portugal/FC Porto.png";
import SlaviaPragueLogo from "../assets/logos/Czech Republic - Chance Liga/SK Slavia Prague.png";
import DinamoZagrebLogo from "../assets/logos/Croatia - SuperSport HNL/GNK Dinamo Zagreb.png";

import SturmGrazLogo from "../assets/logos/Austria - Bundesliga/SK Sturm Graz.png";
import ComoLogo from "../assets/logos/Italy - Serie A/Como 1907.png";
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
    coeff: 120.0,
    logo: ManchesterCityLogo,
  },
  {
    name: "Bayern Münih",
    short: "BAY",
    country: "GER",
    pot: 1,
    coeff: 118.0,
    logo: BayernMunihLogo,
  },
  {
    name: "Paris Saint-Germain",
    short: "PSG",
    country: "FRA",
    pot: 1,
    coeff: 125.0,
    logo: ParisSaintGermainLogo,
  },
  {
    name: "Liverpool",
    short: "LIV",
    country: "ENG",
    pot: 1,
    coeff: 115.0,
    logo: LiverpoolLogo,
  },
  {
    name: "Inter",
    short: "INT",
    country: "ITA",
    pot: 1,
    coeff: 98.0,
    logo: InterLogo,
  },
  {
    name: "Barcelona",
    short: "BAR",
    country: "ESP",
    pot: 1,
    coeff: 108.0,
    logo: BarcelonaLogo,
  },
  {
    name: "Manchester United",
    short: "MUN",
    country: "ENG",
    pot: 2,
    coeff: 70.0,
    logo: ManchesterUnitedLogo,
  },
  {
    name: "Napoli",
    short: "NAP",
    country: "ITA",
    pot: 2,
    coeff: 82.0,
    logo: NapoliLogo,
  },

  // ---- Pot 2 ----
  {
    name: "Atletico Madrid",
    short: "ATM",
    country: "ESP",
    pot: 1,
    coeff: 94.0,
    logo: AtleticoMadridLogo,
  },
  {
    name: "Arsenal",
    short: "ARS",
    country: "ENG",
    pot: 1,
    coeff: 102.0,
    logo: ArsenalLogo,
  },
  {
    name: "Borussia Dortmund",
    short: "BVB",
    country: "GER",
    pot: 2,
    coeff: 88.0,
    logo: BorussiaDortmundLogo,
  },
  {
    name: "Roma",
    short: "ROM",
    country: "ITA",
    pot: 2,
    coeff: 78.0,
    logo: RomaLogo,
  },
  {
    name: "Villarreal",
    short: "VIL",
    country: "ESP",
    pot: 2,
    coeff: 74.0,
    logo: VillarrealLogo,
  },
  {
    name: "RB Leipzig",
    short: "RBL",
    country: "GER",
    pot: 2,
    coeff: 72.0,
    logo: RBLeipzigLogo,
  },
  {
    name: "Feyenoord",
    short: "FEY",
    country: "NED",
    pot: 2,
    coeff: 65.0,
    logo: FeyenoordLogo,
  },
  {
    name: "Club Brugge",
    short: "CLB",
    country: "BEL",
    pot: 3,
    coeff: 58.0,
    logo: ClubBruggeLogo,
  },
  {
    name: "Shakhtar Donetsk",
    short: "SHK",
    country: "UKR",
    pot: 2,
    coeff: 62.0,
    logo: ShakhtarLogo,
  },

  // ---- Pot 3 ----
  {
    name: "Real Betis",
    short: "BET",
    country: "ESP",
    pot: 3,
    coeff: 45.0,
    logo: RealBetisLogo,
  },
  {
    name: "Aston Villa",
    short: "AVL",
    country: "ENG",
    pot: 3,
    coeff: 55.0,
    logo: AstonVillaLogo,
  },
  {
    name: "VfB Stuttgart",
    short: "VFB",
    country: "GER",
    pot: 3,
    coeff: 52.0,
    logo: StuttgartLogo,
  },
  {
    name: "RC Lens",
    short: "LEN",
    country: "FRA",
    pot: 3,
    coeff: 42.0,
    logo: RCLensLogo,
  },
  {
    name: "Sporting CP",
    short: "SPO",
    country: "POR",
    pot: 3,
    coeff: 50.0,
    logo: SportingLogo,
  },
  {
    name: "PSV Eindhoven",
    short: "PSV",
    country: "NED",
    pot: 3,
    coeff: 48.0,
    logo: PSVLogo,
  },
  {
    name: "Celtic",
    short: "CEL",
    country: "SCO",
    pot: 4,
    coeff: 29.0,
    logo: CelticLogo,
  },
  {
    name: "Lille",
    short: "LIL",
    country: "FRA",
    pot: 3,
    coeff: 40.0,
    logo: LilleLogo,
  },
  {
    name: "Sparta Prag",
    short: "SPA",
    country: "CZE",
    pot: 4,
    coeff: 16.0,
    logo: SpartaPragueLogo,
  },

  // ---- Pot 4 ----
  {
    name: "FC Porto",
    short: "POR",
    country: "POR",
    pot: 2,
    coeff: 68.0,
    logo: FCPortoLogo,
  },
  {
    name: "SK Slavia Prague",
    short: "SLA",
    country: "CZE",
    pot: 4,
    coeff: 31.0,
    logo: SlaviaPragueLogo,
  },
  {
    name: "Dinamo Zagreb",
    short: "DZG",
    country: "CRO",
    pot: 4,
    coeff: 26.0,
    logo: DinamoZagrebLogo,
  },
  {
    name: "Crvena Zvezda",
    short: "CZV",
    country: "SRB",
    pot: 4,
    coeff: 23.0,
    logo: CrvenaZvezdaLogo,
  },
  {
    name: "Slovan Bratislava",
    short: "SLO",
    country: "SVK",
    pot: 4,
    coeff: 20.0,
    logo: SlovanBratislavaLogo,
  },
  {
    name: "Sturm Graz",
    short: "STU",
    country: "AUT",
    pot: 4,
    coeff: 18.0,
    logo: SturmGrazLogo,
  },
  {
    name: "Como",
    short: "COM",
    country: "ITA",
    pot: 3,
    coeff: 37.0,
    logo: ComoLogo,
  },
  {
    name: "Galatasaray",
    short: "GAL",
    country: "TUR",
    pot: 4,
    coeff: 34.0,
    logo: GalatasarayLogo,
  },
  {
    name: "Qarabağ",
    short: "QAR",
    country: "AZE",
    pot: 4,
    coeff: 13.0,
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

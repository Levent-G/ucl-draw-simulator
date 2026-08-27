// UEFA Şampiyonlar Ligi Lig Fazı (2024/25 formatı ile başlayan "İsviçre modeli")
// 36 takım, 4 torba (Pot), her torbada 9 takım. Sıralama kulüp katsayısına göredir.
//
// NOT: 2026-27 sezonu 36 takımının TAMAMI play-off turu (25-26 Ağustos 2026)
// sonuçlarına göre GÜNCELLENMİŞTİR: play-off'u kazanan 7 takım (Fenerbahçe,
// Dinamo Zagreb, Slovan Bratislava, Levski Sofia, Sabah, LASK, Bodø/Glimt)
// lig fazına katılıyor -- daha önce buradaki placeholder tahminlerden Celtic
// (LASK'a elendi), Sparta Prag, Crvena Zvezda, Sturm Graz ve Qarabağ play-off
// turunu GEÇEMEDİ, bu yüzden listeden çıkarıldı. Torba (pot) dağılımı UEFA'nın
// 27 Ağustos 2026 çekiliş öncesi açıkladığı Pot 1/Pot 2 ve kısmi Pot 3/Pot 4
// bilgisine dayanır; Pot 3/Pot 4'e giren 7 play-off kazananının HANGİSİNİN
// hangi torbaya düştüğü çekiliş anında tam teyit edilemediğinden (kaynaklar
// "provisional" diyor), göreceli katsayılarına göre EN MANTIKLI dağılım
// (Fenerbahçe + Dinamo Zagreb -> Pot 3, kalan 5'i -> Pot 4) best-effort olarak
// uygulanmıştır. Coeff değerleri gösterim amaçlı yaklaşık değerlerdir.
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
import FenerbahceLogo from "../assets/logos/Türkiye - Süper Lig/Fenerbahce.png";
import LilleLogo from "../assets/logos/France - Ligue 1/LOSC Lille.png";
import LevskiSofiaLogo from "../assets/logos/Bulgaria - efbet Liga/Levski Sofia.png";

import FCPortoLogo from "../assets/logos/Portugal - Liga Portugal/FC Porto.png";
import SlaviaPragueLogo from "../assets/logos/Czech Republic - Chance Liga/SK Slavia Prague.png";
import DinamoZagrebLogo from "../assets/logos/Croatia - SuperSport HNL/GNK Dinamo Zagreb.png";

import LASKLogo from "../assets/logos/Austria - Bundesliga/LASK.png";
import ComoLogo from "../assets/logos/Italy - Serie A/Como 1907.png";
import GalatasarayLogo from "../assets/logos/Türkiye - Süper Lig/Galatasaray.png";
import BodoGlimtLogo from "../assets/logos/Norway - Eliteserien/FK BodøGlimt.png";
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
  BUL: "Bulgaristan",
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
    pot: 3,
    coeff: 82.0,
    logo: NapoliLogo,
  },

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
    pot: 3,
    coeff: 74.0,
    logo: VillarrealLogo,
  },
  {
    name: "RB Leipzig",
    short: "RBL",
    country: "GER",
    pot: 3,
    coeff: 72.0,
    logo: RBLeipzigLogo,
  },
  {
    name: "Feyenoord",
    short: "FEY",
    country: "NED",
    pot: 3,
    coeff: 65.0,
    logo: FeyenoordLogo,
  },
  {
    name: "Club Brugge",
    short: "CLB",
    country: "BEL",
    pot: 2,
    coeff: 58.0,
    logo: ClubBruggeLogo,
  },
  {
    name: "Shakhtar Donetsk",
    short: "SHK",
    country: "UKR",
    pot: 3,
    coeff: 62.0,
    logo: ShakhtarLogo,
  },

  {
    name: "Real Betis",
    short: "BET",
    country: "ESP",
    pot: 2,
    coeff: 45.0,
    logo: RealBetisLogo,
  },
  {
    name: "Aston Villa",
    short: "AVL",
    country: "ENG",
    pot: 2,
    coeff: 55.0,
    logo: AstonVillaLogo,
  },
  {
    name: "VfB Stuttgart",
    short: "VFB",
    country: "GER",
    pot: 4,
    coeff: 52.0,
    logo: StuttgartLogo,
  },
  {
    name: "RC Lens",
    short: "LEN",
    country: "FRA",
    pot: 4,
    coeff: 42.0,
    logo: RCLensLogo,
  },
  {
    name: "Sporting CP",
    short: "SPO",
    country: "POR",
    pot: 2,
    coeff: 50.0,
    logo: SportingLogo,
  },
  {
    name: "PSV Eindhoven",
    short: "PSV",
    country: "NED",
    pot: 2,
    coeff: 48.0,
    logo: PSVLogo,
  },
  {
    // Play-off Turu'nu (Fenerbahçe 3-0 Lyon toplam) kazanarak lig fazına
    // katıldı -- eski Celtic placeholder'ının yerini alıyor (Celtic, LASK'a
    // elenerek lig fazına kalamadı).
    name: "Fenerbahçe",
    short: "FB",
    country: "TUR",
    pot: 3,
    coeff: 44.0,
    logo: FenerbahceLogo,
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
    // Play-off Turu'nu (Levski Sofia 2-0 AEK Athens toplam) kazanarak lig
    // fazına katıldı -- eski Sparta Prag placeholder'ının yerini alıyor.
    name: "Levski Sofia",
    short: "LEV",
    country: "BUL",
    pot: 4,
    coeff: 15.0,
    logo: LevskiSofiaLogo,
  },

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
    // Play-off Turu'nu (Dinamo Zagreb 7-1 Viking toplam) kazanarak lig
    // fazına katıldı.
    name: "Dinamo Zagreb",
    short: "DZG",
    country: "CRO",
    pot: 3,
    coeff: 36.0,
    logo: DinamoZagrebLogo,
  },
  {
    // Play-off Turu'nu (Sabah 6-4 Hapoel Beer Sheva toplam) kazanarak lig
    // fazına katıldı -- eski Crvena Zvezda placeholder'ının yerini alıyor.
    // Azerbaycan'dan lig fazına ulaşan tek temsilci (Qarabağ bu sefer
    // play-off'u geçemedi).
    name: "Sabah",
    short: "SAB",
    country: "AZE",
    pot: 4,
    coeff: 12.0,
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
    // Play-off Turu'nu (LASK 5-4 Celtic toplam, uzatmalarda) kazanarak lig
    // fazına katıldı -- eski Sturm Graz placeholder'ının yerini alıyor.
    name: "LASK",
    short: "LAS",
    country: "AUT",
    pot: 4,
    coeff: 17.0,
    logo: LASKLogo,
  },
  {
    name: "Como",
    short: "COM",
    country: "ITA",
    pot: 4,
    coeff: 37.0,
    logo: ComoLogo,
  },
  {
    name: "Galatasaray",
    short: "GAL",
    country: "TUR",
    pot: 3,
    coeff: 46.0,
    logo: GalatasarayLogo,
  },
  {
    // Play-off Turu'nu (Bodø/Glimt 6-1 NEC Nijmegen toplam) kazanarak lig
    // fazına katıldı -- eski Qarabağ placeholder'ının yerini alıyor.
    name: "Bodø/Glimt",
    short: "BOG",
    country: "NOR",
    pot: 4,
    coeff: 19.0,
    logo: BodoGlimtLogo,
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

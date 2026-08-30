// UEFA Şampiyonlar Ligi Lig Fazı (2024/25 formatı ile başlayan "İsviçre modeli")
// 36 takım, 4 torba (Pot), her torbada 9 takım. Sıralama kulüp katsayısına göredir.
//
// NOT: 2026-27 sezonu 36 takımının TAMAMI play-off turu (25-26 Ağustos 2026)
// sonuçlarına göre GÜNCELLENMİŞTİR: play-off'u kazanan 7 takım (Fenerbahçe,
// Viking FK, Slovan Bratislava, AEK Athens, Sabah, LASK, Bodø/Glimt) lig
// fazına katılıyor -- daha önce buradaki placeholder tahminlerden Celtic
// (LASK'a elendi), Sparta Prag, Crvena Zvezda, Sturm Graz ve Qarabağ play-off
// turunu GEÇEMEDİ, bu yüzden listeden çıkarıldı. Torba (pot) dağılımı ve
// takım listesi 27 Ağustos 2026'da yapılan GERÇEK lig fazı çekilişi (UEFA
// resmi açıklaması + çapraz doğrulanmış haber kaynakları) ile teyit
// edilmiştir -- artık tahmini/placeholder DEĞİL. (Bu satır ilk yazıldığında
// burada yanlışlıkla Dinamo Zagreb ve Levski Sofia vardı; play-off'u asıl
// kazananlar Viking FK ve AEK Athens olduğu için düzeltildi, ve Bodø/Glimt'in
// gerçek torbası 4 değil 3 çıktı.) Coeff değerleri gösterim amaçlı yaklaşık
// değerlerdir.
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

import FCPortoLogo from "../assets/logos/Portugal - Liga Portugal/FC Porto.png";
import SlaviaPragueLogo from "../assets/logos/Czech Republic - Chance Liga/SK Slavia Prague.png";

import LASKLogo from "../assets/logos/Austria - Bundesliga/LASK.png";
import ComoLogo from "../assets/logos/Italy - Serie A/Como 1907.png";
import GalatasarayLogo from "../assets/logos/Türkiye - Süper Lig/Galatasaray.png";
import BodoGlimtLogo from "../assets/logos/Norway - Eliteserien/FK BodøGlimt.png";
import SlovanBratislavaLogo from "../assets/logos/slovakia_s-bratislava.png";
import AEKAthensLogo from "../assets/logos/Greece - Super League 1/AEK Athens.png";
import VikingLogo from "../assets/logos/Norway - Eliteserien/Viking FK.png";

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
  GRE: "Yunanistan",
};

// pot: 1-4, coeff: gösterim amaçlı UEFA kulüp katsayısı (yaklaşık).
// pedigree (opsiyonel, 0-20): kulübün Avrupa Şampiyon Kulüpler Kupası/UCL
// TARİHİNDEKİ derinliği -- kupa sayısı + final/yarı final sıklığı temel
// alınarak elle belirlenmiş kaba bir puan (ör. Real Madrid'in 15 kupası ->
// 20, hiç finale kalmamış bir kulüp -> 0-2). predictionEngine.js'teki
// strengthShare bunu coeff'e KÜÇÜK bir ek olarak katar -- amaç, coeff'in tek
// başına yakalayamadığı "bu kulüp tarihi boyunca hiç zirvede bitirmedi"
// gerçeğini modele az da olsa yansıtmak (bkz. predictionEngine.js başındaki
// PEDIGREE notu). Sadece UCL için dolduruldu; diğer yarışmalarda alan
// yoksa (ör. Avrupa Ligi/Süper Lig) ?? 0 ile sessizce devre dışı kalır.
const RAW_TEAMS = [
  // ---- Pot 1 ----
  {
    name: "Real Madrid",
    short: "RMA",
    country: "ESP",
    pot: 1,
    coeff: 136.0,
    pedigree: 20,
    logo: RealMadridLogo,
  },
  {
    name: "Manchester City",
    short: "MCI",
    country: "ENG",
    pot: 1,
    coeff: 120.0,
    pedigree: 8,
    logo: ManchesterCityLogo,
  },
  {
    name: "Bayern Münih",
    short: "BAY",
    country: "GER",
    pot: 1,
    coeff: 118.0,
    pedigree: 17,
    logo: BayernMunihLogo,
  },
  {
    name: "Paris Saint-Germain",
    short: "PSG",
    country: "FRA",
    pot: 1,
    coeff: 125.0,
    pedigree: 6,
    logo: ParisSaintGermainLogo,
  },
  {
    name: "Liverpool",
    short: "LIV",
    country: "ENG",
    pot: 1,
    coeff: 115.0,
    pedigree: 17,
    logo: LiverpoolLogo,
  },
  {
    name: "Inter",
    short: "INT",
    country: "ITA",
    pot: 1,
    coeff: 98.0,
    pedigree: 12,
    logo: InterLogo,
  },
  {
    name: "Barcelona",
    short: "BAR",
    country: "ESP",
    pot: 1,
    coeff: 108.0,
    pedigree: 16,
    logo: BarcelonaLogo,
  },
  {
    name: "Manchester United",
    short: "MUN",
    country: "ENG",
    pot: 2,
    coeff: 70.0,
    pedigree: 12,
    logo: ManchesterUnitedLogo,
  },
  {
    name: "Napoli",
    short: "NAP",
    country: "ITA",
    pot: 3,
    coeff: 82.0,
    pedigree: 2,
    logo: NapoliLogo,
  },

  {
    name: "Atletico Madrid",
    short: "ATM",
    country: "ESP",
    pot: 1,
    coeff: 94.0,
    pedigree: 7,
    logo: AtleticoMadridLogo,
  },
  {
    name: "Arsenal",
    short: "ARS",
    country: "ENG",
    pot: 1,
    coeff: 102.0,
    pedigree: 5,
    logo: ArsenalLogo,
  },
  {
    name: "Borussia Dortmund",
    short: "BVB",
    country: "GER",
    pot: 2,
    coeff: 88.0,
    pedigree: 8,
    logo: BorussiaDortmundLogo,
  },
  {
    name: "Roma",
    short: "ROM",
    country: "ITA",
    pot: 2,
    coeff: 78.0,
    pedigree: 4,
    logo: RomaLogo,
  },
  {
    name: "Villarreal",
    short: "VIL",
    country: "ESP",
    pot: 3,
    coeff: 74.0,
    pedigree: 4,
    logo: VillarrealLogo,
  },
  {
    name: "RB Leipzig",
    short: "RBL",
    country: "GER",
    pot: 3,
    coeff: 72.0,
    pedigree: 3,
    logo: RBLeipzigLogo,
  },
  {
    name: "Feyenoord",
    short: "FEY",
    country: "NED",
    pot: 3,
    coeff: 65.0,
    pedigree: 6,
    logo: FeyenoordLogo,
  },
  {
    name: "Club Brugge",
    short: "CLB",
    country: "BEL",
    pot: 2,
    coeff: 58.0,
    pedigree: 3,
    logo: ClubBruggeLogo,
  },
  {
    name: "Shakhtar Donetsk",
    short: "SHK",
    country: "UKR",
    pot: 3,
    coeff: 62.0,
    pedigree: 2,
    logo: ShakhtarLogo,
  },

  {
    name: "Real Betis",
    short: "BET",
    country: "ESP",
    pot: 2,
    coeff: 45.0,
    pedigree: 1,
    logo: RealBetisLogo,
  },
  {
    name: "Aston Villa",
    short: "AVL",
    country: "ENG",
    pot: 2,
    coeff: 55.0,
    pedigree: 6,
    logo: AstonVillaLogo,
  },
  {
    name: "VfB Stuttgart",
    short: "VFB",
    country: "GER",
    pot: 4,
    coeff: 52.0,
    pedigree: 2,
    logo: StuttgartLogo,
  },
  {
    name: "RC Lens",
    short: "LEN",
    country: "FRA",
    pot: 4,
    coeff: 42.0,
    pedigree: 1,
    logo: RCLensLogo,
  },
  {
    name: "Sporting CP",
    short: "SPO",
    country: "POR",
    pot: 2,
    coeff: 50.0,
    pedigree: 2,
    logo: SportingLogo,
  },
  {
    name: "PSV Eindhoven",
    short: "PSV",
    country: "NED",
    pot: 2,
    coeff: 48.0,
    pedigree: 6,
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
    pedigree: 1,
    logo: FenerbahceLogo,
  },
  {
    name: "Lille",
    short: "LIL",
    country: "FRA",
    pot: 3,
    coeff: 40.0,
    pedigree: 1,
    logo: LilleLogo,
  },
  {
    // Play-off Turu'nu (AEK Athens 2-0 Levski Sofia toplam) kazanarak lig
    // fazına katıldı -- eski Sparta Prag placeholder'ının yerini alıyor.
    name: "AEK Athens",
    short: "AEK",
    country: "GRE",
    pot: 4,
    coeff: 16.0,
    pedigree: 0,
    logo: AEKAthensLogo,
  },

  {
    name: "FC Porto",
    short: "POR",
    country: "POR",
    pot: 2,
    coeff: 68.0,
    pedigree: 10,
    logo: FCPortoLogo,
  },
  {
    name: "SK Slavia Prague",
    short: "SLA",
    country: "CZE",
    pot: 4,
    coeff: 31.0,
    pedigree: 1,
    logo: SlaviaPragueLogo,
  },
  {
    // Play-off Turu'nu (Viking 7-1 Dinamo Zagreb toplam) kazanarak lig
    // fazına katıldı.
    name: "Viking",
    short: "VIK",
    country: "NOR",
    pot: 4,
    coeff: 14.0,
    pedigree: 0,
    logo: VikingLogo,
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
    pedigree: 0,
  },
  {
    name: "Slovan Bratislava",
    short: "SLO",
    country: "SVK",
    pot: 4,
    coeff: 20.0,
    pedigree: 1,
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
    pedigree: 0,
    logo: LASKLogo,
  },
  {
    name: "Como",
    short: "COM",
    country: "ITA",
    pot: 4,
    coeff: 37.0,
    pedigree: 0,
    logo: ComoLogo,
  },
  {
    name: "Galatasaray",
    short: "GAL",
    country: "TUR",
    pot: 3,
    coeff: 46.0,
    pedigree: 3,
    logo: GalatasarayLogo,
  },
  {
    // Play-off Turu'nu (Bodø/Glimt 6-1 NEC Nijmegen toplam) kazanarak lig
    // fazına katıldı -- eski Qarabağ placeholder'ının yerini alıyor.
    name: "Bodø/Glimt",
    short: "BOG",
    country: "NOR",
    pot: 3,
    coeff: 19.0,
    pedigree: 1,
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

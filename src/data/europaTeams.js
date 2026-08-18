// UEFA Avrupa Ligi Lig Fazı ("İsviçre modeli") - takım verisi
// 36 takım, 4 torba (Pot), her torbada 9 takım. Sıralama kulüp katsayısına göredir.
//
// NOT: Bu liste gerçek bir sezonun birebir kopyası olmak zorunda değildir; format ve
// kurallar UEFA'nın gerçek lig fazı çekilişiyle birebir aynı çalışacak şekilde
// tasarlanmıştır. Best-effort, gerçekçi ve tanınabilir bir 36 kulüplük Avrupa Ligi
// alanı seçilmiştir; sezondan sezona gerçek katılımcı listesi değişebilir.
//
// logo: projede zaten bulunan (kullanıcının sağladığı) amblem dosyalarından
// eşleşenler içe aktarılır. Bazı ülkeler (Macaristan, Finlandiya, Moldova,
// Letonya) için amblem paketi projede yok -- o takımlarda alan atlanır ve
// Crest.jsx otomatik olarak kendi oluşturduğu SVG rozete geri döner.

import TottenhamLogo from "../assets/logos/England - Premier League/Tottenham Hotspur.png";
import RomaLogo from "../assets/logos/Italy - Serie A/AS Roma.png";
import AjaxLogo from "../assets/logos/Netherlands - Eredivisie/Ajax Amsterdam.png";
import RealSociedadLogo from "../assets/logos/Spain - LaLiga/Real Sociedad.png";
import LyonLogo from "../assets/logos/France - Ligue 1/Olympique Lyon.png";
import RangersLogo from "../assets/logos/Scotland - Scottish Premiership/Rangers FC.png";
import FenerbahceLogo from "../assets/logos/Türkiye - Süper Lig/Fenerbahce.png";
import EintrachtFrankfurtLogo from "../assets/logos/Germany - Bundesliga/Eintracht Frankfurt.png";
import LazioLogo from "../assets/logos/Italy - Serie A/SS Lazio.png";

import RealBetisLogo from "../assets/logos/Spain - LaLiga/Real Betis Balompié.png";
import PortoLogo from "../assets/logos/Portugal - Liga Portugal/FC Porto.png";
import VillarrealLogo from "../assets/logos/Spain - LaLiga/Villarreal CF.png";
import NottinghamForestLogo from "../assets/logos/England - Premier League/Nottingham Forest.png";
import FiorentinaLogo from "../assets/logos/Italy - Serie A/ACF Fiorentina.png";
import OlympiacosLogo from "../assets/logos/Greece - Super League 1/Olympiacos Piraeus.png";
import SCBragaLogo from "../assets/logos/Portugal - Liga Portugal/SC Braga.png";
import PAOKLogo from "../assets/logos/Greece - Super League 1/PAOK Thessaloniki.png";

import UnionSaintGilloiseLogo from "../assets/logos/Belgium - Jupiler Pro League/Union Saint-Gilloise.png";
import KRCGenkLogo from "../assets/logos/Belgium - Jupiler Pro League/KRC Genk.png";
import FCSBLogo from "../assets/logos/Romania - SuperLiga/FCSB.png";
import MalmoFFLogo from "../assets/logos/Sweden - Allsvenskan/Malmö FF.png";
import OGCNiceLogo from "../assets/logos/France - Ligue 1/OGC Nice.png";
import HNKRijekaLogo from "../assets/logos/Croatia - SuperSport HNL/HNK Rijeka.png";
import IFElfsborgLogo from "../assets/logos/Sweden - Allsvenskan/IF Elfsborg.png";
import ViktoriaPlzenLogo from "../assets/logos/Czech Republic - Chance Liga/FC Viktoria Plzen.png";
import FCUtrechtLogo from "../assets/logos/Netherlands - Eredivisie/FC Utrecht.png";

import FCMidtjyllandLogo from "../assets/logos/Denmark - Superliga/FC Midtjylland.png";
import LudogoretsLogo from "../assets/logos/Bulgaria - efbet Liga/Ludogorets Razgrad.png";
import SCFreiburgLogo from "../assets/logos/Germany - Bundesliga/SC Freiburg.png";
import PanathinaikosLogo from "../assets/logos/Greece - Super League 1/Panathinaikos FC.png";
import JagiellonaLogo from "../assets/logos/Poland - PKO BP Ekstraklasa/Jagiellonia Bialystok.png";
import MotherwellLogo from "../assets/logos/Scotland - Scottish Premiership/Motherwell FC.png";

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
};

// pot: 1-4, coeff: gösterim amaçlı UEFA kulüp katsayısı (yaklaşık, kurgusal)
const RAW_EUROPA_TEAMS = [
  // ---- Pot 1 ----
  { name: "Tottenham Hotspur", short: "TOT", country: "ENG", pot: 1, coeff: 68.0, logo: TottenhamLogo },
  { name: "AS Roma", short: "ROM", country: "ITA", pot: 1, coeff: 64.0, logo: RomaLogo },
  { name: "Ajax", short: "AJA", country: "NED", pot: 1, coeff: 60.0, logo: AjaxLogo },
  { name: "Real Sociedad", short: "RSO", country: "ESP", pot: 1, coeff: 57.0, logo: RealSociedadLogo },
  { name: "Olympique Lyonnais", short: "LYO", country: "FRA", pot: 1, coeff: 54.0, logo: LyonLogo },
  { name: "Rangers", short: "RAN", country: "SCO", pot: 1, coeff: 51.0, logo: RangersLogo },
  { name: "Fenerbahçe", short: "FB", country: "TUR", pot: 1, coeff: 49.0, logo: FenerbahceLogo },
  { name: "Eintracht Frankfurt", short: "SGE", country: "GER", pot: 1, coeff: 47.0, logo: EintrachtFrankfurtLogo },
  { name: "Lazio", short: "LAZ", country: "ITA", pot: 1, coeff: 45.0, logo: LazioLogo },

  // ---- Pot 2 ----
  { name: "Real Betis", short: "BET", country: "ESP", pot: 2, coeff: 44.0, logo: RealBetisLogo },
  { name: "FC Porto", short: "POR", country: "POR", pot: 2, coeff: 43.0, logo: PortoLogo },
  { name: "Villarreal", short: "VIL", country: "ESP", pot: 2, coeff: 41.0, logo: VillarrealLogo },
  { name: "Nottingham Forest", short: "NFO", country: "ENG", pot: 2, coeff: 39.0, logo: NottinghamForestLogo },
  { name: "Fiorentina", short: "FIO", country: "ITA", pot: 2, coeff: 37.0, logo: FiorentinaLogo },
  { name: "Olympiacos", short: "OLY", country: "GRE", pot: 2, coeff: 35.0, logo: OlympiacosLogo },
  { name: "Ferencváros", short: "FTC", country: "HUN", pot: 2, coeff: 33.0 },
  { name: "SC Braga", short: "SCB", country: "POR", pot: 2, coeff: 32.0, logo: SCBragaLogo },
  { name: "PAOK", short: "PAO", country: "GRE", pot: 2, coeff: 30.0, logo: PAOKLogo },

  // ---- Pot 3 ----
  { name: "Union Saint-Gilloise", short: "USG", country: "BEL", pot: 3, coeff: 29.0, logo: UnionSaintGilloiseLogo },
  { name: "KRC Genk", short: "GEN", country: "BEL", pot: 3, coeff: 27.0, logo: KRCGenkLogo },
  { name: "FCSB", short: "FCS", country: "ROU", pot: 3, coeff: 25.0, logo: FCSBLogo },
  { name: "Malmö FF", short: "MFF", country: "SWE", pot: 3, coeff: 24.0, logo: MalmoFFLogo },
  { name: "OGC Nice", short: "NIC", country: "FRA", pot: 3, coeff: 23.0, logo: OGCNiceLogo },
  { name: "HNK Rijeka", short: "RIJ", country: "CRO", pot: 3, coeff: 21.0, logo: HNKRijekaLogo },
  { name: "IF Elfsborg", short: "ELF", country: "SWE", pot: 3, coeff: 20.0, logo: IFElfsborgLogo },
  { name: "Viktoria Plzeň", short: "PLZ", country: "CZE", pot: 3, coeff: 19.0, logo: ViktoriaPlzenLogo },
  { name: "FC Utrecht", short: "UTR", country: "NED", pot: 3, coeff: 18.0, logo: FCUtrechtLogo },

  // ---- Pot 4 ----
  { name: "FC Midtjylland", short: "FCM", country: "DEN", pot: 4, coeff: 17.0, logo: FCMidtjyllandLogo },
  { name: "Ludogorets Razgrad", short: "LUD", country: "BUL", pot: 4, coeff: 16.0, logo: LudogoretsLogo },
  { name: "SC Freiburg", short: "FRE", country: "GER", pot: 4, coeff: 15.0, logo: SCFreiburgLogo },
  { name: "Panathinaikos", short: "PAN", country: "GRE", pot: 4, coeff: 14.0, logo: PanathinaikosLogo },
  { name: "HJK Helsinki", short: "HJK", country: "FIN", pot: 4, coeff: 12.0 },
  { name: "Jagiellonia Białystok", short: "JAG", country: "POL", pot: 4, coeff: 11.0, logo: JagiellonaLogo },
  { name: "Petrocub Hîncești", short: "PET", country: "MDA", pot: 4, coeff: 10.0 },
  { name: "RFS Riga", short: "RFS", country: "LAT", pot: 4, coeff: 9.0 },
  { name: "Motherwell", short: "MTH", country: "SCO", pot: 4, coeff: 8.0, logo: MotherwellLogo },
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

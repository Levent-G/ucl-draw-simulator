// Tüm yarışmaların TEK kayıt noktası. Sayfalar/bileşenler bu registry
// üzerinden çalışır, hiçbir yerde "UCL" ya da "36 takım" gibi sabit bir
// varsayım kodlanmaz -- her yarışma kendi takım/oyuncu listesini ve kendi
// formatını (swiss = İsviçre modeli kura+lig fazı+eleme; league = çift
// devreli lig) taşır. Yeni bir yarışma eklemek (ya da mevcut birinin
// takım/oyuncu verisini gerçek bir veri setiyle değiştirmek) sadece bu
// dosyayı ve ilgili data/*.js dosyasını güncellemek anlamına gelir.
import { TEAMS, COUNTRY_NAMES, POT_COLORS } from "./teams.js";
import { getPlayersByTeam, getAllPlayers, POSITION_LABELS } from "./players.js";
import { EUROPA_TEAMS, EUROPA_COUNTRY_NAMES, EUROPA_POT_COLORS, getEuropaTeamsByPot } from "./europaTeams.js";
import { getEuropaPlayersByTeam, getAllEuropaPlayers } from "./europaPlayers.js";
import { SUPER_LIG_TEAMS, SUPER_LIG_COUNTRY_NAMES } from "./superLigTeams.js";
import { getSuperLigPlayersByTeam, getAllSuperLigPlayers } from "./superLigPlayers.js";
import { buildSwissZones, buildLeagueZones } from "../utils/predictionEngine.js";

export const COMPETITIONS = {
  ucl: {
    key: "ucl",
    name: "UEFA Şampiyonlar Ligi",
    shortName: "UCL",
    tagline: "İsviçre Modeli · Lig Fazı",
    format: "swiss",
    teams: TEAMS,
    countryNames: COUNTRY_NAMES,
    potColors: POT_COLORS,
    getTeamsByPot: (pot) => TEAMS.filter((t) => t.pot === pot),
    getPlayersByTeam,
    getAllPlayers,
    positionLabels: POSITION_LABELS,
    zones: buildSwissZones(TEAMS.length),
    hasKnockout: true,
  },
  europa: {
    key: "europa",
    name: "UEFA Avrupa Ligi",
    shortName: "Avrupa Ligi",
    tagline: "İsviçre Modeli · Lig Fazı",
    format: "swiss",
    teams: EUROPA_TEAMS,
    countryNames: EUROPA_COUNTRY_NAMES,
    potColors: EUROPA_POT_COLORS,
    getTeamsByPot: getEuropaTeamsByPot,
    getPlayersByTeam: getEuropaPlayersByTeam,
    getAllPlayers: getAllEuropaPlayers,
    positionLabels: POSITION_LABELS,
    zones: buildSwissZones(EUROPA_TEAMS.length),
    hasKnockout: true,
  },
  superlig: {
    key: "superlig",
    name: "Trendyol Süper Lig",
    shortName: "Süper Lig",
    tagline: "Çift Devreli Lig",
    format: "league",
    teams: SUPER_LIG_TEAMS,
    countryNames: SUPER_LIG_COUNTRY_NAMES,
    potColors: null,
    getTeamsByPot: null,
    getPlayersByTeam: getSuperLigPlayersByTeam,
    getAllPlayers: getAllSuperLigPlayers,
    positionLabels: POSITION_LABELS,
    zones: buildLeagueZones(SUPER_LIG_TEAMS.length),
    hasKnockout: false,
  },
};

export const COMPETITION_LIST = Object.values(COMPETITIONS);

export function getCompetition(key) {
  return COMPETITIONS[key] || COMPETITIONS.ucl;
}

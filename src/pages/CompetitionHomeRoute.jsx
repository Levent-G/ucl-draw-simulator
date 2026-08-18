import React from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import DrawPage from "./DrawPage.jsx";
import LeagueHomePage from "./LeagueHomePage.jsx";

// /:competitionKey rotasının ortak girişi -- yarışmanın formatına göre
// (swiss = animasyonlu kura töreni, league = basit sezon ana sayfası)
// doğru bileşene yönlendirir.
//
// key={competitionKey}: UCL <-> Avrupa Ligi gibi İKİ "swiss" yarışma
// arasında geçerken DrawPage'in AYNI bileşen örneği olarak kalıp eski
// çekiliş durumunu (yanlış takım listesiyle) bir an için render etmesini
// (ör. "mavi" bozuk bir kare görünmesini) engeller -- React'i, competitionKey
// değiştiğinde bileşeni SIFIRDAN kurmaya zorlar.
export default function CompetitionHomeRoute() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  return competition.format === "swiss" ? (
    <DrawPage key={competitionKey} />
  ) : (
    <LeagueHomePage key={competitionKey} />
  );
}

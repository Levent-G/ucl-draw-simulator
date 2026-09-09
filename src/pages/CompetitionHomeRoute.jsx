import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import { useCompetition } from "../state/CompetitionContext.jsx";
import { buildResultsFromMatches } from "../utils/resultsHelpers.js";
import { REAL_DRAW_2026_MATCHES } from "../data/realDraw2026.js";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";
import DrawPage from "./DrawPage.jsx";
import LeagueHomePage from "./LeagueHomePage.jsx";
import RealFixturePage from "./RealFixturePage.jsx";

// /:competitionKey rotasının ortak girişi.
//
// UCL ve Süper Lig İÇİN artık GERÇEK VERİ birincil deneyim: bu iki yarışmada
// kök rota CompetitionHomePage'i (gerçek fikstür/puan durumu/haberler,
// bkz. src/utils/realStandingsSelectors.js) gösterir -- eski kura töreni
// (DrawPage) ve sahte sezon başlangıcı (LeagueHomePage) SİLİNMEDİ, sadece
// /:competitionKey/kura-simulasyonu ve /:competitionKey/sezon-simulasyonu
// rotalarına taşınarak "🎮 Eğlence Modu" olarak ikinci plana alındı (bkz.
// main.jsx, CompetitionHomePage.jsx'teki eğlence modu linki, NavBar.jsx'teki
// "✅ GERÇEK VERİ" / "🎮 SİMÜLASYON MODU" şeridi).
//
// Avrupa Ligi'nde henüz gerçek bir veri kaynağımız olmadığından o eski
// davranışında (animasyonlu kura çekimi ana akışta) KALIYOR -- kapsam dışı.
//
// ÖNEMLİ: Bu sayfa BİLİNÇLİ OLARAK CompetitionContext'in fixture/simulation
// state'ini ARTIK OTOMATİK DOLDURMUYOR (önceki bir sürümde dolduruyordu) --
// bunun TEK sonucu, Eleme Turu/Takım Profili gibi sayfalarda sahte
// simülasyon verisinin GERÇEK verinin yanında SESSİZCE görünmesiydi
// (kullanıcı geri bildirimi: "gerçek veri ile simülasyon net ayrılsın").
// Eğlence modu sayfaları (DrawPage/LeagueHomePage/KnockoutPage) artık
// fixture/simülasyonu SADECE KENDİLERİ, gerçekten ziyaret edildiklerinde
// hazırlıyor (bkz. KnockoutPage.jsx'teki bootstrap effect'i, LeagueHomePage.
// jsx'teki mevcut autoStartFiredRef). Burada SADECE UCL'nin gerçek kura
// SONUCU (results -- hiçbir görünür UI'ı beslemez, sadece hasDraw'ı true
// yapar) sessizce yükleniyor; bu tek başına ZARARSIZDIR.
export default function CompetitionHomeRoute() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { hasDraw, setDrawResults } = useCompetition(competitionKey);

  const isRealUcl = competitionKey === "ucl";

  useEffect(() => {
    if (!isRealUcl || hasDraw) return;
    const liveResults = buildResultsFromMatches(competition.teams, REAL_DRAW_2026_MATCHES);
    setDrawResults(liveResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealUcl, hasDraw]);

  // Kullanıcı geri bildirimi: "ana sayfa kısmını kaldır direkt fikstürden
  // başlasın" -- UCL/Süper Lig'de artık ayrı bir "giriş" sayfası yok, kök
  // rota doğrudan gerçek fikstürü (puan durumu + takvim + haftalık maçlar
  // dahil) gösteriyor.
  if (hasRealDataSupport(competitionKey)) {
    return <RealFixturePage key={competitionKey} />;
  }

  return competition.format === "swiss" ? (
    <DrawPage key={competitionKey} />
  ) : (
    <LeagueHomePage key={competitionKey} />
  );
}

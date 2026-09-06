import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TeamsTab from "../components/stats/TeamsTab.jsx";
import PlayersTab from "../components/stats/PlayersTab.jsx";
import CountriesTab from "../components/stats/CountriesTab.jsx";
import TeamOfSeasonTab from "../components/stats/TeamOfSeasonTab.jsx";
import FinanceTab from "../components/stats/FinanceTab.jsx";
import RealAnalysisTab from "../components/stats/RealAnalysisTab.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { hasRealDataSupport, getRealStandings, getRealFixture } from "../utils/realStandingsSelectors.js";

const SIM_TABS = [
  { key: "teams", label: "Takımlar" },
  { key: "players", label: "Oyuncular" },
  { key: "countries", label: "Ülkeler" },
  { key: "season-xi", label: "Sezonun 11'i" },
  { key: "finance", label: "💰 Finans" },
];
// UCL/Süper Lig'de "Oyuncular"/"Sezonun 11'i"/"💰 Finans" sekmeleri
// (tamamen gol/asist/kart SİMÜLASYONUNA dayalı, gerçek bir oyuncu istatistik
// kaynağımız yok) GÖSTERİLMİYOR -- "uydurma veri gösterme" ilkesiyle
// tutarlı. Sekmeler SİLİNMEDİ, sadece bu iki yarışma için gizlendi (europa
// ve eğlence modu simülasyonu için hâlâ tüm sekmeler mevcut). Bunun yerine
// gerçek veriden (puan durumu + form + model) beslenen "📈 Analiz" sekmesi
// eklendi (bkz. RealAnalysisTab.jsx).
const REAL_DATA_TABS = [
  { key: "teams", label: "Takımlar" },
  { key: "countries", label: "Ülkeler" },
  { key: "analiz", label: "📈 Analiz" },
];

export default function StatsPage() {
  const { competitionKey } = useParams();
  const { competition, simulation, knockout, hasFixture } = useCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const showReal = hasRealDataSupport(competitionKey);
  const TABS = showReal ? REAL_DATA_TABS : SIM_TABS;
  const [tab, setTab] = useState("teams");
  // Takım filtresi -- her sekmede tutarlı kalsın diye tuttuğun takımla
  // önceden dolduruluyor (kullanıcı isterse değiştirebilir/temizleyebilir).
  const [selectedTeamId, setSelectedTeamId] = useState(() => favoriteTeamId || "");

  // Bir yarışmadan (ör. Avrupa Ligi -- simülasyon) diğerine (ör. UCL --
  // gerçek veri) SPA içi geçişte `tab` state'i KORUNUR -- ör. kullanıcı
  // Avrupa Ligi'nde "💰 Finans" sekmesindeyken UCL'ye geçerse, o sekme artık
  // TABS listesinde/butonlarında YOK ama state hâlâ "finance" olduğundan
  // FinanceTab (kurgusal veri) SESSİZCE render edilmeye devam ederdi --
  // gerçek/simülasyon karışıklığının tam da kaynağı. Geçerli sekme yeni
  // TABS listesinde yoksa ilk sekmeye sıfırlanır.
  useEffect(() => {
    if (!TABS.some((t) => t.key === tab)) setTab(TABS[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionKey, showReal]);

  const selectedTeam = selectedTeamId
    ? competition.teams.find((t) => t.id === selectedTeamId)
    : null;

  // Gerçek veri yarışmalarında TeamsTab'e "simulation" yerine gerçek puan
  // durumunu (aynı {standings:[...]} şeklinde) besliyoruz -- TeamsTab zaten
  // sadece standings okur, simülasyona özgü hiçbir alana dokunmaz (bkz.
  // TeamsTab.jsx/statsSelectors.teamsWithSimPoints).
  const realStandings = showReal ? getRealStandings(competitionKey).standings : null;
  const effectiveSimulation = showReal ? { standings: realStandings } : simulation;
  const realFixture = showReal && tab === "analiz" ? getRealFixture(competitionKey) : null;

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">{showReal ? "Takımlar · Ülkeler · Analiz" : "Takımlar · Oyuncular · Ülkeler"}</div>
          <h1>{competition.shortName} — İstatistikler</h1>
          <p>
            {showReal
              ? "Katsayı, ülke, gerçek puan durumu ve modelin analiz/projeksiyonları. Gol/asist/kart gibi oyuncu istatistikleri için gerçek bir veri kaynağımız olmadığından bu sekmeler burada gösterilmiyor (eğlence modunda hâlâ mevcutlar)."
              : "Katsayı, kadro ve ülke bazlı gelişmiş grafikler. Gol/asist/kart ve simüle edilmiş puan durumu gibi bölümler için önce Fikstür & Tahmin sayfasından bir model tahmini üretilmesi gerekir."}
          </p>
        </div>
      </header>

      {!showReal && !hasFixture && (
        <EmptyState
          variant="inline"
          description="Henüz bir fikstür/tahmin oluşturulmadı — simüle puan ve gol/kart istatistikleri şimdilik gösterilemiyor, katsayı/ülke/kadro grafikleri zaten görüntülenebilir."
          primaryCta={{ label: "Fikstür & Tahmin sayfasına git", to: `/${competitionKey}/fikstur` }}
        />
      )}

      <div className="stats-toolbar">
        <div className="stats-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "countries" && tab !== "season-xi" && tab !== "analiz" && (
          <div className="team-filter">
            <label htmlFor="stats-team-filter">Takım filtresi</label>
            <TeamFilterSelect
              teams={competition.teams}
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              placeholder={favoriteTeamId ? "⭐ Tuttuğun takım" : "Tüm takımlar"}
            />
            {selectedTeam && (
              <button className="btn-ghost team-filter-clear" onClick={() => setSelectedTeamId("")}>
                Filtreyi Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {tab === "teams" && (
        <TeamsTab
          competition={competition}
          simulation={effectiveSimulation}
          selectedTeam={selectedTeam}
          competitionKey={competitionKey}
          pointsLabel={showReal ? "Puan" : "Sim. Puan"}
          rankLabel={showReal ? "Sıra" : "Sim. Sıra"}
        />
      )}
      {tab === "players" && (
        <PlayersTab competition={competition} simulation={simulation} selectedTeam={selectedTeam} competitionKey={competitionKey} />
      )}
      {tab === "countries" && <CountriesTab competition={competition} />}
      {tab === "season-xi" && (
        <TeamOfSeasonTab competition={competition} simulation={simulation} competitionKey={competitionKey} />
      )}
      {tab === "finance" && (
        <FinanceTab
          competition={competition}
          simulation={simulation}
          knockout={knockout}
          selectedTeam={selectedTeam}
          competitionKey={competitionKey}
        />
      )}
      {tab === "analiz" && showReal && (
        <RealAnalysisTab
          competition={competition}
          competitionKey={competitionKey}
          standings={realStandings}
          fixture={realFixture}
          favoriteTeamId={favoriteTeamId}
        />
      )}

      <p className="footnote">
        {showReal
          ? "Puan durumu gerçek sonuçlardan hesaplanır (bkz. Fikstür sayfası); katsayı kulübün display amaçlı yaklaşık gücüdür, resmi UEFA katsayısı değildir. Analiz sekmesindeki projeksiyon/tahmin grafikleri modelin ürettiği istatistiksel tahminlerdir, gerçek sonuç garantisi değildir."
          : 'Oyuncu kadroları gerçek kulüplere yakın (best-effort) seçilmiştir; tam ve güncel kadro değildir, transferler burada anlık yansımayabilir. Gol/asist/kart gibi istatistikler gerçek sezon verisi DEĞİLDİR — bu simülatördeki kura/fikstür/tahmin motoruna göre üretilir.'}
      </p>
    </div>
  );
}

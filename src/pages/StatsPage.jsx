import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCompetition } from "../state/CompetitionContext.jsx";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TeamsTab from "../components/stats/TeamsTab.jsx";
import PlayersTab from "../components/stats/PlayersTab.jsx";
import CountriesTab from "../components/stats/CountriesTab.jsx";
import TeamOfSeasonTab from "../components/stats/TeamOfSeasonTab.jsx";
import FinanceTab from "../components/stats/FinanceTab.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";

const TABS = [
  { key: "teams", label: "Takımlar" },
  { key: "players", label: "Oyuncular" },
  { key: "countries", label: "Ülkeler" },
  { key: "season-xi", label: "Sezonun 11'i" },
  { key: "finance", label: "💰 Finans" },
];

export default function StatsPage() {
  const { competitionKey } = useParams();
  const { competition, simulation, knockout, hasFixture } = useCompetition(competitionKey);
  const [tab, setTab] = useState("teams");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const selectedTeam = selectedTeamId
    ? competition.teams.find((t) => t.id === selectedTeamId)
    : null;

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Takımlar · Oyuncular · Ülkeler</div>
          <h1>{competition.shortName} — İstatistikler</h1>
          <p>
            Katsayı, kadro ve ülke bazlı gelişmiş grafikler. Gol/asist/kart ve
            simüle edilmiş puan durumu gibi bölümler için önce Fikstür &amp;
            Tahmin sayfasından bir model tahmini üretilmesi gerekir.
          </p>
        </div>
      </header>

      {!hasFixture && (
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

        {tab !== "countries" && tab !== "season-xi" && (
          <div className="team-filter">
            <label htmlFor="stats-team-filter">Takım filtresi</label>
            <TeamFilterSelect
              teams={competition.teams}
              value={selectedTeamId}
              onChange={setSelectedTeamId}
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
        <TeamsTab competition={competition} simulation={simulation} selectedTeam={selectedTeam} competitionKey={competitionKey} />
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

      <p className="footnote">
        Oyuncu kadroları gerçek kulüplere yakın (best-effort) seçilmiştir; tam
        ve güncel kadro değildir, transferler burada anlık yansımayabilir.
        Gol/asist/kart gibi istatistikler gerçek sezon verisi DEĞİLDİR — bu
        simülatördeki kura/fikstür/tahmin motoruna göre üretilir.
      </p>
    </div>
  );
}

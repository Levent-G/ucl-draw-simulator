import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import MatchdayTabs from "../components/fixture/MatchdayTabs.jsx";
import FixtureCalendar from "../components/fixture/FixtureCalendar.jsx";
import MatchRow from "../components/fixture/MatchRow.jsx";
import HighlightMatchCard from "../components/fixture/HighlightMatchCard.jsx";
import StandingsTable from "../components/fixture/StandingsTable.jsx";
import ZoneLegend from "../components/fixture/ZoneLegend.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import { toSearchKey } from "../utils/text.js";
import {
  getRealFixture,
  getRealStandings,
  findCurrentMatchdayIndex,
  buildDisplayMatches,
  getNextMatchProbabilitiesByTeam,
} from "../utils/realStandingsSelectors.js";

// UCL/Süper Lig için gerçek, tarihli fikstür sayfası -- eski "Fikstür &
// Tahmin" (tam sezon Poisson simülasyonu + "Model Tahminlerini Yenile"
// butonu) YERİNE. Her hafta için: gerçek tarih, oynandıysa gerçek skor,
// oynanmadıysa hafif tek-maçlık model olasılığı (bkz.
// realStandingsSelectors.buildDisplayMatches) -- tam sezon sahte simülasyon
// hiç çalıştırılmaz.
export default function RealFixturePage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const matchListRef = useRef(null);

  const fixture = useMemo(() => getRealFixture(competitionKey), [competitionKey]);
  const { standings } = useMemo(() => getRealStandings(competitionKey), [competitionKey]);
  const nextMatchByTeamId = useMemo(() => getNextMatchProbabilitiesByTeam(competitionKey), [competitionKey]);
  const currentIdx = useMemo(() => findCurrentMatchdayIndex(fixture), [fixture]);
  const [activeNumber, setActiveNumber] = useState(fixture?.[currentIdx]?.number ?? 1);

  const activeMatchday = fixture?.find((md) => md.number === activeNumber) || fixture?.[currentIdx] || null;
  const displayMatches = useMemo(
    () => (activeMatchday ? buildDisplayMatches(competitionKey, activeMatchday.matches) : []),
    [competitionKey, activeMatchday]
  );
  const totalMatchCount = useMemo(
    () => (fixture ? fixture.reduce((sum, md) => sum + md.matches.length, 0) : 0),
    [fixture]
  );

  // Takım bazlı arama -- eskiden sadece aktif haftanın maçları görünürdü,
  // "hangi haftada oynuyor" sorusuna cevap için TÜM fikstürü arayıp
  // filtreleyebilmek gerekiyordu (bkz. Tahmin Ligi'ndeki aynı desen).
  const [teamQuery, setTeamQuery] = useState("");
  const searchKey = toSearchKey(teamQuery.trim());
  const searchResults = useMemo(() => {
    if (!searchKey || !fixture) return null;
    const rows = [];
    for (const md of fixture) {
      const matches = buildDisplayMatches(competitionKey, md.matches).filter(
        (m) =>
          toSearchKey(m.homeTeam.name).includes(searchKey) ||
          toSearchKey(m.awayTeam.name).includes(searchKey) ||
          toSearchKey(m.homeTeam.short).includes(searchKey) ||
          toSearchKey(m.awayTeam.short).includes(searchKey)
      );
      for (const m of matches) rows.push({ ...m, matchdayLabel: md.label });
    }
    return rows;
  }, [fixture, competitionKey, searchKey]);

  // Favori takım varsa ve bu hafta oynayacaksa, "haftanın öne çıkan maçı"
  // olarak model tahmini en dengeli maç yerine DOĞRUDAN o takımın maçı
  // gösterilir -- kullanıcı için en alakalı maç zaten kendi tuttuğu takımın
  // maçıdır.
  const highlightMatch = useMemo(() => {
    const pending = displayMatches.filter((m) => !isMatchPlayed(m));
    if (!pending.length) return null;
    if (favoriteTeamId) {
      const favMatch = pending.find((m) => m.homeTeam.id === favoriteTeamId || m.awayTeam.id === favoriteTeamId);
      if (favMatch) return favMatch;
    }
    return pending.reduce((best, m) => {
      const margin = Math.abs((m.homeWinProb ?? 0) - (m.awayWinProb ?? 0));
      if (!best) return m;
      const bestMargin = Math.abs((best.homeWinProb ?? 0) - (best.awayWinProb ?? 0));
      return margin < bestMargin ? m : best;
    }, null);
  }, [displayMatches, favoriteTeamId]);

  if (!fixture) {
    return (
      <div className="page-shell fixture-empty">
        <CompetitionStepper competitionKey={competitionKey} />
        <div className="empty-card">
          <h2>Fikstür yükleniyor…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {fixture.length} Hafta · {totalMatchCount} Maç · Gerçek Fikstür
          </div>
          <h1>{competition.shortName} — Fikstür</h1>
          <p>
            Gerçek, tarihli fikstür. Henüz oynanmamış maçlarda skor yerine <b>"⏳ Bekleniyor"</b> ve modelimizin
            maç öncesi olasılık tahminini görürsün -- maçın gerçek tarihi gelene kadar sahte bir sonuç göstermeyiz.
            Oynanan maçlarda gerçek sonuç (elimizde varsa) burada görünür.
          </p>
        </div>
        {favoriteTeamId && (
          <div className="page-header-actions">
            <button
              className="btn-ghost"
              onClick={() => {
                for (const md of fixture) {
                  if (md.matches.some((m) => m.homeTeam.id === favoriteTeamId || m.awayTeam.id === favoriteTeamId)) {
                    setActiveNumber(md.number);
                    break;
                  }
                }
              }}
            >
              ⭐ Takımımın Maçlarına Git
            </button>
          </div>
        )}
      </header>

      <section className="fixture-standings-section">
        <StandingsTable
          standings={standings}
          teams={competition.teams}
          title="Güncel Puan Durumu"
          competitionKey={competitionKey}
          favoriteTeamId={favoriteTeamId}
          nextMatchByTeamId={nextMatchByTeamId}
        />
        <ZoneLegend zones={competition.zones} />
      </section>

      <div className="fixture-layout">
      <section className="fixture-matches-section" ref={matchListRef}>
        <input
          type="text"
          className="prediction-team-search"
          placeholder="🔎 Takım ara (tüm fikstürü filtrele)…"
          value={teamQuery}
          onChange={(e) => setTeamQuery(e.target.value)}
        />
        {searchResults ? (
          <>
            <p className="footnote">
              {searchResults.length === 0
                ? "Bu isimde bir takımın maçı bulunamadı."
                : `${searchResults.length} maç bulundu.`}
            </p>
            <div className="match-list">
              {searchResults.map((m) => (
                <div key={m.id} className="fixture-search-row">
                  <span className="fixture-search-week-label">{m.matchdayLabel}</span>
                  <MatchRow match={m} competitionKey={competitionKey} readOnly favoriteTeamId={favoriteTeamId} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <MatchdayTabs matchdays={fixture} active={activeMatchday?.number} onSelect={setActiveNumber} />
            <HighlightMatchCard match={highlightMatch} competitionKey={competitionKey} />
            <div className="match-list">
              {(() => {
                let lastDate = null;
                return displayMatches.map((m) => {
                  const showDateDivider = m.date && m.date !== lastDate;
                  lastDate = m.date || lastDate;
                  return (
                    <React.Fragment key={m.id}>
                      {showDateDivider && (
                        <div className="fixture-date-divider">
                          <span>{formatMatchDate(m.date, { day: "numeric", month: "long", weekday: "long" })}</span>
                        </div>
                      )}
                      <MatchRow match={m} competitionKey={competitionKey} readOnly favoriteTeamId={favoriteTeamId} />
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </>
        )}
      </section>

      <section className="chart-card fixture-calendar-section">
        <h3>📅 Maç Takvimi</h3>
        <p className="footnote">
          {favoriteTeamId
            ? "Tuttuğun takımın maçları kendi logosuyla işaretlidir. Bir güne tıkla, o günün maçını gör."
            : "Maç günleri noktayla işaretlidir. Bir güne tıkla, o günün maçını gör."}
        </p>
        <FixtureCalendar
          fixture={fixture}
          competitionKey={competitionKey}
          favoriteTeamId={favoriteTeamId}
          searchKey={searchKey}
          onSelectDay={(number) => {
            setTeamQuery("");
            setActiveNumber(number);
            matchListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </section>
      </div>
    </div>
  );
}

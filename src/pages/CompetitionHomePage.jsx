import React, { useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import StandingsTable from "../components/fixture/StandingsTable.jsx";
import ZoneLegend from "../components/fixture/ZoneLegend.jsx";
import MatchdayTabs from "../components/fixture/MatchdayTabs.jsx";
import MatchRow from "../components/fixture/MatchRow.jsx";
import HighlightMatchCard from "../components/fixture/HighlightMatchCard.jsx";
import Crest from "../components/Crest.jsx";
import Pagination from "../components/Pagination.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import {
  getRealFixture,
  getRealStandings,
  findCurrentMatchdayIndex,
  buildDisplayMatches,
  getNextMatchProbabilitiesByTeam,
  getNews,
} from "../utils/realStandingsSelectors.js";

// UCL ve Süper Lig için /:competitionKey kök sayfası -- eski kura töreni
// (DrawPage) / sahte sezon başlangıcı (LeagueHomePage) yerine artık BURASI
// açılıyor (bkz. CompetitionHomeRoute.jsx). O eski akışlar SİLİNMEDİ, sadece
// "🎮 Eğlence Modu" linkiyle ikinci plana alındı (kura-simulasyonu /
// sezon-simulasyonu rotaları, main.jsx). Bu sayfa CompetitionContext'in kura/
// simülasyon state machine'ine HİÇ dokunmaz -- tamamen realStandingsSelectors
// üzerinden, bağımsız gerçek veriden besleniyor.
export default function CompetitionHomePage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const matchListRef = useRef(null);

  const fixture = useMemo(() => getRealFixture(competitionKey), [competitionKey]);
  const { standings, started, asOf } = useMemo(() => getRealStandings(competitionKey), [competitionKey]);
  const nextMatchByTeamId = useMemo(() => getNextMatchProbabilitiesByTeam(competitionKey), [competitionKey]);
  const currentIdx = useMemo(() => findCurrentMatchdayIndex(fixture), [fixture]);
  const [activeNumber, setActiveNumber] = useState(fixture?.[currentIdx]?.number ?? 1);

  const activeMatchday = fixture?.find((md) => md.number === activeNumber) || fixture?.[currentIdx] || null;
  const displayMatches = useMemo(
    () => (activeMatchday ? buildDisplayMatches(competitionKey, activeMatchday.matches) : []),
    [competitionKey, activeMatchday]
  );

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

  const recentResults = useMemo(() => {
    if (!fixture) return [];
    const all = fixture.flatMap((md) =>
      buildDisplayMatches(competitionKey, md.matches).map((m) => ({ ...m, matchdayLabel: md.label }))
    );
    return all
      .filter((m) => m.homeGoals != null && m.awayGoals != null)
      .slice(-6)
      .reverse();
  }, [fixture, competitionKey]);

  // Sayfaya girer girmez "vay be, gerçekten çok veri var" hissi versin diye
  // -- lig genelinde birkaç öne çıkan gerçek sayı (uydurma değil, standings'ten
  // hesaplanır).
  const heroStats = useMemo(() => {
    const played = (standings || []).filter((s) => s.played > 0);
    if (played.length === 0) return null;
    const totalMatches = played.reduce((sum, s) => sum + s.played, 0) / 2;
    const totalGoals = played.reduce((sum, s) => sum + s.gf, 0);
    const topScoringTeam = [...played].sort((a, b) => b.gf - a.gf)[0];
    const bestDefenseTeam = [...played].sort((a, b) => a.ga - b.ga)[0];
    const teamById = Object.fromEntries(competition.teams.map((t) => [t.id, t]));
    return {
      totalMatches: Math.round(totalMatches),
      totalGoals,
      avgGoals: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "0.00",
      topScoringTeam: teamById[topScoringTeam.teamId],
      topScoringGoals: topScoringTeam.gf,
      bestDefenseTeam: teamById[bestDefenseTeam.teamId],
      bestDefenseGoals: bestDefenseTeam.ga,
    };
  }, [standings, competition]);

  const news = useMemo(() => getNews({ competitionKey, limit: 3 }), [competitionKey]);
  const favoriteTeam = favoriteTeamId ? competition.teams.find((t) => t.id === favoriteTeamId) : null;
  const favoriteStanding = favoriteTeamId ? standings?.find((s) => s.teamId === favoriteTeamId) || null : null;
  const favoriteNextMatch = useMemo(() => {
    if (!favoriteTeamId || !fixture) return null;
    for (const md of fixture) {
      const m = md.matches.find(
        (x) => (x.homeTeam.id === favoriteTeamId || x.awayTeam.id === favoriteTeamId) && !isMatchPlayed(x)
      );
      if (m) return m;
    }
    return null;
  }, [favoriteTeamId, fixture]);
  const favoriteNextMatchDaysAway = useMemo(() => {
    if (!favoriteNextMatch?.date) return null;
    const ms = new Date(favoriteNextMatch.date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    return Math.round(ms / 86400000);
  }, [favoriteNextMatch]);
  const funModeTo = `/${competitionKey}/${competition.format === "swiss" ? "kura-simulasyonu" : "sezon-simulasyonu"}`;
  const funModeLabel =
    competition.format === "swiss" ? "🎮 Eğlence Modu: Kendi Kurani Çek" : "🎮 Eğlence Modu: Kendi Sezonunu Simüle Et";
  const firstMatchDate = fixture?.[0]?.matches?.[0]?.date;

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Gerçek Veri · {asOf || "2026-27 Sezonu"}</div>
          <h1>{competition.name}</h1>
          <p>
            {competitionKey === "ucl"
              ? "Gerçek 2026-27 lig fazı kurası ve fikstürü. Hangi takımın kiminle hangi tarihte oynayacağını, güncel puan durumunu ve haberleri aşağıda bulabilirsin."
              : "Trendyol Süper Lig'in gerçek 2026-27 sezonu -- güncel puan durumu, fikstür ve haberler."}
          </p>
        </div>
        <div className="page-header-actions">
          <Link to={funModeTo} className="btn-secondary fun-mode-link">
            {funModeLabel}
          </Link>
        </div>
      </header>

      {heroStats && (
        <div className="hero-stats-row">
          <div className="hero-stat">
            <span className="hero-stat-value">{heroStats.totalMatches}</span>
            <span className="hero-stat-label">Oynanan Maç</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{heroStats.totalGoals}</span>
            <span className="hero-stat-label">Toplam Gol</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{heroStats.avgGoals}</span>
            <span className="hero-stat-label">Maç Başı Gol</span>
          </div>
          {heroStats.topScoringTeam && (
            <div className="hero-stat hero-stat-team">
              <Crest team={heroStats.topScoringTeam} size={26} />
              <div>
                <span className="hero-stat-value">{heroStats.topScoringGoals}</span>
                <span className="hero-stat-label">En Golcü: {heroStats.topScoringTeam.short}</span>
              </div>
            </div>
          )}
          {heroStats.bestDefenseTeam && (
            <div className="hero-stat hero-stat-team">
              <Crest team={heroStats.bestDefenseTeam} size={26} />
              <div>
                <span className="hero-stat-value">{heroStats.bestDefenseGoals}</span>
                <span className="hero-stat-label">En Az Yiyen: {heroStats.bestDefenseTeam.short}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {favoriteTeam && (
        <div className="favorite-spotlight-card">
          <Link to={`/${competitionKey}/takim/${favoriteTeam.id}`} className="favorite-spotlight-crest">
            <Crest team={favoriteTeam} size={56} />
          </Link>
          <div className="favorite-spotlight-info">
            <span className="favorite-spotlight-label">⭐ Tuttuğun Takım</span>
            <Link to={`/${competitionKey}/takim/${favoriteTeam.id}`} className="favorite-spotlight-name">
              {favoriteTeam.name}
            </Link>
            {favoriteStanding && (
              <span className="favorite-spotlight-meta">
                #{favoriteStanding.rank} · {favoriteStanding.pts} puan · {favoriteStanding.played} maç
              </span>
            )}
          </div>
          {favoriteNextMatch && (
            <div className="favorite-spotlight-next">
              <span className="favorite-spotlight-next-label">
                {favoriteNextMatchDaysAway != null && favoriteNextMatchDaysAway <= 2 ? "🔥 Yaklaşıyor" : "Sıradaki Maç"}
              </span>
              <Link to={`/${competitionKey}/mac/${favoriteNextMatch.id}`} className="favorite-spotlight-next-match">
                <Crest team={favoriteNextMatch.homeTeam} size={22} />
                <span>{favoriteNextMatch.homeTeam.short} - {favoriteNextMatch.awayTeam.short}</span>
                <Crest team={favoriteNextMatch.awayTeam} size={22} />
              </Link>
              {formatMatchDate(favoriteNextMatch.date) && (
                <span className="favorite-spotlight-next-date">
                  {formatMatchDate(favoriteNextMatch.date)}
                  {favoriteNextMatchDaysAway === 0
                    ? " · bugün"
                    : favoriteNextMatchDaysAway === 1
                      ? " · yarın"
                      : favoriteNextMatchDaysAway != null && favoriteNextMatchDaysAway <= 7
                        ? ` · ${favoriteNextMatchDaysAway} gün sonra`
                        : ""}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {!started && competitionKey === "ucl" && (
        <div className="stats-callout">
          Lig fazı henüz başlamadı{firstMatchDate ? ` -- ilk maçlar ${formatMatchDate(firstMatchDate, { day: "numeric", month: "long" })} tarihinde` : ""}.
          Aşağıda tam fikstürü, takımların kendi liglerindeki durumunu ve haberleri şimdiden inceleyebilirsin.
        </div>
      )}

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

      {heroStats && (
        <Link to={`/${competitionKey}/istatistik`} className="analysis-teaser-card">
          <div>
            <span className="analysis-teaser-eyebrow">📈 Daha Fazlası</span>
            <h3>İstatistikler &amp; Analiz</h3>
            <p>
              Puan durumu gelişimi, iç saha/deplasman performansı, sezon sonu projeksiyonu, form durumu ve sıradaki
              haftanın model tahminleri seni bekliyor.
            </p>
          </div>
          <span className="analysis-teaser-arrow">→</span>
        </Link>
      )}

      {fixture && (
        <section className="fixture-matches-section" ref={matchListRef}>
          <MatchdayTabs matchdays={fixture} active={activeMatchday?.number} onSelect={setActiveNumber} />
          <HighlightMatchCard match={highlightMatch} competitionKey={competitionKey} />
          <Pagination key={activeMatchday?.number} items={displayMatches} pageSize={8} topRef={matchListRef}>
            {(pageItems) => (
              <div className="match-list">
                {pageItems.map((m) => (
                  <MatchRow key={m.id} match={m} competitionKey={competitionKey} readOnly favoriteTeamId={favoriteTeamId} />
                ))}
              </div>
            )}
          </Pagination>
        </section>
      )}

      {recentResults.length > 0 && (
        <div className="chart-card chart-card-wide live-results-card">
          <h3>Son Sonuçlar</h3>
          <div className="live-results-list">
            {recentResults.map((m) => (
              <div key={m.id} className="live-result-row">
                <span className="live-result-label">{m.matchdayLabel}</span>
                <span className="live-result-team">
                  <Crest team={m.homeTeam} size={20} />
                  <span className="live-result-team-name">{m.homeTeam.name}</span>
                </span>
                <span className="live-result-score">
                  {m.homeGoals} - {m.awayGoals}
                </span>
                <span className="live-result-team">
                  <span className="live-result-team-name">{m.awayTeam.name}</span>
                  <Crest team={m.awayTeam} size={20} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chart-card chart-card-wide news-preview-card">
        <div className="news-preview-head">
          <h3>📰 Haberler</h3>
          <Link to={`/${competitionKey}/haberler`}>Tümünü Gör →</Link>
        </div>
        {news.length === 0 ? (
          <p className="standings-empty">Henüz haber eklenmedi.</p>
        ) : (
          <div className="news-preview-list">
            {news.map((n) => (
              <div key={n.id} className="news-preview-item">
                <span className="news-preview-date">{formatMatchDate(n.date)}</span>
                <span className="news-preview-title">{n.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

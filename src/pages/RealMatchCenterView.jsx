import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Crest from "../components/Crest.jsx";
import ProbabilityBar from "../components/ProbabilityBar.jsx";
import ProbableLineup from "../components/ProbableLineup.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import {
  getRealFixture,
  getRealMatchResult,
  getMatchWinProbability,
  getHeadToHead,
  getDomesticForm,
  getSuperLigTeamForm,
  getNews,
} from "../utils/realStandingsSelectors.js";

function FormBadges({ form }) {
  if (!form || form.length === 0) return <span className="standings-empty">Form verisi yok</span>;
  return (
    <div className="form-badge-row">
      {form.map((r, i) => (
        <span key={i} className={`form-badge form-badge-${r}`}>
          {r}
        </span>
      ))}
    </div>
  );
}

function TeamFormCard({ competitionKey, team }) {
  const domestic = getDomesticForm(team.id);
  const superLigForm = competitionKey === "superlig" ? getSuperLigTeamForm(team.name) : null;

  return (
    <div className="real-team-form-block">
      <div className="real-team-form-head">
        <Crest team={team} size={28} />
        <span>{team.name}</span>
      </div>
      {competitionKey === "superlig" ? (
        <>
          <div className="real-team-form-row">
            <span className="real-team-form-label">Süper Lig Formu (son 5)</span>
            <FormBadges form={superLigForm} />
          </div>
        </>
      ) : domestic ? (
        <>
          <div className="real-team-form-row">
            <span className="real-team-form-label">
              {domestic.league} — {domestic.position ? `${domestic.position}.` : "?"} sıra
              {domestic.played != null ? ` (${domestic.played} maç, ${domestic.pts} puan)` : ""}
            </span>
          </div>
          <div className="real-team-form-row">
            <span className="real-team-form-label">Son 5 maç</span>
            <FormBadges form={domestic.form} />
          </div>
          {domestic.asOf && <span className="real-team-form-asof">Anlık görüntü: {domestic.asOf}</span>}
        </>
      ) : (
        <p className="standings-empty">Bu takımın kendi ligindeki form verisi henüz eklenmedi.</p>
      )}
    </div>
  );
}


// UCL/Süper Lig'de bir maçın "Maç Merkezi" görünümü -- sahte dakika-dakika
// Poisson oynatması YERİNE: oynanmadıysa model tahmini + karşılıklı geçmiş +
// form + kadro + haberler; oynandıysa (ve gerçek sonucu elimizdeyse) gerçek
// skor + maç öncesi tahminle karşılaştırma; oynandı ama sonucu henüz elle
// girilmediyse dürüst bir "henüz eklenmedi" durumu (ASLA sahte skor UYDURULMAZ).
export default function RealMatchCenterView() {
  const { competitionKey, matchId } = useParams();
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const fixture = useMemo(() => getRealFixture(competitionKey), [competitionKey]);

  const found = useMemo(() => {
    for (const md of fixture || []) {
      const m = md.matches.find((x) => String(x.id) === matchId);
      if (m) return { match: m, matchdayLabel: md.label };
    }
    return null;
  }, [fixture, matchId]);

  if (!found) {
    return (
      <div className="page-shell">
        <CompetitionStepper competitionKey={competitionKey} />
        <EmptyState
          title="Maç bulunamadı"
          description="Bu maç şu anki gerçek fikstürde yok."
          primaryCta={{ label: "Fikstüre dön", to: `/${competitionKey}/fikstur` }}
        />
      </div>
    );
  }

  const { match, matchdayLabel } = found;
  const { homeTeam, awayTeam } = match;
  const played = isMatchPlayed(match);
  const result = getRealMatchResult(competitionKey, match);
  const probs = getMatchWinProbability(homeTeam, awayTeam, competition);
  const homePct = Math.round(probs.homeWinProb * 100);
  const drawPct = Math.round(probs.drawProb * 100);
  const awayPct = Math.max(0, 100 - homePct - drawPct);
  const h2h = getHeadToHead(homeTeam.id, awayTeam.id);
  const news = getNews({ competitionKey, matchId: match.id }).length
    ? getNews({ competitionKey, matchId: match.id })
    : [...getNews({ competitionKey, teamId: homeTeam.id, limit: 2 }), ...getNews({ competitionKey, teamId: awayTeam.id, limit: 2 })];
  const dateLabel = match.date
    ? formatMatchDate(match.date, { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">
            {competition.shortName} · {matchdayLabel} · {played ? "Maç Merkezi" : "Maç Analizi"}
          </div>
          <h1>
            {homeTeam.name} — {awayTeam.name}
          </h1>
          <p>{dateLabel ? `${dateLabel} tarihinde ${played ? "oynandı" : "oynanacak"}.` : ""}</p>
        </div>
      </header>

      <div className="matchcenter-scorebar">
        <div className="matchcenter-team">
          <Crest team={homeTeam} size={54} />
          <span>
            {homeTeam.name}
            {favoriteTeamId === homeTeam.id && <span className="favorite-star" title="Tuttuğun takım">⭐</span>}
          </span>
        </div>
        <div className="matchcenter-score">
          {result ? `${result.homeGoals} : ${result.awayGoals}` : played ? "– : –" : "vs"}
        </div>
        <div className="matchcenter-team matchcenter-team-away">
          <span>
            {favoriteTeamId === awayTeam.id && <span className="favorite-star" title="Tuttuğun takım">⭐</span>}
            {awayTeam.name}
          </span>
          <Crest team={awayTeam} size={54} />
        </div>
      </div>

      {played && !result && (
        <div className="stats-callout">
          Bu maç oynandı ama gerçek sonucu bu sitede henüz elle eklenmedi -- sahte bir skor göstermek yerine dürüstçe
          boş bırakıyoruz. Kısa süre içinde eklenecek.
        </div>
      )}

      <div className="chart-card chart-card-wide">
        <h3>📊 {played && result ? "Maç Öncesi Model Tahmini" : "Modelimizin Tahmini"}</h3>
        <p className="footnote">
          Bu gerçek bir bahis oranı değildir -- takımların katsayı/kadro gücüne dayalı istatistiksel modelimizin
          maç ÖNCESİ ürettiği bir olasılık tahminidir.
        </p>
        <ProbabilityBar homeTeam={homeTeam} awayTeam={awayTeam} homePct={homePct} drawPct={drawPct} awayPct={awayPct} />
        {played && result && (
          <p className="footnote">
            Gerçek sonuç: <b>{homeTeam.short} {result.homeGoals} - {result.awayGoals} {awayTeam.short}</b>
          </p>
        )}
      </div>

      <div className="chart-card chart-card-wide">
        <h3>🤝 Karşılıklı Geçmiş</h3>
        {h2h ? (
          <>
            <p className="footnote">
              {h2h.summary?.played ?? h2h.meetings.length} karşılaşma · {homeTeam.short} {h2h.summary?.homeTeamWins ?? "?"} G ·{" "}
              {h2h.summary?.draws ?? "?"} B · {awayTeam.short} {h2h.summary?.awayTeamWins ?? "?"} G
              <span className="footnote-note"> (kazanma sayıları, alfabetik sırayla ilk takıma göre)</span>
            </p>
            <ul className="h2h-meeting-list">
              {h2h.meetings.map((m, i) => (
                <li key={i}>
                  <span className="h2h-meeting-date">{formatMatchDate(m.date, { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="h2h-meeting-comp">{m.competition}</span>
                  <span className="h2h-meeting-score">
                    {m.homeTeam} {m.homeGoals}-{m.awayGoals} {m.awayTeam}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="footnote">
            Bu iki takım için henüz araştırılmış bir gerçek karşılaşma geçmişi yok -- muhtemelen daha önce hiç
            (ya da çok az) karşılaştılar. Uydurma bir geçmiş göstermek yerine burayı dürüstçe boş bırakıyoruz.
          </p>
        )}
      </div>

      <div className="chart-card chart-card-wide">
        <h3>📈 Form &amp; Lig Durumu</h3>
        <div className="real-team-form-grid">
          <TeamFormCard competitionKey={competitionKey} team={homeTeam} />
          <TeamFormCard competitionKey={competitionKey} team={awayTeam} />
        </div>
      </div>

      <div className="chart-card chart-card-wide">
        <h3>🔮 Olası Kadro</h3>
        <div className="probable-lineup-grid">
          <ProbableLineup
            competitionKey={competitionKey}
            team={homeTeam}
            players={competition.getPlayersByTeam(homeTeam.id)}
          />
          <ProbableLineup
            competitionKey={competitionKey}
            team={awayTeam}
            players={competition.getPlayersByTeam(awayTeam.id)}
          />
        </div>
      </div>

      <div className="chart-card chart-card-wide">
        <h3>📰 Güncel Haberler</h3>
        {news.length === 0 ? (
          <p className="footnote">Bu maç ve takımlarla ilgili henüz eklenmiş bir haber yok.</p>
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
        <Link to={`/${competitionKey}/haberler`} className="footnote">
          Tüm haberleri gör →
        </Link>
      </div>
    </div>
  );
}

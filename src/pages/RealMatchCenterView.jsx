import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { getCompetition } from "../data/competitions.js";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Crest from "../components/Crest.jsx";
import ProbabilityBar from "../components/ProbabilityBar.jsx";
import ProbableLineup from "../components/ProbableLineup.jsx";
import ActualLineup from "../components/ActualLineup.jsx";
import { ACTUAL_LINEUPS } from "../data/actualLineups.js";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { isMatchPlayed, formatMatchDate } from "../utils/matchDate.js";
import { CHART_GRID, CHART_AXIS, CHART_SERIES } from "../utils/chartTheme.js";
import {
  getRealFixture,
  getRealMatchResult,
  getCombinedMatchPrediction,
  getHeadToHead,
  getDomesticForm,
  getSuperLigTeamForm,
  getNews,
  getMatchRadarComparison,
  getMatchStatsSummary,
  getStreaks,
} from "../utils/realStandingsSelectors.js";

// "Google'daki gibi" -- iki takımın bu sezonki gerçek sonuçlarından türetilen
// birkaç kısa istatistiği yan yana koyan küçük bir karşılaştırma satırı
// (temiz sayfa/KG var/2.5 üst yüzdeleri + güncel seri). getMatchStatsSummary/
// getStreaks zaten TÜM takımlar için hesaplanıyor (İstatistikler sayfasında
// kullanılıyor) -- burada sadece bu maçın iki takımına filtreleniyor.
// homePct/awayPct verilirse (ikisi de sayı) satırın altında orantılı, iki
// renkli bir "çekişme" çubuğu da çizilir -- ham sayıları yan yana koymaktan
// çok daha okunaklı bir karşılaştırma (kullanıcı geri bildirimi: "sağdaki
// kısmı daha güzel tasarım yap"). Sayısal olmayan satırlar (ör. güncel seri)
// için homePct/awayPct verilmez, sadece metin gösterilir.
function TeamQuickStatsRow({ label, homeValue, awayValue, suffix = "", homePct, awayPct }) {
  const hasBar = typeof homePct === "number" && typeof awayPct === "number";
  const total = hasBar ? Math.max(homePct + awayPct, 1) : 0;
  return (
    <div className="match-compare-row">
      <div className="match-compare-row-top">
        <span className="match-compare-value">{homeValue}{suffix}</span>
        <span className="match-compare-label">{label}</span>
        <span className="match-compare-value">{awayValue}{suffix}</span>
      </div>
      {hasBar && (
        <div className="match-compare-bar">
          <span className="match-compare-bar-home" style={{ width: `${(homePct / total) * 100}%` }} />
          <span className="match-compare-bar-away" style={{ width: `${(awayPct / total) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

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
  const prediction = getCombinedMatchPrediction(homeTeam, awayTeam, competition);
  const homePct = Math.round(prediction.home * 100);
  const drawPct = Math.round(prediction.draw * 100);
  const awayPct = Math.max(0, 100 - homePct - drawPct);
  const h2hStats = prediction.h2hStats;
  const h2h = getHeadToHead(homeTeam.id, awayTeam.id);
  const news = getNews({ competitionKey, matchId: match.id }).length
    ? getNews({ competitionKey, matchId: match.id })
    : [...getNews({ competitionKey, teamId: homeTeam.id, limit: 2 }), ...getNews({ competitionKey, teamId: awayTeam.id, limit: 2 })];
  const dateLabel = match.date
    ? formatMatchDate(match.date, { day: "numeric", month: "long", year: "numeric" })
    : null;
  const radarComparison = getMatchRadarComparison(competitionKey, homeTeam.id, awayTeam.id);
  const matchStatsSummary = getMatchStatsSummary(competitionKey);
  const homeMatchStats = matchStatsSummary.find((s) => s.teamId === homeTeam.id) || null;
  const awayMatchStats = matchStatsSummary.find((s) => s.teamId === awayTeam.id) || null;
  const streaks = getStreaks(competitionKey);
  const homeStreak = streaks.find((s) => s.teamId === homeTeam.id) || null;
  const awayStreak = streaks.find((s) => s.teamId === awayTeam.id) || null;
  const pct = (s) => (s && s.played > 0 ? Math.round((s.cleanSheets / s.played) * 100) : null);
  const bttsPct = (s) => (s && s.played > 0 ? Math.round((s.btts / s.played) * 100) : null);
  const over25Pct = (s) => (s && s.played > 0 ? Math.round((s.over25 / s.played) * 100) : null);
  const streakLabel = (s) => (s ? `${s.length} maçtır ${s.type === "W" ? "galip" : s.type === "L" ? "mağlup" : "berabere"}` : "–");
  const hasQuickStats = homeMatchStats || awayMatchStats;
  const actualLineupEntry = ACTUAL_LINEUPS.find((l) => l.matchId === match.id) || null;
  const hasHomeActualXI = played && !!actualLineupEntry?.homeXI?.length;
  const hasAwayActualXI = played && !!actualLineupEntry?.awayXI?.length;
  const lineupHeading =
    hasHomeActualXI && hasAwayActualXI
      ? "✅ Sahaya Çıkan Kadro"
      : hasHomeActualXI || hasAwayActualXI
      ? "✅ Sahaya Çıkan Kadro / 🔮 Olası Kadro"
      : "🔮 Olası Kadro";

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
          Bu gerçek bir bahis oranı değildir. {prediction.usedH2H ? (
            <>
              Takımların katsayı/kadro gücüne dayalı istatistiksel modelin tahmini İLE bu iki takımın gerçek ikili
              geçmişinden ({h2hStats.played} karşılaşma) çıkarılan galibiyet oranının <b>ortalaması</b> alınarak
              hesaplanmıştır.
            </>
          ) : (
            <>Takımların katsayı/kadro gücüne dayalı istatistiksel modelimizin maç ÖNCESİ ürettiği bir olasılık tahminidir.</>
          )}
        </p>
        <ProbabilityBar homeTeam={homeTeam} awayTeam={awayTeam} homePct={homePct} drawPct={drawPct} awayPct={awayPct} />
        {prediction.usedH2H && (
          <p className="footnote footnote-note">
            Model tekbaşına: {homeTeam.short} %{Math.round(prediction.model.homeWinProb * 100)} · Beraberlik %
            {Math.round(prediction.model.drawProb * 100)} · {awayTeam.short} %{Math.round(prediction.model.awayWinProb * 100)}
            {" "}— İkili geçmiş tekbaşına: {homeTeam.short} %{h2hStats.homeWinPct} · Beraberlik %{h2hStats.drawPct} ·{" "}
            {awayTeam.short} %{h2hStats.awayWinPct}
          </p>
        )}
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
            {h2hStats && (
              <div className="h2h-stats-grid">
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.homeWinPct}%</span>
                  <span className="h2h-stat-label">{homeTeam.short} Galibiyet</span>
                </div>
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.drawPct}%</span>
                  <span className="h2h-stat-label">Beraberlik</span>
                </div>
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.awayWinPct}%</span>
                  <span className="h2h-stat-label">{awayTeam.short} Galibiyet</span>
                </div>
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.homeGoals}-{h2hStats.awayGoals}</span>
                  <span className="h2h-stat-label">Toplam Gol ({homeTeam.short}-{awayTeam.short})</span>
                </div>
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.avgGoals}</span>
                  <span className="h2h-stat-label">Maç Başı Ort. Gol</span>
                </div>
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.bttsPct}%</span>
                  <span className="h2h-stat-label">Karşılıklı Gol (BTTS)</span>
                </div>
                <div className="h2h-stat-cell">
                  <span className="h2h-stat-n">{h2hStats.over25Pct}%</span>
                  <span className="h2h-stat-label">2.5 Üstü Gol</span>
                </div>
              </div>
            )}
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
        <h3>📊 Takım Karşılaştırması</h3>
        <p className="footnote">
          Gerçek kadro gücü, katsayı, form ve (varsa) lig konumundan türetilen çok-eksenli bir profil karşılaştırması
          -- 0-100 arası göreceli bir ölçektir, resmi bir istatistik değildir (bkz. sitenin kendi normalize modeli).
        </p>
        <div className="match-compare-layout">
          {radarComparison.length > 0 && (
            <div className="match-compare-radar">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarComparison} outerRadius={100}>
                  <PolarGrid stroke={CHART_GRID} />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
                  <PolarRadiusAxis stroke={CHART_GRID} tick={{ fill: CHART_AXIS, fontSize: 10 }} domain={[0, 100]} />
                  <Radar dataKey="teamA" name={homeTeam.short} stroke={CHART_SERIES[0]} fill={CHART_SERIES[0]} fillOpacity={0.32} />
                  <Radar dataKey="teamB" name={awayTeam.short} stroke={CHART_SERIES[7]} fill={CHART_SERIES[7]} fillOpacity={0.28} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          {hasQuickStats && (
            <div className="match-compare-stats">
              <div className="match-compare-head">
                <span className="match-compare-head-team">
                  <Crest team={homeTeam} size={22} />
                  {homeTeam.short}
                </span>
                <span className="match-compare-head-vs">VS</span>
                <span className="match-compare-head-team match-compare-head-team-away">
                  {awayTeam.short}
                  <Crest team={awayTeam} size={22} />
                </span>
              </div>
              <TeamQuickStatsRow
                label="Temiz Sayfa"
                homeValue={pct(homeMatchStats) ?? "–"}
                awayValue={pct(awayMatchStats) ?? "–"}
                suffix={pct(homeMatchStats) != null ? "%" : ""}
                homePct={pct(homeMatchStats) ?? 0}
                awayPct={pct(awayMatchStats) ?? 0}
              />
              <TeamQuickStatsRow
                label="Karşılıklı Gol (BTTS)"
                homeValue={bttsPct(homeMatchStats) ?? "–"}
                awayValue={bttsPct(awayMatchStats) ?? "–"}
                suffix={bttsPct(homeMatchStats) != null ? "%" : ""}
                homePct={bttsPct(homeMatchStats) ?? 0}
                awayPct={bttsPct(awayMatchStats) ?? 0}
              />
              <TeamQuickStatsRow
                label="2.5 Üstü Gol"
                homeValue={over25Pct(homeMatchStats) ?? "–"}
                awayValue={over25Pct(awayMatchStats) ?? "–"}
                suffix={over25Pct(homeMatchStats) != null ? "%" : ""}
                homePct={over25Pct(homeMatchStats) ?? 0}
                awayPct={over25Pct(awayMatchStats) ?? 0}
              />
              <TeamQuickStatsRow label="Güncel Seri" homeValue={streakLabel(homeStreak)} awayValue={streakLabel(awayStreak)} />
            </div>
          )}
        </div>
      </div>

      <div className="chart-card chart-card-wide">
        <h3>{lineupHeading}</h3>
        <div className="probable-lineup-grid">
          {hasHomeActualXI ? (
            <ActualLineup
              competitionKey={competitionKey}
              team={homeTeam}
              players={competition.getPlayersByTeam(homeTeam.id)}
              xiNames={actualLineupEntry.homeXI}
              source={actualLineupEntry.source}
            />
          ) : (
            <ProbableLineup
              competitionKey={competitionKey}
              team={homeTeam}
              players={competition.getPlayersByTeam(homeTeam.id)}
            />
          )}
          {hasAwayActualXI ? (
            <ActualLineup
              competitionKey={competitionKey}
              team={awayTeam}
              players={competition.getPlayersByTeam(awayTeam.id)}
              xiNames={actualLineupEntry.awayXI}
              source={actualLineupEntry.source}
            />
          ) : (
            <ProbableLineup
              competitionKey={competitionKey}
              team={awayTeam}
              players={competition.getPlayersByTeam(awayTeam.id)}
            />
          )}
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

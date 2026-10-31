import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import { TOP_SCORERS } from "../data/topScorers.js";
import Crest from "../components/Crest.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";
import NewsHubHeader from "../components/newsHub/NewsHubHeader.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { formatMatchDate } from "../utils/matchDate.js";
import { getNews, getRealStandings } from "../utils/realStandingsSelectors.js";

const PAGE_SIZE = 6;
const COMPETITION_FILTERS = [
  { key: "all", label: "Tümü (Süper Lig + ŞL)" },
  { key: "superlig", label: "Trendyol Süper Lig" },
  { key: "ucl", label: "UEFA Şampiyonlar Ligi" },
];
const COMPETITION_TAG = { superlig: "Süper Lig", ucl: "Şampiyonlar Ligi" };

const normalize = (text) => (text || "").toLocaleLowerCase("tr-TR");
const longDate = (iso) => formatMatchDate(iso, { day: "numeric", month: "long", year: "numeric" });

function relativeDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today - then) / 86400000);
  if (diff <= 0) return "Bugün";
  if (diff === 1) return "Dün";
  if (diff < 30) return `${diff} gün önce`;
  return longDate(iso);
}

// Kaynak satırı "Hürriyet / Habertürk / ESPN" biçiminde -- tek tek ayrılıp sayılır.
function countSources(items) {
  const counts = new Map();
  for (const n of items) {
    for (const s of (n.source || "").split("/").map((x) => x.trim()).filter(Boolean)) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function TeamChips({ ids, teamById, competitionKey }) {
  const teams = (ids || []).map((id) => teamById[id]).filter(Boolean);
  if (teams.length === 0) return null;
  return (
    <div className="sa-team-chips">
      {teams.slice(0, 4).map((t) => (
        <Link key={t.id} to={`/${t.competitionKey || competitionKey}/takim/${t.id}`} className="sa-team-chip">
          <Crest team={t} size={14} />
          {t.short}
        </Link>
      ))}
      {teams.length > 4 && <span className="sa-team-chip is-more">+{teams.length - 4}</span>}
    </div>
  );
}

function StandingsMini({ competitionKey, teamById }) {
  const { standings, asOf } = getRealStandings(competitionKey);
  if (!standings?.length) return null;
  const rows = standings.slice(0, 5);
  return (
    <aside className="sa-hero-side">
      <div className="sa-hero-side-head">
        <span className="sa-caps">Puan durumu · ilk 5</span>
        <span className="sa-pill-mono">{COMPETITION_TAG[competitionKey]}</span>
      </div>
      <ol className="sa-mini-table">
        {rows.map((row, i) => {
          const team = teamById[row.teamId ?? row.team?.id];
          if (!team) return null;
          return (
            <li key={team.id}>
              <span className="sa-mini-rank">{row.rank ?? i + 1}</span>
              <Link to={`/${competitionKey}/takim/${team.id}`} className="sa-mini-team">
                <Crest team={team} size={18} />
                {team.name}
              </Link>
              <span className="sa-mini-num">{row.played}</span>
              <span className="sa-mini-pts">{row.pts ?? row.points}</span>
            </li>
          );
        })}
      </ol>
      <Link to={`/${competitionKey}`} className="sa-link-arrow">
        Tüm tabloyu gör →
      </Link>
      {asOf && <p className="sa-hero-side-note">Kaynak: {asOf}</p>}
    </aside>
  );
}

// Haberler -- Stitch "Süper Analiz Football Hub" tasarımı (2026-10-28).
// İçerik tamamen src/data/news.js'teki gerçek, kaynaklı haberlerden gelir;
// tasarımdaki anket / bülten / "canlı besleme" gibi öğelerin arkasında
// gerçek bir veri ya da servis olmadığı için onların yerine gerçek veriyle
// beslenen kartlar (puan durumu, gol krallığı, kaynak dağılımı) kullanıldı.
export default function NewsPage() {
  const { competitionKey } = useParams();
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const topRef = useRef(null);

  const [competitionFilter, setCompetitionFilter] = useState(competitionKey);
  const [teamFilter, setTeamFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCompetitionFilter(competitionKey);
    setTeamFilter(null);
  }, [competitionKey]);
  useEffect(() => setPage(1), [competitionFilter, teamFilter, query, sort]);

  const teams = useMemo(() => {
    const keys = competitionFilter === "all" ? ["superlig", "ucl"] : [competitionFilter];
    return keys.flatMap((key) => getCompetition(key).teams.map((t) => ({ ...t, competitionKey: key })));
  }, [competitionFilter]);
  const teamById = useMemo(() => {
    const all = ["superlig", "ucl"].flatMap((key) =>
      getCompetition(key).teams.map((t) => ({ ...t, competitionKey: key }))
    );
    return Object.fromEntries(all.map((t) => [t.id, t]));
  }, []);

  const activeTeam = teamFilter !== null ? teamFilter : competitionFilter === competitionKey ? favoriteTeamId : null;

  const news = useMemo(() => {
    let items = getNews({
      competitionKey: competitionFilter === "all" ? undefined : competitionFilter,
      teamId: activeTeam || undefined,
    }).filter((n) => n.competitionKey === "superlig" || n.competitionKey === "ucl");
    const q = normalize(query.trim());
    if (q) items = items.filter((n) => normalize(`${n.title} ${n.summary}`).includes(q));
    return sort === "oldest" ? [...items].reverse() : items;
  }, [competitionFilter, activeTeam, query, sort]);

  const [featured, ...rest] = news;
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pageItems = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sideCompetition = competitionFilter === "all" ? competitionKey : competitionFilter;
  const scorers = useMemo(
    () => TOP_SCORERS.filter((s) => s.competitionKey === sideCompetition).sort((a, b) => b.goals - a.goals).slice(0, 5),
    [sideCompetition]
  );
  const sources = useMemo(() => countSources(news), [news]);

  const goToPage = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sa-page">
      <NewsHubHeader
        competitionKey={competitionKey}
        active="news"
        lastDate={news[0] && longDate(sort === "oldest" ? news[news.length - 1].date : news[0].date)}
        itemCount={news.length}
      />

      <section className="sa-card sa-filter-card">
        <div className="sa-filter-chips">
          {COMPETITION_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`sa-filter-chip ${competitionFilter === f.key ? "active" : ""}`}
              onClick={() => {
                setCompetitionFilter(f.key);
                setTeamFilter(null);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sa-filter-row">
          <label className="sa-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Başlık veya özet içinde ara…"
            />
          </label>
          <select className="sa-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sıralama">
            <option value="newest">Sırala: En Yeni</option>
            <option value="oldest">Sırala: En Eski</option>
          </select>
          <div className="sa-filter-team">
            <TeamFilterSelect
              teams={teams}
              value={activeTeam || ""}
              onChange={(id) => setTeamFilter(id || "")}
              placeholder={favoriteTeamId && teamFilter === null ? "⭐ Tuttuğun takım" : "Takıma göre filtrele…"}
            />
          </div>
          {(activeTeam || query) && (
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setTeamFilter("");
                setQuery("");
              }}
            >
              Filtreleri temizle ✕
            </button>
          )}
        </div>
      </section>

      {!featured ? (
        <section className="sa-card sa-empty">
          {activeTeam || query ? "Bu filtrelere uyan bir haber bulunamadı." : "Henüz haber eklenmedi."}
        </section>
      ) : (
        <>
          {page === 1 && (
            <section className="sa-card sa-hero">
              <div className="sa-hero-main">
                <div className="sa-hero-tags">
                  <span className="sa-tag-solid">{sort === "oldest" ? "İlk kayıt" : "Son gelişme"}</span>
                  <span className="sa-tag-soft">{COMPETITION_TAG[featured.competitionKey]}</span>
                  <span className="sa-hero-time">◷ {relativeDay(featured.date)}</span>
                </div>
                <h2 className="sa-hero-title">{featured.title}</h2>
                <p className="sa-hero-summary">{featured.summary}</p>
                <div className="sa-hero-byline">
                  <span>{featured.source}</span>
                  <span className="sa-mono">{longDate(featured.date)}</span>
                </div>
                <TeamChips ids={featured.relatedTeamIds} teamById={teamById} competitionKey={featured.competitionKey} />
                <div className="sa-hero-actions">
                  {featured.url && (
                    <a href={featured.url} target="_blank" rel="noopener noreferrer" className="sa-btn-primary">
                      Haberin kaynağını oku →
                    </a>
                  )}
                  <Link to={`/${featured.competitionKey}/istatistik`} className="sa-btn-secondary">
                    Lig istatistiklerine git
                  </Link>
                </div>
              </div>
              <StandingsMini competitionKey={featured.competitionKey} teamById={teamById} />
            </section>
          )}

          <div className="sa-news-layout" ref={topRef}>
            <section>
              <div className="sa-section-head">
                <h3>
                  <span className="sa-dot" /> Son Haberler
                </h3>
                <span className="sa-mono sa-muted">{rest.length} haber listeleniyor</span>
              </div>

              {pageItems.length === 0 ? (
                <div className="sa-card sa-empty">Gösterilecek başka haber yok.</div>
              ) : (
                <div className="sa-news-grid">
                  {pageItems.map((n) => (
                    <article key={n.id} className="sa-card sa-news-card">
                      <div className="sa-news-card-top">
                        <span className={`sa-tag-soft is-${n.competitionKey}`}>{COMPETITION_TAG[n.competitionKey]}</span>
                        <span className="sa-muted sa-small">{relativeDay(n.date)}</span>
                      </div>
                      <h4 className="sa-news-card-title">{n.title}</h4>
                      <p className="sa-news-card-summary">{n.summary}</p>
                      <TeamChips ids={n.relatedTeamIds} teamById={teamById} competitionKey={n.competitionKey} />
                      <div className="sa-news-card-foot">
                        <span className="sa-muted sa-small">{n.source}</span>
                        {n.url && (
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="sa-link-arrow">
                            Kaynak →
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {rest.length > 0 && (
                <div className="sa-card sa-pagination">
                  <span className="sa-muted sa-small">
                    Toplam <b>{rest.length}</b> haberden {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, rest.length)} arası listeleniyor
                  </span>
                  <div className="sa-pagination-buttons">
                    <button type="button" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                      Önceki
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && p - arr[i - 1] > 1 && <span className="sa-muted">…</span>}
                          <button
                            type="button"
                            className={p === page ? "active" : ""}
                            onClick={() => goToPage(p)}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button type="button" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="sa-rail">
              {scorers.length > 0 && (
                <section className="sa-card sa-rail-card">
                  <div className="sa-rail-head">
                    <h4>Gol Krallığı</h4>
                    <span className="sa-pill-mono">{COMPETITION_TAG[sideCompetition]}</span>
                  </div>
                  <ol className="sa-rail-list">
                    {scorers.map((s, i) => {
                      const team = teamById[s.teamId];
                      return (
                        <li key={s.playerName + s.teamId}>
                          <span className="sa-mini-rank">{i + 1}</span>
                          <span className="sa-rail-player">
                            <b>{s.playerName}</b>
                            {team && <span className="sa-muted sa-small">{team.name}</span>}
                          </span>
                          <span className="sa-rail-goals">{s.goals}</span>
                        </li>
                      );
                    })}
                  </ol>
                  <Link to={`/${sideCompetition}/istatistik`} className="sa-link-arrow">
                    Tüm istatistikler →
                  </Link>
                </section>
              )}

              <section className="sa-card sa-rail-card">
                <div className="sa-rail-head">
                  <h4>Kaynak Şeffaflığı</h4>
                  <span className="sa-status-chip is-green">Kaynaklı</span>
                </div>
                <p className="sa-muted sa-small">
                  Her haber özeti belirtilen kaynaklara dayanır. Skorlar ve golcüler en az iki bağımsız kaynakla
                  doğrulanır, doğrulanamayan bilgi yazılmaz.
                </p>
                <div className="sa-source-pills">
                  {sources.map(([name, count]) => (
                    <span key={name} className="sa-source-pill">
                      {name} <span className="sa-mono sa-muted">{count}</span>
                    </span>
                  ))}
                </div>
              </section>

              <section className="sa-card sa-rail-card sa-rail-cta">
                <h4>Sezon Hikayesi</h4>
                <p className="sa-muted sa-small">
                  Rekorlar, sürprizler ve tarihi anlar haftası haftasına zaman çizelgesinde.
                </p>
                <Link to={`/${competitionKey}/sezon-hikayesi`} className="sa-btn-primary sa-btn-block">
                  Zaman çizelgesini aç →
                </Link>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

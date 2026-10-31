import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import Crest from "../components/Crest.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";
import NewsHubHeader from "../components/newsHub/NewsHubHeader.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { useAchievements } from "../state/AchievementsContext.jsx";
import { formatMatchDate } from "../utils/matchDate.js";
import { getSeasonStory } from "../utils/realStandingsSelectors.js";

const CATEGORIES = [
  { key: "tarihi-an", label: "Tarihi An" },
  { key: "rekor", label: "Rekor" },
  { key: "surpriz", label: "Sürpriz" },
  { key: "skandal", label: "Skandal / Tartışma" },
  { key: "sakatlik", label: "Sakatlık" },
  { key: "teknik-direktor", label: "Teknik Direktör" },
  { key: "basari", label: "Başarı" },
  { key: "basarisizlik", label: "Başarısızlık" },
];
const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));
const longDate = (iso) => formatMatchDate(iso, { day: "numeric", month: "long", year: "numeric" });

// Sezonun gerçek, kaynaklı öne çıkan anlarının kronolojik zaman çizelgesi
// (bkz. src/data/seasonStory.js). Haberler ile aynı başlığı ve sekme
// geçişini paylaşır -- Stitch "Football Hub" tasarımı (2026-10-28).
export default function SeasonStoryPage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const { unlock } = useAchievements();
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [teamFilter, setTeamFilter] = useState(null);

  useEffect(() => {
    unlock("hikaye-meraklisi");
  }, [unlock]);

  const activeTeamFilter = teamFilter !== null ? teamFilter : favoriteTeamId;
  const story = useMemo(
    () => getSeasonStory(competitionKey, { category: categoryFilter || undefined, teamId: activeTeamFilter || undefined }),
    [competitionKey, categoryFilter, activeTeamFilter]
  );
  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const allStory = useMemo(() => getSeasonStory(competitionKey), [competitionKey]);
  const lastEntry = allStory[allStory.length - 1];

  return (
    <div className="sa-page">
      <NewsHubHeader
        competitionKey={competitionKey}
        active="story"
        lastDate={lastEntry && longDate(lastEntry.date)}
        itemCount={story.length}
      />

      <section className="sa-card sa-filter-card">
        <div className="sa-filter-chips">
          <button
            type="button"
            className={`sa-filter-chip ${categoryFilter === null ? "active" : ""}`}
            onClick={() => setCategoryFilter(null)}
          >
            Tümü
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`sa-filter-chip ${categoryFilter === c.key ? "active" : ""}`}
              onClick={() => setCategoryFilter(categoryFilter === c.key ? null : c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="sa-filter-row">
          <div className="sa-filter-team">
            <TeamFilterSelect
              teams={competition.teams}
              value={activeTeamFilter || ""}
              onChange={(id) => setTeamFilter(id || "")}
              placeholder={favoriteTeamId && teamFilter === null ? "⭐ Tuttuğun takım" : "Takıma göre filtrele…"}
            />
          </div>
          {activeTeamFilter && (
            <button type="button" className="sa-btn-ghost" onClick={() => setTeamFilter("")}>
              Filtreyi temizle ✕
            </button>
          )}
          <span className="sa-muted sa-small sa-filter-note">
            Genel gündem için <Link to={`/${competitionKey}/haberler`}>Haberler</Link> sekmesine bak.
          </span>
        </div>
      </section>

      {story.length === 0 ? (
        <section className="sa-card sa-empty">
          {categoryFilter || activeTeamFilter
            ? "Bu filtreye uyan bir hikaye anı henüz eklenmedi."
            : "Sezonun hikayesi henüz yazılmaya başlanmadı."}
        </section>
      ) : (
        <ol className="sa-timeline">
          {story.map((s) => {
            const cat = CATEGORY_BY_KEY[s.category];
            const teams = (s.relatedTeamIds || []).map((id) => teamById[id]).filter(Boolean);
            return (
              <li key={s.id} className={`sa-timeline-item cat-${s.category}`}>
                <div className="sa-timeline-marker" aria-hidden="true" />
                <article className="sa-card sa-timeline-card">
                  <div className="sa-news-card-top">
                    {cat && <span className="sa-tag-soft">{cat.label}</span>}
                    <span className="sa-mono sa-muted sa-small">
                      {longDate(s.date)}
                      {s.week ? ` · ${s.week}. Hafta` : ""}
                    </span>
                  </div>
                  <h3 className="sa-news-card-title">{s.title}</h3>
                  <p className="sa-news-card-summary is-full">{s.summary}</p>
                  <div className="sa-news-card-foot">
                    {teams.length > 0 ? (
                      <div className="sa-team-chips">
                        {teams.map((t) => (
                          <Link key={t.id} to={`/${competitionKey}/takim/${t.id}`} className="sa-team-chip">
                            <Crest team={t} size={14} />
                            {t.short}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    <span className="sa-muted sa-small">{s.source}</span>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

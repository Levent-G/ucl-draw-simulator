import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import Crest from "../components/Crest.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { formatMatchDate } from "../utils/matchDate.js";
import { getSeasonStory } from "../utils/realStandingsSelectors.js";

const CATEGORIES = [
  { key: "tarihi-an", icon: "🏛️", label: "Tarihi An" },
  { key: "rekor", icon: "📈", label: "Rekor" },
  { key: "surpriz", icon: "😲", label: "Sürpriz" },
  { key: "skandal", icon: "🔥", label: "Skandal/Tartışma" },
  { key: "sakatlik", icon: "🩹", label: "Sakatlık" },
  { key: "teknik-direktor", icon: "🔁", label: "Teknik Direktör" },
  { key: "basari", icon: "🏆", label: "Başarı" },
  { key: "basarisizlik", icon: "💔", label: "Başarısızlık" },
];
const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

// Sezonun GERÇEK, kaynaklı öne çıkan anlarının kronolojik "hikaye" görünümü
// -- bkz. src/data/seasonStory.js'in başındaki metodoloji notu. Sezon
// devam ettikçe hafta hafta büyür; sezon sonunda bu SAYFA (ve altındaki
// veri) doğrudan "sezonun hikayesi" özetinin kendisi olur -- ayrı bir
// "recap" sayfası yazmaya gerek kalmadan, çünkü zaten kronolojik ve
// kaynaklı bir arşiv olarak tutuluyor.
export default function SeasonStoryPage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [teamFilter, setTeamFilter] = useState(null);

  const activeTeamFilter = teamFilter !== null ? teamFilter : favoriteTeamId;
  const story = useMemo(
    () => getSeasonStory(competitionKey, { category: categoryFilter || undefined, teamId: activeTeamFilter || undefined }),
    [competitionKey, categoryFilter, activeTeamFilter]
  );
  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);

  return (
    <div className="page-shell">
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">{competition.shortName} · Sezon Hikayesi</div>
          <h1>Sezonun Hikayesi</h1>
          <p>
            Bu sezonun gerçekten öne çıkan anlarının kronolojik, kaynaklı arşivi -- tarihi ilkler, rekorlar,
            sürprizler, tartışmalar, önemli sakatlıklar, teknik direktör krizleri, dikkat çekici başarı/başarısızlıklar.
            Genel gündem için <Link to={`/${competitionKey}/haberler`}>Haberler</Link> sayfasına bakabilirsin -- burası
            sadece sezonun "hikaye değeri" olan anlarını biriktirir ve sezon sonunda doğrudan sezonun özetine dönüşür.
          </p>
        </div>
      </header>

      <div className="season-story-filters">
        <div className="season-story-category-chips">
          <button
            type="button"
            className={`season-story-chip ${categoryFilter === null ? "active" : ""}`}
            onClick={() => setCategoryFilter(null)}
          >
            Tümü
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`season-story-chip ${categoryFilter === c.key ? "active" : ""}`}
              onClick={() => setCategoryFilter(categoryFilter === c.key ? null : c.key)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <TeamFilterSelect
          teams={competition.teams}
          value={activeTeamFilter || ""}
          onChange={(id) => setTeamFilter(id || "")}
          placeholder={favoriteTeamId && teamFilter === null ? "⭐ Tuttuğun takım" : "Takıma göre filtrele…"}
        />
        {activeTeamFilter && (
          <button className="btn-ghost" onClick={() => setTeamFilter("")}>
            Filtreyi Temizle ✕
          </button>
        )}
      </div>

      {story.length === 0 ? (
        <p className="standings-empty">
          {categoryFilter || activeTeamFilter
            ? "Bu filtreye uyan bir hikaye anı henüz eklenmedi."
            : "Sezonun hikayesi henüz yazılmaya başlanmadı -- ilk anlar yakında eklenecek."}
        </p>
      ) : (
        <div className="season-story-timeline">
          {story.map((s) => {
            const cat = CATEGORY_BY_KEY[s.category];
            return (
              <article key={s.id} className={`season-story-entry season-story-cat-${s.category}`}>
                <div className="season-story-entry-marker">
                  <span className="season-story-entry-icon">{cat?.icon || "📌"}</span>
                  <span className="season-story-entry-line" />
                </div>
                <div className="season-story-entry-body">
                  <div className="season-story-entry-head">
                    <span className="season-story-entry-date">
                      {formatMatchDate(s.date, { day: "numeric", month: "long", year: "numeric" })}
                      {s.week ? ` · ${s.week}. Hafta` : ""}
                    </span>
                    {cat && <span className="season-story-entry-tag">{cat.label}</span>}
                  </div>
                  <h3 className="season-story-entry-title">{s.title}</h3>
                  <p className="season-story-entry-summary">{s.summary}</p>
                  <div className="season-story-entry-foot">
                    {s.relatedTeamIds?.length > 0 && (
                      <div className="season-story-entry-teams">
                        {s.relatedTeamIds
                          .map((id) => teamById[id])
                          .filter(Boolean)
                          .map((t) => (
                            <Link key={t.id} to={`/${competitionKey}/takim/${t.id}`} className="news-card-team-chip">
                              <Crest team={t} size={16} />
                              {t.short}
                            </Link>
                          ))}
                      </div>
                    )}
                    <span className="season-story-entry-source">{s.source}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

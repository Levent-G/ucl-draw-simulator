import React, { useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompetition } from "../data/competitions.js";
import CompetitionStepper from "../components/CompetitionStepper.jsx";
import Crest from "../components/Crest.jsx";
import Pagination from "../components/Pagination.jsx";
import TeamFilterSelect from "../components/stats/TeamFilterSelect.jsx";
import { useFavoriteTeam } from "../state/FavoriteTeamContext.jsx";
import { formatMatchDate } from "../utils/matchDate.js";
import { getNews } from "../utils/realStandingsSelectors.js";

const PAGE_SIZE = 8;

// UCL/Süper Lig için kısa, tarihli, gerçek haber özetleri (bkz.
// src/data/news.js) -- takıma göre filtrelenebilir, sayfalanmış tam liste
// (tek uzun kaydırmalı liste yerine -- bkz. Pagination.jsx).
// CompetitionHomePage'deki "📰 Haberler" önizleme kartının "Tümünü Gör"
// linki buraya çıkar.
export default function NewsPage() {
  const { competitionKey } = useParams();
  const competition = getCompetition(competitionKey);
  const { favoriteTeamId } = useFavoriteTeam(competitionKey);
  const [teamFilter, setTeamFilter] = useState(null);
  const topRef = useRef(null);

  const activeFilter = teamFilter !== null ? teamFilter : favoriteTeamId;
  const news = useMemo(
    () => getNews({ competitionKey, teamId: activeFilter || undefined }),
    [competitionKey, activeFilter]
  );
  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);

  return (
    <div className="page-shell" ref={topRef}>
      <CompetitionStepper competitionKey={competitionKey} />
      <header className="page-header">
        <div>
          <div className="page-eyebrow">{competition.shortName} · Haberler</div>
          <h1>Haberler</h1>
          <p>
            Kısa, tarihli gerçek haber özetleri -- her maç için ayrı bir haber garantisi vermez, genel gündemi ve
            öne çıkan maç önizlemelerini kapsar. Kaynak belirtilen haberlerde orijinal habere de ulaşabilirsin.
          </p>
        </div>
      </header>

      <div className="news-filter-row">
        <TeamFilterSelect
          teams={competition.teams}
          value={activeFilter || ""}
          onChange={(id) => setTeamFilter(id || "")}
          placeholder={favoriteTeamId && teamFilter === null ? "⭐ Tuttuğun takım" : "Takıma göre filtrele…"}
        />
        {activeFilter && (
          <button className="btn-ghost" onClick={() => setTeamFilter("")}>
            Filtreyi Temizle ✕
          </button>
        )}
      </div>

      {news.length === 0 ? (
        <p className="standings-empty">
          {activeFilter ? "Bu takımla ilgili henüz haber eklenmedi." : "Henüz haber eklenmedi."}
        </p>
      ) : (
        <Pagination items={news} pageSize={PAGE_SIZE} topRef={topRef}>
          {(pageItems) => (
            <div className="news-list">
              {pageItems.map((n) => (
                <article key={n.id} className="news-card">
                  <div className="news-card-head">
                    <span className="news-card-date">
                      {formatMatchDate(n.date, { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {n.relatedTeamIds?.length > 0 && (
                      <div className="news-card-teams">
                        {n.relatedTeamIds
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
                  </div>
                  <h3 className="news-card-title">{n.title}</h3>
                  <p className="news-card-summary">{n.summary}</p>
                  <div className="news-card-foot">
                    <span className="news-card-source">{n.source}</span>
                    {n.url && (
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="news-card-link">
                        Kaynağa Git →
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Pagination>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { getAllPlayersEverywhere } from "../utils/crossCompetitionPlayers.js";
import { useAchievements } from "../state/AchievementsContext.jsx";
import Crest from "./Crest.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";

const MAX_TEAMS = 5;
const MAX_PLAYERS = 6;

// Tüm yarışmalardaki takım/oyuncuları TEK bir arama kutusundan bulup
// doğrudan profil sayfasına atlamayı sağlar (bkz. TeamProfilePage /
// PlayerProfilePage) -- navbar'da her sayfada erişilebilir.
export default function NavSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const { unlock } = useAchievements();

  const allTeams = useMemo(
    () =>
      COMPETITION_LIST.flatMap((comp) =>
        comp.teams.map((t) => ({ ...t, competitionKey: comp.key, competitionShortName: comp.shortName }))
      ),
    []
  );
  const allPlayers = useMemo(() => getAllPlayersEverywhere(), []);

  const { teamResults, playerResults } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { teamResults: [], playerResults: [] };
    return {
      teamResults: allTeams.filter((t) => t.name.toLowerCase().includes(q)).slice(0, MAX_TEAMS),
      playerResults: allPlayers.filter((p) => p.name.toLowerCase().includes(q)).slice(0, MAX_PLAYERS),
    };
  }, [query, allTeams, allPlayers]);

  const hasResults = teamResults.length > 0 || playerResults.length > 0;

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const goTo = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
    unlock("kesif-ruhu");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      e.currentTarget.blur();
    } else if (e.key === "Enter") {
      const first = teamResults[0]
        ? `/${teamResults[0].competitionKey}/takim/${teamResults[0].id}`
        : playerResults[0]
        ? `/${playerResults[0].competitionKey}/oyuncu/${playerResults[0].id}`
        : null;
      if (first) goTo(first);
    }
  };

  return (
    <div className="nav-search" ref={wrapRef}>
      <input
        type="text"
        className="nav-search-input"
        placeholder="🔎 Takım veya oyuncu ara…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && query.trim().length >= 2 && (
        <div className="nav-search-dropdown">
          {!hasResults && <div className="nav-search-empty">Sonuç bulunamadı.</div>}
          {teamResults.length > 0 && (
            <div className="nav-search-group">
              <div className="nav-search-group-label">Takımlar</div>
              {teamResults.map((t) => (
                <button key={`${t.competitionKey}-${t.id}`} className="nav-search-row" onClick={() => goTo(`/${t.competitionKey}/takim/${t.id}`)}>
                  <Crest team={t} size={20} />
                  <span className="nav-search-row-name">{t.name}</span>
                  <span className="nav-search-row-meta">{t.competitionShortName}</span>
                </button>
              ))}
            </div>
          )}
          {playerResults.length > 0 && (
            <div className="nav-search-group">
              <div className="nav-search-group-label">Oyuncular</div>
              {playerResults.map((p) => (
                <button key={p.globalId} className="nav-search-row" onClick={() => goTo(`/${p.competitionKey}/oyuncu/${p.id}`)}>
                  <PlayerAvatar player={p} size={22} />
                  <span className="nav-search-row-name">{p.name}</span>
                  <span className="nav-search-row-meta">{p.teamName} · {p.competitionName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

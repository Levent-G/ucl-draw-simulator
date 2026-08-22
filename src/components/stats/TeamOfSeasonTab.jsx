import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FORMATIONS } from "../../state/DreamTeamContext.jsx";
import { useAchievements } from "../../state/AchievementsContext.jsx";
import { computeTeamOfSeason } from "../../utils/statsSelectors.js";
import PlayerAvatar from "../PlayerAvatar.jsx";
import Crest from "../Crest.jsx";

const FORMATION_KEY = "4-3-3";

export default function TeamOfSeasonTab({ competition, simulation, competitionKey }) {
  const allPlayers = useMemo(() => competition.getAllPlayers(), [competition]);
  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);
  const slots = FORMATIONS[FORMATION_KEY].slots;
  const { unlock } = useAchievements();

  const assigned = useMemo(
    () => (simulation?.playerStats ? computeTeamOfSeason(allPlayers, simulation.playerStats, slots) : null),
    [allPlayers, simulation, slots]
  );

  useEffect(() => {
    if (assigned) unlock("sezonun-yildizi");
  }, [assigned, unlock]);

  if (!simulation) {
    return (
      <div className="stats-callout chart-card-wide">
        Sezonun 11'ini görebilmek için önce Fikstür &amp; Tahmin sayfasından bir model tahmini
        oluşturulmalı.
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <div className="chart-card chart-card-wide">
        <h3>Sezonun 11'i — {FORMATION_KEY}</h3>
        <p className="team-of-season-note">
          O simülasyondaki gol/asist/kart performansına ve güç puanına göre otomatik seçilen en iyi
          kadro. Gerçek bir "yılın takımı" oylaması değildir -- bu simülasyona özgüdür.
        </p>
        <div className="pitch pitch-readonly">
          <div className="pitch-lines" aria-hidden="true">
            <span className="pitch-center-circle" />
            <span className="pitch-center-line" />
          </div>
          {assigned?.map(({ slot, player }) => {
            const team = player ? teamById[player.teamId] : null;
            return (
              <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} key={slot.id}>
                {player ? (
                  <Link to={`/${competitionKey}/oyuncu/${player.id}`} className="pitch-slot-filled">
                    <PlayerAvatar player={player} size={40} />
                    <span className="pitch-slot-name">{player.name}</span>
                    <span className="pitch-slot-meta">
                      {team && <Crest team={team} size={14} />}
                      {player.goals || 0}g {player.assists || 0}a
                    </span>
                  </Link>
                ) : (
                  <div className="pitch-slot-empty">
                    <span className="pitch-slot-pos">{slot.position}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

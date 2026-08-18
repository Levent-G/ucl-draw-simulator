import React from "react";
import { POT_COLORS } from "../data/teams.js";
import Crest from "./Crest.jsx";

const VENUES = [
  { key: "home", label: "İÇ SAHA" },
  { key: "away", label: "DEPLASMAN" },
];

export default function PotTable({
  pot,
  allTeams,
  results,
  drawnTeamIds,
  activeTeamId,
  pendingCells,
}) {
  const teams = allTeams.filter((t) => t.pot === pot);
  const color = POT_COLORS[pot];

  return (
    <div className="pot-table-card">
      <div className="pot-table-header">
        <span className="pot-table-dot" style={{ background: color.main }} />
        POT {pot}
      </div>

      <div className="pot-table-scroll">
        <table className="draw-table">
          <thead>
            <tr>
              <th className="corner-cell" rowSpan={2}>
                Takım
              </th>
              {[1, 2, 3, 4].map((p) => (
                <th key={p} colSpan={2} className="pot-group-header">
                  POT {p}
                </th>
              ))}
            </tr>
            <tr>
              {[1, 2, 3, 4].flatMap((p) =>
                VENUES.map((v) => (
                  <th key={`${p}-${v.key}`} className="venue-header">
                    {v.label}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const drawn = drawnTeamIds.has(team.id);
              const fixtures = results[team.id];
              return (
                <tr
                  key={team.id}
                  className={`draw-row ${
                    activeTeamId === team.id ? "active-row" : ""
                  } ${!drawn ? "not-drawn" : ""}`}
                >
                  <td className="team-name-cell">
                    <Crest team={team} size={22} />
                    <span>{team.name}</span>
                  </td>
                  {[1, 2, 3, 4].flatMap((p) =>
                    VENUES.map((v) => {
                      const opp = fixtures[p][v.key];
                      const cellKey = `${team.id}:${p}:${v.key}`;
                      // Bu hücre başka bir takımın çekilişiyle (ayna eşleşme
                      // olarak) daha önceden zaten dolmuş olabilir -- o
                      // durumda üzerine loading barı binmesin.
                      const isLoading = pendingCells.has(cellKey) && !opp;
                      return (
                        <td
                          key={cellKey}
                          className={`fixture-cell ${opp ? "filled" : ""} ${
                            isLoading ? "loading" : ""
                          }`}
                        >
                          {opp && (
                            <span className="fixture-cell-inner">
                              <Crest team={opp} size={16} />
                              <span>{opp.short}</span>
                            </span>
                          )}
                          {isLoading && <span className="cell-shimmer" />}
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

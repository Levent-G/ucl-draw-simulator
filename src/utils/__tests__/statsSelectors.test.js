import { describe, it, expect } from "vitest";
import { teamsByCoeffDesc, topScorers, computeTeamOfSeason } from "../statsSelectors.js";
import { makeSwissTeams, makePlayersForTeams } from "./testFixtures.js";

describe("statsSelectors.teamsByCoeffDesc", () => {
  it("sorts teams by coeff descending without mutating the input", () => {
    const teams = makeSwissTeams(36, 4);
    const original = [...teams];
    const sorted = teamsByCoeffDesc(teams);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].coeff).toBeGreaterThanOrEqual(sorted[i].coeff);
    }
    expect(teams).toEqual(original);
  });
});

describe("statsSelectors.topScorers", () => {
  it("returns an empty array when there are no player stats", () => {
    const teams = makeSwissTeams(36, 4);
    const players = makePlayersForTeams(teams, 4);
    expect(topScorers(players, null)).toEqual([]);
  });

  it("sorts by goals desc, then assists desc, and respects the limit", () => {
    const players = [
      { id: "p1", name: "A" },
      { id: "p2", name: "B" },
      { id: "p3", name: "C" },
    ];
    const stats = {
      p1: { goals: 2, assists: 5, yellows: 0, reds: 0 },
      p2: { goals: 5, assists: 1, yellows: 0, reds: 0 },
      p3: { goals: 5, assists: 3, yellows: 0, reds: 0 },
    };
    const top = topScorers(players, stats, 2);
    expect(top.map((p) => p.id)).toEqual(["p3", "p2"]);
  });
});

describe("statsSelectors.computeTeamOfSeason", () => {
  it("fills every formation slot with a player of the matching position when enough exist", () => {
    const teams = makeSwissTeams(36, 4);
    const players = makePlayersForTeams(teams, 8); // enough GK/DF/MF/FW across 36 teams
    const playerStats = {};
    for (const p of players) playerStats[p.id] = { goals: Math.floor(Math.random() * 5), assists: 0, yellows: 0, reds: 0 };

    const slots = [
      { id: "gk1", position: "GK" },
      { id: "df1", position: "DF" },
      { id: "df2", position: "DF" },
      { id: "mf1", position: "MF" },
      { id: "fw1", position: "FW" },
    ];
    const assigned = computeTeamOfSeason(players, playerStats, slots);
    expect(assigned).toHaveLength(slots.length);
    for (const { slot, player } of assigned) {
      expect(player).not.toBeNull();
      expect(player.position).toBe(slot.position);
    }
  });

  it("never assigns the same player to two slots", () => {
    const teams = makeSwissTeams(36, 4);
    const players = makePlayersForTeams(teams, 8);
    const playerStats = {};
    for (const p of players) playerStats[p.id] = { goals: 0, assists: 0, yellows: 0, reds: 0 };
    const slots = [
      { id: "df1", position: "DF" },
      { id: "df2", position: "DF" },
      { id: "df3", position: "DF" },
      { id: "df4", position: "DF" },
    ];
    const assigned = computeTeamOfSeason(players, playerStats, slots);
    const ids = assigned.map((a) => a.player?.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns null when there is no playerStats", () => {
    expect(computeTeamOfSeason([], null, [])).toBeNull();
  });
});

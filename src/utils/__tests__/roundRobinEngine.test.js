import { describe, it, expect } from "vitest";
import { generateRoundRobinFixture, serializeRoundRobinFixture, deserializeRoundRobinFixture } from "../roundRobinEngine.js";
import { makeLeagueTeams } from "./testFixtures.js";

describe("roundRobinEngine.generateRoundRobinFixture", () => {
  it("produces 2*(N-1) matchdays for an N-team league", () => {
    const teams = makeLeagueTeams(18);
    const fixture = generateRoundRobinFixture(teams);
    expect(fixture).toHaveLength(2 * (teams.length - 1));
  });

  it("every team plays every other team exactly twice, once home once away", () => {
    const teams = makeLeagueTeams(18);
    const fixture = generateRoundRobinFixture(teams);

    const meetings = {};
    for (const t of teams) meetings[t.id] = {};
    for (const md of fixture) {
      for (const m of md.matches) {
        meetings[m.homeTeam.id][m.awayTeam.id] = (meetings[m.homeTeam.id][m.awayTeam.id] || 0) + 1;
      }
    }
    for (const a of teams) {
      for (const b of teams) {
        if (a.id === b.id) continue;
        // a should host b exactly once across the season
        expect(meetings[a.id][b.id] || 0).toBe(1);
      }
    }
  });

  it("has every team play exactly once per matchday", () => {
    const teams = makeLeagueTeams(18);
    const fixture = generateRoundRobinFixture(teams);
    for (const md of fixture) {
      const seen = new Set();
      for (const m of md.matches) {
        seen.add(m.homeTeam.id);
        seen.add(m.awayTeam.id);
      }
      expect(seen.size).toBe(teams.length);
      expect(md.matches).toHaveLength(teams.length / 2);
    }
  });

  it("handles an odd number of teams via a bye without crashing", () => {
    const teams = makeLeagueTeams(17);
    const fixture = generateRoundRobinFixture(teams);
    for (const md of fixture) {
      // one team sits out each round -- (N-1)/2 matches
      expect(md.matches).toHaveLength(8);
    }
  });

  it("round-trips through serialize/deserialize", () => {
    const teams = makeLeagueTeams(18);
    const fixture = generateRoundRobinFixture(teams);
    const raw = serializeRoundRobinFixture(fixture);
    const restored = deserializeRoundRobinFixture(raw, teams);
    expect(restored).toHaveLength(fixture.length);
    expect(restored[0].matches[0].homeTeam.id).toBe(fixture[0].matches[0].homeTeam.id);
  });

  it("returns an empty array for fewer than 2 teams", () => {
    expect(generateRoundRobinFixture([])).toEqual([]);
    expect(generateRoundRobinFixture([{ id: "x" }])).toEqual([]);
  });
});

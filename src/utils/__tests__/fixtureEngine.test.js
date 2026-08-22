import { describe, it, expect } from "vitest";
import { generateFullDraw } from "../drawEngine.js";
import { buildResultsFromMatches } from "../resultsHelpers.js";
import { generateFixture, serializeFixture, deserializeFixture } from "../fixtureEngine.js";
import { makeSwissTeams } from "./testFixtures.js";

function buildFixture() {
  const teams = makeSwissTeams(36, 4);
  const matches = generateFullDraw(teams);
  const results = buildResultsFromMatches(teams, matches);
  const fixture = generateFixture(results, teams);
  return { teams, fixture };
}

describe("fixtureEngine.generateFixture", () => {
  it("produces 8 matchdays of 18 matches each (144 total)", () => {
    const { fixture } = buildFixture();
    expect(fixture).toHaveLength(8);
    for (const md of fixture) {
      expect(md.matches).toHaveLength(18);
    }
    const total = fixture.reduce((s, md) => s + md.matches.length, 0);
    expect(total).toBe(144);
  });

  it("has every team play exactly once per matchday", () => {
    const { teams, fixture } = buildFixture();
    for (const md of fixture) {
      const seen = new Set();
      for (const m of md.matches) {
        expect(seen.has(m.homeTeam.id)).toBe(false);
        expect(seen.has(m.awayTeam.id)).toBe(false);
        seen.add(m.homeTeam.id);
        seen.add(m.awayTeam.id);
      }
      expect(seen.size).toBe(teams.length);
    }
  });

  it("has every team play exactly 8 matches across the whole season", () => {
    const { teams, fixture } = buildFixture();
    const playedCount = {};
    for (const t of teams) playedCount[t.id] = 0;
    for (const md of fixture) {
      for (const m of md.matches) {
        playedCount[m.homeTeam.id]++;
        playedCount[m.awayTeam.id]++;
      }
    }
    for (const t of teams) {
      expect(playedCount[t.id]).toBe(8);
    }
  });

  it("matches the fixture exactly against the draw's opponent list per team", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);
    const results = buildResultsFromMatches(teams, matches);
    const fixture = generateFixture(results, teams);

    const fixtureOpponents = {};
    for (const t of teams) fixtureOpponents[t.id] = new Set();
    for (const md of fixture) {
      for (const m of md.matches) {
        fixtureOpponents[m.homeTeam.id].add(m.awayTeam.id);
        fixtureOpponents[m.awayTeam.id].add(m.homeTeam.id);
      }
    }
    for (const t of teams) {
      const drawOpponents = new Set(matches[t.id].map((o) => o.opponentId));
      expect(fixtureOpponents[t.id]).toEqual(drawOpponents);
    }
  });

  it("round-trips through serialize/deserialize without losing matches", () => {
    const { teams, fixture } = buildFixture();
    const raw = serializeFixture(fixture);
    const restored = deserializeFixture(raw, teams);

    expect(restored).toHaveLength(fixture.length);
    for (let i = 0; i < fixture.length; i++) {
      expect(restored[i].matches).toHaveLength(fixture[i].matches.length);
      for (let j = 0; j < fixture[i].matches.length; j++) {
        expect(restored[i].matches[j].homeTeam.id).toBe(fixture[i].matches[j].homeTeam.id);
        expect(restored[i].matches[j].awayTeam.id).toBe(fixture[i].matches[j].awayTeam.id);
      }
    }
  });
});

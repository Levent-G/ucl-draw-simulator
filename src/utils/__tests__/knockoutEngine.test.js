import { describe, it, expect } from "vitest";
import { generateKnockoutBracket } from "../knockoutEngine.js";
import { buildSwissZones, resolveZone } from "../predictionEngine.js";
import { makeSwissTeams } from "./testFixtures.js";

function fakeStandings(teams) {
  const zones = buildSwissZones(teams.length);
  return teams.map((t, i) => {
    const rank = i + 1;
    const zone = resolveZone(zones, rank);
    return { teamId: t.id, rank, status: zone.key, statusLabel: zone.label, statusTone: zone.tone };
  });
}

describe("knockoutEngine.generateKnockoutBracket", () => {
  it("always produces a champion for a full 36-team league-phase table", () => {
    const teams = makeSwissTeams(36, 4);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
    const standings = fakeStandings(teams);
    const bracket = generateKnockoutBracket(standings, teamById);

    expect(bracket).not.toBeNull();
    expect(bracket.champion).toBeTruthy();
    expect(teamById[bracket.champion.id]).toBeDefined();
  });

  it("includes a Play-off Turu round before Son 16 when the mid-table pool is non-empty", () => {
    const teams = makeSwissTeams(36, 4);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
    const standings = fakeStandings(teams);
    const bracket = generateKnockoutBracket(standings, teamById);

    const roundNames = bracket.rounds.map((r) => r.name);
    expect(roundNames[0]).toBe("Play-off Turu");
    expect(roundNames).toContain("Final");
  });

  it("returns null when there are fewer than 8 teams", () => {
    const teams = makeSwissTeams(36, 4).slice(0, 6);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
    const standings = fakeStandings(teams);
    expect(generateKnockoutBracket(standings, teamById)).toBeNull();
  });

  it("every tie declares exactly one winner drawn from its two teams", () => {
    const teams = makeSwissTeams(36, 4);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
    const standings = fakeStandings(teams);
    const bracket = generateKnockoutBracket(standings, teamById);

    for (const round of bracket.rounds) {
      for (const tie of round.ties) {
        expect([tie.teamA.id, tie.teamB.id]).toContain(tie.winner.id);
      }
    }
  });

  it("the Final round is single-legged while earlier rounds are two-legged", () => {
    const teams = makeSwissTeams(36, 4);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
    const standings = fakeStandings(teams);
    const bracket = generateKnockoutBracket(standings, teamById);

    const final = bracket.rounds.find((r) => r.name === "Final");
    expect(final.ties[0].twoLegged).toBe(false);
    expect(final.ties[0].leg2).toBeNull();

    const quarter = bracket.rounds.find((r) => r.name === "Çeyrek Final");
    if (quarter) {
      expect(quarter.ties[0].twoLegged).toBe(true);
      expect(quarter.ties[0].leg2).not.toBeNull();
    }
  });
});

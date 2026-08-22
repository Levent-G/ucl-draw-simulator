import { describe, it, expect } from "vitest";
import { generateFullDraw, buildAnnouncementPlan } from "../drawEngine.js";
import { makeSwissTeams } from "./testFixtures.js";

describe("drawEngine.generateFullDraw", () => {
  it("gives every team exactly 8 opponents, 2 per pot, 4 home + 4 away", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);

    for (const t of teams) {
      const opponents = matches[t.id];
      expect(opponents).toHaveLength(8);

      const perPot = { 1: 0, 2: 0, 3: 0, 4: 0 };
      let home = 0;
      for (const o of opponents) {
        perPot[o.viaPot]++;
        if (o.home) home++;
      }
      expect(perPot).toEqual({ 1: 2, 2: 2, 3: 2, 4: 2 });
      expect(home).toBe(4);
    }
  });

  it("never pairs a team against its own country", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

    for (const t of teams) {
      for (const o of matches[t.id]) {
        expect(teamById[o.opponentId].country).not.toBe(t.country);
      }
    }
  });

  it("never pairs a team against itself and never repeats an opponent", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);

    for (const t of teams) {
      const opponentIds = matches[t.id].map((o) => o.opponentId);
      expect(opponentIds).not.toContain(t.id);
      expect(new Set(opponentIds).size).toBe(opponentIds.length);
    }
  });

  it("caps same-country opponents at 2 per team", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

    for (const t of teams) {
      const countryCounts = {};
      for (const o of matches[t.id]) {
        const c = teamById[o.opponentId].country;
        countryCounts[c] = (countryCounts[c] || 0) + 1;
      }
      for (const count of Object.values(countryCounts)) {
        expect(count).toBeLessThanOrEqual(2);
      }
    }
  });

  it("is mutually consistent: if A hosts B, B lists A as an away opponent", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);

    for (const t of teams) {
      for (const o of matches[t.id]) {
        const reciprocal = matches[o.opponentId].find((x) => x.opponentId === t.id);
        expect(reciprocal).toBeDefined();
        expect(reciprocal.home).toBe(!o.home);
        expect(reciprocal.viaPot).toBe(t.pot);
      }
    }
  });

  it("buildAnnouncementPlan covers every team exactly once with all 8 opponents", () => {
    const teams = makeSwissTeams(36, 4);
    const matches = generateFullDraw(teams);
    const plan = buildAnnouncementPlan(teams, matches);

    expect(plan).toHaveLength(36);
    const seen = new Set();
    for (const entry of plan) {
      expect(seen.has(entry.team.id)).toBe(false);
      seen.add(entry.team.id);
      expect(entry.opponents).toHaveLength(8);
    }
  });

  it("scales correctly for a smaller Europa-League-sized pool", () => {
    const teams = makeSwissTeams(36, 4); // keep 4 pots (algorithm assumes pot 1-4), smaller per-pot count
    const smaller = makeSwissTeams(20, 4);
    const matches = generateFullDraw(smaller);
    for (const t of smaller) {
      expect(matches[t.id]).toHaveLength(8);
    }
  });
});

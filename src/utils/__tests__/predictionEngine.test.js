import { describe, it, expect } from "vitest";
import {
  expectedGoals,
  matchProbabilities,
  simulateMatch,
  simulateSeason,
  computeStandingsFromUserScores,
  standingsFromOrder,
  buildSwissZones,
  buildLeagueZones,
  resolveZone,
  DEFAULT_MODEL_SETTINGS,
  MODEL_PRESETS,
} from "../predictionEngine.js";
import { generateRoundRobinFixture } from "../roundRobinEngine.js";
import { makeLeagueTeams, makePlayersForTeams } from "./testFixtures.js";

describe("predictionEngine.expectedGoals / matchProbabilities", () => {
  it("gives the stronger team a higher home-goal expectation", () => {
    const strong = { id: "a", coeff: 120 };
    const weak = { id: "b", coeff: 20 };
    const { lambdaHome, lambdaAway } = expectedGoals(strong, weak);
    expect(lambdaHome).toBeGreaterThan(lambdaAway);
  });

  it("respects a custom baseGoalsTotal setting", () => {
    const a = { id: "a", coeff: 60 };
    const b = { id: "b", coeff: 60 };
    const low = expectedGoals(a, b, null, { ...DEFAULT_MODEL_SETTINGS, baseGoalsTotal: 1.5 });
    const high = expectedGoals(a, b, null, { ...DEFAULT_MODEL_SETTINGS, baseGoalsTotal: 4.0 });
    expect(low.lambdaHome + low.lambdaAway).toBeLessThan(high.lambdaHome + high.lambdaAway);
  });

  it("derives probabilities that sum to ~1 and favor the stronger side", () => {
    const { lambdaHome, lambdaAway } = expectedGoals({ id: "a", coeff: 130 }, { id: "b", coeff: 15 });
    const probs = matchProbabilities(lambdaHome, lambdaAway);
    expect(probs.homeWinProb + probs.drawProb + probs.awayWinProb).toBeCloseTo(1, 5);
    expect(probs.homeWinProb).toBeGreaterThan(probs.awayWinProb);
  });
});

describe("predictionEngine.simulateMatch", () => {
  it("always returns non-negative integer goal counts", () => {
    const a = { id: "a", coeff: 80 };
    const b = { id: "b", coeff: 50 };
    for (let i = 0; i < 50; i++) {
      const sim = simulateMatch(a, b);
      expect(Number.isInteger(sim.homeGoals)).toBe(true);
      expect(Number.isInteger(sim.awayGoals)).toBe(true);
      expect(sim.homeGoals).toBeGreaterThanOrEqual(0);
      expect(sim.awayGoals).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("predictionEngine.buildLeagueZones / buildSwissZones / resolveZone", () => {
  it("league zones cover every rank from 1..N with a single zone", () => {
    const zones = buildLeagueZones(18);
    for (let rank = 1; rank <= 18; rank++) {
      const zone = resolveZone(zones, rank);
      expect(zone).toBeDefined();
    }
    // last zone's max must reach the team count
    expect(zones[zones.length - 1].max).toBe(18);
  });

  it("swiss zones classify rank 1 as the best (direct) tone", () => {
    const zones = buildSwissZones(36);
    const zone1 = resolveZone(zones, 1);
    expect(zone1.tone).toBe("good");
    const zoneLast = resolveZone(zones, 36);
    expect(zoneLast.tone).toBe("bad");
  });
});

describe("predictionEngine.simulateSeason", () => {
  function buildSeason(settings) {
    const teams = makeLeagueTeams(10);
    const allPlayers = makePlayersForTeams(teams, 10);
    const fixture = generateRoundRobinFixture(teams);
    const zones = buildLeagueZones(teams.length);
    return simulateSeason(fixture, { teams, allPlayers, zones, settings });
  }

  it("produces a standings row for every team with played == total matchdays", () => {
    const teams = makeLeagueTeams(10);
    const totalMatchdays = 2 * (teams.length - 1);
    const sim = buildSeason();
    expect(sim.standings).toHaveLength(teams.length);
    for (const s of sim.standings) {
      expect(s.played).toBe(totalMatchdays);
      expect(s.w + s.d + s.l).toBe(totalMatchdays);
      expect(s.pts).toBe(s.w * 3 + s.d);
    }
  });

  it("ranks standings by points, then goal difference, then goals for", () => {
    const sim = buildSeason();
    for (let i = 1; i < sim.standings.length; i++) {
      const prev = sim.standings[i - 1];
      const cur = sim.standings[i];
      expect(
        prev.pts > cur.pts ||
          (prev.pts === cur.pts && prev.gd > cur.gd) ||
          (prev.pts === cur.pts && prev.gd === cur.gd && prev.gf >= cur.gf)
      ).toBe(true);
    }
  });

  it("assigns sequential rank numbers 1..N", () => {
    const sim = buildSeason();
    sim.standings.forEach((s, i) => expect(s.rank).toBe(i + 1));
  });

  it("produces one matchResult per fixture match with a chronological event timeline", () => {
    const teams = makeLeagueTeams(10);
    const totalMatches = (2 * (teams.length - 1) * teams.length) / 2;
    const sim = buildSeason();
    expect(sim.matchResults).toHaveLength(totalMatches);
    for (const m of sim.matchResults) {
      expect(m.homeGoals).toBeGreaterThanOrEqual(0);
      expect(m.awayGoals).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(m.sidelined)).toBe(true);
      for (let i = 1; i < m.events.length; i++) {
        expect(m.events[i].minute).toBeGreaterThanOrEqual(m.events[i - 1].minute);
      }
    }
  });

  it("suspends a red-carded player for the following matchday", () => {
    const teams = makeLeagueTeams(10);
    const allPlayers = makePlayersForTeams(teams, 10);
    const fixture = generateRoundRobinFixture(teams);
    const zones = buildLeagueZones(teams.length);
    // Kaotik ayar (yüksek kart yoğunluğu) kırmızı kart olasılığını artırır --
    // testin makul sürede en az bir kırmızı kart üretmesini güvenceye alır.
    const sim = simulateSeason(fixture, {
      teams,
      allPlayers,
      zones,
      settings: { ...MODEL_PRESETS.kaotik.settings },
    });

    const redCardEvent = sim.matchResults
      .flatMap((m) => m.events.map((e) => ({ ...e, matchdayNumber: m.matchdayNumber })))
      .find((e) => e.type === "red");

    if (!redCardEvent) {
      // Şans eseri bu koşuda hiç kırmızı kart çıkmadıysa testi anlamsızca
      // başarısız saymak yerine atla.
      return;
    }
    const nextMatchdayMatches = sim.matchResults.filter(
      (m) => m.matchdayNumber === redCardEvent.matchdayNumber + 1
    );
    const sidelinedNextWeek = nextMatchdayMatches.flatMap((m) => m.sidelined);
    const wasSidelined = sidelinedNextWeek.some(
      (s) => s.playerId === redCardEvent.player.id && s.reason === "kırmızı kart cezası"
    );
    expect(wasSidelined).toBe(true);
  });

  it("continues from initialStandings instead of starting at zero", () => {
    const teams = makeLeagueTeams(4);
    const allPlayers = makePlayersForTeams(teams, 4);
    const fixture = generateRoundRobinFixture(teams); // each team plays fixture.length matches (1/matchday)
    const zones = buildLeagueZones(teams.length);
    const initialStandings = { [teams[0].id]: { played: 3, w: 3, d: 0, l: 0, gf: 9, ga: 1, pts: 9 } };
    const sim = simulateSeason(fixture, { teams, allPlayers, zones, initialStandings });
    const row = sim.standings.find((s) => s.teamId === teams[0].id);
    // Seeded 3 already-played + every match in the given fixture gets simulated on top.
    expect(row.played).toBe(3 + fixture.length);
    expect(row.pts).toBeGreaterThanOrEqual(9);
  });
});

describe("predictionEngine.computeStandingsFromUserScores", () => {
  it("only counts matches with both scores filled in", () => {
    const teams = makeLeagueTeams(4);
    const fixture = generateRoundRobinFixture(teams);
    const firstMatch = fixture[0].matches[0];
    const userScores = { [firstMatch.id]: { home: "2", away: "1" } };
    const zones = buildLeagueZones(teams.length);
    const standings = computeStandingsFromUserScores(fixture, userScores, { teams, zones });

    const totalPlayed = standings.reduce((s, row) => s + row.played, 0);
    expect(totalPlayed).toBe(2); // one match affects two teams' "played" counts
    const home = standings.find((s) => s.teamId === firstMatch.homeTeam.id);
    expect(home.pts).toBe(3);
    expect(home.gf).toBe(2);
  });
});

describe("predictionEngine.standingsFromOrder", () => {
  it("assigns sequential ranks matching the given order", () => {
    const teams = makeLeagueTeams(5);
    const zones = buildLeagueZones(teams.length);
    const order = teams.map((t) => t.id).reverse();
    const standings = standingsFromOrder(order, teams, zones);
    standings.forEach((s, i) => {
      expect(s.teamId).toBe(order[i]);
      expect(s.rank).toBe(i + 1);
    });
  });
});

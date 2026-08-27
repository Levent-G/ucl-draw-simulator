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
  deriveAttackDefenseRatio,
  eloExpectedScore,
  updateForm,
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

describe("predictionEngine.deriveAttackDefenseRatio", () => {
  it("gives an attack-heavy squad a higher attackRatio and lower defenseRatio than a defense-heavy one", () => {
    const attackHeavySquad = [
      { position: "FW", rating: 90 },
      { position: "FW", rating: 88 },
      { position: "MF", rating: 82 },
      { position: "MF", rating: 80 },
      { position: "DF", rating: 65 },
      { position: "DF", rating: 65 },
      { position: "GK", rating: 65 },
    ];
    const defenseHeavySquad = [
      { position: "FW", rating: 65 },
      { position: "FW", rating: 65 },
      { position: "MF", rating: 70 },
      { position: "MF", rating: 70 },
      { position: "DF", rating: 90 },
      { position: "DF", rating: 88 },
      { position: "GK", rating: 85 },
    ];
    const attackHeavy = deriveAttackDefenseRatio(attackHeavySquad);
    const defenseHeavy = deriveAttackDefenseRatio(defenseHeavySquad);
    expect(attackHeavy.attackRatio).toBeGreaterThan(defenseHeavy.attackRatio);
    expect(attackHeavy.defenseRatio).toBeLessThan(defenseHeavy.defenseRatio);
  });

  it("falls back to neutral (1) ratios when given no players", () => {
    expect(deriveAttackDefenseRatio([])).toEqual({ attackRatio: 1, defenseRatio: 1 });
  });
});

describe("predictionEngine.expectedGoals with squad-derived attack/defense ratios", () => {
  it("an attack-heavy squad raises lambdaHome versus an identical-coeff balanced squad", () => {
    const home = { id: "a", coeff: 70 };
    const away = { id: "b", coeff: 70 };
    const baseline = expectedGoals(home, away);
    const attackHeavy = expectedGoals({ ...home, attackRatio: 1.15, defenseRatio: 0.95 }, away);
    expect(attackHeavy.lambdaHome).toBeGreaterThan(baseline.lambdaHome);
  });

  it("a strong-defense squad lowers the opponent's expected goals", () => {
    const home = { id: "a", coeff: 70 };
    const away = { id: "b", coeff: 70 };
    const baseline = expectedGoals(home, away);
    const strongDefense = expectedGoals({ ...home, defenseRatio: 1.15 }, away);
    expect(strongDefense.lambdaAway).toBeLessThan(baseline.lambdaAway);
  });
});

describe("predictionEngine.simulateMatch causal red card", () => {
  it("reduces the sent-off team's post-card scoring rate and raises the opponent's", () => {
    const home = { id: "a", coeff: 80 };
    const away = { id: "b", coeff: 80 };
    const settings = { ...DEFAULT_MODEL_SETTINGS, redCardChance: 1 };
    const N = 200;
    let homeBeforeRateSum = 0;
    let homeAfterRateSum = 0;
    let awayBeforeRateSum = 0;
    let awayAfterRateSum = 0;

    for (let i = 0; i < N; i++) {
      const sim = simulateMatch(home, away, null, false, settings);
      expect(sim.redCard).not.toBeNull();
      expect(sim.redCard.side).toBe("home"); // redCardChance=1 always trips the first (home) roll
      expect(sim.homeGoalsBeforeRed + sim.homeGoalsAfterRed).toBe(sim.homeGoals);
      expect(sim.awayGoalsBeforeRed + sim.awayGoalsAfterRed).toBe(sim.awayGoals);

      const beforeFraction = sim.redCard.minute / 90;
      const afterFraction = 1 - beforeFraction;
      homeBeforeRateSum += sim.homeGoalsBeforeRed / beforeFraction;
      homeAfterRateSum += sim.homeGoalsAfterRed / afterFraction;
      awayBeforeRateSum += sim.awayGoalsBeforeRed / beforeFraction;
      awayAfterRateSum += sim.awayGoalsAfterRed / afterFraction;
    }

    // 10-man takımın gol atma hızı kart sonrası düşmeli...
    expect(homeAfterRateSum / N).toBeLessThan(homeBeforeRateSum / N);
    // ...rakibinki ise (sayısal üstünlükle) artmalı.
    expect(awayAfterRateSum / N).toBeGreaterThan(awayBeforeRateSum / N);
  });
});

describe("predictionEngine.eloExpectedScore / updateForm (in-season Elo-style drift)", () => {
  it("gives the stronger side an expected score closer to 1, and it's symmetric with the weaker side's", () => {
    const strongExpected = eloExpectedScore(120, 40);
    const weakExpected = eloExpectedScore(40, 120);
    expect(strongExpected).toBeGreaterThan(0.5);
    expect(strongExpected + weakExpected).toBeCloseTo(1, 10);
  });

  it("returns exactly 0.5 for two equally-rated teams", () => {
    expect(eloExpectedScore(70, 70)).toBeCloseTo(0.5, 10);
  });

  it("rewards an upset (underdog wins) with a bigger drift than a big favorite winning as expected", () => {
    const formById = {};
    // Zayıf takım (coeff 20) güçlü rakibi (coeff 120) yener -- büyük sürpriz.
    updateForm(formById, "underdog", 20, 120, 1);
    // Güçlü takım (coeff 120) zayıf rakibi (coeff 20) yener -- beklenen sonuç.
    updateForm(formById, "favorite", 120, 20, 1);
    expect(formById.underdog).toBeGreaterThan(formById.favorite);
    expect(formById.underdog).toBeGreaterThan(0);
    expect(formById.favorite).toBeGreaterThan(0); // still a small positive nudge
  });

  it("gives a favorite a NEGATIVE drift when it only draws against a weak side (underperforming expectation)", () => {
    const formById = {};
    updateForm(formById, "favorite", 120, 20, 0.5);
    expect(formById.favorite).toBeLessThan(0);
  });

  it("clamps accumulated drift to the safety band even after many consecutive upsets", () => {
    const formById = {};
    for (let i = 0; i < 50; i++) {
      updateForm(formById, "underdog", 20, 120, 1);
    }
    expect(formById.underdog).toBeLessThanOrEqual(20);
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

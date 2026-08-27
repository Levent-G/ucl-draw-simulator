import { describe, it, expect } from "vitest";
import {
  estimatePlayerValue,
  estimateSquadValue,
  estimateFinancialPower,
  estimateCompetitionEarnings,
  describeKnockoutRun,
  formatMoney,
} from "../financeEngine.js";

describe("financeEngine.estimatePlayerValue / estimateSquadValue", () => {
  it("is monotonically increasing in rating", () => {
    const low = estimatePlayerValue({ rating: 55 });
    const mid = estimatePlayerValue({ rating: 75 });
    const high = estimatePlayerValue({ rating: 95 });
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });

  it("never returns a negative or non-finite value even for missing/extreme ratings", () => {
    expect(estimatePlayerValue({})).toBeGreaterThan(0);
    expect(estimatePlayerValue({ rating: 0 })).toBeGreaterThan(0);
    expect(estimatePlayerValue({ rating: 999 })).toBeGreaterThan(0);
  });

  it("sums individual player values for the squad total", () => {
    const players = [{ rating: 60 }, { rating: 70 }, { rating: 80 }];
    const expected =
      Math.round(players.reduce((s, p) => s + estimatePlayerValue(p), 0) * 10) / 10;
    expect(estimateSquadValue(players)).toBeCloseTo(expected, 5);
  });
});

describe("financeEngine.estimateFinancialPower", () => {
  it("is monotonically increasing in coeff", () => {
    const weak = estimateFinancialPower({ id: "a", coeff: 10 });
    const mid = estimateFinancialPower({ id: "b", coeff: 60 });
    const strong = estimateFinancialPower({ id: "c", coeff: 130 });
    expect(weak).toBeLessThan(mid);
    expect(mid).toBeLessThan(strong);
  });

  it("is deterministic for the same team (no Math.random-style flicker across calls)", () => {
    const team = { id: "galatasaray", coeff: 92 };
    const first = estimateFinancialPower(team);
    const second = estimateFinancialPower(team);
    expect(first).toBe(second);
  });
});

describe("financeEngine.estimateCompetitionEarnings", () => {
  it("returns no earnings when there is no simulation yet", () => {
    const competition = { format: "league", teams: [{ id: "a", coeff: 50 }] };
    expect(estimateCompetitionEarnings(competition, null, null)).toEqual({});
  });

  it("league format: the champion earns more than the relegated last-place team", () => {
    const teams = [
      { id: "t1", coeff: 90 },
      { id: "t2", coeff: 70 },
      { id: "t3", coeff: 50 },
      { id: "t4", coeff: 30 },
    ];
    const competition = { format: "league", teams };
    const simulation = {
      standings: [
        { teamId: "t1", rank: 1, status: "champion" },
        { teamId: "t2", rank: 2, status: "ucl" },
        { teamId: "t3", rank: 3, status: "mid" },
        { teamId: "t4", rank: 4, status: "relegation" },
      ],
    };
    const earnings = estimateCompetitionEarnings(competition, simulation, null);
    expect(earnings.t1).toBeGreaterThan(earnings.t2);
    expect(earnings.t2).toBeGreaterThan(earnings.t3);
    expect(earnings.t3).toBeGreaterThan(earnings.t4);
  });

  it("swiss format: more league-phase wins and a better zone earn more than fewer wins in the elimination zone", () => {
    const teams = [
      { id: "t1", coeff: 100 },
      { id: "t2", coeff: 100 },
    ];
    const competition = { format: "swiss", teams };
    const simulation = {
      standings: [
        { teamId: "t1", rank: 1, w: 6, d: 2, status: "direct" },
        { teamId: "t2", rank: 30, w: 1, d: 1, status: "out" },
      ],
    };
    const earnings = estimateCompetitionEarnings(competition, simulation, null);
    expect(earnings.t1).toBeGreaterThan(earnings.t2);
  });

  it("swiss format: a knockout champion earns more than a team eliminated in the first knockout round", () => {
    const teamA = { id: "champ", coeff: 100 };
    const teamB = { id: "early-exit", coeff: 100 };
    const competition = { format: "swiss", teams: [teamA, teamB] };
    const simulation = {
      standings: [
        { teamId: "champ", rank: 1, w: 5, d: 3, status: "direct" },
        { teamId: "early-exit", rank: 2, w: 5, d: 3, status: "direct" },
      ],
    };
    const knockout = {
      champion: teamA,
      rounds: [{ name: "Play-off Turu", ties: [{ teamA, teamB, winner: teamA }] }],
    };
    const earnings = estimateCompetitionEarnings(competition, simulation, knockout);
    expect(earnings.champ).toBeGreaterThan(earnings["early-exit"]);
  });
});

describe("financeEngine.describeKnockoutRun", () => {
  it("labels the champion distinctly from a team merely reaching the final", () => {
    const champion = { id: "champ" };
    const runnerUp = { id: "runner-up" };
    const knockout = {
      champion,
      rounds: [{ name: "Final", ties: [{ teamA: champion, teamB: runnerUp, winner: champion }] }],
    };
    expect(describeKnockoutRun(knockout, "champ")).toBe("Şampiyon");
    expect(describeKnockoutRun(knockout, "runner-up")).toBe("Final");
  });

  it("returns null when there is no knockout bracket at all", () => {
    expect(describeKnockoutRun(null, "any")).toBeNull();
  });
});

describe("financeEngine.formatMoney", () => {
  it("formats sub-million amounts in thousands (B)", () => {
    expect(formatMoney(0.15)).toBe("150 B €");
  });

  it("formats million-scale amounts with one decimal (M)", () => {
    expect(formatMoney(12.37)).toBe("12.4 M €");
  });

  it("formats billion-scale amounts (Mlyr)", () => {
    expect(formatMoney(1500)).toBe("1.50 Mlyr €");
  });

  it("returns a placeholder for null/non-finite input", () => {
    expect(formatMoney(null)).toBe("–");
    expect(formatMoney(undefined)).toBe("–");
    expect(formatMoney(NaN)).toBe("–");
  });
});

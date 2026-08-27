import { describe, it, expect } from "vitest";
import { computeNextCoeffDeltas } from "../CareerContext.jsx";

function standingsFor(teamIds) {
  return teamIds.map((teamId, i) => ({ teamId, rank: i + 1 }));
}

describe("CareerContext.computeNextCoeffDeltas", () => {
  it("rewards the top-ranked team and penalizes the bottom-ranked team", () => {
    const teamIds = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
    const deltas = computeNextCoeffDeltas({}, standingsFor(teamIds));
    expect(deltas.t1).toBeGreaterThan(0);
    expect(deltas.t18).toBeLessThan(0);
    expect(deltas.t1).toBeGreaterThan(deltas.t18);
  });

  it("gives the champion bonus recipient a bigger boost than a same-rank team without it", () => {
    const teamIds = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
    const withoutBonus = computeNextCoeffDeltas({}, standingsFor(teamIds));
    const withBonus = computeNextCoeffDeltas({}, standingsFor(teamIds), "t1");
    expect(withBonus.t1).toBeGreaterThan(withoutBonus.t1);
  });

  it("caps a team that wins literally every season forever at the hard safety limit", () => {
    // Bu senaryo (40 sezon üst üste HİÇ kaybetmeden şampiyonluk) gerçekçi
    // değildir -- güvenlik sınırının (35) tam olarak burada devreye girip
    // değeri sonsuza dek büyümekten alıkoyması BEKLENEN davranıştır.
    const teamIds = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
    let deltas = {};
    for (let season = 0; season < 40; season++) {
      deltas = computeNextCoeffDeltas(deltas, standingsFor(teamIds), "t1"); // t1 always champion
    }
    expect(deltas.t1).toBeLessThanOrEqual(35);
    expect(deltas.t1).toBeGreaterThan(30);
  });

  it("does NOT freeze permanently once a team reaches a high delta -- it keeps responding to new results", () => {
    const teamIds = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
    let deltas = {};
    // t1 dominates for a long stretch...
    for (let season = 0; season < 20; season++) {
      deltas = computeNextCoeffDeltas(deltas, standingsFor(teamIds), "t1");
    }
    const peakDelta = deltas.t1;

    // ...then collapses to bottom of the table for several seasons.
    const collapsedOrder = ["t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13", "t14", "t15", "t16", "t17", "t18", "t1"];
    for (let season = 0; season < 8; season++) {
      deltas = computeNextCoeffDeltas(deltas, standingsFor(collapsedOrder));
    }
    // A frozen/stuck value (the season-9-15 bug this test guards against)
    // would stay exactly at peakDelta forever. It must have moved down.
    expect(deltas.t1).toBeLessThan(peakDelta);
  });

  it("keeps the delta symmetric in sign around a mid-table team (roughly zero net drift)", () => {
    const teamIds = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
    const deltas = computeNextCoeffDeltas({}, standingsFor(teamIds));
    // Middle-of-the-table team (rank 9 or 10 of 18) should get a small delta near 0.
    expect(Math.abs(deltas.t9 ?? 0)).toBeLessThanOrEqual(1);
  });

  it("returns a shallow copy and never mutates the input object", () => {
    const teamIds = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
    const prev = { t1: 5 };
    const prevSnapshot = { ...prev };
    computeNextCoeffDeltas(prev, standingsFor(teamIds));
    expect(prev).toEqual(prevSnapshot);
  });
});

import { describe, it, expect } from "vitest";
import { findDerby, getRivalsOf } from "../derbies.js";

describe("derbies", () => {
  it("finds a known derby regardless of argument order", () => {
    const d1 = findDerby("RMA", "BAR");
    const d2 = findDerby("BAR", "RMA");
    expect(d1).toBeDefined();
    expect(d1.label).toBe("EL CLÁSICO");
    expect(d2).toEqual(d1);
  });

  it("returns undefined for a non-derby pairing", () => {
    expect(findDerby("RMA", "PSG")).toBeUndefined();
  });

  it("getRivalsOf returns every derby a team appears in, with the opponent's short code", () => {
    const rivals = getRivalsOf("RMA");
    expect(rivals.length).toBeGreaterThanOrEqual(2);
    const opponents = rivals.map((r) => r.opponentShort);
    expect(opponents).toContain("BAR");
    expect(opponents).toContain("ATM");
  });

  it("getRivalsOf returns an empty array for a team with no listed rivalries", () => {
    expect(getRivalsOf("XXX")).toEqual([]);
  });
});

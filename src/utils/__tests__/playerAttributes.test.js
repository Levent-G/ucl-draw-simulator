import { describe, it, expect } from "vitest";
import { hashString, seededRandom, derivePhysicalAttributes } from "../playerAttributes.js";

describe("playerAttributes", () => {
  it("hashString is deterministic for the same input", () => {
    expect(hashString("ucl:t1-p1")).toBe(hashString("ucl:t1-p1"));
  });

  it("hashString differs for different inputs (no trivial collisions in a small sample)", () => {
    const values = new Set(["a", "b", "c", "ucl:t1-p1", "ucl:t1-p2"].map(hashString));
    expect(values.size).toBe(5);
  });

  it("seededRandom produces the same sequence for the same seed", () => {
    const r1 = seededRandom(42);
    const r2 = seededRandom(42);
    const seq1 = [r1(), r1(), r1()];
    const seq2 = [r2(), r2(), r2()];
    expect(seq1).toEqual(seq2);
  });

  it("derivePhysicalAttributes is fully deterministic for the same player identity", () => {
    const player = { globalId: "ucl:t1-p1", position: "FW" };
    const a = derivePhysicalAttributes(player);
    const b = derivePhysicalAttributes(player);
    expect(a).toEqual(b);
  });

  it("derivePhysicalAttributes stays within realistic per-position height ranges", () => {
    for (let i = 0; i < 20; i++) {
      const gk = derivePhysicalAttributes({ id: `gk-${i}`, position: "GK" });
      expect(gk.height).toBeGreaterThanOrEqual(185);
      expect(gk.height).toBeLessThanOrEqual(200);

      const fw = derivePhysicalAttributes({ id: `fw-${i}`, position: "FW" });
      expect(fw.height).toBeGreaterThanOrEqual(168);
      expect(fw.height).toBeLessThanOrEqual(190);
    }
  });

  it("age falls within the documented 19-35 range", () => {
    for (let i = 0; i < 30; i++) {
      const p = derivePhysicalAttributes({ id: `p-${i}`, position: "MF" });
      expect(p.age).toBeGreaterThanOrEqual(19);
      expect(p.age).toBeLessThanOrEqual(35);
    }
  });
});

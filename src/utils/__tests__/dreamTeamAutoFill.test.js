import { describe, it, expect } from "vitest";
import { buildXiFromTeamRoster } from "../dreamTeamAutoFill.js";

const FORMATION_442_SLOTS = [
  { id: "gk1", position: "GK" },
  { id: "df1", position: "DF" },
  { id: "df2", position: "DF" },
  { id: "df3", position: "DF" },
  { id: "df4", position: "DF" },
  { id: "mf1", position: "MF" },
  { id: "mf2", position: "MF" },
  { id: "mf3", position: "MF" },
  { id: "mf4", position: "MF" },
  { id: "fw1", position: "FW" },
  { id: "fw2", position: "FW" },
];

function player(id, position, rating) {
  return { id, position, rating };
}

describe("buildXiFromTeamRoster", () => {
  it("fills each slot with the highest-rated available player at that position", () => {
    const roster = [
      player("gk-a", "GK", 80),
      player("df-a", "DF", 70),
      player("df-b", "DF", 85),
      player("df-c", "DF", 60),
      player("df-d", "DF", 90),
      player("mf-a", "MF", 75),
      player("mf-b", "MF", 88),
      player("mf-c", "MF", 65),
      player("mf-d", "MF", 72),
      player("fw-a", "FW", 91),
      player("fw-b", "FW", 68),
    ];
    const squadMap = buildXiFromTeamRoster(roster, "superlig", FORMATION_442_SLOTS);

    expect(squadMap.gk1).toBe("superlig:gk-a");
    // Defans: 90, 85, 70, 60 sırasıyla en güçlüden başlar.
    expect(squadMap.df1).toBe("superlig:df-d");
    expect(squadMap.df2).toBe("superlig:df-b");
    expect(squadMap.df3).toBe("superlig:df-a");
    expect(squadMap.df4).toBe("superlig:df-c");
    expect(squadMap.fw1).toBe("superlig:fw-a");
    expect(squadMap.fw2).toBe("superlig:fw-b");
  });

  it("leaves extra slots empty when the roster is thin at a position", () => {
    const roster = [player("gk-a", "GK", 80), player("df-a", "DF", 70)];
    const squadMap = buildXiFromTeamRoster(roster, "superlig", FORMATION_442_SLOTS);

    expect(squadMap.gk1).toBe("superlig:gk-a");
    expect(squadMap.df1).toBe("superlig:df-a");
    expect(squadMap.df2).toBeUndefined();
    expect(squadMap.mf1).toBeUndefined();
    expect(squadMap.fw1).toBeUndefined();
  });

  it("never assigns a player to a slot of a different position", () => {
    const roster = [player("fw-only", "FW", 99)];
    const squadMap = buildXiFromTeamRoster(roster, "ucl", FORMATION_442_SLOTS);
    expect(squadMap.gk1).toBeUndefined();
    expect(squadMap.fw1).toBe("ucl:fw-only");
  });
});

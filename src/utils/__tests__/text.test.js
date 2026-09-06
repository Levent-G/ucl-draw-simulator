import { describe, it, expect } from "vitest";
import { toSearchKey } from "../text.js";

describe("toSearchKey (Türkçe İ arama hatası düzeltmesi)", () => {
  it("plain .toLowerCase() would break this case -- confirms the bug this fixes", () => {
    expect("İrfan Can Kahveci".toLowerCase().includes("irfan")).toBe(false);
  });

  it("lowercases Turkish İ (U+0130) to a single ASCII i, matching a plain-typed query", () => {
    expect(toSearchKey("İrfan Can Kahveci").includes(toSearchKey("irfan"))).toBe(true);
    expect(toSearchKey("İsmail Yüksek").includes("ismail")).toBe(true);
    expect(toSearchKey("İlkay Gündoğan").includes("ilkay")).toBe(true);
  });

  it("still handles the other Turkish diacritics correctly", () => {
    expect(toSearchKey("Üzüm").includes("üzüm")).toBe(true);
    expect(toSearchKey("Çağlar Söyüncü").includes("çağlar")).toBe(true);
  });

  it("trims whitespace and handles null/undefined", () => {
    expect(toSearchKey("  Mesut Özil  ")).toBe("mesut özil");
    expect(toSearchKey(undefined)).toBe("");
    expect(toSearchKey(null)).toBe("");
  });
});

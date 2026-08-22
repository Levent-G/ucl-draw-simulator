import { describe, it, expect } from "vitest";
import { encodeShareData, decodeShareData } from "../shareLink.js";

describe("shareLink", () => {
  it("round-trips a plain object", () => {
    const data = { formation: "4-3-3", squad: { gk1: "ucl:t1-p1", df1: "ucl:t1-p3" } };
    const encoded = encodeShareData(data);
    expect(typeof encoded).toBe("string");
    expect(decodeShareData(encoded)).toEqual(data);
  });

  it("round-trips Turkish/unicode characters correctly", () => {
    const data = { name: "Beşiktaş Şükrü Saracoğlu 🏆" };
    const encoded = encodeShareData(data);
    expect(decodeShareData(encoded)).toEqual(data);
  });

  it("produces a URL-safe string (no +, /, or = padding)", () => {
    const encoded = encodeShareData({ a: 1, b: [1, 2, 3], c: "test/value+here" });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("decodeShareData returns null for garbage input", () => {
    expect(decodeShareData("not-valid-base64!!!")).toBeNull();
    expect(decodeShareData("")).toBeNull();
    expect(decodeShareData(null)).toBeNull();
  });
});

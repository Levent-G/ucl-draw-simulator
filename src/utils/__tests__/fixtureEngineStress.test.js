import { describe, it, expect } from "vitest";
import { generateFullDraw } from "../drawEngine.js";
import { generateFixture } from "../fixtureEngine.js";
import { buildResultsFromMatches } from "../resultsHelpers.js";
import { makeSwissTeams } from "./testFixtures.js";
import { TEAMS as REAL_UCL_TEAMS } from "../../data/teams.js";

// Bu dosya, PredictionLeagueContext.jsx'te bulunan gerçek bir entegrasyon
// hatasını sabitliyor: generateFullDraw() HAM bir { teamId: [{opponentId,
// home, viaPot}] } haritası döner, generateFixture() ise { teamId: { pot:
// {home, away} } } şeklinde bir `results` bekler -- ikisi arasında
// buildResultsFromMatches() dönüşümü YAPILMADAN generateFullDraw'ın çıktısı
// doğrudan generateFixture'a verilirse, her hücre boş kalır ve fikstür
// haftalara bölme işlemi HER SEFERİNDE (gözlemlendi: 30/30, 60/60) başarısız
// olur -- "Fikstür haftalara bölünemedi" hatası, nadir bir backtracking
// şanssızlığı DEĞİL, bu eksik dönüşümün doğrudan sonucuydu.
describe("drawEngine -> resultsHelpers -> fixtureEngine integration", () => {
  it("generateFullDraw's raw match map, once converted via buildResultsFromMatches, gives every team exactly 8 valid opponents (4 home + 4 away)", () => {
    const drawMatches = generateFullDraw(REAL_UCL_TEAMS);
    const results = buildResultsFromMatches(REAL_UCL_TEAMS, drawMatches);
    for (const team of REAL_UCL_TEAMS) {
      const fixtures = results[team.id];
      expect(fixtures).toBeTruthy();
      for (const pot of [1, 2, 3, 4]) {
        expect(fixtures[pot]?.home, `${team.name} pot ${pot} home`).toBeTruthy();
        expect(fixtures[pot]?.away, `${team.name} pot ${pot} away`).toBeTruthy();
      }
    }
  });

  it("passing generateFullDraw's raw output directly to generateFixture (skipping the conversion) reliably fails -- regression guard so this exact mistake is easy to recognize again", () => {
    const drawMatches = generateFullDraw(REAL_UCL_TEAMS);
    expect(() => generateFixture(drawMatches, REAL_UCL_TEAMS)).toThrow();
  });

  it("reliably produces a full 8-matchday fixture for the real 36 UCL teams once converted correctly", () => {
    const RUNS = 15;
    for (let i = 0; i < RUNS; i++) {
      const drawMatches = generateFullDraw(REAL_UCL_TEAMS);
      const results = buildResultsFromMatches(REAL_UCL_TEAMS, drawMatches);
      const fixture = generateFixture(results, REAL_UCL_TEAMS);
      expect(fixture).toHaveLength(8);
      const totalMatches = fixture.reduce((sum, md) => sum + md.matches.length, 0);
      expect(totalMatches).toBe((REAL_UCL_TEAMS.length * 8) / 2);
    }
  });

  it("also works reliably for a synthetic 36-team swiss competition (not just the real UCL data)", () => {
    const teams = makeSwissTeams(36, 4);
    const RUNS = 15;
    for (let i = 0; i < RUNS; i++) {
      const drawMatches = generateFullDraw(teams);
      const results = buildResultsFromMatches(teams, drawMatches);
      expect(() => generateFixture(results, teams)).not.toThrow();
    }
  });
});

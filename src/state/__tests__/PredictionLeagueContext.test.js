import { describe, it, expect } from "vitest";
import { scorePrediction, buildLeaderboard } from "../PredictionLeagueContext.jsx";

describe("PredictionLeagueContext.scorePrediction", () => {
  it("gives 5 points for an exact score match", () => {
    expect(scorePrediction({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 2, awayGoals: 1 })).toBe(5);
  });

  it("gives 3 points for the correct winner and correct goal difference (but wrong exact score)", () => {
    expect(scorePrediction({ homeGoals: 2, awayGoals: 0 }, { homeGoals: 3, awayGoals: 1 })).toBe(3);
  });

  it("gives 1 point for the correct outcome only (winner right, goal difference wrong)", () => {
    expect(scorePrediction({ homeGoals: 1, awayGoals: 0 }, { homeGoals: 3, awayGoals: 1 })).toBe(1);
  });

  it("gives 3 points for correctly predicting a draw with the same goal difference (0), even off on the exact score", () => {
    // 1-1 tahmin edilip 2-2 çıkması: ikisi de "berabere, fark 0" -- doğru
    // sonuç VE doğru gol farkı, sadece tam skor tutmuyor.
    expect(scorePrediction({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 2, awayGoals: 2 })).toBe(3);
  });

  it("gives 1 point for a draw prediction that gets the outcome right but not the goal difference (trivially 0 for any draw, so this is really about a skewed win prediction)", () => {
    // Kazanan taraf doğru (ev sahibi) ama gol farkı tutmuyor: 3-0 tahmin
    // edilip 1-0 (fark +1) çıkması.
    expect(scorePrediction({ homeGoals: 3, awayGoals: 0 }, { homeGoals: 1, awayGoals: 0 })).toBe(1);
  });

  it("gives 0 points for a completely wrong outcome (predicted home win, away won)", () => {
    expect(scorePrediction({ homeGoals: 2, awayGoals: 0 }, { homeGoals: 0, awayGoals: 1 })).toBe(0);
  });

  it("gives 0 points when there is no prediction or no actual result yet", () => {
    expect(scorePrediction(null, { homeGoals: 1, awayGoals: 0 })).toBe(0);
    expect(scorePrediction({ homeGoals: 1, awayGoals: 0 }, null)).toBe(0);
  });
});

describe("PredictionLeagueContext.buildLeaderboard", () => {
  it("ranks users by total points, descending", () => {
    const results = {
      m1: { homeGoals: 2, awayGoals: 1 },
      m2: { homeGoals: 0, awayGoals: 0 },
    };
    const predictions = [
      { uid: "a", displayName: "Ali", matchId: "m1", homeGoals: 2, awayGoals: 1 }, // 5 (tam skor)
      { uid: "a", displayName: "Ali", matchId: "m2", homeGoals: 1, awayGoals: 0 }, // 0 (ev sahibi galibiyeti tahmin etti, berabere kaldı)
      { uid: "b", displayName: "Ayşe", matchId: "m1", homeGoals: 3, awayGoals: 0 }, // 1 (ev sahibi kazandı doğru ama fark yanlış: +3 vs +1)
      { uid: "b", displayName: "Ayşe", matchId: "m2", homeGoals: 0, awayGoals: 0 }, // 5 (tam skor)
    ];
    const board = buildLeaderboard(predictions, results);
    expect(board.map((r) => r.uid)).toEqual(["b", "a"]);
    expect(board[0].points).toBe(6);
    expect(board[1].points).toBe(5);
    expect(board[0].predicted).toBe(2);
  });

  it("counts a prediction toward 'predicted' even if the match has no result yet, without adding points", () => {
    const predictions = [{ uid: "a", displayName: "Ali", matchId: "unresolved", homeGoals: 1, awayGoals: 0 }];
    const board = buildLeaderboard(predictions, {});
    expect(board[0].points).toBe(0);
    expect(board[0].predicted).toBe(1);
    expect(board[0].scored).toBe(0);
  });

  it("returns an empty leaderboard when there are no predictions", () => {
    expect(buildLeaderboard([], {})).toEqual([]);
  });
});

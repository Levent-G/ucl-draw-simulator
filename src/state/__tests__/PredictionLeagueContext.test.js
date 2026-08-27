import { describe, it, expect } from "vitest";
import {
  scorePrediction,
  pointsForPrediction,
  buildLeaderboard,
  CHAMPION_PICK_POINTS,
  KNOCKOUT_TIE_POINTS,
} from "../PredictionLeagueContext.jsx";

describe("PredictionLeagueContext.scorePrediction (kind: score)", () => {
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

describe("PredictionLeagueContext.pointsForPrediction (all 3 kinds: score / champion / knockout)", () => {
  const season = {
    results: { m1: { homeGoals: 2, awayGoals: 1 } },
    knockout: {
      champion: "real-madrid",
      rounds: [
        { name: "Play-off Turu", ties: [{ id: "0-0", teamAId: "villarreal", teamBId: "sabah", winnerId: "villarreal" }] },
        { name: "Final", ties: [{ id: "3-0", teamAId: "real-madrid", teamBId: "man-city", winnerId: "real-madrid" }] },
      ],
    },
  };

  it("delegates kind:'score' predictions to scorePrediction using season.results", () => {
    const prediction = { kind: "score", matchId: "m1", homeGoals: 2, awayGoals: 1 };
    expect(pointsForPrediction(prediction, season)).toBe(5);
  });

  it("awards CHAMPION_PICK_POINTS for a correct champion pick", () => {
    const prediction = { kind: "champion", matchId: "champion", pickedTeamId: "real-madrid" };
    expect(pointsForPrediction(prediction, season)).toBe(CHAMPION_PICK_POINTS);
  });

  it("awards 0 for a wrong champion pick", () => {
    const prediction = { kind: "champion", matchId: "champion", pickedTeamId: "man-city" };
    expect(pointsForPrediction(prediction, season)).toBe(0);
  });

  it("awards the round-specific points for a correct knockout tie pick, using the round index encoded in the tie id", () => {
    const earlyRoundPick = { kind: "knockout", matchId: "0-0", pickedTeamId: "villarreal" };
    const finalPick = { kind: "knockout", matchId: "3-0", pickedTeamId: "real-madrid" };
    expect(pointsForPrediction(earlyRoundPick, season)).toBe(KNOCKOUT_TIE_POINTS[0]);
    expect(pointsForPrediction(finalPick, season)).toBe(KNOCKOUT_TIE_POINTS[3]);
    expect(KNOCKOUT_TIE_POINTS[3]).toBeGreaterThan(KNOCKOUT_TIE_POINTS[0]); // final, ilk turdan daha değerli
  });

  it("awards 0 for a wrong knockout tie pick", () => {
    const prediction = { kind: "knockout", matchId: "0-0", pickedTeamId: "sabah" };
    expect(pointsForPrediction(prediction, season)).toBe(0);
  });

  it("returns 0 for a knockout pick referencing a tie that doesn't exist in this season", () => {
    const prediction = { kind: "knockout", matchId: "9-9", pickedTeamId: "real-madrid" };
    expect(pointsForPrediction(prediction, season)).toBe(0);
  });
});

describe("PredictionLeagueContext.pointsForPrediction (kind: standings, drag-and-drop table prediction)", () => {
  const season = { standings: ["a", "b", "c", "d"] }; // gerçek final sıra: a=1., b=2., c=3., d=4.

  it("awards the maximum per-team points (3) for a perfect predicted order", () => {
    const prediction = { kind: "standings", order: ["a", "b", "c", "d"] };
    expect(pointsForPrediction(prediction, season)).toBe(4 * 3);
  });

  it("awards partial credit proportional to how close each team's predicted rank is to its real rank", () => {
    // b ve a yer değiştirdi (1 sıra fark = 2 puan her biri için), c ve d aynı (3'er puan).
    const prediction = { kind: "standings", order: ["b", "a", "c", "d"] };
    expect(pointsForPrediction(prediction, season)).toBe(2 + 2 + 3 + 3);
  });

  it("awards 0 for a team predicted 3+ ranks away from its real position", () => {
    // d (gerçekte 4.) 1. tahmin edildi -- 3 sıra fark, min 0'a düşer.
    const prediction = { kind: "standings", order: ["d", "b", "c", "a"] };
    const points = pointsForPrediction(prediction, season);
    // d: |0-3|=3 -> 0, b: |1-1|=0 -> 3, c: |2-2|=0 -> 3, a: |3-0|=3 -> 0
    expect(points).toBe(0 + 3 + 3 + 0);
  });

  it("returns 0 when the season has no final standings yet", () => {
    const prediction = { kind: "standings", order: ["a", "b", "c", "d"] };
    expect(pointsForPrediction(prediction, { standings: null })).toBe(0);
  });
});

describe("PredictionLeagueContext.buildLeaderboard", () => {
  it("ranks users by total points across mixed prediction kinds, descending", () => {
    const season = {
      results: { m1: { homeGoals: 2, awayGoals: 1 }, m2: { homeGoals: 0, awayGoals: 0 } },
      knockout: { champion: "real-madrid", rounds: [] },
    };
    const predictions = [
      { uid: "a", displayName: "Ali", kind: "score", matchId: "m1", homeGoals: 2, awayGoals: 1 }, // 5
      { uid: "a", displayName: "Ali", kind: "score", matchId: "m2", homeGoals: 1, awayGoals: 0 }, // 0
      { uid: "a", displayName: "Ali", kind: "champion", matchId: "champion", pickedTeamId: "man-city" }, // 0 (yanlış)
      { uid: "b", displayName: "Ayşe", kind: "score", matchId: "m1", homeGoals: 3, awayGoals: 0 }, // 1
      { uid: "b", displayName: "Ayşe", kind: "score", matchId: "m2", homeGoals: 0, awayGoals: 0 }, // 5
      { uid: "b", displayName: "Ayşe", kind: "champion", matchId: "champion", pickedTeamId: "real-madrid" }, // 15 (doğru!)
    ];
    const board = buildLeaderboard(predictions, season);
    expect(board.map((r) => r.uid)).toEqual(["b", "a"]);
    expect(board[0].points).toBe(21); // 1 + 5 + 15
    expect(board[1].points).toBe(5); // 5 + 0 + 0
    expect(board[0].predicted).toBe(3);
  });

  it("returns an empty leaderboard when there are no predictions", () => {
    expect(buildLeaderboard([], { results: {}, knockout: null })).toEqual([]);
  });
});

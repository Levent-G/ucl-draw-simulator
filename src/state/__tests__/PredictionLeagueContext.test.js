import { describe, it, expect } from "vitest";
import {
  scorePrediction,
  pointsForPrediction,
  buildLeaderboard,
  computeDerivedStandings,
  standingsPoints,
  isMatchRevealed,
  isSeasonFullyRevealed,
  CHAMPION_PICK_POINTS,
  KNOCKOUT_TIE_POINTS,
  OUTCOME_CORRECT_POINTS,
} from "../PredictionLeagueContext.jsx";

describe("PredictionLeagueContext.isMatchRevealed / isSeasonFullyRevealed (sonucu maçın GERÇEK tarihine kadar sakla)", () => {
  const pastLeague = {
    fixture: [{ number: 1, matches: [{ id: "m1", homeId: "real-madrid", awayId: "barcelona", date: "2020-01-01" }] }],
    results: { m1: { homeGoals: 2, awayGoals: 1 } },
  };
  const futureLeague = {
    fixture: [{ number: 1, matches: [{ id: "m1", homeId: "real-madrid", awayId: "barcelona", date: "2099-01-01" }] }],
    results: { m1: { homeGoals: 2, awayGoals: 1 } },
  };
  const noDateLeague = {
    fixture: [{ number: 1, matches: [{ id: "m1", homeId: "real-madrid", awayId: "barcelona" }] }],
    results: { m1: { homeGoals: 2, awayGoals: 1 } },
  };

  it("treats a match with a past real date as revealed", () => {
    expect(isMatchRevealed(pastLeague, "m1")).toBe(true);
  });

  it("treats a match with a future real date as NOT revealed", () => {
    expect(isMatchRevealed(futureLeague, "m1")).toBe(false);
  });

  it("treats a match with no real date (no live calendar yet) as always revealed", () => {
    expect(isMatchRevealed(noDateLeague, "m1")).toBe(true);
  });

  it("isSeasonFullyRevealed is false while any match is still in the future", () => {
    expect(isSeasonFullyRevealed(futureLeague)).toBe(false);
    expect(isSeasonFullyRevealed(pastLeague)).toBe(true);
  });

  it("pointsForPrediction withholds outcome/score points until the match's real date has passed", () => {
    expect(
      pointsForPrediction({ kind: "outcome", matchId: "m1", teamId: "real-madrid", result: "win" }, futureLeague)
    ).toBe(0);
    expect(
      pointsForPrediction({ kind: "outcome", matchId: "m1", teamId: "real-madrid", result: "win" }, pastLeague)
    ).toBe(OUTCOME_CORRECT_POINTS);
    expect(pointsForPrediction({ kind: "score", matchId: "m1", homeGoals: 2, awayGoals: 1 }, futureLeague)).toBe(0);
    expect(pointsForPrediction({ kind: "score", matchId: "m1", homeGoals: 2, awayGoals: 1 }, pastLeague)).toBe(5);
  });

  it("buildLeaderboard withholds the standings-prediction bonus until the whole season is revealed", () => {
    const teams = [
      { id: "real-madrid", name: "Real Madrid" },
      { id: "barcelona", name: "Barcelona" },
    ];
    const fixture = [
      {
        number: 1,
        matches: [
          {
            id: "m1",
            homeTeam: teams[0],
            awayTeam: teams[1],
          },
        ],
      },
    ];
    const predictions = [{ uid: "a", displayName: "Ali", kind: "outcome", matchId: "m1", teamId: "real-madrid", result: "win" }];

    const futureBoard = buildLeaderboard(predictions, { ...futureLeague, standings: ["real-madrid", "barcelona"] }, {
      fixture,
      teams,
      zones: [{ key: "none", label: "", tone: "", max: Infinity }],
    });
    expect(futureBoard[0].points).toBe(0);

    const pastBoard = buildLeaderboard(predictions, { ...pastLeague, standings: ["real-madrid", "barcelona"] }, {
      fixture,
      teams,
      zones: [{ key: "none", label: "", tone: "", max: Infinity }],
    });
    expect(pastBoard[0].points).toBeGreaterThan(0);
  });
});

describe("PredictionLeagueContext.pointsForPrediction (kind: outcome, basit Galibiyet/Beraberlik/Mağlubiyet tahmini)", () => {
  const league = {
    fixture: [{ number: 1, matches: [{ id: "m1", homeId: "real-madrid", awayId: "barcelona" }] }],
    results: { m1: { homeGoals: 2, awayGoals: 1 } }, // real-madrid (ev sahibi) kazandı
  };

  it("awards OUTCOME_CORRECT_POINTS when the home team's predicted result matches reality", () => {
    const prediction = { kind: "outcome", matchId: "m1", teamId: "real-madrid", result: "win" };
    expect(pointsForPrediction(prediction, league)).toBe(OUTCOME_CORRECT_POINTS);
  });

  it("awards OUTCOME_CORRECT_POINTS when the away team's predicted result (from ITS perspective) matches reality", () => {
    const prediction = { kind: "outcome", matchId: "m1", teamId: "barcelona", result: "loss" };
    expect(pointsForPrediction(prediction, league)).toBe(OUTCOME_CORRECT_POINTS);
  });

  it("awards 0 when the predicted result is wrong", () => {
    const prediction = { kind: "outcome", matchId: "m1", teamId: "barcelona", result: "win" };
    expect(pointsForPrediction(prediction, league)).toBe(0);
  });

  it("treats a draw correctly from either team's perspective", () => {
    const drawLeague = { ...league, results: { m1: { homeGoals: 1, awayGoals: 1 } } };
    expect(pointsForPrediction({ kind: "outcome", matchId: "m1", teamId: "real-madrid", result: "draw" }, drawLeague)).toBe(
      OUTCOME_CORRECT_POINTS
    );
    expect(pointsForPrediction({ kind: "outcome", matchId: "m1", teamId: "barcelona", result: "draw" }, drawLeague)).toBe(
      OUTCOME_CORRECT_POINTS
    );
  });

  it("returns 0 when the match hasn't been scored yet, or the teamId isn't part of the match", () => {
    expect(pointsForPrediction({ kind: "outcome", matchId: "m1", teamId: "real-madrid", result: "win" }, { ...league, results: {} })).toBe(0);
    expect(pointsForPrediction({ kind: "outcome", matchId: "m1", teamId: "villarreal", result: "win" }, league)).toBe(0);
  });
});

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
      // Gerçek serializeKnockout() ile birebir tutarlı olsun diye (tie.id
      // "{roundIdx}-{tieIdx}" biçiminde, roundIdx = rounds dizisindeki GERÇEK
      // konum) -- Final burada dizinin 4. (index 4) elemanı.
      rounds: [
        { name: "Play-off Turu", ties: [{ id: "0-0", teamAId: "villarreal", teamBId: "sabah", winnerId: "villarreal" }] },
        { name: "Son 16", ties: [] },
        { name: "Çeyrek Final", ties: [] },
        { name: "Yarı Final", ties: [] },
        { name: "Final", ties: [{ id: "4-0", teamAId: "real-madrid", teamBId: "man-city", winnerId: "real-madrid" }] },
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
    const finalPick = { kind: "knockout", matchId: "4-0", pickedTeamId: "real-madrid" };
    expect(pointsForPrediction(earlyRoundPick, season)).toBe(KNOCKOUT_TIE_POINTS[0]);
    // Final eşleşmesini doğru bilmek hem o turun kendi puanını HEM DE
    // şampiyon bonusunu getirir (Final'in kazananı = şampiyon).
    expect(pointsForPrediction(finalPick, season)).toBe(KNOCKOUT_TIE_POINTS[4] + CHAMPION_PICK_POINTS);
    expect(KNOCKOUT_TIE_POINTS[4]).toBeGreaterThan(KNOCKOUT_TIE_POINTS[0]); // final, ilk turdan daha değerli
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

describe("PredictionLeagueContext.computeDerivedStandings (haftalık skor tahminlerinden otomatik puan durumu)", () => {
  const teams = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  const fixture = [
    {
      number: 1,
      matches: [
        { id: "m1", homeTeam: { id: "a" }, awayTeam: { id: "b" } },
        { id: "m2", homeTeam: { id: "c" }, awayTeam: { id: "d" } },
      ],
    },
    {
      number: 2,
      matches: [
        { id: "m3", homeTeam: { id: "a" }, awayTeam: { id: "c" } },
        { id: "m4", homeTeam: { id: "b" }, awayTeam: { id: "d" } },
      ],
    },
  ];
  const league = {
    results: {
      m1: { homeGoals: 2, awayGoals: 0 },
      m2: { homeGoals: 1, awayGoals: 1 },
      m3: { homeGoals: 0, awayGoals: 1 },
      m4: { homeGoals: 3, awayGoals: 0 },
    },
  };

  it("uses the user's own score prediction for a match instead of the system result, and falls back to the system result everywhere else", () => {
    // m1 için kullanıcı KENDİ tahminini (1-0) girdi -- gerçek sonuç (2-0)
    // DEĞİL bu kullanılmalı. m2/m3/m4 için tahmin yok -- sistemin gerçek
    // sonucu (league.results) kullanılmalı.
    const myPredictionsByMatch = { m1: { kind: "score", homeGoals: 1, awayGoals: 0 } };
    const standings = computeDerivedStandings(fixture, myPredictionsByMatch, league, teams);
    expect(standings.map((s) => s.teamId)).toEqual(["c", "b", "a", "d"]);
    const byId = Object.fromEntries(standings.map((s) => [s.teamId, s]));
    expect(byId.a.pts).toBe(3); // 1-0 tahmini de bir galibiyet
    expect(byId.b.gd).toBe(2); // m1 fark -1 (tahmin) + m4 fark +3 (gerçek sonuç) = 2
  });

  it("returns an empty array when there is no fixture or league results yet", () => {
    expect(computeDerivedStandings(null, {}, league, teams)).toEqual([]);
    expect(computeDerivedStandings(fixture, {}, { results: null }, teams)).toEqual([]);
  });

  it("synthesizes a representative scoreline (1-0/0-0/0-1) from an outcome (Win/Draw/Loss) prediction, from the predicted team's own perspective", () => {
    // m1: a (ev sahibi) - b (deplasman). "b" için "win" tahmini -- b
    // deplasmanda oynadığı için bu 0-1 (ev 0, deplasman 1) karşılığına gelir.
    const myPredictionsByMatch = { m1: { kind: "outcome", teamId: "b", result: "win" } };
    const standings = computeDerivedStandings(fixture, myPredictionsByMatch, league, teams);
    const byId = Object.fromEntries(standings.map((s) => [s.teamId, s]));
    expect(byId.b.pts).toBe(6); // m1 tahmini galibiyet (3) + m4 gerçek galibiyet (3)
    expect(byId.a.pts).toBe(0); // m1 tahmini mağlubiyet (0) + m3 gerçek mağlubiyet (0)
  });
});

describe("PredictionLeagueContext.buildLeaderboard with standingsCtx (artık elle sürüklenmeyen, otomatik hesaplanan Lig Sıralaması)", () => {
  const teams = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  const fixture = [
    {
      number: 1,
      matches: [
        { id: "m1", homeTeam: { id: "a" }, awayTeam: { id: "b" } },
        { id: "m2", homeTeam: { id: "c" }, awayTeam: { id: "d" } },
      ],
    },
  ];
  const league = {
    results: { m1: { homeGoals: 2, awayGoals: 0 }, m2: { homeGoals: 1, awayGoals: 1 } },
    standings: ["a", "c", "b", "d"], // gerçek final sıra (mock)
  };

  it("adds each user's own derived-standings score to their leaderboard total when standingsCtx (fixture/teams) is provided", () => {
    const predictions = [
      { uid: "u1", displayName: "Ali", kind: "teams", matchId: "teams", teamIds: ["a"] },
      { uid: "u1", displayName: "Ali", kind: "score", matchId: "m1", homeGoals: 5, awayGoals: 0 },
    ];
    const withStandings = buildLeaderboard(predictions, league, { fixture, teams });
    const without = buildLeaderboard(predictions, league);
    expect(withStandings[0].points).toBeGreaterThan(without[0].points);
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

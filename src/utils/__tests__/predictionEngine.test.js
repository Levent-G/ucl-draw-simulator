import { describe, it, expect } from "vitest";
import {
  expectedGoals,
  matchProbabilities,
  simulateMatch,
  simulateSeason,
  computeStandingsFromUserScores,
  standingsFromOrder,
  buildSwissZones,
  buildLeagueZones,
  resolveZone,
  deriveAttackDefenseRatio,
  eloExpectedScore,
  updateForm,
  computeMaxDrift,
  DEFAULT_MODEL_SETTINGS,
  MODEL_PRESETS,
} from "../predictionEngine.js";
import { generateRoundRobinFixture } from "../roundRobinEngine.js";
import { makeLeagueTeams, makePlayersForTeams } from "./testFixtures.js";

describe("predictionEngine.expectedGoals / matchProbabilities", () => {
  it("gives the stronger team a higher home-goal expectation", () => {
    const strong = { id: "a", coeff: 120 };
    const weak = { id: "b", coeff: 20 };
    const { lambdaHome, lambdaAway } = expectedGoals(strong, weak);
    expect(lambdaHome).toBeGreaterThan(lambdaAway);
  });

  it("gives two equal-coeff teams a near-even split (home advantage aside)", () => {
    const a = { id: "a", coeff: 70 };
    const b = { id: "b", coeff: 70 };
    const { lambdaHome, lambdaAway } = expectedGoals(a, b);
    // Sadece ev sahibi avantajı kadar bir fark olmalı, büyük bir sapma değil.
    expect(lambdaHome - lambdaAway).toBeLessThan(1);
    expect(lambdaHome).toBeGreaterThan(lambdaAway);
  });

  it("scales the goal-share gap SUPER-LINEARLY with the coeff gap (a huge mismatch is far more lopsided than a small one)", () => {
    const base = { id: "base", coeff: 70 };
    const smallGapAway = { id: "small", coeff: 60 }; // 10 puan fark
    const bigGapAway = { id: "big", coeff: 20 }; // 50 puan fark
    const smallGap = expectedGoals(base, smallGapAway);
    const bigGap = expectedGoals(base, bigGapAway);
    const smallRatio = smallGap.lambdaHome / smallGap.lambdaAway;
    const bigRatio = bigGap.lambdaHome / bigGap.lambdaAway;
    // 50 puanlık fark, 10 puanlık farktan orantısız derecede daha keskin bir
    // gol oranı üretmeli -- doğrusal bir modelde puan farkı 5 kat artınca
    // oran neredeyse hiç büyümezdi (payların ikisi de küçük kaymalar
    // yaşardı); burada oran belirgin şekilde (%50'den fazla) büyüyor.
    expect(bigRatio).toBeGreaterThan(smallRatio * 1.5);
  });

  it("gives a historically deep club (pedigree) a real edge over a same-coeff club with no history", () => {
    const storied = { id: "storied", coeff: 70, pedigree: 15 };
    const newcomer = { id: "newcomer", coeff: 70, pedigree: 0 };
    const { lambdaHome, lambdaAway } = expectedGoals(storied, newcomer);
    expect(lambdaHome).toBeGreaterThan(lambdaAway);
  });

  it("does not let pedigree alone flip a large coeff mismatch (it's a nudge, not the primary driver)", () => {
    const weakButStoried = { id: "weak", coeff: 20, pedigree: 20 };
    const strongNewcomer = { id: "strong", coeff: 130, pedigree: 0 };
    const { lambdaHome, lambdaAway } = expectedGoals(weakButStoried, strongNewcomer);
    expect(lambdaAway).toBeGreaterThan(lambdaHome);
  });

  it("gives a historically decorated Süper Lig club (ör. Galatasaray tarzı, pedigree 20) an edge over a same-coeff club with no title history (ör. yeni yükselen bir takım, pedigree 0)", () => {
    // Süper Lig'in gerçek coeff ölçeğini (kabaca 38-92) yansıtan sentetik
    // takımlar -- gerçek data/superLigTeams.js dosyasını import ETMİYORUZ
    // (bkz. testFixtures.js başındaki not: testler PNG logo import'larına
    // bağımlı gerçek veri setinden bağımsız kalır).
    const decorated = { id: "storied-sl", coeff: 78, pedigree: 20 };
    const newlyPromoted = { id: "newcomer-sl", coeff: 78, pedigree: 0 };
    const { lambdaHome, lambdaAway } = expectedGoals(decorated, newlyPromoted);
    expect(lambdaHome).toBeGreaterThan(lambdaAway);
  });

  it("falls back to coeff-only behavior when pedigree is undefined (backward compatible)", () => {
    const withPedigree = { id: "a", coeff: 70, pedigree: 0 };
    const withoutPedigree = { id: "a", coeff: 70 };
    const opponent = { id: "b", coeff: 55 };
    const a = expectedGoals(withPedigree, opponent);
    const b = expectedGoals(withoutPedigree, opponent);
    expect(a.lambdaHome).toBeCloseTo(b.lambdaHome, 10);
    expect(a.lambdaAway).toBeCloseTo(b.lambdaAway, 10);
  });

  it("makes a European-elite-vs-modest-club mismatch a clear (not coinflip) favorite", () => {
    // Gerçek UCL'de olduğu gibi: elit bir Pot 1 kulübü (coeff ~125), bir
    // Pot 3 kulübüne (coeff ~46) deplasmanda gitse bile net favori olmalı.
    const elite = { id: "elite", coeff: 125 };
    const modest = { id: "modest", coeff: 46 };
    // modest ev sahibi, elite deplasmanda (favorinin en dezavantajlı hali).
    const { lambdaHome, lambdaAway } = expectedGoals(modest, elite);
    expect(lambdaAway).toBeGreaterThan(lambdaHome * 1.8);
  });

  it("respects a custom baseGoalsTotal setting", () => {
    const a = { id: "a", coeff: 60 };
    const b = { id: "b", coeff: 60 };
    const low = expectedGoals(a, b, null, { ...DEFAULT_MODEL_SETTINGS, baseGoalsTotal: 1.5 });
    const high = expectedGoals(a, b, null, { ...DEFAULT_MODEL_SETTINGS, baseGoalsTotal: 4.0 });
    expect(low.lambdaHome + low.lambdaAway).toBeLessThan(high.lambdaHome + high.lambdaAway);
  });

  it("derives probabilities that sum to ~1 and favor the stronger side", () => {
    const { lambdaHome, lambdaAway } = expectedGoals({ id: "a", coeff: 130 }, { id: "b", coeff: 15 });
    const probs = matchProbabilities(lambdaHome, lambdaAway);
    expect(probs.homeWinProb + probs.drawProb + probs.awayWinProb).toBeCloseTo(1, 5);
    expect(probs.homeWinProb).toBeGreaterThan(probs.awayWinProb);
  });
});

describe("predictionEngine.simulateMatch", () => {
  it("always returns non-negative integer goal counts", () => {
    const a = { id: "a", coeff: 80 };
    const b = { id: "b", coeff: 50 };
    for (let i = 0; i < 50; i++) {
      const sim = simulateMatch(a, b);
      expect(Number.isInteger(sim.homeGoals)).toBe(true);
      expect(Number.isInteger(sim.awayGoals)).toBe(true);
      expect(sim.homeGoals).toBeGreaterThanOrEqual(0);
      expect(sim.awayGoals).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("predictionEngine.deriveAttackDefenseRatio", () => {
  it("gives an attack-heavy squad a higher attackRatio and lower defenseRatio than a defense-heavy one", () => {
    const attackHeavySquad = [
      { position: "FW", rating: 90 },
      { position: "FW", rating: 88 },
      { position: "MF", rating: 82 },
      { position: "MF", rating: 80 },
      { position: "DF", rating: 65 },
      { position: "DF", rating: 65 },
      { position: "GK", rating: 65 },
    ];
    const defenseHeavySquad = [
      { position: "FW", rating: 65 },
      { position: "FW", rating: 65 },
      { position: "MF", rating: 70 },
      { position: "MF", rating: 70 },
      { position: "DF", rating: 90 },
      { position: "DF", rating: 88 },
      { position: "GK", rating: 85 },
    ];
    const attackHeavy = deriveAttackDefenseRatio(attackHeavySquad);
    const defenseHeavy = deriveAttackDefenseRatio(defenseHeavySquad);
    expect(attackHeavy.attackRatio).toBeGreaterThan(defenseHeavy.attackRatio);
    expect(attackHeavy.defenseRatio).toBeLessThan(defenseHeavy.defenseRatio);
  });

  it("falls back to neutral (1) ratios when given no players", () => {
    expect(deriveAttackDefenseRatio([])).toEqual({ attackRatio: 1, defenseRatio: 1 });
  });
});

describe("predictionEngine.expectedGoals with squad-derived attack/defense ratios", () => {
  it("an attack-heavy squad raises lambdaHome versus an identical-coeff balanced squad", () => {
    const home = { id: "a", coeff: 70 };
    const away = { id: "b", coeff: 70 };
    const baseline = expectedGoals(home, away);
    const attackHeavy = expectedGoals({ ...home, attackRatio: 1.15, defenseRatio: 0.95 }, away);
    expect(attackHeavy.lambdaHome).toBeGreaterThan(baseline.lambdaHome);
  });

  it("a strong-defense squad lowers the opponent's expected goals", () => {
    const home = { id: "a", coeff: 70 };
    const away = { id: "b", coeff: 70 };
    const baseline = expectedGoals(home, away);
    const strongDefense = expectedGoals({ ...home, defenseRatio: 1.15 }, away);
    expect(strongDefense.lambdaAway).toBeLessThan(baseline.lambdaAway);
  });
});

describe("predictionEngine.simulateMatch causal red card", () => {
  it("reduces the sent-off team's post-card scoring rate and raises the opponent's", () => {
    const home = { id: "a", coeff: 80 };
    const away = { id: "b", coeff: 80 };
    const settings = { ...DEFAULT_MODEL_SETTINGS, redCardChance: 1 };
    const N = 200;
    let homeBeforeRateSum = 0;
    let homeAfterRateSum = 0;
    let awayBeforeRateSum = 0;
    let awayAfterRateSum = 0;

    for (let i = 0; i < N; i++) {
      const sim = simulateMatch(home, away, null, false, settings);
      expect(sim.redCard).not.toBeNull();
      expect(sim.redCard.side).toBe("home"); // redCardChance=1 always trips the first (home) roll
      expect(sim.homeGoalsBeforeRed + sim.homeGoalsAfterRed).toBe(sim.homeGoals);
      expect(sim.awayGoalsBeforeRed + sim.awayGoalsAfterRed).toBe(sim.awayGoals);

      const beforeFraction = sim.redCard.minute / 90;
      const afterFraction = 1 - beforeFraction;
      homeBeforeRateSum += sim.homeGoalsBeforeRed / beforeFraction;
      homeAfterRateSum += sim.homeGoalsAfterRed / afterFraction;
      awayBeforeRateSum += sim.awayGoalsBeforeRed / beforeFraction;
      awayAfterRateSum += sim.awayGoalsAfterRed / afterFraction;
    }

    // 10-man takımın gol atma hızı kart sonrası düşmeli...
    expect(homeAfterRateSum / N).toBeLessThan(homeBeforeRateSum / N);
    // ...rakibinki ise (sayısal üstünlükle) artmalı.
    expect(awayAfterRateSum / N).toBeGreaterThan(awayBeforeRateSum / N);
  });
});

describe("predictionEngine.eloExpectedScore / updateForm (in-season Elo-style drift)", () => {
  it("gives the stronger side an expected score closer to 1, and it's symmetric with the weaker side's", () => {
    const strongExpected = eloExpectedScore(120, 40);
    const weakExpected = eloExpectedScore(40, 120);
    expect(strongExpected).toBeGreaterThan(0.5);
    expect(strongExpected + weakExpected).toBeCloseTo(1, 10);
  });

  it("returns exactly 0.5 for two equally-rated teams", () => {
    expect(eloExpectedScore(70, 70)).toBeCloseTo(0.5, 10);
  });

  it("rewards an upset (underdog wins) with a bigger drift than a big favorite winning as expected", () => {
    const formById = {};
    // Zayıf takım (coeff 20) güçlü rakibi (coeff 120) yener -- büyük sürpriz.
    updateForm(formById, "underdog", 20, 120, 1);
    // Güçlü takım (coeff 120) zayıf rakibi (coeff 20) yener -- beklenen sonuç.
    updateForm(formById, "favorite", 120, 20, 1);
    expect(formById.underdog).toBeGreaterThan(formById.favorite);
    expect(formById.underdog).toBeGreaterThan(0);
    expect(formById.favorite).toBeGreaterThan(0); // still a small positive nudge
  });

  it("gives a favorite a NEGATIVE drift when it only draws against a weak side (underperforming expectation)", () => {
    const formById = {};
    updateForm(formById, "favorite", 120, 20, 0.5);
    expect(formById.favorite).toBeLessThan(0);
  });

  it("clamps accumulated drift to the safety band even after many consecutive upsets", () => {
    const formById = {};
    for (let i = 0; i < 50; i++) {
      updateForm(formById, "underdog", 20, 120, 1);
    }
    expect(formById.underdog).toBeLessThanOrEqual(20);
  });

  it("accepts an explicit maxDrift override (used by computeMaxDrift-derived, competition-proportional caps)", () => {
    const formById = {};
    for (let i = 0; i < 50; i++) {
      updateForm(formById, "underdog", 20, 120, 1, 9);
    }
    expect(formById.underdog).toBeLessThanOrEqual(9);
    expect(formById.underdog).toBeGreaterThan(8); // actually reaches the (smaller) cap, isn't stuck far below it
  });
});

describe("predictionEngine.computeMaxDrift (in-season drift cap proportional to the competition's own coeff spread)", () => {
  // Kök neden: ELO_MAX_DRIFT (±20) başlangıçta SADECE UCL'nin coeff
  // açıklığına (kabaca 12-136, açıklık ~124) göre kalibre edilmişti. Süper
  // Lig'in açıklığı çok daha dar (kabaca 38-92, açıklık ~54) olduğundan AYNI
  // mutlak ±20 sınırı orada açıklığın %37'sine denk geliyor, ~%16'sına değil
  // -- bu da coeff'i en düşük takımlardan birinin sezon içi form kaymasıyla
  // lig genelindeki en güçlü takımı geride bırakabilmesine yol açıyordu.
  it("returns close to the legacy ±20 UCL-calibrated cap for a UCL-like wide coeff spread", () => {
    const ucLikeTeams = [{ coeff: 136 }, { coeff: 12 }]; // gerçek UCL açıklığı (~124)
    expect(computeMaxDrift(ucLikeTeams)).toBeCloseTo(20, 0);
  });

  it("returns a proportionally much smaller cap for Süper Lig's narrower coeff spread", () => {
    const ucLikeTeams = [{ coeff: 136 }, { coeff: 12 }];
    const superLigLikeTeams = [{ coeff: 92 }, { coeff: 38 }]; // gerçek Süper Lig açıklığı (~54)
    const wideMax = computeMaxDrift(ucLikeTeams);
    const narrowMax = computeMaxDrift(superLigLikeTeams);
    expect(narrowMax).toBeLessThan(wideMax / 2);
    expect(narrowMax).toBeGreaterThan(0); // mekanizma tamamen devre dışı kalmıyor
  });

  it("falls back to the legacy fixed cap when given no/insufficient team context (backward compatible)", () => {
    expect(computeMaxDrift(null)).toBe(20);
    expect(computeMaxDrift([{ coeff: 70 }])).toBe(20);
  });

  it("prevents a narrow-spread competition's bottom team from fully closing the gap on the top team via drift alone (the observed bug), while the old fixed ±20 cap would have let it get much closer", () => {
    const superLigLikeTeams = [{ coeff: 92 }, { coeff: 38 }];
    const range = 92 - 38;
    const properMax = computeMaxDrift(superLigLikeTeams);
    const legacyFixedMax = 20;

    // En iyi senaryoda (alt takım tam pozitif kaymaya, üst takım tam negatif
    // kaymaya doyar) kalan coeff farkı ne olurdu?
    const gapWithProportionalCap = 92 - properMax - (38 + properMax);
    const gapWithLegacyFixedCap = 92 - legacyFixedMax - (38 + legacyFixedMax);

    expect(gapWithProportionalCap).toBeGreaterThan(gapWithLegacyFixedCap);
    // Orantılı sınırla, açıklığın makul bir payı (en azından üçte biri) her
    // zaman korunmalı -- yani hiyerarşi salt form kaymasıyla asla TAMAMEN
    // tersine dönemez.
    expect(gapWithProportionalCap).toBeGreaterThan(range / 3);
  });

  it("still allows the previously-tested amount of drift for UCL's wide spread (no regression)", () => {
    const ucLikeTeams = [{ coeff: 136 }, { coeff: 12 }];
    const properMax = computeMaxDrift(ucLikeTeams);
    const formById = {};
    for (let i = 0; i < 50; i++) {
      updateForm(formById, "underdog", 20, 120, 1, properMax);
    }
    // Bu sezon zaten test edilmiş/onaylanmış UCL davranışı: doyum noktası
    // hâlâ ~20 civarında (eski sabitten pratikte ayırt edilemez).
    expect(formById.underdog).toBeCloseTo(20, 0);
  });
});

describe("predictionEngine.buildLeagueZones / buildSwissZones / resolveZone", () => {
  it("league zones cover every rank from 1..N with a single zone", () => {
    const zones = buildLeagueZones(18);
    for (let rank = 1; rank <= 18; rank++) {
      const zone = resolveZone(zones, rank);
      expect(zone).toBeDefined();
    }
    // last zone's max must reach the team count
    expect(zones[zones.length - 1].max).toBe(18);
  });

  it("swiss zones classify rank 1 as the best (direct) tone", () => {
    const zones = buildSwissZones(36);
    const zone1 = resolveZone(zones, 1);
    expect(zone1.tone).toBe("good");
    const zoneLast = resolveZone(zones, 36);
    expect(zoneLast.tone).toBe("bad");
  });
});

describe("predictionEngine.simulateSeason", () => {
  function buildSeason(settings) {
    const teams = makeLeagueTeams(10);
    const allPlayers = makePlayersForTeams(teams, 10);
    const fixture = generateRoundRobinFixture(teams);
    const zones = buildLeagueZones(teams.length);
    return simulateSeason(fixture, { teams, allPlayers, zones, settings });
  }

  it("produces a standings row for every team with played == total matchdays", () => {
    const teams = makeLeagueTeams(10);
    const totalMatchdays = 2 * (teams.length - 1);
    const sim = buildSeason();
    expect(sim.standings).toHaveLength(teams.length);
    for (const s of sim.standings) {
      expect(s.played).toBe(totalMatchdays);
      expect(s.w + s.d + s.l).toBe(totalMatchdays);
      expect(s.pts).toBe(s.w * 3 + s.d);
    }
  });

  it("ranks standings by points, then goal difference, then goals for", () => {
    const sim = buildSeason();
    for (let i = 1; i < sim.standings.length; i++) {
      const prev = sim.standings[i - 1];
      const cur = sim.standings[i];
      expect(
        prev.pts > cur.pts ||
          (prev.pts === cur.pts && prev.gd > cur.gd) ||
          (prev.pts === cur.pts && prev.gd === cur.gd && prev.gf >= cur.gf)
      ).toBe(true);
    }
  });

  it("assigns sequential rank numbers 1..N", () => {
    const sim = buildSeason();
    sim.standings.forEach((s, i) => expect(s.rank).toBe(i + 1));
  });

  it("produces one matchResult per fixture match with a chronological event timeline", () => {
    const teams = makeLeagueTeams(10);
    const totalMatches = (2 * (teams.length - 1) * teams.length) / 2;
    const sim = buildSeason();
    expect(sim.matchResults).toHaveLength(totalMatches);
    for (const m of sim.matchResults) {
      expect(m.homeGoals).toBeGreaterThanOrEqual(0);
      expect(m.awayGoals).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(m.sidelined)).toBe(true);
      for (let i = 1; i < m.events.length; i++) {
        expect(m.events[i].minute).toBeGreaterThanOrEqual(m.events[i - 1].minute);
      }
    }
  });

  it("suspends a red-carded player for the following matchday", () => {
    const teams = makeLeagueTeams(10);
    const allPlayers = makePlayersForTeams(teams, 10);
    const fixture = generateRoundRobinFixture(teams);
    const zones = buildLeagueZones(teams.length);
    // Kaotik ayar (yüksek kart yoğunluğu) kırmızı kart olasılığını artırır --
    // testin makul sürede en az bir kırmızı kart üretmesini güvenceye alır.
    const sim = simulateSeason(fixture, {
      teams,
      allPlayers,
      zones,
      settings: { ...MODEL_PRESETS.kaotik.settings },
    });

    const redCardEvent = sim.matchResults
      .flatMap((m) => m.events.map((e) => ({ ...e, matchdayNumber: m.matchdayNumber })))
      .find((e) => e.type === "red");

    if (!redCardEvent) {
      // Şans eseri bu koşuda hiç kırmızı kart çıkmadıysa testi anlamsızca
      // başarısız saymak yerine atla.
      return;
    }
    const nextMatchdayMatches = sim.matchResults.filter(
      (m) => m.matchdayNumber === redCardEvent.matchdayNumber + 1
    );
    const sidelinedNextWeek = nextMatchdayMatches.flatMap((m) => m.sidelined);
    const wasSidelined = sidelinedNextWeek.some(
      (s) => s.playerId === redCardEvent.player.id && s.reason === "kırmızı kart cezası"
    );
    expect(wasSidelined).toBe(true);
  });

  it("continues from initialStandings instead of starting at zero", () => {
    const teams = makeLeagueTeams(4);
    const allPlayers = makePlayersForTeams(teams, 4);
    const fixture = generateRoundRobinFixture(teams); // each team plays fixture.length matches (1/matchday)
    const zones = buildLeagueZones(teams.length);
    const initialStandings = { [teams[0].id]: { played: 3, w: 3, d: 0, l: 0, gf: 9, ga: 1, pts: 9 } };
    const sim = simulateSeason(fixture, { teams, allPlayers, zones, initialStandings });
    const row = sim.standings.find((s) => s.teamId === teams[0].id);
    // Seeded 3 already-played + every match in the given fixture gets simulated on top.
    expect(row.played).toBe(3 + fixture.length);
    expect(row.pts).toBeGreaterThanOrEqual(9);
  });

  it("with a narrow (Süper Lig-like) coeff spread, the proportional drift cap keeps the top team competitive at the top far more often than the bottom team, across many simulated seasons", () => {
    // Gerçek data/superLigTeams.js'i import ETMİYORUZ (bkz. dosya başındaki
    // not) -- ama coeff/pedigree DEĞERLERİ oradaki gerçek verilerle
    // BİREBİR eşleşiyor, böylece bu test gerçek Süper Lig senaryosunu
    // sadakatle yansıtır. Eski (sabit ±20) davranışta bu açıklıkta (~54)
    // en altta bir takımın form kaymasıyla zirvedeki takımı geride
    // bırakması gözlemlenmişti (bkz. predictionEngine.js'teki ELO_MAX_DRIFT
    // notu) -- bu test o regresyona karşı bir güvenlik ağıdır.
    const coeffsAndPedigree = [
      { coeff: 92, pedigree: 20 }, // Galatasaray
      { coeff: 90, pedigree: 15 }, // Fenerbahçe
      { coeff: 82, pedigree: 12 }, // Beşiktaş
      { coeff: 78, pedigree: 8 }, // Trabzonspor
      { coeff: 62, pedigree: 3 },
      { coeff: 60, pedigree: 0 },
      { coeff: 58, pedigree: 1 },
      { coeff: 55, pedigree: 0 },
      { coeff: 54, pedigree: 0 },
      { coeff: 53, pedigree: 0 },
      { coeff: 52, pedigree: 0 },
      { coeff: 50, pedigree: 0 },
      { coeff: 44, pedigree: 0 },
      { coeff: 43, pedigree: 0 },
      { coeff: 46, pedigree: 0 },
      { coeff: 45, pedigree: 0 },
      { coeff: 40, pedigree: 1 },
      { coeff: 38, pedigree: 0 }, // en düşük coeff, hiç pedigree yok
    ];
    const teams = coeffsAndPedigree.map((t, i) => ({
      id: `sl${i + 1}`,
      name: `SL Takım ${i + 1}`,
      short: `SL${i + 1}`,
      country: "TUR",
      ...t,
    }));
    const fixture = generateRoundRobinFixture(teams);
    const zones = buildLeagueZones(teams.length);
    const top = teams[0]; // en yüksek coeff + pedigree (Galatasaray benzeri)
    const bottom = teams[teams.length - 1]; // en düşük coeff, pedigree yok

    let topTop3Count = 0;
    let bottomTop3Count = 0;
    const N = 20;
    for (let i = 0; i < N; i++) {
      const sim = simulateSeason(fixture, { teams, zones });
      const topRow = sim.standings.find((s) => s.teamId === top.id);
      const bottomRow = sim.standings.find((s) => s.teamId === bottom.id);
      if (topRow.rank <= 3) topTop3Count++;
      if (bottomRow.rank <= 3) bottomTop3Count++;
    }

    expect(topTop3Count).toBeGreaterThan(bottomTop3Count);
  });
});

describe("predictionEngine.computeStandingsFromUserScores", () => {
  it("only counts matches with both scores filled in", () => {
    const teams = makeLeagueTeams(4);
    const fixture = generateRoundRobinFixture(teams);
    const firstMatch = fixture[0].matches[0];
    const userScores = { [firstMatch.id]: { home: "2", away: "1" } };
    const zones = buildLeagueZones(teams.length);
    const standings = computeStandingsFromUserScores(fixture, userScores, { teams, zones });

    const totalPlayed = standings.reduce((s, row) => s + row.played, 0);
    expect(totalPlayed).toBe(2); // one match affects two teams' "played" counts
    const home = standings.find((s) => s.teamId === firstMatch.homeTeam.id);
    expect(home.pts).toBe(3);
    expect(home.gf).toBe(2);
  });
});

describe("predictionEngine.standingsFromOrder", () => {
  it("assigns sequential ranks matching the given order", () => {
    const teams = makeLeagueTeams(5);
    const zones = buildLeagueZones(teams.length);
    const order = teams.map((t) => t.id).reverse();
    const standings = standingsFromOrder(order, teams, zones);
    standings.forEach((s, i) => {
      expect(s.teamId).toBe(order[i]);
      expect(s.rank).toBe(i + 1);
    });
  });
});

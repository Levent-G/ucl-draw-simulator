import { describe, it, expect } from "vitest";
import { generateFullDraw } from "../../utils/drawEngine.js";
import { buildResultsFromMatches } from "../../utils/resultsHelpers.js";
import { generateFixture } from "../../utils/fixtureEngine.js";
import { simulateSeason, enrichTeamsWithAttackDefense } from "../../utils/predictionEngine.js";
import { generateKnockoutBracket } from "../../utils/knockoutEngine.js";
import { serializeKnockout } from "../PredictionLeagueContext.jsx";
import { COMPETITIONS } from "../../data/competitions.js";

// Bu, PredictionLeagueContext.buildFreshSeasonPayload'ın TAM MANTIĞINI
// (kura -> fikstür -> simülasyon -> eleme turu -> serileştirme) uçtan uca
// gerçek UCL verisiyle sınar -- ama simulateSeasonAsync (Web Worker
// gerektirir, bu test ortamında yok) yerine senkron simulateSeason kullanır.
// "Fikstür haftalara bölünemedi" hatasının kök nedenini (generateFullDraw
// çıktısının dönüştürülmeden generateFixture'a verilmesi) sabitleyen asıl
// entegrasyon testi budur.
describe("Prediction League season-build chain (real UCL data, end-to-end except the worker hop)", () => {
  it("produces a complete, well-formed season payload including a knockout bracket", () => {
    const comp = COMPETITIONS.ucl;
    const allPlayers = comp.getAllPlayers();
    const enrichedTeams = enrichTeamsWithAttackDefense(comp.teams, allPlayers);

    const drawMatches = generateFullDraw(enrichedTeams);
    const drawResults = buildResultsFromMatches(enrichedTeams, drawMatches);
    const fixture = generateFixture(drawResults, enrichedTeams);
    expect(fixture).toHaveLength(8);

    const sim = simulateSeason(fixture, { teams: enrichedTeams, allPlayers, zones: comp.zones });
    const totalMatches = fixture.reduce((sum, md) => sum + md.matches.length, 0);
    expect(totalMatches).toBe((36 * 8) / 2);
    expect(sim.matchResults).toHaveLength(totalMatches);

    const teamById = Object.fromEntries(enrichedTeams.map((t) => [t.id, t]));
    const bracket = generateKnockoutBracket(sim.standings, teamById, null);
    const knockout = serializeKnockout(bracket);

    expect(knockout.champion).toBeTruthy();
    expect(knockout.rounds.length).toBeGreaterThan(0);
    for (const round of knockout.rounds) {
      for (const tie of round.ties) {
        expect(tie.winnerId).toBeTruthy();
        expect([tie.teamAId, tie.teamBId]).toContain(tie.winnerId);
        expect(tie.id).toMatch(/^\d+-\d+$/);
      }
    }

    // "Lig Sıralamasını Tahmin Et" (sürükle-bırak) aşamasının puanlanabilmesi
    // için final sıralamanın (takım id'leri, 1.'den son sıraya) da sezonun
    // bir parçası olarak üretilmesi gerekir.
    const standings = sim.standings.map((s) => s.teamId);
    expect(standings).toHaveLength(36);
    expect(new Set(standings).size).toBe(36); // tekrarsız, her takım tam bir kez
  });

  it("uses a PROVIDED draw result (from the real DrawPage ceremony) as-is instead of generating a new one", () => {
    // PredictionLeaguePage'in "Kura Çek" akışı: kullanıcı gerçek, animasyonlu
    // kura ekranını izler, DrawPage o çekilişin `results`'ını (zaten
    // {teamId: {pot: {home,away}}} şeklinde, generateFixture'ın beklediği
    // biçimde) üretir -- bu test, o "hazır" sonucun (yeniden kura
    // çekilmeden) doğrudan fikstüre çevrildiğini doğrular.
    const comp = COMPETITIONS.ucl;
    const allPlayers = comp.getAllPlayers();
    const enrichedTeams = enrichTeamsWithAttackDefense(comp.teams, allPlayers);
    const drawMatches = generateFullDraw(enrichedTeams);
    const providedDrawResults = buildResultsFromMatches(enrichedTeams, drawMatches);

    // DrawPage'in ürettiği TAM OLARAK bu şekli generateFixture'a verdiğimizde
    // (buildFreshSeasonPayload'ın providedDrawResults dalıyla aynı mantık)
    // hata fırlatmadan, providedDrawResults'taki eşleşmeleri birebir
    // yansıtan bir fikstür üretmeli.
    const fixture = generateFixture(providedDrawResults, enrichedTeams);
    expect(fixture).toHaveLength(8);
    const realMadridHomeOpponents = fixture
      .flatMap((md) => md.matches)
      .filter((m) => m.homeTeam.name === "Real Madrid")
      .map((m) => m.awayTeam.id);
    const expectedHomeOpponents = [1, 2, 3, 4]
      .map((pot) => providedDrawResults[enrichedTeams.find((t) => t.name === "Real Madrid").id][pot].home?.id)
      .filter(Boolean);
    expect(new Set(realMadridHomeOpponents)).toEqual(new Set(expectedHomeOpponents));
  });
});

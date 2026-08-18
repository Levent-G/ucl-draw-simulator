import { TEAMS } from '../data/teams.js'

function emptyFixtures() {
  return {
    1: { home: null, away: null },
    2: { home: null, away: null },
    3: { home: null, away: null },
    4: { home: null, away: null },
  }
}

// teams verilmezse (eski çağrı yerleri için geriye dönük uyum) UCL takımları
// kullanılır -- yeni kodda her zaman ilgili yarışmanın takım listesini geçin.
export function createEmptyResults(teams = TEAMS) {
  const r = {}
  for (const t of teams) r[t.id] = emptyFixtures()
  return r
}

// drawEngine.generateFullDraw()'ın ürettiği ham `matches` haritasını
// (teamId -> [{opponentId, home, viaPot}]) doğrudan `results` şekline
// (animasyon olmadan, "hızlı kura" senaryosunda) çevirir.
export function buildResultsFromMatches(teams, matches) {
  const teamById = {}
  for (const t of teams) teamById[t.id] = t
  const results = createEmptyResults(teams)
  for (const team of teams) {
    for (const m of matches[team.id] || []) {
      const opponent = teamById[m.opponentId]
      if (!opponent) continue
      results[team.id][m.viaPot][m.home ? 'home' : 'away'] = opponent
    }
  }
  return results
}

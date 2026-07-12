import { TEAMS } from '../data/teams.js'

function emptyFixtures() {
  return {
    1: { home: null, away: null },
    2: { home: null, away: null },
    3: { home: null, away: null },
    4: { home: null, away: null },
  }
}

export function createEmptyResults() {
  const r = {}
  for (const t of TEAMS) r[t.id] = emptyFixtures()
  return r
}

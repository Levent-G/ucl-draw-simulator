import { TEAMS } from '../src/data/teams.js'
import { generateFullDraw, buildAnnouncementPlan } from '../src/utils/drawEngine.js'

function validate(matches) {
  const teamById = {}
  for (const t of TEAMS) teamById[t.id] = t
  let errors = []

  for (const t of TEAMS) {
    const opp = matches[t.id]
    if (opp.length !== 8) errors.push(`${t.name}: 8 maç yerine ${opp.length}`)
    const potCount = { 1: 0, 2: 0, 3: 0, 4: 0 }
    const countryCount = {}
    let home = 0
    const seen = new Set()
    for (const m of opp) {
      if (seen.has(m.opponentId)) errors.push(`${t.name}: aynı rakiple iki kez (${m.opponentId})`)
      seen.add(m.opponentId)
      const oppTeam = teamById[m.opponentId]
      potCount[oppTeam.pot]++
      countryCount[oppTeam.country] = (countryCount[oppTeam.country] || 0) + 1
      if (m.home) home++
      if (oppTeam.country === t.country) errors.push(`${t.name}: kendi ülkesinden rakip (${oppTeam.name})`)
      if (oppTeam.pot !== m.viaPot) errors.push(`${t.name}: viaPot tutarsız`)
    }
    for (const p of [1, 2, 3, 4]) {
      if (potCount[p] !== 2) errors.push(`${t.name}: Pot${p}'dan ${potCount[p]} rakip (2 olmalı)`)
    }
    if (home !== 4) errors.push(`${t.name}: ${home} iç saha maçı (4 olmalı)`)
    for (const c of Object.keys(countryCount)) {
      if (countryCount[c] > 2) errors.push(`${t.name}: ${countryCount[c]} rakip aynı ülkeden (${c})`)
    }
  }
  return errors
}

let totalErrors = 0
const RUNS = 50
for (let i = 0; i < RUNS; i++) {
  const matches = generateFullDraw(TEAMS)
  const errors = validate(matches)
  if (errors.length) {
    totalErrors += errors.length
    console.log(`Run ${i + 1}: ${errors.length} hata`)
    errors.slice(0, 5).forEach((e) => console.log('  -', e))
  }
}
console.log(`\n${RUNS} çekiliş test edildi. Toplam hata: ${totalErrors}`)

// Örnek bir çıktı göster
const matches = generateFullDraw(TEAMS)
const plan = buildAnnouncementPlan(TEAMS, matches)
const sample = plan[0]
console.log(`\nÖrnek: ${sample.team.name} (Pot ${sample.team.pot}, ${sample.team.country})`)
for (const o of sample.opponents) {
  console.log(`  Pot${o.viaPot} ${o.home ? 'İÇ SAHA' : 'DEPLASMAN'}: ${o.team.name} (${o.team.country})`)
}

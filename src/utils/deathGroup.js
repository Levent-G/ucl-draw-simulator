// Her takımın 8 rakibinin toplam UEFA katsayısına bakar; en yükseğine sahip
// takım "Ölüm Grubu" unvanını alır (eğlence amaçlı bir istatistik).
export function computeToughestGroup(results, teams) {
  let best = null
  for (const team of teams) {
    const fixtures = results[team.id]
    let total = 0
    for (const pot of [1, 2, 3, 4]) {
      total += (fixtures[pot].home?.coeff || 0) + (fixtures[pot].away?.coeff || 0)
    }
    if (!best || total > best.total) {
      best = { team, total }
    }
  }
  return best
}

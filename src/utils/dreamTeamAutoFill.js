// Bir takımın kadrosunu (roster), mevcut formasyonun slotlarına mevkiye göre
// (en güçlüden başlayarak) yerleştirip bir squadMap üretir -- Rüya Takım'ın
// "Bir takımdan başla" özelliği için. Bir mevkide takımın kadrosu formasyonun
// istediği sayıdan azsa, o mevkideki fazla slot(lar) boş kalır (mevcut "boş
// slot = tıkla seç" davranışıyla tutarlı, hata fırlatılmaz).
export function buildXiFromTeamRoster(roster, competitionKey, formationSlots) {
  const byPosition = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of roster) byPosition[p.position]?.push(p);
  for (const key of Object.keys(byPosition)) {
    byPosition[key].sort((a, b) => b.rating - a.rating);
  }
  const squadMap = {};
  for (const slot of formationSlots) {
    const candidate = byPosition[slot.position]?.shift();
    if (candidate) squadMap[slot.id] = `${competitionKey}:${candidate.id}`;
  }
  return squadMap;
}

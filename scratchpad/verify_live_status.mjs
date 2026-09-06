import { SUPER_LIG_LIVE_RESULTS, SUPER_LIG_LIVE_STANDINGS } from "../src/data/liveStatus.js";

const table = {};
function ensure(name) {
  if (!table[name]) table[name] = { teamName: name, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  return table[name];
}

for (const r of SUPER_LIG_LIVE_RESULTS) {
  const h = ensure(r.home);
  const a = ensure(r.away);
  h.played++; a.played++;
  h.gf += r.homeGoals; h.ga += r.awayGoals;
  a.gf += r.awayGoals; a.ga += r.homeGoals;
  if (r.homeGoals > r.awayGoals) { h.w++; a.l++; h.pts += 3; }
  else if (r.homeGoals < r.awayGoals) { a.w++; h.l++; a.pts += 3; }
  else { h.d++; a.d++; h.pts += 1; a.pts += 1; }
}

const computed = Object.values(table).sort((x, y) => {
  if (y.pts !== x.pts) return y.pts - x.pts;
  const gdX = x.gf - x.ga, gdY = y.gf - y.ga;
  if (gdY !== gdX) return gdY - gdX;
  if (y.gf !== x.gf) return y.gf - x.gf;
  return x.teamName.localeCompare(y.teamName, "tr");
});

console.log(`Teams in results: ${Object.keys(table).length} (expect 18)`);
console.log(`Total matches: ${SUPER_LIG_LIVE_RESULTS.length} (expect 27)`);

let mismatches = 0;
for (let i = 0; i < SUPER_LIG_LIVE_STANDINGS.length; i++) {
  const stored = SUPER_LIG_LIVE_STANDINGS[i];
  const comp = computed[i];
  const same =
    comp &&
    stored.teamName === comp.teamName &&
    stored.played === comp.played &&
    stored.w === comp.w &&
    stored.d === comp.d &&
    stored.l === comp.l &&
    stored.gf === comp.gf &&
    stored.ga === comp.ga &&
    stored.pts === comp.pts;
  if (!same) {
    mismatches++;
    console.log(`MISMATCH at rank ${stored.rank}:`);
    console.log("  stored:  ", JSON.stringify(stored));
    console.log("  computed:", JSON.stringify(comp));
  }
}
console.log(mismatches === 0 ? "STANDINGS MATCH EXACTLY (rank order, played/w/d/l/gf/ga/pts all correct)." : `${mismatches} mismatches found.`);

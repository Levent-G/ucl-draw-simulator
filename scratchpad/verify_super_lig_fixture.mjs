import { REAL_FIXTURE_SUPERLIG_2026 } from "../src/data/realFixtureSuperLig2026.js";

const teamIds = Array.from({ length: 18 }, (_, i) => `s${i + 1}`);
let errors = [];

if (REAL_FIXTURE_SUPERLIG_2026.length !== 34) {
  errors.push(`Expected 34 weeks, got ${REAL_FIXTURE_SUPERLIG_2026.length}`);
}

const pairCount = {}; // key "s1|s2" sorted -> count
const homeAwayCount = {}; // "s1>s2" -> count (directional)
const idSet = new Set();

for (const week of REAL_FIXTURE_SUPERLIG_2026) {
  if (week.matches.length !== 9) {
    errors.push(`Week ${week.number}: expected 9 matches, got ${week.matches.length}`);
  }
  const seen = new Set();
  for (const m of week.matches) {
    if (idSet.has(m.id)) errors.push(`Duplicate id ${m.id}`);
    idSet.add(m.id);
    if (!teamIds.includes(m.homeId)) errors.push(`Week ${week.number}: bad homeId ${m.homeId}`);
    if (!teamIds.includes(m.awayId)) errors.push(`Week ${week.number}: bad awayId ${m.awayId}`);
    if (m.homeId === m.awayId) errors.push(`Week ${week.number}: team plays itself (${m.homeId})`);
    if (seen.has(m.homeId)) errors.push(`Week ${week.number}: team ${m.homeId} appears twice`);
    if (seen.has(m.awayId)) errors.push(`Week ${week.number}: team ${m.awayId} appears twice`);
    seen.add(m.homeId);
    seen.add(m.awayId);

    const key = [m.homeId, m.awayId].sort().join("|");
    pairCount[key] = (pairCount[key] || 0) + 1;
    const dirKey = `${m.homeId}>${m.awayId}`;
    homeAwayCount[dirKey] = (homeAwayCount[dirKey] || 0) + 1;
  }
  if (seen.size !== 18) {
    errors.push(`Week ${week.number}: only ${seen.size} distinct teams involved (expected 18)`);
  }
}

// Every unordered pair should meet exactly twice (home&away swapped), so
// there should be exactly C(18,2) = 153 unique pair keys, each count === 2.
const pairKeys = Object.keys(pairCount);
if (pairKeys.length !== 153) {
  errors.push(`Expected 153 unique team pairs, got ${pairKeys.length}`);
}
for (const [key, count] of Object.entries(pairCount)) {
  if (count !== 2) errors.push(`Pair ${key} met ${count} times (expected 2)`);
}
// each pair should be home once, away once (i.e. both directions appear exactly once)
for (const key of pairKeys) {
  const [a, b] = key.split("|");
  const ab = homeAwayCount[`${a}>${b}`] || 0;
  const ba = homeAwayCount[`${b}>${a}`] || 0;
  if (ab !== 1 || ba !== 1) {
    errors.push(`Pair ${key}: home/away not balanced (${a}>${b}=${ab}, ${b}>${a}=${ba})`);
  }
}

// each team should play exactly 34 matches total (17 home + 17 away)
const teamHome = {};
const teamAway = {};
for (const week of REAL_FIXTURE_SUPERLIG_2026) {
  for (const m of week.matches) {
    teamHome[m.homeId] = (teamHome[m.homeId] || 0) + 1;
    teamAway[m.awayId] = (teamAway[m.awayId] || 0) + 1;
  }
}
for (const t of teamIds) {
  const h = teamHome[t] || 0;
  const a = teamAway[t] || 0;
  if (h !== 17 || a !== 17) {
    errors.push(`Team ${t}: home=${h} away=${a} (expected 17/17)`);
  }
}

if (errors.length) {
  console.log("ERRORS:");
  for (const e of errors) console.log(" -", e);
  process.exitCode = 1;
} else {
  console.log("ALL CHECKS PASSED: 34 weeks x 9 matches, 153 unique pairs each met exactly twice (home+away balanced), each team plays 17 home + 17 away = 34 total.");
}

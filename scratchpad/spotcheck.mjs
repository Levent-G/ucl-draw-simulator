import { REAL_FIXTURE_SUPERLIG_2026 } from "../src/data/realFixtureSuperLig2026.js";

const names = [
  "Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "İstanbul Başakşehir",
  "Samsunspor", "Göztepe", "Kasımpaşa", "Konyaspor", "Alanyaspor", "Amed SFK",
  "Çaykur Rizespor", "Çorum FK", "Erzurumspor FK", "Gaziantep FK", "Eyüpspor",
  "Kocaelispor", "Gençlerbirliği",
];
const nameById = Object.fromEntries(names.map((n, i) => [`s${i + 1}`, n]));

function show(weekNum) {
  const wk = REAL_FIXTURE_SUPERLIG_2026.find((w) => w.number === weekNum);
  console.log(`\n== Week ${weekNum}: ${wk.label} ==`);
  for (const m of wk.matches) {
    console.log(`  ${nameById[m.homeId]} vs ${nameById[m.awayId]}  (${m.date})`);
  }
}

[1, 4, 9, 13, 15, 17, 21, 34].forEach(show);

// Scratchpad generator script — NOT part of the app. Produces
// src/data/realFixtureSuperLig2026.js from researched TFF/Wikipedia data.
import fs from "fs";

// ---- team id map (matches src/data/superLigTeams.js order/ids) ----
const TEAMS = [
  ["Galatasaray", "s1"],
  ["Fenerbahçe", "s2"],
  ["Beşiktaş", "s3"],
  ["Trabzonspor", "s4"],
  ["İstanbul Başakşehir", "s5"],
  ["Samsunspor", "s6"],
  ["Göztepe", "s7"],
  ["Kasımpaşa", "s8"],
  ["Konyaspor", "s9"],
  ["Alanyaspor", "s10"],
  ["Amed SFK", "s11"],
  ["Çaykur Rizespor", "s12"],
  ["Çorum FK", "s13"],
  ["Erzurumspor FK", "s14"],
  ["Gaziantep FK", "s15"],
  ["Eyüpspor", "s16"],
  ["Kocaelispor", "s17"],
  ["Gençlerbirliği", "s18"],
];

function norm(s) {
  const x = s
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u");
  if (x.includes("galatasaray")) return "s1";
  if (x.includes("fenerbah")) return "s2";
  if (x.includes("besiktas")) return "s3";
  if (x.includes("trabzonspor")) return "s4";
  if (x.includes("basaksehir")) return "s5";
  if (x.includes("samsunspor")) return "s6";
  if (x.includes("goztepe")) return "s7";
  if (x.includes("kasimpasa")) return "s8";
  if (x.includes("konyaspor")) return "s9";
  if (x.includes("alanyaspor")) return "s10";
  if (x.includes("amed")) return "s11";
  if (x.includes("rize")) return "s12";
  if (x.includes("corum")) return "s13";
  if (x.includes("erzurumspor")) return "s14";
  if (x.includes("gaziantep")) return "s15";
  if (x.includes("eyupspor")) return "s16";
  if (x.includes("kocaeli")) return "s17";
  if (x.includes("genc")) return "s18";
  throw new Error("Unmapped team: " + s);
}

// ---- raw weekly pairings [home, away], as sourced (see report) ----
const WEEKS_RAW = {
  1: [
    ["Galatasaray", "Çorum FK"],
    ["Gençlerbirliği", "Fenerbahçe"],
    ["Kasımpaşa", "Trabzonspor"],
    ["Konyaspor", "Çaykur Rizespor"],
    ["Gaziantep FK", "Alanyaspor"],
    ["Beşiktaş", "Eyüpspor"],
    ["Amed SFK", "Erzurumspor FK"],
    ["İstanbul Başakşehir", "Kocaelispor"],
    ["Samsunspor", "Göztepe"],
  ],
  2: [
    ["Erzurumspor FK", "Galatasaray"],
    ["Fenerbahçe", "Konyaspor"],
    ["Çaykur Rizespor", "Samsunspor"],
    ["Çorum FK", "Kasımpaşa"],
    ["Eyüpspor", "Gaziantep FK"],
    ["Trabzonspor", "İstanbul Başakşehir"],
    ["Göztepe", "Gençlerbirliği"],
    ["Alanyaspor", "Beşiktaş"],
    ["Kocaelispor", "Amed SFK"],
  ],
  3: [
    ["Gençlerbirliği", "Erzurumspor FK"],
    ["Konyaspor", "Kocaelispor"],
    ["Gaziantep FK", "Çaykur Rizespor"],
    ["Galatasaray", "Göztepe"],
    ["Eyüpspor", "Alanyaspor"],
    ["İstanbul Başakşehir", "Kasımpaşa"],
    ["Samsunspor", "Fenerbahçe"],
    ["Amed SFK", "Trabzonspor"],
    ["Beşiktaş", "Çorum FK"],
  ],
  4: [
    ["İstanbul Başakşehir", "Galatasaray"],
    ["Erzurumspor FK", "Konyaspor"],
    ["Fenerbahçe", "Beşiktaş"],
    ["Kasımpaşa", "Amed SFK"],
    ["Çorum FK", "Eyüpspor"],
    ["Trabzonspor", "Gençlerbirliği"],
    ["Kocaelispor", "Samsunspor"],
    ["Çaykur Rizespor", "Alanyaspor"],
    ["Göztepe", "Gaziantep FK"],
  ],
  5: [
    ["Beşiktaş", "Erzurumspor FK"],
    ["Eyüpspor", "Çaykur Rizespor"],
    ["Samsunspor", "Çorum FK"],
    ["Alanyaspor", "Göztepe"],
    ["Konyaspor", "Trabzonspor"],
    ["Gençlerbirliği", "Kasımpaşa"],
    ["Amed SFK", "İstanbul Başakşehir"],
    ["Galatasaray", "Kocaelispor"],
    ["Gaziantep FK", "Fenerbahçe"],
  ],
  6: [
    ["Kasımpaşa", "Konyaspor"],
    ["Çorum FK", "Alanyaspor"],
    ["Kocaelispor", "Gaziantep FK"],
    ["Trabzonspor", "Galatasaray"],
    ["İstanbul Başakşehir", "Gençlerbirliği"],
    ["Fenerbahçe", "Eyüpspor"],
    ["Erzurumspor FK", "Samsunspor"],
    ["Amed SFK", "Beşiktaş"],
    ["Göztepe", "Çaykur Rizespor"],
  ],
  7: [
    ["Gaziantep FK", "Çorum FK"],
    ["Eyüpspor", "Göztepe"],
    ["Alanyaspor", "Erzurumspor FK"],
    ["Konyaspor", "İstanbul Başakşehir"],
    ["Galatasaray", "Kasımpaşa"],
    ["Beşiktaş", "Kocaelispor"],
    ["Samsunspor", "Trabzonspor"],
    ["Çaykur Rizespor", "Fenerbahçe"],
    ["Gençlerbirliği", "Amed SFK"],
  ],
  8: [
    ["Trabzonspor", "Beşiktaş"],
    ["Kasımpaşa", "Samsunspor"],
    ["İstanbul Başakşehir", "Gaziantep FK"],
    ["Amed SFK", "Konyaspor"],
    ["Gençlerbirliği", "Galatasaray"],
    ["Çorum FK", "Çaykur Rizespor"],
    ["Fenerbahçe", "Alanyaspor"],
    ["Kocaelispor", "Göztepe"],
    ["Erzurumspor FK", "Eyüpspor"],
  ],
  9: [
    ["Gaziantep FK", "Erzurumspor FK"],
    ["Eyüpspor", "Kasımpaşa"],
    ["Alanyaspor", "Kocaelispor"],
    ["Konyaspor", "Gençlerbirliği"],
    ["Galatasaray", "Fenerbahçe"],
    ["Beşiktaş", "İstanbul Başakşehir"],
    ["Samsunspor", "Amed SFK"],
    ["Çaykur Rizespor", "Trabzonspor"],
    ["Göztepe", "Çorum FK"],
  ],
  10: [
    ["Trabzonspor", "Gaziantep FK"],
    ["Konyaspor", "Galatasaray"],
    ["Fenerbahçe", "Göztepe"],
    ["Kocaelispor", "Çaykur Rizespor"],
    ["Kasımpaşa", "Beşiktaş"],
    ["İstanbul Başakşehir", "Samsunspor"],
    ["Amed SFK", "Eyüpspor"],
    ["Gençlerbirliği", "Alanyaspor"],
    ["Erzurumspor FK", "Çorum FK"],
  ],
  11: [
    ["Gaziantep FK", "Kasımpaşa"],
    ["Eyüpspor", "Kocaelispor"],
    ["Alanyaspor", "Trabzonspor"],
    ["Çaykur Rizespor", "Erzurumspor FK"],
    ["Göztepe", "İstanbul Başakşehir"],
    ["Çorum FK", "Fenerbahçe"],
    ["Galatasaray", "Amed SFK"],
    ["Beşiktaş", "Gençlerbirliği"],
    ["Samsunspor", "Konyaspor"],
  ],
  12: [
    ["Trabzonspor", "Eyüpspor"],
    ["Kasımpaşa", "Alanyaspor"],
    ["İstanbul Başakşehir", "Çorum FK"],
    ["Amed SFK", "Çaykur Rizespor"],
    ["Gençlerbirliği", "Gaziantep FK"],
    ["Konyaspor", "Beşiktaş"],
    ["Galatasaray", "Samsunspor"],
    ["Kocaelispor", "Fenerbahçe"],
    ["Erzurumspor FK", "Göztepe"],
  ],
  13: [
    ["Gaziantep FK", "Amed SFK"],
    ["Eyüpspor", "İstanbul Başakşehir"],
    ["Alanyaspor", "Konyaspor"],
    ["Fenerbahçe", "Erzurumspor FK"],
    ["Beşiktaş", "Galatasaray"],
    ["Samsunspor", "Gençlerbirliği"],
    ["Çaykur Rizespor", "Kasımpaşa"],
    ["Göztepe", "Trabzonspor"],
    ["Çorum FK", "Kocaelispor"],
  ],
  14: [
    ["Trabzonspor", "Çorum FK"],
    ["Konyaspor", "Gaziantep FK"],
    ["Galatasaray", "Çaykur Rizespor"],
    ["Beşiktaş", "Samsunspor"],
    ["Kasımpaşa", "Göztepe"],
    ["İstanbul Başakşehir", "Fenerbahçe"],
    ["Amed SFK", "Alanyaspor"],
    ["Gençlerbirliği", "Eyüpspor"],
    ["Erzurumspor FK", "Kocaelispor"],
  ],
  15: [
    ["Gaziantep FK", "Beşiktaş"],
    ["Eyüpspor", "Galatasaray"],
    ["Alanyaspor", "Samsunspor"],
    ["Fenerbahçe", "Trabzonspor"],
    ["Kocaelispor", "Gençlerbirliği"],
    ["Çaykur Rizespor", "İstanbul Başakşehir"],
    ["Göztepe", "Konyaspor"],
    ["Çorum FK", "Amed SFK"],
    ["Erzurumspor FK", "Kasımpaşa"],
  ],
  16: [
    ["Trabzonspor", "Kocaelispor"],
    ["Kasımpaşa", "Fenerbahçe"],
    ["İstanbul Başakşehir", "Erzurumspor FK"],
    ["Amed SFK", "Göztepe"],
    ["Gençlerbirliği", "Çorum FK"],
    ["Konyaspor", "Eyüpspor"],
    ["Galatasaray", "Alanyaspor"],
    ["Beşiktaş", "Çaykur Rizespor"],
    ["Samsunspor", "Gaziantep FK"],
  ],
  17: [
    ["Gaziantep FK", "Galatasaray"],
    ["Eyüpspor", "Samsunspor"],
    ["Alanyaspor", "İstanbul Başakşehir"],
    ["Fenerbahçe", "Amed SFK"],
    ["Kocaelispor", "Kasımpaşa"],
    ["Çaykur Rizespor", "Gençlerbirliği"],
    ["Göztepe", "Beşiktaş"],
    ["Çorum FK", "Konyaspor"],
    ["Erzurumspor FK", "Trabzonspor"],
  ],
  18: [
    ["Alanyaspor", "Gaziantep FK"],
    ["Trabzonspor", "Kasımpaşa"],
    ["Kocaelispor", "İstanbul Başakşehir"],
    ["Erzurumspor FK", "Amed SFK"],
    ["Fenerbahçe", "Gençlerbirliği"],
    ["Çaykur Rizespor", "Konyaspor"],
    ["Çorum FK", "Galatasaray"],
    ["Eyüpspor", "Beşiktaş"],
    ["Göztepe", "Samsunspor"],
  ],
  19: [
    ["Gaziantep FK", "Eyüpspor"],
    ["Beşiktaş", "Alanyaspor"],
    ["Samsunspor", "Çaykur Rizespor"],
    ["Konyaspor", "Fenerbahçe"],
    ["Galatasaray", "Erzurumspor FK"],
    ["İstanbul Başakşehir", "Trabzonspor"],
    ["Gençlerbirliği", "Göztepe"],
    ["Kasımpaşa", "Çorum FK"],
    ["Amed SFK", "Kocaelispor"],
  ],
  20: [
    ["Alanyaspor", "Eyüpspor"],
    ["Trabzonspor", "Amed SFK"],
    ["Kocaelispor", "Konyaspor"],
    ["Fenerbahçe", "Samsunspor"],
    ["Çaykur Rizespor", "Gaziantep FK"],
    ["Kasımpaşa", "İstanbul Başakşehir"],
    ["Erzurumspor FK", "Gençlerbirliği"],
    ["Göztepe", "Galatasaray"],
    ["Çorum FK", "Beşiktaş"],
  ],
  21: [
    ["Galatasaray", "İstanbul Başakşehir"],
    ["Alanyaspor", "Çaykur Rizespor"],
    ["Gaziantep FK", "Göztepe"],
    ["Beşiktaş", "Fenerbahçe"],
    ["Samsunspor", "Kocaelispor"],
    ["Konyaspor", "Erzurumspor FK"],
    ["Gençlerbirliği", "Trabzonspor"],
    ["Amed SFK", "Kasımpaşa"],
    ["Eyüpspor", "Çorum FK"],
  ],
  22: [
    ["Fenerbahçe", "Gaziantep FK"],
    ["Trabzonspor", "Konyaspor"],
    ["Kocaelispor", "Galatasaray"],
    ["Çaykur Rizespor", "Eyüpspor"],
    ["Göztepe", "Alanyaspor"],
    ["İstanbul Başakşehir", "Amed SFK"],
    ["Kasımpaşa", "Gençlerbirliği"],
    ["Erzurumspor FK", "Beşiktaş"],
    ["Çorum FK", "Samsunspor"],
  ],
  23: [
    ["Galatasaray", "Trabzonspor"],
    ["Konyaspor", "Kasımpaşa"],
    ["Beşiktaş", "Amed SFK"],
    ["Alanyaspor", "Çorum FK"],
    ["Gaziantep FK", "Kocaelispor"],
    ["Samsunspor", "Erzurumspor FK"],
    ["Gençlerbirliği", "İstanbul Başakşehir"],
    ["Çaykur Rizespor", "Göztepe"],
    ["Eyüpspor", "Fenerbahçe"],
  ],
  24: [
    ["Fenerbahçe", "Çaykur Rizespor"],
    ["Kocaelispor", "Beşiktaş"],
    ["Trabzonspor", "Samsunspor"],
    ["Çorum FK", "Gaziantep FK"],
    ["Göztepe", "Eyüpspor"],
    ["Erzurumspor FK", "Alanyaspor"],
    ["Amed SFK", "Gençlerbirliği"],
    ["İstanbul Başakşehir", "Konyaspor"],
    ["Kasımpaşa", "Galatasaray"],
  ],
  25: [
    ["Beşiktaş", "Trabzonspor"],
    ["Samsunspor", "Kasımpaşa"],
    ["Gaziantep FK", "İstanbul Başakşehir"],
    ["Konyaspor", "Amed SFK"],
    ["Galatasaray", "Gençlerbirliği"],
    ["Çaykur Rizespor", "Çorum FK"],
    ["Alanyaspor", "Fenerbahçe"],
    ["Göztepe", "Kocaelispor"],
    ["Eyüpspor", "Erzurumspor FK"],
  ],
  26: [
    ["Kocaelispor", "Alanyaspor"],
    ["Trabzonspor", "Çaykur Rizespor"],
    ["Fenerbahçe", "Galatasaray"],
    ["Erzurumspor FK", "Gaziantep FK"],
    ["Kasımpaşa", "Eyüpspor"],
    ["Çorum FK", "Göztepe"],
    ["Gençlerbirliği", "Konyaspor"],
    ["İstanbul Başakşehir", "Beşiktaş"],
    ["Amed SFK", "Samsunspor"],
  ],
  27: [
    ["Gaziantep FK", "Trabzonspor"],
    ["Beşiktaş", "Kasımpaşa"],
    ["Samsunspor", "İstanbul Başakşehir"],
    ["Alanyaspor", "Gençlerbirliği"],
    ["Galatasaray", "Konyaspor"],
    ["Eyüpspor", "Amed SFK"],
    ["Göztepe", "Fenerbahçe"],
    ["Çaykur Rizespor", "Kocaelispor"],
    ["Çorum FK", "Erzurumspor FK"],
  ],
  28: [
    ["Kocaelispor", "Eyüpspor"],
    ["Trabzonspor", "Alanyaspor"],
    ["Erzurumspor FK", "Çaykur Rizespor"],
    ["İstanbul Başakşehir", "Göztepe"],
    ["Fenerbahçe", "Çorum FK"],
    ["Amed SFK", "Galatasaray"],
    ["Gençlerbirliği", "Beşiktaş"],
    ["Kasımpaşa", "Gaziantep FK"],
    ["Konyaspor", "Samsunspor"],
  ],
  29: [
    ["Alanyaspor", "Kasımpaşa"],
    ["Gaziantep FK", "Gençlerbirliği"],
    ["Beşiktaş", "Konyaspor"],
    ["Samsunspor", "Galatasaray"],
    ["Fenerbahçe", "Kocaelispor"],
    ["Eyüpspor", "Trabzonspor"],
    ["Çorum FK", "İstanbul Başakşehir"],
    ["Çaykur Rizespor", "Amed SFK"],
    ["Göztepe", "Erzurumspor FK"],
  ],
  30: [
    ["Konyaspor", "Alanyaspor"],
    ["Trabzonspor", "Göztepe"],
    ["Kocaelispor", "Çorum FK"],
    ["Galatasaray", "Beşiktaş"],
    ["Amed SFK", "Gaziantep FK"],
    ["İstanbul Başakşehir", "Eyüpspor"],
    ["Kasımpaşa", "Çaykur Rizespor"],
    ["Erzurumspor FK", "Fenerbahçe"],
    ["Gençlerbirliği", "Samsunspor"],
  ],
  31: [
    ["Fenerbahçe", "İstanbul Başakşehir"],
    ["Alanyaspor", "Amed SFK"],
    ["Gaziantep FK", "Konyaspor"],
    ["Samsunspor", "Beşiktaş"],
    ["Kocaelispor", "Erzurumspor FK"],
    ["Çorum FK", "Trabzonspor"],
    ["Göztepe", "Kasımpaşa"],
    ["Eyüpspor", "Gençlerbirliği"],
    ["Çaykur Rizespor", "Galatasaray"],
  ],
  32: [
    ["Beşiktaş", "Gaziantep FK"],
    ["Galatasaray", "Eyüpspor"],
    ["Samsunspor", "Alanyaspor"],
    ["Konyaspor", "Göztepe"],
    ["Trabzonspor", "Fenerbahçe"],
    ["İstanbul Başakşehir", "Çaykur Rizespor"],
    ["Amed SFK", "Çorum FK"],
    ["Gençlerbirliği", "Kocaelispor"],
    ["Kasımpaşa", "Erzurumspor FK"],
  ],
  33: [
    ["Kocaelispor", "Trabzonspor"],
    ["Fenerbahçe", "Kasımpaşa"],
    ["Erzurumspor FK", "İstanbul Başakşehir"],
    ["Göztepe", "Amed SFK"],
    ["Çorum FK", "Gençlerbirliği"],
    ["Eyüpspor", "Konyaspor"],
    ["Alanyaspor", "Galatasaray"],
    ["Çaykur Rizespor", "Beşiktaş"],
    ["Gaziantep FK", "Samsunspor"],
  ],
  34: [
    ["Galatasaray", "Gaziantep FK"],
    ["Samsunspor", "Eyüpspor"],
    ["İstanbul Başakşehir", "Alanyaspor"],
    ["Gençlerbirliği", "Çaykur Rizespor"],
    ["Beşiktaş", "Göztepe"],
    ["Konyaspor", "Çorum FK"],
    ["Amed SFK", "Fenerbahçe"],
    ["Kasımpaşa", "Kocaelispor"],
    ["Trabzonspor", "Erzurumspor FK"],
  ],
};

// ---- dates ----
// Weeks 1-3: already played, real dates (from src/data/liveStatus.js).
// Week 4: real scheduled dates confirmed via sahadan.com fixture page.
// Weeks 5-6: real per-match dates/times confirmed via TFF's official
// fixture pages (tff.org/Default.aspx?pageID=198&hafta=N).
// Weeks 7-34: TFF's page for that round currently shows only ONE
// provisional date per round (no confirmed per-match day/time split yet --
// those get finalized closer to each round once broadcast (beIN Sports/
// Tabii/TRT) scheduling is set, as is normal practice in the Süper Lig).
// We apply that single TFF-listed date to all 9 matches of the round.
const PERMATCH_DATES = {
  1: [
    "2026-08-14", // Galatasaray-Çorum FK
    "2026-08-15", // Gençlerbirliği-Fenerbahçe
    "2026-08-15", // Kasımpaşa-Trabzonspor
    "2026-08-15", // Konyaspor-Çaykur Rizespor
    "2026-08-15", // Gaziantep FK-Alanyaspor
    "2026-08-16", // Beşiktaş-Eyüpspor
    "2026-08-16", // Amed SFK-Erzurumspor FK
    "2026-08-16", // Başakşehir-Kocaelispor
    "2026-08-17", // Samsunspor-Göztepe
  ],
  2: [
    "2026-08-21", // Erzurumspor FK-Galatasaray
    "2026-08-22", // Fenerbahçe-Konyaspor
    "2026-08-22", // Çaykur Rizespor-Samsunspor
    "2026-08-22", // Çorum FK-Kasımpaşa
    "2026-08-23", // Eyüpspor-Gaziantep FK
    "2026-08-23", // Trabzonspor-Başakşehir
    "2026-08-23", // Göztepe-Gençlerbirliği
    "2026-08-23", // Alanyaspor-Beşiktaş
    "2026-08-24", // Kocaelispor-Amed SFK
  ],
  3: [
    "2026-08-28", // Gençlerbirliği-Erzurumspor FK
    "2026-08-29", // Konyaspor-Kocaelispor
    "2026-08-29", // Gaziantep FK-Çaykur Rizespor
    "2026-08-29", // Galatasaray-Göztepe
    "2026-08-30", // Eyüpspor-Alanyaspor
    "2026-08-30", // Başakşehir-Kasımpaşa
    "2026-08-30", // Samsunspor-Fenerbahçe
    "2026-08-31", // Amed SFK-Trabzonspor
    "2026-08-31", // Beşiktaş-Çorum FK
  ],
  4: [
    "2026-09-04", // Başakşehir-Galatasaray
    "2026-09-05", // Erzurumspor FK-Konyaspor
    "2026-09-05", // Fenerbahçe-Beşiktaş
    "2026-09-06", // Kasımpaşa-Amed SFK
    "2026-09-06", // Çorum FK-Eyüpspor
    "2026-09-06", // Trabzonspor-Gençlerbirliği
    "2026-09-06", // Kocaelispor-Samsunspor
    "2026-09-07", // Çaykur Rizespor-Alanyaspor
    "2026-09-07", // Göztepe-Gaziantep FK
  ],
  5: [
    "2026-09-11", // Beşiktaş-Erzurumspor FK
    "2026-09-12", // Eyüpspor-Çaykur Rizespor
    "2026-09-12", // Samsunspor-Çorum FK
    "2026-09-12", // Alanyaspor-Göztepe
    "2026-09-12", // Konyaspor-Trabzonspor
    "2026-09-13", // Gençlerbirliği-Kasımpaşa
    "2026-09-13", // Amed SFK-Başakşehir
    "2026-09-13", // Galatasaray-Kocaelispor
    "2026-09-14", // Gaziantep FK-Fenerbahçe
  ],
  6: [
    "2026-09-18", // Kasımpaşa-Konyaspor
    "2026-09-19", // Çorum FK-Alanyaspor
    "2026-09-19", // Kocaelispor-Gaziantep FK
    "2026-09-19", // Trabzonspor-Galatasaray
    "2026-09-19", // Başakşehir-Gençlerbirliği
    "2026-09-20", // Fenerbahçe-Eyüpspor
    "2026-09-20", // Erzurumspor FK-Samsunspor
    "2026-09-20", // Amed SFK-Beşiktaş
    "2026-09-20", // Göztepe-Çaykur Rizespor
  ],
};

const WEEK_DATE_SINGLE = {
  7: "2026-10-11",
  8: "2026-10-18",
  9: "2026-10-25",
  10: "2026-11-01",
  11: "2026-11-08",
  12: "2026-11-22",
  13: "2026-11-29",
  14: "2026-12-06",
  15: "2026-12-13",
  16: "2026-12-20",
  17: "2027-01-17",
  18: "2027-01-24",
  19: "2027-01-31",
  20: "2027-02-07",
  21: "2027-02-14",
  22: "2027-02-21",
  23: "2027-02-28",
  24: "2027-03-07",
  25: "2027-03-14",
  26: "2027-03-21",
  27: "2027-04-04",
  28: "2027-04-11",
  29: "2027-04-18",
  30: "2027-04-25",
  31: "2027-05-02",
  32: "2027-05-09",
  33: "2027-05-16",
  34: "2027-05-23",
};

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
function trDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${TR_MONTHS[m - 1]} ${y}`;
}

const fixture = [];
for (let w = 1; w <= 34; w++) {
  const pairs = WEEKS_RAW[w];
  if (!pairs || pairs.length !== 9) {
    throw new Error(`Week ${w} missing/incomplete (${pairs ? pairs.length : 0} matches)`);
  }
  const dates = PERMATCH_DATES[w] || pairs.map(() => WEEK_DATE_SINGLE[w]);
  const matches = pairs.map(([home, away], i) => ({
    id: `sr${w}m${i}`,
    homeId: norm(home),
    awayId: norm(away),
    date: dates[i],
  }));
  let label;
  if (PERMATCH_DATES[w]) {
    const first = trDate(dates[0]);
    const last = trDate(dates[dates.length - 1]);
    label = first === last ? `${w}. Hafta — ${first}` : `${w}. Hafta — ${trDate(dates[0]).split(" ")[0]}-${last}`;
  } else {
    label = `${w}. Hafta — ${trDate(WEEK_DATE_SINGLE[w])} (taslak)`;
  }
  fixture.push({ number: w, label, matches });
}

const header = `// 2026-27 Trendyol Süper Lig sezonunun GERÇEK 34 haftalık fikstürü.
//
// KAYNAKLAR / DOĞRULAMA:
// - 1-3. Haftalar: zaten OYNANMIŞ maçlar -- src/data/liveStatus.js'teki
//   SUPER_LIG_LIVE_RESULTS ile aynı tarih/eşleşmeler (Türkçe Vikipedi
//   "2026-27 Süper Lig" maddesinin ham wikitext'i + sabah.com.tr'nin
//   3. hafta program haberiyle çapraz doğrulandı; 27 maçın TAMAMINDAN
//   yeniden hesaplanan puan durumu Vikipedi'nin puan durumu şablonuyla
//   BİREBİR örtüşüyor).
// - 4. Hafta: sahadan.com'un fikstür sayfasından (4-7 Eylül 2026 tarihli,
//   henüz oynanmamış ama TV programıyla kesinleşmiş) alındı.
// - 5-6. Haftalar: TFF'nin resmi fikstür sayfasından (tff.org/Default.aspx
//   ?pageID=198&hafta=N), maç başına kesin tarih/saat ile.
// - 7-34. Haftalar: eşleşmeler (ev sahibi/deplasman) TFF'nin resmi fikstür
//   sayfasından (aynı URL deseni) alındı ve ayrıca standart çift devreli
//   lig simetrisiyle (n. hafta ile n+17. hafta aynı eşleşmenin ev sahibi/
//   deplasman YER DEĞİŞTİRİLMİŞ hali olmalı) çapraz kontrol edilip
//   doğrulandı. ANCAK bu haftalar için TFF sayfası henüz maç başına ayrı
//   gün/saat vermiyor (bkz. gerçek Süper Lig pratiği: yayıncı (beIN Sports/
//   Tabii/TRT) programı her hafta yaklaştıkça netleşir) -- bu yüzden bu
//   dosyada 7-34. haftaların HER maçına, TFF'nin o hafta için verdiği TEK
//   taslak tarih uygulanmıştır (haftanın 9 maçı da aynı "date" değerini
//   taşır). Bu tarihler ileride (TV programı netleştikçe) maç bazında
//   güncellenmelidir -- eşleşmelerin (kim kime karşı, ev/deplasman) kendisi
//   resmi kaynaktan geldiği için GÜVENİLİRDİR, sadece gün/saat kesinliği
//   haftaya göre değişir.
//
// Format: fixtureEngine.js'in serializeFixture() çıktısıyla aynı şekilde --
// deserializeFixture(REAL_FIXTURE_SUPERLIG_2026, SUPER_LIG_TEAMS) ile
// doğrudan kullanılabilir. id alanları "sr" öneki taşır (UCL'nin "r1m0" gibi
// id'leriyle -- bunlar route/React key olarak kullanıldığından -- ÇAKIŞMASIN
// diye).
export const REAL_FIXTURE_SUPERLIG_2026 = `;

const out = header + JSON.stringify(fixture, null, 2) + ";\n";
fs.writeFileSync(
  "C:/Users/28648806822/Desktop/ucl-draw-simulator/src/data/realFixtureSuperLig2026.js",
  out,
  "utf8"
);
console.log("wrote", fixture.length, "weeks");

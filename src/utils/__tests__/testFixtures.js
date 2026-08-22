// Testler için, gerçek data/*.js dosyalarına (ve oradaki PNG logo
// import'larına) bağımlı olmayan sentetik takım/oyuncu üreteçleri --
// motorların (drawEngine/fixtureEngine/predictionEngine/knockoutEngine)
// SADECE algoritmik doğruluğunu test eder, gerçek veri setinden bağımsızdır.
const COUNTRY_POOL = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14"];

export function makeSwissTeams(teamCount = 36, potCount = 4) {
  const perPot = teamCount / potCount;
  const teams = [];
  let id = 1;
  for (let pot = 1; pot <= potCount; pot++) {
    for (let i = 0; i < perPot; i++) {
      const country = COUNTRY_POOL[(id - 1) % COUNTRY_POOL.length];
      teams.push({
        id: `t${id}`,
        name: `Team ${id}`,
        short: `T${id}`,
        pot,
        country,
        coeff: 140 - pot * 10 - i,
      });
      id++;
    }
  }
  return teams;
}

export function makeLeagueTeams(count = 18) {
  const teams = [];
  for (let i = 1; i <= count; i++) {
    teams.push({
      id: `l${i}`,
      name: `Lig Takımı ${i}`,
      short: `L${i}`,
      country: "TUR",
      coeff: 100 - i,
    });
  }
  return teams;
}

const POSITIONS = ["GK", "DF", "MF", "FW"];

export function makePlayersForTeams(teams, perTeam = 8) {
  const players = [];
  for (const t of teams) {
    for (let i = 0; i < perTeam; i++) {
      players.push({
        id: `${t.id}-p${i + 1}`,
        teamId: t.id,
        name: `${t.short} Player ${i + 1}`,
        position: POSITIONS[i % POSITIONS.length],
        nationality: "XXX",
        rating: 60 + ((i * 7) % 35),
      });
    }
  }
  return players;
}

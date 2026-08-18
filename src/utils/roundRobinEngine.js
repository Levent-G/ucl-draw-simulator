// ============================================================================
// Çift devreli lig (round-robin) fikstür motoru — Trendyol Süper Lig gibi
// klasik "herkes herkesle iki kez oynar" ligler için.
// ============================================================================
// UCL/Avrupa Ligi'ndeki İsviçre modelinin aksine burada bir "kura" yok --
// N takımlı bir lig, standart "çember (circle) metodu" ile HER ZAMAN
// deterministik ve anlık üretilebilir bir fikstüre sahiptir (geri izleme/
// backtracking gerektirmez, donma riski yoktur).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// N takımlı tek devreli (herkes herkesle bir kez) takvimi üretir.
function singleRoundRobin(teams) {
  const list = [...teams];
  const bye = list.length % 2 !== 0 ? { id: "__bye__" } : null;
  if (bye) list.push(bye);

  const n = list.length;
  const rounds = n - 1;
  const half = n / 2;
  let arr = [...list];
  const matchdays = [];

  for (let r = 0; r < rounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a.id === "__bye__" || b.id === "__bye__") continue;
      // Round tekliğine göre ev sahibini alternatif yaparak, sezon genelinde
      // ev/deplasman dağılımını dengeliyoruz.
      const flip = r % 2 === 1;
      const home = flip ? b : a;
      const away = flip ? a : b;
      roundMatches.push({ id: `rr${r}-${i}`, homeTeam: home, awayTeam: away });
    }
    matchdays.push(roundMatches);
    // İlk takımı sabit tutup geri kalanları bir pozisyon döndür (klasik
    // "polygon" rotasyonu).
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }

  return matchdays;
}

// Çift devreli (herkes herkesle iki kez, ev/deplasman değişerek) tam fikstürü
// üretir: [{ number, label, matches: [{ id, homeTeam, awayTeam }] }, ...]
export function generateRoundRobinFixture(teams) {
  if (!teams || teams.length < 2) return [];
  const shuffledTeams = shuffle(teams);
  const firstHalf = singleRoundRobin(shuffledTeams);
  const secondHalf = firstHalf.map((round, idx) =>
    round.map((m) => ({
      id: `${m.id}-r2`,
      homeTeam: m.awayTeam,
      awayTeam: m.homeTeam,
    }))
  );
  const allRounds = [...firstHalf, ...secondHalf];
  return allRounds.map((matches, idx) => ({
    number: idx + 1,
    label: `${idx + 1}. Hafta`,
    matches,
  }));
}

export function serializeRoundRobinFixture(matchdays) {
  return matchdays.map((md) => ({
    number: md.number,
    label: md.label,
    matches: md.matches.map((m) => ({ id: m.id, homeId: m.homeTeam.id, awayId: m.awayTeam.id })),
  }));
}

export function deserializeRoundRobinFixture(raw, teams) {
  const teamById = {};
  for (const t of teams) teamById[t.id] = t;
  return raw.map((md) => ({
    number: md.number,
    label: md.label,
    matches: md.matches
      .map((m) => ({ id: m.id, homeTeam: teamById[m.homeId], awayTeam: teamById[m.awayId] }))
      .filter((m) => m.homeTeam && m.awayTeam),
  }));
}

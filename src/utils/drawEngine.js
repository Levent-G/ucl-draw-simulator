// ============================================================================
// UEFA Şampiyonlar Ligi Lig Fazı Kura Çekimi Motoru
// ============================================================================
//
// GERÇEK KURALLAR (2024/25 "İsviçre Modeli" ile birlikte gelen format):
//  1) 36 takım, katsayıya göre 4 torbaya (Pot) ayrılır: her torbada 9 takım.
//  2) Her takım toplam 8 maç oynar: HER torbadan (kendi torbası dahil, kendisi
//     hariç) tam olarak 2 rakip çeker.
//  3) Bir torbadan çekilen 2 rakipten biri evinde, diğeri deplasmanda oynanır.
//     Bu her torba için ayrı ayrı geçerlidir -> toplamda otomatik olarak 4 iç
//     saha + 4 deplasman maçı elde edilir.
//  4) Bir takım, kendi federasyonundan (ülkesinden) başka bir takımla ASLA
//     eşleşemez.
//  5) Bir takım, aynı federasyondan en fazla 2 farklı rakiple eşleşebilir
//     (örn. 5 İngiliz kulübü varken bir takım 3 İngiliz rakiple eşleşemez).
//  6) Aynı iki takım, çekilişte yalnızca bir kez karşı karşıya gelebilir.
//
// UEFA gerçek törende bilgisayar destekli bir yazılım kullanır çünkü bu kadar
// çok kısıtı elle sağlamak neredeyse imkansızdır. Biz de aynı mantığı izliyoruz:
// önce matematiksel olarak tam geçerli bir eşleşme kümesi üretiyoruz (kısıtları
// İNŞA SIRASINDA proaktif olarak uygulayan randomize backtracking ile), sonra
// bunu törendeki gibi torba sırasına göre (Pot 1 -> Pot 4) takım takım açıklıyoruz.
//
// Naif bir yaklaşım (önce bağımsız rastgele eşleştirmeler üretip sonra kuralları
// kontrol etmek) pratikte neredeyse hiç geçerli sonuç üretmez: örneğin 5 İngiliz
// kulübü varken, torbalar arasında bağımsız rastgele seçimler bir takıma kolayca
// 3+ İngiliz rakip verir. Bu yüzden her eşleşme eklenirken "bu ekleme kural
// 4/5/6'yı bozar mı?" kontrolü anında yapılır (forward-checking) ve ihlale yol
// açacak adaylar baştan elenir; sadece gerçekten çıkmaza girilirse geri izleme
// (backtrack) yapılır.
// ============================================================================

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Tüm çekilişi bir kez üretmeyi dener. Başarısız olursa null döner
// (dışarıda generateFullDraw tarafından yeniden denenir).
function attemptFullDraw(teamsByPot) {
  const allTeams = [1, 2, 3, 4].flatMap((p) => teamsByPot[p])

  const matches = {} // teamId -> [{opponentId, home, viaPot}]
  const opponentSet = {} // teamId -> Set(opponentId)
  const countryCount = {} // teamId -> { country: count }
  for (const t of allTeams) {
    matches[t.id] = []
    opponentSet[t.id] = new Set()
    countryCount[t.id] = {}
  }

  // Kural 4, 5 ve 6'yı proaktif olarak uygulayan uygunluk kontrolü.
  function canPair(a, b) {
    if (a.id === b.id) return false
    if (a.country === b.country) return false // kural 4
    if (opponentSet[a.id].has(b.id)) return false // kural 6
    if ((countryCount[a.id][b.country] || 0) >= 2) return false // kural 5
    if ((countryCount[b.id][a.country] || 0) >= 2) return false // kural 5
    return true
  }

  function commit(a, b, aIsHome) {
    matches[a.id].push({ opponentId: b.id, home: aIsHome, viaPot: b.pot })
    matches[b.id].push({ opponentId: a.id, home: !aIsHome, viaPot: a.pot })
    opponentSet[a.id].add(b.id)
    opponentSet[b.id].add(a.id)
    countryCount[a.id][b.country] = (countryCount[a.id][b.country] || 0) + 1
    countryCount[b.id][a.country] = (countryCount[b.id][a.country] || 0) + 1
  }

  function rollback(a, b) {
    matches[a.id].pop()
    matches[b.id].pop()
    opponentSet[a.id].delete(b.id)
    opponentSet[b.id].delete(a.id)
    countryCount[a.id][b.country] -= 1
    countryCount[b.id][a.country] -= 1
  }

  // --- Aynı torba içi (intra-pot) döngü: 9 takımı kapsayan, ülke kısıtına
  // uyan bir Hamilton döngüsü kurar. Döngü tek yönde yönlendirilir
  // (v1 evinde v2'yi ağırlar, v2 evinde v3'ü ağırlar, ...) böylece her takımın
  // otomatik olarak 1 iç saha + 1 deplasman komşusu olur (döngü uzunluğu tek
  // ya da çift olsa da çalışır).
  function buildIntraPotCycle(teams, maxAttempts = 300) {
    function backtrack(remaining, order) {
      if (remaining.length === 0) {
        return canPair(order[order.length - 1], order[0]) ? order : null
      }
      for (const cand of shuffle(remaining)) {
        if (order.length === 0 || canPair(order[order.length - 1], cand)) {
          const nextRemaining = remaining.filter((t) => t.id !== cand.id)
          const res = backtrack(nextRemaining, [...order, cand])
          if (res) return res
        }
      }
      return null
    }
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = backtrack(shuffle(teams), [])
      if (res) return res
    }
    return null
  }

  // --- Farklı torbalar arası (inter-pot): iki 9'lu grup arasında 2-regular
  // bipartite graph. Önce bir permütasyon (matching #1 = A evinde), commit
  // edilir; sonra ikinci permütasyon (matching #2 = A deplasmanda) GÜNCEL
  // (matching #1 sonrası) kısıtlara göre kurulur. Böylece iki eşleşme
  // birbiriyle ve önceki tüm kategorilerle tutarlı kalır.
  function buildOneSidedMatching(potA, potB, maxAttempts = 300) {
    function backtrack(remainingA, remainingBPool, pairs) {
      if (remainingA.length === 0) return pairs
      const [teamA, ...restA] = remainingA
      for (const teamB of shuffle(remainingBPool)) {
        if (canPair(teamA, teamB)) {
          const nextPool = remainingBPool.filter((t) => t.id !== teamB.id)
          const res = backtrack(restA, nextPool, [...pairs, [teamA, teamB]])
          if (res) return res
        }
      }
      return null
    }
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = backtrack(shuffle(potA), shuffle(potB), [])
      if (res) return res
    }
    return null
  }

  try {
    // 1) Aynı torba içi döngüler: (1,1) (2,2) (3,3) (4,4)
    for (const pot of [1, 2, 3, 4]) {
      const cycle = buildIntraPotCycle(teamsByPot[pot])
      if (!cycle) return null
      for (let i = 0; i < cycle.length; i++) {
        commit(cycle[i], cycle[(i + 1) % cycle.length], true)
      }
    }

    // 2) Farklı torbalar arası: tüm ikili kombinasyonlar.
    const potPairs = [
      [1, 2], [3, 4], [1, 3], [2, 4], [1, 4], [2, 3],
    ]
    for (const [pi, pj] of potPairs) {
      const m1 = buildOneSidedMatching(teamsByPot[pi], teamsByPot[pj])
      if (!m1) return null
      for (const [a, b] of m1) commit(a, b, true) // a (pot pi) evinde

      const m2 = buildOneSidedMatching(teamsByPot[pi], teamsByPot[pj])
      if (!m2) {
        // m1'i geri al ve bu tam çekiliş denemesini başarısız say.
        for (const [a, b] of m1) rollback(a, b)
        return null
      }
      for (const [a, b] of m2) commit(a, b, false) // a (pot pi) deplasmanda
    }
  } catch (e) {
    return null
  }

  // --- Son doğrulama (savunma amaçlı; yukarıdaki inşa mantığı zaten kuralları
  // garanti eder, ama olası bir programlama hatasına karşı çift kontrol) ---
  for (const t of allTeams) {
    const opp = matches[t.id]
    if (opp.length !== 8) return null
    const perPot = { 1: 0, 2: 0, 3: 0, 4: 0 }
    let home = 0
    for (const m of opp) {
      perPot[m.viaPot]++
      if (m.home) home++
    }
    if (perPot[1] !== 2 || perPot[2] !== 2 || perPot[3] !== 2 || perPot[4] !== 2) return null
    if (home !== 4) return null
  }

  return matches
}

// Dışarıya açık: tam geçerli bir kura sonucu üretir (gerekirse defalarca dener).
export function generateFullDraw(teams, maxTopLevelAttempts = 400) {
  const teamsByPot = { 1: [], 2: [], 3: [], 4: [] }
  for (const t of teams) teamsByPot[t.pot].push(t)

  for (let i = 0; i < maxTopLevelAttempts; i++) {
    const result = attemptFullDraw(teamsByPot)
    if (result) return result
  }
  throw new Error(
    'Kura, verilen kısıtlarla geçerli bir çözüme ulaşamadı. Takım/ülke dağılımını kontrol edin.'
  )
}

// Törendeki gibi bir "açıklama sırası" üretir: Pot 1 -> Pot 4, her torba içinde
// rastgele sıra. Her takım çekildiğinde, kendi torbasından başlayarak Pot 1->4
// sırasıyla 8 rakibini teker teker açıklıyoruz (gerçek yayında da böyle sunulur).
export function buildAnnouncementPlan(teams, matches) {
  const teamById = {}
  for (const t of teams) teamById[t.id] = t

  const plan = []
  for (const pot of [1, 2, 3, 4]) {
    const potTeams = shuffle(teams.filter((t) => t.pot === pot))
    for (const team of potTeams) {
      const opponents = [...matches[team.id]].sort((a, b) => a.viaPot - b.viaPot)
      plan.push({
        team,
        opponents: opponents.map((o) => ({
          team: teamById[o.opponentId],
          home: o.home,
          viaPot: o.viaPot,
        })),
      })
    }
  }
  return plan
}

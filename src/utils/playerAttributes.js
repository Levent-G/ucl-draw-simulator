// Oyuncuların boy/kilo/yaş/ayak tercihi gibi fiziksel özellikleri gerçek bir
// kaynaktan gelmiyor (2000+ oyuncu için tek tek araştırmak pratik değil) --
// tıpkı mevcut "rating" alanı gibi, mevkiye göre gerçekçi bir aralıkta,
// oyuncunun kimliğinden TÜRETİLMİŞ (deterministik/seed'li, her açılışta aynı
// kalan) TAHMİNİ değerlerdir. Arayüzde her zaman "(tahmini)" ibaresiyle
// gösterilmelidir.
export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

// Basit, deterministik (mulberry32 benzeri) sözde-rastgele üreteç.
export function seededRandom(seed) {
  let t = seed;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const HEIGHT_RANGES = {
  GK: [185, 200],
  DF: [178, 195],
  MF: [170, 188],
  FW: [168, 190],
};

const FOOT_OPTIONS = [
  { label: "Sağ", weight: 0.72 },
  { label: "Sol", weight: 0.22 },
  { label: "Her İkisi", weight: 0.06 },
];

export function derivePhysicalAttributes(player) {
  const seed = hashString(player.globalId || player.id || player.name || "player");
  const rand = seededRandom(seed);

  const [hMin, hMax] = HEIGHT_RANGES[player.position] || HEIGHT_RANGES.MF;
  const height = Math.round(hMin + rand() * (hMax - hMin));
  const weight = Math.round(height * 0.42 + (rand() - 0.5) * 10);
  const age = Math.round(19 + rand() * 16); // 19-35

  let roll = rand();
  let cumulative = 0;
  let foot = FOOT_OPTIONS[0].label;
  for (const opt of FOOT_OPTIONS) {
    cumulative += opt.weight;
    if (roll <= cumulative) {
      foot = opt.label;
      break;
    }
  }

  return { height, weight, age, foot };
}

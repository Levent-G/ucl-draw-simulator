// Oyuncunun sahada en çok bulunduğu bölgeleri gösteren ısı haritası verisi.
// Gerçek maç/takip verisi yok -- mevkiye göre gerçekçi bir "ev bölgesi" +
// yayılma yarıçapından, oyuncunun kimliğinden TÜRETİLMİŞ (deterministik,
// her açılışta aynı kalan) TAHMİNİ bir yoğunluk ızgarasıdır. Aynı prensip
// playerAttributes.js'teki boy/kilo/yaş üretimiyle aynıdır.
import { hashString, seededRandom } from "./playerAttributes.js";

// y=0 hücum üçte biri (forvet), y=1 kendi kale çizgisi (kaleci) -- Rüya
// Takım sahasındaki satır sırasıyla (forvet üstte, kaleci altta) tutarlı.
const POSITION_HOME_Y = { FW: 0.18, MF: 0.44, DF: 0.68, GK: 0.9 };
const POSITION_SPREAD = {
  FW: { x: 0.34, y: 0.22 },
  MF: { x: 0.42, y: 0.26 },
  DF: { x: 0.3, y: 0.18 },
  GK: { x: 0.14, y: 0.08 },
};

export function generatePlayerHeatGrid(player, cols = 9, rows = 12) {
  const seed = hashString(player.globalId || player.id || player.name || "player");
  const rand = seededRandom(seed);

  const homeY = POSITION_HOME_Y[player.position] || POSITION_HOME_Y.MF;
  const spread = POSITION_SPREAD[player.position] || POSITION_SPREAD.MF;
  const homeX = player.position === "GK" ? 0.5 : 0.16 + rand() * 0.68;
  // İkinci, daha zayıf bir "koşu" odağı -- kaleciler hariç, oyuncular
  // sahanın ortasına doğru da hareket eder (box-to-box eğilimi).
  const secondaryY = (homeY + 0.5) / 2;
  const secondaryWeight = player.position === "GK" ? 0 : 0.35 + rand() * 0.15;

  const grid = [];
  let max = 0;
  for (let j = 0; j < rows; j++) {
    const row = [];
    const y = (j + 0.5) / rows;
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.5) / cols;
      const primary = Math.exp(
        -(((x - homeX) ** 2) / (2 * spread.x ** 2) + ((y - homeY) ** 2) / (2 * spread.y ** 2))
      );
      const secondary =
        secondaryWeight *
        Math.exp(-(((x - homeX) ** 2) / (2 * (spread.x * 1.3) ** 2) + ((y - secondaryY) ** 2) / (2 * (spread.y * 1.3) ** 2)));
      const noise = 0.85 + rand() * 0.3;
      const value = (primary + secondary) * noise;
      row.push(value);
      if (value > max) max = value;
    }
    grid.push(row);
  }

  const normalized = grid.map((row) => row.map((v) => (max > 0 ? Math.min(1, v / max) : 0)));
  return { grid: normalized, homeX, homeY };
}

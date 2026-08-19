// Grafiklerde kullanılan renk paleti. Kategorik sıra (validate_palette.js ile
// projenin koyu lacivert zemini #0d1c48'e karşı doğrulanmıştır) SABİT
// tutulmalı -- bir grafikten diğerine kaydırılmamalı, sadece alt kümesi
// alınmalı (ör. 4 kategori gerekiyorsa ilk 4 slot).
export const CHART_SERIES = [
  "#3987e5", // 1 mavi
  "#d95926", // 2 turuncu
  "#199e70", // 3 turkuaz
  "#c98500", // 4 sarı
  "#d55181", // 5 magenta
  "#008300", // 6 yeşil
  "#9085e9", // 7 mor
  "#e66767", // 8 kırmızı
];

// Durum (status) renkleri -- kategorik paletten bağımsız, sabit anlam taşır.
export const STATUS_COLORS = {
  direct: "#0ca30c",
  playoff: "#fab219",
  out: "#d03b3b",
};

export const POSITION_COLORS = {
  GK: CHART_SERIES[6],
  DF: CHART_SERIES[0],
  MF: CHART_SERIES[2],
  FW: CHART_SERIES[1],
};

export const CHART_GRID = "rgba(255, 255, 255, 0.09)";
export const CHART_AXIS = "#9db2e6";
export const CHART_SURFACE = "#0d1c48";

// Klasik futbol analiz ısı haritası paleti (termal kamera tarzı): düşük
// yoğunlukta saydam, yükseldikçe mavi -> yeşil -> sarı -> kırmızıya döner.
// Oyuncu hareket yoğunluğu haritasında (PlayerHeatmap) kullanılır -- bu,
// yayın/analiz araçlarında evrensel olarak tanınan bir gösterim olduğu için
// kategorik/sıralı paletin dışında, kasıtlı bir istisnadır.
const THERMAL_STOPS = [
  { t: 0, rgb: [20, 90, 210], a: 0 },
  { t: 0.18, rgb: [30, 130, 235], a: 0.5 },
  { t: 0.4, rgb: [40, 210, 130], a: 0.72 },
  { t: 0.62, rgb: [250, 220, 20], a: 0.85 },
  { t: 0.82, rgb: [250, 130, 20], a: 0.92 },
  { t: 1, rgb: [230, 20, 20], a: 1 },
];
export function thermalColor(t) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
  let lo = THERMAL_STOPS[0];
  let hi = THERMAL_STOPS[THERMAL_STOPS.length - 1];
  for (let i = 0; i < THERMAL_STOPS.length - 1; i++) {
    if (clamped >= THERMAL_STOPS[i].t && clamped <= THERMAL_STOPS[i + 1].t) {
      lo = THERMAL_STOPS[i];
      hi = THERMAL_STOPS[i + 1];
      break;
    }
  }
  const span = hi.t - lo.t || 1;
  const localT = (clamped - lo.t) / span;
  const r = Math.round(lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * localT);
  const g = Math.round(lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * localT);
  const b = Math.round(lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * localT);
  const a = lo.a + (hi.a - lo.a) * localT;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

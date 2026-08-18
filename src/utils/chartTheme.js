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

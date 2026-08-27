import { simulateSeason } from "../utils/predictionEngine.js";

// 144 maçlık bir sezonu (oyuncu bazlı gol/asist/kart/sakatlık dahil) senkron
// hesaplamak ana thread'i bir süreliğine kilitleyip düşük güçlü/mobil
// cihazlarda arayüzü donduruyordu. Bu ağır hesaplama buraya, ayrı bir
// worker thread'ine taşınmıştır -- sonuç yapısal olarak klonlanabilir
// (fonksiyon/React elemanı içermez) olduğundan postMessage ile sorunsuz
// taşınır.
self.onmessage = (event) => {
  const { requestId, matchdays, options } = event.data;
  try {
    const result = simulateSeason(matchdays, options);
    self.postMessage({ requestId, result });
  } catch (err) {
    self.postMessage({ requestId, error: err?.message || String(err) });
  }
};

// simulateSeason'u (bkz. predictionEngine.js) bir Web Worker'da çalıştırıp
// Promise olarak döner -- 144 maçlık bir sezonu oyuncu bazlı istatistiklerle
// birlikte hesaplamak birkaç yüz milisaniye sürebiliyor; bunu ana thread'de
// senkron yapmak arayüzü (özellikle mobilde) kısa süreliğine dondurabilir.
// Worker tek bir örnek olarak lazy oluşturulup tekrar kullanılır; birden
// fazla eşzamanlı istek requestId ile ayrıştırılır.
let worker = null;
let nextRequestId = 1;
const pending = new Map();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("../workers/simulationWorker.js", import.meta.url), { type: "module" });
    worker.onmessage = (event) => {
      const { requestId, result, error } = event.data;
      const entry = pending.get(requestId);
      if (!entry) return;
      pending.delete(requestId);
      if (error) entry.reject(new Error(error));
      else entry.resolve(result);
    };
    worker.onerror = (event) => {
      // Worker'ın kendisi (import/parse aşamasında) çökerse bekleyen TÜM
      // istekleri reddet -- aksi halde sonsuza kadar asılı kalırlar.
      for (const entry of pending.values()) entry.reject(new Error(event.message || "Worker hatası"));
      pending.clear();
    };
  }
  return worker;
}

export function simulateSeasonAsync(matchdays, options) {
  return new Promise((resolve, reject) => {
    const requestId = nextRequestId++;
    pending.set(requestId, { resolve, reject });
    getWorker().postMessage({ requestId, matchdays, options });
  });
}

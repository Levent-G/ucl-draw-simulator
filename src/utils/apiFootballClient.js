// ============================================================================
// API-Football (api-sports.io / RapidAPI) -- ince, önbellekli istemci
// ============================================================================
// Bu proje BACKEND'SİZ (saf statik site) olduğundan anahtar BİLEREK
// istemci tarafında (Vite'ın VITE_ önekiyle taşıdığı, derlenmiş JS'e gömülen
// ortam değişkeninden) kullanılıyor -- kullanıcıyla konuşulup KABUL EDİLEN
// bir güvenlik/mimari tercihi bu (anahtar herkese açık JS'de görünür hale
// gelir, bir proxy sunucu YOK). VITE_API_FOOTBALL_KEY tanımlı değilse bu
// istemci SESSİZCE devre dışı kalır (isApiFootballConfigured() false döner)
// -- tüketen kod (bkz. realStandingsSelectors.js) bu durumda mevcut statik
// veriye düşer, hiçbir şey ÇÖKMEZ.
//
// Ücretsiz plan günde ~100 istek ile sınırlı -- bu yüzden HER istek
// localStorage'a önbelleklenir (varsayılan TTL 6 saat); aynı sayfayı tekrar
// tekrar ziyaret etmek kotayı tüketmez.
//
// DURUM (2026-09-03 itibarıyla): bu dosya YAZILDI ama HİÇBİR YERDEN
// ÇAĞRILMIYOR -- gerçek anahtarla test edildiğinde api-sports.io'nun
// ÜCRETSİZ planının 2026-27 sezonuna (hatta genel olarak GÜNCEL hiçbir
// sezona) erişimi OLMADIĞI görüldü ("Free plans do not have access to this
// season, try from 2022 to 2024" hatası -- standings/fixtures/live hepsinde
// aynı). Yani kota sorunu değil, planın kendisi bu kullanım amacına uygun
// değil. Kullanıcı ücretli bir plana geçerse bu istemci hazır -- sadece
// realStandingsSelectors.js'e bir "önce canlıyı dene, yoksa statik veriye
// düş" katmanı eklenip buradaki fonksiyonlar çağrılmaya başlanmalı.
const HOST = import.meta.env.VITE_API_FOOTBALL_HOST || "direct";
const KEY = import.meta.env.VITE_API_FOOTBALL_KEY || "";

const BASE_URL =
  HOST === "rapidapi" ? "https://api-football-v1.p.rapidapi.com/v3" : "https://v3.football.api-sports.io";

export function isApiFootballConfigured() {
  return Boolean(KEY);
}

function authHeaders() {
  return HOST === "rapidapi"
    ? { "x-rapidapi-key": KEY, "x-rapidapi-host": "api-football-v1.p.rapidapi.com" }
    : { "x-apisports-key": KEY };
}

const CACHE_PREFIX = "apiFootballCache:";
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 saat

function readCache(key, ttlMs) {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { t, data } = JSON.parse(raw);
    if (Date.now() - t > ttlMs) return undefined;
    return data;
  } catch (e) {
    return undefined;
  }
}

function writeCache(key, data) {
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), data }));
  } catch (e) {
    // localStorage dolu/erişilemez olabilir -- önbellek olmadan devam eder.
  }
}

// path: ör. "/standings". params: ör. {league: 2, season: 2026}.
// ttlMs: bu istek için önbellek süresi (varsayılan 6 saat -- puan
// durumu/fikstür bu kadar sık değişmez; canlı skor için çağıran taraf çok
// daha kısa bir ttlMs -- ör. 60_000 -- geçmeli).
// Anahtar tanımlı değilse ya da istek başarısız olursa null döner (throw
// ETMEZ) -- tüketen taraf bunu "canlı veri yok, statik veriye düş" sinyali
// olarak kullanır.
export async function apiFootballGet(path, params = {}, { ttlMs = DEFAULT_TTL_MS } = {}) {
  if (!isApiFootballConfigured()) return null;
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  const cacheKey = `${path}?${qs}`;
  const cached = readCache(cacheKey, ttlMs);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(`${BASE_URL}${path}?${qs}`, { headers: authHeaders() });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`API-Football isteği başarısız (${res.status}): ${path}`);
      return null;
    }
    const json = await res.json();
    if (json.errors && Object.keys(json.errors).length > 0) {
      // eslint-disable-next-line no-console
      console.warn("API-Football hata döndürdü:", json.errors);
      return null;
    }
    const data = json.response ?? null;
    if (data !== null) writeCache(cacheKey, data);
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`API-Football isteği atılamadı: ${path}`, e);
    return null;
  }
}

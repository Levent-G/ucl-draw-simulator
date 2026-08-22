import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// Kullanıcının uygulama genelindeki "başarıları" -- localStorage'a yazılır
// (SeasonArchiveContext ile aynı kalıcılık mantığı), böylece oturumlar
// arasında kaybolmaz. Kilit açma EVENT bazlıdır: ilgili aksiyonun olduğu
// yerde unlock(key) çağrılır (ör. kadro tamamlanınca, transfer yapılınca).
// unlock() idempotenttir -- zaten açık bir başarı için tekrar çağrılması
// güvenlidir (no-op).
export const ACHIEVEMENTS = [
  // --- Kura & Sezon ---
  { key: "ilk-kura", icon: "🎟️", label: "İlk Adım", desc: "Herhangi bir yarışmada kura çektin ya da sezonu başlattın." },
  { key: "ucl-yolcusu", icon: "🌟", label: "UCL Yolcusu", desc: "UEFA Şampiyonlar Ligi'nde en az bir model tahmini oluşturdun." },
  { key: "avrupa-fatihi", icon: "🧭", label: "Avrupa Fatihi", desc: "UEFA Avrupa Ligi'nde en az bir model tahmini oluşturdun." },
  { key: "super-lig-taraftari", icon: "🇹🇷", label: "Süper Lig Taraftarı", desc: "Trendyol Süper Lig'de sezonu başlattın." },
  { key: "sezon-gezgini", icon: "🌍", label: "Sezon Gezgini", desc: "UCL, Avrupa Ligi ve Süper Lig'in ÜÇÜNDE de en az bir kez sezon başlattın." },
  { key: "yenileme-bagimlisi", icon: "🔄", label: "Yenileme Bağımlısı", desc: "Bir yarışmada model tahminini 5 veya daha fazla kez yeniledin." },
  { key: "sampiyon-belirleyici", icon: "🏆", label: "Şampiyonluk Anı", desc: "Bir yarışmada model tahminiyle şampiyonu/puan durumunu belirledin." },
  { key: "kupa-sahibi", icon: "🥇", label: "Kupa Sahibi", desc: "Bir eleme turunu sonuna kadar simüle edip şampiyonu belirledin." },

  // --- Rüya Takım ---
  { key: "kadro-ustasi", icon: "⭐", label: "Kadro Ustası", desc: "Rüya Takım'da 11 kişilik kadroyu tamamladın." },
  { key: "taktisyen", icon: "📋", label: "Taktisyen", desc: "Rüya Takım'ı bir yarışmaya gönderdin." },
  { key: "formasyon-mimari", icon: "🧩", label: "Formasyon Mimarı", desc: "Rüya Takım'da 3 farklı diziliş denedin." },
  { key: "saha-mimari", icon: "🖐️", label: "Saha Mimarı", desc: "Bir oyuncuyu sahada serbestçe sürükleyip taşıdın." },
  { key: "karsilastirma-uzmani", icon: "⚖️", label: "Karşılaştırma Uzmanı", desc: "İki oyuncuyu yan yana karşılaştırdın." },

  // --- Transfer Merkezi ---
  { key: "transfer-guru", icon: "🔁", label: "Transfer Gurusu", desc: "Transfer Merkezi'nde 5 veya daha fazla transfer yaptın." },
  { key: "transfer-canavari", icon: "💼", label: "Transfer Canavarı", desc: "Transfer Merkezi'nde 15 veya daha fazla transfer yaptın." },
  { key: "pisman-oldum", icon: "↩️", label: "Pişman Oldum", desc: "Yaptığın bir transferi geri aldın." },

  // --- Tahmin / Canlı Skorlar ---
  { key: "kahin", icon: "🔮", label: "Kahin", desc: "Canlı Skorlar'da kendi girdiğin bir skoru, modelin ürettiği gerçek skorla birebir tutturdun." },
  { key: "kahin-pro", icon: "🧙", label: "Kahin Pro", desc: "3 farklı maçta skoru birebir tutturdun." },
  { key: "siralama-ustasi", icon: "🖐", label: "Sıralama Ustası", desc: "Canlı Skorlar'da sürükle-bırak ile kendi sıralamanı oluşturdun." },
  { key: "gol-krali-kahin", icon: "⚽", label: "Gol Kralı Kahini", desc: "Tahmin ettiğin gol kralı, modelin ürettiği gerçek gol kralıyla eşleşti." },
  { key: "foto-muhabiri", icon: "📸", label: "Foto Muhabiri", desc: "Bir tahminini fotoğraf olarak indirdin." },

  // --- Keşif ---
  { key: "kesif-ruhu", icon: "🔎", label: "Keşif Ruhu", desc: "Arama kutusunu kullanarak bir takım/oyuncu profiline gittin." },
  { key: "sezonun-yildizi", icon: "🌠", label: "Sezonun Yıldızı", desc: "\"Sezonun 11'i\" otomatik kadrosunu görüntüledin." },
  { key: "spiker", icon: "🎙️", label: "Spiker", desc: "Bir maçı canlı izleyip sonuna kadar takip ettin." },
  { key: "sesli-anlatim-hayrani", icon: "🔊", label: "Sesli Anlatım Hayranı", desc: "Maç Merkezi'nde sesli anlatımı açtın." },

  // --- Arşiv ---
  { key: "arsivci", icon: "🗂️", label: "Arşivci", desc: "Sezon Arşivi'nde 3 veya daha fazla sezon biriktirdin." },
  { key: "arsiv-koleksiyoncu", icon: "📚", label: "Arşiv Koleksiyoncusu", desc: "Sezon Arşivi'nde 10 veya daha fazla sezon biriktirdin." },
];

const STORAGE_KEY = "futbolSimulatorBasarilar";
const TOAST_DURATION_MS = 4200;

function loadUnlocked() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function persistUnlocked(keys) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (e) {
    // yok say
  }
}

const AchievementsContext = createContext(null);

export function AchievementsProvider({ children }) {
  const [unlockedKeys, setUnlockedKeys] = useState(loadUnlocked);
  const [toasts, setToasts] = useState([]);
  // React 18 StrictMode setState updater'ları (dev'de) İKİ KEZ çağırabilir --
  // bu yüzden "zaten açık mı" kontrolü setState'in İÇİNDE değil, senkron bir
  // ref üzerinde yapılır; updater'ların kendisi yan etkisiz (saf) kalır.
  const unlockedRef = useRef(new Set(loadUnlocked()));

  useEffect(() => persistUnlocked(unlockedKeys), [unlockedKeys]);

  const unlock = useCallback((key) => {
    const def = ACHIEVEMENTS.find((a) => a.key === key);
    if (!def || unlockedRef.current.has(key)) return;
    unlockedRef.current.add(key);
    setUnlockedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setToasts((t) => [...t, { id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...def }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismissToast(t.id), TOAST_DURATION_MS)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dismissToast]);

  const value = { unlockedKeys, unlock, toasts, dismissToast };
  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievements bir <AchievementsProvider> içinde kullanılmalıdır.");
  return ctx;
}

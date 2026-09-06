// Bir maçın GERÇEK tarihi varsa (şu an sadece UCL'de, bkz. REAL_FIXTURE_2026)
// ve bu tarih henüz gelmediyse maç "oynanmadı" sayılır -- model bir sonuç
// üretmiş olsa bile skor gerçek gibi gösterilmez. Gerçek tarihi olmayan
// yarışmalarda (Avrupa Ligi/Süper Lig, henüz gerçek takvim yok) her zaman
// "oynanmış" kabul edilir (eski davranış korunur).
export function isMatchPlayed(match) {
  if (!match?.date) return true;
  return new Date(match.date) <= new Date();
}

export function formatMatchDate(dateStr, opts) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", opts || { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

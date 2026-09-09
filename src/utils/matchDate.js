// Bir maçın GERÇEK tarihi varsa (şu an sadece UCL'de, bkz. REAL_FIXTURE_2026)
// ve bu tarih henüz gelmediyse maç "oynanmadı" sayılır -- model bir sonuç
// üretmiş olsa bile skor gerçek gibi gösterilmez. Gerçek tarihi olmayan
// yarışmalarda (Avrupa Ligi/Süper Lig, henüz gerçek takvim yok) her zaman
// "oynanmış" kabul edilir (eski davranış korunur).
//
// ÖNEMLİ: karşılaştırma GÜN bazında yapılır, saat bazında DEĞİL -- eskiden
// `new Date(match.date) <= new Date()` kullanılıyordu, bu da maçın tarihi
// (ör. "2026-09-09" -> UTC gece yarısı) günün İLK saatlerinde bile geçmiş
// sayılıyordu; akşam oynanacak bir maç (ör. 21:00 kickoff) daha başlamadan
// "oynandı" işaretleniyor, model tahmini yerine boş/yanlış bir "sonuç"
// durumuna düşülüyordu. Artık SADECE takvimde KESİN olarak geçmiş bir gün
// (bugünden ÖNCEKİ bir gün) "oynanmış" sayılır -- bugünün maçları, gerçek
// sonucu elle eklenene kadar hep "henüz oynanmadı" (model tahmini) olarak
// kalır.
export function isMatchPlayed(match) {
  if (!match?.date) return true;
  const matchDay = new Date(match.date);
  matchDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return matchDay < today;
}

export function formatMatchDate(dateStr, opts) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", opts || { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

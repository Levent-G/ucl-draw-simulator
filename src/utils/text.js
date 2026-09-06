// Türkçe büyük/küçük harf kurallarına göre karşılaştırılabilir bir arama
// anahtarı üretir. Sıradan .toLowerCase() (ve 'en-US' locale'i) Türkçe büyük
// "İ" harfini (U+0130) "i" + BİRLEŞEN NOKTA İŞARETİ'ne (U+0307, 2 kod noktası)
// çevirir -- bu da "İrfan" gibi isimlerde düz yazılmış "irfan" aramasıyla
// eşleşmeyi bozar. Sadece 'tr-TR' locale'i tek karakterlik doğru 'i' üretir.
export function toSearchKey(str) {
  return (str ?? "").toLocaleLowerCase("tr-TR").trim();
}

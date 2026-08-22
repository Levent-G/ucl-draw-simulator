// Backend olmadan, küçük bir durumu (Rüya Takım kadrosu, Canlı Skorlar
// tahmini vb.) bir URL parametresine sıkıştırıp paylaşılabilir link üretmek
// için kullanılır. Sıkıştırma yok -- sadece UTF-8 güvenli base64url kodlama
// (büyük veri için uygun değildir, ama bu boyuttaki küçük JSON'lar için
// yeterlidir).
export function encodeShareData(obj) {
  try {
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (e) {
    return null;
  }
}

export function decodeShareData(str) {
  if (!str) return null;
  try {
    let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Panoya kopyalar; tarayıcı Clipboard API'yi desteklemiyorsa (ör. http/eski
// tarayıcı) sessizce false döner -- çağıran taraf kullanıcıya linki elle
// gösterebilir.
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // yok say
  }
  return false;
}

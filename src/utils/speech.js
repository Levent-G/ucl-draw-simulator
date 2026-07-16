// Tarayıcının yerleşik SpeechSynthesis API'sini kullanır -- ekstra ses
// dosyası ya da telifli içerik gerektirmez, tamamen ücretsiz ve yereldir.
export function speak(text, enabled, { cancelFirst = false } = {}) {
  if (!enabled) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    if (cancelFirst) window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    utter.rate = 1.05;
    utter.pitch = 1.0;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    // Tarayıcı desteklemiyorsa sessizce yok say.
  }
}

export function cancelSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // yok say
    }
  }
}

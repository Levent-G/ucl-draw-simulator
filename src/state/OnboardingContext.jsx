import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// Uygulama artık çok sayıda özellik içeriyor (arama, kariyer modu, rozetler,
// paylaşım linkleri, canlı maç izleme, gelişmiş ayarlar...) -- yeni bir
// kullanıcının bunların çoğunu fark etmeden geçmesi kolay. Bu context, ilk
// ziyarette otomatik açılan (ve navbar'daki "✨ Yenilikler" ikonuyla
// istenildiğinde tekrar açılabilen) kısa bir tanıtım turunu yönetir.
// STORAGE_VERSION artırılırsa (yeni bir tanıtım turu eklenince), daha önce
// turu görmüş kullanıcılara da YENİDEN gösterilir.
const STORAGE_KEY = "futbolSimulatorTanitimGorundu";
const STORAGE_VERSION = "v1";

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seenVersion = window.localStorage.getItem(STORAGE_KEY);
      if (seenVersion !== STORAGE_VERSION) setIsOpen(true);
    } catch (e) {
      // yok say
    }
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, STORAGE_VERSION);
    } catch (e) {
      // yok say
    }
  }, []);

  const openTour = useCallback(() => setIsOpen(true), []);

  const value = { isOpen, openTour, closeTour };
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding bir <OnboardingProvider> içinde kullanılmalıdır.");
  return ctx;
}

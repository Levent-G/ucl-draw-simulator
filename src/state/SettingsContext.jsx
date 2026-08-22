import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_MODEL_SETTINGS, MODEL_PRESETS } from "../utils/predictionEngine.js";

// Kullanıcının model parametrelerini (gol ortalaması, ev sahibi avantajı,
// sakatlık sıklığı, kart yoğunluğu) ince ayar yapabildiği "Gelişmiş Ayarlar"
// paneli -- tarayıcıda kalıcıdır (SeasonArchiveContext ile aynı mantık),
// çünkü bu bir OTURUM tercihi değil, kullanıcının genel bir "oyun tarzı"
// seçimidir.
const STORAGE_KEY = "futbolSimulatorAyarlar";

function loadSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_MODEL_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MODEL_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_MODEL_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_MODEL_SETTINGS };
  }
}

function persistSettings(settings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // yok say
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => persistSettings(settings), [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((presetKey) => {
    const preset = MODEL_PRESETS[presetKey];
    if (!preset) return;
    setSettings({ ...preset.settings });
  }, []);

  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_MODEL_SETTINGS }), []);

  const value = { settings, updateSetting, applyPreset, resetSettings };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings bir <SettingsProvider> içinde kullanılmalıdır.");
  return ctx;
}

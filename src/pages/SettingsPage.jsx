import React from "react";
import { useSettings } from "../state/SettingsContext.jsx";
import { MODEL_PRESETS, MODEL_SETTING_RANGES, DEFAULT_MODEL_SETTINGS } from "../utils/predictionEngine.js";

export default function SettingsPage() {
  const { settings, updateSetting, applyPreset, resetSettings } = useSettings();

  const activePreset = Object.values(MODEL_PRESETS).find(
    (p) => JSON.stringify(p.settings) === JSON.stringify(settings)
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Gelişmiş Ayarlar</div>
          <h1>Model Ayarları</h1>
          <p>
            Tahmin motorunun gol ortalaması, ev sahibi avantajı, sakatlık sıklığı ve kart
            yoğunluğunu kendine göre ayarla. Değişiklikler bir sonraki "Model Tahminlerini
            Yenile"de (ya da yeni bir kura/sezonda) devreye girer -- tarayıcında kalıcıdır.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={resetSettings}>
            Varsayılana Dön
          </button>
        </div>
      </header>

      <div className="settings-preset-row">
        {Object.values(MODEL_PRESETS).map((p) => (
          <button
            key={p.key}
            className={`settings-preset-btn ${activePreset?.key === p.key ? "active" : ""}`}
            onClick={() => applyPreset(p.key)}
          >
            <span className="settings-preset-icon">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="chart-card settings-sliders-card">
        {Object.entries(MODEL_SETTING_RANGES).map(([key, range]) => (
          <div className="settings-slider-row" key={key}>
            <div className="settings-slider-head">
              <label htmlFor={`setting-${key}`}>{range.label}</label>
              <span className="settings-slider-value">
                {settings[key].toFixed(2)} {range.unit}
              </span>
            </div>
            <input
              id={`setting-${key}`}
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={settings[key]}
              onChange={(e) => updateSetting(key, Number(e.target.value))}
              className="settings-slider"
              aria-valuetext={`${settings[key].toFixed(2)} ${range.unit}`}
            />
            <div className="settings-slider-default">
              Varsayılan: {DEFAULT_MODEL_SETTINGS[key].toFixed(2)} {range.unit}
            </div>
          </div>
        ))}
      </div>

      <p className="footnote">
        Bu ayarlar tahmin motorunun Poisson tabanlı model parametrelerini değiştirir --
        gerçek bir futbol istatistiği kaynağından gelmez, tamamen eğlence amaçlı bir
        özelleştirmedir.
      </p>
    </div>
  );
}

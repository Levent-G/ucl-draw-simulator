import React, { useState } from 'react'
import { TEAMS } from '../data/teams.js'
import Crest from './Crest.jsx'

export default function FavoriteTeamPicker({
  favoriteTeamId,
  onSelectFavorite,
  predictions,
  onTogglePrediction,
  ttsEnabled,
  onToggleTts,
  drawCount,
}) {
  const [query, setQuery] = useState('')
  const favoriteTeam = TEAMS.find((t) => t.id === favoriteTeamId)
  const otherTeams = TEAMS.filter((t) => t.id !== favoriteTeamId)
  const filtered = query
    ? otherTeams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : otherTeams

  return (
    <div className="setup-panel">
      <div className="setup-row">
        <div className="setup-field">
          <label htmlFor="favorite-team-select">Tuttuğun takım (opsiyonel)</label>
          <select
            id="favorite-team-select"
            value={favoriteTeamId || ''}
            onChange={(e) => onSelectFavorite(e.target.value || null)}
          >
            <option value="">Seçmedim</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <label className="setup-toggle">
          <input type="checkbox" checked={ttsEnabled} onChange={(e) => onToggleTts(e.target.checked)} />
          Sesli anlatım
        </label>

        {drawCount > 0 && (
          <span className="setup-count">Bu cihazda {drawCount + 1}. çekilişin</span>
        )}
      </div>

      {favoriteTeam && (
        <div className="prediction-picker">
          <div className="prediction-title">
            <Crest team={favoriteTeam} size={22} />
            <span>{favoriteTeam.name} için 3 rakip tahmin et (opsiyonel)</span>
            <span className="prediction-count">{predictions.length}/3</span>
          </div>
          <input
            type="text"
            className="prediction-search"
            placeholder="Takım ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="prediction-chips">
            {filtered.slice(0, 14).map((t) => {
              const selected = predictions.includes(t.id)
              const disabled = !selected && predictions.length >= 3
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`prediction-chip ${selected ? 'selected' : ''}`}
                  disabled={disabled}
                  onClick={() => onTogglePrediction(t.id)}
                >
                  <Crest team={t} size={16} />
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

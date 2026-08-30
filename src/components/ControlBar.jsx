import React from 'react'

const SPEEDS = [
  { key: 'slow', label: 'Yavaş' },
  { key: 'normal', label: 'Normal' },
  { key: 'fast', label: 'Hızlı' },
]

export default function ControlBar({ phase, speed, onSpeedChange, onReset, onSkip, progress }) {
  return (
    <div className="control-bar">
      {phase === 'drawing' && (
        <button className="btn btn-ghost" onClick={onSkip}>
          Sonuca Atla
        </button>
      )}

      {phase !== 'idle' && (
        <button className="btn btn-ghost" onClick={onReset}>
          Sıfırla
        </button>
      )}

      <div className="speed-group">
        {SPEEDS.map((s) => (
          <button
            key={s.key}
            className={`speed-btn ${speed === s.key ? 'active' : ''}`}
            onClick={() => onSpeedChange(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {phase !== 'idle' && (
        <>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <span className="progress-label">{Math.round(progress * 100)}%</span>
        </>
      )}

  
    </div>
  )
}

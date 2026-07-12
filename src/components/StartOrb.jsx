import React from 'react'

export default function StartOrb({ onClick, label, sublabel, disabled }) {
  return (
    <button className="start-orb" onClick={onClick} disabled={disabled} aria-label={label}>
      <span className="start-orb-ring" />
      <span className="start-orb-ring ring-2" />
      <span className="start-orb-core">
        <svg viewBox="0 0 100 100" className="start-orb-pattern" aria-hidden="true">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
          <polygon
            points="50,10 61,39 92,39 66,58 76,89 50,70 24,89 34,58 8,39 39,39"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.4"
          />
          <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
        </svg>
        <span className="start-orb-label">
          <span className="start-orb-title">{label}</span>
          {sublabel && <span className="start-orb-sub">{sublabel}</span>}
        </span>
      </span>
    </button>
  )
}

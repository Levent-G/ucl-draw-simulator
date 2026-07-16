import React from 'react'

export default function DerbyBanner({ label, visible, derbyKey }) {
  return (
    <div className={`derby-banner ${visible ? 'show' : ''}`}>
      {label && (
        <span key={derbyKey} className="derby-banner-text">
          🔥 {label} 🔥
        </span>
      )}
    </div>
  )
}

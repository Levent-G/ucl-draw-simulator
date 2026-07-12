import React, { useMemo } from 'react'

const COLORS = ['#5b9dff', '#38bdf8', '#22d3ee', '#2dd4bf', '#e879c9', '#7d8cff']

export default function Confetti({ pieceCount = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.6,
        duration: 2.6 + Math.random() * 1.8,
        rotate: Math.random() * 360,
      })),
    [pieceCount]
  )

  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

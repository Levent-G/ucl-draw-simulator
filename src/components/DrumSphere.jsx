import React from 'react'
import { POT_COLORS } from '../data/teams.js'

const BALL_POSITIONS = [
  { top: '20%', left: '25%', delay: '0s', dur: '2.6s' },
  { top: '55%', left: '15%', delay: '0.4s', dur: '2.1s' },
  { top: '70%', left: '55%', delay: '0.8s', dur: '2.8s' },
  { top: '30%', left: '65%', delay: '0.2s', dur: '2.3s' },
  { top: '45%', left: '45%', delay: '0.6s', dur: '2.5s' },
  { top: '15%', left: '55%', delay: '1s', dur: '2.2s' },
]

// Tam ekran ortalanmış bir "reveal" katmanı: sadece sıradaki takım
// çekilmeden hemen önce beliriyor, toplar karışıyor, top çekiliyor,
// sonra kayboluyor (yerini PaperReveal'e bırakıyor).
export default function DrumSphere({ visible, activePot, pickSignal }) {
  const potColor = POT_COLORS[activePot]?.main || '#5b9dff'

  return (
    <div className={`sphere-reveal-backdrop ${visible ? 'show' : ''}`}>
      <div className="sphere-panel">
        <div className={`drum ${visible ? 'spinning' : ''}`}>
          {BALL_POSITIONS.map((p, i) => (
            <div
              key={i}
              className={`ball ${visible ? 'tumble' : ''}`}
              style={{
                top: p.top,
                left: p.left,
                background: `radial-gradient(circle at 35% 30%, #fff, ${potColor})`,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}

          {pickSignal > 0 && (
            <div
              key={pickSignal}
              className="ejected-ball"
              style={{
                background: `radial-gradient(circle at 35% 30%, #fff, ${potColor})`,
                color: potColor,
              }}
            />
          )}

          <div key={`beam-${pickSignal}`} className={`spotlight-beam ${pickSignal > 0 ? 'on' : ''}`} />
        </div>

        <div className="pot-tag" style={{ borderColor: potColor, color: potColor }}>
          {POT_COLORS[activePot]?.label || ''} karışıyor...
        </div>
      </div>
    </div>
  )
}

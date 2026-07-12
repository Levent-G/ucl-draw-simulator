import React from 'react'
import Crest from './Crest.jsx'

export default function CurrentDrawPanel({ team, revealedOpponents }) {
  if (!team) return null

  return (
    <div className="current-draw-panel">
      <div className="cdp-list">
        {revealedOpponents.map((o, i) => (
          <div key={`${o.team.id}-${i}`} className="cdp-row">
            <span className={`cdp-venue ${o.home ? 'home' : 'away'}`}>{o.home ? 'H' : 'A'}</span>
            <Crest team={o.team} size={38} />
            <span className="cdp-name">{o.team.name}</span>
          </div>
        ))}
      </div>
      <div className="cdp-team-bar">
        <Crest team={team} size={46} />
        <span>{team.name}</span>
      </div>
    </div>
  )
}

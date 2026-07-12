import React from 'react'
import { TEAMS, POT_COLORS } from '../data/teams.js'
import Crest from './Crest.jsx'

export default function FinalResultsGrid({ results }) {
  return (
    <section className="final-grid-section">
      <div className="final-grid-title">
        <h2>Tüm Takımların Lig Fazı Fikstürü</h2>
        <span>36 takım · takım başına 8 maç</span>
      </div>

      <div className="final-grid">
        {TEAMS.map((team) => {
          const fixtures = results[team.id]
          const rows = [1, 2, 3, 4].flatMap((pot) =>
            ['home', 'away'].map((venue) => ({ pot, venue, opp: fixtures[pot][venue] }))
          )
          return (
            <div className="final-card" key={team.id}>
              <div className="final-card-header">
                <Crest team={team} size={30} />
                <span className="final-card-name">{team.name}</span>
                <span className="final-card-pot">{POT_COLORS[team.pot].label}</span>
              </div>
              <div className="final-card-rows">
                {rows.map(({ pot, venue, opp }) => (
                  <div className="final-card-row" key={`${pot}-${venue}`}>
                    <span className={`final-card-venue ${venue}`}>{venue === 'home' ? 'H' : 'A'}</span>
                    {opp ? (
                      <>
                        <Crest team={opp} size={18} />
                        <span className="final-card-opp">{opp.name}</span>
                      </>
                    ) : (
                      <span className="final-card-opp muted">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

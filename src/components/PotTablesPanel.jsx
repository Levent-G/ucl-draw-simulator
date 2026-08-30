import React from 'react'
import PotTable from './PotTable.jsx'

export default function PotTablesPanel({ teams, results, drawnTeamIds, activeTeamId, pendingCells, phase, onStart }) {
  return (
    <div className="pot-tables-panel">
      <div className="draw-table-title">
        <h2>Lig Fazı Kura Tablosu</h2>
        <div className="draw-table-title-right">
          <span className="draw-table-count">{drawnTeamIds.size}/{teams.length} takım çekildi</span>
          {phase === 'done' && (
            <button className="btn btn-ghost btn-small" onClick={onStart}>
              Yeniden Çek
            </button>
          )}
        </div>
      </div>

      <div className="pot-tables-frame">
        <div className="pot-tables-grid">
          {[1, 2, 3, 4].map((pot) => (
            <PotTable
              key={pot}
              pot={pot}
              allTeams={teams}
              results={results}
              drawnTeamIds={drawnTeamIds}
              activeTeamId={activeTeamId}
              pendingCells={pendingCells}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

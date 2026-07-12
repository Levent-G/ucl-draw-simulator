import React from 'react'
import PotTable from './PotTable.jsx'
import StartOrb from './StartOrb.jsx'

export default function PotTablesPanel({ results, drawnTeamIds, activeTeamId, pendingCells, phase, onStart }) {
  const showFullOverlay = phase === 'idle'

  return (
    <div className="pot-tables-panel">
      <div className="draw-table-title">
        <h2>Lig Fazı Kura Tablosu</h2>
        <div className="draw-table-title-right">
          <span className="draw-table-count">{drawnTeamIds.size}/36 takım çekildi</span>
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
              results={results}
              drawnTeamIds={drawnTeamIds}
              activeTeamId={activeTeamId}
              pendingCells={pendingCells}
            />
          ))}
        </div>

        {showFullOverlay && (
          <div className="table-start-overlay">
            <StartOrb onClick={onStart} label="ÇEKİLİŞİ" sublabel="BAŞLAT" />
          </div>
        )}
      </div>
    </div>
  )
}

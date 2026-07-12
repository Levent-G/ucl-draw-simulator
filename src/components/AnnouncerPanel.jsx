import React, { useEffect, useRef } from 'react'

export default function AnnouncerPanel({ logs, live }) {
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [logs.length])

  return (
    <div className="announcer-panel">
      <div className="announcer-title">
        {live && <span className="live-dot" />}
        Kura Çekimi Yayını
      </div>
      <div className="announcer-log" ref={logRef}>
        {[...logs].reverse().map((line, i) => (
          <div
            key={logs.length - i}
            className={`log-line ${i === 0 ? 'highlight' : ''}`}
            dangerouslySetInnerHTML={{ __html: line }}
          />
        ))}
        {logs.length === 0 && (
          <div className="log-line">Kura çekimi başladığında canlı anons burada akacak.</div>
        )}
      </div>
    </div>
  )
}

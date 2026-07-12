import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TEAMS, POT_COLORS, COUNTRY_NAMES } from './data/teams.js'
import { generateFullDraw, buildAnnouncementPlan } from './utils/drawEngine.js'
import { createEmptyResults } from './utils/resultsHelpers.js'
import ControlBar from './components/ControlBar.jsx'
import DrumSphere from './components/DrumSphere.jsx'
import AnnouncerPanel from './components/AnnouncerPanel.jsx'
import PotTablesPanel from './components/PotTablesPanel.jsx'
import FinalResultsGrid from './components/FinalResultsGrid.jsx'
import PaperReveal from './components/PaperReveal.jsx'
import CurrentDrawPanel from './components/CurrentDrawPanel.jsx'
import Confetti from './components/Confetti.jsx'

// mix: sıradaki takım çekilmeden önce topların karışma süresi
// eject: topun küreden fırlayıp ekrana gelme süresi
// paper: kağıdın ekranda açık kalma süresi
// reveal: sol alttaki panelde rakiplerin tık tık görünme aralığı (faz 1)
// fill: tablo hücrelerinin tık tık dolma aralığı (faz 2)
// phaseGap: faz 1 bitip faz 2 başlarken aradaki kısa duraklama
const SPEED_DELAYS = {
  slow: { mix: 3200, eject: 950, paper: 2800, reveal: 780, fill: 680, phaseGap: 500 },
  normal: { mix: 2400, eject: 880, paper: 2300, reveal: 620, fill: 540, phaseGap: 420 },
  fast: { mix: 1500, eject: 720, paper: 1500, reveal: 380, fill: 340, phaseGap: 260 },
}

function buildEvents(plan) {
  const events = []
  for (const group of plan) {
    events.push({ type: 'pick', team: group.team, opponents: group.opponents })
    // Faz 1: rakipler önce sol alttaki panelde tık tık belirir, tabloda
    // ilgili yerler "yükleniyor" barına döner.
    for (const opp of group.opponents) {
      events.push({ type: 'reveal', team: group.team, opp })
    }
    // Faz 2: panel tamamlanınca, tablo hücreleri tık tık gerçek veriyle dolar.
    for (const opp of group.opponents) {
      events.push({ type: 'fill', team: group.team, opp })
    }
  }
  events.push({ type: 'complete' })
  return events
}

function applyMatchToResults(results, team, opp) {
  const next = { ...results }
  const teamFixtures = { ...next[team.id] }
  teamFixtures[opp.viaPot] = {
    ...teamFixtures[opp.viaPot],
    [opp.home ? 'home' : 'away']: opp.team,
  }
  next[team.id] = teamFixtures

  const oppFixtures = { ...next[opp.team.id] }
  oppFixtures[team.pot] = {
    ...oppFixtures[team.pot],
    [opp.home ? 'away' : 'home']: team,
  }
  next[opp.team.id] = oppFixtures

  return next
}

function cellKeysFor(team, opp) {
  const teamKey = `${team.id}:${opp.viaPot}:${opp.home ? 'home' : 'away'}`
  const oppKey = `${opp.team.id}:${team.pot}:${opp.home ? 'away' : 'home'}`
  return { teamKey, oppKey }
}

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | drawing | done
  const [speed, setSpeed] = useState('normal')
  const [results, setResults] = useState(createEmptyResults())
  const [drawnTeamIds, setDrawnTeamIds] = useState(new Set())
  const [activeTeamId, setActiveTeamId] = useState(null)
  const [activePot, setActivePot] = useState(1)
  const [currentTeamOpponents, setCurrentTeamOpponents] = useState([])
  const [pendingCells, setPendingCells] = useState(new Set())
  const [logs, setLogs] = useState([])
  const [pickSignal, setPickSignal] = useState(0)
  const [sphereVisible, setSphereVisible] = useState(false)
  const [revealTeam, setRevealTeam] = useState(null)
  const [revealKey, setRevealKey] = useState(0)
  const [paperVisible, setPaperVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [uclLogoFailed, setUclLogoFailed] = useState(false)

  const eventsRef = useRef([])
  const timeoutRef = useRef(null)
  const speedRef = useRef(speed)
  const tableSectionRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const activeTeam = useMemo(
    () => TEAMS.find((t) => t.id === activeTeamId) || null,
    [activeTeamId]
  )

  const resetAll = useCallback(() => {
    clearTimeout(timeoutRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPhase('idle')
    setResults(createEmptyResults())
    setDrawnTeamIds(new Set())
    setActiveTeamId(null)
    setCurrentTeamOpponents([])
    setPendingCells(new Set())
    setLogs([])
    setPickSignal(0)
    setSphereVisible(false)
    setRevealTeam(null)
    setPaperVisible(false)
    setShowConfetti(false)
    setProgress(0)
    setError(null)
  }, [])

  const processEvent = useCallback((idx) => {
    const events = eventsRef.current
    if (idx >= events.length) return
    const ev = events[idx]
    const delays = SPEED_DELAYS[speedRef.current]

    if (ev.type === 'pick') {
      // 1) Toplar sadece şimdi, sıradaki takım çekilmeden hemen önce ortaya
      // çıkıp karışmaya başlar.
      setActivePot(ev.team.pot)
      setSphereVisible(true)

      timeoutRef.current = setTimeout(() => {
        // 2) Top küreden fırlayıp ekrana geliyor (eject animasyonu).
        setPickSignal((s) => s + 1)

        timeoutRef.current = setTimeout(() => {
          // 3) Top ekranda "açılıyor" (flaş efekti), kağıt açılma efektiyle
          // takım adı beliriyor. Küre kayboluyor.
          setSphereVisible(false)
          setCurrentTeamOpponents([])
          setActiveTeamId(ev.team.id)
          setDrawnTeamIds((prev) => new Set(prev).add(ev.team.id))
          setLogs((prev) => [
            ...prev,
            `<b>${POT_COLORS[ev.team.pot].label}</b> — kutudan çıkan takım: <b>${ev.team.name}</b> (${COUNTRY_NAMES[ev.team.country]})`,
          ])
          setRevealTeam(ev.team)
          setRevealKey((k) => k + 1)
          setPaperVisible(true)

          // Takım belli olur olmaz, bu takımın 8 maçına ait TÜM hücreler
          // (kendi tarafı + rakiplerin ayna hücreleri) aynı anda "yükleniyor"
          // durumuna geçer -- panelde henüz hiçbiri görünmese bile.
          const allKeys = new Set()
          for (const opp of ev.opponents) {
            const { teamKey, oppKey } = cellKeysFor(ev.team, opp)
            allKeys.add(teamKey)
            allKeys.add(oppKey)
          }
          setPendingCells(allKeys)

          timeoutRef.current = setTimeout(() => {
            setPaperVisible(false)
            timeoutRef.current = setTimeout(() => processEvent(idx + 1), 250)
          }, delays.paper)
        }, delays.eject)
      }, delays.mix)

      setProgress((idx + 1) / events.length)
      return
    }

    if (ev.type === 'reveal') {
      // Faz 1: rakip sol alttaki panelde görünür. Tablodaki ilgili hücreler
      // zaten 'pick' anında topluca "yükleniyor" durumuna geçmişti.
      setCurrentTeamOpponents((prev) => [...prev, ev.opp])
      const venue = ev.opp.home ? 'İç sahada' : 'Deplasmanda'
      setLogs((prev) => [
        ...prev,
        `${ev.team.name}, ${POT_COLORS[ev.opp.viaPot].label} takımı <b>${ev.opp.team.name}</b> ile eşleşti — ${venue.toLowerCase()} oynayacak.`,
      ])

      setProgress((idx + 1) / events.length)
      const nextIsFill = events[idx + 1]?.type === 'fill'
      const delay = nextIsFill ? delays.phaseGap : delays.reveal
      timeoutRef.current = setTimeout(() => processEvent(idx + 1), delay)
      return
    }

    if (ev.type === 'fill') {
      // Faz 2: panel tamamlandıktan sonra, tablo hücreleri tık tık gerçek
      // veriyle dolar (yükleniyor barı kalkar).
      const { teamKey, oppKey } = cellKeysFor(ev.team, ev.opp)
      setResults((prev) => applyMatchToResults(prev, ev.team, ev.opp))
      setPendingCells((prev) => {
        const next = new Set(prev)
        next.delete(teamKey)
        next.delete(oppKey)
        return next
      })

      setProgress((idx + 1) / events.length)
      timeoutRef.current = setTimeout(() => processEvent(idx + 1), delays.fill)
      return
    }

    if (ev.type === 'complete') {
      setPhase('done')
      setActiveTeamId(null)
      setSphereVisible(false)
      setRevealTeam(null)
      setPaperVisible(false)
      if (audioRef.current) audioRef.current.pause()
      setLogs((prev) => [...prev, `<b>Kura çekimi tamamlandı.</b> Tüm 36 takımın lig fazı fikstürü belli oldu.`])
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4200)
      setProgress(1)
    }
  }, [])

  const handleStart = useCallback(() => {
    resetAll()
    try {
      const matches = generateFullDraw(TEAMS)
      const plan = buildAnnouncementPlan(TEAMS, matches)
      eventsRef.current = buildEvents(plan)
      setPhase('drawing')
      setLogs(['Kura çekimi başlıyor...'])
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {
          // Ses dosyası eklenmemiş olabilir; sessizce yok say.
        })
      }
      timeoutRef.current = setTimeout(() => processEvent(0), 300)
      if (tableSectionRef.current) {
        tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch (e) {
      setError(e.message)
    }
  }, [processEvent, resetAll])

  const handleSkip = useCallback(() => {
    clearTimeout(timeoutRef.current)
    if (audioRef.current) audioRef.current.pause()
    const events = eventsRef.current
    let liveResults = createEmptyResults()
    const liveDrawn = new Set()
    const liveLogs = []
    for (const ev of events) {
      if (ev.type === 'pick') {
        liveDrawn.add(ev.team.id)
        liveLogs.push(`<b>${POT_COLORS[ev.team.pot].label}</b> — kutudan çıkan takım: <b>${ev.team.name}</b>`)
      } else if (ev.type === 'fill') {
        liveResults = applyMatchToResults(liveResults, ev.team, ev.opp)
      }
    }
    liveLogs.push('<b>Kura çekimi tamamlandı.</b> Tüm 36 takımın lig fazı fikstürü belli oldu.')
    setResults(liveResults)
    setDrawnTeamIds(liveDrawn)
    setLogs(liveLogs)
    setActiveTeamId(null)
    setSphereVisible(false)
    setCurrentTeamOpponents([])
    setPendingCells(new Set())
    setRevealTeam(null)
    setPaperVisible(false)
    setProgress(1)
    setPhase('done')
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 4200)
  }, [])

  const isTumbling = phase === 'drawing'

  return (
    <div className="app-shell">
      {showConfetti && <Confetti />}
      <audio ref={audioRef} src="/audio/anthem.mp3" loop preload="none" />
      <DrumSphere visible={sphereVisible} activePot={activePot} pickSignal={pickSignal} />
      <PaperReveal team={revealTeam} visible={paperVisible} revealKey={revealKey} />
      <CurrentDrawPanel team={phase === 'drawing' ? activeTeam : null} revealedOpponents={currentTeamOpponents} />

      <header className="top-header">
        <div className="brand-row">
          {!uclLogoFailed && (
            <img
              src="/logos/ucl-logo.png"
              alt="UCL logosu"
              className="ucl-logo-img"
              onError={() => setUclLogoFailed(true)}
            />
          )}
          <div>
            <div className="brand-eyebrow">İsviçre Modeli · Lig Fazı</div>
            <h1 className="brand-title">UCL Kura Çekimi Simülatörü</h1>
            <p className="brand-sub">
              36 takım, 4 torba, takım başına 8 maç. Gerçek UEFA lig fazı kurallarına
              (federasyon kısıtı, torba başına ev/deplasman dengesi) sadık bir algoritma
              ile gerçek zamanlı simülasyon.
            </p>
          </div>
        </div>
        <div className="season-badge">36 TAKIM · 4 TORBA · 8 MAÇ</div>
      </header>

      <ControlBar
        phase={phase}
        speed={speed}
        onSpeedChange={setSpeed}
        onReset={resetAll}
        onSkip={handleSkip}
        progress={progress}
      />

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div className="main-layout" ref={tableSectionRef}>
        <div className="main-left">
          <PotTablesPanel
            results={results}
            drawnTeamIds={drawnTeamIds}
            activeTeamId={activeTeamId}
            pendingCells={pendingCells}
            phase={phase}
            onStart={handleStart}
          />
        </div>

        <div className="main-right">
          <AnnouncerPanel logs={logs} live={isTumbling} />
        </div>
      </div>

      {phase === 'done' && <FinalResultsGrid results={results} />}

      {phase === 'idle' && (
        <p className="footnote">
          Kurallar: her takım, kendi torbası dahil 4 torbanın her birinden 2'şer rakip
          çeker (toplam 8 maç); bir torbadan çekilen 2 rakipten biri iç sahada, diğeri
          deplasmanda oynanır. Bir takım kendi federasyonundan bir takımla asla
          eşleşmez ve aynı federasyondan en fazla 2 farklı rakiple karşılaşabilir.
          Takım amblemleri ve başlat düğmesi, gerçek kulüp logoları ve resmi UEFA
          amblemi yerine kullanılan özgün tasarımlardır.
        </p>
      )}
    </div>
  )
}

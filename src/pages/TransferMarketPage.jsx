import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { COMPETITION_LIST, getCompetition } from "../data/competitions.js";
import { useTransferMarket } from "../state/TransferContext.jsx";
import { generateTransferHeadline } from "../utils/transferNews.js";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import Crest from "../components/Crest.jsx";

const TICKER_INTERVAL_MS = 1500;
const AUTO_STOP_COUNT = 16;
const MAX_HEADLINES = 40;

function TransferTeamCard({ team, players, query, draggingPlayerId, onDragStartPlayer, onDragEndPlayer, onDropPlayer }) {
  const [dragOver, setDragOver] = useState(false);

  const q = query.trim().toLowerCase();
  const visiblePlayers = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;
  if (q && visiblePlayers.length === 0) return null;

  return (
    <div
      className={`transfer-team-card ${dragOver ? "drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const playerId = e.dataTransfer.getData("text/player-id");
        if (playerId) onDropPlayer(playerId, team.id);
      }}
    >
      <div className="transfer-team-card-header">
        <Crest team={team} size={24} />
        <span className="transfer-team-card-name">{team.name}</span>
        <span className="transfer-team-card-count">{players.length}</span>
      </div>
      <div className="transfer-roster-scroll">
        <table className="transfer-roster-table">
          <thead>
            <tr>
              <th>Oyuncu</th>
              <th>Mvk</th>
              <th>Güç</th>
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.map((p) => (
              <tr
                key={p.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/player-id", p.id);
                  e.dataTransfer.effectAllowed = "move";
                  onDragStartPlayer(p.id);
                }}
                onDragEnd={onDragEndPlayer}
                className={`transfer-roster-row ${draggingPlayerId === p.id ? "is-dragging" : ""} ${
                  p.transferred ? "is-transferred" : ""
                }`}
                title="Başka bir takıma sürükleyerek transfer edebilirsin"
              >
                <td className="transfer-roster-name-cell">
                  <PlayerAvatar player={p} size={22} />
                  <span>{p.name}</span>
                </td>
                <td className="transfer-roster-pos">{p.position}</td>
                <td className="transfer-roster-rating">{p.rating}</td>
              </tr>
            ))}
            {visiblePlayers.length === 0 && (
              <tr>
                <td colSpan={3} className="transfer-roster-empty">
                  Kadroda oyuncu yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TransferMarketPage() {
  const [poolKey, setPoolKey] = useState(COMPETITION_LIST[0].key);
  const competition = getCompetition(poolKey);
  const { effectiveAllPlayers, getEffectivePlayersByTeam, transfers, hasTransfers, transferPlayer, undoTransfer, resetTransfers } =
    useTransferMarket(poolKey);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const intervalRef = useRef(null);
  const countRef = useRef(0);

  const [query, setQuery] = useState("");
  const [draggingPlayerId, setDraggingPlayerId] = useState(null);
  const [justTransferred, setJustTransferred] = useState(null);

  // Bir oyuncuyu sürüklerken imleç ekranın üst/alt kenarına yaklaşınca
  // sayfayı otomatik kaydır -- native HTML5 drag&drop bunu kendiliğinden
  // yapmaz, kadro panosu uzun olduğu için elle eklemek gerekiyor.
  useEffect(() => {
    if (!draggingPlayerId) return undefined;
    const EDGE = 90;
    const SPEED = 22;
    function handleDragOver(e) {
      const y = e.clientY;
      if (y < EDGE) {
        window.scrollBy(0, -SPEED);
      } else if (y > window.innerHeight - EDGE) {
        window.scrollBy(0, SPEED);
      }
    }
    window.addEventListener("dragover", handleDragOver);
    return () => window.removeEventListener("dragover", handleDragOver);
  }, [draggingPlayerId]);

  const stopInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const pushHeadline = useCallback(() => {
    const headline = generateTransferHeadline(competition.getAllPlayers(), competition.teams);
    if (!headline) return;
    setHeadlines((prev) => [headline, ...prev].slice(0, MAX_HEADLINES));
  }, [competition]);

  const tick = useCallback(() => {
    countRef.current += 1;
    pushHeadline();
    if (countRef.current >= AUTO_STOP_COUNT) {
      stopInterval();
      setCompleted(true);
    }
  }, [pushHeadline, stopInterval]);

  useEffect(() => {
    setRunning(false);
    setPaused(false);
    setCompleted(false);
    setHeadlines([]);
    setQuery("");
    stopInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey]);

  useEffect(() => stopInterval, [stopInterval]);

  const handleStart = () => {
    setHeadlines([]);
    setRunning(true);
    setPaused(false);
    setCompleted(false);
    countRef.current = 0;
    tick();
    intervalRef.current = setInterval(tick, TICKER_INTERVAL_MS);
  };

  const handleTogglePause = () => {
    if (paused) {
      setPaused(false);
      intervalRef.current = setInterval(tick, TICKER_INTERVAL_MS);
    } else {
      setPaused(true);
      stopInterval();
    }
  };

  const handleFinish = () => {
    stopInterval();
    setRunning(false);
    setPaused(false);
    setCompleted(false);
  };

  // ---- Sürükle-bırak transfer ----
  const handleDropPlayer = (playerId, destTeamId) => {
    const player = effectiveAllPlayers.find((p) => p.id === playerId);
    if (!player || player.teamId === destTeamId) return; // aynı takıma bırakılırsa yok say
    transferPlayer(playerId, destTeamId);
    setJustTransferred(playerId);
    window.setTimeout(() => setJustTransferred((id) => (id === playerId ? null : id)), 1400);
  };

  const rosterByTeam = useMemo(() => {
    const map = {};
    for (const t of competition.teams) map[t.id] = getEffectivePlayersByTeam(t.id);
    return map;
  }, [competition, getEffectivePlayersByTeam]);

  return (
    <div className="page-shell">
      {running && (
        <div className="transfer-ticker-overlay">
          <div className="transfer-ticker-panel">
            <div className="transfer-ticker-head">
              {completed ? (
                <span className="transfer-ticker-live transfer-ticker-done">✅ TAMAMLANDI</span>
              ) : (
                <span className="transfer-ticker-live">
                  <span className="transfer-ticker-dot" /> CANLI
                </span>
              )}
              <span className="transfer-ticker-head-title">
                {completed ? "Transfer dönemi kapandı" : `Transfer Haberleri — ${competition.name}`}
              </span>
              <div className="transfer-ticker-head-actions">
                {!completed && (
                  <button className="btn-secondary" onClick={handleTogglePause}>
                    {paused ? "Devam Et" : "Duraklat"}
                  </button>
                )}
                <button className="btn-primary" onClick={handleFinish}>
                  Bitir
                </button>
              </div>
            </div>
            <div className="transfer-ticker-feed">
              {headlines.length === 0 && <div className="transfer-ticker-empty">Haberler geliyor…</div>}
              {headlines.map((h, i) => (
                <div key={h.id} className={`transfer-ticker-card ${i === 0 ? "is-newest" : ""}`}>
                  <Crest team={h.toTeam} size={28} />
                  <div className="transfer-ticker-text">{h.text}</div>
                </div>
              ))}
            </div>
            {completed && (
              <div className="transfer-ticker-foot">
                Transfer dönemi tamamlandı. Şimdi aşağıdaki kadro panosundan
                oyuncuları sürükleyerek kendi transferlerini yapabilirsin.
              </div>
            )}
          </div>
        </div>
      )}

      <header className="page-header">
        <div>
          <div className="page-eyebrow">Kadro Kurma</div>
          <h1>Transfer Merkezi</h1>
          <p>
            Bir yarışma seç, transfer sürecini başlatıp canlı haber akışını
            izle. Sonra aşağıdaki kadro panosunda bir oyuncuyu, bırakmak
            istediğin takımın kartının üzerine <b>sürükleyerek</b> transfer et.
            Kurduğun kadroyla <b>{competition.name}</b> simülasyonunu
            başlatabilirsin.
          </p>
        </div>
      </header>

      <div className="pool-tabs">
        {COMPETITION_LIST.map((c) => (
          <button key={c.key} className={poolKey === c.key ? "active" : ""} onClick={() => setPoolKey(c.key)}>
            {c.shortName}
          </button>
        ))}
      </div>

      <div className="transfer-actions-row">
        {!running && (
          <button className="btn-primary league-start-btn" onClick={handleStart}>
            <span className="league-start-btn-shine" aria-hidden="true" />
            <span className="league-start-btn-icon" aria-hidden="true">
              📰
            </span>
            Transfer Sürecini Başlat
          </button>
        )}
        <Link to={`/${poolKey}`} className="btn-secondary">
          {competition.shortName} Simülasyonuna Git →
        </Link>
        {hasTransfers && (
          <button className="btn-ghost" onClick={resetTransfers}>
            Tüm Transferleri Sıfırla ({transfers.length})
          </button>
        )}
        <input
          type="text"
          className="prediction-search transfer-board-search"
          placeholder="Kadro panosunda oyuncu ara…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {hasTransfers && (
        <div className="chart-card transfer-history-card">
          <h3>Yapılan Transferler ({transfers.length})</h3>
          <div className="transfer-history-list">
            {transfers.map((t) => (
              <div key={t.playerId} className="transfer-history-item">
                <PlayerAvatar player={t.player} size={26} />
                <span className="transfer-history-name">{t.player.name}</span>
                <span className="transfer-history-arrow">
                  <Crest team={t.fromTeam} size={16} />
                  <span>→</span>
                  <Crest team={t.toTeam} size={16} />
                </span>
                <button className="btn-ghost transfer-undo" onClick={() => undoTransfer(t.playerId)}>
                  Geri Al
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="transfer-board-hint">
        🖐️ Bir oyuncu satırını tutup başka bir takımın kartına bırak — transfer
        anında uygulanır. {justTransferred && <span className="transfer-board-hint-flash">Transfer uygulandı!</span>}
      </div>

      <div className="transfer-board">
        {competition.teams.map((team) => (
          <TransferTeamCard
            key={team.id}
            team={team}
            players={rosterByTeam[team.id] || []}
            query={query}
            draggingPlayerId={draggingPlayerId}
            onDragStartPlayer={setDraggingPlayerId}
            onDragEndPlayer={() => setDraggingPlayerId(null)}
            onDropPlayer={handleDropPlayer}
          />
        ))}
      </div>

      <p className="footnote">
        Transfer haberleri kurgusaldır (gerçek transfer verisi değildir),
        sadece atmosfer amaçlıdır ve kadroyu otomatik değiştirmez. Kadronu
        gerçekten değiştirmek için oyuncuyu bir takım kartından diğerine
        sürükle bırak yapman gerekir — onayladığın transferler o yarışmanın
        kura/fikstür/tahmin simülasyonuna yansır.
      </p>
    </div>
  );
}

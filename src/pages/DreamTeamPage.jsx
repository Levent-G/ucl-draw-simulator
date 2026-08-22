import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { useDreamTeam, FORMATIONS, ZONES, zoneForY } from "../state/DreamTeamContext.jsx";
import { useTeamInjection } from "../state/TeamInjectionContext.jsx";
import { useTacticsContext } from "../state/TacticsContext.jsx";
import { useAchievements } from "../state/AchievementsContext.jsx";
import { COMPETITION_LIST } from "../data/competitions.js";
import { findPlayerByGlobalId } from "../utils/crossCompetitionPlayers.js";
import PlayerPickerModal from "../components/dreamteam/PlayerPickerModal.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import Crest from "../components/Crest.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";
import { TACTICS } from "../utils/predictionEngine.js";
import { encodeShareData, decodeShareData, copyToClipboard } from "../utils/shareLink.js";

const DREAM_TEAM_ID = "dream-team";
const SQUAD_SIZE = 11;

const TABS = [
  { key: "squad", label: "Kadro Kur" },
  { key: "compare", label: "Karşılaştır" },
];

function PitchSlot({ slot, coords, player, isDragging, onPick, onClear, onDragStart, onDragEnd, onTouchStart }) {
  const zone = zoneForY(coords.y);
  const style = { left: `${coords.x}%`, top: `${coords.y}%` };

  return (
    <div className={`pitch-slot ${isDragging ? "is-dragging" : ""}`} style={style}>
      {player ? (
        <button
          className="pitch-slot-filled"
          draggable
          onDragStart={(e) => onDragStart(e, slot.id)}
          onDragEnd={onDragEnd}
          onTouchStart={() => onTouchStart(slot.id)}
          onClick={() => onPick(slot)}
          title="Sahada taşımak için sürükle, değiştirmek için tıkla"
        >
          <PlayerAvatar player={player} size={40} />
          <span className="pitch-slot-name">{player.name}</span>
          <span className="pitch-slot-meta">
            {player.team && <Crest team={player.team} size={14} />}
            {player.rating}
          </span>
          <span className="pitch-slot-zone-tag">{zone.short}</span>
          <span
            className="pitch-slot-remove"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onClear(slot.id);
            }}
          >
            ✕
          </span>
        </button>
      ) : (
        <button className="pitch-slot-empty" onClick={() => onPick(slot)}>
          <span className="pitch-slot-plus">+</span>
          <span className="pitch-slot-pos">{slot.position}</span>
        </button>
      )}
    </div>
  );
}

// Rüya Takım kadrosunu, seçilen yarışmadaki rastgele bir takımın yerine
// koyup, o yarışmanın normal kura/sezon sayfasına yönlendirir. Enjeksiyon
// bir kez yapıldıktan sonra kalıcıdır (bu sekmeden ayrılınca sıfırlanmaz) --
// kullanıcı istediği zaman "Geri Çek" ile eski takımı iade edebilir.
function SendToCompetition({ filledPlayers, isFull }) {
  const navigate = useNavigate();
  const { injections, sendDreamTeam, clearInjection } = useTeamInjection();
  const { setTeamTactic } = useTacticsContext();
  const [selectedTactic, setSelectedTactic] = useState("balanced");

  const handleSend = (compKey) => {
    if (!isFull) return;
    const avgRating = Math.round(
      filledPlayers.reduce((s, p) => s + p.rating, 0) / filledPlayers.length
    );
    const team = {
      id: DREAM_TEAM_ID,
      name: "Rüya Takım",
      short: "DRM",
      country: "DREAM",
      coeff: Math.round(avgRating * 1.35 * 10) / 10,
    };
    const players = filledPlayers.map((p, i) => ({
      id: `dream-p${i}`,
      name: p.name,
      position: p.position,
      nationality: p.nationality,
      rating: p.rating,
      teamId: team.id,
    }));
    sendDreamTeam(compKey, team, players);
    setTeamTactic(compKey, DREAM_TEAM_ID, selectedTactic);
    navigate(`/${compKey}`);
  };

  return (
    <div className="dreamteam-send">
      <div className="dreamteam-send-head">
        <span className="dreamteam-send-title">Kadroyu Bir Yarışmaya Gönder</span>
        {!isFull && (
          <span className="dreamteam-send-hint">
            Gönderebilmek için önce kadroyu tamamlamalısın (11/11).
          </span>
        )}
      </div>

      <div className="dreamteam-tactic-picker">
        <span className="dreamteam-tactic-label">Oyun tarzı:</span>
        {Object.values(TACTICS).map((t) => (
          <button
            key={t.key}
            type="button"
            className={selectedTactic === t.key ? "active" : ""}
            onClick={() => setSelectedTactic(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="dreamteam-send-buttons">
        {COMPETITION_LIST.map((c) => {
          const injection = injections[c.key];
          const isSent = injection?.team?.id === DREAM_TEAM_ID;
          return (
            <div className="dreamteam-send-item" key={c.key}>
              <button
                className="btn-secondary"
                disabled={!isFull}
                onClick={() => handleSend(c.key)}
              >
                {c.shortName}'e Gönder
              </button>
              {isSent && (
                <span className="dreamteam-send-status">
                  {injection.removedTeam.name} yerine gönderildi
                  <button className="btn-ghost" onClick={() => clearInjection(c.key)}>
                    Geri Çek
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SquadBuilder() {
  const {
    formation,
    formationSlots,
    setFormation,
    squad,
    setSlotPlayer,
    clearSlot,
    clearSquad,
    loadSquad,
    customPositions,
    setSlotCoords,
    resetPositions,
  } = useDreamTeam();
  const [pickerSlot, setPickerSlot] = useState(null);
  const [draggingSlotId, setDraggingSlotId] = useState(null);
  const [hoverY, setHoverY] = useState(null);
  const [shareStatus, setShareStatus] = useState("idle");
  const pitchRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Paylaşılan bir link (?d=...) ile açıldıysa kadroyu bir kerede yükler,
  // sonra parametreyi URL'den temizler (böylece sonraki değişiklikler eski
  // linke geri sarmaz).
  useEffect(() => {
    const shared = searchParams.get("d");
    if (!shared) return;
    const data = decodeShareData(shared);
    if (data?.formation && data?.squad) {
      loadSquad(data.formation, data.squad);
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/ruya-takim?d=${encodeShareData({ formation, squad })}`;
    const copied = await copyToClipboard(url);
    setShareStatus(copied ? "copied" : "manual");
    window.setTimeout(() => setShareStatus("idle"), 3000);
    if (!copied) window.prompt("Linki kopyala:", url);
  };

  const coordsOf = useCallback(
    (slot) => customPositions[slot.id] || { x: slot.x, y: slot.y },
    [customPositions]
  );

  const handleDragStart = useCallback((e, slotId) => {
    e.dataTransfer.setData("text/plain", slotId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingSlotId(slotId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingSlotId(null);
    setHoverY(null);
  }, []);

  const handlePitchDragOver = useCallback(
    (e) => {
      if (!draggingSlotId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = pitchRef.current.getBoundingClientRect();
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setHoverY(Math.max(0, Math.min(100, y)));
    },
    [draggingSlotId]
  );

  const handlePitchDrop = useCallback(
    (e) => {
      e.preventDefault();
      const slotId = e.dataTransfer.getData("text/plain") || draggingSlotId;
      if (!slotId || !pitchRef.current) return;
      const rect = pitchRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSlotCoords(slotId, x, y);
      setDraggingSlotId(null);
      setHoverY(null);
    },
    [draggingSlotId, setSlotCoords]
  );

  // Dokunmatik cihazlarda native HTML5 DnD (draggable/dataTransfer) touch
  // olaylarında tetiklenmediği için aynı "sahada serbest taşıma" deneyimini
  // touchstart/touchmove/touchend ile tekrarlıyoruz -- .pitch-slot-filled ve
  // .pitch için CSS'te touch-action:none olduğundan parmak sürüklerken sayfa
  // kaymaz.
  const handleTouchStart = useCallback((slotId) => {
    setDraggingSlotId(slotId);
  }, []);

  const handlePitchTouchMove = useCallback(
    (e) => {
      if (!draggingSlotId || !pitchRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = pitchRef.current.getBoundingClientRect();
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setHoverY(Math.max(0, Math.min(100, y)));
    },
    [draggingSlotId]
  );

  const handlePitchTouchEnd = useCallback(
    (e) => {
      if (!draggingSlotId || !pitchRef.current) return;
      const touch = e.changedTouches[0];
      if (touch) {
        const rect = pitchRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        setSlotCoords(draggingSlotId, x, y);
      }
      setDraggingSlotId(null);
      setHoverY(null);
    },
    [draggingSlotId, setSlotCoords]
  );

  const hasCustomPositions = Object.keys(customPositions).length > 0;

  const filledPlayers = useMemo(
    () =>
      Object.values(squad)
        .map((gid) => findPlayerByGlobalId(gid))
        .filter(Boolean),
    [squad]
  );
  const filledCount = filledPlayers.length;
  const { unlock } = useAchievements();
  useEffect(() => {
    if (filledCount === SQUAD_SIZE) unlock("kadro-ustasi");
  }, [filledCount, unlock]);
  const avgRating = filledCount
    ? Math.round(filledPlayers.reduce((s, p) => s + p.rating, 0) / filledCount)
    : 0;
  const avgAge = filledCount
    ? (filledPlayers.reduce((s, p) => s + p.age, 0) / filledCount).toFixed(1)
    : "–";
  const competitionsUsed = useMemo(
    () => [...new Set(filledPlayers.map((p) => p.competitionName))],
    [filledPlayers]
  );

  // Zaten kadroda olan bir oyuncu, başka bir slot için seçilirken tekrar
  // listede çıkmasın diye tüm mevcut seçimleri dışarıda tutuyoruz.
  const excludeGlobalIds = useMemo(() => Object.values(squad), [squad]);

  return (
    <>
      <div className="dreamteam-toolbar">
        <div className="dreamteam-summary">
          <span>
            <b>{filledCount}</b>/11 oyuncu
          </span>
          <span>
            Ort. Güç: <b>{avgRating || "–"}</b>
          </span>
          <span>
            Ort. Yaş: <b>{avgAge}</b>
          </span>
          <span>{competitionsUsed.length > 0 ? competitionsUsed.join(" · ") : "Henüz kadro boş"}</span>
        </div>
        {filledCount > 0 && (
          <>
            <button className="btn-secondary" onClick={handleShare}>
              {shareStatus === "copied" ? "✅ Link Kopyalandı!" : "🔗 Kadromu Paylaş"}
            </button>
            <button className="btn-ghost" onClick={clearSquad}>
              Kadroyu Temizle
            </button>
          </>
        )}
      </div>

      <div className="dreamteam-formation-picker">
        <span className="dreamteam-tactic-label">Diziliş:</span>
        {Object.entries(FORMATIONS).map(([key, f]) => (
          <button
            key={key}
            type="button"
            className={formation === key ? "active" : ""}
            onClick={() => setFormation(key)}
          >
            {f.label}
          </button>
        ))}
        {hasCustomPositions && (
          <button type="button" className="dreamteam-reset-positions-btn" onClick={resetPositions}>
            ↺ Sahadaki Konumları Sıfırla
          </button>
        )}
      </div>

      <SendToCompetition filledPlayers={filledPlayers} isFull={filledCount === SQUAD_SIZE} />

      <p className="pitch-drag-hint">
        🖐️ Kadrodaki bir oyuncuyu tutup sahanın istediğin noktasına sürükle —
        hangi banda bıraktığını (Kaleci/Defans/Orta Saha/Forvet) anında görürsün.
      </p>

      <div
        className={`pitch ${draggingSlotId ? "is-dragging-player" : ""}`}
        ref={pitchRef}
        onDragOver={handlePitchDragOver}
        onDrop={handlePitchDrop}
        onTouchMove={handlePitchTouchMove}
        onTouchEnd={handlePitchTouchEnd}
      >
        <div className="pitch-lines" aria-hidden="true">
          <span className="pitch-center-circle" />
          <span className="pitch-center-line" />
        </div>

        {draggingSlotId && (
          <div className="pitch-zone-overlay" aria-hidden="true">
            {ZONES.map((z) => {
              const active = hoverY != null && hoverY >= z.yMin && hoverY < z.yMax;
              return (
                <div
                  key={z.key}
                  className={`pitch-zone-band ${active ? "active" : ""}`}
                  style={{ top: `${z.yMin}%`, height: `${Math.min(z.yMax, 100) - z.yMin}%` }}
                >
                  <span className="pitch-zone-band-label">{z.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {formationSlots.map((slot) => (
          <PitchSlot
            key={slot.id}
            slot={slot}
            coords={coordsOf(slot)}
            isDragging={draggingSlotId === slot.id}
            player={squad[slot.id] ? findPlayerByGlobalId(squad[slot.id]) : null}
            onPick={setPickerSlot}
            onClear={clearSlot}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
          />
        ))}
      </div>

      {pickerSlot && (
        <PlayerPickerModal
          position={pickerSlot.position}
          excludeGlobalIds={excludeGlobalIds}
          onClose={() => setPickerSlot(null)}
          onSelect={(p) => {
            setSlotPlayer(pickerSlot.id, p.globalId);
            setPickerSlot(null);
          }}
        />
      )}
    </>
  );
}

function ComparePicker({ label, player, excludeGlobalIds, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="compare-picker-card">
      {player ? (
        <button className="compare-picker-filled" onClick={() => setOpen(true)}>
          <PlayerAvatar player={player} size={56} />
          <div className="compare-picker-name">{player.name}</div>
          <div className="compare-picker-meta">
            {player.teamName} · {player.competitionName}
          </div>
        </button>
      ) : (
        <button className="compare-picker-empty" onClick={() => setOpen(true)}>
          <span className="pitch-slot-plus">+</span>
          <span>{label}</span>
        </button>
      )}
      {open && (
        <PlayerPickerModal
          excludeGlobalIds={excludeGlobalIds}
          onClose={() => setOpen(false)}
          onSelect={(p) => {
            onPick(p);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

// 0-99'a normalize ederek radar ekseninde gösterilebilir hale getirir.
function normalize(value, min, max) {
  return Math.round(Math.max(0, Math.min(99, ((value - min) / (max - min)) * 99)));
}

function ComparePanel() {
  const { compareA, compareB, setCompareA, setCompareB } = useDreamTeam();
  const { unlock } = useAchievements();

  useEffect(() => {
    if (compareA && compareB) unlock("karsilastirma-uzmani");
  }, [compareA, compareB, unlock]);

  const radarData = useMemo(() => {
    if (!compareA && !compareB) return [];
    return [
      { axis: "Güç Puanı", A: compareA?.rating ?? 0, B: compareB?.rating ?? 0 },
      {
        axis: "Boy",
        A: compareA ? normalize(compareA.height, 165, 202) : 0,
        B: compareB ? normalize(compareB.height, 165, 202) : 0,
      },
      {
        axis: "Fizik (Kilo)",
        A: compareA ? normalize(compareA.weight, 60, 96) : 0,
        B: compareB ? normalize(compareB.weight, 60, 96) : 0,
      },
      {
        axis: "Tecrübe (Yaş)",
        A: compareA ? normalize(compareA.age, 18, 36) : 0,
        B: compareB ? normalize(compareB.age, 18, 36) : 0,
      },
      { axis: "Mevki Uyumu", A: compareA ? 99 : 0, B: compareB ? 99 : 0 },
    ];
  }, [compareA, compareB]);

  const excludeForA = compareB ? [compareB.globalId] : [];
  const excludeForB = compareA ? [compareA.globalId] : [];

  return (
    <>
      <div className="compare-grid">
        <ComparePicker label="1. Oyuncuyu Seç" player={compareA} excludeGlobalIds={excludeForA} onPick={setCompareA} />
        <div className="compare-vs">VS</div>
        <ComparePicker label="2. Oyuncuyu Seç" player={compareB} excludeGlobalIds={excludeForB} onPick={setCompareB} />
      </div>

      {(compareA || compareB) && (
        <div className="chart-card chart-card-wide compare-chart-card">
          <h3>Karşılaştırma</h3>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={radarData} outerRadius={120}>
              <PolarGrid stroke={CHART_GRID} />
              <PolarAngleAxis dataKey="axis" tick={{ fill: CHART_AXIS, fontSize: 12 }} />
              <PolarRadiusAxis stroke={CHART_GRID} tick={{ fill: CHART_AXIS, fontSize: 10 }} domain={[0, 99]} />
              {compareA && (
                <Radar
                  name={compareA.name}
                  dataKey="A"
                  stroke={CHART_SERIES[0]}
                  fill={CHART_SERIES[0]}
                  fillOpacity={0.35}
                />
              )}
              {compareB && (
                <Radar
                  name={compareB.name}
                  dataKey="B"
                  stroke={CHART_SERIES[1]}
                  fill={CHART_SERIES[1]}
                  fillOpacity={0.35}
                />
              )}
              <Legend wrapperStyle={{ color: CHART_AXIS }} />
            </RadarChart>
          </ResponsiveContainer>

          <p className="compare-physical-note">
            Boy/kilo/yaş/ayak tercihi gerçek kaynaklı değildir — mevkiye göre
            gerçekçi bir aralıkta üretilmiş <b>tahmini</b> değerlerdir (rating
            alanı gibi).
          </p>

          <table className="compare-stat-table">
            <tbody>
              <tr>
                <th>Takım</th>
                <td>{compareA?.teamName ?? "–"}</td>
                <td>{compareB?.teamName ?? "–"}</td>
              </tr>
              <tr>
                <th>Yarışma</th>
                <td>{compareA?.competitionName ?? "–"}</td>
                <td>{compareB?.competitionName ?? "–"}</td>
              </tr>
              <tr>
                <th>Mevki</th>
                <td>{compareA?.position ?? "–"}</td>
                <td>{compareB?.position ?? "–"}</td>
              </tr>
              <tr>
                <th>Uyruk</th>
                <td>{compareA?.nationality ?? "–"}</td>
                <td>{compareB?.nationality ?? "–"}</td>
              </tr>
              <tr>
                <th>Güç Puanı</th>
                <td>{compareA?.rating ?? "–"}</td>
                <td>{compareB?.rating ?? "–"}</td>
              </tr>
              <tr>
                <th>Boy (tahmini)</th>
                <td>{compareA ? `${compareA.height} cm` : "–"}</td>
                <td>{compareB ? `${compareB.height} cm` : "–"}</td>
              </tr>
              <tr>
                <th>Kilo (tahmini)</th>
                <td>{compareA ? `${compareA.weight} kg` : "–"}</td>
                <td>{compareB ? `${compareB.weight} kg` : "–"}</td>
              </tr>
              <tr>
                <th>Yaş (tahmini)</th>
                <td>{compareA?.age ?? "–"}</td>
                <td>{compareB?.age ?? "–"}</td>
              </tr>
              <tr>
                <th>Ayak (tahmini)</th>
                <td>{compareA?.foot ?? "–"}</td>
                <td>{compareB?.foot ?? "–"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function DreamTeamPage() {
  const [tab, setTab] = useState("squad");

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Tüm Yarışmalar</div>
          <h1>Rüya Takım</h1>
          <p>
            UCL, Avrupa Ligi ve Trendyol Süper Lig'deki istediğin oyuncuyla
            hayalindeki 11'i kur, ya da iki oyuncuyu yan yana karşılaştır.
          </p>
        </div>
      </header>

      <div className="stats-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "squad" && <SquadBuilder />}
      {tab === "compare" && <ComparePanel />}
    </div>
  );
}

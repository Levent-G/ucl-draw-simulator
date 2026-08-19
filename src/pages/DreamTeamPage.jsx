import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { useDreamTeam, FORMATION_SLOTS } from "../state/DreamTeamContext.jsx";
import { useTeamInjection } from "../state/TeamInjectionContext.jsx";
import { COMPETITION_LIST } from "../data/competitions.js";
import { findPlayerByGlobalId } from "../utils/crossCompetitionPlayers.js";
import PlayerPickerModal from "../components/dreamteam/PlayerPickerModal.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";
import Crest from "../components/Crest.jsx";
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from "../utils/chartTheme.js";

const DREAM_TEAM_ID = "dream-team";
const SQUAD_SIZE = FORMATION_SLOTS.length;

const TABS = [
  { key: "squad", label: "Kadro Kur" },
  { key: "compare", label: "Karşılaştır" },
];

function PitchSlot({ slot, player, onPick, onClear }) {
  return (
    <div className="pitch-slot">
      {player ? (
        <button className="pitch-slot-filled" onClick={() => onPick(slot)} title="Değiştirmek için tıkla">
          <PlayerAvatar player={player} size={40} />
          <span className="pitch-slot-name">{player.name}</span>
          <span className="pitch-slot-meta">
            {player.team && <Crest team={player.team} size={14} />}
            {player.rating}
          </span>
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
  const { squad, setSlotPlayer, clearSlot, clearSquad } = useDreamTeam();
  const [pickerSlot, setPickerSlot] = useState(null);

  const rows = useMemo(() => {
    const byRow = {};
    for (const slot of FORMATION_SLOTS) {
      if (!byRow[slot.row]) byRow[slot.row] = [];
      byRow[slot.row].push(slot);
    }
    return Object.entries(byRow)
      .sort(([a], [b]) => Number(b) - Number(a)) // forvet üstte, kaleci altta
      .map(([, slots]) => slots);
  }, []);

  const filledPlayers = useMemo(
    () =>
      Object.values(squad)
        .map((gid) => findPlayerByGlobalId(gid))
        .filter(Boolean),
    [squad]
  );
  const filledCount = filledPlayers.length;
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
          <button className="btn-ghost" onClick={clearSquad}>
            Kadroyu Temizle
          </button>
        )}
      </div>

      <SendToCompetition filledPlayers={filledPlayers} isFull={filledCount === SQUAD_SIZE} />

      <div className="pitch">
        <div className="pitch-lines" aria-hidden="true">
          <span className="pitch-center-circle" />
          <span className="pitch-center-line" />
        </div>
        {rows.map((rowSlots, i) => (
          <div className="pitch-row" key={i}>
            {rowSlots.map((slot) => (
              <PitchSlot
                key={slot.id}
                slot={slot}
                player={squad[slot.id] ? findPlayerByGlobalId(squad[slot.id]) : null}
                onPick={setPickerSlot}
                onClear={clearSlot}
              />
            ))}
          </div>
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

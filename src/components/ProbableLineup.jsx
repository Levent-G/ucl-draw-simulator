import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FORMATIONS } from "../state/DreamTeamContext.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";
import { CURRENT_INJURIES } from "../data/injuries.js";
import { buildRealBasedLineup } from "../utils/realLineupSelectors.js";

const FORMATION_KEY = "4-3-3";

// teamId -> Map(oyuncu adı, sadeleştirilmiş -> CURRENT_INJURIES kaydı) --
// güncel sakat/cezalı oyuncuları hızlı arama İÇİN, ama sadece dışlamak değil
// (reason/expectedReturn'ü yanda göstermek İÇİN de) önceden indeksler.
const INJURY_BY_TEAM = CURRENT_INJURIES.reduce((acc, entry) => {
  const key = entry.teamId;
  const normalized = entry.playerName.trim().toLowerCase();
  if (!acc[key]) acc[key] = new Map();
  acc[key].set(normalized, entry);
  return acc;
}, {});

// Bir takımın kadrosundan, hâlihazırda sakat/cezalı olduğu bilinen (bkz.
// src/data/injuries.js) oyuncuları çıkarır.
function excludeCurrentlyInjured(players, teamId) {
  const injuryMap = INJURY_BY_TEAM[teamId];
  if (!injuryMap || injuryMap.size === 0) return players;
  return players.filter((p) => !injuryMap.has((p.name || "").trim().toLowerCase()));
}

// Kadrodan çıkarılan oyuncuların KENDİLERİ -- kullanıcı geri bildirimi:
// "sakatlar sadece yok olmasın, yanda sakat işaretiyle görünsün" -- bu
// yüzden artık sessizce filtrelenip kaybolmuyorlar, TeamProfilePage'in
// yedekler listesindeki aynı "🩹 sakat" deseniyle ayrı gösteriliyorlar.
function getCurrentlyInjured(players, teamId) {
  const injuryMap = INJURY_BY_TEAM[teamId];
  if (!injuryMap || injuryMap.size === 0) return [];
  return (players || [])
    .map((p) => ({ player: p, injury: injuryMap.get((p.name || "").trim().toLowerCase()) }))
    .filter((x) => x.injury);
}

// Takımın kayıtlı oyuncularından, mevkiine göre en yüksek reytingli
// olanları formasyon slotlarına atar -- bu GERÇEK/doğrulanmış bir ilk 11
// DEĞİLDİR (öyle bir veri kaynağımız yok), sadece kadro gücüne dayalı
// örnek/olası bir diziliş. Aynı oyuncu iki slota atanmaz.
function buildProbableLineup(players, slots) {
  const byPosition = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) {
    if (byPosition[p.position]) byPosition[p.position].push(p);
  }
  for (const pos in byPosition) {
    byPosition[pos].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  const used = new Set();
  return slots.map((slot) => {
    const pool = byPosition[slot.position] || [];
    const player = pool.find((p) => !used.has(p.id)) || null;
    if (player) used.add(player.id);
    return { slot, player };
  });
}

// Maç Analizi'ndeki "Olası Kadro" -- Rüya Takım'daki saha (pitch) tasarımıyla
// AYNI görsel dilde (bkz. pitch/pitch-slot CSS'i), ama salt okunur ve tek bir
// gerçek kulübün kayıtlı kadrosundan besleniyor.
export default function ProbableLineup({ team, players, competitionKey }) {
  const realBased = useMemo(
    () => buildRealBasedLineup({ teamId: team.id, teamName: team.name, competitionKey, players: players || [] }),
    [players, team.id, team.name, competitionKey]
  );
  const formationKey = realBased?.formation || FORMATION_KEY;
  const slots = FORMATIONS[formationKey].slots;
  const availablePlayers = useMemo(
    () => excludeCurrentlyInjured(players || [], team.id),
    [players, team.id]
  );
  const assigned = useMemo(
    () => (realBased ? realBased.assigned : buildProbableLineup(availablePlayers, slots)),
    [realBased, availablePlayers, slots]
  );
  const injured = useMemo(
    () => getCurrentlyInjured(players || [], team.id),
    [players, team.id]
  );

  return (
    <div className="probable-lineup">
      <div className="probable-lineup-head">
        <h4>🔮 Olası Kadro — {team.short} ({formationKey})</h4>
        <p className="footnote">
          {realBased ? (
            <>Takımın en son gerçek maçındaki (kaynak: {realBased.source}) ilk 11'i ve diziliş şekli temel alınmıştır.
            Sonradan sakat/cezalı olan ya da o maçtaki ismi doğrulanamayan oyuncuların yerine (🔁 ile işaretli)
            kadronun aynı mevkideki en iyi müsait oyuncusu konulmuştur -- yine de bu, resmî bir sonraki maç
            kadrosu DEĞİLDİR.</>
          ) : (
            <>Resmi/doğrulanmış bir ilk 11 DEĞİLDİR -- kulübün kayıtlı oyuncularından, reytinge göre otomatik
            oluşturulan örnek bir diziliş.</>
          )}
          {" "}Hâlihazırda sakat/cezalı olduğu bilinen oyuncular sahanın yanında 🩹 ile ayrıca gösterilmiştir.
        </p>
      </div>
      <div className="probable-lineup-body">
        <div className="pitch pitch-readonly pitch-compact">
          <div className="pitch-lines" aria-hidden="true">
            <span className="pitch-center-circle" />
            <span className="pitch-center-line" />
          </div>
          {assigned.map(({ slot, player, rawName, replacedInjuredName }) => (
            <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} key={slot.id}>
              {player ? (
                <Link
                  to={`/${competitionKey}/oyuncu/${player.id}`}
                  className="pitch-slot-filled"
                  title={replacedInjuredName ? `${replacedInjuredName} sakat/cezalı olduğu için yerine kondu` : undefined}
                >
                  <PlayerAvatar player={player} size={30} />
                  <span className="pitch-slot-name">{player.name}</span>
                  <span className="pitch-slot-meta">{player.rating}</span>
                  {replacedInjuredName && (
                    <span className="pitch-slot-note-tag pitch-slot-note-tag-sub" aria-hidden="true">🔁</span>
                  )}
                </Link>
              ) : rawName ? (
                <div
                  className="pitch-slot-filled pitch-slot-real-only"
                  title="Gerçek son maç kadrosunda yer aldı; sitenin oyuncu veritabanında eşleşme bulunamadı"
                >
                  <span className="pitch-slot-name">{rawName}</span>
                </div>
              ) : (
                <div className="pitch-slot-empty">
                  <span className="pitch-slot-pos">{slot.position}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {injured.length > 0 && (
          <div className="probable-lineup-injured">
            <h5 className="probable-lineup-injured-title">🩹 Sakat / Cezalı</h5>
            <div className="probable-lineup-injured-list">
              {injured.map(({ player, injury }) => {
                // type alanı yoksa (eski kayıtların hiçbiri güncellenmedi)
                // "injury" varsayılır -- bkz. injuries.js'teki convention notu.
                const isSuspension = injury.type === "suspension";
                return (
                  <Link
                    key={player.id}
                    to={`/${competitionKey}/oyuncu/${player.id}`}
                    className="probable-lineup-injured-row"
                    title={`${injury.reason || "Sakat/cezalı"}${injury.expectedReturn ? ` -- dönüş: ${injury.expectedReturn}` : ""}`}
                  >
                    <PlayerAvatar player={player} size={22} />
                    <span className="probable-lineup-injured-name">{player.name}</span>
                    <span className="probable-lineup-injured-badge" aria-hidden="true">{isSuspension ? "🟨" : "🩹"}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

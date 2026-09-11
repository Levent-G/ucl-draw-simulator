import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FORMATIONS } from "../state/DreamTeamContext.jsx";
import PlayerAvatar from "./PlayerAvatar.jsx";

const FORMATION_KEY = "4-3-3";

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

// xiNames (ACTUAL_LINEUPS'tan gelen 11 gerçek isim) ile players (yerel
// players.js kadrosu) arasında normalize edilmiş isim eşleşmesi kurar.
// Eşleşen isim yerel kadroda varsa oradaki oyuncu objesini (id/rating dahil)
// döndürür; yoksa sadece ismi taşıyan "unmatched" bir kayıt döner -- ASLA bir
// slotu boş bırakıp yerine olasılık bazlı bir tahminle DOLDURMAZ.
function matchNamesToRoster(xiNames, players) {
  const byNormalizedName = new Map();
  for (const p of players || []) {
    byNormalizedName.set(normalizeName(p.name), p);
  }
  return (xiNames || []).map((name) => {
    const match = byNormalizedName.get(normalizeName(name));
    return { name, player: match || null };
  });
}

// Formasyon slotlarına, mevkii uyumuna öncelik vererek gerçek ilk 11'i
// dağıtır. Yerel kadroda eşleşen oyuncuların mevkii bilgisi varsa o mevkiye
// öncelik verilir; eşleşmeyen (yalnızca isim bilinen) girişler, boşta kalan
// slotlara sırayla yerleştirilir. Amaç sadece görsel bir yerleşimdir -- bu
// oyuncunun sahadaki gerçek mevkii/pozisyonu hakkında bir iddia DEĞİLDİR.
function assignToSlots(matched, slots) {
  const remaining = [...matched];
  const assignments = new Array(slots.length).fill(null);

  // 1. geçiş: yerel kadroda mevkii bilinen ve slot mevkiiyle örtüşen isimleri
  // yerleştir.
  slots.forEach((slot, slotIndex) => {
    const idx = remaining.findIndex((m) => m.player && m.player.position === slot.position);
    if (idx !== -1) {
      assignments[slotIndex] = remaining[idx];
      remaining.splice(idx, 1);
    }
  });

  // 2. geçiş: kalan (mevkii bilinmeyen ya da uyuşmayan) isimleri, boşta kalan
  // slotlara sırayla doldur.
  slots.forEach((slot, slotIndex) => {
    if (assignments[slotIndex]) return;
    const next = remaining.shift();
    if (next) assignments[slotIndex] = next;
  });

  return slots.map((slot, i) => ({ slot, entry: assignments[i] }));
}

// Maç Analizi'ndeki "✅ Sahaya Çıkan Gerçek Kadro" -- ProbableLineup.jsx ile
// AYNI görsel dilde (pitch/pitch-slot CSS'i), ama olasılık tahmini DEĞİL,
// src/data/actualLineups.js'te en az iki bağımsız kaynaktan doğrulanmış
// GERÇEK ilk 11'i gösterir. Yerel players.js kadrosunda karşılığı olmayan
// (ör. kadro dosyası kısaltılmış küçük kulüpler) bir isim bile olsa, o isim
// yine de düz metin olarak gösterilir -- link/rating/avatar OLMADAN -- ASLA
// sessizce atlanmaz ya da olasılık bazlı bir tahminle değiştirilmez.
export default function ActualLineup({ team, players, competitionKey, xiNames, source }) {
  const slots = FORMATIONS[FORMATION_KEY].slots;
  const matched = useMemo(() => matchNamesToRoster(xiNames, players || []), [xiNames, players]);
  const assigned = useMemo(() => assignToSlots(matched, slots), [matched, slots]);

  return (
    <div className="probable-lineup">
      <div className="probable-lineup-head">
        <h4>✅ Sahaya Çıkan Gerçek Kadro — {team.short} ({FORMATION_KEY})</h4>
        <p className="footnote">
          Bu takımın bu maçta SAHAYA GERÇEKTEN ÇIKARDIĞI ilk 11'dir (en az iki bağımsız kaynaktan çapraz
          doğrulanmıştır{source ? ` — ${source}` : ""}). Dizilişteki slot yerleşimi (kimin hangi mevkide oynadığı)
          yaklaşıktır; kesin olan sadece kadroda YER ALDIĞIdır.
        </p>
      </div>
      <div className="pitch pitch-readonly pitch-compact">
        <div className="pitch-lines" aria-hidden="true">
          <span className="pitch-center-circle" />
          <span className="pitch-center-line" />
        </div>
        {assigned.map(({ slot, entry }) => {
          if (!entry) {
            return (
              <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} key={slot.id}>
                <div className="pitch-slot-empty">
                  <span className="pitch-slot-pos">{slot.position}</span>
                </div>
              </div>
            );
          }
          const { name, player } = entry;
          return (
            <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }} key={slot.id}>
              {player ? (
                <Link to={`/${competitionKey}/oyuncu/${player.id}`} className="pitch-slot-filled">
                  <PlayerAvatar player={player} size={30} />
                  <span className="pitch-slot-name">{player.name}</span>
                  <span className="pitch-slot-meta">{player.rating}</span>
                </Link>
              ) : (
                <span className="pitch-slot-filled">
                  <span className="pitch-slot-name">{name}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

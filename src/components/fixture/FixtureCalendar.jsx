import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Crest from "../Crest.jsx";
import { formatMatchDate } from "../../utils/matchDate.js";
import { getRealMatchResult } from "../../utils/realStandingsSelectors.js";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Bir güne tıklayınca açılan küçük önizleme -- o günün tüm maçlarını
// gösterir, "Bu Haftaya Git" ile asıl fikstür listesine atlanabilir.
// Dışına tıklayınca ya da ✕ ile HER ZAMAN kapanır -- açık kalmaz.
function DayPreviewModal({ dateKey, matches, competitionKey, onGoToWeek, onClose }) {
  return (
    <div className="calendar-day-overlay" onClick={onClose}>
      <div className="calendar-day-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-day-modal-head">
          <span>{formatMatchDate(dateKey, { day: "numeric", month: "long", weekday: "long" })}</span>
          <button type="button" className="btn-ghost btn-small" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="calendar-day-modal-list">
          {matches.map((m) => (
            <Link
              key={m.id}
              to={`/${competitionKey}/mac/${m.id}`}
              className="calendar-day-match"
              onClick={onClose}
            >
              <span className="calendar-day-match-team">
                <Crest team={m.homeTeam} size={22} />
                {m.homeTeam.short}
              </span>
              <span className="calendar-day-match-vs">
                {m.homeGoals != null && m.awayGoals != null ? `${m.homeGoals} - ${m.awayGoals}` : "vs"}
              </span>
              <span className="calendar-day-match-team calendar-day-match-team-away">
                {m.awayTeam.short}
                <Crest team={m.awayTeam} size={22} />
              </span>
            </Link>
          ))}
        </div>
        <button type="button" className="btn-secondary calendar-day-modal-cta" onClick={() => onGoToWeek(matches[0].matchdayNumber)}>
          Bu Haftaya Git →
        </button>
      </div>
    </div>
  );
}

// Fikstür sayfasındaki ay görünümlü takvim -- gerçek maç günlerini işaretler.
// Favori takım varsa, o takımın maçının olduğu günde nokta yerine takımın
// logosu gösterilir. Bir güne tıklamak o günün maç(lar)ını küçük bir
// modal'da önizler; "Bu Haftaya Git" asıl listeye atlar.
export default function FixtureCalendar({ fixture, competitionKey, favoriteTeamId, onSelectDay }) {
  const matchesByDate = useMemo(() => {
    const map = {};
    for (const md of fixture || []) {
      for (const m of md.matches) {
        if (!m.date) continue;
        if (!map[m.date]) map[m.date] = [];
        const real = getRealMatchResult(competitionKey, m);
        map[m.date].push({
          ...m,
          matchdayNumber: md.number,
          ...(real ? { homeGoals: real.homeGoals, awayGoals: real.awayGoals } : {}),
        });
      }
    }
    return map;
  }, [fixture, competitionKey]);

  const allDateKeys = useMemo(() => Object.keys(matchesByDate).sort(), [matchesByDate]);

  const [monthCursor, setMonthCursor] = useState(() => {
    const todayKey = toDateKey(new Date());
    const upcomingKey = allDateKeys.find((d) => d >= todayKey) || allDateKeys[0];
    const base = upcomingKey ? new Date(upcomingKey) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [openDayKey, setOpenDayKey] = useState(null);

  const monthLabel = monthCursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const minMonthKey = allDateKeys[0]?.slice(0, 7);
  const maxMonthKey = allDateKeys[allDateKeys.length - 1]?.slice(0, 7);
  const monthKey = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;

  const weeks = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Pazartesi = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [monthCursor]);

  const todayKey = toDateKey(new Date());
  const openDayMatches = openDayKey ? matchesByDate[openDayKey] : null;

  return (
    <div className="fixture-calendar">
      <div className="fixture-calendar-head">
        <button
          type="button"
          className="fixture-calendar-nav"
          onClick={() => setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          disabled={minMonthKey != null && monthKey <= minMonthKey}
          aria-label="Önceki ay"
        >
          ←
        </button>
        <span className="fixture-calendar-month">{monthLabel}</span>
        <button
          type="button"
          className="fixture-calendar-nav"
          onClick={() => setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          disabled={maxMonthKey != null && monthKey >= maxMonthKey}
          aria-label="Sonraki ay"
        >
          →
        </button>
      </div>
      <div className="fixture-calendar-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="fixture-calendar-grid">
        {weeks.flatMap((row, ri) =>
          row.map((date, ci) => {
            if (!date) return <span key={`${ri}-${ci}`} className="fixture-calendar-cell is-empty" aria-hidden="true" />;
            const key = toDateKey(date);
            const matches = matchesByDate[key] || [];
            const favMatch = favoriteTeamId
              ? matches.find((m) => m.homeTeam.id === favoriteTeamId || m.awayTeam.id === favoriteTeamId)
              : null;
            const favTeam = favMatch ? (favMatch.homeTeam.id === favoriteTeamId ? favMatch.homeTeam : favMatch.awayTeam) : null;
            const isToday = key === todayKey;
            const hasMatch = matches.length > 0;
            return (
              <button
                key={key}
                type="button"
                className={`fixture-calendar-cell ${hasMatch ? "has-match" : ""} ${isToday ? "is-today" : ""} ${favMatch ? "has-favorite" : ""}`}
                disabled={!hasMatch}
                onClick={() => setOpenDayKey(key)}
                title={matches.map((m) => `${m.homeTeam.short} - ${m.awayTeam.short}`).join(" · ")}
              >
                <span className="fixture-calendar-daynum">{date.getDate()}</span>
                {favTeam ? (
                  <Crest team={favTeam} size={14} />
                ) : hasMatch ? (
                  <span className="fixture-calendar-dot" />
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {openDayMatches && (
        <DayPreviewModal
          dateKey={openDayKey}
          matches={openDayMatches}
          competitionKey={competitionKey}
          onGoToWeek={(number) => {
            setOpenDayKey(null);
            onSelectDay(number);
          }}
          onClose={() => setOpenDayKey(null)}
        />
      )}
    </div>
  );
}

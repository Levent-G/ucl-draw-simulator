import React, { useMemo, useState } from "react";
import Crest from "../Crest.jsx";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Fikstür sayfasındaki ay görünümlü takvim -- gerçek maç günlerini işaretler.
// Favori takım varsa, o takımın maçının olduğu günde nokta yerine takımın
// logosu gösterilir ("seçilen takım varsa o takımın logosuyla gözüksün").
// Bir güne tıklamak o günün maçının olduğu haftaya atlar (bkz. RealFixturePage).
export default function FixtureCalendar({ fixture, favoriteTeamId, onSelectDay }) {
  const matchesByDate = useMemo(() => {
    const map = {};
    for (const md of fixture || []) {
      for (const m of md.matches) {
        if (!m.date) continue;
        if (!map[m.date]) map[m.date] = [];
        map[m.date].push({ ...m, matchdayNumber: md.number });
      }
    }
    return map;
  }, [fixture]);

  const allDateKeys = useMemo(() => Object.keys(matchesByDate).sort(), [matchesByDate]);

  const [monthCursor, setMonthCursor] = useState(() => {
    const todayKey = toDateKey(new Date());
    const upcomingKey = allDateKeys.find((d) => d >= todayKey) || allDateKeys[0];
    const base = upcomingKey ? new Date(upcomingKey) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

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
                onClick={() => hasMatch && onSelectDay(matches[0].matchdayNumber)}
                title={matches.map((m) => `${m.homeTeam.short} - ${m.awayTeam.short}`).join(" · ")}
              >
                <span className="fixture-calendar-daynum">{date.getDate()}</span>
                {favTeam ? (
                  <Crest team={favTeam} size={16} />
                ) : hasMatch ? (
                  <span className="fixture-calendar-dot" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

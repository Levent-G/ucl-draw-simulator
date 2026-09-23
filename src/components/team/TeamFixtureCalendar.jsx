import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Tek bir takımın TÜM yarışmalardaki (UCL + Süper Lig birleşik) maçlarını
// gösteren, sade bir ay takvimi -- src/components/fixture/FixtureCalendar.jsx
// ile AYNI görsel dil ama çok daha basit: bu zaten TEK takıma indirgenmiş bir
// liste olduğundan (bir takım aynı gün iki maç oynamaz), bir güne tıklamak
// doğrudan o maçın Maç Merkezi'ne götürür -- FixtureCalendar'daki "gün önizleme
// modal'ı" gerekmez (o, TÜM takımların o günkü maçlarını göstermek zorundaydı).
export default function TeamFixtureCalendar({ rows }) {
  const navigate = useNavigate();
  const rowsByDate = useMemo(() => {
    const map = {};
    for (const r of rows) {
      if (!r.date) continue;
      map[r.date] = r;
    }
    return map;
  }, [rows]);
  const dateKeys = useMemo(() => Object.keys(rowsByDate).sort(), [rowsByDate]);

  const [monthCursor, setMonthCursor] = useState(() => {
    const todayKey = toDateKey(new Date());
    const upcomingKey = dateKeys.find((d) => d >= todayKey) || dateKeys[dateKeys.length - 1];
    const base = upcomingKey ? new Date(upcomingKey) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  if (dateKeys.length === 0) return null;

  const monthLabel = monthCursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const minMonthKey = dateKeys[0]?.slice(0, 7);
  const maxMonthKey = dateKeys[dateKeys.length - 1]?.slice(0, 7);
  const monthKey = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const todayKey = toDateKey(new Date());

  return (
    <div className="fixture-calendar team-fixture-calendar">
      <div className="fixture-calendar-head">
        <button
          type="button"
          className="fixture-calendar-nav"
          onClick={() => setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          disabled={monthKey <= minMonthKey}
          aria-label="Önceki ay"
        >
          ←
        </button>
        <span className="fixture-calendar-month">{monthLabel}</span>
        <button
          type="button"
          className="fixture-calendar-nav"
          onClick={() => setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          disabled={monthKey >= maxMonthKey}
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
            const match = rowsByDate[key];
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                type="button"
                className={`fixture-calendar-cell ${match ? "has-match" : ""} ${isToday ? "is-today" : ""} ${match?.competitionKey === "ucl" ? "is-ucl" : match ? "is-superlig" : ""}`}
                disabled={!match}
                onClick={() => match && navigate(`/${match.competitionKey}/mac/${match.id}`)}
                title={match ? `${match.homeTeam.short} - ${match.awayTeam.short} (${match.competitionLabel}${match.time ? `, ${match.time}` : ""})` : undefined}
              >
                <span className="fixture-calendar-daynum">{date.getDate()}</span>
                {match && <span className="fixture-calendar-dot" />}
              </button>
            );
          })
        )}
      </div>
      <div className="team-fixture-calendar-legend">
        <span><span className="fixture-calendar-dot is-superlig" /> Süper Lig</span>
        <span><span className="fixture-calendar-dot is-ucl" /> UCL</span>
      </div>
    </div>
  );
}

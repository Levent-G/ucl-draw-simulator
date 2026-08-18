import React, { useEffect, useRef, useState } from "react";
import Crest from "../Crest.jsx";

// Native <select>/<option> takım amblemi gösteremediği için, kendi
// oluşturduğumuz (arama kutulu, amblemli) bir açılır liste.
export default function TeamFilterSelect({ teams, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selected = teams.find((t) => t.id === value) || null;

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const filtered = query.trim()
    ? sorted.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()))
    : sorted;

  function choose(teamId) {
    onChange(teamId);
    setOpen(false);
  }

  return (
    <div className={`team-filter-select ${open ? "open" : ""}`} ref={ref}>
      <button type="button" className="team-filter-trigger" onClick={() => setOpen((o) => !o)}>
        {selected ? (
          <>
            <Crest team={selected} size={20} />
            <span>{selected.name}</span>
          </>
        ) : (
          <span className="team-filter-placeholder">Tüm takımlar</span>
        )}
        <span className="team-filter-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="team-filter-menu">
          <input
            ref={inputRef}
            type="text"
            className="team-filter-search"
            placeholder="Takım ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="team-filter-options">
            <button
              type="button"
              className={`team-filter-option ${!value ? "active" : ""}`}
              onClick={() => choose("")}
            >
              <span className="team-filter-all-icon" aria-hidden="true">
                🌍
              </span>
              Tüm takımlar
            </button>
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`team-filter-option ${value === t.id ? "active" : ""}`}
                onClick={() => choose(t.id)}
              >
                <Crest team={t} size={20} />
                {t.name}
              </button>
            ))}
            {filtered.length === 0 && <div className="team-filter-empty">Eşleşen takım yok.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

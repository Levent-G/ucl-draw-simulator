import React, { useState } from "react";
import { COMPETITION_LIST } from "../../data/competitions.js";

// "Bir takımdan başla" -- kadroyu tek tek doldurmak yerine, gerçek bir
// takımın güncel (transfer merkezindeki değişiklikleri de yansıtan) kadrosunu
// mevcut formasyona otomatik yerleştirir (bkz. DreamTeamPage.jsx'teki
// buildXiFromTeamRoster). Sadece HANGİ takımın seçildiğini bildirir --
// dolduma mantığı çağıran tarafta (DreamTeamPage) kalır.
export default function TeamStartPicker({ onPick }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value) return;
    const [competitionKey, teamId] = value.split(":");
    onPick(teamId, competitionKey);
  };

  return (
    <div className="dreamteam-team-start">
      <select
        className="dreamteam-team-start-select"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">Bir takımdan başla…</option>
        {COMPETITION_LIST.map((c) => (
          <optgroup key={c.key} label={c.shortName}>
            {[...c.teams]
              .sort((a, b) => a.name.localeCompare(b.name, "tr"))
              .map((t) => (
                <option key={t.id} value={`${c.key}:${t.id}`}>
                  {t.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <button type="button" className="btn-secondary btn-small" disabled={!value} onClick={handleSubmit}>
        Bu Takımla Başla
      </button>
    </div>
  );
}

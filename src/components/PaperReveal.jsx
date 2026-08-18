import React from "react";
import Crest from "./Crest.jsx";
import { POT_COLORS } from "../data/teams.js";

export default function PaperReveal({ team, visible, revealKey, countryNames }) {
  return (
    <div className={`paper-reveal-backdrop ${visible ? "show" : ""}`}>
      {team && (
        <React.Fragment key={revealKey}>
          <span className="reveal-flash-burst" />
          <div
            className="paper-reveal-card"
            style={{ "--accent-color": POT_COLORS[team.pot].main }}
          >
            <span className="paper-reveal-topbar" />
            <div className="paper-fold-line line-1" />
            <div className="paper-fold-line line-2" />
            <div className="paper-reveal-content">
              <span className="paper-reveal-pot">
                {POT_COLORS[team.pot].label}
              </span>
              <span className="paper-reveal-crest">
                <Crest team={team} size={84} />
              </span>
              <span className="paper-reveal-name">{team.name}</span>
              <span className="paper-reveal-country">
                {countryNames?.[team.country] || team.country}
              </span>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

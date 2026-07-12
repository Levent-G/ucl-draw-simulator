import React, { useState } from "react";
import CUSTOM_BALL_IMAGE from "../assets/logos/uefa-champions-league-seeklogo.png";


// Önce public/logos/start-ball.png dosyasını dener (kendi resmini bu isimle
// ekleyince otomatik görünür). Dosya yoksa (404), özgün SVG top desenine
// geri döner -- gerçek UEFA/UCL logosu hiçbir zaman kullanılmaz.


export default function StartOrb({ onClick, label, sublabel, disabled }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      className="start-orb"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="start-orb-ball-wrap">
        <span className="start-orb-ring" />
        <span className="start-orb-ring ring-2" />
        <span className="start-orb-ball">
          {!imgFailed ? (
            <img
              src={CUSTOM_BALL_IMAGE}
              alt=""
              className="start-orb-custom-img"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              className="start-orb-pattern"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.2"
              />
              <polygon
                points="50,12 60,38 88,38 65,55 74,84 50,67 26,84 35,55 12,38 40,38"
                fill="rgba(255,255,255,0.07)"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.4"
              />
              <circle
                cx="50"
                cy="50"
                r="13"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.4"
              />
            </svg>
          )}
        </span>
      </span>

      <span className="start-orb-label">
        <span className="start-orb-title">{label}</span>
        {sublabel && <span className="start-orb-sub">{sublabel}</span>}
      </span>
    </button>
  );
}

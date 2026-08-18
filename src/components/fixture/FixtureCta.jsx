import React from "react";
import { Link } from "react-router-dom";

export default function FixtureCta({ competitionKey }) {
  return (
    <div className="fixture-cta">
      <div>
        <h3>Fikstür hazır mı?</h3>
        <p>
          8 haftalık lig fazı takvimini oluştur, her maç için istatistiksel
          model tahminini gör ve istersen kendi skor tahminlerini gir.
        </p>
      </div>
      <Link to={`/${competitionKey}/fikstur`} className="fixture-cta-btn">
        Fikstür &amp; Tahmin →
      </Link>
    </div>
  );
}

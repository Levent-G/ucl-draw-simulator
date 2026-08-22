import React from "react";
import { Link } from "react-router-dom";

// Kullanıcının "şimdi ne yapacağım?" diye düşünmeden, bir sonraki mantıklı
// adıma tek tıkla geçebilmesi için TÜM sitede kullanılan tek tip CTA kartı
// (bkz. eskiden sadece Fikstür için kullanılan .fixture-cta stilleri).
export default function NextStepCta({ title, description, to, label, icon = "→" }) {
  return (
    <div className="next-step-cta">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link to={to} className="next-step-cta-btn">
        {label} {icon}
      </Link>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

// Sitedeki TÜM "önce şunu yapman lazım" durumları için tek, tutarlı bileşen.
// Eskiden 3 farklı desen vardı: CTA'lı tam blok (FixturePage), CTA'sız düz
// metin blok (KnockoutPage'in bazı durumları) ve sessiz inline banner
// (StatsPage/HeadToHeadPage) -- hepsi aynı "önce X yap" mesajını farklı
// görsel ağırlıkta veriyordu. Artık hep aynı kural: başlık + açıklama + net
// bir CTA butonu.
//
// variant="block" (varsayılan): sayfayı tamamen kapatan `.empty-card`.
// variant="inline": sayfayı bloklamadan, mevcut içeriğin üstünde görünen
// daha küçük bir banner (StatsPage/HeadToHeadPage gibi kısmen kullanılabilir
// kalan sayfalar için).
export default function EmptyState({ title, description, primaryCta, secondaryCta, variant = "block" }) {
  const actions = (
    <>
      {primaryCta && (
        <Link to={primaryCta.to} className="btn-primary">
          {primaryCta.label}
        </Link>
      )}
      {secondaryCta && (
        <Link to={secondaryCta.to} className="btn-secondary">
          {secondaryCta.label}
        </Link>
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <div className="empty-state-inline">
        <div className="empty-state-inline-text">
          {title && <b>{title}</b>} {description}
        </div>
        {(primaryCta || secondaryCta) && <div className="empty-state-inline-actions">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="empty-card">
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {(primaryCta || secondaryCta) && <div className="empty-card-actions">{actions}</div>}
    </div>
  );
}

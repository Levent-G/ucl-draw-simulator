import React from "react";

export default function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-spinner" aria-hidden="true" />
      <span className="route-loading-text">Yükleniyor…</span>
    </div>
  );
}

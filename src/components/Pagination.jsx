import React, { useEffect, useMemo, useState } from "react";

// Genel amaçlı sayfalama -- uzun listeleri (haberler, form tablosu vb.) tek
// seferde tamamını render edip sayfayı gereksiz uzatmak/kaydırmak yerine
// sayfa sayfa gösterir. `items`i kendisi dilimler, sonucu render-prop olarak
// `children(pageItems)`e verir; sayfa değişince en yakın `data-pagination-top`
// işaretine kaydırır ki kullanıcı sayfa değiştirince listenin ortasında
// kalmasın.
export default function Pagination({ items, pageSize = 10, children, topRef }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Filtre değişip liste kısalınca (ör. haberlerde takım filtresi) geçerli
  // sayfa numarası aralık dışında kalmasın.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function goTo(p) {
    setPage(Math.min(totalPages, Math.max(1, p)));
    if (topRef?.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {children(pageItems)}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button className="pagination-btn" onClick={() => goTo(page - 1)} disabled={page === 1}>
            ← Önceki
          </button>
          <span className="pagination-status">
            Sayfa {page} / {totalPages}
          </span>
          <button className="pagination-btn" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
            Sonraki →
          </button>
        </div>
      )}
    </>
  );
}

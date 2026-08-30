import React, { useEffect, useRef, useState } from "react";

// Klasik turnuva ağacı görünümü: turlar soldan ve sağdan ortadaki Final'e
// doğru daralır, aralarında bağlantı çizgileri vardır. NOT: bu motorun
// eleme turu simülasyonu (bkz. knockoutEngine.js) her tur başında
// eşleşmeleri YENİDEN karıştırıyor -- yani bir maçın hangi sonraki maça
// "beslendiğine" dair gerçek bir soy zinciri YOK. Bağlantı çizgileri bu
// yüzden GERÇEK bir eşleşme ilişkisini değil, sadece klasik bracket
// görselinin YAPISINI yansıtır.
//
// NOT 2: "Play-off Turu" (varsa) bu bileşene hiç VERİLMEMELİ -- 9-24.
// sıradakilerin play-off'u, doğrudan kalifiye olan 1-8 ile birleşip AYNI
// sayıda (değil yarısı) Son 16 maçı oluşturduğu için düzgün bir "ikiye
// birleşen" ağaç şekli oluşturmuyor. Çağıran taraf (KnockoutPage/
// PredictionLeaguePage) play-off'u ayrı, düz bir bölüm olarak gösterip geri
// kalan (Son 16 -> ... -> Final) turları buraya verir -- böylece ağaç her
// zaman temiz bir 2'ye katlanan (8→4→2→1) yapı olur.
function splitHalf(arr) {
  const half = Math.ceil(arr.length / 2);
  return [arr.slice(0, half), arr.slice(half)];
}

function chunkPairs(arr) {
  const pairs = [];
  for (let i = 0; i < arr.length; i += 2) pairs.push(arr.slice(i, i + 2));
  return pairs;
}

// Fare ile BASILI TUTUP SÜRÜKLEYEREK yatay kaydırma (tarayıcının native
// scrollbar'ı yerine) -- geniş ağaçlar için (ör. 36 takımlı UCL) daha doğal
// bir "haritada gezinme" hissi verir. Scrollbar/scroll tekerleği hâlâ
// çalışır, bu sadece EK bir sürükleme yolu.
function useDragScroll() {
  const ref = useRef(null);
  const stateRef = useRef({ startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  // Sürükleme sırasında fare imleci konteynerin dışına çıksa bile (hızlı
  // hareket) kaydırmanın kopmaması için mousemove/mouseup dinleyicileri
  // konteyner yerine window'a bağlanır -- sadece dragging true iken aktif.
  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (e) => {
      const el = ref.current;
      if (!el) return;
      const dx = e.clientX - stateRef.current.startX;
      if (Math.abs(dx) > 3) stateRef.current.moved = true;
      el.scrollLeft = stateRef.current.startScroll - dx;
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const onMouseDown = (e) => {
    const el = ref.current;
    if (!el) return;
    stateRef.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    setDragging(true);
  };
  // Sürükleme bir tıklama gibi algılanıp altındaki maç kartına (buton vb.)
  // tıklanmasın diye -- gerçek bir sürükleme olduysa bir sonraki click'i yut.
  const onClickCapture = (e) => {
    if (stateRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return { ref, dragging, onMouseDown, onClickCapture };
}

export default function BracketTree({ rounds, renderTie, championSlot }) {
  const drag = useDragScroll();
  const finalIdx = rounds.findIndex((r) => r.name === "Final");
  const finalRound = finalIdx >= 0 ? rounds[finalIdx] : null;
  const otherRounds = rounds
    .map((r, idx) => ({ ...r, idx }))
    .filter((r) => r.idx !== finalIdx);

  const leftCols = otherRounds.map(({ name, ties, idx }) => ({ name, idx, ties: splitHalf(ties)[0] }));
  const rightCols = otherRounds.map(({ name, ties, idx }) => ({ name, idx, ties: splitHalf(ties)[1] })).reverse();

  function nextCount(cols, i) {
    if (i + 1 < cols.length) return cols[i + 1].ties.length;
    return finalRound?.ties?.length ? 1 : 0;
  }

  function renderSide(cols, side) {
    return cols.map((col, i) => {
      const nCount = nextCount(cols, i);
      const connects = nCount > 0;
      const merging = connects && col.ties.length === nCount * 2;
      return (
        <div className={`bracket-col bracket-side-${side}`} key={`${side}${col.idx}`}>
          <div className="bracket-col-title">{col.name}</div>
          <div className="bracket-col-ties">
            {merging
              ? chunkPairs(col.ties).map((pair, pi) => (
                  <div className="bracket-pair" key={pi}>
                    {pair.map((tie, ti) => (
                      <div className="bracket-node bracket-node-connect" key={tie.id || `${side}${col.idx}-${pi}-${ti}`}>
                        {renderTie(tie, col.idx, pi * 2 + ti)}
                      </div>
                    ))}
                  </div>
                ))
              : col.ties.map((tie, i2) => (
                  <div
                    className={`bracket-node ${connects ? "bracket-node-connect-straight" : ""}`}
                    key={tie.id || `${side}${col.idx}-${i2}`}
                  >
                    {renderTie(tie, col.idx, i2)}
                  </div>
                ))}
          </div>
        </div>
      );
    });
  }

  return (
    <div
      className={`bracket-tree-scroll ${drag.dragging ? "bracket-tree-scroll-dragging" : ""}`}
      ref={drag.ref}
      onMouseDown={drag.onMouseDown}
      onClickCapture={drag.onClickCapture}
    >
      <div className="bracket-tree">
        <div className="bracket-side-group">{renderSide(leftCols, "left")}</div>

        <div className="bracket-center">
          <div className="bracket-col-title">Final</div>
          {finalRound?.ties?.[0] && (
            <div className="bracket-node bracket-node-final">{renderTie(finalRound.ties[0], finalIdx, 0)}</div>
          )}
          {championSlot}
        </div>

        <div className="bracket-side-group">{renderSide(rightCols, "right")}</div>
      </div>
    </div>
  );
}

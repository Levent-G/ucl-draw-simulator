import { useEffect, useRef, useState } from "react";

// Sayfa yüklenirken BİR KEZ oynayan animasyonlardan farklı olarak, bu hook
// bir öğe kaydırılarak GÖRÜNÜR ALANA girdiğinde tetiklenir (IntersectionObserver)
// -- kullanıcı geri bildirimi: "farklı animasyonlar", sadece ilk yüklemede
// değil kaydırdıkça da bir şeylerin canlanmasını istedi.
export function useReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// Bir sayının 0'dan hedefe doğru "sayaç" gibi hızlanıp yavaşlayarak
// saymasını sağlar -- sadece `start` true olduğunda başlar (bkz. useReveal
// ile birlikte kullanım: görünür olana kadar saymaya başlamasın).
export function useCountUp(target, start, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || typeof target !== "number") return undefined;
    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

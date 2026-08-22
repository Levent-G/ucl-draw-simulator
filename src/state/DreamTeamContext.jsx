import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { useAchievements } from "./AchievementsContext.jsx";

// Rüya Takım kadrosu + oyuncu karşılaştırma seçimleri. Sadece bu oturuma
// özel (kalıcı değil), tıpkı transfer merkezi gibi. Birden fazla formasyon
// desteklenir; her slotun sahadaki varsayılan konumu x/y yüzdesiyle
// tanımlanır (x: soldan sağa %, y: yukarıdan aşağıya % -- 0 kale çizgisinin
// karşısı/hücum, 100 kalecinin durduğu çizgi). Kullanıcı dolu bir slotu
// sahanın istediği noktasına sürükleyip bırakabilir; bu durumda o slotun
// konumu customPositions içinde saklanır ve varsayılanın yerine kullanılır.
export const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    slots: [
      { id: "gk1", position: "GK", x: 50, y: 92 },
      { id: "df1", position: "DF", x: 15, y: 74 },
      { id: "df2", position: "DF", x: 38, y: 79 },
      { id: "df3", position: "DF", x: 62, y: 79 },
      { id: "df4", position: "DF", x: 85, y: 74 },
      { id: "mf1", position: "MF", x: 25, y: 50 },
      { id: "mf2", position: "MF", x: 50, y: 55 },
      { id: "mf3", position: "MF", x: 75, y: 50 },
      { id: "fw1", position: "FW", x: 18, y: 22 },
      { id: "fw2", position: "FW", x: 50, y: 15 },
      { id: "fw3", position: "FW", x: 82, y: 22 },
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    slots: [
      { id: "gk1", position: "GK", x: 50, y: 92 },
      { id: "df1", position: "DF", x: 15, y: 74 },
      { id: "df2", position: "DF", x: 38, y: 79 },
      { id: "df3", position: "DF", x: 62, y: 79 },
      { id: "df4", position: "DF", x: 85, y: 74 },
      { id: "mf1", position: "MF", x: 15, y: 50 },
      { id: "mf2", position: "MF", x: 38, y: 54 },
      { id: "mf3", position: "MF", x: 62, y: 54 },
      { id: "mf4", position: "MF", x: 85, y: 50 },
      { id: "fw1", position: "FW", x: 35, y: 18 },
      { id: "fw2", position: "FW", x: 65, y: 18 },
    ],
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    slots: [
      { id: "gk1", position: "GK", x: 50, y: 92 },
      { id: "df1", position: "DF", x: 15, y: 74 },
      { id: "df2", position: "DF", x: 38, y: 79 },
      { id: "df3", position: "DF", x: 62, y: 79 },
      { id: "df4", position: "DF", x: 85, y: 74 },
      { id: "dm1", position: "MF", x: 35, y: 60 },
      { id: "dm2", position: "MF", x: 65, y: 60 },
      { id: "am1", position: "MF", x: 20, y: 37 },
      { id: "am2", position: "MF", x: 50, y: 33 },
      { id: "am3", position: "MF", x: 80, y: 37 },
      { id: "fw1", position: "FW", x: 50, y: 14 },
    ],
  },
  "3-5-2": {
    label: "3-5-2",
    slots: [
      { id: "gk1", position: "GK", x: 50, y: 92 },
      { id: "df1", position: "DF", x: 25, y: 76 },
      { id: "df2", position: "DF", x: 50, y: 80 },
      { id: "df3", position: "DF", x: 75, y: 76 },
      { id: "mf1", position: "MF", x: 10, y: 52 },
      { id: "mf2", position: "MF", x: 30, y: 55 },
      { id: "mf3", position: "MF", x: 50, y: 50 },
      { id: "mf4", position: "MF", x: 70, y: 55 },
      { id: "mf5", position: "MF", x: 90, y: 52 },
      { id: "fw1", position: "FW", x: 35, y: 18 },
      { id: "fw2", position: "FW", x: 65, y: 18 },
    ],
  },
  "3-4-3": {
    label: "3-4-3",
    slots: [
      { id: "gk1", position: "GK", x: 50, y: 92 },
      { id: "df1", position: "DF", x: 25, y: 76 },
      { id: "df2", position: "DF", x: 50, y: 80 },
      { id: "df3", position: "DF", x: 75, y: 76 },
      { id: "mf1", position: "MF", x: 15, y: 52 },
      { id: "mf2", position: "MF", x: 38, y: 55 },
      { id: "mf3", position: "MF", x: 62, y: 55 },
      { id: "mf4", position: "MF", x: 85, y: 52 },
      { id: "fw1", position: "FW", x: 18, y: 20 },
      { id: "fw2", position: "FW", x: 50, y: 14 },
      { id: "fw3", position: "FW", x: 82, y: 20 },
    ],
  },
};

export const DEFAULT_FORMATION = "4-3-3";

// Sahadaki y (%) konumuna göre "hangi bölgeye bırakıldı" bilgisini
// çıkarır -- kullanıcı bir oyuncuyu sürükleyip bıraktığında canlı geri
// bildirim (bant vurgusu + rozet metni) için kullanılır.
export const ZONES = [
  { key: "FW", label: "Forvet Bandı", short: "FW", yMin: 0, yMax: 33 },
  { key: "MF", label: "Orta Saha Bandı", short: "MF", yMin: 33, yMax: 63 },
  { key: "DF", label: "Defans Bandı", short: "DF", yMin: 63, yMax: 85 },
  { key: "GK", label: "Kaleci Bölgesi", short: "GK", yMin: 85, yMax: 101 },
];

export function zoneForY(y) {
  return ZONES.find((z) => y >= z.yMin && y < z.yMax) || ZONES[ZONES.length - 1];
}

// Formasyon değişince, eldeki oyuncuları KAYBETMEDEN mevkiye göre yeni
// slotlara yeniden dağıtır (ör. 4-3-3'ten 4-4-2'ye geçince 3 orta saha
// oyuncusu yeni 4 orta saha slotundan 3'üne otomatik yerleşir).
function remapSquadToFormation(squad, oldSlots, newSlots) {
  const byPosition = { GK: [], DF: [], MF: [], FW: [] };
  for (const slot of oldSlots) {
    const gid = squad[slot.id];
    if (gid) byPosition[slot.position]?.push(gid);
  }
  const next = {};
  for (const slot of newSlots) {
    const gid = byPosition[slot.position]?.shift();
    if (gid) next[slot.id] = gid;
  }
  return next;
}

const DreamTeamContext = createContext(null);

export function DreamTeamProvider({ children }) {
  const [formation, setFormationKey] = useState(DEFAULT_FORMATION);
  const [squad, setSquad] = useState({});
  const [customPositions, setCustomPositions] = useState({});
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const { unlock } = useAchievements();
  const triedFormationsRef = useRef(new Set([DEFAULT_FORMATION]));

  const setFormation = useCallback(
    (nextKey) => {
      if (!FORMATIONS[nextKey]) return;
      setSquad((prevSquad) =>
        remapSquadToFormation(prevSquad, FORMATIONS[formation].slots, FORMATIONS[nextKey].slots)
      );
      // Serbest sürüklenmiş konumlar yeni dizilişte anlamını yitirir --
      // formasyon değişince saha varsayılan yerleşime döner.
      setCustomPositions({});
      setFormationKey(nextKey);
      triedFormationsRef.current.add(nextKey);
      if (triedFormationsRef.current.size >= 3) unlock("formasyon-mimari");
    },
    [formation, unlock]
  );

  const setSlotPlayer = useCallback((slotId, globalId) => {
    setSquad((prev) => ({ ...prev, [slotId]: globalId }));
  }, []);

  const clearSlot = useCallback((slotId) => {
    setSquad((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setCustomPositions((prev) => {
      if (!(slotId in prev)) return prev;
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  const clearSquad = useCallback(() => {
    setSquad({});
    setCustomPositions({});
  }, []);

  // Bir slotu sahada serbestçe sürükleyip bıraktığında çağrılır; x/y
  // yüzde cinsinden pitch konteynerine göre bağıl konumdur.
  const setSlotCoords = useCallback(
    (slotId, x, y) => {
      const cx = Math.max(4, Math.min(96, x));
      const cy = Math.max(4, Math.min(96, y));
      setCustomPositions((prev) => ({ ...prev, [slotId]: { x: cx, y: cy } }));
      unlock("saha-mimari");
    },
    [unlock]
  );

  const resetPositions = useCallback(() => setCustomPositions({}), []);

  // Paylaşılan bir linkten (bkz. shareLink.js) gelen bir kadroyu TOPLU
  // olarak yükler -- tek tek setSlotPlayer çağırmak yerine tüm kadroyu ve
  // formasyonu bir kerede atar.
  const loadSquad = useCallback((formationKey, squadMap) => {
    if (!FORMATIONS[formationKey]) return;
    setFormationKey(formationKey);
    setSquad(squadMap || {});
    setCustomPositions({});
  }, []);

  const value = {
    formation,
    formationSlots: FORMATIONS[formation].slots,
    setFormation,
    squad,
    setSlotPlayer,
    clearSlot,
    clearSquad,
    loadSquad,
    customPositions,
    setSlotCoords,
    resetPositions,
    compareA,
    compareB,
    setCompareA,
    setCompareB,
  };

  return <DreamTeamContext.Provider value={value}>{children}</DreamTeamContext.Provider>;
}

export function useDreamTeam() {
  const ctx = useContext(DreamTeamContext);
  if (!ctx) throw new Error("useDreamTeam bir <DreamTeamProvider> içinde kullanılmalıdır.");
  return ctx;
}

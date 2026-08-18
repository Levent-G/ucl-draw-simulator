import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { COMPETITIONS } from "../data/competitions.js";

// Kullanıcının Transfer Merkezi'nde yaptığı manuel transferleri tutar --
// gerçek veriyi (data/*.js) DEĞİL, sadece bir "geçersiz kılma" (override)
// katmanını değiştirir: overrides[compKey][playerId] = yeni takım id'si.
// Bu sayede orijinal kadro verisi hep sabit kalır, ama draw/fikstür/tahmin
// motorları useTransferMarket()'ten gelen "effective" (transferler
// uygulanmış) oyuncu listesini kullanırsa, kullanıcının kurduğu kadro
// simülasyona gerçekten yansır.
const TransferContext = createContext(null);

export function TransferProvider({ children }) {
  const [overrides, setOverrides] = useState({});

  const transferPlayer = useCallback((compKey, playerId, newTeamId) => {
    setOverrides((prev) => ({
      ...prev,
      [compKey]: { ...(prev[compKey] || {}), [playerId]: newTeamId },
    }));
  }, []);

  const undoTransfer = useCallback((compKey, playerId) => {
    setOverrides((prev) => {
      const compOverrides = { ...(prev[compKey] || {}) };
      delete compOverrides[playerId];
      return { ...prev, [compKey]: compOverrides };
    });
  }, []);

  const resetTransfers = useCallback((compKey) => {
    setOverrides((prev) => ({ ...prev, [compKey]: {} }));
  }, []);

  const value = { overrides, transferPlayer, undoTransfer, resetTransfers };
  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}

// Belirli bir yarışma (compKey) için transferler UYGULANMIŞ oyuncu
// listesini/kadrolarını ve transfer geçmişini döner.
export function useTransferMarket(compKey) {
  const ctx = useContext(TransferContext);
  if (!ctx) throw new Error("useTransferMarket bir <TransferProvider> içinde kullanılmalıdır.");
  const comp = COMPETITIONS[compKey];
  const compOverrides = ctx.overrides[compKey] || {};

  const basePlayers = useMemo(() => comp.getAllPlayers(), [comp]);

  const effectiveAllPlayers = useMemo(() => {
    if (Object.keys(compOverrides).length === 0) return basePlayers;
    return basePlayers.map((p) =>
      compOverrides[p.id] ? { ...p, teamId: compOverrides[p.id], transferred: true } : p
    );
  }, [basePlayers, compOverrides]);

  const getEffectivePlayersByTeam = useCallback(
    (teamId) => effectiveAllPlayers.filter((p) => p.teamId === teamId),
    [effectiveAllPlayers]
  );

  const transfers = useMemo(() => {
    const byId = Object.fromEntries(basePlayers.map((p) => [p.id, p]));
    const teamById = Object.fromEntries(comp.teams.map((t) => [t.id, t]));
    return Object.entries(compOverrides)
      .map(([playerId, newTeamId]) => {
        const player = byId[playerId];
        if (!player) return null;
        return {
          playerId,
          player,
          fromTeam: teamById[player.teamId],
          toTeam: teamById[newTeamId],
        };
      })
      .filter(Boolean);
  }, [basePlayers, comp, compOverrides]);

  const basePlayersById = useMemo(() => Object.fromEntries(basePlayers.map((p) => [p.id, p])), [basePlayers]);

  // Bir oyuncu, transfer edildikten sonra sürükleyip ORİJİNAL takımına geri
  // bırakılırsa bu bir "yeni transfer" değil, YAPILAN transferin iptalidir --
  // override'ı silip geçmişten de düşürüyoruz (kendi kendine transfer kaydı
  // birikmesin diye).
  const transferPlayer = useCallback(
    (playerId, newTeamId) => {
      const original = basePlayersById[playerId];
      if (original && original.teamId === newTeamId) {
        ctx.undoTransfer(compKey, playerId);
      } else {
        ctx.transferPlayer(compKey, playerId, newTeamId);
      }
    },
    [basePlayersById, ctx, compKey]
  );

  return {
    hasTransfers: transfers.length > 0,
    effectiveAllPlayers,
    getEffectivePlayersByTeam,
    transfers,
    transferPlayer,
    undoTransfer: (playerId) => ctx.undoTransfer(compKey, playerId),
    resetTransfers: () => ctx.resetTransfers(compKey),
  };
}

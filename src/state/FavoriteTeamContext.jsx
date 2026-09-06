import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// UCL/Süper Lig gerçek veri sayfaları için "tuttuğun takım" -- SettingsContext
// ile AYNI mantık (tarayıcıda kalıcı, localStorage) çünkü bu da bir OTURUM
// tercihi değil, kullanıcının genel bir tercihi. CompetitionContext'teki eski
// favoriteTeamId (kura/simülasyon state machine'inin bir parçası, sayfa
// yenilenince sıfırlanır) ile KASITLI OLARAK AYRI -- gerçek veri sayfaları
// CompetitionContext'ten bağımsız (bkz. realStandingsSelectors.js), bu
// context da öyle kalmalı. competitionKey başına ayrı bir takım tutulur
// ({ ucl: "t5", superlig: "s3" }) -- UCL'de tuttuğun takım Süper Lig'deki
// seçimini etkilemez.
const STORAGE_KEY = "futbolSimulatorTutulanTakim";

function loadFavorites() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function persistFavorites(favorites) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    // yok say
  }
}

const FavoriteTeamContext = createContext(null);

export function FavoriteTeamProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => persistFavorites(favorites), [favorites]);

  const setFavoriteTeam = useCallback((competitionKey, teamId) => {
    setFavorites((prev) => ({ ...prev, [competitionKey]: teamId || null }));
  }, []);

  const value = { favorites, setFavoriteTeam };
  return <FavoriteTeamContext.Provider value={value}>{children}</FavoriteTeamContext.Provider>;
}

// competitionKey verilmezse (ör. NavBar, <Routes> dışında olduğundan
// useParams() kullanamıyor) sadece {favorites, setFavoriteTeam} döner --
// çağıran competitionKey'i kendisi (ör. location.pathname'den) belirler.
export function useFavoriteTeam(competitionKey) {
  const ctx = useContext(FavoriteTeamContext);
  if (!ctx) throw new Error("useFavoriteTeam bir <FavoriteTeamProvider> içinde kullanılmalıdır.");
  if (!competitionKey) return ctx;
  return {
    favoriteTeamId: ctx.favorites[competitionKey] || null,
    setFavoriteTeam: (teamId) => ctx.setFavoriteTeam(competitionKey, teamId),
  };
}

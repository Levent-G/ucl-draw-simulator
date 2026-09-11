import { useLocation } from "react-router-dom";
import { COMPETITION_LIST } from "../data/competitions.js";
import { hasRealDataSupport } from "../utils/realStandingsSelectors.js";

const COMPETITION_KEYS = COMPETITION_LIST.map((c) => c.key);

// Sidebar (sol menü) VE üst çubuk (favori takım/eğlence modu) AYRI
// bileşenler ama İKİSİ de "şu an hangi yarışma sayfasındayız, gerçek veri
// destekli mi" bilgisine ihtiyaç duyuyor -- tek bir yerden (bkz. Sidebar.jsx/
// TopBar.jsx) türetilsin diye paylaşılan bir hook.
export function useRealCompetitionRoute() {
  const location = useLocation();
  const matchedCompetitionKey = COMPETITION_KEYS.find((key) => location.pathname.startsWith(`/${key}`));
  const showRealSubNav = Boolean(matchedCompetitionKey && hasRealDataSupport(matchedCompetitionKey));
  return { matchedCompetitionKey, showRealSubNav, pathname: location.pathname };
}

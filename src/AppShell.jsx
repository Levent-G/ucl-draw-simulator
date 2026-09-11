import React, { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import AchievementToasts from "./components/AchievementToasts.jsx";
import WhatsNewModal from "./components/WhatsNewModal.jsx";

// Uygulamanın genel iskeleti: sol menü (Sidebar) + üst çubuk (TopBar) +
// asıl sayfa içeriği. Mobil menü açık/kapalı state'i burada tutulur --
// Sidebar'ın kendi çekmecesini, TopBar'ın hamburger düğmesi açar/kapatır.
export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-root-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <TopBar onBurgerClick={() => setSidebarOpen((o) => !o)} />
        <AchievementToasts />
        <WhatsNewModal />
        {children}
      </div>
    </div>
  );
}

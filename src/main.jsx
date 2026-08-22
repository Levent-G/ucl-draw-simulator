import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { CompetitionProvider } from './state/CompetitionContext.jsx'
import { TeamInjectionProvider } from './state/TeamInjectionContext.jsx'
import { TacticsProvider } from './state/TacticsContext.jsx'
import { TransferProvider } from './state/TransferContext.jsx'
import { DreamTeamProvider } from './state/DreamTeamContext.jsx'
import { SeasonArchiveProvider } from './state/SeasonArchiveContext.jsx'
import { AchievementsProvider } from './state/AchievementsContext.jsx'
import { SettingsProvider } from './state/SettingsContext.jsx'
import { CareerProvider } from './state/CareerContext.jsx'
import NavBar from './components/NavBar.jsx'
import AchievementToasts from './components/AchievementToasts.jsx'
import HomePage from './pages/HomePage.jsx'
import CompetitionHomeRoute from './pages/CompetitionHomeRoute.jsx'
import FixturePage from './pages/FixturePage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import KnockoutPage from './pages/KnockoutPage.jsx'
import MatchCenterPage from './pages/MatchCenterPage.jsx'
import HeadToHeadPage from './pages/HeadToHeadPage.jsx'
import TransferMarketPage from './pages/TransferMarketPage.jsx'
import LiveScoresPage from './pages/LiveScoresPage.jsx'
import DreamTeamPage from './pages/DreamTeamPage.jsx'
import ArchivePage from './pages/ArchivePage.jsx'
import AchievementsPage from './pages/AchievementsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TeamProfilePage from './pages/TeamProfilePage.jsx'
import PlayerProfilePage from './pages/PlayerProfilePage.jsx'
import './index.css'
import './styles/pages.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AchievementsProvider>
        <SettingsProvider>
          <CareerProvider>
            <TeamInjectionProvider>
              <TacticsProvider>
                <CompetitionProvider>
                  <TransferProvider>
                    <DreamTeamProvider>
                      <SeasonArchiveProvider>
                        <NavBar />
                        <AchievementToasts />
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/canli" element={<LiveScoresPage />} />
                          <Route path="/transferler" element={<TransferMarketPage />} />
                          <Route path="/ruya-takim" element={<DreamTeamPage />} />
                          <Route path="/arsiv" element={<ArchivePage />} />
                          <Route path="/basarilar" element={<AchievementsPage />} />
                          <Route path="/ayarlar" element={<SettingsPage />} />
                          <Route path="/:competitionKey" element={<CompetitionHomeRoute />} />
                          <Route path="/:competitionKey/fikstur" element={<FixturePage />} />
                          <Route path="/:competitionKey/mac/:matchId" element={<MatchCenterPage />} />
                          <Route path="/:competitionKey/karsilikli" element={<HeadToHeadPage />} />
                          <Route path="/:competitionKey/istatistik" element={<StatsPage />} />
                          <Route path="/:competitionKey/eleme-turu" element={<KnockoutPage />} />
                          <Route path="/:competitionKey/takim/:teamId" element={<TeamProfilePage />} />
                          <Route path="/:competitionKey/oyuncu/:playerId" element={<PlayerProfilePage />} />
                        </Routes>
                      </SeasonArchiveProvider>
                    </DreamTeamProvider>
                  </TransferProvider>
                </CompetitionProvider>
              </TacticsProvider>
            </TeamInjectionProvider>
          </CareerProvider>
        </SettingsProvider>
      </AchievementsProvider>
    </HashRouter>
  </React.StrictMode>
)

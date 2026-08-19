import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CompetitionProvider } from './state/CompetitionContext.jsx'
import { TeamInjectionProvider } from './state/TeamInjectionContext.jsx'
import { TacticsProvider } from './state/TacticsContext.jsx'
import { TransferProvider } from './state/TransferContext.jsx'
import { DreamTeamProvider } from './state/DreamTeamContext.jsx'
import NavBar from './components/NavBar.jsx'
import CompetitionHomeRoute from './pages/CompetitionHomeRoute.jsx'
import FixturePage from './pages/FixturePage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import KnockoutPage from './pages/KnockoutPage.jsx'
import MatchCenterPage from './pages/MatchCenterPage.jsx'
import HeadToHeadPage from './pages/HeadToHeadPage.jsx'
import TransferMarketPage from './pages/TransferMarketPage.jsx'
import LiveScoresPage from './pages/LiveScoresPage.jsx'
import DreamTeamPage from './pages/DreamTeamPage.jsx'
import './index.css'
import './styles/pages.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <TeamInjectionProvider>
        <TacticsProvider>
          <CompetitionProvider>
            <TransferProvider>
              <DreamTeamProvider>
                <NavBar />
                <Routes>
                  <Route path="/" element={<Navigate to="/ucl" replace />} />
                  <Route path="/canli" element={<LiveScoresPage />} />
                  <Route path="/transferler" element={<TransferMarketPage />} />
                  <Route path="/ruya-takim" element={<DreamTeamPage />} />
                  <Route path="/:competitionKey" element={<CompetitionHomeRoute />} />
                  <Route path="/:competitionKey/fikstur" element={<FixturePage />} />
                  <Route path="/:competitionKey/mac/:matchId" element={<MatchCenterPage />} />
                  <Route path="/:competitionKey/karsilikli" element={<HeadToHeadPage />} />
                  <Route path="/:competitionKey/istatistik" element={<StatsPage />} />
                  <Route path="/:competitionKey/eleme-turu" element={<KnockoutPage />} />
                </Routes>
              </DreamTeamProvider>
            </TransferProvider>
          </CompetitionProvider>
        </TacticsProvider>
      </TeamInjectionProvider>
    </HashRouter>
  </React.StrictMode>
)

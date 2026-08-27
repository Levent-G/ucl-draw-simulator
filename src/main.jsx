import React, { Suspense, lazy } from 'react'
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
import { OnboardingProvider } from './state/OnboardingContext.jsx'
import NavBar from './components/NavBar.jsx'
import AchievementToasts from './components/AchievementToasts.jsx'
import WhatsNewModal from './components/WhatsNewModal.jsx'
import RouteLoading from './components/RouteLoading.jsx'
import './index.css'
import './styles/pages.css'

// Rota bileşenleri lazy-load edilir -- her sayfa (özellikle recharts/
// html2canvas kullanan İstatistikler, Canlı Skorlar, Arşiv, Rüya Takım gibi
// ağır sayfalar) kendi ayrı chunk'ına ayrılır, ilk yüklemede sadece o an
// ziyaret edilen rotanın kodu indirilir.
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const CompetitionHomeRoute = lazy(() => import('./pages/CompetitionHomeRoute.jsx'))
const FixturePage = lazy(() => import('./pages/FixturePage.jsx'))
const StatsPage = lazy(() => import('./pages/StatsPage.jsx'))
const KnockoutPage = lazy(() => import('./pages/KnockoutPage.jsx'))
const MatchCenterPage = lazy(() => import('./pages/MatchCenterPage.jsx'))
const HeadToHeadPage = lazy(() => import('./pages/HeadToHeadPage.jsx'))
const TransferMarketPage = lazy(() => import('./pages/TransferMarketPage.jsx'))
const LiveScoresPage = lazy(() => import('./pages/LiveScoresPage.jsx'))
const DreamTeamPage = lazy(() => import('./pages/DreamTeamPage.jsx'))
const ArchivePage = lazy(() => import('./pages/ArchivePage.jsx'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const TeamProfilePage = lazy(() => import('./pages/TeamProfilePage.jsx'))
const PlayerProfilePage = lazy(() => import('./pages/PlayerProfilePage.jsx'))
const PredictionLeaguePage = lazy(() => import('./pages/PredictionLeaguePage.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <OnboardingProvider>
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
                        <WhatsNewModal />
                        <Suspense fallback={<RouteLoading />}>
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
                            <Route path="/:competitionKey/tahmin-ligi" element={<PredictionLeaguePage />} />
                            <Route path="/:competitionKey/tahmin-ligi/:leagueId" element={<PredictionLeaguePage />} />
                          </Routes>
                        </Suspense>
                      </SeasonArchiveProvider>
                    </DreamTeamProvider>
                  </TransferProvider>
                </CompetitionProvider>
              </TacticsProvider>
            </TeamInjectionProvider>
          </CareerProvider>
        </SettingsProvider>
      </AchievementsProvider>
      </OnboardingProvider>
    </HashRouter>
  </React.StrictMode>
)

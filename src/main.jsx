import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CompetitionProvider } from './state/CompetitionContext.jsx'
import { TransferProvider } from './state/TransferContext.jsx'
import NavBar from './components/NavBar.jsx'
import CompetitionHomeRoute from './pages/CompetitionHomeRoute.jsx'
import FixturePage from './pages/FixturePage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import KnockoutPage from './pages/KnockoutPage.jsx'
import TransferMarketPage from './pages/TransferMarketPage.jsx'
import './index.css'
import './styles/pages.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <CompetitionProvider>
        <TransferProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<Navigate to="/ucl" replace />} />
            <Route path="/transferler" element={<TransferMarketPage />} />
            <Route path="/:competitionKey" element={<CompetitionHomeRoute />} />
            <Route path="/:competitionKey/fikstur" element={<FixturePage />} />
            <Route path="/:competitionKey/istatistik" element={<StatsPage />} />
            <Route path="/:competitionKey/eleme-turu" element={<KnockoutPage />} />
          </Routes>
        </TransferProvider>
      </CompetitionProvider>
    </HashRouter>
  </React.StrictMode>
)

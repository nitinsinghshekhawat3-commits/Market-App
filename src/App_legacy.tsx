/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, Topbar } from './components/Layout';
import { PremiumFeaturesModal } from './components/PremiumFeaturesModal';
import { Login } from './pages_legacy/Login';
import { Dashboard } from './pages_legacy/Dashboard';
import { AssetDetail } from './pages_legacy/AssetDetail';
import { Explore } from './pages_legacy/Explore';
import { Watchlist } from './pages_legacy/Watchlist';
import { News } from './pages_legacy/News';
import { Simulator } from './pages_legacy/Simulator';
import { GlobalSentiment } from './pages_legacy/GlobalSentiment';
import { Profile } from './pages_legacy/Profile';
import { AdvancedLogin } from './pages_legacy/AdvancedLogin';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const { showPremiumModal, setShowPremiumModal, isPro, user, theme } = useApp();

  // If user is not logged in and not on login page, redirect to login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in and on login page, redirect to dashboard
  if (user && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`min-h-screen ${isAuthPage ? 'bg-transparent' : theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-background text-text-rich'}`}>
      {!isAuthPage && <Sidebar />}
      <div className={`${isAuthPage ? 'min-h-screen' : 'flex flex-col min-h-screen'}`}>
        {!isAuthPage && <Topbar />}
        <main className={`${isAuthPage ? '' : 'ml-64 flex-1'}`}>
          <Routes>
            <Route path="/login" element={<AdvancedLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/asset/:symbol" element={<AssetDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/news" element={<News />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/global-sentiment" element={<GlobalSentiment />} />
          </Routes>
        </main>
      </div>

      {/* Global Premium Modal */}
      <PremiumFeaturesModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        isPro={isPro}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

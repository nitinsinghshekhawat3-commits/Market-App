import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';
  const { showPremiumModal, setShowPremiumModal, isPro } = useApp();

  return (
    <div className={`min-h-screen ${isAuthPage ? 'bg-transparent' : 'bg-background'}`}>
      {!isAuthPage && <Sidebar />}
      <div className={`${isAuthPage ? 'min-h-screen' : 'flex flex-col min-h-screen'}`}>
        {!isAuthPage && <Topbar />}
        <main className={`${isAuthPage ? '' : 'ml-64 flex-1'}`}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/asset/:symbol" element={<AssetDetail />} />
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
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

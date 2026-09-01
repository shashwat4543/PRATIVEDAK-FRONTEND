import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ColdStartNotice } from './components/ColdStartNotice';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { MockLoginPage } from './pages/MockLoginPage';
import { NationalDashboard } from './pages/NationalDashboard';
import { MPDirectoryPage } from './pages/MPDirectoryPage';
import { MPProfilePage } from './pages/MPProfilePage';
import { AnomalyFeedPage } from './pages/AnomalyFeedPage';
import { StateExplorerPage } from './pages/StateExplorerPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ShieldAlert, ExternalLink, Heart, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, navigateTo } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <MockLoginPage />;
      case 'national-dashboard':
        return <NationalDashboard />;
      case 'mp-directory':
        return <MPDirectoryPage />;
      case 'mp-profile':
        return <MPProfilePage />;
      case 'anomalies':
        return <AnomalyFeedPage />;
      case 'state-explorer':
        return <StateExplorerPage />;
      case 'review-queue':
        return <ReviewQueuePage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Cold Start Banner */}
      <ColdStartNotice />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2 text-white">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm tracking-tight">
                  Prativedak
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Prativedak is an independent public transparency and algorithmic audit platform for monitoring Members of Parliament Local Area Development Scheme fund utilization across 543 Lok Sabha and 245 Rajya Sabha seats.
              </p>
              <div className="text-[11px] text-slate-500">
                Powered by rule-based deterministic audit models • Zero black-box ML
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                Platform Navigation
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => navigateTo('landing')}
                    className="hover:text-white transition-colors"
                  >
                    Public Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('national-dashboard')}
                    className="hover:text-white transition-colors"
                  >
                    National KPI Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('mp-directory')}
                    className="hover:text-white transition-colors"
                  >
                    Parliamentarian Directory
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('anomalies')}
                    className="hover:text-white transition-colors"
                  >
                    Global Anomaly Stream
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('state-explorer')}
                    className="hover:text-white transition-colors"
                  >
                    State Risk Explorer
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                Audit Specifications
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => navigateTo('mp-profile', { mpId: 286 })}
                    className="hover:text-white transition-colors text-blue-400"
                  >
                    Case Study: Narayan Das Ahirwar (Jalaun)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('login')}
                    className="hover:text-white transition-colors"
                  >
                    Authority Role Login
                  </button>
                </li>
                <li className="text-[11px] text-slate-500 pt-2">
                  Live API: <code className="text-slate-400 font-mono">onrender.com</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Prativedak. Open Data &amp; Transparency Initiative.
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>All 3 Core Audit Rules Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

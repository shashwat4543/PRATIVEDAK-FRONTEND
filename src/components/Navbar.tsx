import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Search,
  UserCheck,
  Building2,
  MapPin,
  Flame,
  LayoutDashboard,
  Users,
  CheckCircle2,
  LogIn,
  LogOut,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  Home,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, userSession, navigateTo, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    switch (userSession.role) {
      case 'district':
        return {
          label: 'District Authority',
          sub: userSession.assignedDistrict || 'District Level',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
      case 'state':
        return {
          label: 'State Nodal Officer',
          sub: userSession.assignedState || 'State HQ',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
        };
      case 'ministry':
        return {
          label: 'Ministry / Admin',
          sub: 'National Oversight',
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
        };
      case 'citizen':
      default:
        return {
          label: 'Citizen Access',
          sub: 'Public Read-Only',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
        };
    }
  };

  const roleInfo = getRoleBadge();

  const handleNavClick = (view: Parameters<typeof navigateTo>[0], params?: Parameters<typeof navigateTo>[1]) => {
    navigateTo(view, params);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top micro-bar for institutional trust & Indian Gov aesthetics */}
      <div className="bg-slate-900 text-slate-300 text-xs px-3 sm:px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center space-x-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-medium text-slate-200 truncate text-[11px] sm:text-xs">
            MPLADS Algorithmic Anomaly Register
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-400">
            MoSPI Transparency
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs shrink-0 pl-2">
          <span className="text-slate-400 hidden xs:inline">API:</span>
          <span className="text-emerald-400 font-semibold">Live v1.0</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div
            id="nav-brand-logo"
            onClick={() => handleNavClick('landing')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0 min-h-[44px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-800 transition-colors">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  MPLADS
                </span>
                <span className="font-medium text-base sm:text-lg text-blue-700">
                  Audit
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide hidden xs:block">
                Anomaly Register
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (md breakpoint and above) */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-link-landing"
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors min-h-[40px] ${
                currentView === 'landing'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-link-dashboard"
              onClick={() => handleNavClick('national-dashboard')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1.5 min-h-[40px] ${
                currentView === 'national-dashboard'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              id="nav-link-mps"
              onClick={() => handleNavClick('mp-directory')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1.5 min-h-[40px] ${
                currentView === 'mp-directory' || currentView === 'mp-profile'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>MP Directory</span>
            </button>
            <button
              id="nav-link-anomalies"
              onClick={() => handleNavClick('anomalies')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1.5 min-h-[40px] ${
                currentView === 'anomalies'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Anomaly Feed</span>
            </button>
            <button
              id="nav-link-states"
              onClick={() => handleNavClick('state-explorer')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1.5 min-h-[40px] ${
                currentView === 'state-explorer'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>State Explorer</span>
            </button>

            {/* Role-only Queue link */}
            {userSession.role !== 'citizen' && (
              <button
                id="nav-link-queue"
                onClick={() => handleNavClick('review-queue')}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center space-x-1.5 min-h-[40px] ${
                  currentView === 'review-queue'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Review Queue</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Active Role Indicator on Desktop */}
            <div
              id="nav-role-badge"
              onClick={() => handleNavClick('login')}
              title="Click to change role"
              className={`hidden sm:flex cursor-pointer px-2.5 py-1.5 rounded-lg border text-xs items-center space-x-1.5 transition-all hover:shadow-xs min-h-[44px] ${roleInfo.bg}`}
            >
              <div className="text-left">
                <div className="font-semibold leading-tight">{roleInfo.label}</div>
                <div className="text-[10px] opacity-75 max-w-[120px] truncate">{userSession.username}</div>
              </div>
            </div>

            {userSession.role === 'citizen' ? (
              <button
                id="nav-btn-login"
                onClick={() => handleNavClick('login')}
                className="inline-flex items-center space-x-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-2.5 rounded-lg transition-colors shadow-xs min-h-[44px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Official Login</span>
                <span className="sm:hidden">Login</span>
              </button>
            ) : (
              <button
                id="nav-btn-logout"
                onClick={logout}
                title="Switch back to citizen view"
                className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2.5 rounded-lg text-xs transition-colors min-h-[44px] min-w-[44px] justify-center"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline font-medium">Exit</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle Button (< md breakpoint) */}
            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] transition-colors border border-slate-200"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900" />
              ) : (
                <Menu className="w-5 h-5 text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Accordion Menu (Visible when open on < md) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-white border-t border-slate-200 shadow-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150"
        >
          {/* User Session Strip */}
          <div
            onClick={() => handleNavClick('login')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer min-h-[48px] ${roleInfo.bg}`}
          >
            <div>
              <span className="text-xs font-bold block">{roleInfo.label}</span>
              <span className="text-[11px] opacity-80 block">{userSession.username}</span>
            </div>
            <div className="text-[11px] font-semibold text-blue-800 underline">
              Switch Role
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('landing')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                currentView === 'landing'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleNavClick('national-dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                currentView === 'national-dashboard'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>National Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleNavClick('mp-directory')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                currentView === 'mp-directory' || currentView === 'mp-profile'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>MP Directory &amp; Search</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleNavClick('anomalies')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                currentView === 'anomalies'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Flame className="w-4 h-4 text-orange-600" />
                <span>Anomaly Feed</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => handleNavClick('state-explorer')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                currentView === 'state-explorer'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span>State Risk Explorer</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {userSession.role !== 'citizen' && (
              <button
                onClick={() => handleNavClick('review-queue')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold min-h-[44px] transition-colors ${
                  currentView === 'review-queue'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Review &amp; Escalation Queue</span>
                </div>
                <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


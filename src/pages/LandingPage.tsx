import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DebugStats, MPListItem } from '../types';
import { FeaturedCaseStudyCard } from '../components/FeaturedCaseStudyCard';
import {
  ShieldAlert,
  Search,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Building2,
  Users,
  CheckCircle2,
  ChevronRight,
  FileText,
  Clock,
  RefreshCw,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [stats, setStats] = useState<DebugStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MPListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const data = await api.getDebugStats();
      setStats(data);
    } catch (err: unknown) {
      setStatsError(err instanceof Error ? err.message : 'Failed to fetch national stats');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchMPs(searchQuery);
        setSearchResults(results.slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigateTo('mp-directory');
    }
  };

  return (
    <div className="w-full space-y-10 sm:space-y-12 pb-16 overflow-x-hidden">
      {/* 1. Hero Section with Search Bar */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-900/60 border border-blue-500/30 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Algorithmic Public Audit Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            MPLADS Anomaly &amp; Fraud Register
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Independent, rule-based oversight of Members of Parliament Local Area Development Scheme funds.
            Detecting duplicate works, uniform allocations, and chronic delays across India.
          </p>

          {/* Quick Search Bar in Hero */}
          <div className="max-w-2xl mx-auto pt-3 sm:pt-4 relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                id="hero-mp-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MP by name or constituency (e.g. Narayan Das Ahirwar, Jalaun)..."
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-xs sm:text-sm font-medium shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all border border-slate-200"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3.5 sm:pr-4 flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </form>

            {/* Instant Search Results Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 text-left overflow-hidden z-30">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Search Matches</span>
                  <span>{searchResults.length} found</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-64 sm:max-h-72 overflow-y-auto">
                    {searchResults.map((mp) => (
                      <button
                        key={mp.id}
                        onClick={() => navigateTo('mp-profile', { mpId: mp.id })}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50/70 transition-colors flex items-center justify-between group min-h-[44px]"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900">
                            {mp.name}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>{mp.constituency}</span>
                            <span>•</span>
                            <span>{mp.state}</span>
                            <span>•</span>
                            <span className="text-slate-400">{mp.party || 'Lok Sabha'}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No MPs found matching &quot;{searchQuery}&quot;. Try searching by constituency or surname.
                    </div>
                  )
                )}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => navigateTo('mp-directory')}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-3"
                  >
                    Open full MP Directory &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hero Quick Navigation CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              id="hero-cta-dashboard"
              onClick={() => navigateTo('national-dashboard')}
              className="w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>National Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-cta-anomalies"
              onClick={() => navigateTo('anomalies')}
              className="w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center space-x-2"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Explore Anomaly Feed</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. National Summary KPI Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live National Dataset Telemetry
              </h2>
            </div>
            {statsError ? (
              <button
                onClick={fetchStats}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium min-h-[32px]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
              </button>
            ) : (
              <span className="text-[11px] sm:text-xs text-slate-400">
                National Audit Database
              </span>
            )}
          </div>

          {loadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 h-24 rounded-lg"></div>
              ))}
            </div>
          ) : statsError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{statsError}. The live backend might be waking up.</span>
              <button
                onClick={fetchStats}
                className="px-3 py-1.5 bg-red-600 text-white rounded font-bold min-h-[44px]"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Projects */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Total Works Logged
                  </span>
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono">
                  {stats?.totalProjectsInDB !== undefined && stats?.totalProjectsInDB !== null
                    ? stats.totalProjectsInDB.toLocaleString('en-IN')
                    : '53,162'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Civil, infrastructure &amp; community works
                </div>
              </div>

              {/* Total Flagged Anomalies */}
              <div className="bg-orange-50/70 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between text-orange-800 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Flagged Anomalies
                  </span>
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-orange-900 font-mono">
                  {stats?.totalAnomaliesInDB?.toLocaleString('en-IN') || '6,300+'}
                </div>
                <div className="text-[11px] text-orange-700 mt-1">
                  Algorithmic risk triggers detected
                </div>
              </div>

              {/* Duplicate Works */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Duplicate Proposals
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono">
                  {stats?.anomalyTypeBreakdown?.DUPLICATE_WORK_PROPOSAL?.toLocaleString('en-IN') ||
                    '4,469'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Identical titles &amp; amounts flagged
                </div>
              </div>

              {/* Uniform Sums */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Uniform Allocations
                  </span>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono">
                  {stats?.anomalyTypeBreakdown?.SUSPICIOUS_UNIFORM_ALLOCATION?.toLocaleString(
                    'en-IN'
                  ) || '1,799'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Repetitive round sums flagged
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured Case Study: Algorithmic Duplicate Detection in Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedCaseStudyCard />
      </section>

      {/* 4. Role-Oriented Action Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 p-5 sm:p-8 rounded-2xl border border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Role-Oriented Action Shortcuts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Jump straight to workflows built for citizens, district planning authorities, and state oversight officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Citizen Transparency Shortcut */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                  Citizen &amp; Public Transparency
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Search your local MP, inspect project execution speeds, and verify constituency fund utilization.
                </p>
              </div>
              <button
                onClick={() => navigateTo('mp-directory')}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <span>Search MP Directory</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* District Planning Authority Shortcut */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                  District Planning Authority
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Triage flagged local civil works, verify agency records, escalate duplicate proposals, or mark resolved.
                </p>
              </div>
              <button
                onClick={() => navigateTo('review-queue')}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <span>Open Review Queue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* State & Ministry Nodal Shortcut */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-800 mb-3">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                  State &amp; Ministry Oversight
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Compare cross-state anomaly distributions, monitor high-risk constituencies, and review escalated dockets.
                </p>
              </div>
              <button
                onClick={() => navigateTo('state-explorer')}
                className="w-full py-2.5 px-4 bg-purple-800 hover:bg-purple-900 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <span>Explore State Risk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

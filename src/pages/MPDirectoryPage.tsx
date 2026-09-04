import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, resolveFeaturedMPId } from '../services/api';
import { MPListItem } from '../types';
import {
  FEATURED_MP_NAME,
  FEATURED_MP_CONSTITUENCY,
  FEATURED_MP_STATE,
  FEATURED_MP_HOUSE,
} from '../data/featuredCaseStudyData';
import {
  Search,
  Users,
  RefreshCw,
  ChevronRight as ArrowIcon,
  Flame,
} from 'lucide-react';

export const MPDirectoryPage: React.FC = () => {
  const { navigateTo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [mps, setMps] = useState<MPListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenFeaturedCaseStudy = async () => {
    const id = await resolveFeaturedMPId();
    if (id) {
      navigateTo('mp-profile', { mpId: id });
    } else {
      setSearchQuery(FEATURED_MP_NAME);
    }
  };

  // Debounced search trigger: Only fire search if query length >= 2
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setMps([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await api.searchMPs(trimmed);
        setMps(results);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to search MP directory');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setMps([]);
    setError(null);
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Prativedak Parliamentary Roster
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Members of Parliament Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search and audit MPLADS fund allocations, works history, and anomaly telemetry for Indian MPs.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3.5 py-2.5 rounded-lg shadow-xs self-start md:self-auto">
          <Users className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {searchQuery.trim().length >= 2 ? (
              <>
                Matches: <strong className="font-mono text-slate-900">{mps.length}</strong> MPs
              </>
            ) : (
              <span>National Roster Search</span>
            )}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="mp-directory-search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by MP name or constituency (e.g. Narayan Das Ahirwar, Jalaun)..."
            className="w-full pl-10 pr-20 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[44px]"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-700 font-semibold min-w-[44px] justify-center"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Featured Quick Case Study Banner */}
      <div
        onClick={handleOpenFeaturedCaseStudy}
        className="bg-orange-50/80 border border-orange-200 hover:border-orange-300 rounded-xl p-4 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-xs"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-orange-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            NDA
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-slate-900 group-hover:text-orange-900">
                {FEATURED_MP_NAME}
              </span>
              <span className="text-[10px] font-semibold bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-700" />
                <span>Prime Case Study • DUPLICATE_WORK_PROPOSAL</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {FEATURED_MP_CONSTITUENCY} Constituency • {FEATURED_MP_STATE} • {FEATURED_MP_HOUSE} • 85 of 86 Works Flagged (98.8%)
            </p>
          </div>
        </div>
        <button className="min-h-[44px] text-xs font-bold text-orange-900 group-hover:underline flex items-center gap-1 shrink-0">
          <span>Audit Duplicate Cluster</span>
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Default State: Query has < 2 characters */}
        {searchQuery.trim().length < 2 ? (
          <div className="p-8 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-100">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-800">Search for an MP above</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter at least 2 characters of an MP&apos;s name or constituency to search the parliamentary directory.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick searches:</span>
              {['Rajnath Singh', 'Lucknow', 'Varanasi', 'Akhilesh Yadav', 'Maharashtra'].map((sug) => (
                <button
                  key={sug}
                  onClick={() => setSearchQuery(sug)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md font-medium text-xs transition-colors border border-slate-200 min-h-[32px]"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="p-6 sm:p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-red-600 font-medium">{error}</p>
            <button
              onClick={() => {
                const trimmed = searchQuery.trim();
                if (trimmed.length >= 2) {
                  setLoading(true);
                  setError(null);
                  api.searchMPs(trimmed)
                    .then((res) => setMps(res))
                    .catch((err) => setError(err instanceof Error ? err.message : 'Error searching'))
                    .finally(() => setLoading(false));
                }
              }}
              className="min-h-[44px] px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold"
            >
              Retry Search
            </button>
          </div>
        ) : mps.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Parliamentarians Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No MP matches &quot;{searchQuery}&quot;. Please try a different spelling or constituency name.
            </p>
            <button
              onClick={handleClearSearch}
              className="min-h-[44px] mt-2 px-4 py-2 bg-blue-900 text-white text-xs rounded-lg font-medium"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">MP Name</th>
                    <th className="py-3 px-4">Constituency</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">House</th>
                    <th className="py-3 px-4 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mps.map((mp) => (
                    <tr
                      key={mp.id}
                      onClick={() => navigateTo('mp-profile', { mpId: mp.id })}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-900 text-sm">
                          {mp.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{mp.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {mp.constituency || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {mp.state || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px] border border-slate-200">
                          {mp.party || 'Lok Sabha'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-900 inline-flex items-center gap-1">
                          <span>Inspect Profile</span>
                          <ArrowIcon className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {mps.map((mp) => (
                <div
                  key={mp.id}
                  onClick={() => navigateTo('mp-profile', { mpId: mp.id })}
                  className="p-4 space-y-2 hover:bg-blue-50/50 cursor-pointer active:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{mp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: #{mp.id}</div>
                    </div>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                      {mp.party || 'Lok Sabha'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Constituency</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {mp.constituency || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">State</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {mp.state || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-blue-700">
                    <span>Audit Anomaly Status</span>
                    <span className="flex items-center gap-1">
                      <span>Inspect Profile</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

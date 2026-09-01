import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AnomalyItem } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { formatDate, getRuleName } from '../utils/formatters';
import {
  Flame,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  User,
  FileText,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export const AnomalyFeedPage: React.FC = () => {
  const { navigateTo } = useApp();

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [ruleFilter, setRuleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cleanly pass active filters if any (no empty strings, 'ALL', or 'null')
      const activeFilters: { severity?: string; ruleCode?: string; query?: string } = {};
      if (severityFilter && severityFilter !== 'ALL' && severityFilter !== 'null' && severityFilter.trim() !== '') {
        activeFilters.severity = severityFilter.trim();
      }
      if (ruleFilter && ruleFilter !== 'ALL' && ruleFilter !== 'null' && ruleFilter.trim() !== '') {
        activeFilters.ruleCode = ruleFilter.trim();
      }
      if (searchQuery && searchQuery.trim() !== '' && searchQuery !== 'null') {
        activeFilters.query = searchQuery.trim();
      }

      const response = await api.getGlobalAnomalies(currentPage, pageSize, activeFilters);
      setAnomalies(response.items || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch global anomaly feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, [currentPage, severityFilter, ruleFilter]);

  // Client-side filtering across the items for instant text search
  const filteredAnomalies = anomalies.filter((a) => {
    if (severityFilter && severityFilter !== 'ALL' && severityFilter !== 'null') {
      if (a.severity?.toUpperCase() !== severityFilter.toUpperCase()) {
        return false;
      }
    }
    if (ruleFilter && ruleFilter !== 'ALL' && ruleFilter !== 'null') {
      if (a.ruleCode !== ruleFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const descMatch = a.description?.toLowerCase().includes(q);
      const ruleMatch = a.ruleCode?.toLowerCase().includes(q);
      const mpIdMatch = a.relatedMpId?.toString().includes(q);
      const prjIdMatch = a.relatedProjectId?.toString().includes(q);
      if (!descMatch && !ruleMatch && !mpIdMatch && !prjIdMatch) return false;
    }
    return true;
  });

  const handleResetFilters = () => {
    setSeverityFilter('ALL');
    setRuleFilter('ALL');
    setSearchQuery('');
    setCurrentPage(0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
              Prativedak Audit Stream
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Algorithmic Anomaly Feed
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chronological register of all 6,300+ algorithmically flagged project anomalies across India.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={loadAnomalies}
            className="min-h-[44px] px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anomalies by description, MP ID or Project ID..."
            className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Severity Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs flex-1 sm:flex-initial">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">HIGH (Duplicates)</option>
              <option value="MEDIUM">MEDIUM (Delays / Uniform)</option>
            </select>
          </div>

          {/* Rule Type Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs flex-1 sm:flex-initial">
            <span className="text-slate-500 font-medium">Rule:</span>
            <select
              value={ruleFilter}
              onChange={(e) => {
                setRuleFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto max-w-[200px]"
            >
              <option value="ALL">All Detection Rules</option>
              <option value="DUPLICATE_WORK_PROPOSAL">Duplicate Proposals</option>
              <option value="SUSPICIOUS_UNIFORM_ALLOCATION">Uniform Allocations</option>
              <option value="PROJECT_CHRONIC_DELAY">Chronic Delays</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomaly Feed List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
            <button
              onClick={loadAnomalies}
              className="min-h-[44px] px-4 py-2 bg-blue-900 text-white rounded text-xs font-semibold"
            >
              Retry Loading Feed
            </button>
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2">
            <Flame className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Anomalies Matched</h3>
            <p className="text-xs text-slate-500">
              No flagged anomalies match your filter selections on this page.
            </p>
            <button
              onClick={handleResetFilters}
              className="min-h-[44px] mt-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={anom.severity} />
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {getRuleName(anom.ruleCode)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Rule Code: {anom.ruleCode}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {anom.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 pt-1">
                    {anom.relatedMpId && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          MP ID: <strong className="font-mono text-slate-700">#{anom.relatedMpId}</strong>
                        </span>
                      </div>
                    )}
                    {anom.relatedProjectId && (
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Project ID: <strong className="font-mono text-slate-700">#{anom.relatedProjectId}</strong>
                        </span>
                      </div>
                    )}
                    {anom.detectedAt && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Detected: {formatDate(anom.detectedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => navigateTo('mp-profile', { mpId: anom.relatedMpId })}
                    className="min-h-[44px] px-3.5 py-2 bg-blue-50 text-blue-900 hover:bg-blue-900 hover:text-white border border-blue-200 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 shadow-xs"
                  >
                    <span>Inspect MP Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Anomaly #{anom.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 text-center sm:text-left">
              Showing page <strong className="text-slate-900 font-mono">{currentPage + 1}</strong> of{' '}
              <strong className="text-slate-900 font-mono">{totalPages}</strong> ({totalElements} items total)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 0 || loading}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="min-h-[44px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                disabled={currentPage >= totalPages - 1 || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="min-h-[44px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

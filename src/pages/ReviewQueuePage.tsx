import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AnomalyItem, ReviewStatus } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { formatDate, getRuleName } from '../utils/formatters';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Info,
  Clock,
  Lock,
} from 'lucide-react';

export const ReviewQueuePage: React.FC = () => {
  const { userSession, navigateTo, takeReviewAction, getProjectReviewStatus, reviewActions } = useApp();

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getGlobalAnomalies(0, 30);
      setAnomalies(response.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items by status in session
  const categorizedItems = anomalies.map((item) => ({
    ...item,
    sessionStatus: getProjectReviewStatus(item.relatedProjectId),
  }));

  const displayedItems = categorizedItems.filter(
    (item) => item.sessionStatus === activeTab
  );

  const pendingCount = categorizedItems.filter((i) => i.sessionStatus === 'pending').length;
  const escalatedCount = Object.values(reviewActions).filter((a) => (a as { status: string }).status === 'escalated').length;
  const resolvedCount = Object.values(reviewActions).filter((a) => (a as { status: string }).status === 'resolved').length;

  if (userSession.role === 'citizen') {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Administrative Review Queue Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The Flagged Project Review Queue is restricted to District Planning Authorities, State Nodal Officers, and Ministry Auditors.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => navigateTo('login')}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
          >
            Switch to Official Role (Demo Login)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Prativedak Authority Triage Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Flagged Project Review &amp; Escalation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official docket for triaging high-severity duplicate proposals and executing audit actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700">
            Logged as: <strong className="text-slate-900">{userSession.username}</strong>
          </div>
          <button
            onClick={loadData}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh queue"
            aria-label="Refresh review queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mandatory PRD Disclaimer Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start space-x-3 shadow-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Session State Notice: </strong>
          <span>
            Actions in this queue are demo-only and reset on refresh — backend persistence is a planned next step.
          </span>
        </div>
      </div>

      {/* Queue Tabs (Wrap cleanly on mobile) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'pending'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
          <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('escalated')}
          className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'escalated'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Escalated to State</span>
          <span className="bg-purple-100 text-purple-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {escalatedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'resolved'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Marked Resolved</span>
          <span className="bg-emerald-100 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* Review Queue Items */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">
            {error}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              No Items in {activeTab.toUpperCase()} Queue
            </h3>
            <p className="text-xs text-slate-500">
              {activeTab === 'pending'
                ? 'All current flagged items have been triaged in this session.'
                : `No projects currently marked as ${activeTab}.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedItems.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Project #{item.relatedProjectId}
                    </span>
                    <SeverityBadge severity={item.severity} size="sm" />
                    <span className="text-xs font-bold text-slate-900">
                      {getRuleName(item.ruleCode)}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Trigger #{item.id}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-500">
                    <button
                      onClick={() => navigateTo('mp-profile', { mpId: item.relatedMpId })}
                      className="min-h-[44px] text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 flex items-center"
                    >
                      Inspect MP Record #{item.relatedMpId}
                    </button>
                    {item.detectedAt && (
                      <span className="text-[11px]">Detected: {formatDate(item.detectedAt)}</span>
                    )}
                  </div>

                  {/* Actions for Pending */}
                  {item.sessionStatus === 'pending' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => takeReviewAction(item.relatedProjectId, 'escalated')}
                        className="min-h-[44px] px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                      >
                        Escalate to State Authority
                      </button>
                      <button
                        onClick={() => takeReviewAction(item.relatedProjectId, 'resolved')}
                        className="min-h-[44px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}

                  {/* Badges for already processed */}
                  {item.sessionStatus === 'escalated' && (
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                      Escalated by {userSession.role.toUpperCase()}
                    </span>
                  )}
                  {item.sessionStatus === 'resolved' && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      Resolved in Session
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

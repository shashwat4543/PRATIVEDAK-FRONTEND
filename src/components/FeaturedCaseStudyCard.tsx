import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { FlaggedProjectItem, MPDashboardData } from '../types';
import {
  FEATURED_MP_ID,
  FEATURED_MP_NAME,
  FEATURED_MP_CONSTITUENCY,
  FEATURED_MP_STATE,
  FEATURED_MP_HOUSE,
  FEATURED_MP_PARTY,
  FEATURED_WORK_DESC,
  FEATURED_WORK_AMOUNT,
  FEATURED_MP_DASHBOARD,
  FEATURED_MP_PROJECTS,
} from '../data/featuredCaseStudyData';
import {
  Copy,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Flame,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Building,
  Sparkles,
} from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

export const FeaturedCaseStudyCard: React.FC = () => {
  const { navigateTo, openRuleExplainer } = useApp();
  const [dashboard, setDashboard] = useState<MPDashboardData>(FEATURED_MP_DASHBOARD);
  const [projects, setProjects] = useState<FlaggedProjectItem[]>(FEATURED_MP_PROJECTS.slice(0, 4));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadFeaturedData = async () => {
      try {
        const [dashData, projData] = await Promise.all([
          api.getMPDashboard(FEATURED_MP_ID),
          api.getMPProjects(FEATURED_MP_ID, 0, 4),
        ]);
        if (mounted) {
          if (dashData && dashData.name) {
            setDashboard(dashData);
          }
          if (projData && projData.items && projData.items.length > 0) {
            setProjects(projData.items);
          }
        }
      } catch {
        // Fallback already initialized in state
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadFeaturedData();
    return () => {
      mounted = false;
    };
  }, []);

  const totalWorks = dashboard.totalWorksCount || 86;
  const duplicateCount = dashboard.duplicateCount || 85;
  const duplicatePercent = ((duplicateCount / totalWorks) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border-2 border-orange-200/80 shadow-xl overflow-hidden">
      {/* Top Highlight Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
            <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
          </span>
          <div className="text-xs sm:text-sm font-bold tracking-wide uppercase">
            Featured Case Study: Algorithmic Duplicate Detection in Action
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-white text-orange-900 font-extrabold text-[11px] rounded-full shadow-xs">
            Rule: DUPLICATE_WORK_PROPOSAL
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-8 space-y-6">
        {/* MP Profile Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white flex items-center justify-center text-xl font-bold font-mono shrink-0 shadow-md">
              NDA
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {FEATURED_MP_NAME}
                </h3>
                <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                  98.8% Duplicate Flags
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-900">{FEATURED_MP_CONSTITUENCY}</span>
                </div>
                <span>•</span>
                <span>{FEATURED_MP_STATE}</span>
                <span>•</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                  {FEATURED_MP_HOUSE} ({FEATURED_MP_PARTY})
                </span>
                <span>•</span>
                <span className="text-slate-400 font-mono">MP ID #{FEATURED_MP_ID}</span>
              </div>
            </div>
          </div>

          {/* Quick Anomaly Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch lg:self-auto">
            <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                Duplicate Proposals
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-orange-900 font-mono mt-0.5">
                85 / 86
              </div>
              <div className="text-[10px] text-orange-600 font-medium">{duplicatePercent}% of works</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ticket Sum
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                ₹2,60,000
              </div>
              <div className="text-[10px] text-slate-500">Exact match repeated</div>
            </div>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                Risk Score
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-red-700 font-mono mt-0.5">
                98.8 / 100
              </div>
              <div className="text-[10px] text-red-600 font-bold">HIGH RISK</div>
            </div>
          </div>
        </div>

        {/* Narrative Box: The Audit Finding */}
        <div className="bg-amber-50/70 rounded-xl p-4 sm:p-5 border border-amber-200/90 text-xs sm:text-sm text-slate-800 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-amber-900 text-sm sm:text-base">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
            <span>The Finding: 85 Repeated Proposals for &ldquo;{FEATURED_WORK_DESC}&rdquo;</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            In Jalaun constituency (Uttar Pradesh), MP <strong>Narayan Das Ahirwar</strong> has{' '}
            <strong className="text-amber-950">85 out of 86 total works</strong> logged with the exact same
            work description (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900 font-semibold">{FEATURED_WORK_DESC}</code>)
            and the exact identical sanction sum of{' '}
            <strong className="text-amber-950 font-mono">₹2,60,000.00</strong> (totaling ₹2.21+ Crore).
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => openRuleExplainer('DUPLICATE_WORK_PROPOSAL')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How DUPLICATE_WORK_PROPOSAL detection works</span>
            </button>
            <span className="text-amber-300">•</span>
            <button
              onClick={() => openRuleExplainer('SUSPICIOUS_UNIFORM_ALLOCATION')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why uniform ₹2,60,000 round-sums trigger audit</span>
            </button>
          </div>
        </div>

        {/* Duplicate Sample Cluster List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Copy className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Sample Duplicate Proposal Cluster (Showing 4 of 85 identical works)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              85 total matching entries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((proj, idx) => (
              <div
                key={proj.id || idx}
                className="bg-slate-50 hover:bg-orange-50/40 p-3.5 rounded-xl border border-slate-200 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">
                    {proj.workId || `UP-JLN-2024-000${idx + 1}`}
                  </span>
                  <SeverityBadge severity="HIGH" />
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">
                  {proj.title}
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-medium">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>UP Electrification Corp</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹2,60,000
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Audit engine flagged 85 cluster dockets ready for district authority review.
          </div>
          <button
            id="featured-case-study-cta"
            onClick={() => navigateTo('mp-profile', { mpId: FEATURED_MP_ID })}
            className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <span>Audit Narayan Das Ahirwar&apos;s Full Profile &amp; 86 Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

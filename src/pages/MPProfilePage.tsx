import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  AnomalyItem,
  FlaggedProjectItem,
  MPDashboardData,
} from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { SeverityBadge } from '../components/SeverityBadge';
import { formatCompactINR, formatDate, formatINR, getRuleName } from '../utils/formatters';
import {
  MapPin,
  FileText,
  Flame,
  AlertTriangle,
  Percent,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  RefreshCw,
  Clock,
  IndianRupee,
  Layers,
} from 'lucide-react';

interface AuditFindingData {
  hasAnomalies: boolean;
  title: string;
  ruleBadge: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  metrics: string[];
}

function generateAuditFinding(
  dashboard: MPDashboardData,
  anomalies: AnomalyItem[],
  projects: FlaggedProjectItem[]
): AuditFindingData {
  if (!anomalies || anomalies.length === 0) {
    return {
      hasAnomalies: false,
      title: 'Audit Finding: No Active Anomaly Flags',
      ruleBadge: 'CLEAN_RECORD',
      severity: 'LOW',
      description: `No significant anomaly pattern detected for this MP. All ${dashboard.totalWorksCount || 0} registered works comply with scheme execution guidelines with no duplicate proposals or irregular allocation clusters.`,
      metrics: [
        '0 Active Anomaly Flags',
        `${dashboard.totalWorksCount || 0} Registered Works`,
        '0.0% Anomaly Rate',
        'Verified Compliant',
      ],
    };
  }

  const anomaliesByRule: Record<string, AnomalyItem[]> = {};
  for (const a of anomalies) {
    if (!anomaliesByRule[a.ruleCode]) anomaliesByRule[a.ruleCode] = [];
    anomaliesByRule[a.ruleCode].push(a);
  }

  const severityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const rules = Object.keys(anomaliesByRule).sort((rA, rB) => {
    const listA = anomaliesByRule[rA];
    const listB = anomaliesByRule[rB];
    const maxSevA = Math.max(...listA.map((a) => severityWeight[a.severity] || 1));
    const maxSevB = Math.max(...listB.map((a) => severityWeight[a.severity] || 1));
    if (maxSevA !== maxSevB) return maxSevB - maxSevA;
    return listB.length - listA.length;
  });

  const primaryRule = rules[0];
  const primaryAnomalies = anomaliesByRule[primaryRule] || [];
  const count = primaryAnomalies.length;
  const totalWorks = dashboard.totalWorksCount || count;
  const percentage = totalWorks > 0 ? ((count / totalWorks) * 100).toFixed(1) : '0.0';

  if (primaryRule === 'DUPLICATE_WORK_PROPOSAL') {
    const flaggedProj = projects.find(
      (p) => p.flagged && p.anomalies?.some((a) => a.ruleCode === 'DUPLICATE_WORK_PROPOSAL')
    )?.project;
    const sampleTitle = flaggedProj?.title;
    let ticketAmount = flaggedProj?.sanctionedAmount;

    if (!ticketAmount) {
      for (const a of primaryAnomalies) {
        const match = a.description?.match(/₹\s*([0-9.]+)/);
        if (match) {
          ticketAmount = parseFloat(match[1]);
          break;
        }
      }
    }

    const totalClusterVal = ticketAmount ? ticketAmount * count : null;

    let desc = `${count} out of ${totalWorks} projects registered under MP ${dashboard.name} (${dashboard.constituency || 'Constituency'}, ${dashboard.state || 'State'}) have been flagged for duplicate proposal patterns`;
    if (sampleTitle) {
      desc += ` ("${sampleTitle}")`;
    }
    if (ticketAmount) {
      desc += ` with uniform sanction sums of ${formatINR(ticketAmount)}`;
    }
    desc += ` (${percentage}% of all recorded works).`;
    if (totalClusterVal) {
      desc += ` This cluster represents ${formatCompactINR(totalClusterVal)} in flagged allocations requiring priority administrative review.`;
    }

    return {
      hasAnomalies: true,
      title: 'Audit Finding: High-Density Duplicate Work Proposal Cluster',
      ruleBadge: 'DUPLICATE_WORK_PROPOSAL',
      severity: 'HIGH',
      description: desc,
      metrics: [
        `${count} Duplicate Proposals Flagged`,
        ticketAmount ? `${formatCompactINR(ticketAmount)} Ticket Size` : `${count} Affected Works`,
        `${percentage}% Anomaly Rate`,
        totalClusterVal ? `${formatCompactINR(totalClusterVal)} Flagged Value` : null,
      ].filter(Boolean) as string[],
    };
  }

  if (primaryRule === 'PROJECT_CHRONIC_DELAY') {
    const sampleDesc = primaryAnomalies[0]?.description || '';
    const desc = `${count} project(s) registered under MP ${dashboard.name} (${dashboard.constituency || 'Constituency'}, ${dashboard.state || 'State'}) exhibit chronic execution delays, remaining stalled in recommended or pending status significantly beyond scheme delivery benchmark timelines.${sampleDesc ? ` Example: ${sampleDesc}.` : ''}`;

    return {
      hasAnomalies: true,
      title: 'Audit Finding: Chronic Project Execution Delays',
      ruleBadge: 'PROJECT_CHRONIC_DELAY',
      severity: 'MEDIUM',
      description: desc,
      metrics: [
        `${count} Chronic Delay Flags`,
        `${percentage}% Delayed Project Rate`,
        dashboard.completionRate != null
          ? `${Number(dashboard.completionRate).toFixed(1)}% Scheme Completion`
          : 'Delayed Status',
        dashboard.unspentAmount ? `${formatCompactINR(dashboard.unspentAmount)} Unspent Fund` : null,
      ].filter(Boolean) as string[],
    };
  }

  if (primaryRule === 'SUSPICIOUS_UNIFORM_ALLOCATION') {
    let ticketAmount: number | null = null;
    for (const a of primaryAnomalies) {
      const match = a.description?.match(/₹\s*([0-9.]+)/);
      if (match) {
        ticketAmount = parseFloat(match[1]);
        break;
      }
    }
    const desc = `${count} work proposal(s) registered under MP ${dashboard.name} (${dashboard.constituency || 'Constituency'}, ${dashboard.state || 'State'}) share identical uniform non-standard financial allocations${ticketAmount ? ` of ${formatINR(ticketAmount)}` : ''}, triggering algorithmic risk indicators for tender splitting or repetitive budget sizing.`;

    return {
      hasAnomalies: true,
      title: 'Audit Finding: Suspicious Uniform Fund Allocation Cluster',
      ruleBadge: 'SUSPICIOUS_UNIFORM_ALLOCATION',
      severity: 'MEDIUM',
      description: desc,
      metrics: [
        `${count} Uniform Allocations Flagged`,
        ticketAmount ? `${formatCompactINR(ticketAmount)} Ticket Size` : 'Uniform Sums',
        `${percentage}% Anomaly Share`,
      ].filter(Boolean) as string[],
    };
  }

  return {
    hasAnomalies: true,
    title: `Audit Finding: ${getRuleName(primaryRule)} Pattern Detected`,
    ruleBadge: primaryRule,
    severity: (primaryAnomalies[0]?.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
    description: `${count} work(s) registered under MP ${dashboard.name} (${dashboard.constituency || 'Constituency'}, ${dashboard.state || 'State'}) have been flagged under algorithmic rule '${getRuleName(primaryRule)}'. ${primaryAnomalies[0]?.description || ''}`,
    metrics: [
      `${count} Flags Detected`,
      `${percentage}% Anomaly Rate`,
    ],
  };
}

export const MPProfilePage: React.FC = () => {
  const { selectedMpId, navigateTo, userSession, takeReviewAction, getProjectReviewStatus } = useApp();

  const [mpId, setMpId] = useState<number>(selectedMpId || 191);
  const [dashboard, setDashboard] = useState<MPDashboardData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [projects, setProjects] = useState<FlaggedProjectItem[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination state for projects
  const [filterType, setFilterType] = useState<'all' | 'flagged' | 'duplicates' | 'delays' | 'uniform'>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('id');

  // Load Dashboard Data
  const loadDashboard = async (targetId: number) => {
    setLoadingDashboard(true);
    setError(null);
    try {
      const data = await api.getMPDashboard(targetId);
      setDashboard(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch MP dashboard details');
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Load Anomalies for this MP
  const loadAnomalies = async (targetId: number) => {
    setLoadingAnomalies(true);
    try {
      const items = await api.getMPAnomalies(targetId);
      setAnomalies(items || []);
    } catch {
      setAnomalies([]);
    } finally {
      setLoadingAnomalies(false);
    }
  };

  // Load Projects
  const loadProjects = async (targetId: number, page: number, sort: string) => {
    setLoadingProjects(true);
    try {
      const response = await api.getMPProjects(targetId, page, pageSize, sort);
      setProjects(response.items || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 1);
    } catch {
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // When MP ID changes, clear stale data immediately and load fresh MP data
  useEffect(() => {
    const target = selectedMpId || 191;
    setMpId(target);
    setDashboard(null);
    setAnomalies([]);
    setProjects([]);
    setError(null);
    setCurrentPage(0);

    loadDashboard(target);
    loadAnomalies(target);
  }, [selectedMpId]);

  // Load projects on page or sort change
  useEffect(() => {
    const target = selectedMpId || 191;
    loadProjects(target, currentPage, sortBy);
  }, [selectedMpId, currentPage, sortBy]);

  // Compute dynamic audit finding based on actual API data
  const auditFinding = useMemo(() => {
    if (!dashboard) return null;
    return generateAuditFinding(dashboard, anomalies, projects);
  }, [dashboard, anomalies, projects]);

  // Client-side filtering on current page projects if filter chips are used
  const filteredProjects = projects.filter((item) => {
    // Search query
    if (projectSearch.trim()) {
      const term = projectSearch.toLowerCase();
      const titleMatch = item.project?.title?.toLowerCase().includes(term);
      const codeMatch = item.project?.projectCode?.toLowerCase().includes(term);
      const agencyMatch = item.project?.agencyName?.toLowerCase().includes(term);
      if (!titleMatch && !codeMatch && !agencyMatch) return false;
    }

    if (filterType === 'flagged') return item.flagged;
    if (filterType === 'duplicates') {
      return item.anomalies?.some((a) => a.ruleCode === 'DUPLICATE_WORK_PROPOSAL');
    }
    if (filterType === 'delays') {
      return item.anomalies?.some((a) => a.ruleCode === 'PROJECT_CHRONIC_DELAY');
    }
    if (filterType === 'uniform') {
      return item.anomalies?.some((a) => a.ruleCode === 'SUSPICIOUS_UNIFORM_ALLOCATION');
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Back Button & Navigation context */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateTo('mp-directory')}
            className="min-h-[44px] inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to MP Directory</span>
          </button>
          <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
            Prativedak MP Audit Dossier
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadDashboard(mpId);
              loadProjects(mpId, currentPage, sortBy);
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
            title="Refresh record"
            aria-label="Refresh MP profile data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDashboard || loadingProjects ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loadingDashboard && !dashboard ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Failed to load MP Profile</h3>
          <p className="text-xs text-red-700">{error}</p>
          <button
            onClick={() => loadDashboard(mpId)}
            className="min-h-[44px] px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        dashboard && (
          <>
            {/* MP Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                {/* Left Profile Details */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center text-lg sm:text-xl font-bold font-mono shrink-0 shadow-md">
                    {dashboard.name
                      ?.split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'MP'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {dashboard.name}
                      </h1>
                      {dashboard.totalAnomalies > 0 || anomalies.length > 0 ? (
                        <span className="bg-orange-100 text-orange-900 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border border-orange-200 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-600" />
                          <span>Flagged Audit Profile • {auditFinding?.ruleBadge || 'ANOMALY_FLAGGED'}</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-900 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Clean Audit Record</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-2 font-medium">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-900">
                          {dashboard.constituency}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{dashboard.state}</span>
                      <span>•</span>
                      {/* Labeled House, NOT Party per Section 8.2 */}
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {dashboard.party || 'Lok Sabha'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 font-mono">ID: #{dashboard.id}</span>
                    </div>
                  </div>
                </div>

                {/* Quick high-level summary badge */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 shrink-0 text-left lg:text-right self-stretch lg:self-auto">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Flagged Anomaly Ratio
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-orange-600 mt-0.5">
                    {dashboard.totalAnomalies} / {dashboard.totalWorksCount} Works
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {dashboard.totalWorksCount > 0
                      ? `${((dashboard.totalAnomalies / dashboard.totalWorksCount) * 100).toFixed(1)}% of works flagged`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Gauge & Core Financial KPI Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Col: The WOW Feature - Risk Score Gauge */}
              <div className="lg:col-span-1">
                <RiskGauge dashboard={dashboard} size="lg" />
              </div>

              {/* Right 2 Cols: Financial & Execution KPI Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Total Works */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Total Works
                    </span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {dashboard.totalWorksCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Logged in scheme portal
                  </div>
                </div>

                {/* Total Anomalies */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-orange-600 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Total Anomalies
                    </span>
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-orange-600 font-mono">
                    {dashboard.totalAnomalies}
                  </div>
                  <div className="text-[11px] text-orange-700 mt-1">
                    {dashboard.highSeverityCount} High • {dashboard.mediumSeverityCount} Med
                  </div>
                </div>

                {/* Utilization % */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Fund Utilization
                    </span>
                    <Percent className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div
                    className={`text-2xl font-extrabold font-mono ${
                      dashboard.utilizationPercentage < 50 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {dashboard.utilizationPercentage?.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {dashboard.utilizationPercentage < 50
                      ? 'Below 50% threshold flag'
                      : 'Healthy disbursement'}
                  </div>
                </div>

                {/* Allocated Amount */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Allocated Fund
                    </span>
                    <IndianRupee className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                    {formatCompactINR(dashboard.allocatedAmount)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {formatINR(dashboard.allocatedAmount)}
                  </div>
                </div>

                {/* Total Expenditure */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Expenditure
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                    {formatCompactINR(dashboard.totalExpenditure)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {formatINR(dashboard.totalExpenditure)}
                  </div>
                </div>

                {/* Unspent Amount */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Unspent Fund
                    </span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                    {formatCompactINR(dashboard.unspentAmount)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {formatINR(dashboard.unspentAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Audit Finding / Case Study Section */}
            {loadingDashboard || loadingAnomalies ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                <div className="flex gap-2 pt-1">
                  <div className="h-6 w-24 bg-slate-200 rounded"></div>
                  <div className="h-6 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
            ) : auditFinding ? (
              <div
                className={`rounded-2xl p-4 sm:p-6 space-y-3 shadow-xs border-2 ${
                  auditFinding.hasAnomalies
                    ? 'bg-orange-50/90 border-orange-300/80'
                    : 'bg-emerald-50/80 border-emerald-300/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {auditFinding.hasAnomalies ? (
                      <Flame className="w-5 h-5 text-orange-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <h3
                      className={`font-extrabold text-sm sm:text-base ${
                        auditFinding.hasAnomalies ? 'text-orange-950' : 'text-emerald-950'
                      }`}
                    >
                      {auditFinding.title}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold self-start sm:self-auto font-mono ${
                      auditFinding.hasAnomalies
                        ? 'bg-orange-200 text-orange-950'
                        : 'bg-emerald-200 text-emerald-950'
                    }`}
                  >
                    {auditFinding.ruleBadge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {auditFinding.description}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                  {auditFinding.metrics.map((metric, idx) => (
                    <span
                      key={idx}
                      className={`bg-white px-2.5 py-1 rounded-md border font-semibold ${
                        auditFinding.hasAnomalies
                          ? 'border-orange-200 text-orange-900'
                          : 'border-emerald-200 text-emerald-900'
                      }`}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Projects & Anomaly Flags Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
              {/* Section Header with Sort Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Constituency Works &amp; Anomaly Flags
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual civil works sanctioned under this MP, with specific algorithmic audit triggers.
                  </p>
                </div>

                {/* Sort selector */}
                <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
                  <span className="text-slate-500 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="id">Project ID</option>
                    <option value="sanctionedAmount">Sanction Amount</option>
                    <option value="expenditureAmount">Expenditure</option>
                  </select>
                </div>
              </div>

              {/* Filter Chips & Search Bar (Wrap on mobile) */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      filterType === 'all'
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All ({totalElements})
                  </button>
                  <button
                    onClick={() => setFilterType('flagged')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      filterType === 'flagged'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Flagged ({dashboard.totalAnomalies})</span>
                  </button>
                  <button
                    onClick={() => setFilterType('duplicates')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      filterType === 'duplicates'
                        ? 'bg-orange-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Duplicates
                  </button>
                  <button
                    onClick={() => setFilterType('delays')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      filterType === 'delays'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Chronic Delays
                  </button>
                  <button
                    onClick={() => setFilterType('uniform')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      filterType === 'uniform'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Uniform Allocations
                  </button>
                </div>

                {/* Local search */}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search by title or agency..."
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Project Cards List */}
              {loadingProjects ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">No Projects Found</h4>
                  <p className="text-xs text-slate-500">
                    No works match the selected filter criteria on this page.
                  </p>
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setProjectSearch('');
                    }}
                    className="min-h-[44px] mt-2 px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map((item) => {
                    const prj = item.project;
                    const reviewStatus = getProjectReviewStatus(prj.id);

                    return (
                      <div
                        key={prj.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                          item.flagged
                            ? 'border-orange-200 bg-orange-50/20 hover:bg-orange-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {/* Top row: Code, category, status & flagged badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              #{prj.projectCode || prj.id}
                            </span>
                            <span className="text-[11px] sm:text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {prj.category || 'Civil Infrastructure'}
                            </span>
                            <span className="text-[11px] sm:text-xs font-medium capitalize text-slate-700">
                              Status: <strong>{prj.status}</strong>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {reviewStatus === 'escalated' && (
                              <span className="text-[10px] sm:text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded-full">
                                Escalated in Session
                              </span>
                            )}
                            {reviewStatus === 'resolved' && (
                              <span className="text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                                Resolved in Session
                              </span>
                            )}
                            {item.flagged ? (
                              <span className="text-[10px] sm:text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-600" />
                                <span>FLAGGED ANOMALY</span>
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Clean Sanction
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 leading-snug">
                          {prj.title}
                        </h4>

                        {/* Financial and Agency Grid (Responsive 2 cols on mobile, 4 on tablet/desktop) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">
                              Sanctioned Amount
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                              {formatINR(prj.sanctionedAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">
                              Expenditure Logged
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                              {formatINR(prj.expenditureAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">
                              Sanction Date
                            </span>
                            <span className="font-medium text-slate-700 text-[11px] sm:text-xs">
                              {formatDate(prj.sanctionDate || prj.recommendationDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">
                              Implementing Agency
                            </span>
                            <span className="font-medium text-slate-700 truncate block text-[11px] sm:text-xs" title={prj.agencyName}>
                              {prj.agencyName || 'District IDA / DRDA'}
                            </span>
                          </div>
                        </div>

                        {/* Anomaly breakdown box when flagged */}
                        {item.flagged && item.anomalies && item.anomalies.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {item.anomalies.map((anom) => (
                              <div
                                key={anom.id}
                                className="bg-orange-50/90 border border-orange-200 rounded-lg p-3 text-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                  <div className="flex items-center space-x-2">
                                    <SeverityBadge severity={anom.severity} size="sm" />
                                    <span className="font-bold text-orange-950 text-xs">
                                      {getRuleName(anom.ruleCode)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    Rule: {anom.ruleCode}
                                  </span>
                                </div>
                                <p className="text-orange-900 font-medium text-xs leading-relaxed">
                                  {anom.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* District/State/Ministry Action Buttons */}
                        {userSession.role !== 'citizen' && item.flagged && (
                          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="text-slate-500 font-medium">
                              Administrative Actions:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => takeReviewAction(prj.id, 'escalated')}
                                className="min-h-[44px] px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                              >
                                Escalate to State
                              </button>
                              <button
                                onClick={() => takeReviewAction(prj.id, 'resolved')}
                                className="min-h-[44px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                              >
                                Mark Resolved
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Projects Pagination Footer */}
              {totalPages > 1 && (
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 text-center sm:text-left">
                    Showing page <strong className="text-slate-900 font-mono">{currentPage + 1}</strong> of{' '}
                    <strong className="text-slate-900 font-mono">{totalPages}</strong> ({totalElements} total works)
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      disabled={currentPage === 0 || loadingProjects}
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      className="min-h-[44px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1.5 shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      disabled={currentPage >= totalPages - 1 || loadingProjects}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="min-h-[44px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
};

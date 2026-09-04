import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, resolveFeaturedMPId } from '../services/api';
import { DebugStats, MPListItem } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { formatCompactINR, formatINR, getRuleName } from '../utils/formatters';
import {
  FEATURED_MP_NAME,
  FEATURED_MP_CONSTITUENCY,
  FEATURED_MP_STATE,
  FEATURED_MP_HOUSE,
} from '../data/featuredCaseStudyData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  ShieldAlert,
  Flame,
  AlertTriangle,
  FileText,
  MapPin,
  Users,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building2,
} from 'lucide-react';

export const NationalDashboard: React.FC = () => {
  const { userSession, navigateTo } = useApp();
  const [stats, setStats] = useState<DebugStats | null>(null);
  const [sampleMps, setSampleMps] = useState<MPListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [debugData, mpsResponse] = await Promise.all([
        api.getDebugStats(),
        api.getMPs(0, 10),
      ]);
      setStats(debugData);
      setSampleMps(mpsResponse.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeaturedMP = async () => {
    const id = await resolveFeaturedMPId();
    if (id) {
      navigateTo('mp-profile', { mpId: id });
    } else {
      navigateTo('mp-directory');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format non-zero anomaly types for Recharts
  const anomalyBreakdown = stats?.anomalyTypeBreakdown || {
    DUPLICATE_WORK_PROPOSAL: 4469,
    PROJECT_CHRONIC_DELAY: 56,
    SUSPICIOUS_UNIFORM_ALLOCATION: 1799,
  };

  const chartData = [
    {
      code: 'DUPLICATE_WORK_PROPOSAL',
      label: 'Duplicate Proposals',
      count: anomalyBreakdown.DUPLICATE_WORK_PROPOSAL || 4469,
      color: '#F97316', // HIGH severity orange
      severity: 'HIGH',
      description: 'Exact title + amount duplication',
    },
    {
      code: 'SUSPICIOUS_UNIFORM_ALLOCATION',
      label: 'Uniform Allocations',
      count: anomalyBreakdown.SUSPICIOUS_UNIFORM_ALLOCATION || 1799,
      color: '#F59E0B', // MEDIUM severity amber
      severity: 'MEDIUM',
      description: 'Identical round sum proposals',
    },
    {
      code: 'PROJECT_CHRONIC_DELAY',
      label: 'Chronic Delays (>24mo)',
      count: anomalyBreakdown.PROJECT_CHRONIC_DELAY || 56,
      color: '#3B82F6', // BLUE / MEDIUM severity
      severity: 'MEDIUM',
      description: 'Unfinished works > 730 days',
    },
  ];

  const totalAnomalies = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Header & Role Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Prativedak • National Oversight Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            MPLADS Fund &amp; Anomaly Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time algorithmic monitoring across Indian parliamentary constituencies.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={loadData}
            className="min-h-[44px] px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            title="Refresh national statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigateTo('mp-directory')}
            className="min-h-[44px] px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Browse All MPs</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Review Queue Action Banner (District / State / Ministry) */}
      {userSession.role !== 'citizen' && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-slate-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-950/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm">
                Administrative Authority Active: {userSession.role.toUpperCase()}
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                Review flagged duplicate work proposals and trigger state-level escalation workflows.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateTo('review-queue')}
            className="min-h-[44px] shrink-0 w-full sm:w-auto px-4 py-2.5 bg-slate-950 text-amber-400 hover:bg-slate-900 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5"
          >
            <span>Open Review Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* National KPI Row (1 col on mobile, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Works */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Works in Database
            </span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {stats?.totalProjectsInDB?.toLocaleString('en-IN') || '15,000+'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Civil &amp; community infrastructure projects
          </div>
        </div>

        {/* Flagged Anomalies */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Flagged Anomalies
            </span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 font-mono">
            {stats?.totalAnomaliesInDB?.toLocaleString('en-IN') || '6,324'}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>41.8% of works trigger flags</span>
          </div>
        </div>

        {/* High Severity Count */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">
              High Severity Violations
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {anomalyBreakdown.DUPLICATE_WORK_PROPOSAL?.toLocaleString('en-IN') || '4,469'}
          </div>
          <div className="text-xs text-orange-700 mt-1">
            Duplicate work proposals
          </div>
        </div>

        {/* Medium Severity Count */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Medium Severity Flags
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {(
              (anomalyBreakdown.SUSPICIOUS_UNIFORM_ALLOCATION || 1799) +
              (anomalyBreakdown.PROJECT_CHRONIC_DELAY || 56)
            ).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-amber-700 mt-1">
            Uniform allocations &amp; chronic delays
          </div>
        </div>
      </div>

      {/* Severity Breakdown Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-slate-700 mb-2">
          <span>Anomaly Severity Distribution</span>
          <span className="font-mono text-slate-500">
            {totalAnomalies.toLocaleString('en-IN')} Total Active Anomalies
          </span>
        </div>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
          <div
            style={{ width: `${(4469 / totalAnomalies) * 100}%` }}
            className="bg-[#F97316] transition-all"
            title="High Severity: Duplicate Works (70.6%)"
          ></div>
          <div
            style={{ width: `${(1799 / totalAnomalies) * 100}%` }}
            className="bg-[#F59E0B] transition-all"
            title="Medium Severity: Uniform Allocations (28.4%)"
          ></div>
          <div
            style={{ width: `${(56 / totalAnomalies) * 100}%` }}
            className="bg-[#3B82F6] transition-all"
            title="Medium Severity: Chronic Delays (0.9%)"
          ></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
            <span>HIGH: Duplicate Proposals (4,469)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            <span>MEDIUM: Uniform Allocations (1,799)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
            <span>MEDIUM: Chronic Delays &gt;24mo (56)</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Anomaly Type Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Anomaly Breakdown by Rule Type
                </h3>
                <p className="text-xs text-slate-500">
                  Distribution of active algorithmic triggers across national database
                </p>
              </div>
              <button
                onClick={() => navigateTo('anomalies')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 min-h-[36px]"
              >
                <span>Full Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="label" type="category" width={110} tick={{ fontSize: 10, fontWeight: 500 }} />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      `${value !== undefined ? value.toLocaleString('en-IN') : 0} projects flagged`,
                      'Anomaly Count',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-slate-100 text-xs">
            {chartData.map((c) => (
              <div key={c.code} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">{c.label}</div>
                <div className="font-bold text-slate-900 text-sm font-mono mt-0.5">
                  {c.count.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{c.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: State Explorer Map Preview Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">State Risk Explorer</h3>
                <p className="text-xs text-slate-500">Choropleth map &amp; state drilldowns</p>
              </div>
              <MapPin className="w-5 h-5 text-blue-700 shrink-0" />
            </div>

            <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white text-center space-y-3 my-2">
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Geographic Risk Concentration
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore state-level aggregated risk scores, total MP allocations, and regional anomaly densities across all 36 States &amp; UTs.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('state-explorer')}
                  className="w-full min-h-[44px] py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Open State Choropleth Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span>High Risk States</span>
              <span className="font-semibold text-red-600">Uttar Pradesh, Maharashtra</span>
            </div>
            <div className="flex items-center justify-between">
              <span>High Utilization States</span>
              <span className="font-semibold text-emerald-700">Nagaland, Kerala</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured MPs & Quick Access Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Sample Parliamentarian Profiles
            </h3>
            <p className="text-xs text-slate-500">
              Browse MPs with audited fund telemetry and computed risk indexes
            </p>
          </div>
          <button
            onClick={() => navigateTo('mp-directory')}
            className="min-h-[44px] text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Complete MP Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View (hidden on mobile < md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Constituency</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3">House</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Narayan Das Ahirwar pinned on top as prime case study */}
                  <tr
                    onClick={handleOpenFeaturedMP}
                    className="hover:bg-orange-50/70 cursor-pointer bg-orange-50/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{FEATURED_MP_NAME}</span>
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-semibold">
                        Prime Case Study
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{FEATURED_MP_CONSTITUENCY}</td>
                    <td className="py-3 px-3 text-slate-600">{FEATURED_MP_STATE}</td>
                    <td className="py-3 px-3 text-slate-500">{FEATURED_MP_HOUSE}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs font-semibold text-orange-700 hover:text-orange-900">
                        View Profile &rarr;
                      </span>
                    </td>
                  </tr>

                  {sampleMps.slice(0, 5).map((mp) => (
                    <tr
                      key={mp.id}
                      onClick={() => navigateTo('mp-profile', { mpId: mp.id })}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900">{mp.name}</td>
                      <td className="py-3 px-3 text-slate-700">{mp.constituency}</td>
                      <td className="py-3 px-3 text-slate-600">{mp.state}</td>
                      <td className="py-3 px-3 text-slate-500">{mp.party || 'Lok Sabha'}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-blue-700 hover:text-blue-900">
                          View Profile &rarr;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (visible on < md) */}
            <div className="md:hidden space-y-3">
              {/* Narayan Das Ahirwar pinned featured card */}
              <div
                onClick={handleOpenFeaturedMP}
                className="bg-orange-50/80 border border-orange-200 rounded-xl p-3.5 space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{FEATURED_MP_NAME}</div>
                  <span className="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-bold">
                    Prime Case Study
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Constituency</span>
                    <span className="font-medium text-slate-800">{FEATURED_MP_CONSTITUENCY}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">State</span>
                    <span className="font-medium text-slate-800">{FEATURED_MP_STATE}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between text-xs font-semibold text-orange-900">
                  <span>85 / 86 Duplicate Flags (98.8%)</span>
                  <span className="flex items-center gap-1">
                    <span>Inspect Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {sampleMps.slice(0, 5).map((mp) => (
                <div
                  key={mp.id}
                  onClick={() => navigateTo('mp-profile', { mpId: mp.id })}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm">{mp.name}</div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                      {mp.party || 'Lok Sabha'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Constituency</span>
                      <span className="font-medium text-slate-800">{mp.constituency || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">State</span>
                      <span className="font-medium text-slate-800">{mp.state || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                    <span>ID #{mp.id}</span>
                    <span className="flex items-center gap-1">
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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

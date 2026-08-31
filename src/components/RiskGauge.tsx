import React, { useState } from 'react';
import { MPDashboardData } from '../types';
import { getRiskDetails, RiskBreakdown } from '../utils/risk';
import { Info, HelpCircle, X, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface RiskGaugeProps {
  dashboard: MPDashboardData | Partial<MPDashboardData>;
  size?: 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ dashboard, size = 'lg' }) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const details: RiskBreakdown = getRiskDetails(dashboard);

  // SVG arc calculation for 0-100 gauge (240 degree sweep)
  const radius = size === 'lg' ? 68 : 52;
  const strokeWidth = size === 'lg' ? 12 : 9;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const sweepAngle = 240; // 240 degrees sweep
  const arcLength = (sweepAngle / 360) * circumference;

  // Percentage of arc filled
  const strokeDashoffset = arcLength - (details.score / 100) * arcLength;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <span className="font-semibold text-xs sm:text-sm text-slate-800 tracking-tight">
            Algorithmic Risk Index
          </span>
        </div>
        <button
          id="btn-risk-formula-info"
          onClick={() => setShowFormulaModal(true)}
          className="min-h-[44px] px-2 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-slate-50 flex items-center gap-1 text-xs"
          title="Inspect transparent scoring formula"
        >
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">Formula</span>
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Main Gauge Graphic (Responsive flex: col on small mobile, row on tablet/desktop) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-4">
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            height={radius * 2 + 10}
            width={radius * 2 + 10}
            className="transform -rotate-120 overflow-visible max-w-full"
            viewBox={`0 0 ${radius * 2 + 10} ${radius * 2 + 10}`}
          >
            {/* Background Arc */}
            <circle
              stroke="#E2E8F0"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius + 5}
              cy={radius + 5}
            />
            {/* Value Arc */}
            <circle
              stroke={details.gaugeColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
              }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius + 5}
              cy={radius + 5}
            />
          </svg>

          {/* Center text in the gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
              {details.score}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              / 100 Score
            </span>
          </div>
        </div>

        {/* Score metadata & details */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 w-full">
          <div className="inline-flex items-center gap-1.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${details.badgeColor}`}
            >
              {details.category}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
            Calculated client-side from anomaly density, severity weights, and fund utilization rate.
          </p>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="min-h-[44px] text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 pt-1"
          >
            <span>Inspect mathematical breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Factor Preview Bar (1 col on tiny screen, 2 col on mobile, 4 on tablet) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase truncate">Anomaly Density</div>
          <div className="font-bold text-slate-800 font-mono text-xs sm:text-sm">
            {details.factors[0]?.points} / 40 pts
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase truncate">High Severity</div>
          <div className="font-bold text-slate-800 font-mono text-xs sm:text-sm">
            {details.factors[1]?.points} pts
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase truncate">Medium Severity</div>
          <div className="font-bold text-slate-800 font-mono text-xs sm:text-sm">
            {details.factors[2]?.points} pts
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase truncate">Low Util Flag</div>
          <div className="font-bold text-slate-800 font-mono text-xs sm:text-sm">
            {details.factors[3]?.points} / 15 pts
          </div>
        </div>
      </div>

      {/* Transparent Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div
            id="formula-modal-content"
            className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto my-auto"
          >
            {/* Close button */}
            <button
              onClick={() => setShowFormulaModal(false)}
              className="min-h-[44px] min-w-[44px] absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
              aria-label="Close formula modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-3 mb-4 pr-10">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Explainable Risk Score Formula
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Deterministic, non-black-box client-side metric
                </p>
              </div>
            </div>

            {/* Formula Code Box */}
            <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-[11px] sm:text-xs mb-4 overflow-x-auto leading-relaxed border border-slate-800">
              <div className="text-slate-400">// Client-side Risk Formula</div>
              <div>riskScore = clamp(0, 100,</div>
              <div className="pl-3 sm:pl-4 text-emerald-400">
                (totalAnomalies / totalWorksCount) * 40 <span className="text-slate-500">// Density</span>
              </div>
              <div className="pl-3 sm:pl-4 text-amber-300">
                + (highSeverityCount * 8) <span className="text-slate-500">// Duplicates</span>
              </div>
              <div className="pl-3 sm:pl-4 text-amber-300">
                + (mediumSeverityCount * 3) <span className="text-slate-500">// Delays &amp; sums</span>
              </div>
              <div className="pl-3 sm:pl-4 text-red-400">
                + (utilizationPercentage &lt; 50 ? 15 : 0) <span className="text-slate-500">// Low util</span>
              </div>
              <div>)</div>
            </div>

            {/* Factor breakdown for this MP */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Computation breakdown for this record:
            </h4>
            <div className="space-y-2 mb-4">
              {details.factors.map((f, i) => (
                <div
                  key={i}
                  className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs gap-2"
                >
                  <div className="pr-2">
                    <div className="font-semibold text-slate-800 text-xs">{f.name}</div>
                    <div className="text-[11px] text-slate-500">{f.description}</div>
                    <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                      {f.valueText}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      +{f.points}
                    </span>
                    <span className="text-[10px] text-slate-400 block">pts</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-600 text-center sm:text-left">
                Total calculated score:{' '}
                <strong className="font-mono text-slate-900 text-sm">{details.score} / 100</strong>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { SYSTEM_RULES, RuleDefinition } from '../utils/rulesData';
import { SeverityBadge } from './SeverityBadge';
import { ShieldAlert, X, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface RuleExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRuleCode?: string;
}

export const RuleExplainerModal: React.FC<RuleExplainerModalProps> = ({
  isOpen,
  onClose,
  initialRuleCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Prativedak Algorithmic Detection Rules &amp; Audit Specs
              </h2>
              <p className="text-xs text-slate-500">
                Rule definitions, trigger conditions, and national dataset coverage in Prativedak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Active Rules Group */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active In Production (3 Rules)
              </h3>
            </div>

            <div className="space-y-3">
              {SYSTEM_RULES.filter((r) => r.status === 'ACTIVE_IN_PRODUCTION').map((rule) => {
                const isTarget = initialRuleCode && rule.code === initialRuleCode;
                return (
                  <div
                    key={rule.code}
                    className={`rounded-xl border p-4 transition-all ${
                      isTarget
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                          {rule.code}
                        </span>
                        <SeverityBadge severity={rule.severity} size="sm" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {rule.liveCountApprox}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">{rule.name}</h4>
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                      {rule.shortDescription}
                    </p>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div>
                        <strong className="text-slate-800">Trigger Logic: </strong>
                        <span className="text-slate-600">{rule.fullLogic}</span>
                      </div>
                      <div>
                        <strong className="text-slate-800">Public Impact: </strong>
                        <span className="text-slate-600">{rule.whyItMatters}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inactive / Data-limited Rules */}
          <div className="pt-2">
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Documented Rules with Source Data Limitations (2 Rules)
              </h3>
            </div>

            <div className="space-y-3">
              {SYSTEM_RULES.filter((r) => r.status === 'DATA_LIMITED').map((rule) => (
                <div
                  key={rule.code}
                  className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-amber-200">
                        {rule.code}
                      </span>
                      <SeverityBadge severity={rule.severity} size="sm" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      0 Active Flags (Data Gap)
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{rule.name}</h4>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {rule.shortDescription}
                  </p>

                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs">
                    <div className="flex items-start space-x-2 text-amber-900">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <strong>Transparency Note: </strong>
                        <span>{rule.dataNote}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

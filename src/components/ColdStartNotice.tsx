import React from 'react';
import { useApp } from '../context/AppContext';
import { Loader2, Server, AlertCircle } from 'lucide-react';

export const ColdStartNotice: React.FC = () => {
  const { isWakingUp } = useApp();

  if (!isWakingUp) return null;

  return (
    <div
      id="cold-start-banner"
      className="bg-amber-500 text-slate-950 px-4 py-2.5 border-b border-amber-600 shadow-md transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-slate-950 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <span className="font-bold flex items-center gap-1">
              <Server className="w-4 h-4" /> Live Backend Waking Up:
            </span>
            <span>
              Render free tier instance is spinning up after inactivity (typically takes 20–40 seconds). Thank you for your patience.
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center text-xs font-semibold px-2 py-1 bg-amber-600/30 rounded border border-amber-600/50 text-slate-900">
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          Auto-retrying
        </div>
      </div>
    </div>
  );
};

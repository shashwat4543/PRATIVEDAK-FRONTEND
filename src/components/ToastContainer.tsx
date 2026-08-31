import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-200 bg-white',
          warning: 'border-amber-200 bg-white',
          error: 'border-red-200 bg-white',
          info: 'border-blue-200 bg-white',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start space-x-3 transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              borderColors[t.type]
            }`}
          >
            {icons[t.type]}
            <div className="flex-1 pr-2">
              <h5 className="text-xs font-bold text-slate-900">{t.title}</h5>
              {t.message && (
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                  {t.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

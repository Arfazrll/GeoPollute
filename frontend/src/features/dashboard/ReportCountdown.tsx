import { useState, useEffect } from 'react';
import { Clock, Download, Play, Square } from 'lucide-react';
export function ReportCountdown() {
  const [activeReport, setActiveReport] = useState<'1h' | '24h' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (timeLeft <= 0) {
      if (activeReport) {
        setActiveReport(null);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, activeReport]);
  const startReport = (type: '1h' | '24h') => {
    setActiveReport(type);
    setTimeLeft(type === '1h' ? 3600 : 86400);
  };
  const stopReport = () => {
    setActiveReport(null);
    setTimeLeft(0);
  };
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
        <Clock className="w-3 h-3 text-blue-500" />
        Log Analytics & Reporting
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => activeReport === '1h' ? stopReport() : startReport('1h')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              activeReport === '1h'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            {activeReport === '1h' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 text-blue-500" />}
            <span className="text-[9px] font-black uppercase tracking-widest">1H Analytics</span>
          </button>
          <button
            onClick={() => activeReport === '24h' ? stopReport() : startReport('24h')}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              activeReport === '24h'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            {activeReport === '24h' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 text-blue-500" />}
            <span className="text-[9px] font-black uppercase tracking-widest">24H Analytics</span>
          </button>
        </div>
        {activeReport && (
          <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Generating Report...</span>
              <span className="text-xl font-mono font-black text-white">{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
        {!activeReport && (
          <button className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <Download className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Download Latest Logs</span>
          </button>
        )}
      </div>
    </div>
  );
}
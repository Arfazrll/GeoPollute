import { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';

export function ReportCountdown() {
  const filter = useFilterStore((s) => s.filter);
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    if (filter !== '2m') return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) return 120;
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [filter]);

  if (filter !== '2m') return null;

  return (
    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <RefreshCcw className="w-3 h-3 text-blue-500 animate-spin-slow" />
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          Auto-Refresh
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-black text-blue-600 font-mono">
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </span>
        <span className="text-[8px] font-bold text-slate-400 uppercase">
          Remaining
        </span>
      </div>
    </div>
  );
}

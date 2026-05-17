import { useState } from 'react';
import { Calendar, Eye, FileText } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';
export function ReportCountdown() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const setCustomRange = useFilterStore(s => s.setCustomRange);
  const maxDate = new Date().toISOString().slice(0, 16); 
  const handleApply = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be after end date');
      return;
    }
    setCustomRange({ start: startDate, end: endDate });
  };
  const isInvalid = !startDate || !endDate || new Date(startDate) > new Date(endDate);
  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
        <FileText className="w-3 h-3 text-blue-500" />
        Log Analytics & Reporting
      </div>
      <div className="flex flex-col gap-4">
        {}
        <div className="grid grid-cols-1 gap-4">
          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              Start Date
            </label>
            <div className="relative group">
              <input
                type="datetime-local"
                value={startDate}
                max={maxDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-slate-300"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 pointer-events-none" />
            </div>
          </div>
          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              End Date
            </label>
            <div className="relative group">
              <input
                type="datetime-local"
                value={endDate}
                max={maxDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-slate-300"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 pointer-events-none" />
            </div>
          </div>
        </div>
        {}
        <button 
          onClick={handleApply}
          disabled={isInvalid}
          className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase tracking-widest text-[9px] ${
            !isInvalid
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <Eye className={`w-3.5 h-3.5 ${!isInvalid ? 'text-white' : 'text-slate-300'}`} />
          View Analytics & Logs
        </button>
      </div>
    </div>
  );
}
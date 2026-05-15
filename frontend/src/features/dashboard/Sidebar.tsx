import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { TimeFilter } from './TimeFilter';
import { PollutantSelector } from './PollutantSelector';
import { AreaSearch } from './AreaSearch';
import { RegionalReport } from './RegionalReport';
import { ReportCountdown } from './ReportCountdown';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
interface Props {
  onNavigate: (coords: { lat: number; lng: number; zoom: number }) => void;
}
export function Sidebar({ onNavigate }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const filter = useFilterStore((s) => s.filter);
  const { isFetching, isError } = usePollutantData();
  const statusText = isError
    ? 'Connection lost — showing cached data'
    : isFetching
    ? 'Refreshing...'
    : filter === '2m'
    ? 'Data Auto-refresh Active (Next in 92 seconds)'
    : 'Aggregated data';
  return (
    <div className="relative group h-[calc(100vh-2rem)] flex flex-col">
      {}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-0 left-0 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-xl flex items-center justify-center text-blue-600 hover:text-blue-700 hover:scale-105 transition-all border border-slate-200 z-50"
          title="Open Dashboard"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}
      {}
      <div
        className={`glass text-slate-900 rounded-2xl min-w-[340px] max-w-[340px] h-full shadow-2xl transition-all duration-500 ease-in-out transform origin-top-left flex flex-col ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none translate-x-[-20px]'
        }`}
      >
        {}
        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-white/50 backdrop-blur-sm rounded-t-2xl">
          <div className="flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              GeoPollute System
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              Jakarta Dashboard
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            title="Close Dashboard"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
        {}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Time Interval
            </div>
            <TimeFilter />
          </div>
          <PollutantSelector />
          <ReportCountdown />
          <div className={`text-[10px] pt-4 border-t border-slate-200 font-medium ${isError ? 'text-red-500' : 'text-slate-400'}`}>
            {statusText}
          </div>
          <AreaSearch onNavigate={onNavigate} />
          <RegionalReport />
        </div>
      </div>
    </div>
  );
}
import { useFilterStore } from '@/store/useFilterStore';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { TimeFilter } from './TimeFilter';

export function Sidebar() {
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
    <div className="glass text-white p-5 rounded-xl min-w-[320px] shadow-2xl">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
        Time Interval
      </div>
      <TimeFilter />
      <div className={`text-[10px] mt-4 font-medium ${isError ? 'text-red-400' : 'text-white/40'}`}>
        {statusText}
      </div>
    </div>
  );
}
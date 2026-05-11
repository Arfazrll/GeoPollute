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
    ? 'Auto-refresh active (every 120s)'
    : 'Aggregated data';

  return (
    <div className="bg-black/70 text-white p-4 rounded backdrop-blur min-w-[300px]">
      <div className="text-xs uppercase tracking-wider opacity-60 mb-2">Time Interval</div>
      <TimeFilter />
      <div className={`text-xs mt-3 ${isError ? 'text-red-400' : 'opacity-60'}`}>{statusText}</div>
    </div>
  );
}
import { useFilterStore } from '@/store/useFilterStore';
import type { FilterMode } from '@/types';

const OPTIONS: Array<{ value: FilterMode; label: string }> = [
  { value: '2m', label: '2 MINUTES' },
  { value: '1h', label: '1 HOUR' },
  { value: '1d', label: '24 HOURS' },
];

export function TimeFilter() {
  const { filter, setFilter } = useFilterStore();

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter(opt.value)}
          className={`px-3 py-1.5 text-xs rounded border transition ${
            filter === opt.value
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-white/30 hover:border-white/60'
          }`}
        >
          [ {opt.label} ]
        </button>
      ))}
    </div>
  );
}
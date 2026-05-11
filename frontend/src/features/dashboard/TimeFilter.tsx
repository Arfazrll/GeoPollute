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
    <div className="flex gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter(opt.value)}
          className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all duration-300 ${
            filter === opt.value
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'glass-button text-white/70 border-white/5'
          }`}
        >
          [ {opt.label} ]
        </button>
      ))}
    </div>
  );
}
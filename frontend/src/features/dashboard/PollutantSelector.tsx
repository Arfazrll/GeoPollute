import { useFilterStore, type PollutantType } from '@/store/useFilterStore';
const POLLUTANTS: { id: PollutantType; label: string }[] = [
  { id: 'pm25', label: 'PM2.5' },
  { id: 'co', label: 'CO2' },
  { id: 'no2', label: 'NO2' },
];
export function PollutantSelector() {
  const { pollutant, setPollutant } = useFilterStore();
  return (
    <div className="flex gap-6 mt-6 mb-2 px-1">
      {POLLUTANTS.map((p) => (
        <button
          key={p.id}
          onClick={() => setPollutant(p.id)}
          className={`text-[11px] font-bold tracking-[0.15em] transition-all duration-300 relative pb-1 ${pollutant === p.id
              ? 'text-blue-600 opacity-100'
              : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          {p.label}
          {pollutant === p.id && (
            <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)]" />
          )}
        </button>
      ))}
    </div>
  );
}
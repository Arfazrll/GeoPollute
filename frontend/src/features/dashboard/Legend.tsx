import { COLORS, POLLUTANT_THRESHOLDS } from '@/features/map/utils/spatialLogic';
import { useFilterStore } from '@/store/useFilterStore';
export function Legend() {
  const { pollutant, setPollutant } = useFilterStore();
  const getThresholds = () => {
    const t = POLLUTANT_THRESHOLDS[pollutant as keyof typeof POLLUTANT_THRESHOLDS];
    const unit = pollutant === 'pm25' ? 'µg/m³' : 'ppm';
    return [
      { emoji: '😊', label: `< ${t.good}`, color: COLORS.GOOD, status: 'GOOD' },
      { emoji: '😐', label: `${t.good} - ${t.moderate}`, color: COLORS.MODERATE, status: 'MODERATE' },
      { emoji: '😡', label: `> ${t.moderate}`, color: COLORS.UNHEALTHY, status: 'UNHEALTHY' },
      unit
    ];
  };
  const [good, moderate, unhealthy, unit] = getThresholds() as any;
  return (
    <div className="glass text-slate-900 p-4 rounded-2xl shadow-2xl min-w-[200px] border border-white/20 backdrop-blur-xl bg-white/80 overflow-hidden">
      {}
      <div className="flex bg-slate-100/50 p-1 rounded-xl mb-4 border border-slate-200/50">
        {(['pm25', 'co', 'no2'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPollutant(p)}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all ${
              pollutant === p
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {p === 'pm25' ? 'PM2.5' : (p === 'co' ? 'CO2' : 'NO2')}
          </button>
        ))}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center justify-between">
        <span>Kualitas Udara</span>
        <span className="text-blue-500 font-mono lowercase tracking-normal">({unit})</span>
      </div>
      <div className="flex flex-col gap-3">
        {[good, moderate, unhealthy].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/40 p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"
              style={{ backgroundColor: item.color }}
            >
              {item.emoji}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black text-slate-800 font-mono">
                {item.label}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          © GeoPollute Jakarta
        </span>
      </div>
    </div>
  );
}
import { AQI_COLOR_STOPS } from '@/features/map/utils/spatialLogic';

export function Legend() {
  return (
    <div className="glass text-white p-4 rounded-xl shadow-2xl min-w-[180px]">
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
        AQI (PM2.5)
      </div>
      <div className="flex flex-col gap-2.5">
        {AQI_COLOR_STOPS.map(([value, color], i) => {
          const next = AQI_COLOR_STOPS[i + 1]?.[0];
          return (
            <div key={value} className="flex items-center gap-3">
              <span 
                className="w-2.5 h-6 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                style={{ background: color }} 
              />
              <span className="text-[11px] font-medium text-white/80">
                {next ? `${value} – ${next}` : `${value}+`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
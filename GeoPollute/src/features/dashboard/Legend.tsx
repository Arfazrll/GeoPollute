import { AQI_COLOR_STOPS } from '@/features/map/utils/spatialLogic';

export function Legend() {
  return (
    <div className="bg-black/70 text-white p-3 rounded text-xs backdrop-blur min-w-[160px]">
      <div className="font-semibold mb-2 tracking-wider">PM2.5 (µg/m³)</div>
      <div className="flex flex-col gap-1">
        {AQI_COLOR_STOPS.map(([value, color], i) => {
          const next = AQI_COLOR_STOPS[i + 1]?.[0];
          return (
            <div key={value} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ background: color }} />
              <span>{next ? `${value} – ${next}` : `${value}+`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
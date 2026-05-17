import { useMemo } from 'react';
import { getPollutantCategory, getPollutantColor } from '@/features/map/utils/spatialLogic';
import type { SensorReading, GeoJSMap } from '@/types';
import { useFilterStore } from '@/store/useFilterStore';
interface Props {
  map: GeoJSMap | null;
  selectedSensor: SensorReading | null;
  x: number;
  y: number;
}
function Sparkline({ data, color }: { data: number[], color: string }) {
  const width = 240;
  const height = 40;
  const padding = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;
  const points = data.map((val, i) => {
    const divisor = data.length > 1 ? data.length - 1 : 1;
    const x = (i / divisor) * (width - 2 * padding) + padding;
    const y = height - ((val - min) / range) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="mt-4">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_0_4px_rgba(0,0,0,0.1)]"
        />
        <path
          d={`M ${points} L ${width - padding},${height} L ${padding},${height} Z`}
          fill="url(#sparkline-gradient)"
        />
      </svg>
      <div className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
        Trends observed locally
      </div>
    </div>
  );
}
export function PopupDetail({ map, selectedSensor, x, y }: Props) {
  const { pollutant, filter } = useFilterStore();
  if (!selectedSensor || !map) return null;
  const sensor = selectedSensor;
  const screenX = x;
  const screenY = y;
  const displayValue = sensor[pollutant] !== undefined && sensor[pollutant] !== null ? sensor[pollutant] : -1;
  const unit = pollutant === 'co' ? 'ppm' : 'µg/m³';
  const label = pollutant === 'co' ? 'CO2' : pollutant.toUpperCase();
  const status = displayValue >= 0 ? getPollutantCategory(displayValue, pollutant) : 'NO DATA';
  const statusColor = displayValue >= 0 ? getPollutantColor(displayValue, pollutant) : '#94A3B8';
  const timeLabel = filter === '1h' ? '1 HOUR' : filter === '1d' ? '24 HOURS' : 'Real-time';
  const historyData = useMemo(() => {
    if (sensor.history && sensor.history.length > 0) {
      return sensor.history.map(h => h.value);
    }
    return [displayValue, displayValue];
  }, [sensor.history, displayValue]);
  return (
    <div
      className="absolute z-[2000] pointer-events-none"
      style={{
        left: screenX,
        top: screenY - 16,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-white/95 text-slate-900 p-5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 min-w-[280px] backdrop-blur-xl">
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white/95 border-r border-b border-slate-100" />
        <div className="flex justify-between items-start mb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            {sensor.name || `Sensor ${sensor.id}`}
          </div>
          <div className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            {timeLabel}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-1 mb-4">
          <div className="text-[11px] text-slate-500 font-medium">LAT:</div>
          <div className="text-[11px] text-slate-900 font-mono text-right">{sensor.lat.toFixed(4)}</div>
          <div className="text-[11px] text-slate-500 font-medium">LNG:</div>
          <div className="text-[11px] text-slate-900 font-mono text-right">{sensor.lng.toFixed(4)}</div>
        </div>
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] text-slate-500 font-bold uppercase">{label}:</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {displayValue >= 0 ? displayValue.toFixed(1) : '---'} <span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>
            </span>
            <span
              className="text-[10px] font-bold uppercase ml-auto px-2 py-0.5 rounded shadow-sm"
              style={{ backgroundColor: statusColor, color: 'white' }}
            >
              {displayValue >= 0 ? status : 'NO DATA'}
            </span>
          </div>
          <Sparkline data={historyData} color={statusColor} />
        </div>
      </div>
    </div>
  );
}
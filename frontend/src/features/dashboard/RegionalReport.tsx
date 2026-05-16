import { DEVICES_INFO } from '@/constants/devices';
import { FileText, ChevronRight, Calendar } from 'lucide-react';
import { useMemo, useState, useRef } from 'react';
import { COLORS } from '@/features/map/utils/spatialLogic';
import type { PollutantType } from '@/types';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';

function RegionalReportContent({ activeType, start, end }: { activeType: PollutantType; start?: string; end?: string }) {
  const { data: data1h } = usePollutantData('1h', start, end);
  const { data: data1d } = usePollutantData('1d', start, end);

  const report = useMemo(() => {
    if (!data1h?.data || !data1d?.data) return [];
    const groups = Array.from(new Set(DEVICES_INFO.map(d => d.group)));
    return groups.map(group => {
      const groupSensors = DEVICES_INFO.filter(d => d.group === group);
      const readings = groupSensors.map(gs => {
        const s1h = data1h.data.find((s: any) => s.id === gs.id);
        const s1d = data1d.data.find((s: any) => s.id === gs.id);
        if (!s1h) return null;
        return { id: gs.id, name: gs.name, h1: s1h[activeType], h24: s1d?.[activeType] || 0 };
      }).filter(Boolean);
      return { group, sensors: readings, color: groupSensors[0]?.color || '#3B82F6' };
    });
  }, [data1h, data1d, activeType]);

  const MetricRow = ({ label, value }: { label: string; value: number }) => {
    let bgColor = COLORS.GOOD;
    let emoji = '😊';
    let unit = 'µg/m³';
    if (activeType === 'pm25') {
      unit = 'µg/m³';
      if (value >= 55) { bgColor = COLORS.UNHEALTHY; emoji = '😡'; }
      else if (value >= 25) { bgColor = COLORS.MODERATE; emoji = '😐'; }
    } else if (activeType === 'co') {
      unit = 'ppm';
      if (value >= 1000) { bgColor = COLORS.UNHEALTHY; emoji = '😡'; }
      else if (value >= 700) { bgColor = COLORS.MODERATE; emoji = '😐'; }
    } else if (activeType === 'no2') {
      unit = 'µg/m³';
      if (value >= 80) { bgColor = COLORS.UNHEALTHY; emoji = '😡'; }
      else if (value >= 40) { bgColor = COLORS.MODERATE; emoji = '😐'; }
    }
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm"
            style={{ backgroundColor: bgColor }}
          >
            {emoji}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800 leading-none">{label}</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[13px] font-black text-slate-900 font-mono tracking-tight">{value.toFixed(2)}</span>
          <span className="text-[9px] font-black text-slate-900">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col pr-2 pb-8 space-y-6">
      {report.map((region, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 sticky top-0 bg-white/90 backdrop-blur-md py-2 z-10">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (region as any).color }} />
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">
              {(region as any).group}
            </span>
            <div className="h-[1px] flex-1 bg-slate-100 ml-2" />
          </div>
          {(region as any).sensors.map((sensor: any, j: number) => (
            <div key={j} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-200 transition-colors">
              <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-600 truncate max-w-[180px]">
                  {sensor.name}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-300">
                  {sensor.id}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <MetricRow label={start || end ? "SELECTED RANGE" : "1 HOUR"} value={sensor.h1} />
                <MetricRow label={start || end ? "COMPARE RANGE" : "24 HOURS"} value={sensor.h24} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function RegionalReport() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeType, setActiveType] = useState<PollutantType>('pm25');

  const TabButton = ({ type, label }: { type: PollutantType; label: string }) => (
    <button
      onClick={() => setActiveType(type)}
      className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeType === type
        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
        : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-200'
        }`}
    >
      {label}
    </button>
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      try {
        (ref.current as any).showPicker();
      } catch (e) {
        ref.current.focus();
      }
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-100">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">
            Regional Analysis Filter
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Start Date
            </label>
            <div className="relative group">
              <input
                ref={startInputRef}
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none pr-10 hide-calendar-picker"
              />
              <button
                type="button"
                onClick={() => handleIconClick(startInputRef)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center hover:bg-slate-50 p-1 rounded-md transition-colors"
              >
                <Calendar className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              End Date
            </label>
            <div className="relative group">
              <input
                ref={endInputRef}
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none pr-10 hide-calendar-picker"
              />
              <button
                type="button"
                onClick={() => handleIconClick(endInputRef)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center hover:bg-slate-50 p-1 rounded-md transition-colors"
              >
                <Calendar className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4 p-1 bg-slate-50 rounded-xl border border-slate-100">
          <TabButton type="pm25" label="PM2.5" />
          <TabButton type="co" label="CO2" />
          <TabButton type="no2" label="NO2" />
        </div>
        <RegionalReportContent activeType={activeType} start={startDate} end={endDate} />
      </div>
    </div>
  );
}
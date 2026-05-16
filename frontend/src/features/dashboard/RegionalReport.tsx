import { DEVICES_INFO } from '@/constants/devices';
import { FileText, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COLORS } from '@/features/map/utils/spatialLogic';
import type { PollutantType } from '@/types';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { useFilterStore } from '@/store/useFilterStore';

function RegionalReportContent({ activeType }: { activeType: PollutantType }) {
  const customRange = useFilterStore(s => s.customRange);
  const { data: data1h } = usePollutantData('1h');
  const { data: data1d } = usePollutantData('1d');

  const report = useMemo(() => {
    const sourceData = (customRange ? data1h : data1h)?.data || [];
    const sourceDataDaily = data1d?.data || [];

    if (sourceData.length === 0) return [];

    const groups = Array.from(new Set(DEVICES_INFO.map(d => d.group)));
    return groups.map(group => {
      const groupSensors = DEVICES_INFO.filter(d => d.group === group);
      const readings = groupSensors.map(gs => {
        const s1h = sourceData.find((s: any) => s.id === gs.id);
        const s1d = sourceDataDaily.find((s: any) => s.id === gs.id);
        if (!s1h) return null;
        return {
          id: gs.id,
          name: gs.name,
          h1: s1h[activeType],
          h24: s1d?.[activeType] || 0,
          isCustom: !!customRange
        };
      }).filter(Boolean);
      return { group, sensors: readings, color: groupSensors[0]?.color || '#3B82F6' };
    });
  }, [data1h, data1d, activeType, customRange]);

  const MetricRow = ({ label, value }: { label: string; value: number }) => {
    let bgColor = COLORS.GOOD;
    let emoji = '😊';
    let unit = activeType === 'pm25' ? 'µg/m³' : activeType === 'co' ? 'ppm' : 'µg/m³';
    let statusLabel = 'GOOD';

    if (value <= 0) {
      bgColor = COLORS.NO_DATA;
      emoji = '😶';
      statusLabel = 'NO DATA';
    } else if (activeType === 'pm25') {
      if (value >= 55) { bgColor = COLORS.UNHEALTHY; emoji = '😡'; statusLabel = 'UNHEALTHY'; }
      else if (value >= 25) { bgColor = COLORS.MODERATE; emoji = '😐'; statusLabel = 'MODERATE'; }
    } else if (activeType === 'co') {
      if (value >= 1000) { bgColor = COLORS.UNHEALTHY; emoji = '😡'; statusLabel = 'UNHEALTHY'; }
      else if (value >= 700) { bgColor = COLORS.MODERATE; emoji = '😐'; statusLabel = 'MODERATE'; }
    } else if (activeType === 'no2') {
      if (value >= 80) { bgColor = COLORS.UNHEALTHY; emoji = '😡'; statusLabel = 'UNHEALTHY'; }
      else if (value >= 40) { bgColor = COLORS.MODERATE; emoji = '😐'; statusLabel = 'MODERATE'; }
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
            <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase">{statusLabel}</span>
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
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8 space-y-6">
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
                {sensor.isCustom ? (
                  <MetricRow label="CUSTOM RANGE AVG" value={sensor.h1} />
                ) : (
                  <>
                    <MetricRow label="1 HOUR" value={sensor.h1} />
                    <MetricRow label="24 HOURS" value={sensor.h24} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function NoDataPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 my-4">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">No Data Available</h3>
      <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">
        We couldn't find any sensor logs for this specific time range or pollutant type.
      </p>
    </div>
  );
}

export function RegionalReport() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeType, setActiveType] = useState<PollutantType>('pm25');
  const { data } = usePollutantData();

  const hasData = (data?.data?.length || 0) > 0;

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

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group bg-blue-500/5 hover:bg-blue-500/10 p-4 rounded-2xl transition-all border border-blue-500/10 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform relative">
            <FileText className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
              Regional Analysis Log
              <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Live Sensor Diagnostic Report • Real-time
            </div>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-blue-600' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-4 flex flex-col h-[700px]">
          <div className="flex items-center gap-2 mb-4 p-1 bg-slate-50 rounded-xl border border-slate-100">
            <TabButton type="pm25" label="PM2.5" />
            <TabButton type="co" label="CO2" />
            <TabButton type="no2" label="NO2" />
          </div>
          {hasData ? (
            <RegionalReportContent activeType={activeType} />
          ) : (
            <NoDataPlaceholder />
          )}
        </div>
      )}
    </div>
  );
}
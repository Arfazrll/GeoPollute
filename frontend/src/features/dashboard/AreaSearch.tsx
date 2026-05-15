import { useState, useMemo } from 'react';
import { Search, MapPin, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_JAKARTA_REGIONS } from '@/features/map/utils/regions';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { useFilterStore } from '@/store/useFilterStore';
interface Props {
  onNavigate: (coords: { lat: number; lng: number; zoom: number }) => void;
}
import { DEVICES_INFO } from '@/constants/devices';
export function AreaSearch({ onNavigate }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [query, setQuery] = useState('');
  const { data: pollutantData } = usePollutantData();
  const { selectedGroup, setSelectedGroup, pollutant } = useFilterStore();
  const groups = useMemo(() => {
    return Array.from(new Set(DEVICES_INFO.map(d => d.group)));
  }, []);
  const filtered = useMemo(() => {
    let searchResults: any[] = [];
    const lowercaseQuery = query.toLowerCase();
    const filteredRegions = query
      ? ALL_JAKARTA_REGIONS.filter(p => p.name.toLowerCase().includes(lowercaseQuery))
      : ALL_JAKARTA_REGIONS.filter(p => p.isDefault);
    if (!selectedGroup) {
      searchResults.push(...filteredRegions.map(r => ({ ...r, category: 'region' })));
    }
    if (pollutantData?.data) {
      let filteredDevices = DEVICES_INFO;
      if (selectedGroup) {
        filteredDevices = filteredDevices.filter(d => d.group === selectedGroup);
      }
      if (query) {
        filteredDevices = filteredDevices.filter(d =>
          d.label.toLowerCase().includes(lowercaseQuery) ||
          d.name.toLowerCase().includes(lowercaseQuery) ||
          d.group.toLowerCase().includes(lowercaseQuery)
        );
      }
      filteredDevices.forEach(device => {
        const sensor = pollutantData.data.find((s: any) => s.id === device.id);
        if (sensor) {
          let displayColor = '#3B82F6';
          if (device.group.includes('Blok M')) displayColor = '#22C55E';
          else if (device.group.includes('GBK')) displayColor = '#EAB308';
          else if (device.group.includes('Dukuh Atas')) displayColor = '#A855F7';
          else if (device.group.includes('Clarity')) displayColor = '#3B82F6';
          else displayColor = device.color;
          searchResults.push({
            id: device.id,
            name: device.name,
            label: device.label,
            group: device.group,
            color: displayColor,
            type: 'Sensor Alat',
            center: [sensor.lng, sensor.lat],
            zoom: 16,
            category: 'device'
          });
        }
      });
    }
    return searchResults;
  }, [query, pollutantData, selectedGroup, pollutant]);
  return (
    <div className={`mt-6 pt-6 border-t border-slate-200 transition-all duration-300`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group"
      >
        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2 group-hover:text-slate-900 transition-colors">
          <Target className={`w-3.5 h-3.5 ${isExpanded ? 'text-blue-600' : 'text-blue-500'}`} />
          {isExpanded ? 'Jakarta Focus Search' : 'Focus'}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        )}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="flex items-center gap-3 bg-white/40 px-3 py-2.5 rounded-lg border border-slate-200 mb-4 group focus-within:border-blue-500/50 shadow-sm transition-all">
          <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik wilayah (Blok M, GBK...)"
            className="bg-transparent border-none outline-none text-xs text-slate-900 font-medium w-full placeholder-slate-400"
          />
        </div>
        {}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-bold transition-all border ${
              !selectedGroup
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            All Jakarta
          </button>
          {groups.map(group => (
            <button
              key={group}
              onClick={() => {
                setSelectedGroup(group);
                const firstDevice = DEVICES_INFO.find(d => d.group === group);
                const sensor = pollutantData?.data?.find((s: any) => s.id === (firstDevice?.id || ''));
                if (sensor) {
                  onNavigate({ lng: sensor.lng, lat: sensor.lat, zoom: 14 });
                }
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold transition-all border ${
                selectedGroup === group
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar pb-4">
          {filtered.map((p) => (
            <button
              key={p.category === 'device' ? p.id : p.name}
              onClick={() => onNavigate({ lng: p.center[0], lat: p.center[1], zoom: p.zoom })}
              className="group text-left p-2.5 bg-white/50 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2.5 mb-1">
                {p.category === 'device' ? (
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: p.color }}
                  />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-[11px] font-bold truncate">
                  {p.name}
                </span>
              </div>
              <div className="flex items-center justify-between ml-5">
                <div className={`text-[8px] font-bold tracking-wider uppercase ${p.category === 'device' ? 'text-slate-400' : 'text-blue-400'}`}>
                  {p.category === 'device' ? p.group : p.type}
                </div>
                {p.category === 'device' && (
                  <div className="text-[8px] font-mono text-slate-300">
                    {p.label}
                  </div>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-4 text-[10px] text-slate-400 italic">
              Wilayah tidak ditemukan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Search, MapPin, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_JAKARTA_REGIONS } from '@/features/map/utils/regions';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { useFilterStore } from '@/store/useFilterStore';
import { DEVICES_INFO } from '@/constants/devices';

interface Props {
  onNavigate: (coords: { lat: number; lng: number; zoom: number }) => void;
}

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

    let filteredDevices = DEVICES_INFO;
    if (selectedGroup) {
      filteredDevices = filteredDevices.filter(d => d.group === selectedGroup);
    }
    if (query) {
      filteredDevices = filteredDevices.filter(d =>
        d.label.toLowerCase().includes(lowercaseQuery) ||
        d.name.toLowerCase().includes(lowercaseQuery) ||
        d.group.toLowerCase().includes(lowercaseQuery) ||
        d.jenis.toLowerCase().includes(lowercaseQuery)
      );
    }

    filteredDevices.forEach(device => {
      const sensor = pollutantData?.data?.find((s: any) => s.id === device.id);
      const lat = sensor?.lat ?? device.lat;
      const lng = sensor?.lng ?? device.lng;

      let displayColor = device.color;
      if (device.group.includes('Blok M')) displayColor = '#22C55E';
      else if (device.group.includes('GBK')) displayColor = '#EAB308';
      else if (device.group.includes('Dukuh Atas')) displayColor = '#A855F7';
      else if (device.group === 'Clarity') displayColor = '#3B82F6';

      searchResults.push({
        id: device.id,
        name: device.name,
        label: device.label,
        jenis: device.jenis,
        group: device.group,
        color: displayColor,
        lat,
        lng,
        type: 'Sensor Alat',
        center: [lng, lat],
        zoom: 16,
        category: 'device',
      });
    });

    return searchResults;
  }, [query, pollutantData, selectedGroup, pollutant]);

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
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

      <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 mt-4' : 'hidden'}`}>
        <div className="flex items-center gap-3 bg-white/40 px-3 py-2.5 rounded-lg border border-slate-200 mb-4 group focus-within:border-blue-500/50 shadow-sm transition-all">
          <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari sensor, wilayah, atau jenis..."
            className="bg-transparent border-none outline-none text-xs text-slate-900 font-medium w-full placeholder-slate-400"
          />
        </div>

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
                if (firstDevice) {
                  const sensor = pollutantData?.data?.find((s: any) => s.id === firstDevice.id);
                  onNavigate({
                    lng: sensor?.lng ?? firstDevice.lng,
                    lat: sensor?.lat ?? firstDevice.lat,
                    zoom: 14,
                  });
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

        <div className="grid grid-cols-1 gap-2 pb-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
          {filtered.map((p) => (
            <button
              key={p.category === 'device' ? p.id : p.name}
              onClick={() => onNavigate({ lng: p.center[0], lat: p.center[1], zoom: p.zoom })}
              className="group text-left bg-white/50 hover:bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-slate-900 rounded-xl transition-all shadow-sm hover:shadow-md overflow-hidden"
            >
              {p.category === 'device' ? (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-[11px] font-black text-slate-800 leading-tight">
                        {p.name}
                      </span>
                    </div>
                    <span
                      className="text-[8px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1"
                      style={{
                        backgroundColor: p.jenis === 'KRE' ? '#22C55E20' : '#3B82F620',
                        color: p.jenis === 'KRE' ? '#16A34A' : '#2563EB',
                      }}
                    >
                      {p.jenis}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-x-2 text-[8px] font-mono bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[7px]">Kode</span>
                      <span className="text-slate-700 font-black">{p.label}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[7px]">Lat</span>
                      <span className="text-slate-700 font-black">{Number(p.lat).toFixed(5)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[7px]">Lng</span>
                      <span className="text-slate-700 font-black">{Number(p.lng).toFixed(5)}</span>
                    </div>
                  </div>

                  <div className="mt-1.5 text-[7px] font-bold uppercase tracking-wider text-slate-400">
                    {p.group}
                  </div>
                </div>
              ) : (
                <div className="p-2.5">
                  <div className="flex items-center gap-2.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{p.name}</span>
                  </div>
                  <div className="text-[8px] font-bold tracking-wider uppercase text-blue-400 ml-6">
                    {p.type}
                  </div>
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-4 text-[10px] text-slate-400 italic">
              Sensor atau wilayah tidak ditemukan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
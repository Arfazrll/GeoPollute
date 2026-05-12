import { useEffect, useState } from 'react';
import geo from 'geojs';
import { AQI_CATEGORY } from '@/features/map/utils/spatialLogic';
import type { SensorReading } from '@/types';

interface Props {
  map: any;
  pointFeature: any;
}

interface PopupState {
  sensor: SensorReading;
  screenX: number;
  screenY: number;
}

function Sparkline({ data }: { data: number[] }) {
  const width = 120;
  const height = 30;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - ((val - min) / range) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="mt-2 overflow-visible">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <path
        d={`M ${points} L ${width - padding},${height} L ${padding},${height} Z`}
        fill="url(#sparkline-gradient)"
      />
    </svg>
  );
}

export function PopupDetail({ map, pointFeature }: Props) {
  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => {
    if (!pointFeature || !map) return;

    const handleClick = (evt: any) => {
      const sensor = evt.data as SensorReading;
      const screen = map.gcsToDisplay({ x: sensor.lng, y: sensor.lat });
      setPopup({ sensor, screenX: screen.x, screenY: screen.y });
    };

    const closeIfMoving = () => setPopup(null);

    pointFeature.geoOn(geo.event.feature.mouseclick, handleClick);
    map.geoOn(geo.event.pan, closeIfMoving);
    map.geoOn(geo.event.zoom, closeIfMoving);

    return () => {
      pointFeature.geoOff(geo.event.feature.mouseclick, handleClick);
      map.geoOff(geo.event.pan, closeIfMoving);
      map.geoOff(geo.event.zoom, closeIfMoving);
    };
  }, [pointFeature, map]);

  if (!popup) return null;

  const { sensor, screenX, screenY } = popup;

  const mockHistory = Array.from({ length: 12 }, () =>
    sensor.pm25 + (Math.random() - 0.5) * 10
  );

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: screenX,
        top: screenY - 12,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="glass text-white p-4 rounded-xl shadow-2xl min-w-[220px] pointer-events-auto relative">
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 glass border-t-0 border-l-0" />

        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Sensor ID: {sensor.id}
          </span>
          <button
            onClick={() => setPopup(null)}
            className="text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1 text-[11px] font-medium text-white/70">
          <div className="flex justify-between">
            <span>LAT:</span>
            <span className="text-white">{sensor.lat.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>LNG:</span>
            <span className="text-white">{sensor.lng.toFixed(4)}</span>
          </div>
          <div className="pt-2 border-t border-white/5 mt-2">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-white text-lg font-bold">
                  {sensor.pm25} <span className="text-[10px] font-normal opacity-50">µg/m³</span>
                </div>
                <div className="text-[9px] font-bold text-blue-400 tracking-tighter">
                  {AQI_CATEGORY(sensor.pm25)}
                </div>
              </div>
              <div className="text-right">
                <Sparkline data={mockHistory} />
                <div className="text-[8px] opacity-40 mt-1">Last 30 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
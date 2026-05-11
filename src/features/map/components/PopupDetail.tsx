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
  const time = new Date(sensor.timestamp).toLocaleString('id-ID');

  return (
    <div
      className="absolute z-20"
      style={{
        left: screenX + 12,
        top: screenY,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="bg-neutral-900/95 text-white font-mono text-[11px] p-3 rounded border border-white/20 min-w-[200px]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">SENSOR {sensor.id}</span>
          <button
            onClick={() => setPopup(null)}
            className="opacity-60 hover:opacity-100 ml-2"
          >
            ✕
          </button>
        </div>
        <div>LAT: {sensor.lat.toFixed(4)}</div>
        <div>LNG: {sensor.lng.toFixed(4)}</div>
        <div className="mt-1.5">
          PM2.5: <span className="font-bold">{sensor.pm25} µg/m³</span>
        </div>
        <div className="text-amber-400">{AQI_CATEGORY(sensor.pm25)}</div>
        <div className="mt-1.5 opacity-60 text-[10px]">{time}</div>
      </div>
    </div>
  );
}
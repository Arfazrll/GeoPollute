import { useEffect, useRef, useState } from 'react';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { useInterpolation } from '@/features/map/hooks/useInterpolation';
import { useFilterStore } from '@/store/useFilterStore';
import { getPollutantColor } from '@/features/map/utils/spatialLogic';
import { PopupDetail } from './PopupDetail';
import { type GeoJSMap, type GeoJSLayer, type GeoJSFeature } from '@/types';
import { DEVICES_INFO } from '@/constants/devices';
import geo from 'geojs';

interface Props {
  featureLayer: GeoJSLayer | null;
  map: GeoJSMap | null;
}

export function PollutantLayer({ featureLayer, map }: Props) {
  const { pollutant, selectedGroup } = useFilterStore();
  const { data: pollutantData, isError } = usePollutantData();
  const { grid } = useInterpolation(pollutantData?.data);
  const polygonRef = useRef<GeoJSFeature | null>(null);
  const [hoveredSensor, setHoveredSensor] = useState<any>(null);

  useEffect(() => {
    if (!featureLayer) return;

    // IF DATA IS EMPTY, CLEAR THE MAP AND EXIT
    if (!grid) {
      if (polygonRef.current) {
        featureLayer.deleteFeature(polygonRef.current);
        polygonRef.current = null;
      }
      return;
    }

    const features = (grid as any).features;
    if (!polygonRef.current) {
      polygonRef.current = featureLayer
        .createFeature('polygon')
        .polygon((d: any) => ({ outer: d.geometry.coordinates[0] }))
        .position((d: any) => {
          if (!d || d.length < 2) return { x: 0, y: 0, z: 0 };
          return { x: Number(d[0]) || 0, y: Number(d[1]) || 0, z: 0 };
        })
        .style({
          fillColor: (_v: any, _i: number, d: any) => getPollutantColor(d.properties[pollutant] || 0, pollutant),
          fillOpacity: (_v: any, _i: number, d: any) => {
            const dist = d.properties.dist || 0;
            const baseOpacity = isError ? 0.25 : 0.55;
            if (dist <= 3.5) return baseOpacity;
            if (dist >= 5.0) return 0;
            return baseOpacity * (1 - (dist - 3.5) / 1.5);
          },
          stroke: false,
        });
    }
    
    polygonRef.current
      .data(features)
      .style({
        fillColor: (_v: any, _i: number, d: any) => getPollutantColor(d?.properties?.[pollutant] ?? 0, pollutant),
        fillOpacity: (_v: any, _i: number, d: any) => {
          const dist = d.properties.dist || 0;
          const baseOpacity = isError ? 0.25 : 0.55;
          if (dist <= 3.5) return baseOpacity;
          if (dist >= 5.0) return 0;
          return baseOpacity * (1 - (dist - 3.5) / 1.5);
        }
      })
      .draw();
  }, [grid, isError, featureLayer, pollutant]);

  useEffect(() => {
    if (!map) return;

    const existingContainer = document.getElementById('manual-marker-overlay');
    if (existingContainer) existingContainer.remove();

    const container = document.createElement('div');
    container.id = 'manual-marker-overlay';
    container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1000;';

    const mapNode = map.node() as any;
    const parent = mapNode.appendChild ? mapNode : (mapNode[0] || mapNode);
    parent.appendChild(container);

    const apiSensorMap = new Map<string, any>();
    (pollutantData?.data ?? []).forEach((s: any) => apiSensorMap.set(s.id, s));

    const allDevices = selectedGroup
      ? DEVICES_INFO.filter(d => d.group === selectedGroup)
      : DEVICES_INFO;

    const activeSensors = allDevices.map(device => {
      const api = apiSensorMap.get(device.id);
      return {
        id: device.id,
        lat: api?.lat ?? device.lat,
        lng: api?.lng ?? device.lng,
        ...(api ?? {}),
      };
    });

    const markerMap = new Map<string, HTMLElement>();

    activeSensors.forEach((d: any) => {
      const info = DEVICES_INFO.find(i =>
        i.id === d.id ||
        i.id.replace('LCS-', '') === String(d.id) ||
        String(d.id).replace('LCS-', '') === i.id.replace('LCS-', '')
      );
      let color = '#3B82F6';
      if (info) {
        if (info.group.includes('Blok M')) color = '#22C55E';
        else if (info.group.includes('GBK')) color = '#EAB308';
        else if (info.group.includes('Dukuh Atas')) color = '#A855F7';
        else if (info.group.includes('Clarity')) color = '#3B82F6';
        else color = info.color;
      }

      const marker = document.createElement('div');
      marker.className = 'manual-pin-marker';
      marker.style.cssText = 'position:absolute;top:0;left:0;pointer-events:auto;cursor:pointer;will-change:transform;';
      marker.innerHTML = `
        <div class="pin-wrapper" style="transform:translate(-12px,-24px);transition:transform 0.2s ease;color:${color};">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
            <path d="M16 10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4m-6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"/>
            <path d="M11.42 21.81c.17.12.38.19.58.19s.41-.06.58-.19c.3-.22 7.45-5.37 7.42-11.82 0-4.41-3.59-8-8-8s-8 3.59-8 8c-.03 6.44 7.12 11.6 7.42 11.82M12 4c3.31 0 6 2.69 6 6 .02 4.44-4.39 8.43-6 9.74-1.61-1.31-6.02-5.29-6-9.74 0-3.31 2.69-6 6-6"/>
          </svg>
        </div>
      `;

      marker.onmouseenter = () => {
        const pos = map.gcsToDisplay({ x: Number(d.lng), y: Number(d.lat) });
        setHoveredSensor({ ...d, ...pos });
      };
      marker.onmouseleave = () => setHoveredSensor(null);

      container.appendChild(marker);
      markerMap.set(d.id, marker);
    });

    const styleId = 'manual-marker-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `.manual-pin-marker:hover .pin-wrapper{transform:translate(-12px,-24px) scale(1.4) translateY(-6px) !important;filter:brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.5)) !important;z-index:10000;}`;
      document.head.appendChild(style);
    }

    let rafId = 0;
    const updatePositions = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        activeSensors.forEach((d: any) => {
          const marker = markerMap.get(d.id);
          if (!marker) return;
          const pos = map.gcsToDisplay({ x: Number(d.lng), y: Number(d.lat) });
          marker.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        });
      });
    };

    updatePositions();

    const hidePopup = () => setHoveredSensor(null);
    map.geoOn(geo.event.pan, updatePositions);
    map.geoOn(geo.event.zoom, updatePositions);
    map.geoOn(geo.event.pan, hidePopup);
    map.geoOn(geo.event.zoom, hidePopup);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      map.geoOff(geo.event.pan, updatePositions);
      map.geoOff(geo.event.zoom, updatePositions);
      map.geoOff(geo.event.pan, hidePopup);
      map.geoOff(geo.event.zoom, hidePopup);
      if (container.parentNode) container.parentNode.removeChild(container);
    };
  }, [pollutantData, map, selectedGroup, pollutant]);

  return (
    <>
      {hoveredSensor && (
        <PopupDetail
          map={map}
          selectedSensor={hoveredSensor}
          x={hoveredSensor.x}
          y={hoveredSensor.y}
        />
      )}
    </>
  );
}
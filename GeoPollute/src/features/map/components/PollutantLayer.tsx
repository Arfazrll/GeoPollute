import { useEffect, useRef, useState } from 'react';
import { usePollutantData } from '@/features/map/hooks/usePollutantData';
import { useInterpolation } from '@/features/map/hooks/useInterpolation';
import { pm25ToColor } from '@/features/map/utils/spatialLogic';
import { PopupDetail } from './PopupDetail';

interface Props {
  featureLayer: any;
  map: any;
}

export function PollutantLayer({ featureLayer, map }: Props) {
  const { data, isError } = usePollutantData();
  const grid = useInterpolation(data?.data);

  const polygonRef = useRef<any>(null);
  const pointRef = useRef<any>(null);
  const [pointReady, setPointReady] = useState(false);

  useEffect(() => {
    if (!grid) return;

    const features = (grid as any).features;
    const opacity = isError ? 0.3 : 0.6;

    if (!polygonRef.current) {
      polygonRef.current = featureLayer
        .createFeature('polygon')
        .polygon((d: any) => ({ outer: d.geometry.coordinates[0] }))
        .position((d: any) => ({ x: d[0], y: d[1] }))
        .style({
          fillColor: (_v: any, _i: number, d: any) => pm25ToColor(d.properties.pm25),
          fillOpacity: opacity,
          stroke: false,
        });
    }

    polygonRef.current
      .data(features)
      .style('fillOpacity', opacity)
      .draw();
  }, [grid, isError, featureLayer]);

  useEffect(() => {
    if (!data?.data) return;

    if (!pointRef.current) {
      pointRef.current = featureLayer
        .createFeature('point')
        .position((d: any) => ({ x: d.lng, y: d.lat }))
        .style({
          radius: 6,
          fillColor: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 2,
          fillOpacity: 1,
        });
      setPointReady(true);
    }

    pointRef.current.data(data.data).draw();
  }, [data, featureLayer]);

  return pointReady ? <PopupDetail map={map} pointFeature={pointRef.current} /> : null;
}
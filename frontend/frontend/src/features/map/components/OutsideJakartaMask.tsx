import { useEffect, useRef } from 'react';
import jakartaGeoJSONRaw from '@/assets/geo/jakarta-kota.geojson?raw';
import { type GeoJSLayer, type GeoJSFeature } from '@/types';
interface Props {
  featureLayer: GeoJSLayer | null;
}
export function OutsideJakartaMask({ featureLayer }: Props): null {
  const maskRef = useRef<GeoJSFeature | null>(null);
  useEffect(() => {
    if (!featureLayer) return;
    try {
      if (!maskRef.current) {
        maskRef.current = featureLayer
          .createFeature('polygon')
          .style({
            fillColor: '#f8fafc',
            fillOpacity: 0.2,
            stroke: false,
          });
      }
      const data = JSON.parse(jakartaGeoJSONRaw);
      maskRef.current
        .data(data.features)
        .polygon((d: any) => ({
          outer: d.geometry.type === 'MultiPolygon'
            ? d.geometry.coordinates[0][0]
            : d.geometry.coordinates[0]
        }))
        .position((coord: any) => ({
          x: Number(coord[0]) || 0,
          y: Number(coord[1]) || 0,
          z: 0
        }))
        .draw();
    } catch (err) {
      console.error('Error in OutsideJakartaMask drawing:', err);
    }
    return () => {
      if (maskRef.current && featureLayer) {
        featureLayer.deleteFeature(maskRef.current);
        maskRef.current = null;
      }
    };
  }, [featureLayer]);
  return null;
}
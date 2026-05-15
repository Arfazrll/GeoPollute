import { useEffect, useRef } from 'react';
import jakartaGeoJSON from '@/assets/geo/jakarta-kota.geojson?raw';
import { FOCUS_STYLES } from '../utils/spatialLogic';
import { type GeoJSLayer, type GeoJSFeature } from '@/types';
interface Props {
  featureLayer: GeoJSLayer | null;
  onAreaHover: (name: string | null) => void;
}
export function JakartaBoundary({ featureLayer, onAreaHover }: Props): null {
  const lineRef = useRef<GeoJSFeature | null>(null);
  const fillRef = useRef<GeoJSFeature | null>(null);
  useEffect(() => {
    if (!featureLayer) return;
    const shapes: any[] = [];
    try {
      if (jakartaGeoJSON) {
        const data = JSON.parse(jakartaGeoJSON.trim());
        const allFeatures = data.features || (data.type === 'Feature' ? [data] : []);
        allFeatures.forEach((f: any) => {
            const name = f.properties.NAME_2 || f.properties.NAME || f.properties.WADMKK ||
                         f.properties.Propinsi || f.properties.name || '';
            const isJakarta = name.toUpperCase().includes('JAKARTA') ||
                              f.properties.ID === 14 ||
                              f.properties.KODE === 31;
            if (isJakarta) {
                const geom = f.geometry;
                if (geom.type === 'Polygon') {
                    shapes.push({ coords: geom.coordinates, name });
                } else if (geom.type === 'MultiPolygon') {
                    geom.coordinates.forEach((poly: any) => {
                        shapes.push({ coords: poly, name });
                    });
                }
            }
        });
      }
    } catch (e) {
      console.error('Failed to parse Jakarta GeoJSON for boundary', e);
      return;
    }
    if (!featureLayer || shapes.length === 0) return;
    try {
      lineRef.current = featureLayer
        .createFeature('line')
        .data(shapes)
        .line((d: any) => d.coords[0])
        .position((coord: any) => ({ x: Number(coord[0]), y: Number(coord[1]), z: 0 }))
        .style({
          strokeColor: FOCUS_STYLES.inside.strokeColor,
          strokeWidth: FOCUS_STYLES.inside.strokeWidth,
          strokeOpacity: FOCUS_STYLES.inside.strokeOpacity,
        });
      fillRef.current = featureLayer
        .createFeature('polygon')
        .data(shapes)
        .polygon((d: any) => ({ outer: d.coords[0], inner: d.coords.slice(1) }))
        .position((coord: any) => ({ x: Number(coord[0]), y: Number(coord[1]), z: 0 }))
        .style({
          fillColor: 'transparent',
          fillOpacity: 0,
          stroke: false
        });
      lineRef.current.draw();
      fillRef.current.draw();
      fillRef.current.geoOn('geo_feature_mouseover', (evt: any) => {
          if (fillRef.current) {
              fillRef.current.style(evt.data, {
                  fillColor: FOCUS_STYLES.hover.fillColor,
                  fillOpacity: 1,
              });
              fillRef.current.draw();
          }
          if (lineRef.current) {
              lineRef.current.style(evt.data, {
                  strokeColor: FOCUS_STYLES.hover.strokeColor,
                  strokeWidth: FOCUS_STYLES.hover.strokeWidth,
                  strokeOpacity: FOCUS_STYLES.hover.strokeOpacity,
              });
              lineRef.current.draw();
          }
          onAreaHover(evt.data.name);
      });
      fillRef.current.geoOn('geo_feature_mouseout', (evt: any) => {
          if (fillRef.current) {
              fillRef.current.style(evt.data, {
                  fillColor: 'transparent',
                  fillOpacity: 0,
              });
              fillRef.current.draw();
          }
          if (lineRef.current) {
              lineRef.current.style(evt.data, {
                  strokeColor: FOCUS_STYLES.inside.strokeColor,
                  strokeWidth: FOCUS_STYLES.inside.strokeWidth,
                  strokeOpacity: FOCUS_STYLES.inside.strokeOpacity,
              });
              lineRef.current.draw();
          }
          onAreaHover(null);
      });
    } catch (err) {
      console.error('Error in JakartaBoundary drawing:', err);
    }
    return () => {
      [lineRef, fillRef].forEach(ref => {
        if (ref.current) {
            ref.current.geoOff();
            featureLayer.deleteFeature(ref.current);
            ref.current = null;
        }
      });
    };
  }, [featureLayer, onAreaHover]);
  return null;
}
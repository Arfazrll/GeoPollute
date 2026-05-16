import { useState, useEffect } from 'react';
import interpolate from '@turf/interpolate';
import type { SensorReading } from '@/types';
import { sensorsToFeatureCollection } from '@/features/map/utils/geoJsonHelpers';
import { useFilterStore } from '@/store/useFilterStore';
import { IDW_CELL_SIZE_KM, IDW_WEIGHT, IDW_UNITS } from '../utils/spatialLogic';
import { DEVICES_INFO } from '@/constants/devices';
export function useInterpolation(sensors: SensorReading[] | undefined) {
  const { pollutant, selectedGroup } = useFilterStore();
  const [grid, setGrid] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  useEffect(() => {
    if (!sensors || sensors.length === 0) {
      setGrid(null);
      return;
    }
    const activeSensors = sensors.filter(s => {
      if (!selectedGroup) return true;
      const info = DEVICES_INFO.find(d => d.id === s.id);
      return info?.group === selectedGroup;
    });
    if (activeSensors.length === 0) {
      setGrid(null);
      return;
    }
    setIsCalculating(true);
    const timeout = setTimeout(() => {
      const collection = sensorsToFeatureCollection(activeSensors);
      const options: any = {
        gridType: 'square',
        property: pollutant,
        units: IDW_UNITS,
        weight: IDW_WEIGHT,
      };
      try {
        const lats = activeSensors.map(s => s.lat);
        const lngs = activeSensors.map(s => s.lng);
        const expandedBbox = [
          Math.min(...lngs) - 0.05,
          Math.min(...lats) - 0.05,
          Math.max(...lngs) + 0.05,
          Math.max(...lats) + 0.05
        ];
        const fullGrid = interpolate(collection, IDW_CELL_SIZE_KM, { ...options, bbox: expandedBbox });
        const filteredFeatures = fullGrid.features.filter((feature: any) => {
          const coords = feature.geometry.coordinates[0][0];
          let minDistSq = 999999;
          const R_INV = 1 / 111.32;
          const THRESHOLD_SQ = Math.pow(3.0 * R_INV, 2);
          for (let i = 0; i < activeSensors.length; i++) {
            const s = activeSensors[i];
            const dx = s.lng - coords[0];
            const dy = s.lat - coords[1];
            const d2 = dx * dx + dy * dy;
            if (d2 < minDistSq) minDistSq = d2;
          }
          feature.properties.dist = Math.sqrt(minDistSq) * 111.32;
          return minDistSq <= THRESHOLD_SQ;
        });
        setGrid({ ...fullGrid, features: filteredFeatures });
      } catch (e) {
        console.error('Interpolation failed', e);
      } finally {
        setIsCalculating(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [sensors, pollutant, selectedGroup]);
  return { grid, isCalculating };
}
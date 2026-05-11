import { useMemo } from 'react';
import interpolate from '@turf/interpolate';
import type { SensorReading } from '@/types';
import { sensorsToFeatureCollection } from '@/features/map/utils/geoJsonHelpers';
import {
  IDW_CELL_SIZE_KM,
  IDW_WEIGHT,
  IDW_UNITS,
} from '@/features/map/utils/spatialLogic';

export function useInterpolation(sensors: SensorReading[] | undefined) {
  return useMemo(() => {
    if (!sensors || sensors.length === 0) return null;

    const start = performance.now();
    const points = sensorsToFeatureCollection(sensors);
    const grid = interpolate(points, IDW_CELL_SIZE_KM, {
      gridType: 'hex',
      property: 'pm25',
      units: IDW_UNITS,
      weight: IDW_WEIGHT,
    });
    const duration = performance.now() - start;

    if (duration > 500) {
      console.warn(`IDW took ${duration.toFixed(0)}ms (target N01: <500ms)`);
    }

    return grid;
  }, [sensors]);
}
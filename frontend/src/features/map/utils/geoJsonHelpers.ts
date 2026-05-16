import { featureCollection, point } from '@turf/helpers';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { SensorReading } from '@/types';
type SensorProps = { pm25: number; co: number; no2: number; id: string; timestamp: string };
export function sensorsToFeatureCollection(
  sensors: SensorReading[]
): FeatureCollection<Point, SensorProps> {
  const features: Feature<Point, SensorProps>[] = sensors.map((s) =>
    point([s.lng, s.lat], {
      pm25: s.pm25 ?? 0,
      co: s.co ?? 0,
      no2: s.no2 ?? 0,
      id: s.id,
      timestamp: s.timestamp
    })
  );
  return featureCollection(features);
}
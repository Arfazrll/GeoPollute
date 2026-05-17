import type { FeatureCollection, Point } from 'geojson';
import type { SensorReading } from '@/types';
type SensorProps = {
    pm25: number;
    co: number;
    no2: number;
    id: string;
    timestamp: string;
};
export declare function sensorsToFeatureCollection(sensors: SensorReading[]): FeatureCollection<Point, SensorProps>;
export {};

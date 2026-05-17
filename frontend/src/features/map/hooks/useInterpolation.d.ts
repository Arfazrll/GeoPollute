import type { SensorReading } from '@/types';
export declare function useInterpolation(sensors: SensorReading[] | undefined): {
    grid: any;
    isCalculating: boolean;
};

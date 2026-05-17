import type { SensorReading, GeoJSMap } from '@/types';
interface Props {
    map: GeoJSMap | null;
    selectedSensor: SensorReading | null;
    x: number;
    y: number;
}
export declare function PopupDetail({ map, selectedSensor, x, y }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};

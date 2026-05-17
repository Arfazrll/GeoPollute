import { type GeoJSMap, type GeoJSLayer } from '@/types';
interface Props {
    featureLayer: GeoJSLayer | null;
    map: GeoJSMap | null;
}
export declare function PollutantLayer({ featureLayer, map }: Props): import("react/jsx-runtime").JSX.Element;
export {};

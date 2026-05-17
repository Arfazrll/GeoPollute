import { type GeoJSLayer } from '@/types';
interface Props {
    featureLayer: GeoJSLayer | null;
    onAreaHover: (name: string | null) => void;
}
export declare function JakartaBoundary({ featureLayer, onAreaHover }: Props): null;
export {};

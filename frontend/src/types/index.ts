export type FilterMode = '2m' | '1h' | '1d' | 'custom';
export type PollutantType = 'pm25' | 'co' | 'no2';
export interface SensorReading {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  pm25: number;
  co: number;
  no2: number;
  timestamp: string;
  history?: { value: number; timestamp: string }[];
}
export interface PollutantResponse {
  filter: FilterMode;
  data: SensorReading[];
}
export interface GeoJSMap {
  node: () => HTMLElement;
  center: { x: number; y: number };
  zoom: number;
  size: (dims: { width: number; height: number }) => void;
  transition: (options: { center: { x: number; y: number }; zoom: number; duration: number }) => void;
  createLayer: (type: string, options?: any) => GeoJSLayer;
  exit: () => void;
  gcsToDisplay: (pos: { x: number; y: number }) => { x: number; y: number };
  geoOn: (event: string, callback: (evt: any) => void) => void;
  geoOff: (event?: string, callback?: (evt: any) => void) => void;
  deleteLayer: (layer: GeoJSLayer) => void;
}
export interface GeoJSLayer {
  createFeature: (type: string, options?: any) => GeoJSFeature;
  deleteFeature: (feature: GeoJSFeature) => void;
}
export interface GeoJSFeature {
  data: (data: any[]) => GeoJSFeature;
  position: (callback: (d: any) => { x: number; y: number; z: number }) => GeoJSFeature;
  style: (styleOrCallback: any, value?: any) => GeoJSFeature;
  draw: () => void;
  polygon: (callback: (d: any) => { outer: number[][]; inner?: number[][] }) => GeoJSFeature;
  line: (callback: (d: any) => number[][]) => GeoJSFeature;
  intensity: (callback: (d: any) => number) => GeoJSFeature;
  geoOn: (event: string, callback: (evt: any) => void) => void;
  geoOff: (event?: string, callback?: (evt: any) => void) => void;
  html: (callback: (d: any) => string) => GeoJSFeature;
}
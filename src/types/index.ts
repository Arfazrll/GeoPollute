export type FilterMode = '2m' | '1h' | '1d';

export interface SensorReading {
  id: string;
  lat: number;
  lng: number;
  pm25: number;
  timestamp: string;
}

export interface PollutantResponse {
  filter: FilterMode;
  data: SensorReading[];
}
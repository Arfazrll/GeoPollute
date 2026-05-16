export const IDW_CELL_SIZE_KM = 0.12;
export const IDW_WEIGHT = 2;
export const IDW_UNITS = 'kilometers' as const;
export const POLLUTANT_THRESHOLDS = {
  pm25: {
    good: 25,
    moderate: 55,
  },
  co: {
    good: 700,
    moderate: 1000,
  },
  no2: {
    good: 40,
    moderate: 80,
  }
};
export const COLORS = {
  GOOD: '#22C55E',
  MODERATE: '#EAB308',
  UNHEALTHY: '#EF4444',
  NO_DATA: '#94A3B8', // Neutral Slate
};
export const getPollutantCategory = (value: number, type: 'pm25' | 'co' | 'no2'): string => {
  if (value <= 0) return 'NO_DATA';
  const threshold = POLLUTANT_THRESHOLDS[type];
  if (value < threshold.good) return 'GOOD';
  if (value <= threshold.moderate) return 'MODERATE';
  return 'UNHEALTHY';
};
export const getPollutantColor = (value: number, type: 'pm25' | 'co' | 'no2' = 'pm25'): string => {
  const category = getPollutantCategory(value, type);
  return COLORS[category as keyof typeof COLORS] || COLORS.NO_DATA;
};
export const AQI_CATEGORY = (pm25: number): string => {
  return getPollutantCategory(pm25, 'pm25');
};
export const MAP_CENTER = { x: 106.8456, y: -6.2088 };
export const MAP_ZOOM = 11;
export const POLLING_INTERVAL_MS = 60_000;
export const JAKARTA_BOUNDS = {
  minLng: 106.6894,
  maxLng: 106.9728,
  minLat: -6.3725,
  maxLat: -6.0890,
};
export const FOCUS_STYLES = {
  inside: {
    fillColor: 'transparent',
    strokeColor: '#000000',
    strokeWidth: 3,
    strokeOpacity: 0.8,
  },
  outside: {
    fillColor: '#f1f5f9',
    fillOpacity: 0.65,
  },
  hover: {
    fillColor: 'rgba(59, 130, 246, 0.1)',
    strokeColor: '#2563eb',
    strokeWidth: 3,
    strokeOpacity: 0.8,
  }
};
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
export const TILE_SUBDOMAINS = 'abc';
export const TILE_ATTRIBUTION = ' ';
export function pm25ToColor(value: number): string {
  return getPollutantColor(value, 'pm25');
}
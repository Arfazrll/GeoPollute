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
  NO_DATA: '#94A3B8', 
};
export const getPollutantCategory = (value: number, type: 'pm25' | 'co' | 'no2'): string => {
  if (value <= 0) return 'NO_DATA';
  const threshold = POLLUTANT_THRESHOLDS[type];
  if (value < threshold.good) return 'GOOD';
  if (value <= threshold.moderate) return 'MODERATE';
  return 'UNHEALTHY';
};
const parseHex = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};
const interpolateRgb = (color1: string, color2: string, factor: number) => {
  const c1 = parseHex(color1);
  const c2 = parseHex(color2);
  const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  return `rgb(${r}, ${g}, ${b})`;
};
export const getPollutantColor = (value: number, type: 'pm25' | 'co' | 'no2' = 'pm25'): string => {
  if (value <= 0) return COLORS.NO_DATA;
  const t = POLLUTANT_THRESHOLDS[type];
  const w1 = t.good * 0.2;
  const w2 = (t.moderate - t.good) * 0.2;
  if (value <= t.good - w1) return COLORS.GOOD;
  if (value > t.good - w1 && value <= t.good + w1) {
    const factor = (value - (t.good - w1)) / (2 * w1);
    return interpolateRgb(COLORS.GOOD, COLORS.MODERATE, factor);
  }
  if (value > t.good + w1 && value <= t.moderate - w2) return COLORS.MODERATE;
  if (value > t.moderate - w2 && value <= t.moderate + w2) {
    const factor = (value - (t.moderate - w2)) / (2 * w2);
    return interpolateRgb(COLORS.MODERATE, COLORS.UNHEALTHY, factor);
  }
  return COLORS.UNHEALTHY;
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
export const TILE_URL = import.meta.env.VITE_TILE_URL as string;
export const TILE_SUBDOMAINS = 'abc';
export const TILE_ATTRIBUTION = ' ';
export function pm25ToColor(value: number): string {
  return getPollutantColor(value, 'pm25');
}
export const IDW_CELL_SIZE_KM = 0.8;
export const IDW_WEIGHT = 2;
export const IDW_UNITS = 'kilometers' as const;

export const AQI_COLOR_STOPS: Array<[number, string]> = [
  [0, '#22c55e'],   // Green-500
  [12, '#eab308'],  // Yellow-500
  [35, '#f97316'],  // Orange-500
  [55, '#ef4444'],  // Red-500
  [150, '#a855f7'], // Purple-500
  [250, '#701a75'], // Fuchsia-900
];

export const AQI_CATEGORY = (pm25: number): string => {
  if (pm25 <= 12) return 'GOOD';
  if (pm25 <= 35) return 'MODERATE';
  if (pm25 <= 55) return 'UNHEALTHY (SENSITIVE)';
  if (pm25 <= 150) return 'UNHEALTHY';
  if (pm25 <= 250) return 'VERY UNHEALTHY';
  return 'HAZARDOUS';
};

export const MAP_CENTER = { x: 106.8456, y: -6.2088 };
export const MAP_ZOOM = 11;
export const POLLING_INTERVAL_MS = 120_000;

export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
export const TILE_SUBDOMAINS = 'abc';
export const TILE_ATTRIBUTION = '© Birulangitanjay';

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function pm25ToColor(value: number): string {
  if (value <= AQI_COLOR_STOPS[0][0]) return AQI_COLOR_STOPS[0][1];

  for (let i = 0; i < AQI_COLOR_STOPS.length - 1; i++) {
    const [v1, c1] = AQI_COLOR_STOPS[i];
    const [v2, c2] = AQI_COLOR_STOPS[i + 1];
    if (value >= v1 && value <= v2) {
      const t = (value - v1) / (v2 - v1);
      const [r1, g1, b1] = hexToRgb(c1);
      const [r2, g2, b2] = hexToRgb(c2);
      return `rgb(${lerp(r1, r2, t)},${lerp(g1, g2, t)},${lerp(b1, b2, t)})`;
    }
  }
  return AQI_COLOR_STOPS[AQI_COLOR_STOPS.length - 1][1];
}
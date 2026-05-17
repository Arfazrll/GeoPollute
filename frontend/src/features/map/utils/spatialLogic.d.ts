export declare const IDW_CELL_SIZE_KM = 0.12;
export declare const IDW_WEIGHT = 2;
export declare const IDW_UNITS: "kilometers";
export declare const POLLUTANT_THRESHOLDS: {
    pm25: {
        good: number;
        moderate: number;
    };
    co: {
        good: number;
        moderate: number;
    };
    no2: {
        good: number;
        moderate: number;
    };
};
export declare const COLORS: {
    GOOD: string;
    MODERATE: string;
    UNHEALTHY: string;
    NO_DATA: string;
};
export declare const getPollutantCategory: (value: number, type: "pm25" | "co" | "no2") => string;
export declare const getPollutantColor: (value: number, type?: "pm25" | "co" | "no2") => string;
export declare const AQI_CATEGORY: (pm25: number) => string;
export declare const MAP_CENTER: {
    x: number;
    y: number;
};
export declare const MAP_ZOOM = 11;
export declare const POLLING_INTERVAL_MS = 60000;
export declare const JAKARTA_BOUNDS: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
};
export declare const FOCUS_STYLES: {
    inside: {
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
    };
    outside: {
        fillColor: string;
        fillOpacity: number;
    };
    hover: {
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
    };
};
export declare const TILE_URL: any;
export declare const TILE_SUBDOMAINS = "abc";
export declare const TILE_ATTRIBUTION = " ";
export declare function pm25ToColor(value: number): string;

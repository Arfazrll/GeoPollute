export interface JakartaRegion {
    name: string;
    center: [number, number];
    zoom: number;
    type: string;
    isDefault?: boolean;
}
export declare const ALL_JAKARTA_REGIONS: JakartaRegion[];

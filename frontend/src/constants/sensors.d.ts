export interface Sensor {
    id: string;
    uuid: string;
    apiVersion: 'v1' | 'v2';
    latitude: number;
    longitude: number;
    active: boolean;
}
export declare const STATIC_SENSORS: Sensor[];

import type { FilterMode } from '@/types';
export type PollutantType = 'pm25' | 'co' | 'no2';
interface FilterState {
    filter: FilterMode;
    pollutant: PollutantType;
    selectedGroup: string | null;
    customRange: {
        start: string;
        end: string;
    } | null;
    setFilter: (filter: FilterMode) => void;
    setPollutant: (pollutant: PollutantType) => void;
    setSelectedGroup: (group: string | null) => void;
    setCustomRange: (range: {
        start: string;
        end: string;
    } | null) => void;
}
export declare const useFilterStore: import("zustand").UseBoundStore<import("zustand").StoreApi<FilterState>>;
export {};

import type { FilterMode, PollutantResponse } from '@/types';
export declare function fetchPollutantData(filter: FilterMode, customRange?: {
    start: string;
    end: string;
} | null): Promise<PollutantResponse>;

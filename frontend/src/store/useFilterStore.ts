import { create } from 'zustand';
import type { FilterMode } from '@/types';
export type PollutantType = 'pm25' | 'co' | 'no2';
interface FilterState {
  filter: FilterMode;
  pollutant: PollutantType;
  selectedGroup: string | null;
  setFilter: (filter: FilterMode) => void;
  setPollutant: (pollutant: PollutantType) => void;
  setSelectedGroup: (group: string | null) => void;
}
export const useFilterStore = create<FilterState>((set) => ({
  filter: '1h',
  pollutant: 'pm25',
  selectedGroup: null,
  setFilter: (filter) => set({ filter }),
  setPollutant: (pollutant) => set({ pollutant }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
}));
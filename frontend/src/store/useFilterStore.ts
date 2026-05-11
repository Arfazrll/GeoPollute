import { create } from 'zustand';
import type { FilterMode } from '@/types';

interface FilterState {
  filter: FilterMode;
  setFilter: (filter: FilterMode) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filter: '2m',
  setFilter: (filter) => set({ filter }),
}));
import type { FilterMode, PollutantResponse } from '@/types';
const API_BASE = import.meta.env.VITE_API_BASE || '';
export async function fetchPollutantData(filter: FilterMode): Promise<PollutantResponse> {
  const res = await fetch(`${API_BASE}/pollutants?filter=${filter}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
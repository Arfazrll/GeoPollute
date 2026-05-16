import type { FilterMode, PollutantResponse } from '@/types';
const API_BASE = import.meta.env.VITE_API_BASE || '';
export async function fetchPollutantData(filter: FilterMode, start?: string, end?: string): Promise<PollutantResponse> {
  let url = `${API_BASE}/pollutants?filter=${filter}`;
  if (start) url += `&start=${start}`;
  if (end) url += `&end=${end}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
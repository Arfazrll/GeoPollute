import type { FilterMode, PollutantResponse } from '@/types';
import mockData from '@/mocks/sensors.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchPollutantData(filter: FilterMode): Promise<PollutantResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { ...(mockData as PollutantResponse), filter };
  }

  const res = await fetch(`${API_BASE}/pollutants?filter=${filter}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
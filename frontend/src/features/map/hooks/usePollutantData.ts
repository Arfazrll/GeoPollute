import { useQuery } from '@tanstack/react-query';
import { fetchPollutantData } from '@/api/pollutant';
import { useFilterStore } from '@/store/useFilterStore';
import { POLLING_INTERVAL_MS } from '@/features/map/utils/spatialLogic';
export function usePollutantData(overrideFilter?: string, start?: string, end?: string) {
  const globalFilter = useFilterStore((s) => s.filter);
  const globalCustomRange = useFilterStore((s) => s.customRange);
  const filter = overrideFilter || globalFilter;
  const activeRange = overrideFilter ? null : globalCustomRange;
  return useQuery({
    queryKey: ['pollutant', filter, activeRange],
    queryFn: () => fetchPollutantData(filter as any, activeRange),
    refetchInterval: activeRange ? false : POLLING_INTERVAL_MS,
    staleTime: 30_000, 
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
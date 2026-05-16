import { useQuery } from '@tanstack/react-query';
import { fetchPollutantData } from '@/api/pollutant';
import { useFilterStore } from '@/store/useFilterStore';
import { POLLING_INTERVAL_MS } from '@/features/map/utils/spatialLogic';
export function usePollutantData(overrideFilter?: string) {
  const globalFilter = useFilterStore((s) => s.filter);
  const customRange = useFilterStore((s) => s.customRange);
  const filter = overrideFilter || globalFilter;

  return useQuery({
    queryKey: ['pollutant', filter, customRange],
    queryFn: () => fetchPollutantData(filter as any, customRange),
    refetchInterval: customRange ? false : POLLING_INTERVAL_MS, // Disable auto-poll for historical data

    staleTime: 30_000, // Data dianggap basi setelah 30 detik agar selalu fresh

    gcTime: 10 * 60_000,
    retry: 2,
  });
}
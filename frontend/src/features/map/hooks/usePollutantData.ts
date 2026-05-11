import { useQuery } from '@tanstack/react-query';
import { fetchPollutantData } from '@/api/pollutant';
import { useFilterStore } from '@/store/useFilterStore';
import { POLLING_INTERVAL_MS } from '@/features/map/utils/spatialLogic';

export function usePollutantData() {
  const filter = useFilterStore((s) => s.filter);

  return useQuery({
    queryKey: ['pollutant', filter],
    queryFn: () => fetchPollutantData(filter),
    refetchInterval: filter === '2m' ? POLLING_INTERVAL_MS : false,
    staleTime: filter === '2m' ? 60_000 : 5 * 60_000,
    retry: 2,
  });
}
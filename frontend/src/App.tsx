import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MapContainer } from '@/features/map/components/MapContainer';
import { Legend } from '@/features/dashboard/Legend';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen relative">
        <MapContainer />
        <div className="absolute bottom-4 right-4 z-10">
          <Legend />
        </div>
      </div>
    </QueryClientProvider>
  );
}
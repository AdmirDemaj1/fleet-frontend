import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { useGetVehiclesQuery } from '../api/vehicleRtkApi';

export const useVehicles = () => {
  // Get filters from Redux state (managed by VehiclesPage)
  const { filters } = useSelector((state: RootState) => state.vehicles);

  // Use RTK Query for data fetching with automatic caching
  const { data, isLoading, error, refetch } = useGetVehiclesQuery(filters);

  return {
    vehicles: data?.vehicles || [],
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Failed to fetch vehicles' : null,
    totalCount: data?.total || 0,
    refetch,
  };
};

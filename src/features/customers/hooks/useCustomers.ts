import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { useGetCustomersQuery } from '../api/customerRtkApi';

export const useCustomers = () => {
  // Get filters from Redux state (managed by CustomersPage)
  const { filters } = useSelector((state: RootState) => state.customers);

  // Use RTK Query for data fetching with automatic caching
  const { data, isLoading, error, refetch } = useGetCustomersQuery(filters);

  return {
    customers: data?.customers || [],
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Failed to fetch customers' : null,
    totalCount: data?.total || 0,
    refetch,
  };
};

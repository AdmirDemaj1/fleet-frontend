import { useGetAdministratorsQuery } from '../api/customerRtkApi';

export const useAdministrators = () => {
  // Use RTK Query for data fetching with automatic caching
  const { data: administrators = [], isLoading, refetch } = useGetAdministratorsQuery();

  return {
    administrators,
    loading: isLoading,
    refetch,
  };
};

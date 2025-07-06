import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { customerApi } from '../api/customerApi';
import { setCustomers, setLoading, setError } from '../slices/customerSlice';

export const useCustomers = () => {
  const dispatch = useDispatch();
  const { customers, loading, error, filters, totalCount } = useSelector(
    (state: RootState) => state.customers
  );

  const fetchCustomers = async () => {
    dispatch(setLoading(true));
    try {
      const result = await customerApi.getAll(filters);
      dispatch(setCustomers({ customers: result.data, total: result.total }));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch customers'));
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  return {
    customers,
    loading,
    error,
    totalCount,
    refetch: fetchCustomers
  };
};
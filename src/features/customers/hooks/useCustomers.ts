import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { customerApi } from '../api/customerApi';
import { setCustomers, setLoading, setError } from '../slices/customerSlice';

export const useCustomers = () => {
  const dispatch = useDispatch();
  const { customers, loading, error, filters, totalCount } = useSelector(
    (state: RootState) => state.customers
  );

  const fetchCustomers = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      console.log('Fetching customers with filters:', filters);
      const result = await customerApi.getAll(filters);
      console.log('Received result:', result);
      dispatch(setCustomers({ customers: result.data, total: result.total }));
    } catch (err) {
      console.error('Error fetching customers:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch customers'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, filters?.search, filters?.type, filters?.limit, filters?.offset, filters?.hasVehicles, filters?.hasContracts, filters?.hasCollaterals]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    totalCount,
    refetch: fetchCustomers
  };
};
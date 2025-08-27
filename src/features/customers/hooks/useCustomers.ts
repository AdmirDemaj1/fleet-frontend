import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { customerApi } from '../api/customerApi';
import { setCustomers, setLoading, setError } from '../slices/customerSlice';

export const useCustomers = () => {
  const dispatch = useDispatch();
  const { customers, loading, error, filters, totalCount } = useSelector(
    (state: RootState) => state.customers
  );

  // Simple approach: track the last API call filters to prevent duplicates
  const lastFiltersRef = useRef<string>('');

  const fetchCustomers = useCallback(async () => {
    // Create a unique key for current filters
    const filtersKey = JSON.stringify(filters);
    
    // Skip if same filters as last call
    if (filtersKey === lastFiltersRef.current) {
      console.log('Same filters as last call, skipping API request');
      return;
    }

    // Skip if already loading
    if (loading) {
      console.log('Already loading, skipping API call');
      return;
    }

    lastFiltersRef.current = filtersKey;
    
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
  }, [dispatch, filters, loading]);

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
import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { paymentsApiNew } from '../api/paymentsApiNew';
import { setPayments, setLoading, setError, setFilters } from '../slices/paymentsSlice';
import { PaymentFilters } from '../types/invoice.types';

export const usePaymentsNew = () => {
  const dispatch = useDispatch();
  const { payments, loading, error, filters, totalCount } = useSelector(
    (state: RootState) => state.payments
  );

  // Simple approach: track the last API call filters to prevent duplicates
  const lastFiltersRef = useRef<string>('');

  const fetchPayments = useCallback(async () => {
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
      console.log('Fetching payments with filters:', filters);
      const result = await paymentsApiNew.getAll(filters);
      console.log('Received result:', result);
      dispatch(setPayments({ payments: result.data, total: result.total }));
    } catch (err) {
      console.error('Error fetching payments:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch payments'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, filters, loading]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    const newOffset = page * filters.limit;
    dispatch(setFilters({ offset: newOffset }));
  }, [dispatch, filters.limit]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    dispatch(setFilters({ limit: pageSize, offset: 0 }));
  }, [dispatch]);

  const handleFiltersChange = useCallback((newFilters: Partial<PaymentFilters>) => {
    dispatch(setFilters({ ...newFilters, offset: 0 })); // Reset to first page
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(setFilters({
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }));
  }, [dispatch]);

  const handleSortChange = useCallback((field: string, order: 'asc' | 'desc') => {
    dispatch(setFilters({ sortBy: field, sortOrder: order, offset: 0 }));
  }, [dispatch]);

  // Calculate current page from offset and limit
  const currentPage = Math.floor(filters.offset / filters.limit);

  return {
    payments,
    loading,
    error,
    totalCount,
    filters,
    currentPage,
    pageSize: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    
    // Handlers
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
    handleClearFilters,
    handleSortChange,
    refetch: fetchPayments
  };
};

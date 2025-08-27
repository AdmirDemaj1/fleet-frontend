import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../app/store';
import { setVehicles, setLoading, setError } from '../slices/vehicleSlice';
import { vehicleApi } from '../api/vehicleApi';

export const useVehicles = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error, filters, totalCount } = useSelector((state: RootState) => state.vehicles);

  // Track the last API call filters to prevent duplicates
  const lastFiltersRef = useRef<string>('');

  const fetchVehicles = useCallback(async () => {
    // Create a unique key for current filters
    const filtersKey = JSON.stringify(filters);
    
    // Skip if same filters as last call
    if (filtersKey === lastFiltersRef.current) {
      console.log('Same filters as last call, skipping vehicle API request');
      return;
    }

    // Skip if already loading
    if (loading) {
      console.log('Already loading vehicles, skipping API call');
      return;
    }

    lastFiltersRef.current = filtersKey;
    
    dispatch(setLoading(true));
    try {
      console.log('Fetching vehicles with filters:', filters);
      const result = await vehicleApi.getVehicles(filters);
      console.log('Received vehicle result:', result);
      dispatch(setVehicles({ vehicles: result.vehicles, total: result.total }));
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      dispatch(setError(err?.message || 'Failed to fetch vehicles'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, filters, loading]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, loading, error, totalCount, refetch: fetchVehicles };
};
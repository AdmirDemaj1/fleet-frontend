import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../app/store';
import { setVehicles, setLoading, setError } from '../slices/vehicleSlice';
import { Vehicle } from '../types/vehicleType';

export const useVehicles = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error, filters, totalCount } = useSelector((state: RootState) => state.vehicles);

  useEffect(() => {
    const fetchVehicles = async () => {
      dispatch(setLoading(true));
      try {
        // Construct query parameters from filters
        const queryParams = new URLSearchParams();
        if (filters.search) {
          queryParams.append('search', filters.search);
        }
        if (filters.status) {
          queryParams.append('status', filters.status);
        }
        if (filters.limit) {
          queryParams.append('limit', String(filters.limit));
        }
        if (filters.offset) {
          queryParams.append('offset', String(filters.offset));
        }

        const queryString = queryParams.toString();
        const url = `http://localhost:3000/vehicles${queryString ? `?${queryString}` : ''}`; // Replace with your API endpoint

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        dispatch(setVehicles({ vehicles: data.vehicles, total: data.totalCount })); // Assuming your API returns { vehicles: [], totalCount: number }
      } catch (e: any) {
        dispatch(setError(e.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchVehicles();
  }, [dispatch, filters]);

  return { vehicles, loading, error, totalCount };
};
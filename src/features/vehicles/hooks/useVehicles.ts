import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../app/store';
import { setVehicles, setLoading, setError } from '../slices/vehicleSlice';
import { Vehicle } from '../types/vehicleType';
import { api } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/utils/constants';

export const useVehicles = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error, filters, totalCount } = useSelector((state: RootState) => state.vehicles);

  useEffect(() => {
    const fetchVehicles = async () => {
      dispatch(setLoading(true));
      try {
        // Construct query parameters from filters (limit supported, offset not supported)
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

        const queryString = queryParams.toString();
        const url = `${API_ENDPOINTS.VEHICLES}${queryString ? `?${queryString}` : ''}`;

        const response = await api.get(url);
        const data = response.data;

        dispatch(setVehicles({ vehicles: data.vehicles || data, total: data.totalCount || data.length }));
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
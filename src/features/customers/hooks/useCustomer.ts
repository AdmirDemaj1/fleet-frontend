import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { customerApi } from '../api/customerApi';
import { setSelectedCustomer, setLoading, setError } from '../slices/customerSlice';

export const useCustomer = (id: string) => {
  const dispatch = useDispatch();
  const { selectedCustomer, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      
      dispatch(setLoading(true));
      try {
        const customer = await customerApi.getById(id);
        dispatch(setSelectedCustomer(customer));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch customer'));
      }
    };

    fetchCustomer();
  }, [id, dispatch]);

  return {
    customer: selectedCustomer,
    loading,
    error
  };
};
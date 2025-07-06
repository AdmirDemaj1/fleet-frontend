import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { customerApi } from '../api/customerApi';
import { UpdateCustomerDto } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';
import { setSelectedCustomer } from '../slices/customerSlice';

export const useUpdateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  const updateCustomer = async (id: string, data: UpdateCustomerDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const customer = await customerApi.update(id, data);
      const detailed = await customerApi.getById(id);
      dispatch(setSelectedCustomer(detailed));
      showSuccess('Customer updated successfully');
      navigate(`/customers/${id}`);
      return customer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update customer';
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCustomer,
    loading,
    error
  };
};
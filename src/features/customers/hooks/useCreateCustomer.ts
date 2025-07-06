import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../api/customerApi';
import { CreateCustomerDto } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useCreateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const createCustomer = async (data: CreateCustomerDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const customer = await customerApi.create(data);
      showSuccess('Customer created successfully');
      navigate(`/customers/${customer.id}`);
      return customer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCustomer,
    loading,
    error
  };
};
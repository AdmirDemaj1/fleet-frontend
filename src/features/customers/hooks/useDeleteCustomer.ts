import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { customerApi } from '../api/customerApi';
import { useNotification } from '../../../shared/hooks/useNotification';
import { useCustomers } from './useCustomers';

export const useDeleteCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();
  const { refetch } = useCustomers();

  const deleteCustomer = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await customerApi.delete(id);
      showSuccess('Customer deleted successfully');
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteCustomer,
    loading,
    error
  };
};
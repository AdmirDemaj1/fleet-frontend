import { useState } from 'react';
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
      const response = await customerApi.delete(id) as { requiresApproval?: boolean; approvalRequestId?: string; message?: string };
      console.log('Delete customer response:', response);

      if (response.requiresApproval) {
        showSuccess(response.message || 'Action requires approval. Request has been submitted.');
      } else {
        showSuccess('Customer deleted successfully');
         // Only refetch if the delete was immediate
      }
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
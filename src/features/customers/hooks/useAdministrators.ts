import { useState, useEffect } from 'react';
import { customerApi } from '../api/customerApi';
import { Customer, CustomerType } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useAdministrators = () => {
  // NOTE: "Administrator" is no longer a separate entity in the backend.
  // For business customer creation, administrators must be existing INDIVIDUAL customers.
  const [administrators, setAdministrators] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const fetchAdministrators = async () => {
    setLoading(true);
    try {
      // Fetch a large page of customers for the picker
      const { data } = await customerApi.getAll({ limit: 1000, offset: 0 });
      // Only allow individual customers to be selectable as business administrators
      setAdministrators((data || []).filter((c: Customer) => c.type === CustomerType.INDIVIDUAL));
    } catch (error) {
      console.error('Failed to fetch administrators:', error);
      showNotification('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  return {
    administrators,
    loading: loading,
    fetch: fetchAdministrators,
  };
};

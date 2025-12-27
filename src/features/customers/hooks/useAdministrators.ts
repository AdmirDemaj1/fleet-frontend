import { useState, useEffect } from 'react';
import { customerApi } from '../api/customerApi';
import { Administrator } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useAdministrators = () => {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const fetchAdministrators = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getAdministrators();
      setAdministrators(data);
    } catch (error) {
      console.error('Failed to fetch administrators:', error);
      showNotification('Failed to load administrators', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  return {
    administrators,
    loading,
    refetch: fetchAdministrators,
  };
};


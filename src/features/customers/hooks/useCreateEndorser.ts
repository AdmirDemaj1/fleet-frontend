import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endorserApi } from '../api/endorserApi';
import { CreateEndorserDto } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useCreateEndorser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const createEndorser = async (data: CreateEndorserDto) => {
    console.log("Creating endorser with data:", data);
    setLoading(true);
    setError(null);
    
    try {
      const endorser = await endorserApi.createEndorser(data);
      showSuccess('Endorser created successfully');
      navigate(`/endorsers/${endorser.id}`);
      return endorser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create endorser';
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEndorser,
    loading,
    error
  };
};

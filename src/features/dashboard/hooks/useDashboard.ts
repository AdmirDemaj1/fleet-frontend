import { useState, useEffect } from 'react';
import { DashboardData } from '../types/dashboard.types';
import { mockDashboardData } from '../utils/mockData';

interface UseDashboardReturn {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData>(mockDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call
      // const response = await dashboardApi.getData();
      // setData(response);
      
      setData(mockDashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async (): Promise<void> => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refreshData
  };
};

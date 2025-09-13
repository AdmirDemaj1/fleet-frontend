import { useState, useEffect } from 'react';
import { euriborApi } from '../api/euriborApi';
import { EuriborRate, EuriborTenor } from '../types/euribor.types';
import { isRateFromToday } from '../utils/euriborUtils';

export interface EuriborStatus {
  missingTodayRatesCount: number;
  totalRates: number;
  isLoading: boolean;
  hasError: boolean;
  lastUpdated: Date | null;
}

/**
 * Hook to get the status of Euribor rates for today
 */
export const useEuriborStatus = () => {
  const [status, setStatus] = useState<EuriborStatus>({
    missingTodayRatesCount: 0,
    totalRates: 0,
    isLoading: true,
    hasError: false,
    lastUpdated: null
  });

  const checkRatesStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      const currentRates = await euriborApi.getCurrentRates();
      const totalTenors = Object.values(EuriborTenor).length;
      
      let missingCount = 0;
      let availableRatesCount = 0;

      Object.values(EuriborTenor).forEach((tenor) => {
        const tenorKey = tenor as string;
        const rateData = currentRates[tenorKey] || currentRates[tenor];
        
        if (rateData) {
          availableRatesCount++;
          if (!isRateFromToday(rateData.rateDate)) {
            missingCount++;
          }
        } else {
          missingCount++;
        }
      });

      setStatus({
        missingTodayRatesCount: missingCount,
        totalRates: availableRatesCount,
        isLoading: false,
        hasError: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error checking Euribor rates status:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        hasError: true
      }));
    }
  };

  useEffect(() => {
    checkRatesStatus();
    
    // Check status every 5 minutes
    const interval = setInterval(checkRatesStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    refresh: checkRatesStatus
  };
};

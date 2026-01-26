import { useState, useCallback } from 'react';
import { useGetAmortizationPlanInfoQuery } from '../api/contractApi';
import { amortizationPlanApi } from '../api/amortizationPlanApi';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useAmortizationPlan = (contractId: string) => {
  const [downloading, setDownloading] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Use RTK Query for fetching plan info - benefits from automatic caching
  const {
    data: planInfo,
    isLoading: loading,
    refetch,
  } = useGetAmortizationPlanInfoQuery(contractId, {
    skip: !contractId,
  });

  const downloadPlan = useCallback(async () => {
    if (!contractId) return;

    try {
      setDownloading(true);
      await amortizationPlanApi.downloadAmortizationPlan(
        contractId,
        planInfo?.fileName
      );
      showSuccess('Amortization plan downloaded successfully');

      // Refetch plan info to update download count
      refetch();
    } catch (error: any) {
      console.error('Error downloading amortization plan:', error);
      showError(
        error?.response?.data?.message ||
        'Failed to download amortization plan. Please try again.'
      );
    } finally {
      setDownloading(false);
    }
  }, [contractId, planInfo?.fileName, showSuccess, showError, refetch]);

  return {
    planInfo: planInfo ?? null,
    loading,
    downloading,
    downloadPlan,
    hasPlan: planInfo !== null && planInfo !== undefined,
  };
};

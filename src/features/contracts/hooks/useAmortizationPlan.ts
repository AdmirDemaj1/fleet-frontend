import { useState, useEffect } from 'react';
import { amortizationPlanApi, AmortizationPlanInfo } from '../api/amortizationPlanApi';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useAmortizationPlan = (contractId: string) => {
  const [planInfo, setPlanInfo] = useState<AmortizationPlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (!contractId) {
      setLoading(false);
      return;
    }

    const fetchPlanInfo = async () => {
      try {
        setLoading(true);
        const info = await amortizationPlanApi.getAmortizationPlanInfo(contractId);
        setPlanInfo(info);
      } catch (error) {
        console.error('Error fetching amortization plan info:', error);
        setPlanInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanInfo();
  }, [contractId]);

  const downloadPlan = async () => {
    if (!contractId) return;

    try {
      setDownloading(true);
      await amortizationPlanApi.downloadAmortizationPlan(
        contractId,
        planInfo?.fileName
      );
      showSuccess('Amortization plan downloaded successfully');
      
      // Refresh plan info to update download count
      const updatedInfo = await amortizationPlanApi.getAmortizationPlanInfo(contractId);
      setPlanInfo(updatedInfo);
    } catch (error: any) {
      console.error('Error downloading amortization plan:', error);
      showError(
        error?.response?.data?.message ||
        'Failed to download amortization plan. Please try again.'
      );
    } finally {
      setDownloading(false);
    }
  };

  return {
    planInfo,
    loading,
    downloading,
    downloadPlan,
    hasPlan: planInfo !== null,
  };
};


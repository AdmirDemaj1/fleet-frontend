import { api } from '../../../shared/utils/api';

export interface AmortizationPlanInfo {
  id: string;
  contractId: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export const amortizationPlanApi = {
  /**
   * Get amortization plan metadata for a contract
   * GET /amortization-plans/contract/:contractId
   */
  getAmortizationPlanInfo: async (contractId: string): Promise<AmortizationPlanInfo | null> => {
    try {
      const response = await api.get<AmortizationPlanInfo>(
        `/amortization-plans/contract/${contractId}`
      );
      return response.data;
    } catch (error: any) {
      // If 404, the amortization plan doesn't exist yet
      if (error?.response?.status === 404) {
        return null;
      }
      console.error('Error fetching amortization plan info:', error);
      throw error;
    }
  },

  /**
   * Download the amortization plan Excel file
   * GET /amortization-plans/contract/:contractId/download
   */
  downloadAmortizationPlan: async (contractId: string, fileName?: string): Promise<void> => {
    try {
      const response = await api.get(`/amortization-plans/contract/${contractId}/download`, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName || `Amortization_Plan_${contractId}.xlsx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading amortization plan:', error);
      throw error;
    }
  },
};


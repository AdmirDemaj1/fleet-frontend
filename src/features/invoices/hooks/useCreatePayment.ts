import { useCallback } from 'react';
import { useCreatePaymentMutation } from '../api/paymentsApi';
import { useNotification } from '../../../shared/hooks/useNotification';
import { CreatePaymentDto } from '../types/invoice.types';

export const useCreatePayment = () => {
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const { showSuccess, showError } = useNotification();

  const handleCreatePayment = useCallback(async (data: CreatePaymentDto) => {
    try {
      const response = await createPayment(data).unwrap();
      
      // Check if response indicates approval is required
      if (response.requiresApproval) {
        showSuccess(response.message || "Action requires approval. Request has been submitted.");
        return { requiresApproval: true, approvalRequestId: response.approvalRequestId };
      }

      // If no approval required, show direct success message
      showSuccess("Payment created successfully!");
      return { requiresApproval: false, data: response.data };
    } catch (error) {
      console.error('Failed to create payment:', error);
      showError(error instanceof Error ? error.message : 'Failed to create payment. Please try again.');
      throw error;
    }
  }, [createPayment, showSuccess, showError]);

  return {
    createPayment: handleCreatePayment,
    isLoading
  };
};

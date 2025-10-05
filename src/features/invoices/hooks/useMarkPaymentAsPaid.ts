import { useCallback } from "react";
import {
  useMarkPaymentAsPaidMutation,
  useMarkPaymentAsPaidWithCreditMutation,
} from "../api/paymentsApi";
import { useNotification } from "../../../shared/hooks/useNotification";
import {
  MarkPaymentPaidDto,
  MarkPaymentPaidWithCreditDto,
  PaymentWithCreditResponse,
} from "../types/invoice.types";

export const useMarkPaymentAsPaid = () => {
  const [markAsPaid, { isLoading: isMarkingPaid }] =
    useMarkPaymentAsPaidMutation();
  const [markAsPaidWithCredit, { isLoading: isMarkingPaidWithCredit }] =
    useMarkPaymentAsPaidWithCreditMutation();
  const { showSuccess, showError } = useNotification();

  const handleMarkAsPaid = useCallback(
    async (id: string, data: MarkPaymentPaidDto) => {
      try {
        const response = await markAsPaid({ id, data }).unwrap();

        // Check if response indicates approval is required
        if (response.requiresApproval) {
          showSuccess(response.message || "Action requires approval. Request has been submitted.");
          return {
            requiresApproval: true,
            approvalRequestId: response.approvalRequestId || "",
          };
        }

        // If no approval required, show direct success message
        showSuccess("Payment marked as paid successfully!");
        return { requiresApproval: false, data: response.data };
      } catch (error) {
        console.error("Failed to mark payment as paid:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to mark payment as paid. Please try again."
        );
        throw error;
      }
    },
    [markAsPaid, showSuccess, showError]
  );

  const handleMarkAsPaidWithCredit = useCallback(
    async (id: string, data: MarkPaymentPaidWithCreditDto) => {
      try {
        const response = await markAsPaidWithCredit({ id, data }).unwrap();

        // Check if response indicates approval is required
        if (response.requiresApproval) {
          showSuccess(response.message || "Action requires approval. Request has been submitted.");
          return {
            requiresApproval: true,
            approvalRequestId: response.approvalRequestId || "",
          };
        }

        // Handle overpayment success message
        if (response.data && data.actualAmountReceived) {
          const overpaymentAmount =
            data.actualAmountReceived - Number(response.data.amount);
          const message = data.applyCreditBalance
            ? `Payment marked as paid. €${overpaymentAmount.toFixed(
                2
              )} added to customer credits.`
            : `Payment marked as paid. €${overpaymentAmount.toFixed(
                2
              )} will be applied to upcoming payments.`;

          showSuccess(message);
        } else {
          showSuccess("Payment marked as paid successfully!");
        }
        
        return { requiresApproval: false, data: response.data };
      } catch (error) {
        console.error("Failed to mark payment as paid with credit:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to mark payment as paid. Please try again."
        );
        throw error;
      }
    },
    [markAsPaidWithCredit, showSuccess, showError]
  );

  return {
    markAsPaid: handleMarkAsPaid,
    markAsPaidWithCredit: handleMarkAsPaidWithCredit,
    isLoading: isMarkingPaid || isMarkingPaidWithCredit,
  };
};
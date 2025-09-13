import React from 'react';
import {
  Box,
  Grid,
  Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { 
  useGetPaymentByIdQuery, 
  useMarkPaymentAsPaidMutation, 
  useMarkPaymentAsPaidWithCreditMutation 
} from '../api/paymentsApi';
import { PaymentHeader } from '../components/PaymentHeader';
import { PaymentInformation } from '../components/PaymentInformation';
import { PaymentRelatedInfo } from '../components/PaymentRelatedInfo';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { useNotification } from '../../../shared/hooks/useNotification';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    data: payment,
    isLoading,
    isError,
    error
  } = useGetPaymentByIdQuery(id!);

  const [markAsPaid, { isLoading: isMarkingPaid }] = useMarkPaymentAsPaidMutation();
  const [markAsPaidWithCredit, { isLoading: isMarkingPaidWithCredit }] = useMarkPaymentAsPaidWithCreditMutation();
  const { showNotification } = useNotification();

  const handleMarkAsPaid = async (data: {
    paymentDate: string;
    paymentMethod: string;
    actualAmountReceived: number;
    transactionReference?: string;
    notes?: string;
    overpaymentOption?: 'credit' | 'upcoming_payments';
  }) => {
    if (!payment) return;

    try {
      const paymentAmount = Number(payment.amount);
      const isOverpayment = data.actualAmountReceived > paymentAmount;

      if (isOverpayment) {
        // Handle overpayment case
        await markAsPaidWithCredit({
          id: payment.id,
          data: {
            paymentDate: data.paymentDate,
            paymentMethod: data.paymentMethod,
            transactionReference: data.transactionReference,
            notes: data.notes,
            actualAmountReceived: data.actualAmountReceived,
            applyCreditBalance: data.overpaymentOption === 'credit'
          }
        }).unwrap();

        const overpaymentAmount = data.actualAmountReceived - paymentAmount;
        const message = data.overpaymentOption === 'credit'
          ? `Payment marked as paid. €${overpaymentAmount.toFixed(2)} added to customer credits.`
          : `Payment marked as paid. €${overpaymentAmount.toFixed(2)} will be applied to upcoming payments.`;
        
        showNotification(message, 'success');
      } else {
        // Handle normal payment case
        await markAsPaid({
          id: payment.id,
          data: {
            paymentDate: data.paymentDate,
            paymentMethod: data.paymentMethod,
            transactionReference: data.transactionReference,
            notes: data.notes
          }
        }).unwrap();

        showNotification('Payment marked as paid successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      showNotification('Failed to mark payment as paid. Please try again.', 'error');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  // Error state
  if (isError || !payment) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {error ? String(error) : 'Payment not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
        <PaymentHeader 
          payment={payment} 
          onMarkAsPaid={handleMarkAsPaid}
          loading={isMarkingPaid || isMarkingPaidWithCredit}
        />

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Payment Information - Left Column */}
        <Grid item xs={12} lg={8}>
          <PaymentInformation payment={payment} />
        </Grid>

        {/* Related Information - Right Column */}
        <Grid item xs={12} lg={4}>
          <PaymentRelatedInfo 
            customerId={payment.customerId}
            contractId={payment.contractId}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentDetailPage;

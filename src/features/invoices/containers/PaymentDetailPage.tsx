import React from 'react';
import {
  Box,
  Grid,
  Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetPaymentByIdQuery } from '../api/paymentsApi';
import { useMarkPaymentAsPaid } from '../hooks';
import { PaymentHeader } from '../components/PaymentHeader';
import { PaymentInformation } from '../components/PaymentInformation';
import { PaymentRelatedInfo } from '../components/PaymentRelatedInfo';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    data: payment,
    isLoading,
    isError,
    error
  } = useGetPaymentByIdQuery(id!);

  const { markAsPaid, markAsPaidWithCredit, isLoading: isMarkingPayment } = useMarkPaymentAsPaid();

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
        const updateFuturePayments = data.overpaymentOption === 'upcoming_payments';
        
        await markAsPaidWithCredit(payment.id, {
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference,
          notes: data.notes,
          actualAmountReceived: data.actualAmountReceived,
          applyCreditBalance: data.overpaymentOption === 'credit',
          updateFuturePayments,
        });
      } else {
        // Handle normal payment case
        await markAsPaid(payment.id, {
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference,
          notes: data.notes
        });
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to mark payment as paid:', error);
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
          loading={isMarkingPayment}
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
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

  const { markAsPaid, markAsPaidWithCredit, applyPayment, isLoading: isMarkingPayment } = useMarkPaymentAsPaid();

  const handleMarkAsPaid = async (data: {
    paymentDate: string;
    paymentMethod: string;
    actualAmountReceived: number;
    transactionReference?: string;
    notes?: string;
    overpaymentOption?: 'credit' | 'upcoming_payments';
    getFromCredit?: boolean;
    creditAmount?: number;
  }) => {
    if (!payment) return;

    try {
      const toCents = (v: unknown): number => {
        const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : 0;
        if (!Number.isFinite(n)) return 0;
        return Math.round(n * 100);
      };

      const totalCents = toCents(payment.amount);
      const paidCents = toCents((payment as any).paidAmount || 0);
      const dueCents = Math.max(0, totalCents - paidCents); // remaining due
      const receivedCents = toCents(data.actualAmountReceived);

      const isOverpayment = receivedCents > dueCents;
      const isUnderpayment = receivedCents < dueCents;
      const isAlreadyPartiallyPaid =
        String((payment as any).status) === 'partially_paid' || paidCents > 0;

      if (isOverpayment) {
        // Handle overpayment case
        const updateFuturePayments = data.overpaymentOption === 'upcoming_payments';
        
        await markAsPaidWithCredit(payment.id, {
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference,
          notes: data.notes,
          actualAmountReceived: receivedCents / 100,
          applyCreditBalance: data.overpaymentOption === 'credit',
          updateFuturePayments,
        });
      } else if (isUnderpayment || (isAlreadyPartiallyPaid && receivedCents === dueCents)) {
        // Handle partial payment case (and completion of a partially paid payment)
        await applyPayment(payment.id, {
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          amountReceived: receivedCents / 100,
          getFromCredit: !!data.getFromCredit,
          creditAmount: data.getFromCredit ? data.creditAmount : undefined,
          notes: data.notes,
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
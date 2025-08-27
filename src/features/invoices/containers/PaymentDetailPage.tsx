import React from 'react';
import {
  Box,
  Grid,
  Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetPaymentByIdQuery, useMarkPaymentAsPaidMutation } from '../api/paymentsApi';
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

  const [markAsPaid] = useMarkPaymentAsPaidMutation();

  const handleMarkAsPaid = async () => {
    if (!payment) return;
    
    try {
      await markAsPaid({
        id: payment.id,
        data: {
          paymentDate: new Date().toISOString(),
          paymentMethod: 'bank_transfer', // Default method
          notes: 'Marked as paid from payment details page'
        }
      }).unwrap();
    } catch (error) {
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

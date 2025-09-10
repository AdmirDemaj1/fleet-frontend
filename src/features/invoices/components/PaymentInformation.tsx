import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  AttachMoney,
  Schedule,
  Description,
  ReceiptLong
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Payment } from '../types/invoice.types';

interface PaymentInformationProps {
  payment: Payment;
}

export const PaymentInformation: React.FC<PaymentInformationProps> = ({ payment }) => {
  const theme = useTheme();

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM dd, yyyy');
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM dd, yyyy • hh:mm a');
  };

  const getPaymentMethodInfo = (method: string | null) => {
    if (!method) return null;
    
    switch (method.toLowerCase()) {
      case 'credit_card':
        return { label: 'Credit Card', icon: CreditCard, color: theme.palette.primary.main };
      case 'bank_transfer':
        return { label: 'Bank Transfer', icon: AccountBalance, color: theme.palette.info.main };
      case 'cash':
        return { label: 'Cash', icon: AttachMoney, color: theme.palette.success.main };
      default:
        return { label: method.replace('_', ' '), icon: CreditCard, color: theme.palette.text.secondary };
    }
  };

  const paymentMethodInfo = getPaymentMethodInfo(payment.paymentMethod || null);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ReceiptLong sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Payment Information
        </Typography>
      </Box>
      
      {/* Amount Section */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
          Payment Amount
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}>
          {formatCurrency(payment.amount)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {String(payment.type).replace('_', ' ').charAt(0).toUpperCase() + String(payment.type).replace('_', ' ').slice(1)} Payment
        </Typography>
      </Box>

      {/* Payment Details Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Due Date
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ color: theme.palette.warning.main, mr: 1, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatDate(payment.dueDate)}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Payment Date
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: payment.paymentDate ? 'success.main' : 'text.secondary' }}>
              {payment.paymentDate ? formatDate(payment.paymentDate) : 'Not paid yet'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Payment Type
            </Typography>
            <Chip
              label={String(payment.type).replace('_', ' ').charAt(0).toUpperCase() + String(payment.type).replace('_', ' ').slice(1)}
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Payment Method
            </Typography>
            {paymentMethodInfo ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <paymentMethodInfo.icon sx={{ color: paymentMethodInfo.color, mr: 1, fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {paymentMethodInfo.label}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Not specified
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Additional Information */}
      {(payment.transactionReference || payment.notes) && (
        <>
          <Divider sx={{ my: 3 }} />
          
          {payment.transactionReference && (
            <Box sx={{ mb: payment.notes ? 3 : 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                Transaction Reference
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                  {payment.transactionReference}
                </Typography>
              </Box>
            </Box>
          )}

          {payment.notes && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                <Description sx={{ mr: 1, fontSize: 20, verticalAlign: 'middle' }} />
                Notes
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {payment.notes}
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Creation Date */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
          Created
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(payment.createdAt)}
        </Typography>
      </Box>
    </Paper>
  );
};

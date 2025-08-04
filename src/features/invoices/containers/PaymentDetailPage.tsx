import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  Skeleton
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  Receipt,
  Download,
  Share
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useGetPaymentByIdQuery } from '../api/paymentsApi';
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHODS } from '../constants/paymentConstants';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: payment,
    isLoading,
    isError,
    error
  } = useGetPaymentByIdQuery(id!);

  const handleBack = () => {
    navigate('/payments');
  };

  const handleEdit = () => {
    navigate(`/payments/${id}/edit`);
  };

  const handleMarkAsPaid = () => {
    // TODO: Implement mark as paid functionality
    console.log('Mark as paid:', id);
  };

  const handleGenerateReceipt = () => {
    // TODO: Implement receipt generation
    console.log('Generate receipt for:', id);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download payment details:', id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share payment:', id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM dd, yyyy');
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM dd, yyyy • hh:mm a');
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={300} height={20} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Error state
  if (isError || !payment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ? String(error) : 'Payment not found'}
        </Alert>
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Payments
        </Button>
      </Box>
    );
  }

  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
  const StatusIcon = statusConfig.icon;
  const paymentMethodInfo = PAYMENT_METHODS.find(m => m.value === payment.paymentMethod);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Payment Details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ID: {payment.id}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {payment.status !== 'paid' && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleMarkAsPaid}
              sx={{ mr: 1 }}
            >
              Mark as Paid
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Payment Information */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Payment Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Amount
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatCurrency(payment.amount)}
                  </Typography>
                  {payment.appliedAmount && payment.appliedAmount !== payment.amount && (
                    <Typography variant="body2" color="text.secondary">
                      Applied: {formatCurrency(payment.appliedAmount)}
                    </Typography>
                  )}
                  {payment.creditedAmount && (
                    <Typography variant="body2" color="success.main">
                      Credited: {formatCurrency(payment.creditedAmount)}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    icon={<StatusIcon />}
                    label={statusConfig.label}
                    sx={{
                      bgcolor: statusConfig.bgcolor,
                      color: statusConfig.textColor,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 32,
                      '& .MuiChip-icon': {
                        color: statusConfig.color,
                        fontSize: 18
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Due Date
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatDate(payment.dueDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Payment Date
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {payment.paymentDate ? formatDate(payment.paymentDate) : 'Not paid'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Payment Type
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {payment.type.replace('_', ' ')}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {paymentMethodInfo && (
                      <>
                        <paymentMethodInfo.icon sx={{ color: paymentMethodInfo.color }} />
                        <Typography variant="body1">
                          {paymentMethodInfo.label}
                        </Typography>
                      </>
                    )}
                    {!paymentMethodInfo && (
                      <Typography variant="body1" color="text.secondary">
                        Not specified
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {payment.transactionReference && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Transaction Reference
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {payment.transactionReference}
                  </Typography>
                </Box>
              </>
            )}

            {payment.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {payment.notes}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Related Information */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Related Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Customer ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {payment.customerId}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Contract ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {payment.contractId}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Created
              </Typography>
              <Typography variant="body2">
                {formatDateTime(payment.createdAt)}
              </Typography>
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Receipt />}
                onClick={handleGenerateReceipt}
              >
                Generate Receipt
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownload}
              >
                Download Details
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
              >
                Share Payment
              </Button>
              {payment.status !== 'paid' && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={handleMarkAsPaid}
                >
                  Mark as Paid
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentDetailPage;

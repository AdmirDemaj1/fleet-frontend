import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  Person,
  AccountBalance,
  TrendingUp,
  CheckCircle,
  Schedule,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../customers/api/customerApi';
import { useGetContractQuery } from '../../contracts/api/contractApi';

interface PaymentRelatedInfoProps {
  customerId: string;
  contractId: string;
}

export const PaymentRelatedInfo: React.FC<PaymentRelatedInfoProps> = ({
  customerId,
  contractId
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<any>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  
  const { data: contract, isLoading: contractLoading } = useGetContractQuery(contractId);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setCustomerLoading(true);
        const customerData = await customerApi.getById(customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      } finally {
        setCustomerLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const getContractTypeIcon = (type: string) => {
    return type === 'loan' ? AccountBalance : TrendingUp;
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getContractStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'draft': return Schedule;
      case 'completed': return CheckCircle;
      case 'cancelled': return ErrorIcon;
      default: return Warning;
    }
  };

  if (customerLoading || contractLoading) {
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
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ mr: 3 }} />
          <Box>
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="text" width={100} height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  const customerData = customer?.customer || customer;
  const contractData = contract;

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const ContractTypeIcon = getContractTypeIcon(contractData?.type || 'loan');
  const ContractStatusIcon = getContractStatusIcon(contractData?.status || 'draft');

  const handleCustomerClick = () => {
    navigate(`/customers/${customerId}`);
  };

  const handleContractClick = () => {
    navigate(`/contracts/${contractId}`);
  };

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
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Related Information
      </Typography>

      {/* Customer Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
          Customer Details
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: theme.palette.primary.main,
              mr: 3,
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            {customerData?.type === 'individual' ? (
              `${customerData?.firstName?.[0] || ''}${customerData?.lastName?.[0] || ''}`
            ) : (
              <Person />
            )}
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 0.5,
                cursor: 'pointer',
                color: theme.palette.primary.main,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={handleCustomerClick}
            >
              {customerData?.type === 'individual' 
                ? `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim()
                : customerData?.legalName || 'Business Customer'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {customerData?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ID: {customerId}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Contract Information */}
      {contractData && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            Contract Details
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: contractData.type === 'loan' ? theme.palette.primary.main : theme.palette.secondary.main,
                  mr: 2
                }}
              >
                <ContractTypeIcon />
              </Avatar>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  onClick={handleContractClick}
                >
                  {contractData.contractNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contractData.type === 'loan' ? 'Loan Agreement' : 'Leasing Agreement'}
                </Typography>
              </Box>
            </Box>
            
            <Chip
              icon={<ContractStatusIcon />}
              label={contractData.status.charAt(0).toUpperCase() + contractData.status.slice(1)}
              color={getContractStatusColor(contractData.status) as any}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(contractData.totalAmount)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Remaining
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {formatCurrency(contractData.remainingAmount)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

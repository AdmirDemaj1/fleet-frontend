import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  Assignment,
  FiberManualRecord
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../customers/api/customerApi';
import { ContractResponse } from '../types/contract.types';
import { Grid } from '@mui/material';

interface ContractInformationProps {
  contract: ContractResponse;
  contractConfig: any;
}

export const ContractInformation: React.FC<ContractInformationProps> = ({
  contract,
  contractConfig
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setCustomerLoading(true);
        const customerData = await customerApi.getById(contract.customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      } finally {
        setCustomerLoading(false);
      }
    };

    if (contract.customerId) {
      fetchCustomer();
    }
  }, [contract.customerId]);

  const handleCustomerClick = () => {
    navigate(`/customers/${contract.customerId}`);
  };

  const getCustomerDisplayName = () => {
    if (!customer) return 'Loading...';
    
    const customerData = customer?.customer || customer;
    if (customerData?.type === 'individual') {
      return `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim();
    }
    return customerData?.legalName || 'Business Customer';
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mr: 2,
            width: 48,
            height: 48
          }}
        >
          <Assignment />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Contract Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Core contract details and identification
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
              Contract Number
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {contract.contractNumber}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
              Contract Type
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {contractConfig.type.label.split(' ')[0]}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
              Status
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {contractConfig.status.label}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
              Customer
            </Typography>
            {customerLoading ? (
              <Skeleton variant="text" width={120} height={24} />
            ) : (
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
                onClick={handleCustomerClick}
              >
                {getCustomerDisplayName()}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

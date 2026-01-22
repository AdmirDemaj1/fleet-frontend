import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Skeleton,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assignment,
  Business,
  Person,
  OpenInNew,
  ContentCopy,
  CheckCircle,
  Schedule,
  Cancel,
  PendingActions,
  FiberManualRecord
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetCustomerQuery } from '../api/contractApi';
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
  const [copied, setCopied] = useState(false);

  // Use RTK Query for customer data - benefits from caching across components
  const { data: customer, isLoading: customerLoading } = useGetCustomerQuery(
    contract.customerId,
    { skip: !contract.customerId }
  );

  const handleCustomerClick = () => {
    navigate(`/customers/${contract.customerId}`);
  };

  const handleCopyContractNumber = async () => {
    try {
      await navigator.clipboard.writeText(contract.contractNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy contract number:', err);
    }
  };

  const getCustomerDisplayName = () => {
    if (!customer) return 'Loading...';
    // RTK Query transforms response to CustomerSummary with 'name' property
    return customer.name || 'Customer';
  };

  const getCustomerIcon = () => {
    if (!customer) return Person;
    return customer.type === 'individual' ? Person : Business;
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          icon: CheckCircle
        };
      case 'pending':
      case 'draft':
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          icon: PendingActions
        };
      case 'completed':
        return {
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          icon: Schedule
        };
      case 'cancelled':
        return {
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          icon: Cancel
        };
      default:
        return {
          color: theme.palette.text.secondary,
          bgcolor: alpha(theme.palette.text.secondary, 0.1),
          icon: FiberManualRecord
        };
    }
  };

  const statusConfig = getStatusConfig(contractConfig.status.label);
  const StatusIcon = statusConfig.icon;
  const CustomerIcon = getCustomerIcon();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mr: 2,
              width: 56,
              height: 56,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
            }}
          >
            <Assignment sx={{ fontSize: 28 }} />
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
        
        <Chip
          icon={<StatusIcon />}
          label={contractConfig.status.label}
          sx={{
            bgcolor: statusConfig.bgcolor,
            color: statusConfig.color,
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 32,
            '& .MuiChip-icon': {
              color: statusConfig.color
            }
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
              }
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Contract Number
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {contract.contractNumber}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy contract number"}>
                <IconButton 
                  size="small"
                  onClick={handleCopyContractNumber}
                  sx={{ 
                    ml: 1,
                    color: 'primary.main',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1) 
                    }
                  }}
                >
                  {copied ? <CheckCircle sx={{ fontSize: 18 }} /> : <ContentCopy sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.secondary.main, 0.04),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
              }
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Contract Type
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {contractConfig.type.label.split(' ')[0]}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              bgcolor: statusConfig.bgcolor,
              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.2)}`
              }
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StatusIcon sx={{ fontSize: 20, mr: 1, color: statusConfig.color }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: statusConfig.color }}>
                {contractConfig.status.label}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.02),
              border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`,
              transition: 'all 0.2s ease',
              cursor: customerLoading ? 'default' : 'pointer',
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.04),
                transform: customerLoading ? 'none' : 'translateY(-2px)',
                boxShadow: customerLoading ? 'none' : `0 4px 12px ${alpha(theme.palette.info.main, 0.1)}`
              }
            }}
            onClick={customerLoading ? undefined : handleCustomerClick}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              Customer
            </Typography>
            {customerLoading ? (
              <Skeleton variant="text" width="80%" height={28} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <CustomerIcon sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'info.main',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getCustomerDisplayName()}
                  </Typography>
                </Box>
                <OpenInNew sx={{ fontSize: 16, color: 'info.main', ml: 1 }} />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

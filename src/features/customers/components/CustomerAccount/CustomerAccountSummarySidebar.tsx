import React from 'react';
import { 
  Box, Typography, Divider, Chip, Paper, 
  List, ListItem, Avatar,
  LinearProgress, alpha, Skeleton
} from '@mui/material';
import { 
  AttachMoney, Event, LocalShipping,
  Domain, CalendarMonth, Person, Business, Badge,
  Phone, LocationOn, Tag, Email,
  History, CreditCard
} from '@mui/icons-material';
import { CustomerType } from '../../types/customer.types';
import { CustomerAccountSidebarProps } from '../../types/customerSidebar.types';
import { STATUS_CONFIG } from '../../constants/sidebarConstants';
import { useCustomerSidebar } from '../../hooks/useCustomerSidebar';

const CustomerAccountSidebar: React.FC<CustomerAccountSidebarProps> = ({
  customerId
}) => {
  const { summaryData, financialSummary, loading, error } = useCustomerSidebar(customerId);

  // Show loading skeleton while loading OR if we don't have data yet and no error
  if (loading || (!summaryData && !error)) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background: 'background.paper',
        }}
      >
        {/* Status bar skeleton */}
        <Skeleton variant="rectangular" width="100%" height={4} />
        
        {/* Header skeleton */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="circular" width={56} height={56} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={16} />
          
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="text" width="60%" height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={14} />
          </Box>
        </Box>

        <Divider />

        {/* Financial section skeleton */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
          </Box>
          
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
        </Box>

        <Divider />

        {/* Account details skeleton */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
          
          {[...Array(4)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  // Enhanced error state - show when we have an error or no data after loading is complete
  if (error || (!loading && !summaryData)) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'error.light',
          background: 'background.paper',
        }}
      >
        {/* Error indicator bar */}
        <Box sx={{ height: 4, width: '100%', bgcolor: 'error.main' }} />
        
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'error.light',
              color: 'error.main',
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
            }}
          >
            <Person sx={{ fontSize: 32 }} />
          </Avatar>
          
          <Typography variant="h6" color="error.main" sx={{ mb: 1, fontWeight: 600 }}>
            {error ? 'Unable to Load Customer' : 'Customer Not Found'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
            {error || 'The requested customer data could not be retrieved'}
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.05), 
            borderRadius: 2,
            border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.1)}`
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              Customer ID: {customerId}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Enhanced data processing - only process when data is available
  const {
    customerData,
    contracts = [],
    collateral = []
  } = summaryData || {};

  const {
    totalDue = 0,
    nextBillDate = 'No active contracts'
  } = financialSummary || {};

  // Helper functions for better data presentation
  const getCustomerDisplayName = () => {
    if (customerData?.type === CustomerType.INDIVIDUAL) {
      return `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Individual Customer';
    }
    return customerData?.legalName || customerData?.administratorName || 'Business Customer';
  };

  const getCustomerInitials = () => {
    if (customerData?.type === CustomerType.INDIVIDUAL) {
      const firstName = customerData.firstName || '';
      const lastName = customerData.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    const legalName = customerData?.legalName || '';
    const adminName = customerData?.administratorName || '';
    if (legalName) {
      return legalName.split(' ').map((word: string) => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    }
    if (adminName) {
      return adminName.split(' ').map((word: string) => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    }
    return 'BU';
  };

  const getStatusFromData = () => {
    if (totalDue > 0) return 'warning';
    if (contracts.length === 0) return 'inactive';
    return 'active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayName = getCustomerDisplayName();
  const initials = getCustomerInitials();
  const currentStatus = getStatusFromData();
  const formattedCreatedAt = formatDate(customerData?.createdAt || '');

  
  return (
    <Paper
      elevation={0}
      sx={{
        width: 320,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        background: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 4,
        }
      }}
    >
      {/* Enhanced status indicator */}
      <Box 
        sx={{ 
          height: 4, 
          width: '100%', 
          bgcolor: STATUS_CONFIG[currentStatus]?.color || 'primary.main'
        }} 
      />
      
      {/* Enhanced header section */}
      <Box 
        sx={{ 
          p: 3, 
          pb: 2,
          background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.background.paper, 0)})`,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: customerData?.type === CustomerType.INDIVIDUAL 
                ? 'primary.main'
                : 'secondary.main',
              width: 56,
              height: 56,
              border: 2,
              borderColor: 'background.paper',
              boxShadow: 3,
              fontSize: '1.25rem',
              fontWeight: 700,
              background: (theme) => customerData?.type === CustomerType.INDIVIDUAL
                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
            }}
          >
            {initials.length > 0 ? initials : (
              customerData?.type === CustomerType.INDIVIDUAL ? (
                <Person sx={{ fontSize: 28, color: 'white' }} />
              ) : (
                <Business sx={{ fontSize: 28, color: 'white' }} />
              )
            )}
          </Avatar>
          
          <Chip
            label={currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            size="small"
            icon={STATUS_CONFIG[currentStatus]?.icon}
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
              borderRadius: 2,
              color: STATUS_CONFIG[currentStatus]?.color || 'primary.main',
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiChip-icon': {
                color: STATUS_CONFIG[currentStatus]?.color || 'primary.main',
                fontSize: 16
              }
            }}
          />
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            color: 'text.primary',
            fontSize: '1.1rem',
            lineHeight: 1.3
          }}
        >
          {displayName}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Member since {formattedCreatedAt}
          </Typography>
        </Box>
        
        {customerData?.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200
              }}
            >
              {customerData.email}
            </Typography>
          </Box>
        )}
        
        {customerData?.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {customerData.phone}
            </Typography>
          </Box>
        )}
        
        {/* Customer type specific info */}
        <Box sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {customerData?.type === CustomerType.INDIVIDUAL ? (
            <>
              {customerData.idNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Badge sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    ID: {customerData.idNumber}
                  </Typography>
                </Box>
              )}
              {customerData.dateOfBirth && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    DOB: {formatDate(customerData.dateOfBirth)}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <>
              {customerData.nuisNipt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tag sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    NUIS: {customerData.nuisNipt}
                  </Typography>
                </Box>
              )}
              {customerData.administratorName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Admin: {customerData.administratorName}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
      
      <Divider />
      
      {/* Enhanced financial section */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AttachMoney 
            sx={{ 
              color: 'primary.main',
              fontSize: 20
            }} 
          />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '0.95rem'
            }}
          >
            Financial Overview
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Outstanding Balance
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: totalDue > 0 ? 'error.main' : 'success.main',
                fontSize: '1rem'
              }}
            >
              ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={totalDue > 0 ? Math.min((totalDue / 1000) * 100, 100) : 100}
            sx={{ 
              height: 8, 
              borderRadius: 2,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: totalDue > 0 ? 'error.main' : 'success.main',
                borderRadius: 2
              }
            }} 
          />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          p: 2, 
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06), 
          borderRadius: 2.5,
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Event sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Next Billing
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {nextBillDate}
          </Typography>
        </Box>

        {/* Credit Balance */}
        {customerData?.creditBalance && (
          <Box sx={{ 
            mt: 2,
            p: 2, 
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.06), 
            borderRadius: 2,
            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.12)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CreditCard sx={{ color: 'success.main', fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Credit Balance
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: 'success.main',
                fontSize: '1rem'
              }}
            >
              ${parseFloat(customerData.creditBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      {/* Enhanced account details section */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <LocalShipping 
            sx={{ 
              color: 'primary.main',
              fontSize: 20
            }} 
          />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '0.95rem'
            }}
          >
            Account Summary
          </Typography>
        </Box>
        
        <List dense disablePadding sx={{ '& .MuiListItem-root': { py: 1.5 } }}>
          <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShipping sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Active Contracts
              </Typography>
            </Box>
            <Chip
              label={contracts.length}
              size="small"
              sx={{
                bgcolor: contracts.length > 0 
                  ? (theme) => alpha(theme.palette.success.main, 0.1) 
                  : 'action.hover',
                color: contracts.length > 0 
                  ? 'success.main'
                  : 'text.secondary',
                fontWeight: 600,
                minWidth: 32,
                height: 24
              }}
            />
          </ListItem>
          
          <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Domain sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Collateral Items
              </Typography>
            </Box>
            <Chip
              label={collateral.length}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                fontWeight: 600,
                minWidth: 32,
                height: 24
              }}
            />
          </ListItem>
          
          <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Activity Logs
              </Typography>
            </Box>
            <Chip
              label={customerData?.logs?.length || 0}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                color: 'warning.main',
                fontWeight: 600,
                minWidth: 32,
                height: 24
              }}
            />
          </ListItem>
          
          {customerData?.address && (
            <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Address
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary',
                  lineHeight: 1.4,
                  pl: 3,
                  fontWeight: 500
                }}
              >
                {customerData.address}
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default CustomerAccountSidebar;
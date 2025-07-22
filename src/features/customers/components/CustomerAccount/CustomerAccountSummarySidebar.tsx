import React from 'react';
import { 
  Box, Typography, Divider, Chip, Tooltip, Paper, 
  List, ListItem, ListItemText, Avatar,
  LinearProgress, alpha, Skeleton
} from '@mui/material';
import { 
  AccountCircle, AttachMoney, Event, LocalShipping,
  Domain, Link, CalendarMonth, Person, Business,
  CheckCircle, Pending, Error, Phone, LocationOn, Tag
} from '@mui/icons-material';
import { useCustomer } from '../../hooks/useCustomer';
import { CustomerType } from '../../types/customer.types';

interface CustomerAccountSidebarProps {
  customerId: string;
}

const statusConfig: Record<string, { color: string, bgcolor: string, icon: React.ReactNode }> = {
  active: { 
    color: 'success.main', 
    bgcolor: '#e6f7ed',
    icon: <CheckCircle sx={{ fontSize: 12 }} />
  },
  inactive: { 
    color: 'error.main', 
    bgcolor: '#fce8e8',
    icon: <Error sx={{ fontSize: 12 }} />
  },
  pending: { 
    color: 'warning.main', 
    bgcolor: '#fff4e5',
    icon: <Pending sx={{ fontSize: 12 }} />
  },
};

const CustomerAccountSidebar: React.FC<CustomerAccountSidebarProps> = ({
  customerId
}) => {
  const { customer, loading, error } = useCustomer(customerId);

  console.log('CustomerAccountSidebar Debug:', { 
    customerId, 
    customer, 
    loading, 
    error,
    hasCustomer: !!customer 
  });

  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: 280,
          borderRadius: 2,
          overflow: 'hidden',
          p: 3,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Skeleton variant="text" sx={{ mt: 2 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Paper>
    );
  }

  // Show error state
  if (error || !customer) {
    console.error('CustomerAccountSidebar Error:', error);
    return (
      <Paper
        elevation={3}
        sx={{
          width: 280,
          borderRadius: 2,
          overflow: 'hidden',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography color="error" variant="h6" sx={{ mb: 2 }}>
          {error ? 'Error Loading Customer' : 'Customer Not Found'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error || 'Unable to load customer data'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Customer ID: {customerId}
        </Typography>
      </Paper>
    );
  }

  // The API returns the customer data directly, not wrapped in a customer property
  const customerData = customer.customer || customer; // Handle both structures
  const contracts = customer.contracts || customerData.contracts || [];
  const collateral = customer.collateral || customerData.collateral || [];
  
  // Determine customer status based on available data
  const status = contracts.length > 0 ? 'active' : 'pending'; // Use 'pending' for new customers without contracts
  
  // Calculate financial summary
  const totalDue = contracts.reduce((sum, contract) => sum + (contract.remainingAmount || 0), 0);
  const totalContractValue = contracts.reduce((sum, contract) => sum + (contract.totalAmount || 0), 0);
  const progress = totalContractValue > 0 ? Math.max(0, (1 - totalDue / totalContractValue) * 100) : 100; // 100% if no debt
  
  // Get customer display name and info
  const customerName = customerData.type === CustomerType.INDIVIDUAL 
    ? `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim()
    : customerData.legalName || 'Business Customer';
    
  const displayName = customerName || 'Unnamed Customer';
  
  // Get customer initials for avatar
  const getInitials = (name: string, type: CustomerType) => {
    if (type === CustomerType.INDIVIDUAL) {
      const firstName = customerData.firstName || '';
      const lastName = customerData.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
    } else {
      // For business, use first two letters of legal name
      const businessName = customerData.legalName || 'Business';
      return businessName.slice(0, 2).toUpperCase();
    }
  };
  
  const customerInitials = getInitials(customerName, customerData.type);
  
  // Format dates
  const createdAt = customerData.createdAt 
    ? new Date(customerData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unknown';
    
  // Get next bill date (mock for now - could be calculated from contracts)
  const nextBill = contracts.length > 0 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No active contracts';
    
  // Get account types based on customer data
  const accountTypes = [
    customerData.type === CustomerType.INDIVIDUAL ? 'Individual' : 'Business',
    ...(contracts.length > 0 ? ['Active Contracts'] : ['No Contracts']),
    ...(collateral.length > 0 ? ['Secured'] : [])
  ];
  
  // Additional customer info for display
  const customerInfo = {
    id: customerData.id,
    email: customerData.email,
    phone: customerData.phone,
    address: customerData.address,
    additionalNotes: customerData.additionalNotes
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        width: 280,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {/* Status indicator top bar */}
      <Box 
        sx={{ 
          height: 6, 
          width: '100%', 
          bgcolor: statusConfig[status].color 
        }} 
      />
      
      {/* Account header */}
      <Box 
        sx={{ 
          p: 3, 
          pb: 2,
          background: (theme) => `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0)})`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: customerData.type === CustomerType.INDIVIDUAL ? 'primary.main' : 'secondary.main',
              boxShadow: 3,
              width: 48,
              height: 48,
              border: 2,
              borderColor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {customerInitials.length > 0 ? (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  lineHeight: 1,
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px',
                  transform: 'translateY(0px)',
                  margin: 0,
                  padding: 0
                }}
              >
                {customerInitials}
              </Typography>
            ) : (
              customerData.type === CustomerType.INDIVIDUAL ? (
                <Person sx={{ fontSize: 24, color: 'white' }} />
              ) : (
                <Business sx={{ fontSize: 24, color: 'white' }} />
              )
            )}
          </Avatar>
          
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size="small"
            icon={statusConfig[status].icon}
            sx={{ 
              fontWeight: 'bold', 
              px: 1,
              borderRadius: 1.5,
              color: statusConfig[status].color,
              bgcolor: statusConfig[status].bgcolor,
              border: 1,
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              '& .MuiChip-icon': {
                color: statusConfig[status].color,
                marginLeft: 0.5
              }
            }}
          />
        </Box>
        
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          {customerName}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarMonth sx={{ fontSize: 14 }} /> Created {createdAt}
        </Typography>
        
        {customerData.email && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {customerData.email}
          </Typography>
        )}
        
        {/* Customer Info Section */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          {customerData.phone && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Phone sx={{ fontSize: 12 }} /> {customerData.phone}
            </Typography>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tag sx={{ fontSize: 12 }} /> ID: {customerData.id?.slice(-8) || 'N/A'}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Billing section */}
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AttachMoney fontSize="small" sx={{ color: 'primary.main' }} />
          Financial Summary
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Balance Due</Typography>
            <Typography variant="body2" fontWeight={600} color={totalDue > 0 ? 'error.main' : 'success.main'}>
              ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: totalDue > 0 ? 'error.main' : 'success.main',
              }
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), borderRadius: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event fontSize="small" color="primary" />
            <Typography variant="body2">Next Bill</Typography>
          </Box>
          <Typography variant="body2" fontWeight={600}>{nextBill}</Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Account details section */}
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocalShipping fontSize="small" sx={{ color: 'primary.main' }} />
          Account Details
        </Typography>
        
        <List dense disablePadding>
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Account Types" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {accountTypes.map(type => (
                <Chip 
                  key={type}
                  label={type} 
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }} 
                />
              ))}
            </Box>
          </ListItem>
          
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Contracts" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Tooltip title="View contracts">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                <LocalShipping fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>{contracts.length}</Typography>
              </Box>
            </Tooltip>
          </ListItem>
          
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Collateral Items" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Tooltip title="View collateral">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                <Domain fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>{collateral.length}</Typography>
              </Box>
            </Tooltip>
          </ListItem>
          
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Contact Methods" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Tooltip title="Available contact methods">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>
                  {[customerData.phone, customerData.secondaryPhone, customerData.email].filter(Boolean).length}
                </Typography>
              </Box>
            </Tooltip>
          </ListItem>
          
          {customerData.address && (
            <ListItem sx={{ py: 0.75, px: 0 }}>
              <ListItemText 
                primary="Address" 
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
              />
              <Tooltip title={customerData.address}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, cursor: 'pointer', maxWidth: 140, flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                  </Box>
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    sx={{ 
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}
                  >
                    {customerData.address}
                  </Typography>
                </Box>
              </Tooltip>
            </ListItem>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default CustomerAccountSidebar;
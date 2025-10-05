import React from 'react';
import { 
  Box, Typography, Chip, Avatar, alpha
} from '@mui/material';
import { 
  Person, Business, Badge, CalendarMonth, Email, Phone, Tag
} from '@mui/icons-material';
import { CustomerType } from '../../../types/customer.types';
import { STATUS_CONFIG } from '../../../constants/sidebarConstants';

interface CustomerAccountHeaderProps {
  customerData: any;
  currentStatus: string;
}

const CustomerAccountHeader: React.FC<CustomerAccountHeaderProps> = ({
  customerData,
  currentStatus
}) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayName = getCustomerDisplayName();
  const initials = getCustomerInitials();
  const formattedCreatedAt = formatDate(customerData?.createdAt || '');

  return (
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
  );
};

export default CustomerAccountHeader;
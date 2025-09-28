import React from 'react';
import { 
  Box, Typography, Chip, List, ListItem, alpha
} from '@mui/material';
import { 
  LocalShipping, Domain, History, LocationOn
} from '@mui/icons-material';

interface CustomerAccountAdditionalInfoProps {
  customerData: any;
  contracts: any[];
  collateral: any[];
}

const CustomerAccountAdditionalInfo: React.FC<CustomerAccountAdditionalInfoProps> = ({
  customerData,
  contracts,
  collateral
}) => {
  return (
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
  );
};

export default CustomerAccountAdditionalInfo;
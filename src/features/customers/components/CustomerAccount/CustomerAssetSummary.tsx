import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Paper,
  Chip,
  Grid,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Router as RouterIcon,
  SignalWifi4Bar as NetworkIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';

interface Asset {
  name: string;
  ipAddress: string;
  type: 'server' | 'network' | 'storage' | 'endpoint';
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: string;
}

interface CustomerAssetSummaryProps {
  assets: Asset[];
}

// Helper function to get the appropriate icon for each asset type
const getAssetIcon = (type: string) => {
  switch(type) {
    case 'server':
      return <ComputerIcon />;
    case 'storage':
      return <StorageIcon />;
    case 'network':
      return <RouterIcon />;
    case 'endpoint':
      return <NetworkIcon />;
    default:
      return <ComputerIcon />;
  }
};

// Helper function to get the color for status chips
const getStatusColor = (status: string) => {
  switch(status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'error';
    case 'maintenance':
      return 'warning';
    default:
      return 'default';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch(status) {
    case 'active':
      return <CheckCircleIcon fontSize="small" />;
    case 'inactive':
      return <ErrorIcon fontSize="small" />;
    case 'maintenance':
      return <PendingIcon fontSize="small" />;
    default:
      return undefined;
  }
};

const CustomerAssetSummary: React.FC<CustomerAssetSummaryProps> = ({ assets }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Safely get the status display text with fallback
  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Count active assets safely
  const activeAssetCount = assets ? assets.filter(a => a.status === 'active').length : 0;

  return (
    <Paper 
    elevation={2}
      sx={{ 
        p: 3,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            Asset Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {assets ? assets.length : 0} asset{(!assets || assets.length !== 1) ? 's' : ''} associated with this customer
          </Typography>
        </Box>
        <Chip 
          icon={<CheckCircleIcon />} 
          label={`${activeAssetCount} Active`} 
          color="success"
          variant="outlined"
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {assets && assets.map((asset, index) => (
        <Accordion 
          key={index}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{
            mb: 1,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            '&:before': {
              display: 'none',
            },
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              margin: 0,
              mb: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            sx={{
              minHeight: 56,
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box 
                sx={{ 
                  mr: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: theme.palette.primary.main 
                }}
              >
                {getAssetIcon(asset.type || '')}
              </Box>
              <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                {asset.name || 'Unnamed Asset'}
              </Typography>
              <Chip 
                icon={getStatusIcon(asset.status || '')}
                label={getStatusText(asset.status)}
                color={getStatusColor(asset.status || '') as any}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  IP Address
                </Typography>
                <Typography variant="body2">{asset.ipAddress || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {asset.type || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {asset.status || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">{asset.lastUpdated || 'Never'}</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      
      {(!assets || assets.length === 0) && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No assets found for this customer.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CustomerAssetSummary;
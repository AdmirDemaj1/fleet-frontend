import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Grid, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton,
  useTheme,
  alpha,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as PaidIcon,
  Error as OverdueIcon,
  Schedule as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Assignment as LogIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  assetName?: string;
}

interface CustomerBillingAndLogsCardsProps {
  customerId: string;
  recentInvoices: Invoice[];
  recentLogs: LogEntry[];
  onInvoicesClick?: () => void;
  onLogsClick?: () => void;
  invoicesLoading?: boolean;
  invoicesError?: string | null;
}

const CustomerBillingAndLogsCards: React.FC<CustomerBillingAndLogsCardsProps> = ({ 
  customerId,
  recentInvoices, 
  recentLogs,
  onInvoicesClick,
  onLogsClick,
  invoicesLoading = false,
  invoicesError = null
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleInvoicesClick = () => {
    if (onInvoicesClick) {
      onInvoicesClick();
    } else {
      navigate(`/customers/${customerId}/invoices`);
    }
  };

  const handleLogsClick = () => {
    if (onLogsClick) {
      onLogsClick();
    } else {
      navigate(`/customers/${customerId}/logs`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid':
        return <PaidIcon fontSize="small" sx={{ color: theme.palette.success.main }}/>;
      case 'overdue':
        return <OverdueIcon fontSize="small" sx={{ color: theme.palette.error.main }}/>;
      case 'pending':
        return <PendingIcon fontSize="small" sx={{ color: theme.palette.warning.main }}/>;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'info':
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }}/>;
      case 'warning':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }}/>;
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }}/>;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {/* Invoice Card */}
      <Grid item xs={12} md={6}>
        <Card 
          elevation={2}
          sx={{ 
            height: '100%',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 0 }}>
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="medium">Recent Invoices</Typography>
              </Box>
              <IconButton 
                size="small" 
                color="primary" 
                sx={{ p: 0.5 }}
                onClick={handleInvoicesClick}
                title="View all invoices"
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Divider />
            
            <List sx={{ p: 0, maxHeight: '300px', overflow: 'auto' }} dense>
              {invoicesLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, index) => (
                  <ListItem key={index} sx={{ py: 0.75, px: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Skeleton variant="circular" width={20} height={20} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Skeleton variant="text" width="60%" height={20} />}
                      secondary={<Skeleton variant="text" width="40%" height={16} />}
                      sx={{ my: 0 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="text" width={60} height={20} sx={{ mr: 1 }} />
                      <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
                    </Box>
                  </ListItem>
                ))
              ) : invoicesError ? (
                // Error state
                <Box sx={{ py: 2, px: 1.5 }}>
                  <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
                    {invoicesError}
                  </Alert>
                </Box>
              ) : recentInvoices.length > 0 ? (
                recentInvoices.map((invoice, index) => (
                  <React.Fragment key={invoice.id}>
                    <ListItem 
                      sx={{ 
                        py: 0.75, 
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getStatusIcon(invoice.status)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="body2" 
                            fontWeight="medium" 
                            sx={{ 
                              lineHeight: 0.87,
                              cursor: 'help',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem'
                            }}
                            title={`Full ID: ${invoice.id}`}
                          >
                            INV-{invoice.id.split('-')[0].toUpperCase()}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption">
                            {invoice.date}
                          </Typography>
                        }
                        sx={{ my: 0 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          {invoice.amount}
                        </Typography>
                        <Chip 
                          label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)} 
                          size="small"
                          color={getStatusColor(invoice.status) as any}
                          variant="outlined"
                          sx={{ height: 20, '& .MuiChip-label': { px: 0.8, py: 0 } }}
                        />
                      </Box>
                    </ListItem>
                    {index < recentInvoices.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ py: 1, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="caption">No recent invoices found.</Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Logs Card */}
      <Grid item xs={12} md={6}>
        <Card 
          elevation={2}
          sx={{ 
            height: '100%',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 0 }}>
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LogIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="medium">Recent Activity</Typography>
              </Box>
              <IconButton 
                size="small" 
                color="primary" 
                sx={{ p: 0.5 }}
                onClick={handleLogsClick}
                title="View all logs"
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Divider />
            
            <List sx={{ p: 0, maxHeight: '300px', overflow: 'auto' }} dense>
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => (
                  <React.Fragment key={log.id}>
                    <ListItem 
                      sx={{ 
                        py: 0.75, 
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getSeverityIcon(log.severity)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.3 }}>
                            {log.message}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" component="div" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span>{log.timestamp}</span>
                            {log.assetName && (
                              <span style={{ marginLeft: '4px' }}>• {log.assetName}</span>
                            )}
                          </Typography>
                        }
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                    {index < recentLogs.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="caption">No recent activity found.</Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CustomerBillingAndLogsCards;
import React, { useMemo } from 'react';
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
  alpha,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ArrowForward as ArrowForwardIcon,
  Assignment as LogIcon
} from '@mui/icons-material';
import { CustomerBillingAndLogsCardsProps, LogEntry } from '../../types/customerBillingCards.types';
import { CARD_CONSTANTS } from '../../constants/billingCardsConstants';
import { useBillingCards } from '../../hooks/useBillingCards';
import { useCustomerLogs } from '../../hooks/useCustomerLogs';

const CustomerBillingAndLogsCards: React.FC<CustomerBillingAndLogsCardsProps> = ({ 
  customerId,
  recentInvoices, 
  onInvoicesClick,
  onLogsClick,
  invoicesLoading = false,
  invoicesError = null
}) => {
  const {
    theme,
    handleInvoicesClick,
    handleLogsClick,
    getInvoiceStatusIcon,
    getInvoiceStatusColor,
    getLogSeverityIcon,
    formatInvoiceNumber
  } = useBillingCards(customerId, onInvoicesClick, onLogsClick);

  // Fetch customer logs - get recent activity (default amount)
  const { logs, loading: logsLoading, error: logsError } = useCustomerLogs(customerId);

  // Transform and get the 5 most recent logs for display
  const recentLogs: LogEntry[] = useMemo(() => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) return [];
    
    // Helper function to determine log severity based on event type
    const getSeverityFromEventType = (eventType: string): 'info' | 'warning' | 'error' => {
      const lowerEventType = eventType.toLowerCase();
      
      if (lowerEventType.includes('error') || lowerEventType.includes('fail') || lowerEventType.includes('delete')) {
        return 'error';
      }
      if (lowerEventType.includes('warning') || lowerEventType.includes('warn') || lowerEventType.includes('timeout')) {
        return 'warning';
      }
      return 'info';
    };
    
    return logs
      .slice(0, 5) // Get the 5 most recent logs for display
      .map((log) => ({
        id: log.id,
        timestamp: new Date(log.createdAt || log.actionTimestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        message: log.eventType ? 
          `${log.eventType.replace(/([A-Z])/g, ' $1').trim()}` : 
          (log.newValues ? 'Record updated' : 'System event'),
        severity: log.eventType ? getSeverityFromEventType(log.eventType) : 'info',
        assetName: log.entityType === 'vehicle' ? log.entityId : undefined,
        // Include user information
        performedBy: log.performedByName || log.userId || 'System'
      }));
  }, [logs]);

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
                <ReceiptIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: CARD_CONSTANTS.ICON_SIZE }} />
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
            
            <List sx={{ p: 0, maxHeight: CARD_CONSTANTS.MAX_HEIGHT, overflow: 'auto' }} dense>
              {invoicesLoading ? (
                // Loading skeleton
                [...Array(CARD_CONSTANTS.SKELETON_COUNT)].map((_, index) => (
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
                        {getInvoiceStatusIcon(invoice.status)}
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
                            {formatInvoiceNumber(invoice.id)}
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
                          color={getInvoiceStatusColor(invoice.status) as any}
                          variant="outlined"
                          sx={{ height: CARD_CONSTANTS.CHIP_HEIGHT, '& .MuiChip-label': { px: 0.8, py: 0 } }}
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
                <LogIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: CARD_CONSTANTS.ICON_SIZE }} />
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
            
            <List sx={{ p: 0, maxHeight: CARD_CONSTANTS.MAX_HEIGHT, overflow: 'auto' }} dense>
              {logsLoading ? (
                // Loading skeleton for logs
                [...Array(CARD_CONSTANTS.SKELETON_COUNT)].map((_, index) => (
                  <ListItem key={index} sx={{ py: 0.75, px: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Skeleton variant="circular" width={20} height={20} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Skeleton variant="text" width="80%" height={20} />}
                      secondary={<Skeleton variant="text" width="60%" height={16} />}
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                ))
              ) : logsError ? (
                // Error state for logs
                <Box sx={{ py: 2, px: 1.5 }}>
                  <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
                    {logsError}
                  </Alert>
                </Box>
              ) : recentLogs.length > 0 ? (
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
                        {getLogSeverityIcon(log.severity)}
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
                            {log.performedBy && (
                              <span style={{ marginLeft: '4px' }}>• by {log.performedBy}</span>
                            )}
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
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
  TableSortLabel,
  alpha,
  useTheme,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Local imports
import { CustomerAccountLogsProps } from '../../types/customerLogs.types';
import { 
  useCustomerLogs, 
  useLogsTable, 
  useLogMenuState, 
  useLogNotification
} from '../../hooks/useCustomerLogs';
import { formatLogTimestamp, formatLogDescription } from '../../utils/logUtils';
import { getLogEventTypeIcon, getLogEntityTypeIcon } from '../../utils/logRenderUtils';
import { LOG_ROWS_PER_PAGE_OPTIONS } from '../../constants/logConstants';
import { LogFilters } from './LogFilters';
import { LogFilters as LogFiltersType } from '../../types/logFilters.types';

// Export types for external use
export type { CustomerAccountLogsProps };

const CustomerAccountLogs: React.FC<CustomerAccountLogsProps> = ({ customerId: propCustomerId }) => {
  const theme = useTheme();
  
  // Custom hooks
  const { logs, loading, error, fetchLogs } = useCustomerLogs(propCustomerId);
  const { notification, showNotification, hideNotification } = useLogNotification();
  const { anchorEl, selectedLog, openMenu, closeMenu } = useLogMenuState();
  
  // Filters state
  const [filters, setFilters] = useState<LogFiltersType>({
    search: '',
    eventType: '',
    entityType: '',
    startDate: '',
    endDate: ''
  });

  // Dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<any>(null);
  
  // Table state and logic
  const {
    page,
    rowsPerPage,
    order,
    orderBy,
    filteredLogs,
    paginatedLogs,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  } = useLogsTable(logs, filters);

  // Event handlers
  const handleClearFilters = () => {
    setFilters({
      search: '',
      eventType: '',
      entityType: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleExportLogs = async () => {
    try {
      // Call API to export logs
      console.log('Exporting logs...');
      showNotification('Logs exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export logs', 'error');
    }
  };

  const handleViewDetails = (log: any) => {
    setSelectedLogForDetail(log);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedLogForDetail(null);
  };

  // Loading state - following customer list pattern
  if (loading && logs.length === 0) {
    return (
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', mb: 1.5 }}>
            {['20%', '15%', '35%', '15%', '15%'].map((width, i) => (
              <Skeleton key={i} variant="text" width={width} height={24} sx={{ mr: 2 }} />
            ))}
          </Box>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ 
              py: 2, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none'
            }}>
              {['20%', '15%', '35%', '15%', '15%'].map((width, i) => (
                <Skeleton key={i} variant="text" width={width} height={24} sx={{ mr: 2 }} />
              ))}
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Skeleton variant="rectangular" width={300} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error && !logs.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchLogs}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Activity Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View customer activity and system events
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportLogs}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <LogFilters
          filters={filters}
          onFilterChange={setFilters}
          logsCount={filteredLogs.length}
        />
      </Box>

      {/* Table */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'timestamp'}
                    direction={orderBy === 'timestamp' ? order : 'asc'}
                    onClick={() => handleRequestSort('timestamp')}
                  >
                    Event & Time
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'entityType'}
                    direction={orderBy === 'entityType' ? order : 'asc'}
                    onClick={() => handleRequestSort('entityType')}
                  >
                    Entity
                  </TableSortLabel>
                </TableCell>
                <TableCell>Changes</TableCell>
                <TableCell>User & Metadata</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow 
                  key={log.id} 
                  hover
                  sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {getLogEventTypeIcon(log.eventType)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {log.eventType ? 
                            log.eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                            'Unknown Event'
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.actionTimestamp ? 
                            formatLogTimestamp(log.actionTimestamp.toString()) : 
                            log.createdAt ? 
                            formatLogTimestamp(log.createdAt.toString()) :
                            'No timestamp'
                          }
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getLogEntityTypeIcon(log.entityType)}
                      <Chip
                        label={log.entityType ? 
                          log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1) : 
                          'Unknown'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    {log.entityId && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: {log.entityId.slice(0, 8)}...
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ maxWidth: 300 }}>
                      {log.eventType === 'entity_created' && log.newValues && (
                        <Box>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            Created new {log.entityType}
                          </Typography>
                          {log.newValues.legalName && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Name: {log.newValues.legalName}
                            </Typography>
                          )}
                          {log.newValues.email && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Email: {log.newValues.email}
                            </Typography>
                          )}
                          {log.newValues.type && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Type: {log.newValues.type}
                            </Typography>
                          )}
                        </Box>
                      )}
                      
                      {log.eventType === 'entity_updated' && (
                        <Box>
                          <Typography variant="body2" fontWeight="medium" color="warning.main">
                            Updated {log.entityType}
                          </Typography>
                          {log.oldValues && log.newValues && (
                            <Box sx={{ mt: 0.5 }}>
                              {Object.keys(log.newValues).slice(0, 3).map((key) => (
                                <Typography key={key} variant="caption" display="block" color="text.secondary">
                                  {key}: {log.oldValues?.[key]} → {log.newValues?.[key]}
                                </Typography>
                              ))}
                              {Object.keys(log.newValues).length > 3 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{Object.keys(log.newValues).length - 3} more changes
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                      
                      {log.eventType === 'entity_deleted' && (
                        <Typography variant="body2" fontWeight="medium" color="error.main">
                          Deleted {log.entityType}
                        </Typography>
                      )}
                      
                      {!['entity_created', 'entity_updated', 'entity_deleted'].includes(log.eventType || '') && (
                        <Typography variant="body2">
                          {formatLogDescription(log)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {log.userId || 'System'}
                      </Typography>
                      {log.metadata && (
                        <Box sx={{ mt: 0.5 }}>
                          {log.metadata.customerType && (
                            <Chip
                              label={`Customer: ${log.metadata.customerType}`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                          {log.metadata.customerId && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Customer ID: {log.metadata.customerId.slice(0, 8)}...
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(event) => openMenu(event, log)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedLogs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 3
                    }}>
                      <Box 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: '50%',
                          p: 2,
                          mb: 2
                        }}
                      >
                        <HistoryIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom>No logs found</Typography>
                      <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                        {filteredLogs.length !== logs.length 
                          ? 'No logs match your current filter criteria.'
                          : 'This customer doesn\'t have any activity logs yet.'
                        }
                      </Typography>
                      {filteredLogs.length !== logs.length && (
                        <Button 
                          variant="outlined" 
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredLogs.length || 0}
          page={Math.min(page, Math.max(0, Math.ceil((filteredLogs.length || 0) / rowsPerPage) - 1))}
          onPageChange={(_, newPage) => {
            handlePageChange(newPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10);
            handleRowsPerPageChange(newRowsPerPage);
          }}
          rowsPerPageOptions={LOG_ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => {
            if (loading) {
              return 'Loading...';
            }
            return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
          }}
          disabled={loading}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-select': {
              pr: 1
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: theme.palette.text.secondary
            },
            '&.Mui-disabled': {
              opacity: 0.6
            }
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          if (selectedLog) {
            handleViewDetails(selectedLog);
          }
          closeMenu();
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedLog) {
            // Export specific log
            console.log('Export log:', selectedLog.id);
            showNotification('Log exported successfully', 'success');
          }
          closeMenu();
        }}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export Log
        </MenuItem>
      </Menu>

      {/* Log Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {selectedLogForDetail && getLogEventTypeIcon(selectedLogForDetail.eventType)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedLogForDetail?.eventType?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Log Details'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedLogForDetail?.actionTimestamp ? 
                    formatLogTimestamp(selectedLogForDetail.actionTimestamp) : 
                    'No timestamp'
                  }
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseDetailDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedLogForDetail && (
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Event Type</Typography>
                        <Typography variant="body1">{selectedLogForDetail.eventType}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Entity Type</Typography>
                        <Typography variant="body1">{selectedLogForDetail.entityType}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Entity ID</Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                          {selectedLogForDetail.entityId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">User ID</Typography>
                        <Typography variant="body1">{selectedLogForDetail.userId}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Metadata */}
              {selectedLogForDetail.metadata && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Metadata</Typography>
                      <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        <pre>{JSON.stringify(selectedLogForDetail.metadata, null, 2)}</pre>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Old Values */}
              {selectedLogForDetail.oldValues && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error.main">Previous Values</Typography>
                      <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', maxHeight: 300, overflow: 'auto' }}>
                        <pre>{JSON.stringify(selectedLogForDetail.oldValues, null, 2)}</pre>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* New Values */}
              {selectedLogForDetail.newValues && (
                <Grid item xs={12} md={selectedLogForDetail.oldValues ? 6 : 12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="success.main">
                        {selectedLogForDetail.oldValues ? 'New Values' : 'Created Values'}
                      </Typography>
                      <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', maxHeight: 300, overflow: 'auto' }}>
                        <pre>{JSON.stringify(selectedLogForDetail.newValues, null, 2)}</pre>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Timestamps */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Timestamps</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Action Timestamp</Typography>
                        <Typography variant="body1">{selectedLogForDetail.actionTimestamp}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Created At</Typography>
                        <Typography variant="body1">{selectedLogForDetail.createdAt}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              // Export this specific log
              console.log('Export log:', selectedLogForDetail?.id);
              showNotification('Log exported successfully', 'success');
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerAccountLogs;

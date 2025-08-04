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
  Divider,
  Skeleton,
  TableSortLabel,
  alpha,
  useTheme,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Grid,
  Collapse
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// Local imports
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditLogFilters } from '../components/AuditLogList/AuditLogFilters';
import { formatLogTimestamp } from '../utils/auditLogRenderUtils';
import { getLogEventTypeIcon, getLogEntityTypeIcon } from '../utils/auditLogRenderUtils';

// Constants
const AUDIT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const AuditPage: React.FC = () => {
  const theme = useTheme();
  
  // Audit logs hook
  const {
    logs,
    totalCount,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    page,
    rowsPerPage,
    order,
    orderBy,
    setPage,
    setRowsPerPage,
    setOrder,
    setOrderBy
  } = useAuditLogs();

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

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

  const handleToggleExpanded = (logId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(logId)) {
      newExpandedRows.delete(logId);
    } else {
      newExpandedRows.add(logId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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
          Failed to load audit logs. Please try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => refetch()}
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
            System Audit Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View system-wide activity and audit events
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <AuditLogFilters
          filters={filters}
          onFilterChange={setFilters}
          logsCount={totalCount}
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
                <TableCell width="40px"></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'actionTimestamp'}
                    direction={orderBy === 'actionTimestamp' ? order : 'asc'}
                    onClick={() => handleRequestSort('actionTimestamp')}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow 
                    hover
                    sx={{ 
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleExpanded(log.id)}
                      >
                        {expandedRows.has(log.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    
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
                              formatLogTimestamp(log.actionTimestamp) : 
                              log.createdAt ? 
                              formatLogTimestamp(log.createdAt) :
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
                            {log.newValues.name && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Name: {log.newValues.name}
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
                            {log.eventType ? log.eventType.replace('_', ' ') : 'Unknown action'}
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
                            {log.metadata.userType && (
                              <Chip
                                label={`User: ${log.metadata.userType}`}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            )}
                            {log.metadata.ipAddress && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                IP: {log.metadata.ipAddress}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedRows.has(log.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.grey[50], 0.5),
                          borderLeft: `3px solid ${theme.palette.primary.main}`
                        }}>
                          {/* Basic Information */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                              Basic Information
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={3}>
                                <Typography variant="caption" color="text.secondary">Event Type</Typography>
                                <Typography variant="body2">{log.eventType}</Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="caption" color="text.secondary">Entity Type</Typography>
                                <Typography variant="body2">{log.entityType}</Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="caption" color="text.secondary">Entity ID</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {log.entityId}
                                </Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="caption" color="text.secondary">User ID</Typography>
                                <Typography variant="body2">{log.userId}</Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Timestamps */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                              Timestamps
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Action Timestamp</Typography>
                                <Typography variant="body2">{log.actionTimestamp}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Created At</Typography>
                                <Typography variant="body2">{log.createdAt}</Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Metadata */}
                          {log.metadata && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Metadata
                              </Typography>
                              <Box sx={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.75rem',
                                bgcolor: theme.palette.background.paper,
                                p: 1,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                maxHeight: 200,
                                overflow: 'auto'
                              }}>
                                <pre style={{ margin: 0 }}>{JSON.stringify(log.metadata, null, 2)}</pre>
                              </Box>
                            </Box>
                          )}

                          {/* Value Changes */}
                          {(log.oldValues || log.newValues) && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Value Changes
                              </Typography>
                              <Grid container spacing={1}>
                                {/* Previous Values */}
                                {log.oldValues && (
                                  <Grid item xs={log.newValues ? 6 : 12}>
                                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                                      Previous Values
                                    </Typography>
                                    <Box sx={{ 
                                      fontFamily: 'monospace', 
                                      fontSize: '0.75rem',
                                      bgcolor: alpha(theme.palette.error.main, 0.05),
                                      p: 1,
                                      borderRadius: 1,
                                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                      maxHeight: 200,
                                      overflow: 'auto'
                                    }}>
                                      <pre style={{ margin: 0 }}>{JSON.stringify(log.oldValues, null, 2)}</pre>
                                    </Box>
                                  </Grid>
                                )}

                                {/* New Values */}
                                {log.newValues && (
                                  <Grid item xs={log.oldValues ? 6 : 12}>
                                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                      {log.oldValues ? 'New Values' : 'Created Values'}
                                    </Typography>
                                    <Box sx={{ 
                                      fontFamily: 'monospace', 
                                      fontSize: '0.75rem',
                                      bgcolor: alpha(theme.palette.success.main, 0.05),
                                      p: 1,
                                      borderRadius: 1,
                                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                      maxHeight: 200,
                                      overflow: 'auto'
                                    }}>
                                      <pre style={{ margin: 0 }}>{JSON.stringify(log.newValues, null, 2)}</pre>
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              {logs.length === 0 && !loading && (
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
                      <Typography variant="h6" gutterBottom>No audit logs found</Typography>
                      <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                        {Object.values(filters).some(v => v !== '') 
                          ? 'No logs match your current filter criteria.'
                          : 'No audit logs are available yet.'
                        }
                      </Typography>
                      {Object.values(filters).some(v => v !== '') && (
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
          count={totalCount || 0}
          page={Math.min(page, Math.max(0, Math.ceil((totalCount || 0) / rowsPerPage) - 1))}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={AUDIT_ROWS_PER_PAGE_OPTIONS}
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

export default AuditPage;
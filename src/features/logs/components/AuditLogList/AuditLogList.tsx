import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TableSortLabel,
  alpha,
  useTheme,
  Avatar,
  Chip,
  Grid,
  Collapse,
  Typography,
  Paper,
  Skeleton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { AuditLogResponseDto } from '../../types/audit.types';
import { formatLogTimestamp, getLogEventTypeIcon, getLogEntityTypeIcon } from '../../utils/auditLogRenderUtils';

interface AuditLogListProps {
  logs: AuditLogResponseDto[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  order?: 'asc' | 'desc';
  orderBy?: string;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onRequestSort?: (property: string) => void;
}

const AUDIT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const AuditLogList: React.FC<AuditLogListProps> = ({
  logs,
  loading = false,
  totalCount = 0,
  page = 0,
  rowsPerPage = 25,
  order = 'desc',
  orderBy = 'actionTimestamp',
  onPageChange,
  onRowsPerPageChange,
  onRequestSort
}) => {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
    if (onRequestSort) {
      onRequestSort(property);
    }
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
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
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500 }}>
                      No audit logs are available yet.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {onPageChange && onRowsPerPageChange && (
        <TablePagination
          component="div"
          count={totalCount}
          page={Math.min(page, Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1))}
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
      )}
    </Paper>
  );
};

export default AuditLogList;

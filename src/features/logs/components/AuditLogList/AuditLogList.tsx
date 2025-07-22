import React, { useState } from 'react';
import { AuditLogResponseDto } from '../../types/audit.types';
import { 
  Box, 
  Card, 
  CardContent, 
  Chip, 
  Collapse, 
  Divider, 
  Grid, 
  IconButton, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip, 
  Typography, 
  useTheme, 
  alpha,
  Avatar
} from '@mui/material';
import { 
  Add as CreateIcon, 
  Edit as UpdateIcon, 
  Delete as DeleteIcon, 
  Login as LoginIcon, 
  Logout as LogoutIcon, 
  Person as UserIcon, 
  ExpandMore, 
  ExpandLess, 
  ContentCopy,
  VerifiedUser as VerifiedIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface AuditLogListProps {
  logs: AuditLogResponseDto[];
  isLoading?: boolean;
}

// Utility function to find and highlight differences between objects
const findDifferences = (oldObj: Record<string, any>, newObj: Record<string, any>) => {
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  const differences: Record<string, { old: any; new: any; changed: boolean }> = {};
  
  allKeys.forEach(key => {
    const oldValue = oldObj[key];
    const newValue = newObj[key];
    const changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);
    
    if (changed) {
      differences[key] = {
        old: oldValue,
        new: newValue,
        changed
      };
    }
  });
  
  return differences;
};

const AuditLogList: React.FC<AuditLogListProps> = ({ logs, isLoading = false }) => {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getEventIcon = (eventType: string) => {
    switch(eventType.toLowerCase()) {
      case 'create':
        return <CreateIcon fontSize="small" />;
      case 'update':
        return <UpdateIcon fontSize="small" />;
      case 'delete':
        return <DeleteIcon fontSize="small" />;
      case 'login':
        return <LoginIcon fontSize="small" />;
      case 'logout':
        return <LogoutIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch(eventType.toLowerCase()) {
      case 'create':
        return theme.palette.success;
      case 'update':
        return theme.palette.info;
      case 'delete':
        return theme.palette.error;
      case 'login':
        return theme.palette.success;
      case 'logout':
        return theme.palette.warning;
      default:
        return theme.palette.primary;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch(entityType.toLowerCase()) {
      case 'user':
        return <UserIcon fontSize="small" />;
      case 'role':
        return <VerifiedIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return timestamp;
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  // Function to nicely format JSON data for display
  const formatJsonData = (oldValues: Record<string, any> | null, newValues: Record<string, any> | null) => {
    if (!oldValues && !newValues) return null;
    
    // For creates where there's only new values
    if (!oldValues && newValues) {
      return (
        <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              Created Values
            </Typography>
            <pre style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {JSON.stringify(newValues, null, 2)}
            </pre>
          </Paper>
        </Box>
      );
    }
    
    // For deletes where there's only old values
    if (oldValues && !newValues) {
      return (
        <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <Typography variant="subtitle2" color="error.main" gutterBottom>
              Deleted Values
            </Typography>
            <pre style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {JSON.stringify(oldValues, null, 2)}
            </pre>
          </Paper>
        </Box>
      );
    }
    
    // For updates where we can show a diff view
    if (oldValues && newValues) {
      const differences = findDifferences(oldValues, newValues);
      const hasDifferences = Object.keys(differences).length > 0;
      
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="info.main" gutterBottom>
            {hasDifferences 
              ? `Changes detected in ${Object.keys(differences).length} fields` 
              : "No changes detected between values"}
          </Typography>
          
          <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
            <ReactDiffViewer
              oldValue={JSON.stringify(oldValues, null, 2)}
              newValue={JSON.stringify(newValues, null, 2)}
              splitView={true}
              leftTitle="Previous Values"
              rightTitle="New Values"
              useDarkTheme={theme.palette.mode === 'dark'}
            />
          </Box>
          
          {hasDifferences && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Changed Fields Summary:
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell width="20%">Field</TableCell>
                      <TableCell width="40%">Previous Value</TableCell>
                      <TableCell width="40%">New Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(differences).map(([key, diff]) => (
                      <TableRow key={key} hover>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.primary.main
                          }}
                        >
                          {key}
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxWidth: 0, // Forces truncation
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <Tooltip title={typeof diff.old === 'object' ? JSON.stringify(diff.old) : String(diff.old)}>
                            <span>
                              {diff.old === undefined ? '(undefined)' : 
                                diff.old === null ? '(null)' : 
                                typeof diff.old === 'object' ? JSON.stringify(diff.old) : 
                                String(diff.old)}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ 
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxWidth: 0, // Forces truncation
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <Tooltip title={typeof diff.new === 'object' ? JSON.stringify(diff.new) : String(diff.new)}>
                            <span>
                              {diff.new === undefined ? '(undefined)' : 
                                diff.new === null ? '(null)' : 
                                typeof diff.new === 'object' ? JSON.stringify(diff.new) : 
                                String(diff.new)}
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      );
    }
    
    return null;
  };

  if (logs.length === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, 0.05)
        }}
      >
        <InfoIcon sx={{ fontSize: 48, color: theme.palette.info.main, opacity: 0.6, mb: 2 }} />
        <Typography variant="h6" gutterBottom>No Audit Logs Found</Typography>
        <Typography variant="body2" color="textSecondary">
          No activity has been recorded matching your current filters.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <TableRow>
            <TableCell width="15%">Event</TableCell>
            <TableCell width="15%">Entity</TableCell>
            <TableCell width="20%">Time</TableCell>
            <TableCell width="20%">User</TableCell>
            <TableCell width="20%">Details</TableCell>
            <TableCell width="10%" align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => {
            const eventColor = getEventColor(log.eventType);
            const isExpanded = expandedId === log.id;
            
            return (
              <React.Fragment key={log.id}>
                <TableRow 
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    bgcolor: isExpanded ? alpha(eventColor.main, 0.05) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(eventColor.main, 0.08),
                    }
                  }}
                  onClick={() => toggleExpand(log.id)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          mr: 1.5,
                          bgcolor: alpha(eventColor.main, 0.1),
                          color: eventColor.main
                        }}
                      >
                        {getEventIcon(log.eventType)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {log.eventType}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {log.id.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        icon={getEntityIcon(log.entityType)}
                        label={log.entityType}
                        size="small"
                        sx={{ 
                          mr: 1,
                          textTransform: 'capitalize',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 500
                        }}
                      />
                      <Tooltip title={`Entity ID: ${log.entityId}`}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            maxWidth: 120, 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            cursor: 'pointer'
                          }}
                        >
                          {log.entityId.substring(0, 8)}...
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatTimestamp(log.actionTimestamp)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created: {formatTimestamp(log.createdAt)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1,
                          fontSize: '0.75rem',
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                        }}
                      >
                        {log.userId.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {log.userId.length > 15 
                          ? `${log.userId.substring(0, 15)}...` 
                          : log.userId}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {log.metadata 
                        ? Object.keys(log.metadata).length 
                        : 0} metadata fields
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {log.oldValues && log.newValues 
                        ? 'Values changed' 
                        : log.newValues 
                          ? 'New record' 
                          : 'Record deleted'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(log.id);
                      }}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                
                <TableRow sx={{ bgcolor: alpha(eventColor.main, 0.03) }}>
                  <TableCell 
                    colSpan={6} 
                    sx={{ 
                      p: 0, 
                      borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none' 
                    }}
                  >
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ py: 3, px: 4 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">
                              Audit Details
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="textSecondary" display="block">
                                Event ID
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {log.id}
                                </Typography>
                                <Tooltip title="Copy ID">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyId(log.id);
                                    }}
                                  >
                                    <ContentCopy fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="textSecondary" display="block">
                                Entity Details
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                Type: {log.entityType}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  ID: {log.entityId}
                                </Typography>
                                <Tooltip title="Copy Entity ID">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyId(log.entityId);
                                    }}
                                  >
                                    <ContentCopy fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="textSecondary" display="block">
                                User Information
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  ID: {log.userId}
                                </Typography>
                                <Tooltip title="Copy User ID">
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyId(log.userId);
                                    }}
                                  >
                                    <ContentCopy fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={8}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">
                              Changed Data
                            </Typography>
                            
                            {formatJsonData(log.oldValues, log.newValues)}
                            
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <>
                                <Typography variant="subtitle2" gutterBottom color="textSecondary" sx={{ mt: 3 }}>
                                  Metadata
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                  <pre style={{ 
                                    margin: 0, 
                                    fontSize: '0.75rem', 
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                  }}>
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </Paper>
                              </>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuditLogList;
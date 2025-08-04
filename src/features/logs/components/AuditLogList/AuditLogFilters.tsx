import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  Paper,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Grid,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Search,
  Clear,
  Tune,
  Event,
  AccountTree,
  CalendarToday
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from '@mui/material/styles';
import { AuditLogFilters as AuditLogFiltersType } from '../../types/auditLogFilters.types';
import { 
  AUDIT_LOG_EVENT_TYPE_OPTIONS, 
  AUDIT_LOG_ENTITY_TYPE_OPTIONS
} from '../../constants/auditLogFiltersConstants';

interface AuditLogFiltersProps {
  filters: AuditLogFiltersType;
  onFilterChange: (filters: AuditLogFiltersType) => void;
  logsCount?: number;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({ 
  filters, 
  onFilterChange,
  logsCount = 0
}) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const handleFilterChange = (field: keyof AuditLogFiltersType, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      eventType: '',
      entityType: '',
      startDate: '',
      endDate: ''
    });
  };

  const toggleAdvancedFilters = () => {
    setAdvancedOpen(!advancedOpen);
  };

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.eventType || 
    filters.entityType || 
    filters.startDate || 
    filters.endDate
  );

  const filterCount = [
    filters.search,
    filters.eventType,
    filters.entityType,
    filters.startDate,
    filters.endDate
  ].filter(Boolean).length;

  const getEventTypeOption = (value: string) => {
    return AUDIT_LOG_EVENT_TYPE_OPTIONS.find(option => option.value === value);
  };

  const getEntityTypeOption = (value: string) => {
    return AUDIT_LOG_ENTITY_TYPE_OPTIONS.find(option => option.value === value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                id="audit-log-search-field"
                placeholder="Search logs by event type, entity, user, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <Tooltip title="Clear search">
                        <IconButton 
                          onClick={() => handleFilterChange('search', '')}
                          size="small"
                        >
                          <Clear />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Tune />}
                  onClick={toggleAdvancedFilters}
                  sx={{ 
                    textTransform: 'none',
                    position: 'relative'
                  }}
                >
                  Filters
                  {filterCount > 0 && (
                    <Chip 
                      label={filterCount} 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        height: 18,
                        fontSize: '0.7rem'
                      }} 
                      color="primary"
                    />
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="text"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    sx={{ 
                      textTransform: 'none',
                      color: theme.palette.text.secondary
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          <Collapse in={advancedOpen}>
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: `1px solid ${theme.palette.divider}` 
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={filters.eventType}
                      label="Event Type"
                      onChange={(e) => handleFilterChange('eventType', e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <Event fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      {AUDIT_LOG_EVENT_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.icon}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Entity Type</InputLabel>
                    <Select
                      value={filters.entityType}
                      label="Entity Type"
                      onChange={(e) => handleFilterChange('entityType', e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <AccountTree fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      {AUDIT_LOG_ENTITY_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.icon}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate ? new Date(filters.startDate) : null}
                    onChange={(date) => handleFilterChange('startDate', date ? date.toISOString() : '')}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate ? new Date(filters.endDate) : null}
                    onChange={(date) => handleFilterChange('endDate', date ? date.toISOString() : '')}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {hasActiveFilters && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Active filters:
                  </Typography>
                  {filters.search && (
                    <Chip
                      label={`Search: "${filters.search}"`}
                      size="small"
                      onDelete={() => handleFilterChange('search', '')}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                  {filters.eventType && (
                    <Chip
                      label={`Event: ${getEventTypeOption(filters.eventType)?.label || filters.eventType}`}
                      size="small"
                      onDelete={() => handleFilterChange('eventType', '')}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                  {filters.entityType && (
                    <Chip
                      label={`Entity: ${getEntityTypeOption(filters.entityType)?.label || filters.entityType}`}
                      size="small"
                      onDelete={() => handleFilterChange('entityType', '')}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                  {filters.startDate && (
                    <Chip
                      label={`From: ${new Date(filters.startDate).toLocaleDateString()}`}
                      size="small"
                      onDelete={() => handleFilterChange('startDate', '')}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                  {filters.endDate && (
                    <Chip
                      label={`To: ${new Date(filters.endDate).toLocaleDateString()}`}
                      size="small"
                      onDelete={() => handleFilterChange('endDate', '')}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Collapse>

          {logsCount > 0 && (
            <Box sx={{ 
              mt: 1, 
              pt: 1, 
              borderTop: advancedOpen || hasActiveFilters ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.5)}` 
            }}>
              <Typography variant="caption" color="text.secondary">
                {logsCount} log{logsCount !== 1 ? 's' : ''} found
                {hasActiveFilters && ' (filtered)'}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

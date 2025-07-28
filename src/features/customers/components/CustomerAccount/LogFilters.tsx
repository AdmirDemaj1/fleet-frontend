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
import { useLogFilters } from '../../hooks/useLogFilters';
import { LogFilters as LogFiltersType } from '../../types/logFilters.types';
import { 
  LOG_EVENT_TYPE_OPTIONS, 
  LOG_ENTITY_TYPE_OPTIONS
} from '../../constants/logFiltersConstants';

interface LogFiltersProps {
  filters: LogFiltersType;
  onFilterChange: (filters: LogFiltersType) => void;
  logsCount?: number;
}

export const LogFilters: React.FC<LogFiltersProps> = ({ 
  filters, 
  onFilterChange,
  logsCount = 0
}) => {
  const {
    theme,
    filterState,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters
  } = useLogFilters(filters, onFilterChange);

  const { advancedOpen, hasActiveFilters, filterCount } = filterState;

  const getEventTypeOption = (value: string) => {
    return LOG_EVENT_TYPE_OPTIONS.find(option => option.value === value);
  };

  const getEntityTypeOption = (value: string) => {
    return LOG_ENTITY_TYPE_OPTIONS.find(option => option.value === value);
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
                id="log-search-field"
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
                          size="small" 
                          onClick={() => handleFilterChange('search', '')}
                          edge="end"
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel id="log-event-type-label" size="small">Event Type</InputLabel>
                  <Select
                    labelId="log-event-type-label"
                    value={filters.eventType}
                    onChange={(e) => handleFilterChange('eventType', e.target.value)}
                    label="Event Type"
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        transition: 'all 0.2s'
                      }
                    }}
                  >
                    <MenuItem value="">All Events</MenuItem>
                    {LOG_EVENT_TYPE_OPTIONS.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {option.icon && (
                            <Box sx={{ mr: 1, color: theme.palette.primary.main }}>
                              {option.icon}
                            </Box>
                          )}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Tooltip title="More filters">
                  <IconButton 
                    color={advancedOpen ? 'primary' : 'default'} 
                    onClick={toggleAdvancedFilters}
                    sx={{ 
                      height: 40, 
                      width: 40,
                      bgcolor: advancedOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      border: `1px solid ${advancedOpen ? theme.palette.primary.main : theme.palette.divider}`,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: advancedOpen ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.action.hover, 0.8)
                      }
                    }}
                  >
                    <Tune fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          
          <Collapse in={advancedOpen}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.primary">
                Additional Filters
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Entity Type</InputLabel>
                    <Select
                      value={filters.entityType}
                      onChange={(e) => handleFilterChange('entityType', e.target.value)}
                      label="Entity Type"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Entities</MenuItem>
                      {LOG_ENTITY_TYPE_OPTIONS.map((option: any) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate ? new Date(filters.startDate) : null}
                    onChange={(date: Date | null) => {
                      handleFilterChange('startDate', date ? date.toISOString().split('T')[0] : '');
                    }}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2 
                          }
                        }
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate ? new Date(filters.endDate) : null}
                    onChange={(date: Date | null) => {
                      handleFilterChange('endDate', date ? date.toISOString().split('T')[0] : '');
                    }}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2 
                          }
                        }
                      } 
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
          
          {hasActiveFilters && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
              
              {filters.search && (
                <Chip 
                  label={`Search: ${filters.search}`} 
                  size="small"
                  onDelete={() => handleFilterChange('search', '')}
                  sx={{ borderRadius: 1.5 }}
                  icon={<Search fontSize="small" />}
                />
              )}
              
              {filters.eventType && (
                <Chip 
                  label={`Event: ${getEventTypeOption(filters.eventType)?.label || filters.eventType}`} 
                  size="small"
                  onDelete={() => handleFilterChange('eventType', '')}
                  sx={{ borderRadius: 1.5 }}
                  icon={<Event fontSize="small" />}
                />
              )}
              
              {filters.entityType && (
                <Chip 
                  label={`Entity: ${getEntityTypeOption(filters.entityType)?.label || filters.entityType}`} 
                  size="small"
                  onDelete={() => handleFilterChange('entityType', '')}
                  sx={{ borderRadius: 1.5 }}
                  icon={<AccountTree fontSize="small" />}
                />
              )}
              
              {filters.startDate && (
                <Chip 
                  label={`From: ${new Date(filters.startDate).toLocaleDateString()}`} 
                  size="small"
                  onDelete={() => handleFilterChange('startDate', '')}
                  sx={{ borderRadius: 1.5 }}
                  icon={<CalendarToday fontSize="small" />}
                />
              )}
              
              {filters.endDate && (
                <Chip 
                  label={`To: ${new Date(filters.endDate).toLocaleDateString()}`} 
                  size="small"
                  onDelete={() => handleFilterChange('endDate', '')}
                  sx={{ borderRadius: 1.5 }}
                  icon={<CalendarToday fontSize="small" />}
                />
              )}
              
              <Button
                variant="text"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                sx={{ ml: 'auto' }}
              >
                Clear All ({filterCount})
              </Button>
            </Box>
          )}
          
          {/* Results count */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {logsCount} log{logsCount !== 1 ? 's' : ''} found
            </Typography>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

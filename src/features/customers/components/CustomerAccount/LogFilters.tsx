import React from 'react';
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  Typography,
  Chip,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ExpandMore, ExpandLess, FilterList } from '@mui/icons-material';
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
  onFilterChange 
}) => {
  const {
    filterState,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters
  } = useLogFilters(filters, onFilterChange);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', event.target.value);
  };

  const handleEventTypeChange = (event: any) => {
    handleFilterChange('eventType', event.target.value);
  };

  const handleEntityTypeChange = (event: any) => {
    handleFilterChange('entityType', event.target.value);
  };

  const handleStartDateChange = (date: Date | null) => {
    handleFilterChange('startDate', date ? date.toISOString().split('T')[0] : '');
  };

  const handleEndDateChange = (date: Date | null) => {
    handleFilterChange('endDate', date ? date.toISOString().split('T')[0] : '');
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically through handleFilterChange
  };

  const getFilterChips = () => {
    const chips: Array<{ key: string; label: string }> = [];
    
    if (filters.eventType) {
      const eventOption = LOG_EVENT_TYPE_OPTIONS.find(opt => opt.value === filters.eventType);
      chips.push({
        key: 'eventType',
        label: `Event: ${eventOption?.label || filters.eventType}`
      });
    }
    
    if (filters.entityType) {
      const entityOption = LOG_ENTITY_TYPE_OPTIONS.find(opt => opt.value === filters.entityType);
      chips.push({
        key: 'entityType',
        label: `Entity: ${entityOption?.label || filters.entityType}`
      });
    }
    
    if (filters.startDate) {
      chips.push({
        key: 'startDate',
        label: `From: ${new Date(filters.startDate).toLocaleDateString()}`
      });
    }
    
    if (filters.endDate) {
      chips.push({
        key: 'endDate',
        label: `To: ${new Date(filters.endDate).toLocaleDateString()}`
      });
    }
    
    return chips;
  };

  const handleRemoveFilter = (key: string) => {
    handleFilterChange(key as keyof LogFiltersType, '');
  };

  const filterChips = getFilterChips();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Main Filter Row */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              placeholder="Search logs..."
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={handleSearchChange}
              sx={{ minWidth: 200, flexGrow: 1 }}
            />

            {/* Event Type Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={filters.eventType}
                label="Event Type"
                onChange={handleEventTypeChange}
              >
                <MenuItem value="">All Types</MenuItem>
                {LOG_EVENT_TYPE_OPTIONS.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Entity Type Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={filters.entityType}
                label="Entity Type"
                onChange={handleEntityTypeChange}
              >
                <MenuItem value="">All Entities</MenuItem>
                {LOG_ENTITY_TYPE_OPTIONS.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outlined"
              size="small"
              onClick={toggleAdvancedFilters}
              startIcon={<FilterList />}
              endIcon={filterState.advancedOpen ? <ExpandLess /> : <ExpandMore />}
              sx={{ 
                minWidth: 'auto',
                color: filterState.advancedOpen ? 'primary.main' : 'text.secondary',
                borderColor: filterState.advancedOpen ? 'primary.main' : 'divider'
              }}
            >
              Filters
            </Button>
          </Box>

          {/* Advanced Filters */}
                    <Collapse in={filterState.advancedOpen}>
            <Box sx={{ 
              pt: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Advanced Filters
              </Typography>
              
              <Grid container spacing={2}>
                {/* Date Range */}
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate ? new Date(filters.startDate) : null}
                    onChange={handleStartDateChange}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        fullWidth: true
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate ? new Date(filters.endDate) : null}
                    onChange={handleEndDateChange}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        fullWidth: true
                      } 
                    }}
                  />
                </Grid>
              </Grid>

              {/* Filter Actions */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearFilters}
                  disabled={!filterState.hasActiveFilters}
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Applied Filter Chips */}
          {filterChips.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
              {filterChips.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  size="small"
                  onDelete={() => handleRemoveFilter(chip.key)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

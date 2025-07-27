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
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  Clear,
  Tune,
} from '@mui/icons-material';

// Local imports
import { ContractFiltersProps } from '../../types/contractFilters.types';
import { useContractFilters, useFilterOptions } from '../../hooks/useContractFilters';
import { getActiveFilterChips } from '../../utils/filterUtils';

// Export types for external use
export type { ContractFilters as ContractFiltersType, ContractFiltersProps } from '../../types/contractFilters.types';

export const ContractFilters: React.FC<ContractFiltersProps> = ({
  filters,
  onFilterChange,
  contractsCount = 0
}) => {
  const theme = useTheme();
  
  // Use custom hooks
  const {
    advancedOpen,
    hasActiveFilters,
    filterCount,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters
  } = useContractFilters(filters, onFilterChange);

  const {
    getStatusOption,
    getTypeOption,
    getDateRangeOption,
    getAmountRangeOption,
    statusOptions,
    typeOptions,
    dateRangeOptions,
    amountRangeOptions
  } = useFilterOptions();

  // Get active filter chips
  const activeFilterChips = getActiveFilterChips(
    filters,
    getStatusOption,
    getTypeOption,
    getDateRangeOption,
    getAmountRangeOption
  );

  return (
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
              id="contract-search-field"
              placeholder="Search contracts by number, type, or customer..."
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
                <InputLabel id="contract-status-label" size="small">Status</InputLabel>
                <Select
                  labelId="contract-status-label"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  {statusOptions.map((option) => (
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
                  <InputLabel>Contract Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Contract Type"
                  >
                    {typeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    label="Date Range"
                  >
                    {dateRangeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Amount Range</InputLabel>
                  <Select
                    value={filters.amountRange}
                    onChange={(e) => handleFilterChange('amountRange', e.target.value)}
                    label="Amount Range"
                  >
                    {amountRangeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
        
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            
            {activeFilterChips.map((chip) => (
              <Chip 
                key={chip.key}
                label={chip.label} 
                size="small"
                onDelete={() => handleFilterChange(chip.key, '')}
                sx={{ borderRadius: 1.5 }}
                icon={chip.icon}
              />
            ))}
            
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
            {contractsCount} contract{contractsCount !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

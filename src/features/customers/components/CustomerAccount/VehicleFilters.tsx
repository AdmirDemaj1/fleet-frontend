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
  DirectionsCar,
  CheckCircle,
  CalendarToday,
  Category
} from '@mui/icons-material';
import type { VehicleFiltersProps } from '../../types/vehicleFilters.types';
import { VEHICLE_STATUS_OPTIONS, getYearOptions } from '../../constants/vehicleFiltersConstants';
import { useVehicleFilters } from '../../hooks/useVehicleFilters';

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onFilterChange,
  vehiclesCount = 0
}) => {
  const {
    theme,
    filterState,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters
  } = useVehicleFilters(filters, onFilterChange);

  const { advancedOpen, hasActiveFilters, filterCount } = filterState;

  const getStatusOption = (value: string) => {
    return VEHICLE_STATUS_OPTIONS.find(option => option.value === value);
  };

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
              id="vehicle-search-field"
              placeholder="Search vehicles by license plate, VIN, make, or model..."
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
                <InputLabel id="vehicle-status-label" size="small">Status</InputLabel>
                <Select
                  labelId="vehicle-status-label"
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
                  {VEHICLE_STATUS_OPTIONS.map((option) => (
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
                <TextField
                  label="Make"
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  placeholder="e.g. Toyota, BMW"
                  fullWidth
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Model"
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  placeholder="e.g. Corolla, X5"
                  fullWidth
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    label="Year"
                    sx={{ borderRadius: 2 }}
                  >
                    {getYearOptions().map((option) => (
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
            
            {filters.search && (
              <Chip 
                label={`Search: ${filters.search}`} 
                size="small"
                onDelete={() => handleFilterChange('search', '')}
                sx={{ borderRadius: 1.5 }}
                icon={<Search fontSize="small" />}
              />
            )}
            
            {filters.status && (
              <Chip 
                label={`Status: ${getStatusOption(filters.status)?.label}`} 
                size="small"
                onDelete={() => handleFilterChange('status', '')}
                sx={{ borderRadius: 1.5 }}
                icon={getStatusOption(filters.status)?.icon || <CheckCircle fontSize="small" />}
              />
            )}
            
            {filters.make && (
              <Chip 
                label={`Make: ${filters.make}`} 
                size="small"
                onDelete={() => handleFilterChange('make', '')}
                sx={{ borderRadius: 1.5 }}
                icon={<Category fontSize="small" />}
              />
            )}
            
            {filters.model && (
              <Chip 
                label={`Model: ${filters.model}`} 
                size="small"
                onDelete={() => handleFilterChange('model', '')}
                sx={{ borderRadius: 1.5 }}
                icon={<DirectionsCar fontSize="small" />}
              />
            )}
            
            {filters.year && (
              <Chip 
                label={`Year: ${filters.year}`} 
                size="small"
                onDelete={() => handleFilterChange('year', '')}
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
            {vehiclesCount} vehicle{vehiclesCount !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default VehicleFilters;

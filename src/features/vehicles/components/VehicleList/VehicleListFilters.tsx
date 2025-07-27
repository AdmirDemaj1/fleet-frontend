import React, { useState } from 'react';
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
  DirectionsCar,
  Business,
  AttachMoney,
  CalendarMonth,
  FilterAlt
} from '@mui/icons-material';
import { VehicleStatus, VehicleQueryParams } from '../../types/vehicleType';

interface VehicleFiltersProps {
  filters: VehicleQueryParams;
  onFilterChange: (newFilters: VehicleQueryParams) => void;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );
  
  const filterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof VehicleQueryParams];
    return value !== undefined && value !== '' && value !== null;
  }).length;

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: VehicleStatus | '') => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.status;
    } else {
      newFilters.status = value;
    }
    onFilterChange(newFilters);
  };

  const handleMakeChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.make;
    } else {
      newFilters.make = value;
    }
    onFilterChange(newFilters);
  };

  const handleModelChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.model;
    } else {
      newFilters.model = value;
    }
    onFilterChange(newFilters);
  };

  const handleYearChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.year;
    } else {
      newFilters.year = parseInt(value);
    }
    onFilterChange(newFilters);
  };

  const handleLegalOwnerChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.legalOwner;
    } else {
      newFilters.legalOwner = value;
    }
    onFilterChange(newFilters);
  };

  const handleLiquidAssetChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.isLiquidAsset;
    } else {
      newFilters.isLiquidAsset = value === 'true';
    }
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const handleRemoveFilter = (filterKey: keyof VehicleQueryParams) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFilterChange(newFilters);
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
              placeholder="Search vehicles by license plate, VIN, make, model..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                        onClick={() => handleSearchChange('')}
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
                <InputLabel id="vehicle-status-label" size="small">Vehicle Status</InputLabel>
                <Select
                  labelId="vehicle-status-label"
                  value={filters.status || ''}
                  onChange={(e) => handleStatusChange(e.target.value as VehicleStatus | '')}
                  label="Vehicle Status"
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value={VehicleStatus.AVAILABLE}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsCar fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                      Available
                    </Box>
                  </MenuItem>
                  <MenuItem value={VehicleStatus.LEASED}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Leased
                    </Box>
                  </MenuItem>
                  <MenuItem value={VehicleStatus.MAINTENANCE}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FilterAlt fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
                      Maintenance
                    </Box>
                  </MenuItem>
                  <MenuItem value={VehicleStatus.SOLD}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      Sold
                    </Box>
                  </MenuItem>
                  <MenuItem value={VehicleStatus.LIQUID_ASSET}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
                      Liquid Asset
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Tooltip title={advancedOpen ? "Hide advanced filters" : "Show advanced filters"}>
                <IconButton 
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  color={hasActiveFilters ? "primary" : "default"}
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative'
                  }}
                >
                  <Tune fontSize="small" />
                  {filterCount > 0 && (
                    <Chip 
                      size="small" 
                      label={filterCount} 
                      color="primary"
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        minWidth: 20,
                        height: 20,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={advancedOpen}>
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Advanced Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Make"
                  value={filters.make || ''}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Toyota, BMW"
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
                  value={filters.model || ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Corolla, X5"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Year"
                  type="number"
                  value={filters.year || ''}
                  onChange={(e) => handleYearChange(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Liquid Asset</InputLabel>
                  <Select
                    value={filters.isLiquidAsset === undefined ? '' : filters.isLiquidAsset.toString()}
                    onChange={(e) => handleLiquidAssetChange(e.target.value)}
                    label="Liquid Asset"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Legal Owner"
                  value={filters.legalOwner || ''}
                  onChange={(e) => handleLegalOwnerChange(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Owner name"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mr: 1 }}>
                Active Filters:
              </Typography>
              
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  onDelete={() => handleRemoveFilter('search')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              {filters.status && (
                <Chip
                  label={`Status: ${filters.status}`}
                  onDelete={() => handleRemoveFilter('status')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              {filters.make && (
                <Chip
                  label={`Make: ${filters.make}`}
                  onDelete={() => handleRemoveFilter('make')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              {filters.model && (
                <Chip
                  label={`Model: ${filters.model}`}
                  onDelete={() => handleRemoveFilter('model')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              {filters.year && (
                <Chip
                  label={`Year: ${filters.year}`}
                  onDelete={() => handleRemoveFilter('year')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              {filters.legalOwner && (
                <Chip
                  label={`Owner: ${filters.legalOwner}`}
                  onDelete={() => handleRemoveFilter('legalOwner')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              {filters.isLiquidAsset !== undefined && (
                <Chip
                  label={`Liquid Asset: ${filters.isLiquidAsset ? 'Yes' : 'No'}`}
                  onDelete={() => handleRemoveFilter('isLiquidAsset')}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
              
              <Button
                size="small"
                onClick={handleClearFilters}
                sx={{ 
                  ml: 1,
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
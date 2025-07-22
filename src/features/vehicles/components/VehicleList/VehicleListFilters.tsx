import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  Typography,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  DirectionsCar,
  BusinessCenter,
  CalendarToday,
  AttachMoney
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
  const [expanded, setExpanded] = useState(false);
  
  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onFilterChange({ ...filters, status: event.target.value as VehicleStatus | undefined });
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: event.target.value });
  };
  
  const handleMakeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, make: event.target.value });
  };
  
  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, model: event.target.value });
  };
  
  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = event.target.value ? Number(event.target.value) : undefined;
    onFilterChange({ ...filters, year: yearValue });
  };
  
  const handleLiquidAssetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    onFilterChange({ 
      ...filters, 
      isLiquidAsset: value === '' ? undefined : value === 'true'
    });
  };
  
  const handleLegalOwnerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, legalOwner: event.target.value });
  };
  
  const handleClearAll = () => {
    onFilterChange({});
  };
  
  const handleClearFilter = (filterName: keyof VehicleQueryParams) => {
    const newFilters = { ...filters };
    delete newFilters[filterName];
    onFilterChange(newFilters);
  };
  
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );
  
  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof VehicleQueryParams] !== undefined && 
    filters[key as keyof VehicleQueryParams] !== '' &&
    filters[key as keyof VehicleQueryParams] !== null
  ).length;
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search vehicles by license plate, VIN, make, model..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => handleClearFilter('search')}
                      edge="end"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filters.status || ''}
                label="Status"
                onChange={handleStatusChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                {Object.values(VehicleStatus).map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <IconButton 
              color={expanded ? 'primary' : 'default'}
              onClick={() => setExpanded(!expanded)}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <FilterList />
            </IconButton>
            {hasActiveFilters && (
              <IconButton 
                color="error" 
                onClick={handleClearAll}
                sx={{ ml: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Clear />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {hasActiveFilters && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            Active filters:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filters.search && (
              <Chip 
                label={`Search: ${filters.search}`} 
                size="small" 
                onDelete={() => handleClearFilter('search')}
                icon={<Search fontSize="small" />}
              />
            )}
            {filters.status && (
              <Chip 
                label={`Status: ${filters.status}`} 
                size="small"
                onDelete={() => handleClearFilter('status')}
                icon={<DirectionsCar fontSize="small" />}
              />
            )}
            {filters.make && (
              <Chip 
                label={`Make: ${filters.make}`} 
                size="small"
                onDelete={() => handleClearFilter('make')}
                icon={<DirectionsCar fontSize="small" />}
              />
            )}
            {filters.model && (
              <Chip 
                label={`Model: ${filters.model}`} 
                size="small"
                onDelete={() => handleClearFilter('model')}
                icon={<DirectionsCar fontSize="small" />}
              />
            )}
            {filters.year && (
              <Chip 
                label={`Year: ${filters.year}`} 
                size="small"
                onDelete={() => handleClearFilter('year')}
                icon={<CalendarToday fontSize="small" />}
              />
            )}
            {filters.legalOwner && (
              <Chip 
                label={`Owner: ${filters.legalOwner}`} 
                size="small"
                onDelete={() => handleClearFilter('legalOwner')}
                icon={<BusinessCenter fontSize="small" />}
              />
            )}
            {filters.isLiquidAsset !== undefined && (
              <Chip 
                label={`Liquid Asset: ${filters.isLiquidAsset ? 'Yes' : 'No'}`} 
                size="small"
                onDelete={() => handleClearFilter('isLiquidAsset')}
                icon={<AttachMoney fontSize="small" />}
              />
            )}
          </Stack>
        </Box>
      )}
      
      {expanded && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Advanced Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Make"
                value={filters.make || ''}
                onChange={handleMakeChange}
                variant="outlined"
                size="small"
                placeholder="e.g. Toyota, BMW"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Model"
                value={filters.model || ''}
                onChange={handleModelChange}
                variant="outlined"
                size="small"
                placeholder="e.g. Corolla, X5"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={filters.year || ''}
                onChange={handleYearChange}
                variant="outlined"
                size="small"
                placeholder="e.g. 2023"
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="liquid-asset-filter-label">Liquid Asset</InputLabel>
                <Select
                  labelId="liquid-asset-filter-label"
                  id="liquid-asset-filter"
                  value={filters.isLiquidAsset === undefined ? '' : String(filters.isLiquidAsset)}
                  label="Liquid Asset"
                  onChange={handleLiquidAssetChange}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Legal Owner"
                value={filters.legalOwner || ''}
                onChange={handleLegalOwnerChange}
                variant="outlined"
                size="small"
                placeholder="e.g. Company name"
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};
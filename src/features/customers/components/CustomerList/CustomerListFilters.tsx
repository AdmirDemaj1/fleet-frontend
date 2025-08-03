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
  Person,
  Business,
  BusinessCenter,
  DirectionsCar,
  CalendarMonth,
  Security
} from '@mui/icons-material';
import { CustomerType } from '../../types/customer.types';

interface CustomerListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: CustomerType | '';
  onTypeChange: (value: CustomerType | '') => void;
  hasVehicles?: boolean;
  onHasVehiclesChange: (value: boolean | undefined) => void;
  hasContracts?: boolean;
  onHasContractsChange: (value: boolean | undefined) => void;
  hasCollaterals?: boolean;
  onHasCollateralsChange: (value: boolean | undefined) => void;
  onClearFilters: () => void;
}

export const CustomerListFilters: React.FC<CustomerListFiltersProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  hasVehicles,
  onHasVehiclesChange,
  hasContracts,
  onHasContractsChange,
  hasCollaterals,
  onHasCollateralsChange,
  onClearFilters
}) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const hasActiveFilters = searchTerm || typeFilter || dateRange || statusFilter || hasVehicles !== undefined || hasContracts !== undefined || hasCollaterals !== undefined;
  const filterCount = [searchTerm, typeFilter, dateRange, statusFilter, hasVehicles !== undefined ? 'hasVehicles' : '', hasContracts !== undefined ? 'hasContracts' : '', hasCollaterals !== undefined ? 'hasCollaterals' : ''].filter(Boolean).length;

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
              id="customer-search-field"
              placeholder="Search customers by name, email, phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <Tooltip title="Clear search">
                      <IconButton 
                        size="small" 
                        onClick={() => onSearchChange('')}
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
                <InputLabel id="customer-type-label" size="small">Customer Type</InputLabel>
                <Select
                  labelId="customer-type-label"
                  value={typeFilter}
                  onChange={(e) => onTypeChange(e.target.value as CustomerType | '')}
                  label="Customer Type"
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value={CustomerType.INDIVIDUAL}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Individual
                    </Box>
                  </MenuItem>
                  <MenuItem value={CustomerType.BUSINESS}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      Business
                    </Box>
                  </MenuItem>
                  <MenuItem value={CustomerType.ENDORSER}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Security fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
                      Endorser
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="More filters">
                <IconButton 
                  color={advancedOpen ? 'primary' : 'default'} 
                  onClick={() => setAdvancedOpen(!advancedOpen)}
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
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="">Any Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">Any Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Has Vehicles</InputLabel>
                  <Select
                    value={hasVehicles === undefined ? '' : hasVehicles.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      onHasVehiclesChange(value === '' ? undefined : value === 'true');
                    }}
                    label="Has Vehicles"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Has Contracts</InputLabel>
                  <Select
                    value={hasContracts === undefined ? '' : hasContracts.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      onHasContractsChange(value === '' ? undefined : value === 'true');
                    }}
                    label="Has Contracts"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Has Collaterals</InputLabel>
                  <Select
                    value={hasCollaterals === undefined ? '' : hasCollaterals.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      onHasCollateralsChange(value === '' ? undefined : value === 'true');
                    }}
                    label="Has Collaterals"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
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
            
            {searchTerm && (
              <Chip 
                label={`Search: ${searchTerm}`} 
                size="small"
                onDelete={() => onSearchChange('')}
                sx={{ borderRadius: 1.5 }}
              />
            )}
            
            {typeFilter && (
              <Chip 
                label={`Type: ${typeFilter === CustomerType.INDIVIDUAL ? 'Individual' : 'Business'}`} 
                size="small"
                onDelete={() => onTypeChange('')}
                sx={{ borderRadius: 1.5 }}
                icon={typeFilter === CustomerType.INDIVIDUAL ? <Person fontSize="small" /> : <Business fontSize="small" />}
              />
            )}
            
            {dateRange && (
              <Chip 
                label={`Date: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`} 
                size="small"
                onDelete={() => setDateRange('')}
                sx={{ borderRadius: 1.5 }}
                icon={<CalendarMonth fontSize="small" />}
              />
            )}
            
            {statusFilter && (
              <Chip 
                label={`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`} 
                size="small"
                onDelete={() => setStatusFilter('')}
                sx={{ borderRadius: 1.5 }}
              />
            )}
            
            {hasVehicles !== undefined && (
              <Chip 
                label={`Vehicles: ${hasVehicles ? 'Yes' : 'No'}`} 
                size="small"
                onDelete={() => onHasVehiclesChange(undefined)}
                sx={{ borderRadius: 1.5 }}
                icon={<DirectionsCar fontSize="small" />}
              />
            )}
            
            {hasContracts !== undefined && (
              <Chip 
                label={`Contracts: ${hasContracts ? 'Yes' : 'No'}`} 
                size="small"
                onDelete={() => onHasContractsChange(undefined)}
                sx={{ borderRadius: 1.5 }}
                icon={<BusinessCenter fontSize="small" />}
              />
            )}
            
            {hasCollaterals !== undefined && (
              <Chip 
                label={`Collaterals: ${hasCollaterals ? 'Yes' : 'No'}`} 
                size="small"
                onDelete={() => onHasCollateralsChange(undefined)}
                sx={{ borderRadius: 1.5 }}
              />
            )}
            
            <Button
              variant="text"
              size="small"
              startIcon={<Clear />}
              onClick={() => {
                onClearFilters();
                setDateRange('');
                setStatusFilter('');
              }}
              sx={{ ml: 'auto' }}
            >
              Clear All ({filterCount})
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
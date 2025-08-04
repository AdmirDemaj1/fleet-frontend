import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Button,
  Chip,
  InputAdornment,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  CalendarToday
} from '@mui/icons-material';
import { PaymentFilters as PaymentFiltersType } from '../../types/invoice.types';
import { PAYMENT_FILTER_OPTIONS } from '../../constants/paymentConstants';

interface PaymentFiltersProps {
  filters: PaymentFiltersType;
  onFiltersChange: (filters: PaymentFiltersType) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleFilterChange = (field: keyof PaymentFiltersType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      [field]: value === '' ? undefined : value
    });
  };

  const handleNumberFilterChange = (field: keyof PaymentFiltersType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      [field]: value === '' ? undefined : parseFloat(value)
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment Filters
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} active`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={onClearFilters}
              disabled={isLoading}
            >
              Clear All
            </Button>
          )}
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Basic Filters - Always Visible */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search Payments"
            placeholder="Search by customer, contract, or reference..."
            value={filters.search || ''}
            onChange={handleFilterChange('search')}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Payment Status"
            value={filters.status || ''}
            onChange={handleFilterChange('status')}
            disabled={isLoading}
          >
            {PAYMENT_FILTER_OPTIONS.status.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Payment Type"
            value={filters.type || ''}
            onChange={handleFilterChange('type')}
            disabled={isLoading}
          >
            {PAYMENT_FILTER_OPTIONS.type.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Advanced Filters - Collapsible */}
      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Advanced Filters
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              value={filters.dateFrom || ''}
              onChange={handleFilterChange('dateFrom')}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={filters.dateTo || ''}
              onChange={handleFilterChange('dateTo')}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Amount"
              value={filters.amountMin || ''}
              onChange={handleNumberFilterChange('amountMin')}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Amount"
              value={filters.amountMax || ''}
              onChange={handleNumberFilterChange('amountMax')}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Payment Method"
              value={filters.paymentMethod || ''}
              onChange={handleFilterChange('paymentMethod')}
              disabled={isLoading}
            >
              {PAYMENT_FILTER_OPTIONS.paymentMethod.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer ID"
              placeholder="Enter customer ID..."
              value={filters.customerId || ''}
              onChange={handleFilterChange('customerId')}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contract ID"
              placeholder="Enter contract ID..."
              value={filters.contractId || ''}
              onChange={handleFilterChange('contractId')}
              disabled={isLoading}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default PaymentFilters;

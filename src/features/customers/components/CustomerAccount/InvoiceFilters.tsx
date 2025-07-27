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
  CheckCircle,
  CalendarMonth,
  AttachMoney,
  Category
} from '@mui/icons-material';
import { InvoiceFiltersProps } from '../../types/invoiceFilters.types';
import { 
  STATUS_OPTIONS, 
  TYPE_OPTIONS, 
  DATE_RANGE_OPTIONS, 
  AMOUNT_RANGE_OPTIONS 
} from '../../constants/invoiceFiltersConstants';
import { useInvoiceFilters } from '../../hooks/useInvoiceFilters';

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFilterChange,
  invoicesCount = 0
}) => {
  const {
    theme,
    filterState,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters,
    getStatusOption,
    getTypeOption,
    getDateRangeOption,
    getAmountRangeOption
  } = useInvoiceFilters(filters, onFilterChange);

  const { advancedOpen, hasActiveFilters, filterCount } = filterState;

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
              id="invoice-search-field"
              placeholder="Search invoices by reference, amount, or notes..."
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
                <InputLabel id="invoice-status-label" size="small">Status</InputLabel>
                <Select
                  labelId="invoice-status-label"
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
                  {STATUS_OPTIONS.map((option) => (
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
                  <InputLabel>Invoice Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Invoice Type"
                  >
                    {TYPE_OPTIONS.map((option) => (
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
                    {DATE_RANGE_OPTIONS.map((option) => (
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
                    {AMOUNT_RANGE_OPTIONS.map((option) => (
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
            
            {filters.type && (
              <Chip 
                label={`Type: ${getTypeOption(filters.type)?.label}`} 
                size="small"
                onDelete={() => handleFilterChange('type', '')}
                sx={{ borderRadius: 1.5 }}
                icon={<Category fontSize="small" />}
              />
            )}
            
            {filters.dateRange && (
              <Chip 
                label={`Date: ${getDateRangeOption(filters.dateRange)?.label}`} 
                size="small"
                onDelete={() => handleFilterChange('dateRange', '')}
                sx={{ borderRadius: 1.5 }}
                icon={<CalendarMonth fontSize="small" />}
              />
            )}
            
            {filters.amountRange && (
              <Chip 
                label={`Amount: ${getAmountRangeOption(filters.amountRange)?.label}`} 
                size="small"
                onDelete={() => handleFilterChange('amountRange', '')}
                sx={{ borderRadius: 1.5 }}
                icon={<AttachMoney fontSize="small" />}
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
            {invoicesCount} invoice{invoicesCount !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default InvoiceFilters;

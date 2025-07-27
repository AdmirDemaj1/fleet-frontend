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
  CheckCircle,
  AccessTime,
  ErrorOutline,
  CalendarMonth,
  AttachMoney,
  Category
} from '@mui/icons-material';

// Invoice filter state interface
export interface InvoiceFilters {
  search: string;
  status: string;
  type: string;
  dateRange: string;
  amountRange: string;
}

interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (newFilters: InvoiceFilters) => void;
  invoicesCount?: number;
}

// Status configuration for chips and dropdowns
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses', icon: null },
  { value: 'pending', label: 'Pending', icon: <AccessTime fontSize="small" /> },
  { value: 'paid', label: 'Paid', icon: <CheckCircle fontSize="small" /> },
  { value: 'overdue', label: 'Overdue', icon: <ErrorOutline fontSize="small" /> },
  { value: 'cancelled', label: 'Cancelled', icon: <ErrorOutline fontSize="small" /> }
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'final', label: 'Final' },
  { value: 'penalty', label: 'Penalty' }
];

const DATE_RANGE_OPTIONS = [
  { value: '', label: 'Any Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

const AMOUNT_RANGE_OPTIONS = [
  { value: '', label: 'Any Amount' },
  { value: '0-100', label: 'Under $100' },
  { value: '100-500', label: '$100 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-5000', label: '$1,000 - $5,000' },
  { value: '5000+', label: 'Over $5,000' }
];

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFilterChange,
  invoicesCount = 0
}) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const filterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  const handleFilterChange = (key: keyof InvoiceFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      type: '',
      dateRange: '',
      amountRange: ''
    });
  };

  const getStatusOption = (value: string) => 
    STATUS_OPTIONS.find(option => option.value === value);

  const getTypeOption = (value: string) => 
    TYPE_OPTIONS.find(option => option.value === value);

  const getDateRangeOption = (value: string) => 
    DATE_RANGE_OPTIONS.find(option => option.value === value);

  const getAmountRangeOption = (value: string) => 
    AMOUNT_RANGE_OPTIONS.find(option => option.value === value);

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

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
  Description,
  Assignment,
  AttachMoney,
  CalendarMonth,
  Security,
  DriveEta
} from '@mui/icons-material';
import { ContractType, ContractStatus } from '../../types/contract.types';

interface ContractListFiltersProps {
  search: string;
  type?: ContractType;
  status?: ContractStatus;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: ContractType | undefined) => void;
  onStatusChange: (status: ContractStatus | undefined) => void;
  onReset: () => void;
}

export const ContractListFilters: React.FC<ContractListFiltersProps> = ({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onReset,
}) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [amountRange, setAmountRange] = useState('');
  const [hasCollateral, setHasCollateral] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const hasActiveFilters = search || type || status || dateRange || amountRange || hasCollateral || paymentMethod;
  const filterCount = [search, type, status, dateRange, amountRange, hasCollateral, paymentMethod].filter(Boolean).length;

  const getContractTypeIcon = (contractType: ContractType) => {
    switch (contractType) {
      case ContractType.LOAN:
        return <AttachMoney fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />;
      case ContractType.LEASING:
        return <Assignment fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (contractStatus: ContractStatus) => {
    switch (contractStatus) {
      case ContractStatus.ACTIVE:
        return theme.palette.success.main;
      case ContractStatus.DRAFT:
        return theme.palette.warning.main;
      case ContractStatus.CANCELLED:
        return theme.palette.error.main;
      case ContractStatus.COMPLETED:
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
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
              id="contract-search-field"
              placeholder="Search contracts by number, customer name, vehicle..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: search && (
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
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="contract-type-label" size="small">Type</InputLabel>
                <Select
                  labelId="contract-type-label"
                  value={type || ''}
                  onChange={(e) => onTypeChange((e.target.value as ContractType) || undefined)}
                  label="Type"
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value={ContractType.LOAN}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                      Loan
                    </Box>
                  </MenuItem>
                  <MenuItem value={ContractType.LEASING}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assignment fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Leasing
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="contract-status-label" size="small">Status</InputLabel>
                <Select
                  labelId="contract-status-label"
                  value={status || ''}
                  onChange={(e) => onStatusChange((e.target.value as ContractStatus) || undefined)}
                  label="Status"
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={ContractStatus.DRAFT}>Draft</MenuItem>
                  <MenuItem value={ContractStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={ContractStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={ContractStatus.CANCELLED}>Cancelled</MenuItem>
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
                  <InputLabel>Amount Range</InputLabel>
                  <Select
                    value={amountRange}
                    onChange={(e) => setAmountRange(e.target.value)}
                    label="Amount Range"
                  >
                    <MenuItem value="">Any Amount</MenuItem>
                    <MenuItem value="0-10000">$0 - $10,000</MenuItem>
                    <MenuItem value="10000-50000">$10,000 - $50,000</MenuItem>
                    <MenuItem value="50000-100000">$50,000 - $100,000</MenuItem>
                    <MenuItem value="100000+">$100,000+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Has Collateral</InputLabel>
                  <Select
                    value={hasCollateral}
                    onChange={(e) => setHasCollateral(e.target.value)}
                    label="Has Collateral"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="">Any Method</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="financing">Financing</MenuItem>
                    <MenuItem value="lease">Lease</MenuItem>
                    <MenuItem value="credit">Credit</MenuItem>
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
            
            {search && (
              <Chip 
                label={`Search: ${search}`} 
                size="small"
                onDelete={() => onSearchChange('')}
                sx={{ borderRadius: 1.5 }}
              />
            )}
            
            {type && (
              <Chip 
                label={`Type: ${type === ContractType.LOAN ? 'Loan' : 'Leasing'}`} 
                size="small"
                onDelete={() => onTypeChange(undefined)}
                sx={{ borderRadius: 1.5 }}
                icon={getContractTypeIcon(type)}
              />
            )}
            
            {status && (
              <Chip 
                label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`} 
                size="small"
                onDelete={() => onStatusChange(undefined)}
                sx={{ 
                  borderRadius: 1.5,
                  '& .MuiChip-label': {
                    color: getStatusColor(status)
                  }
                }}
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
            
            {amountRange && (
              <Chip 
                label={`Amount: ${amountRange === '100000+' ? '$100,000+' : `$${amountRange.replace('-', ' - $')}`}`} 
                size="small"
                onDelete={() => setAmountRange('')}
                sx={{ borderRadius: 1.5 }}
                icon={<AttachMoney fontSize="small" />}
              />
            )}
            
            {hasCollateral && (
              <Chip 
                label={`Collateral: ${hasCollateral === 'true' ? 'Yes' : 'No'}`} 
                size="small"
                onDelete={() => setHasCollateral('')}
                sx={{ borderRadius: 1.5 }}
                icon={<Security fontSize="small" />}
              />
            )}
            
            {paymentMethod && (
              <Chip 
                label={`Payment: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`} 
                size="small"
                onDelete={() => setPaymentMethod('')}
                sx={{ borderRadius: 1.5 }}
              />
            )}
            
            <Button
              variant="text"
              size="small"
              startIcon={<Clear />}
              onClick={() => {
                onReset();
                setDateRange('');
                setAmountRange('');
                setHasCollateral('');
                setPaymentMethod('');
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

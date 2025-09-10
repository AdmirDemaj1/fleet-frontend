import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  ListItemText,
  ListItemAvatar,
  MenuItem,
  Skeleton,
  Fade,
  Tooltip,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import { 
  Person, 
  Business, 
  Search, 
  CheckCircle,
  Info,
  Refresh,
  Add,

} from '@mui/icons-material';

import { useGetCustomersQuery } from '../../../api/contractApi';
import { CustomerPickerProps, CustomerSummary } from '../../../types/contract.types';
import { customerApi } from '../../../../customers/api/customerApi';
import { CreateCustomerDto } from '../../../../customers/types/customer.types';
import { CustomerCreationModal } from '../../../../../shared/components';

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Enhanced CustomerSummary type for business and individual customers only
interface EnhancedCustomerSummary extends CustomerSummary {
  type: 'individual' | 'business';
  status?: 'active' | 'inactive' | 'pending';
  isVerified?: boolean;
  customerCode?: string;
  lastActivity?: string;
}

interface CustomerPickerState {
  searchTerm: string;
  selectedCustomer: EnhancedCustomerSummary | null;
  isOpen: boolean;
  hasInteracted: boolean;
  isCreateModalOpen: boolean;
  isCreatingCustomer: boolean;
}

export const CustomerPicker: React.FC<CustomerPickerProps> = ({
  selectedCustomerId,
  onCustomerSelect,
  preSelectedCustomerId,
  disabled = false,
  error,
  onCreateCustomer
}) => {
  const theme = useTheme();
  
  const [state, setState] = useState<CustomerPickerState>({
    searchTerm: '',
    selectedCustomer: null,
    isOpen: false,
    hasInteracted: false,
    isCreateModalOpen: false,
    isCreatingCustomer: false
  });

  // Debounced search term to improve performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Fetch customers with search and improved error handling
  const {
    data: customersResponse,
    isLoading,
    error: apiError,
    refetch
  } = useGetCustomersQuery({
    search: debouncedSearchTerm,
    limit: 50,
    offset: 0
  }, {
    skip: !debouncedSearchTerm && !preSelectedCustomerId && !selectedCustomerId
  });

  const customers = useMemo(() => 
    (customersResponse || [])
      .filter(customer => customer.type === 'individual' || customer.type === 'business') // Only business and individual customers
      .map(customer => ({
        ...customer,
        status: (customer as any).status || 'active',
        isVerified: (customer as any).isVerified ?? true,
        type: customer.type as 'individual' | 'business'
      })) as EnhancedCustomerSummary[],
    [customersResponse]
  );

  // Customer type helpers for business and individual customers
  const getCustomerIcon = useCallback((type: string) => {
    switch (type) {
      case 'individual': return <Person />;
      case 'business': return <Business />;
      default: return <Person />;
    }
  }, []);

  const getCustomerColor = useCallback((type: string) => {
    switch (type) {
      case 'individual': return theme.palette.primary.main;
      case 'business': return theme.palette.secondary.main;
      default: return theme.palette.grey[500];
    }
  }, [theme]);

  const getCustomerTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'individual': return 'Individual';
      case 'business': return 'Business';
      default: return 'Unknown';
    }
  }, []);

  // Handle pre-selected customer with improved logic
  useEffect(() => {
    if (preSelectedCustomerId && customers.length > 0) {
      const preSelected = customers.find(c => c.id === preSelectedCustomerId);
      if (preSelected && preSelected.id !== state.selectedCustomer?.id) {
        setState(prev => ({ ...prev, selectedCustomer: preSelected }));
        onCustomerSelect(preSelected);
      }
    }
  }, [preSelectedCustomerId, customers, onCustomerSelect, state.selectedCustomer?.id]);

  // Handle selected customer ID change with improved sync
  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer && customer.id !== state.selectedCustomer?.id) {
        setState(prev => ({ ...prev, selectedCustomer: customer }));
      }
    } else if (!selectedCustomerId && state.selectedCustomer) {
      setState(prev => ({ ...prev, selectedCustomer: null }));
    }
  }, [selectedCustomerId, customers, state.selectedCustomer?.id]);

  // Enhanced handlers with better state management
  const handleCustomerChange = useCallback((_event: any, newValue: EnhancedCustomerSummary | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedCustomer: newValue,
      hasInteracted: true 
    }));
    onCustomerSelect(newValue);
  }, [onCustomerSelect]);

  const handleInputChange = useCallback((_event: any, newInputValue: string) => {
    setState(prev => ({ 
      ...prev, 
      hasInteracted: true,
      searchTerm: newInputValue 
    }));
  }, []);

  const handleOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Customer creation modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, isCreateModalOpen: true }));
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, isCreateModalOpen: false }));
  }, []);

  const handleCreateCustomer = useCallback(async (customerData: CreateCustomerDto) => {
    try {
      setState(prev => ({ ...prev, isCreatingCustomer: true }));
      
      const newCustomer = await customerApi.create(customerData);
      
      // Transform the created customer to match our enhanced type
      const enhancedCustomer: EnhancedCustomerSummary = {
        id: newCustomer.id!,
        name: newCustomer.type === 'individual' 
          ? `${(newCustomer as any).firstName} ${(newCustomer as any).lastName}`.trim()
          : (newCustomer as any).legalName || (newCustomer as any).administratorName,
        type: newCustomer.type as 'individual' | 'business',
        email: newCustomer.email,
        phone: newCustomer.phone,
        status: 'active',
        isVerified: true
      };

      // Select the newly created customer
      setState(prev => ({ 
        ...prev, 
        selectedCustomer: enhancedCustomer,
        isCreateModalOpen: false,
        isCreatingCustomer: false
      }));
      
      // Notify parent component
      onCustomerSelect(enhancedCustomer);
      
      // Refresh the customer list
      refetch();
      
    } catch (error) {
      console.error('Failed to create customer:', error);
      setState(prev => ({ ...prev, isCreatingCustomer: false }));
    }
  }, [onCustomerSelect, refetch]);

  // Enhanced error handling
  if (apiError) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 1 }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={handleRefresh}
            aria-label="retry"
          >
            <Refresh />
          </IconButton>
        }
      >
        Failed to load customers. Please try again.
      </Alert>
    );
  }

  const isPreSelected = !!preSelectedCustomerId;

  return (
    <Box>
      {/* Header with Create Customer Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Select Customer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a business or individual customer for this contract
          </Typography>
        </Box>
        {onCreateCustomer && (
          <Tooltip title="Create a new customer">
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleOpenCreateModal}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Create Customer
            </Button>
          </Tooltip>
        )}
      </Box>

      <Autocomplete
        value={state.selectedCustomer}
        onChange={handleCustomerChange}
        onInputChange={handleInputChange}
        onOpen={handleOpen}
        onClose={handleClose}
        options={customers}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={isLoading}
        disabled={disabled}
        filterOptions={(x) => x} // API handles filtering
        clearOnBlur
        selectOnFocus
        handleHomeEndKeys
        freeSolo={false}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Customer"
            placeholder={state.hasInteracted ? "Search customers..." : "Start typing to search..."}
            error={!!error}
            helperText={
              error || 
              (isPreSelected ? 'Customer pre-selected from account page' : 
               state.hasInteracted ? 'Search and select a business or individual customer' : 
               'Type to search for business and individual customers')
            }
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const isSelected = option.id === state.selectedCustomer?.id;
          
          return (
            <MenuItem 
              {...props} 
              key={option.id}
              sx={{
                transition: 'all 0.2s ease',
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: getCustomerColor(option.type),
                    width: 36,
                    height: 36,
                    boxShadow: theme.shadows[2]
                  }}
                >
                  {getCustomerIcon(option.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.name}
                    </Typography>
                    <Chip
                      label={getCustomerTypeLabel(option.type)}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20,
                        borderColor: getCustomerColor(option.type),
                        color: getCustomerColor(option.type)
                      }}
                    />
                    {option.isVerified && (
                      <Tooltip title="Verified customer">
                        <CheckCircle 
                          sx={{ 
                            fontSize: 14, 
                            color: theme.palette.success.main 
                          }} 
                        />
                      </Tooltip>
                    )}
                    {option.status === 'inactive' && (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {option.customerCode && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: {option.customerCode}
                      </Typography>
                    )}
                    {option.email && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        📧 {option.email}
                      </Typography>
                    )}
                    {option.phone && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        📞 {option.phone}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </MenuItem>
          );
        }}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1, 
              maxHeight: 400, 
              overflow: 'auto',
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }} 
          />
        )}
        ListboxProps={{
          sx: {
            padding: 1,
            '& .MuiAutocomplete-option': {
              padding: 0
            }
          }
        }}
        noOptionsText={
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {state.searchTerm ? 'No business or individual customers found' : 'Start typing to search business and individual customers'}
            </Typography>
          </Box>
        }
        loadingText={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, justifyContent: 'center' }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading business and individual customers...</Typography>
          </Box>
        }
      />

      {state.selectedCustomer && (
        <Fade in timeout={300}>
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2.5,
              border: '2px solid',
              borderColor: alpha(getCustomerColor(state.selectedCustomer.type), 0.3),
              borderRadius: 2,
              bgcolor: alpha(getCustomerColor(state.selectedCustomer.type), 0.02),
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getCustomerColor(state.selectedCustomer.type),
                  width: 56,
                  height: 56,
                  boxShadow: theme.shadows[3]
                }}
              >
                {getCustomerIcon(state.selectedCustomer.type)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {state.selectedCustomer.name}
                  </Typography>
                  <Chip
                    label={getCustomerTypeLabel(state.selectedCustomer.type)}
                    size="small"
                    sx={{ 
                      bgcolor: getCustomerColor(state.selectedCustomer.type),
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                  {state.selectedCustomer.isVerified && (
                    <Tooltip title="Verified customer">
                      <CheckCircle 
                        sx={{ 
                          fontSize: 18, 
                          color: theme.palette.success.main 
                        }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                
                {state.selectedCustomer.customerCode && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Customer ID: {state.selectedCustomer.customerCode}
                  </Typography>
                )}
                
                {state.selectedCustomer.email && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    📧 {state.selectedCustomer.email}
                  </Typography>
                )}
                
                {state.selectedCustomer.phone && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    📞 {state.selectedCustomer.phone}
                  </Typography>
                )}

                {state.selectedCustomer.status && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`Status: ${state.selectedCustomer.status}`}
                      size="small"
                      color={state.selectedCustomer.status === 'active' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>
              
              {!isPreSelected && (
                <Tooltip title="Customer information">
                  <IconButton size="small" sx={{ alignSelf: 'flex-start' }}>
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Paper>
        </Fade>
      )}

      {isLoading && !state.selectedCustomer && (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Box>
      )}

      {/* Create Customer Modal */}
      <CustomerCreationModal
        open={state.isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateCustomer}
        isCreating={state.isCreatingCustomer}
      />
    </Box>
  );
};

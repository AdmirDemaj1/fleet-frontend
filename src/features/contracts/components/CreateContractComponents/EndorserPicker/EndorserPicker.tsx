/**
 * EndorserPicker Component
 * 
 * NOTE: Currently using default values for guaranteedAmount ($100,000) 
 * since the backend doesn't yet include this field in the endorser response.
 * 
 * TODO: Update when backend implements guaranteedAmount field in endorser API
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Card,
  CardContent,
  IconButton,
  Button,
  Avatar,
  MenuItem,
  Fade,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  Grid,
  Divider
} from '@mui/material';
import {
  Person,
  Search,
  Clear,
  CheckCircle,
  PersonAdd,
  Refresh,
  AttachMoney
} from '@mui/icons-material';
import { useGetEndorsersQuery } from '../../../api/contractApi';
import { EndorserPickerProps, EndorserSummary } from '../../../types/contract.types';
import { CustomerCreationModal } from '../../../../../shared/components';
import { CreateCustomerDto, CreateEndorserDto, CustomerType } from '../../../../customers/types/customer.types';
import { endorserApi } from '../../../../customers/api/endorserApi';

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

// Enhanced EndorserSummary for available endorsers only
interface EnhancedEndorserSummary extends EndorserSummary {
  isVerified?: boolean;
  status?: string;
  guaranteedAmount?: number;
  // Maximum amount this endorser can guarantee
}

interface EndorserPickerState {
  searchTerm: string;
  selectedEndorser: EnhancedEndorserSummary | null;
  isOpen: boolean;
  hasInteracted: boolean;
  isCreateModalOpen: boolean;
  isCreatingEndorser: boolean;
}

export const EndorserPicker: React.FC<EndorserPickerProps> = ({
  selectedEndorserIds,
  onEndorserSelect,
  guaranteeForContract = 0,
  onGuaranteeForContractChange,
  totalContractAmount = 0,
  error
}) => {
  const theme = useTheme();
  
  const [state, setState] = useState<EndorserPickerState>({
    searchTerm: '',
    selectedEndorser: null,
    isOpen: false,
    hasInteracted: false,
    isCreateModalOpen: false,
    isCreatingEndorser: false
  });

  // Debounced search term to improve performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Fetch ALL endorsers from /endorsers endpoint
  const {
    data: endorsersResponse = [],
    isLoading,
    error: apiError,
    refetch
  } = useGetEndorsersQuery({
    search: debouncedSearchTerm,
    limit: 50
  });

  console.log('📋 Endorsers Response:', endorsersResponse);

  // Process endorsers - all available ones
  const allEndorsers = useMemo(() => 
    endorsersResponse.map(endorser => {
      // Generate a default guarantee amount based on endorser (can be customized later)
      const defaultGuaranteeAmount = 100000; // $100,000 default capacity per endorser
      
      return {
        ...endorser,
        isVerified: (endorser as any).isVerified ?? true,
        status: (endorser as any).status || 'active',
        // Backend doesn't currently send guaranteedAmount, using default until implemented
        guaranteedAmount: (endorser as any).guaranteedAmount,
        remainingGuaranteeCapacity: (endorser as any).remainingGuaranteeCapacity
      };
    }) as EnhancedEndorserSummary[],
    [endorsersResponse]
  );

  // Get available endorsers (excluding selected one)
  const availableEndorsers = useMemo(() => 
    state.selectedEndorser 
      ? allEndorsers.filter(e => e.id !== state.selectedEndorser!.id)
      : allEndorsers,
    [allEndorsers, state.selectedEndorser]
  );

  // Update selected endorser when IDs change (single selection)
  useEffect(() => {
    const endorserId = selectedEndorserIds[0]; // Only first endorser since we allow only one
    if (endorserId && allEndorsers.length > 0) {
      const selected = allEndorsers.find(e => e.id === endorserId);
      if (selected && selected.id !== state.selectedEndorser?.id) {
        setState(prev => ({ ...prev, selectedEndorser: selected }));
      }
    } else if (!endorserId && state.selectedEndorser) {
      setState(prev => ({ ...prev, selectedEndorser: null }));
    }
  }, [selectedEndorserIds, allEndorsers, state.selectedEndorser?.id]);

  // Handle endorser selection - single selection
  const handleEndorserSelect = useCallback((endorser: EnhancedEndorserSummary | null) => {

    console.log('📋 Endorser:', endorser);
    setState(prev => ({
      ...prev,
      selectedEndorser: endorser,
      hasInteracted: true
    }));
    
    if (endorser) {
      onEndorserSelect([endorser.id]); // Single endorser array
    } else {
      onEndorserSelect([]); // Empty array
    }
  }, [onEndorserSelect]);

  // Handle input change
  const handleInputChange = useCallback((_event: any, newInputValue: string) => {
    setState(prev => ({
      ...prev,
      hasInteracted: true,
      searchTerm: newInputValue
    }));
  }, []);

  // Handle open/close
  const handleOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Get endorser display name
  const getEndorserDisplayName = useCallback((endorser: EnhancedEndorserSummary) => {
    return `${endorser.firstName} ${endorser.lastName}`;
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle guarantee amount change
  const handleGuaranteeAmountChange = useCallback((amount: number) => {
    if (onGuaranteeForContractChange) {
      onGuaranteeForContractChange(amount);
    }
  }, [onGuaranteeForContractChange]);

  // Endorser creation modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, isCreateModalOpen: true }));
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, isCreateModalOpen: false }));
  }, []);

  const handleCreateEndorser = useCallback(async (customerData: CreateCustomerDto) => {
    try {
      console.log('📋 Received customer data for endorser creation:', JSON.stringify(customerData, null, 2));
      setState(prev => ({ ...prev, isCreatingEndorser: true }));
      
      // Transform customer data to endorser data
      let endorserData: CreateEndorserDto;
      
      // Handle direct endorser details (if the form was configured for endorsers)
      if (customerData.endorserDetails) {
        endorserData = customerData.endorserDetails;
      }
      // Handle individual customer data (transform to endorser)
      else if (customerData.individualDetails) {
        const individual = customerData.individualDetails;
        endorserData = {
          type: CustomerType.ENDORSER,
          firstName: individual.firstName,
          lastName: individual.lastName,
          idNumber: individual.idNumber,
          dateOfBirth: individual.dateOfBirth,
          address: individual.address,
          phone: individual.phone,
          email: individual.email,
          secondaryPhone: individual.secondaryPhone,
          secondaryEmail: individual.secondaryEmail,
          additionalNotes: individual.additionalNotes,
          relationshipToCustomer: 'Endorser',
          active: true
        };
      }
      // Handle business customer data (transform to endorser)
      else if (customerData.businessDetails) {
        const business = customerData.businessDetails;
        endorserData = {
          type: CustomerType.ENDORSER,
          firstName: business.legalName,
          lastName: '',
          idNumber: business.nuisNipt,
          dateOfBirth: '', // Business entities don't have birth dates
          address: business.address,
          phone: business.phone,
          email: business.email,
          secondaryPhone: business.secondaryPhone,
          secondaryEmail: business.secondaryEmail,
          additionalNotes: business.additionalNotes,
          relationshipToCustomer: 'Business Endorser',
          active: true
        };
      }
      else {
        throw new Error('No valid customer data provided. Please ensure individual, business, or endorser details are included.');
      }
      
      const newEndorser = await endorserApi.createEndorser(endorserData);
      
      // Transform the created endorser to match our enhanced endorser type
      const enhancedEndorser: EnhancedEndorserSummary = {
        id: newEndorser.id || '',
        firstName: newEndorser.firstName || '',
        lastName: newEndorser.lastName || '',
        idNumber: newEndorser.idNumber || '',
        email: newEndorser.email || '',
        phone: newEndorser.phone || '',
        relationshipToCustomer: newEndorser.relationshipToCustomer || 'Endorser',
        guaranteedAmount: newEndorser.guaranteedAmount || 100000, // Default capacity for new endorsers
        remainingGuaranteeCapacity: newEndorser.remainingGuaranteeCapacity || 100000, // Default capacity for new endorsers
        isVerified: true,
        status: 'active'
      };

      // Select the newly created endorser
      setState(prev => ({ 
        ...prev, 
        selectedEndorser: enhancedEndorser,
        isCreateModalOpen: false,
        isCreatingEndorser: false
      }));
      
      // Notify parent component
      onEndorserSelect([enhancedEndorser.id]);
      
      // Refresh the endorser list
      refetch();
      
    } catch (error) {
      console.error('Failed to create endorser:', error);
      setState(prev => ({ ...prev, isCreatingEndorser: false }));
    }
  }, [onEndorserSelect, refetch]);

  // Error handling
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
            aria-label="retry loading endorsers"
          >
            <Refresh />
          </IconButton>
        }
      >
        Failed to load endorsers. Please try again.
      </Alert>
    );
  }

  console.log('📋 State:', state.selectedEndorser);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 2,
        bgcolor: alpha(theme.palette.secondary.main, 0.02),
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
      }}>
        <Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'secondary.main' }}>
            Select Endorser
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose one endorser to guarantee this contract
          </Typography>
        </Box>
        <Tooltip title="Create a new endorser">
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={handleOpenCreateModal}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Create Endorser
          </Button>
        </Tooltip>
      </Box>

      {/* Endorser Selection Autocomplete */}
      <Autocomplete
        options={availableEndorsers}
        getOptionLabel={getEndorserDisplayName}
        value={state.selectedEndorser}
        onChange={(_event, value) => {
          handleEndorserSelect(value);
        }}
        onInputChange={handleInputChange}
        onOpen={handleOpen}
        onClose={handleClose}
        open={state.isOpen}
        loading={isLoading}
        filterOptions={(x) => x} // API handles filtering
        blurOnSelect={true} // Close dropdown after selection
        clearOnBlur={false} // Don't clear on blur
        selectOnFocus={false} // Don't select on focus
        handleHomeEndKeys
        openOnFocus={true} // Open dropdown when focused
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Endorser"
            placeholder="Search endorsers..."
            error={!!error}
            helperText={
              error || 
              `${availableEndorsers.length} endorsers found${state.selectedEndorser ? ' (1 selected)' : ''}`
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
                  boxShadow: `0 0 0 1px ${alpha(theme.palette.secondary.main, 0.2)}`,
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.2)}`,
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          const isSelected = option.id === state.selectedEndorser?.id;
          
          return (
            <MenuItem
              {...otherProps}
              key={option.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isSelected ? alpha(theme.palette.secondary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  width: 40,
                  height: 40
                }}
              >
                <Person />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {option.firstName} {option.lastName}
                  </Typography>
                  {option.relationshipToCustomer && (
                    <Chip
                      label={option.relationshipToCustomer}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                  {option.isVerified && (
                    <Tooltip title="Verified endorser">
                      <CheckCircle 
                        sx={{ 
                          fontSize: 16, 
                          color: theme.palette.success.main 
                        }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  🆔 {option.idNumber}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {option.email && (
                    <Typography variant="caption" color="text.secondary">
                      📧 {option.email}
                    </Typography>
                  )}
                  {option.phone && (
                    <Typography variant="caption" color="text.secondary">
                      📞 {option.phone}
                    </Typography>
                  )}
                    {option.guaranteedAmount && (
                      <Chip
                        label={`Max: $${option.guaranteedAmount.toLocaleString()} (default)`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    )}
                </Box>
              </Box>
            </MenuItem>
          );
        }}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1, 
              maxHeight: 300, 
              overflow: 'auto',
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }} 
          />
        )}
        noOptionsText={
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {state.searchTerm ? 'No endorsers found' : (state.selectedEndorser ? 'Selected endorser is not shown in list' : 'Start typing to search endorsers')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {state.selectedEndorser ? 'Clear selection to see all endorsers' : 'All available endorsers are shown'}
            </Typography>
          </Box>
        }
        loadingText={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, justifyContent: 'center' }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading endorsers...</Typography>
          </Box>
        }
      />

      {/* Selected Endorser Display */}
      {state.selectedEndorser && (
        <Fade in timeout={300}>
          <Card
            elevation={0}
            sx={{
              mt: 3,
              border: '2px solid',
              borderColor: 'secondary.main',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.02),
              transition: 'all 0.3s ease'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 50,
                    height: 50
                  }}
                >
                  <Person />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {state.selectedEndorser.firstName} {state.selectedEndorser.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label="Selected"
                      size="small"
                      color="secondary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {state.selectedEndorser.relationshipToCustomer && (
                      <Chip
                        label={state.selectedEndorser.relationshipToCustomer}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
                <Tooltip title="Remove selection">
                  <IconButton
                    color="error"
                    onClick={() => handleEndorserSelect(null)}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Clear />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  🆔 ID Number: <strong>{state.selectedEndorser.idNumber}</strong>
                </Typography>
                {state.selectedEndorser.email && (
                  <Typography variant="body2" color="text.secondary">
                    📧 Email: <strong>{state.selectedEndorser.email}</strong>
                  </Typography>
                )}
                {state.selectedEndorser.phone && (
                  <Typography variant="body2" color="text.secondary">
                    📞 Phone: <strong>{state.selectedEndorser.phone}</strong>
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                {/* Guarantee Amount Input */}
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'primary.main' 
                  }}
                >
                  <AttachMoney />
                  Guarantee Amount
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Guarantee Amount"
                      type="number"
                      value={guaranteeForContract || ''}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        handleGuaranteeAmountChange(amount);
                      }}
                      error={guaranteeForContract > (state.selectedEndorser.remainingGuaranteeCapacity || 0)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        inputProps: {
                          max: state.selectedEndorser.remainingGuaranteeCapacity || 100000,
                          min: 0
                        }
                      }}
                      helperText={
                        guaranteeForContract > (state.selectedEndorser.remainingGuaranteeCapacity || 0)
                          ? `Exceeds max capacity of $${(state.selectedEndorser.remainingGuaranteeCapacity || 0).toLocaleString()}`
                          : "Amount this endorser will guarantee"
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Max Guarantee Capacity"
                      type="number"
                      value={state.selectedEndorser.remainingGuaranteeCapacity}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      helperText="Max capacity (default value - pending backend implementation)"
                      sx={{
                        '& .MuiInputBase-input': {
                          color: 'primary.main',
                          fontWeight: 600,
                        },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Contract Total"
                      type="number"
                      value={totalContractAmount}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      helperText="Total contract amount"
                      sx={{
                        '& .MuiInputBase-input': {
                          color: 'text.secondary',
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                {/* Guarantee Percentage Display */}
                {guaranteeForContract > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: guaranteeForContract > (state.selectedEndorser.remainingGuaranteeCapacity || 0)
                        ? alpha(theme.palette.error.main, 0.05)
                        : alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${
                        guaranteeForContract > (state.selectedEndorser.remainingGuaranteeCapacity || 0)
                          ? alpha(theme.palette.error.main, 0.2)
                          : alpha(theme.palette.info.main, 0.2)
                      }`,
                      borderRadius: 1
                    }}
                  >
                    {totalContractAmount > 0 && (
                      <Typography 
                        variant="body2" 
                        color="info.main" 
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        📊 Contract Coverage: {((guaranteeForContract / totalContractAmount) * 100).toFixed(1)}% of ${totalContractAmount.toLocaleString()}
                      </Typography>
                    )}
                    
                    <Typography 
                      variant="body2" 
                      color={
                        guaranteeForContract > (state.selectedEndorser.remainingGuaranteeCapacity || 0)
                          ? "error.main"
                          : "success.main"
                      } 
                      sx={{ fontWeight: 600 }}
                    >
                      💰 Capacity Utilization: {
                        state.selectedEndorser.remainingGuaranteeCapacity 
                          ? ((guaranteeForContract / state.selectedEndorser.remainingGuaranteeCapacity) * 100).toFixed(1)
                          : 0
                      }% of ${(state.selectedEndorser.guaranteedAmount || 0).toLocaleString()} max capacity
                    </Typography>
                    
                    {guaranteeForContract > (state.selectedEndorser.remainingGuaranteeCapacity || 0) && (
                      <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1 }}>
                        ⚠️ Error: Guarantee amount exceeds endorser's maximum capacity!
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Empty state */}
      {!state.selectedEndorser && !isLoading && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: alpha(theme.palette.secondary.main, 0.3),
            borderRadius: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.02)
          }}
        >
          <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No endorser selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search and select an endorser to guarantee this contract
          </Typography>
        </Paper>
      )}

      {/* Endorser Creation Modal */}
      <CustomerCreationModal
        open={state.isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateEndorser}
        isCreating={state.isCreatingEndorser}
        title="Create New Endorser"
      />
    </Box>
  );
};

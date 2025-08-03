import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { Person, Business, Search } from '@mui/icons-material';
import { useGetCustomersQuery } from '../../api/contractApi';
import { CustomerPickerProps, CustomerSummary } from '../../types/contract.types';

export const CustomerPicker: React.FC<CustomerPickerProps> = ({
  selectedCustomerId,
  onCustomerSelect,
  preSelectedCustomerId,
  disabled = false,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Fetch customers with search
  const {
    data: customers = [],
    isLoading,
    error: apiError
  } = useGetCustomersQuery({
    search: searchTerm,
    limit: 50,
    offset: 0
  });

  // Handle pre-selected customer
  useEffect(() => {
    if (preSelectedCustomerId && customers.length > 0) {
      const preSelected = customers.find(c => c.id === preSelectedCustomerId);
      if (preSelected) {
        setSelectedCustomer(preSelected);
        onCustomerSelect(preSelected);
      }
    }
  }, [preSelectedCustomerId, customers, onCustomerSelect]);

  // Handle selected customer ID change
  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    } else if (!selectedCustomerId) {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  const handleCustomerChange = (_event: any, newValue: CustomerSummary | null) => {
    setSelectedCustomer(newValue);
    onCustomerSelect(newValue);
  };

  const handleInputChange = (_event: any, newInputValue: string) => {
    setSearchTerm(newInputValue);
  };

  if (apiError) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Failed to load customers. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Autocomplete
        value={selectedCustomer}
        onChange={handleCustomerChange}
        onInputChange={handleInputChange}
        options={customers}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={isLoading}
        disabled={disabled || !!preSelectedCustomerId}
        filterOptions={(x) => x} // Let the API handle filtering
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Customer"
            placeholder="Search customers..."
            error={!!error}
            helperText={error || (preSelectedCustomerId ? 'Customer pre-selected from account page' : 'Search and select a customer')}
            InputProps={{
              ...params.InputProps,
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <MenuItem {...props} key={option.id}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: option.type === 'individual' ? 'primary.main' : 'secondary.main',
                  width: 36,
                  height: 36
                }}
              >
                {option.type === 'individual' ? <Person /> : <Business />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {option.name}
                  </Typography>
                  <Chip
                    label={option.type}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  {option.email && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {option.email}
                    </Typography>
                  )}
                  {option.phone && (
                    <Typography variant="caption" color="text.secondary">
                      {option.phone}
                    </Typography>
                  )}
                </Box>
              }
            />
          </MenuItem>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option.name}
              avatar={
                <Avatar sx={{ bgcolor: option.type === 'individual' ? 'primary.main' : 'secondary.main' }}>
                  {option.type === 'individual' ? <Person /> : <Business />}
                </Avatar>
              }
              {...getTagProps({ index })}
            />
          ))
        }
        PaperComponent={(props) => (
          <Paper {...props} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }} />
        )}
        noOptionsText={
          searchTerm ? 'No customers found' : 'Start typing to search customers'
        }
        loadingText="Loading customers..."
      />

      {selectedCustomer && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.default'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: selectedCustomer.type === 'individual' ? 'primary.main' : 'secondary.main',
                width: 48,
                height: 48
              }}
            >
              {selectedCustomer.type === 'individual' ? <Person /> : <Business />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedCustomer.name}
                </Typography>
                <Chip
                  label={selectedCustomer.type}
                  size="small"
                  color={selectedCustomer.type === 'individual' ? 'primary' : 'secondary'}
                  variant="outlined"
                />
              </Box>
              {selectedCustomer.email && (
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer.email}
                </Typography>
              )}
              {selectedCustomer.phone && (
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer.phone}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

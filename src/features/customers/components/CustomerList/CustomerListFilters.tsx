import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { CustomerType } from '../../types/customer.types';

interface CustomerListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: CustomerType | '';
  onTypeChange: (value: CustomerType | '') => void;
  onClearFilters: () => void;
}

export const CustomerListFilters: React.FC<CustomerListFiltersProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || typeFilter;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
      <TextField
        placeholder="Search by name, email, phone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        }}
        sx={{ flexGrow: 1, maxWidth: 400 }}
      />
      
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Customer Type</InputLabel>
        <Select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value as CustomerType | '')}
          label="Customer Type"
          startAdornment={
            <InputAdornment position="start">
              <FilterList />
            </InputAdornment>
          }
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value={CustomerType.INDIVIDUAL}>Individual</MenuItem>
          <MenuItem value={CustomerType.BUSINESS}>Business</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );
};
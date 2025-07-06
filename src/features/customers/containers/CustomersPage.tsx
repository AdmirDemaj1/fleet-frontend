import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { CustomerList } from '../components/CustomerList';
import { CustomerListFilters } from '../components/CustomerList/CustomerListFilters';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { setFilters } from '../slices/customerSlice';
import { CustomerType } from '../types/customer.types';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers, loading, totalCount } = useCustomers();
  const { deleteCustomer } = useDeleteCustomer();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerType | ''>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    dispatch(setFilters({
      search: debouncedSearchTerm,
      type: typeFilter || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage
    }));
  }, [debouncedSearchTerm, typeFilter, page, rowsPerPage, dispatch]);

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/customers/new')}
        >
          Add Customer
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            onChange={(e) => setTypeFilter(e.target.value as CustomerType | '')}
            label="Customer Type"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value={CustomerType.INDIVIDUAL}>Individual</MenuItem>
            <MenuItem value={CustomerType.BUSINESS}>Business</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CustomerList
        customers={customers}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};
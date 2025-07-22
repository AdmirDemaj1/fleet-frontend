import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography
} from '@mui/material';
import { Add } from '@mui/icons-material';
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
  const [hasVehicles, setHasVehicles] = useState<boolean | undefined>(undefined);
  const [hasContracts, setHasContracts] = useState<boolean | undefined>(undefined);
  const [hasCollaterals, setHasCollaterals] = useState<boolean | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    dispatch(setFilters({
      search: debouncedSearchTerm,
      type: typeFilter || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      hasVehicles,
      hasContracts,
      hasCollaterals
    }));
  }, [debouncedSearchTerm, typeFilter, page, rowsPerPage, hasVehicles, hasContracts, hasCollaterals, dispatch]);

  // Reset to first page when filters change (except page and rowsPerPage)
  React.useEffect(() => {
    if (page > 0) {
      setPage(0);
    }
  }, [debouncedSearchTerm, typeFilter, hasVehicles, hasContracts, hasCollaterals]);

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      
      // If we deleted the last item on the current page and we're not on the first page,
      // go back to the previous page
      if (customers.length === 1 && page > 0) {
        setPage(page - 1);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setHasVehicles(undefined);
    setHasContracts(undefined);
    setHasCollaterals(undefined);
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

      <CustomerListFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        hasVehicles={hasVehicles}
        onHasVehiclesChange={setHasVehicles}
        hasContracts={hasContracts}
        onHasContractsChange={setHasContracts}
        hasCollaterals={hasCollaterals}
        onHasCollateralsChange={setHasCollaterals}
        onClearFilters={handleClearFilters}
      />

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
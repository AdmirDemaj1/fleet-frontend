import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Divider
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
import { useGetCustomersQuery } from '../api/customerRtkApi';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers, loading, totalCount } = useCustomers();
  const { deleteCustomer } = useDeleteCustomer();
  
  const CLIENT_FILTER_LIMIT = 5000;

  type AdminRoleFilter = 'any' | 'isAdmin' | 'notAdmin';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [segmentFilter, setSegmentFilter] = useState<string>('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<AdminRoleFilter>('any');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerType | ''>('');
  const [hasVehicles, setHasVehicles] = useState<boolean | undefined>(undefined);
  const [hasContracts, setHasContracts] = useState<boolean | undefined>(undefined);
  const [hasCollaterals, setHasCollaterals] = useState<boolean | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const needsAdminRoleFiltering = adminRoleFilter !== 'any';

  const { data: businessesData, isLoading: businessesLoading } = useGetCustomersQuery(
    { type: CustomerType.BUSINESS, limit: CLIENT_FILTER_LIMIT, offset: 0 },
    { skip: !needsAdminRoleFiltering }
  );

  const administratorIdSet = React.useMemo(() => {
    const ids = new Set<string>();
    const businesses = businessesData?.customers || [];
    for (const c of businesses as any[]) {
      // We only care about business customers for admin IDs
      if (c?.type !== CustomerType.BUSINESS) continue;
      const adminIds: string[] = c?.administratorIds || [];
      for (const id of adminIds) {
        if (id) ids.add(id);
      }
      const admins: Array<{ id: string }> = c?.administrators || [];
      for (const a of admins) {
        if (a?.id) ids.add(a.id);
      }
    }
    return ids;
  }, [businessesData]);

  const displayed = React.useMemo(() => {
    if (!needsAdminRoleFiltering) {
      return {
        customers,
        totalCount,
      };
    }

    const candidates = (customers || []).filter(
      (c) => c?.type === CustomerType.INDIVIDUAL || c?.type === CustomerType.ADMINISTRATOR
    );

    const isAdminCustomer = (c: any) => {
      if (!c?.id) return false;
      if (c?.type === CustomerType.ADMINISTRATOR) return true; // legacy support
      return administratorIdSet.has(c.id);
    };

    const filtered =
      adminRoleFilter === 'isAdmin'
        ? candidates.filter(isAdminCustomer)
        : candidates.filter((c) => c?.type === CustomerType.INDIVIDUAL && !isAdminCustomer(c));

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return {
      customers: filtered.slice(start, end),
      totalCount: filtered.length,
    };
  }, [
    adminRoleFilter,
    administratorIdSet,
    customers,
    needsAdminRoleFiltering,
    page,
    rowsPerPage,
    totalCount,
  ]);

  const effectiveLoading = loading || (needsAdminRoleFiltering && businessesLoading);

  const applySegmentPreset = (segment: string) => {
    setSegmentFilter(segment);
    setPage(0);

    switch (segment) {
      case '':
        setAdminRoleFilter('any');
        setTypeFilter('');
        setHasContracts(undefined);
        return;
      case 'individual':
        setAdminRoleFilter('any');
        setTypeFilter(CustomerType.INDIVIDUAL);
        setHasContracts(undefined);
        return;
      case 'business':
        setAdminRoleFilter('any');
        setTypeFilter(CustomerType.BUSINESS);
        setHasContracts(undefined);
        return;
      case 'asAdmin':
        setAdminRoleFilter('isAdmin');
        setTypeFilter(CustomerType.INDIVIDUAL);
        setHasContracts(undefined);
        return;
      case 'asAdminWithContract':
        setAdminRoleFilter('isAdmin');
        setTypeFilter(CustomerType.INDIVIDUAL);
        setHasContracts(true);
        return;
      case 'individualNoContractNotAdmin':
        setAdminRoleFilter('notAdmin');
        setTypeFilter(CustomerType.INDIVIDUAL);
        setHasContracts(false);
        return;
      case 'individualWithContractNotAdmin':
        setAdminRoleFilter('notAdmin');
        setTypeFilter(CustomerType.INDIVIDUAL);
        setHasContracts(true);
        return;
      case 'businessWithContract':
        setAdminRoleFilter('any');
        setTypeFilter(CustomerType.BUSINESS);
        setHasContracts(true);
        return;
      case 'businessNoContract':
        setAdminRoleFilter('any');
        setTypeFilter(CustomerType.BUSINESS);
        setHasContracts(false);
        return;
      default:
        // Unknown preset: treat as custom
        setAdminRoleFilter('any');
        return;
    }
  };

  // Simple approach: single effect with debounced dispatch
  React.useEffect(() => {
    const apiLimit = needsAdminRoleFiltering ? CLIENT_FILTER_LIMIT : rowsPerPage;
    const apiOffset = needsAdminRoleFiltering ? 0 : page * rowsPerPage;

    const timeoutId = setTimeout(() => {
      dispatch(setFilters({
        search: debouncedSearchTerm,
        type: typeFilter || undefined,
        limit: apiLimit,
        offset: apiOffset,
        hasVehicles,
        hasContracts,
        hasCollaterals
      }));
    }, 50); // Small delay to batch updates

    return () => clearTimeout(timeoutId);
  }, [
    CLIENT_FILTER_LIMIT,
    debouncedSearchTerm,
    dispatch,
    hasCollaterals,
    hasContracts,
    hasVehicles,
    needsAdminRoleFiltering,
    page,
    rowsPerPage,
    typeFilter,
  ]);

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      // Find the customer to get its type
      const customer = customers.find(c => c.id === customerToDelete);
      await deleteCustomer(customerToDelete, customer?.type);
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
    setSegmentFilter('');
    setAdminRoleFilter('any');
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
        segmentFilter={segmentFilter}
        onSegmentChange={applySegmentPreset}
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPage(0);
        }}
        typeFilter={typeFilter}
        onTypeChange={(v) => {
          setTypeFilter(v);
          setPage(0);
        }}
        hasVehicles={hasVehicles}
        onHasVehiclesChange={(v) => {
          setHasVehicles(v);
          setPage(0);
        }}
        hasContracts={hasContracts}
        onHasContractsChange={(v) => {
          setHasContracts(v);
          setPage(0);
        }}
        hasCollaterals={hasCollaterals}
        onHasCollateralsChange={(v) => {
          setHasCollaterals(v);
          setPage(0);
        }}
        onClearFilters={handleClearFilters}
      />

      <CustomerList
        customers={displayed.customers}
        loading={effectiveLoading}
        totalCount={displayed.totalCount}
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
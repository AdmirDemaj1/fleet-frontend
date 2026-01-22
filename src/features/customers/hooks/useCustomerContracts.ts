import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCustomerContractsQuery } from '../api/customerRtkApi';
import { ContractSummary, PaginationMeta } from '../types/customer.types';
import {
  Order,
  OrderBy,
  NotificationState,
  DialogStates,
  MenuState
} from '../types/customerContracts.types';
import { sortContracts } from '../utils/contractUtils';
import { DEFAULT_ROWS_PER_PAGE } from '../constants/contractConstants';

// Hook for managing contracts data with server-side pagination - now using RTK Query
export const useContracts = (customerId?: string) => {
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const effectiveCustomerId = customerId || urlCustomerId;

  // Local state for pagination parameters
  const [queryParams, setQueryParams] = useState({
    limit: DEFAULT_ROWS_PER_PAGE,
    offset: 0,
    status: undefined as string | undefined,
    type: undefined as string | undefined,
  });

  // Use RTK Query for data fetching with automatic caching
  const { data, isLoading, error } = useGetCustomerContractsQuery(
    {
      customerId: effectiveCustomerId!,
      ...queryParams,
    },
    { skip: !effectiveCustomerId }
  );

  const contracts = data?.data || [];
  const meta: PaginationMeta = {
    total: data?.meta?.total || 0,
    page: data?.meta?.page || 1,
    limit: data?.meta?.limit || DEFAULT_ROWS_PER_PAGE,
    offset: queryParams.offset,
    totalPages: Math.ceil((data?.meta?.total || 0) / (data?.meta?.limit || DEFAULT_ROWS_PER_PAGE)),
    hasNextPage: (queryParams.offset + queryParams.limit) < (data?.meta?.total || 0),
    hasPreviousPage: queryParams.offset > 0,
  };

  // Fetch contracts function for pagination changes
  const fetchContracts = useCallback(async (
    offset = 0,
    limit = DEFAULT_ROWS_PER_PAGE,
    filters?: {
      search?: string;
      status?: string;
      type?: string;
    }
  ) => {
    setQueryParams({
      limit,
      offset,
      status: filters?.status,
      type: filters?.type,
    });
  }, []);

  return {
    contracts,
    meta,
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Failed to load contracts' : null,
    fetchContracts,
    customerId: effectiveCustomerId
  };
};

// Hook for managing table state with server-side offset-based pagination
export const useContractsTable = (
  contracts: ContractSummary[], 
  meta: PaginationMeta,
  fetchContracts: (offset?: number, limit?: number, filters?: any) => Promise<void>,
  filters?: any
) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('startDate');

  // For server-side pagination, we use the contracts directly as they're already paginated
  const filteredContracts = useMemo(() => {
    // Server-side filtering would be implemented in the API call
    // For now, return contracts as-is since they're pre-filtered by the server
    return contracts || [];
  }, [contracts]);

  // Sort contracts (this could also be moved to server-side in the future)
  const sortedContracts = useMemo(() => {
    return sortContracts(filteredContracts, orderBy, order);
  }, [filteredContracts, order, orderBy]);

  // No client-side pagination needed since it's done on the server
  const paginatedContracts = sortedContracts;

  const handleRequestSort = useCallback((property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handlePageChange = useCallback((newPage: number) => {
    // Calculate offset based on page number and limit
    const newOffset = newPage * (meta?.limit || DEFAULT_ROWS_PER_PAGE);
    fetchContracts(newOffset, meta?.limit || DEFAULT_ROWS_PER_PAGE, filters);
  }, [fetchContracts, meta?.limit, filters]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    // When changing rows per page, reset to first page (offset 0)
    fetchContracts(0, newRowsPerPage, filters);
  }, [fetchContracts, filters]);

  return {
    page: Math.floor((meta?.offset || 0) / (meta?.limit || DEFAULT_ROWS_PER_PAGE)), // Calculate current page from offset
    rowsPerPage: meta?.limit || DEFAULT_ROWS_PER_PAGE,
    order,
    orderBy,
    filteredContracts,
    sortedContracts,
    paginatedContracts,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange,
    totalCount: meta?.total || 0
  };
};

// Hook for managing dialog states
export const useDialogStates = () => {
  const [dialogStates, setDialogStates] = useState<DialogStates>({
    showNewContractDialog: false,
    deleteDialogOpen: false,
    contractToDelete: null
  });

  const openNewContractDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, showNewContractDialog: true }));
  }, []);

  const closeNewContractDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, showNewContractDialog: false }));
  }, []);

  const openDeleteDialog = useCallback((contractId: string) => {
    setDialogStates(prev => ({ 
      ...prev, 
      deleteDialogOpen: true, 
      contractToDelete: contractId 
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogStates(prev => ({ 
      ...prev, 
      deleteDialogOpen: false, 
      contractToDelete: null 
    }));
  }, []);

  return {
    ...dialogStates,
    openNewContractDialog,
    closeNewContractDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
};

// Hook for managing menu state
export const useMenuState = () => {
  const [menuState, setMenuState] = useState<MenuState>({
    anchorEl: null,
    selectedContract: null
  });

  const openMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>, contract: ContractSummary) => {
    setMenuState({
      anchorEl: event.currentTarget,
      selectedContract: contract
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState({
      anchorEl: null,
      selectedContract: null
    });
  }, []);

  return {
    ...menuState,
    openMenu,
    closeMenu
  };
};

// Hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message: string, severity: NotificationState['severity'] = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};

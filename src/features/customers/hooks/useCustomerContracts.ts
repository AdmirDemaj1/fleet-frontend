import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { customerApi } from '../api/customerApi';
import { ContractSummary } from '../types/customer.types';
import { 
  Order, 
  OrderBy, 
  NotificationState, 
  DialogStates, 
  MenuState 
} from '../types/customerContracts.types';
import { filterContracts, sortContracts } from '../utils/contractUtils';
import { DEFAULT_ROWS_PER_PAGE } from '../constants/contractConstants';

// Hook for managing contracts data
export const useContracts = (customerId?: string) => {
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const effectiveCustomerId = customerId || urlCustomerId;
  
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    if (!effectiveCustomerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await customerApi.getContracts(effectiveCustomerId);
      setContracts(data);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contracts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [effectiveCustomerId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    customerId: effectiveCustomerId
  };
};

// Hook for managing table state (pagination, sorting, filtering)
export const useContractsTable = (contracts: ContractSummary[], filters: any) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('startDate');

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return filterContracts(contracts, filters);
  }, [contracts, filters]);

  // Sort contracts
  const sortedContracts = useMemo(() => {
    return sortContracts(filteredContracts, orderBy, order);
  }, [filteredContracts, order, orderBy]);

  // Paginate contracts
  const paginatedContracts = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedContracts.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedContracts, page, rowsPerPage]);

  const handleRequestSort = useCallback((property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  return {
    page,
    rowsPerPage,
    order,
    orderBy,
    filteredContracts,
    sortedContracts,
    paginatedContracts,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
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

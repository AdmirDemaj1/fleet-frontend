import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { customerApi } from '../api/customerApi';
import { 
  Invoice,
  InvoiceOrder, 
  InvoiceOrderBy, 
  InvoiceNotificationState, 
  InvoiceDialogStates, 
  InvoiceMenuState 
} from '../types/customerInvoices.types';
import { filterInvoices, sortInvoices } from '../utils/invoiceUtils';
import { INVOICE_DEFAULT_ROWS_PER_PAGE } from '../constants/invoiceConstants';

// Hook for managing invoices data
export const useInvoices = (customerId?: string) => {
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const effectiveCustomerId = customerId || urlCustomerId;
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!effectiveCustomerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await customerApi.getInvoices(effectiveCustomerId);
      
      // Handle different response structures
      let invoicesArray: Invoice[];
      if (Array.isArray(data)) {
        invoicesArray = data;
      } else if (data && typeof data === 'object' && 'invoices' in data && Array.isArray((data as any).invoices)) {
        invoicesArray = (data as any).invoices;
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        invoicesArray = (data as any).data;
      } else {
        console.warn('Unexpected invoices response structure:', data);
        invoicesArray = [];
      }
      
      setInvoices(invoicesArray);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load invoices';
      setError(errorMessage);
      setInvoices([]); // Ensure invoices is always an array
    } finally {
      setLoading(false);
    }
  }, [effectiveCustomerId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    customerId: effectiveCustomerId
  };
};

// Hook for managing invoice table state (pagination, sorting, filtering)
export const useInvoicesTable = (invoices: Invoice[], filters: any) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(INVOICE_DEFAULT_ROWS_PER_PAGE);
  const [order, setOrder] = useState<InvoiceOrder>('desc');
  const [orderBy, setOrderBy] = useState<InvoiceOrderBy>('dueDate');

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return filterInvoices(invoices, filters);
  }, [invoices, filters]);

  // Sort invoices
  const sortedInvoices = useMemo(() => {
    return sortInvoices(filteredInvoices, orderBy, order);
  }, [filteredInvoices, order, orderBy]);

  // Paginate invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedInvoices.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedInvoices, page, rowsPerPage]);

  const handleRequestSort = useCallback((property: InvoiceOrderBy) => {
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
    filteredInvoices,
    sortedInvoices,
    paginatedInvoices,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  };
};

// Hook for managing invoice dialog states
export const useInvoiceDialogStates = () => {
  const [dialogStates, setDialogStates] = useState<InvoiceDialogStates>({
    showNewInvoiceDialog: false,
    deleteDialogOpen: false,
    invoiceToDelete: null
  });

  const openNewInvoiceDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, showNewInvoiceDialog: true }));
  }, []);

  const closeNewInvoiceDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, showNewInvoiceDialog: false }));
  }, []);

  const openDeleteDialog = useCallback((invoiceId: string) => {
    setDialogStates(prev => ({ 
      ...prev, 
      deleteDialogOpen: true, 
      invoiceToDelete: invoiceId 
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogStates(prev => ({ 
      ...prev, 
      deleteDialogOpen: false, 
      invoiceToDelete: null 
    }));
  }, []);

  return {
    ...dialogStates,
    openNewInvoiceDialog,
    closeNewInvoiceDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
};

// Hook for managing invoice menu state
export const useInvoiceMenuState = () => {
  const [menuState, setMenuState] = useState<InvoiceMenuState>({
    anchorEl: null,
    selectedInvoice: null
  });

  const openMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>, invoice: Invoice) => {
    setMenuState({
      anchorEl: event.currentTarget,
      selectedInvoice: invoice
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState({
      anchorEl: null,
      selectedInvoice: null
    });
  }, []);

  return {
    ...menuState,
    openMenu,
    closeMenu
  };
};

// Hook for managing invoice notifications
export const useInvoiceNotification = () => {
  const [notification, setNotification] = useState<InvoiceNotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message: string, severity: InvoiceNotificationState['severity'] = 'info') => {
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

// Hook for managing invoice operations
export const useInvoiceOperations = () => {
  const handleDeleteInvoice = useCallback(async (invoiceId: string) => {
    try {
      // TODO: Implement actual delete logic
      console.log('Deleting invoice:', invoiceId);
      // Add delete API call here
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }, []);

  return {
    handleDeleteInvoice
  };
};

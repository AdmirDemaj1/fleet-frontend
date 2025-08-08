import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { customerApi } from '../api/customerApi';
import { CustomerLog, LogOrder, LogOrderBy, LogNotificationState, LogMenuState } from '../types/customerLogs.types';
import { filterLogs, sortLogs } from '../utils/logUtils';
import { DEFAULT_LOGS_ROWS_PER_PAGE } from '../constants/logConstants';

// Hook for managing logs data
export const useCustomerLogs = (customerId?: string, options?: { limit?: number; offset?: number }) => {
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const effectiveCustomerId = customerId || urlCustomerId;
  
  const [logs, setLogs] = useState<CustomerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!effectiveCustomerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await customerApi.getLogs(effectiveCustomerId, options);
      // Handle different response structures
      let logsArray: CustomerLog[];
      if (Array.isArray(data)) {
        logsArray = data;
      } else if (data && typeof data === 'object' && 'logs' in data && Array.isArray((data as any).logs)) {
        logsArray = (data as any).logs;
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        logsArray = (data as any).data;
      } else {
        console.warn('Unexpected logs response structure:', data);
        logsArray = [];
      }
      setLogs(logsArray);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logs';
      setError(errorMessage);
      setLogs([]); // Ensure logs is always an array
    } finally {
      setLoading(false);
    }
  }, [effectiveCustomerId, options]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    customerId: effectiveCustomerId
  };
};

// Hook for managing table state (pagination, sorting, filtering)
export const useLogsTable = (logs: CustomerLog[], filters: any) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_LOGS_ROWS_PER_PAGE);
  const [order, setOrder] = useState<LogOrder>('desc');
  const [orderBy, setOrderBy] = useState<LogOrderBy>('timestamp');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return filterLogs(logs, filters);
  }, [logs, filters]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    return sortLogs(filteredLogs, order, orderBy);
  }, [filteredLogs, order, orderBy]);

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedLogs, page, rowsPerPage]);

  const handleRequestSort = useCallback((property: LogOrderBy) => {
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
    filteredLogs,
    sortedLogs,
    paginatedLogs,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  };
};

// Hook for managing menu state
export const useLogMenuState = () => {
  const [menuState, setMenuState] = useState<LogMenuState>({
    anchorEl: null,
    selectedLog: null
  });

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>, log: CustomerLog) => {
    setMenuState({
      anchorEl: event.currentTarget,
      selectedLog: log
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState({
      anchorEl: null,
      selectedLog: null
    });
  }, []);

  return {
    ...menuState,
    openMenu,
    closeMenu
  };
};

// Hook for managing notifications
export const useLogNotification = () => {
  const [notification, setNotification] = useState<LogNotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message: string, severity: LogNotificationState['severity'] = 'info') => {
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

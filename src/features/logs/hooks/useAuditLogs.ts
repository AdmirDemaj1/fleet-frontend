import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetAuditLogsQuery } from '../api/auditapi';
import { AuditLogResponseDto, FindAuditLogsDto } from '../types/audit.types';
import { AuditLogFilters } from '../types/auditLogFilters.types';

// Hook for managing audit logs data
export const useAuditLogs = (entityType?: string, entityId?: string) => {
  const [filters, setFilters] = useState<AuditLogFilters>({
    search: '',
    eventType: '',
    entityType: entityType || '',
    startDate: '',
    endDate: ''
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('actionTimestamp');

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: FindAuditLogsDto = {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      sortOrder: order,
      search: filters.search || undefined,
      eventTypes: filters.eventType ? [filters.eventType] : undefined,
      entityType: filters.entityType || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    };

    // Add specific filtering if provided
    if (entityId) params.entityId = entityId;
    
    return params;
  }, [filters, page, rowsPerPage, order, entityId]);

  // API query
  const { 
    data: logsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAuditLogsQuery(queryParams);

  const logs = logsResponse?.data || [];
  const totalCount = logsResponse?.total || 0;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  return {
    logs,
    totalCount,
    loading: isLoading,
    error,
    refetch,
    filters,
    setFilters,
    page,
    rowsPerPage,
    order,
    orderBy,
    setPage,
    setRowsPerPage,
    setOrder,
    setOrderBy
  };
};

// Hook for managing table state (pagination, sorting, filtering)
export const useAuditLogsTable = (logs: AuditLogResponseDto[], filters: AuditLogFilters) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('actionTimestamp');

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const searchMatch = !filters.search || 
        log.eventType.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.entityType.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.entityId.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.userId.toLowerCase().includes(filters.search.toLowerCase());

      const eventTypeMatch = !filters.eventType || log.eventType === filters.eventType;
      const entityTypeMatch = !filters.entityType || log.entityType === filters.entityType;
      
      const startDateMatch = !filters.startDate || 
        new Date(log.actionTimestamp) >= new Date(filters.startDate);
      const endDateMatch = !filters.endDate || 
        new Date(log.actionTimestamp) <= new Date(filters.endDate);

      return searchMatch && eventTypeMatch && entityTypeMatch && startDateMatch && endDateMatch;
    });
  }, [logs, filters]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let aValue = a[orderBy as keyof AuditLogResponseDto];
      let bValue = b[orderBy as keyof AuditLogResponseDto];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? -1 : 1;
      if (bValue == null) return order === 'asc' ? 1 : -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredLogs, order, orderBy]);

  // Paginate logs
  const paginatedLogs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedLogs, page, rowsPerPage]);

  const handleRequestSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

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
    handleRowsPerPageChange,
    setPage,
    setRowsPerPage
  };
};

// Hook for managing notification state
export const useAuditLogNotification = () => {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
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

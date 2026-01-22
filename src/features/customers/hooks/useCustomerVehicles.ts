import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetVehiclesByClientIdQuery } from '../../vehicles/api/vehicleRtkApi';
import { Vehicle } from '../../vehicles/types/vehicleType';
import {
  VehicleOrder,
  VehicleOrderBy,
  VehicleNotificationState,
  VehicleDialogStates,
  VehicleMenuState
} from '../types/customerVehicles.types';
import { filterVehicles, sortVehicles } from '../utils/vehicleUtils';
import { DEFAULT_VEHICLES_ROWS_PER_PAGE } from '../constants/vehicleConstants';

// Hook for managing vehicles data - now using RTK Query
export const useCustomerVehicles = (customerId?: string) => {
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const effectiveCustomerId = customerId || urlCustomerId;

  // Use RTK Query for data fetching with automatic caching
  const { data: vehicles = [], isLoading, error, refetch } = useGetVehiclesByClientIdQuery(
    effectiveCustomerId!,
    { skip: !effectiveCustomerId }
  );

  return {
    vehicles,
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Failed to load vehicles' : null,
    fetchVehicles: refetch,
    customerId: effectiveCustomerId
  };
};

// Hook for managing table state (pagination, sorting, filtering)
export const useVehiclesTable = (vehicles: Vehicle[], filters: any) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_VEHICLES_ROWS_PER_PAGE);
  const [order, setOrder] = useState<VehicleOrder>('desc');
  const [orderBy, setOrderBy] = useState<VehicleOrderBy>('createdAt');

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return filterVehicles(vehicles, filters);
  }, [vehicles, filters]);

  // Sort vehicles
  const sortedVehicles = useMemo(() => {
    return sortVehicles(filteredVehicles, order, orderBy);
  }, [filteredVehicles, order, orderBy]);

  // Paginate vehicles
  const paginatedVehicles = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedVehicles.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedVehicles, page, rowsPerPage]);

  const handleRequestSort = useCallback((property: VehicleOrderBy) => {
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
    filteredVehicles,
    sortedVehicles,
    paginatedVehicles,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  };
};

// Hook for managing dialog states
export const useVehicleDialogStates = () => {
  const [dialogStates, setDialogStates] = useState<VehicleDialogStates>({
    deleteDialogOpen: false,
    vehicleToDelete: null
  });

  const openDeleteDialog = useCallback((vehicleId: string) => {
    setDialogStates(prev => ({ 
      ...prev, 
      deleteDialogOpen: true, 
      vehicleToDelete: vehicleId 
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogStates(prev => ({ 
      ...prev, 
      deleteDialogOpen: false, 
      vehicleToDelete: null 
    }));
  }, []);

  return {
    ...dialogStates,
    openDeleteDialog,
    closeDeleteDialog
  };
};

// Hook for managing menu state
export const useVehicleMenuState = () => {
  const [menuState, setMenuState] = useState<VehicleMenuState>({
    anchorEl: null,
    selectedVehicle: null
  });

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>, vehicle: Vehicle) => {
    setMenuState({
      anchorEl: event.currentTarget,
      selectedVehicle: vehicle
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState({
      anchorEl: null,
      selectedVehicle: null
    });
  }, []);

  return {
    ...menuState,
    openMenu,
    closeMenu
  };
};

// Hook for managing notifications
export const useVehicleNotification = () => {
  const [notification, setNotification] = useState<VehicleNotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message: string, severity: VehicleNotificationState['severity'] = 'info') => {
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

// Hook for vehicle operations
export const useVehicleOperations = () => {
  const handleDeleteVehicle = useCallback(async (vehicleId: string) => {
    // This would typically call the API to delete the vehicle
    // For now, we'll just log it since vehicles are assigned via contracts
    console.log(`Vehicle ${vehicleId} removal would be handled through contract management`);
    throw new Error('Vehicle removal should be handled through contract management');
  }, []);

  return {
    handleDeleteVehicle
  };
};

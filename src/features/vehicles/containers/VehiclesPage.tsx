import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Typography, 
  Box, 
  Alert, 
  Button, 
  Paper
} from '@mui/material';
import { 
  Add, 
  Refresh, 
  Download,
  DirectionsCar,
  Build,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { VehicleList } from '../components/VehicleList/VehicleList';
import { VehicleFilters } from '../components/VehicleList/VehicleListFilters';
import { useVehicles } from '../hooks/useVehicles';
import { setFilters } from '../slices/vehicleSlice';
import { vehicleApi } from '../api/vehicleApi';
import { VehicleQueryParams, VehicleStatistics, VehicleStatus } from '../types/vehicleType';
import { useDebounce } from '../../../shared/hooks/useDebounce';

// Export as named export
export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vehicles, loading, error, totalCount } = useVehicles();
  
  const [stats, setStats] = useState<VehicleStatistics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [legalOwnerFilter, setLegalOwnerFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [isLiquidAssetFilter, setIsLiquidAssetFilter] = useState<boolean | undefined>(undefined);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Single effect to handle all filter changes
  React.useEffect(() => {
    // Reset page when filters change (except for page/rowsPerPage changes)
    const filtersChanged = (
      debouncedSearchTerm !== '' ||
      statusFilter !== '' ||
      legalOwnerFilter !== '' ||
      makeFilter !== '' ||
      modelFilter !== '' ||
      yearFilter !== undefined ||
      isLiquidAssetFilter !== undefined
    );

    const targetPage = filtersChanged && page > 0 ? 0 : page;
    
    if (filtersChanged && page > 0) {
      setPage(0);
    }

    const timeoutId = setTimeout(() => {
      dispatch(setFilters({
        search: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        legalOwner: legalOwnerFilter || undefined,
        make: makeFilter || undefined,
        model: modelFilter || undefined,
        year: yearFilter,
        isLiquidAsset: isLiquidAssetFilter,
        limit: rowsPerPage,
        offset: targetPage * rowsPerPage,
      }));
    }, 50); // Small delay to batch updates

    return () => clearTimeout(timeoutId);
  }, [debouncedSearchTerm, statusFilter, legalOwnerFilter, makeFilter, modelFilter, yearFilter, isLiquidAssetFilter, page, rowsPerPage, dispatch]);

  const fetchStats = async () => {
    try {
      const statistics = await vehicleApi.getVehicleStatistics();
      setStats(statistics);
    } catch (err) {
      console.error('Error fetching vehicle statistics:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchStats();
      // The vehicles will be refetched automatically through the hook
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleFilterChange = (newFilters: VehicleQueryParams) => {
    // Update individual filter states
    setSearchTerm(newFilters.search || '');
    setStatusFilter(newFilters.status || '');
    setLegalOwnerFilter(newFilters.legalOwner || '');
    setMakeFilter(newFilters.make || '');
    setModelFilter(newFilters.model || '');
    setYearFilter(newFilters.year);
    setIsLiquidAssetFilter(newFilters.isLiquidAsset);
  };

  const handleAddVehicle = () => {
    navigate('/vehicles/new');
  };

  const handleEditVehicle = (id: string) => {
    navigate(`/vehicles/${id}/edit`);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.deleteVehicle(id);
        // The vehicles will be refetched automatically through the hook
        
        // If we deleted the last item on the current page and we're not on the first page,
        // go back to the previous page
        if (vehicles.length === 1 && page > 0) {
          setPage(page - 1);
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export vehicles');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your fleet vehicles and track their status
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={!vehicles || vehicles.length === 0}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddVehicle}
          >
            Add Vehicle
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2, 
          mb: 3 
        }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <DirectionsCar sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.totalVehicles}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Vehicles
            </Typography>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.availableVehicles}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Available
            </Typography>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats.leasedVehicles}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Leased
            </Typography>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Build sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.maintenanceVehicles}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Maintenance
            </Typography>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {formatCurrency(stats.totalValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Value
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Filters */}
      <VehicleFilters 
        filters={{
          search: searchTerm,
          status: statusFilter || undefined,
          legalOwner: legalOwnerFilter || undefined,
          make: makeFilter || undefined,
          model: modelFilter || undefined,
          year: yearFilter,
          isLiquidAsset: isLiquidAssetFilter
        }}
        onFilterChange={handleFilterChange}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Vehicle List */}
      <VehicleList
        vehicles={vehicles}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
      />
    </Box>
  );
};

// Keep the default export as well
export default VehiclesPage;
import React, { useState, useEffect } from 'react';
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
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle, VehicleQueryParams, VehicleStatistics } from '../types/vehicleType';

// Export as named export
export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VehicleStatistics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Filters
  const [filters, setFilters] = useState<VehicleQueryParams>({});

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params: VehicleQueryParams = {
        ...filters,
        offset: page * rowsPerPage,
        limit: rowsPerPage
      };
      
      const response = await vehicleApi.getVehicles(params);
      setVehicles(response.vehicles || []);
      setTotalCount(response.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statistics = await vehicleApi.getVehicleStatistics();
      setStats(statistics);
    } catch (err) {
      console.error('Error fetching vehicle statistics:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchVehicles(), fetchStats()]);
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
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
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
        fetchVehicles(); // Refresh the list
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle. Please try again later.');
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
        filters={filters} 
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
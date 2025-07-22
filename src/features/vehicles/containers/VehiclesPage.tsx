import React, { useState, useEffect } from 'react';
import { Typography, Box, Alert, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { VehicleList } from '../components/VehicleList/VehicleList';
import { VehicleFilters } from '../components/VehicleList/VehicleListFilters';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle, VehicleQueryParams } from '../types/vehicleType';

// Export as named export
export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
        page: page,
        limit: rowsPerPage
      };
      
      const { vehicles, total } = await vehicleApi.getVehicles(params);
      setVehicles(vehicles);
      setTotalCount(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, rowsPerPage, filters]);

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

  return (
    <Box>
      {/* Header matching CustomersPage style */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Vehicles</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </Button>
      </Box>

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
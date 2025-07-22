import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, Divider, Alert, Button } from '@mui/material';
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1" gutterBottom>
              Vehicle Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddVehicle}
            >
              Add Vehicle
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <VehicleFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </Paper>
        </Grid>

        {/* Error Display */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Vehicle List */}
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </Container>
  );
};

// Keep the default export as well
export default VehiclesPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
  TableSortLabel,
  alpha,
  useTheme,
  Alert,
  Snackbar,
  Button
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as VehicleIcon
} from '@mui/icons-material';

// Local imports
import { CustomerAccountVehiclesProps } from '../../types/customerVehicles.types';
import { 
  useCustomerVehicles, 
  useVehiclesTable, 
  useVehicleDialogStates, 
  useVehicleMenuState, 
  useVehicleNotification,
  useVehicleOperations
} from '../../hooks/useCustomerVehicles';
import { Vehicle } from '../../../vehicles/types/vehicleType';
import { formatCurrency } from '../../utils/vehicleUtils';
import { renderVehicleStatusCell } from '../../utils/vehicleRenderUtils';
import { VEHICLES_ROWS_PER_PAGE_OPTIONS } from '../../constants/vehicleConstants';
import { VehicleFilters } from './VehicleFilters';
import type { VehicleFilters as VehicleFiltersType } from '../../types/vehicleFilters.types';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';

// Export types for external use
export type { CustomerAccountVehiclesProps };

const CustomerAccountVehicles: React.FC<CustomerAccountVehiclesProps> = ({ customerId: propCustomerId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Custom hooks
  const { vehicles, loading, error, fetchVehicles } = useCustomerVehicles(propCustomerId);
  const { notification, showNotification, hideNotification } = useVehicleNotification();
  const { handleDeleteVehicle } = useVehicleOperations();
  const { 
    deleteDialogOpen, 
    vehicleToDelete,
    openDeleteDialog,
    closeDeleteDialog 
  } = useVehicleDialogStates();
  const { anchorEl, selectedVehicle, openMenu, closeMenu } = useVehicleMenuState();
  
  // Filters state
  const [filters, setFilters] = useState<VehicleFiltersType>({
    search: '',
    status: '',
    make: '',
    model: '',
    year: ''
  });
  
  // Table state and logic
  const {
    page,
    rowsPerPage,
    order,
    orderBy,
    filteredVehicles,
    paginatedVehicles,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  } = useVehiclesTable(vehicles, filters);

  // Event handlers
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      make: '',
      model: '',
      year: ''
    });
  };

  const handleDelete = (vehicleId: string) => {
    openDeleteDialog(vehicleId);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await handleDeleteVehicle(vehicleToDelete);
        showNotification('Vehicle removed successfully', 'success');
        await fetchVehicles();
      } catch (error) {
        showNotification('Vehicles are managed through contracts', 'warning');
      }
      closeDeleteDialog();
    }
  };

  // Loading state - following customer list pattern
  if (loading && vehicles.length === 0) {
    return (
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={200} height={32} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', mb: 1.5 }}>
            {['15%', '20%', '15%', '15%', '15%', '15%', '5%'].map((width, i) => (
              <Skeleton key={i} variant="text" width={width} height={24} sx={{ mr: 2 }} />
            ))}
          </Box>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ 
              py: 2, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none'
            }}>
              {['15%', '20%', '15%', '15%', '15%', '15%', '5%'].map((width, i) => (
                <Skeleton key={i} variant="text" width={width} height={24} sx={{ mr: 2 }} />
              ))}
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Skeleton variant="rectangular" width={300} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error && !vehicles.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchVehicles}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Customer Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View vehicles assigned to this customer through contracts
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <VehicleFilters
          filters={filters}
          onFilterChange={setFilters}
          vehiclesCount={filteredVehicles.length}
        />
      </Box>

      {/* Table */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'licensePlate'}
                    direction={orderBy === 'licensePlate' ? order : 'asc'}
                    onClick={() => handleRequestSort('licensePlate')}
                  >
                    License Plate
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'make'}
                    direction={orderBy === 'make' ? order : 'asc'}
                    onClick={() => handleRequestSort('make')}
                  >
                    Vehicle
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'year'}
                    direction={orderBy === 'year' ? order : 'asc'}
                    onClick={() => handleRequestSort('year')}
                  >
                    Year
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'currentValuation'}
                    direction={orderBy === 'currentValuation' ? order : 'asc'}
                    onClick={() => handleRequestSort('currentValuation')}
                  >
                    Valuation
                  </TableSortLabel>
                </TableCell>
                <TableCell>VIN</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVehicles.map((vehicle: Vehicle) => (
                <TableRow 
                  key={vehicle.id} 
                  hover
                  sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {vehicle.licensePlate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {vehicle.make} {vehicle.model}
                      </Typography>
                      {vehicle.color && (
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.color}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.year}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderVehicleStatusCell(vehicle.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(vehicle.currentValuation)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {vehicle.vin}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(event) => openMenu(event, vehicle)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedVehicles.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 3
                    }}>
                      <Box 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: '50%',
                          p: 2,
                          mb: 2
                        }}
                      >
                        <VehicleIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom>No vehicles found</Typography>
                      <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                        {filteredVehicles.length !== vehicles.length 
                          ? 'No vehicles match your current filter criteria.'
                          : 'This customer doesn\'t have any vehicles assigned yet. Vehicles are assigned through contracts.'
                        }
                      </Typography>
                      {filteredVehicles.length !== vehicles.length && (
                        <Button 
                          variant="outlined" 
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredVehicles.length || 0}
          page={Math.min(page, Math.max(0, Math.ceil((filteredVehicles.length || 0) / rowsPerPage) - 1))}
          onPageChange={(_, newPage) => {
            handlePageChange(newPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10);
            handleRowsPerPageChange(newRowsPerPage);
          }}
          rowsPerPageOptions={VEHICLES_ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => {
            if (loading) {
              return 'Loading...';
            }
            return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
          }}
          disabled={loading}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-select': {
              pr: 1
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: theme.palette.text.secondary
            },
            '&.Mui-disabled': {
              opacity: 0.6
            }
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          if (selectedVehicle) {
            navigate(`/vehicles/${selectedVehicle.id}`);
          }
          closeMenu();
        }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedVehicle) {
            navigate(`/vehicles/${selectedVehicle.id}/edit`);
          }
          closeMenu();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Vehicle
        </MenuItem>

        <Divider />
        
        <MenuItem 
          onClick={() => {
            if (selectedVehicle) {
              handleDelete(selectedVehicle.id);
            }
            closeMenu();
          }}
          sx={{ color: 'warning.main' }}
          disabled
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove Assignment
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        title="Remove Vehicle Assignment"
        message={`Vehicle assignments are managed through contracts. Please modify the relevant contract to change vehicle assignments.`}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerAccountVehicles;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  Paper,
  useTheme,
  alpha,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import { Vehicle, VehicleStatus } from '../../types/vehicleType';
import { VehicleListSkeleton } from './VehicleListSkeleton';
import { VehicleListEmpty } from './VehicleListEmpty';

interface VehicleListProps {
  vehicles: Vehicle[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vehicle: Vehicle) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVehicle(null);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/vehicles/${id}`);
    handleMenuClose();
  };

  const handleEditVehicle = (id: string) => {
    if (onEdit) {
      onEdit(id);
    }
    handleMenuClose();
  };

  const handleDeleteVehicle = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    handleMenuClose();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusChip = (status: VehicleStatus) => {
    const statusConfig: Record<VehicleStatus, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', label: string }> = {
      [VehicleStatus.AVAILABLE]: { color: 'success', label: 'Available' },
      [VehicleStatus.LEASED]: { color: 'primary', label: 'Leased' },
      [VehicleStatus.MAINTENANCE]: { color: 'warning', label: 'Maintenance' },
      [VehicleStatus.SOLD]: { color: 'secondary', label: 'Sold' },
      [VehicleStatus.LIQUID_ASSET]: { color: 'info', label: 'Liquid Asset' },
    };

    const config = statusConfig[status] || { color: 'default', label: status };

    return (
      <Chip
        size="small"
        color={config.color}
        label={config.label}
        sx={{ fontSize: '0.75rem', height: 20 }}
      />
    );
  };

  return (
    <>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
      <TableContainer>
        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1, px: 2 } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>License Plate</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Vehicle Info</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Financial</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Insurance</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Ownership</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Operational</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: 40 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <VehicleListSkeleton rowsPerPage={rowsPerPage} />
            ) : vehicles && vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: alpha(theme.palette.grey[500], 0.01)
                    }
                  }}
                >
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {vehicle.licensePlate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        VIN: {vehicle.vin || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {vehicle.color ? `${vehicle.color} • ` : ''}{vehicle.mileage?.toLocaleString() || 0} mi
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {getStatusChip(vehicle.status)}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Updated: {formatDate(vehicle.updatedAt)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {formatCurrency(vehicle.currentValuation)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Purchase: {formatCurrency(vehicle.purchasePrice)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {vehicle.insuranceProvider || 'Uninsured'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {vehicle.insuranceExpiryDate ? 
                          `Exp: ${formatDate(vehicle.insuranceExpiryDate)}` : 
                          'No expiry'
                        }
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {vehicle.legalOwner || 'Company Owned'}
                      </Typography>
                      {vehicle.isLiquidAsset && (
                        <Chip 
                          size="small" 
                          variant="outlined" 
                          color="info"
                          label="Liquid" 
                          sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        Fuel: {vehicle.fuelType || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Condition: {vehicle.condition || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    <IconButton
                      onClick={(event) => handleMenuOpen(event, vehicle)}
                      size="small"
                      sx={{ 
                        p: 0.5,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <VehicleListEmpty colSpan={7} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalCount || 0}
        page={Math.min(page, Math.max(0, Math.ceil((totalCount || 0) / rowsPerPage) - 1))}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        onPageChange={(_, newPage) => {
          console.log('Page change requested:', newPage, 'Current total:', totalCount);
          onPageChange(newPage);
        }}
        onRowsPerPageChange={(e) => {
          const newRowsPerPage = parseInt(e.target.value, 10);
          console.log('Rows per page change:', newRowsPerPage);
          onRowsPerPageChange(newRowsPerPage);
        }}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => {
          const safeCount = count === -1 ? totalCount : count;
          if (loading) {
            return 'Loading...';
          }
          return `${from}–${to} of ${safeCount !== -1 ? safeCount : `more than ${to}`}`;
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

    {/* Actions Menu */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          minWidth: 140
        }
      }}
    >
      <MenuItem 
        onClick={() => handleViewDetails(selectedVehicle?.id || '')}
        sx={{ 
          gap: 1.5,
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          }
        }}
      >
        <Visibility fontSize="small" color="primary" />
        View Details
      </MenuItem>
      {onEdit && (
        <MenuItem 
          onClick={() => handleEditVehicle(selectedVehicle?.id || '')}
          sx={{ 
            gap: 1.5,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: alpha(theme.palette.warning.main, 0.08)
            }
          }}
        >
          <Edit fontSize="small" color="warning" />
          Edit Vehicle
        </MenuItem>
      )}
      {onDelete && selectedVehicle?.status !== VehicleStatus.LEASED && (
        <MenuItem 
          onClick={() => handleDeleteVehicle(selectedVehicle?.id || '')}
          sx={{ 
            gap: 1.5,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08)
            }
          }}
        >
          <Delete fontSize="small" color="error" />
          Delete Vehicle
        </MenuItem>
      )}
    </Menu>
    </>
  );
};
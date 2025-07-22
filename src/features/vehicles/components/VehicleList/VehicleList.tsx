import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  IconButton,
  Typography,
  Stack,
  Paper,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  DirectionsCar,
  Assignment,
  BuildCircle,
  AttachMoney
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

  const getStatusChip = (status: VehicleStatus) => {
    const statusConfig: Record<VehicleStatus, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', label: string }> = {
      [VehicleStatus.AVAILABLE]: { color: 'success', label: 'Available' },
      [VehicleStatus.LEASED]: { color: 'primary', label: 'Leased' },
      [VehicleStatus.MAINTENANCE]: { color: 'warning', label: 'Maintenance' },
      [VehicleStatus.COLLATERAL]: { color: 'info', label: 'Collateral' },
      [VehicleStatus.SOLD]: { color: 'secondary', label: 'Sold' },
      [VehicleStatus.OTHER]: { color: 'default', label: 'Other' },
    };

    const config = statusConfig[status] || { color: 'default', label: status };

    return (
      <Chip
        size="small"
        color={config.color}
        label={config.label}
      />
    );
  };

  const handleViewDetails = (id: string) => {
    navigate(`/vehicles/${id}`);
  };

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>License Plate</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valuation ($)</TableCell>
              <TableCell>Ownership</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <VehicleListSkeleton rowsPerPage={rowsPerPage} />
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {vehicle.licensePlate}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      VIN: {vehicle.vin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DirectionsCar color="action" fontSize="small" />
                      <Box>
                        <Typography variant="body2">{vehicle.make} {vehicle.model}</Typography>
                        {vehicle.color && (
                          <Typography variant="caption" color="textSecondary">
                            {vehicle.color}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{getStatusChip(vehicle.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ${vehicle.currentValuation?.toLocaleString() || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.legalOwner || 'Company Owned'}
                    </Typography>
                    {vehicle.isLiquidAsset && (
                      <Chip 
                        size="small" 
                        variant="outlined" 
                        color="info"
                        label="Liquid Asset" 
                        icon={<AttachMoney fontSize="small" />}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleViewDetails(vehicle.id)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {onEdit && (
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="info" 
                            onClick={() => onEdit(vehicle.id)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onDelete && vehicle.status !== VehicleStatus.LEASED && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => onDelete(vehicle.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
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
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};
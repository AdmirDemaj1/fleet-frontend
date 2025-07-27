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
  Tooltip,
  IconButton,
  Typography,
  Stack,
  Paper,
  useTheme,
  alpha,
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
  const theme = useTheme();

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
      />
    );
  };

  const handleViewDetails = (id: string) => {
    navigate(`/vehicles/${id}`);
  };

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
  );
};
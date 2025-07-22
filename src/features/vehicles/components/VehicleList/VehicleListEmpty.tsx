import React from 'react';
import { TableRow, TableCell, Box, Typography } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';

interface VehicleListEmptyProps {
  colSpan: number;
}

export const VehicleListEmpty: React.FC<VehicleListEmptyProps> = ({ colSpan }) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <DirectionsCar sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            No vehicles found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or add a new vehicle
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};
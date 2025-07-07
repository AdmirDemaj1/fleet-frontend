import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { VehicleStatus } from '../../types/vehicleType';

interface VehicleListFiltersProps {
  statusFilter: VehicleStatus | '';
  onStatusFilterChange: (event: any) => void;
}

export const VehicleListFilters: React.FC<VehicleListFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <FormControl>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={statusFilter}
          label="Status"
          onChange={onStatusFilterChange}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {Object.values(VehicleStatus).map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};